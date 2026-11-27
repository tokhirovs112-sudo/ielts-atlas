// Tests for worker/index.js: the report/share form endpoint and audio byte ranges.
// Run: node tests/test-worker.mjs   (no network needed; Telegram is faked)
import worker from "../worker/index.js";

let failures = 0, passed = 0;
function check(name, condition, detail = "") {
  if (condition) { passed++; return; }
  failures++;
  console.error("✗ " + name + (detail ? " — " + detail : ""));
}

const SITE = "https://englisity.example.dev";
const audioBytes = new Uint8Array(5000).map((_, i) => i % 251);
const env = {
  TELEGRAM_BOT_TOKEN: "test-token",
  TELEGRAM_CHAT_ID: "12345",
  ASSETS: {
    async fetch(request) {
      const path = new URL(request.url).pathname;
      if (path === "/assets/audio/mock.mp3") {
        return new Response(audioBytes, { headers: { "Content-Type": "audio/mpeg", "Content-Length": String(audioBytes.length) } });
      }
      return new Response("Not found", { status: 404 });
    }
  }
};

let telegramCalls = [];
let telegramReply = () => new Response(JSON.stringify({ ok: true }), { status: 200 });
globalThis.fetch = async (url, init) => { telegramCalls.push({ url: String(url), body: JSON.parse(init.body) }); return telegramReply(); };

const submit = (body, { origin = SITE, method = "POST", raw } = {}) => worker.fetch(new Request(SITE + "/api/submit", {
  method,
  headers: { "Content-Type": "application/json", ...(origin ? { Origin: origin } : {}) },
  body: method === "POST" ? (raw ?? JSON.stringify(body)) : undefined
}), env);
const good = { type: "report", page: "Speaking", kind: "Wrong answer", text: "The answer for question 3 looks wrong <script>", contact: "@student", elapsed: 9000 };

// --- Form endpoint ---
let res = await submit(null, { method: "GET" });
check("GET is refused", res.status === 405, "got " + res.status);

res = await submit(good, { origin: "https://evil.example.com" });
check("Other websites are refused", res.status === 403, "got " + res.status);

res = await submit(null, { raw: "{not json" });
check("Broken JSON is refused", res.status === 400, "got " + res.status);

telegramCalls = [];
res = await submit({ ...good, website: "http://spam" });
check("Honeypot spam gets a fake OK", res.status === 200 && telegramCalls.length === 0);

res = await submit({ ...good, elapsed: 500 });
check("Too-fast spam gets a fake OK", res.status === 200 && telegramCalls.length === 0);

res = await submit({ ...good, type: "other" });
check("Unknown form type is refused", res.status === 400);

res = await submit({ ...good, text: "short" });
check("Very short message is refused", res.status === 400 && (await res.json()).error === "too-short");

res = await worker.fetch(new Request(SITE + "/api/submit", { method: "POST", headers: { Origin: SITE }, body: JSON.stringify(good) }), { ...env, TELEGRAM_CHAT_ID: "" });
const missing = await res.json();
check("Missing secret is explained", res.status === 503 && /TELEGRAM_CHAT_ID/.test(missing.detail || ""), JSON.stringify(missing));

telegramCalls = [];
res = await submit(good);
check("Valid report is delivered", res.status === 200 && telegramCalls.length === 1, "status " + res.status);
const sent = telegramCalls[0]?.body || {};
check("Report goes to the right chat", sent.chat_id === "12345");
check("Bot token is used in the Telegram URL", /\/bottest-token\/sendMessage$/.test(telegramCalls[0]?.url || ""));
check("Student text is HTML-escaped", /&lt;script&gt;/.test(sent.text || "") && !/<script>/.test(sent.text || ""));
check("Report includes page and problem", /Speaking/.test(sent.text || "") && /Wrong answer/.test(sent.text || ""));

telegramCalls = [];
res = await submit({ type: "questions", testDate: "2026-11-16", location: "Tashkent", module: "Academic", section: "Speaking Part 2", text: "Describe a successful business owner.", elapsed: 12000 });
check("Shared questions are delivered", res.status === 200 && /New exam questions/.test(telegramCalls[0]?.body.text || ""));

telegramReply = () => new Response(JSON.stringify({ ok: false, description: "Bad Request: chat not found" }), { status: 400 });
res = await submit(good);
const failed = await res.json();
check("Telegram errors are passed on", res.status === 502 && /chat not found/.test(failed.detail || ""), JSON.stringify(failed));
telegramReply = () => new Response(JSON.stringify({ ok: true }), { status: 200 });

// --- Audio byte ranges (needed for seeking and for iPhone playback) ---
const audio = (range, method = "GET") => worker.fetch(new Request(SITE + "/assets/audio/mock.mp3", { method, headers: range ? { Range: range } : {} }), env);
const bytes = async r => new Uint8Array(await r.arrayBuffer());

res = await audio();
check("Whole audio file is served", res.status === 200 && res.headers.get("Accept-Ranges") === "bytes" && (await bytes(res)).length === 5000);

res = await audio("bytes=100-199");
let body = await bytes(res);
check("Byte range is served", res.status === 206 && res.headers.get("Content-Range") === "bytes 100-199/5000" && body.length === 100 && body[0] === audioBytes[100] && body[99] === audioBytes[199], res.status + " " + res.headers.get("Content-Range") + " len " + body.length);

res = await audio("bytes=4990-");
body = await bytes(res);
check("Open-ended range is served", res.status === 206 && body.length === 10 && body[9] === audioBytes[4999]);

res = await audio("bytes=-20");
body = await bytes(res);
check("Last-bytes range is served", res.status === 206 && body.length === 20 && body[0] === audioBytes[4980]);

res = await audio("bytes=9000-9100");
check("Impossible range gets 416", res.status === 416 && res.headers.get("Content-Range") === "bytes */5000");

res = await audio("bytes=0-0", "HEAD");
check("HEAD range request works", res.status === 206 && res.headers.get("Content-Length") === "1");

res = await worker.fetch(new Request(SITE + "/assets/audio/missing.mp3"), env);
check("Missing audio returns 404", res.status === 404);


// --- Usage statistics endpoints ---
const track = (body, extraEnv = {}, origin = SITE) => worker.fetch(new Request(SITE + "/api/track", { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(body) }), { ...env, ...extraEnv });
res = await track({ vid: "abcdefgh1234", sid: "sess12345678", events: [{ type: "view", section: "home", path: "/" }] });
check("Tracking without a database is ignored quietly", res.status === 204);
res = await track({ vid: "abcdefgh1234", events: [] }, {}, "https://evil.example.com");
check("Tracking from other websites is refused", res.status === 403);
res = await track({ vid: "NOT VALID!", events: [] }, { STATS: {} });
check("Bad visitor id is refused", res.status === 400);
const stats = (pw, extraEnv = {}) => worker.fetch(new Request(SITE + "/api/stats?days=7", { headers: pw ? { Authorization: "Bearer " + pw } : {} }), { ...env, ...extraEnv });
res = await stats("x");
check("Stats page explains a missing password secret", res.status === 503 && /STATS_PASSWORD/.test((await res.json()).detail || ""));
res = await stats("wrong", { STATS_PASSWORD: "right-password", STATS: {} });
check("Wrong stats password is refused", res.status === 401);

// --- AI writing check ---
function fakeD1() {
  const rows = new Map();
  return {
    rows,
    prepare(sql) {
      const st = { args: [], bind(...a) { st.args = a; return st; },
        async run() { return {}; },
        async first() {
          const [day, k, by] = st.args;
          if (/^INSERT INTO ai_usage/.test(sql)) { const n = (rows.get(day + "|" + k) || 0) + by; rows.set(day + "|" + k, n); return { n }; }
          if (/^SELECT n FROM ai_usage/.test(sql)) { const n = rows.get(day + "|" + k); return n === undefined ? null : { n }; }
          return null;
        } };
      return st;
    }
  };
}
const essay = ("Some people believe that children are committing more crimes because parents are too busy. I partly agree with this view. ").repeat(14);
let aiReply = JSON.stringify({ bands: { TR: 6, CC: 6, LR: 5, GRA: 6 }, summary: "A clear answer.", strengths: ["Clear position"], improvements: [{ criterion: "LR", advice: "Use more precise words." }], corrections: [{ original: "more crimes", better: "more crime", why: "uncountable" }] });
let aiCalls = [];
const AI = { async run(model, input) { aiCalls.push({ model, input }); return { choices: [{ message: { content: "Here you go:\n" + aiReply } }] }; } };
const check2 = (body, extraEnv = {}, origin = SITE) => worker.fetch(new Request(SITE + "/api/writing-check", { method: "POST", headers: { "Content-Type": "application/json", Origin: origin, "CF-Connecting-IP": "1.2.3.4" }, body: JSON.stringify(body) }), { ...env, AI, ...extraEnv });
const q2 = "In many parts of the world, children and teenagers are committing more crimes. Why is this? What can be done?";
const db = fakeD1();
res = await check2({ task: 2, question: q2, essay, vid: "abcdefgh1234" }, { STATS: db });
let wbody = await res.json();
check("Essay check returns bands and feedback", res.status === 200 && wbody.bands.TR === 6 && wbody.overall === 6 && wbody.corrections.length === 1, JSON.stringify(wbody));
check("Essay check uses the free Workers AI model without a key", wbody.provider === "workers-ai" && aiCalls[0].model === "@cf/openai/gpt-oss-120b");
check("Essay check tells how many checks are left today", wbody.left === 4, String(wbody.left));
check("Essay text goes to the AI as data", /Student's answer:\n<<<\n/.test(aiCalls[0].input.messages[1].content));
aiReply = JSON.stringify({ bands: { TR: 7, CC: 6, LR: 6, GRA: 6 } });
res = await check2({ task: 2, question: q2, essay, vid: "abcdefgh1234" }, { STATS: db });
wbody = await res.json();
check("Overall band rounds like IELTS (6.25 -> 6.5)", wbody.overall === 6.5, String(wbody.overall));
for (let i = 0; i < 3; i++) await check2({ task: 2, question: q2, essay, vid: "abcdefgh1234" }, { STATS: db });
res = await check2({ task: 2, question: q2, essay, vid: "abcdefgh1234" }, { STATS: db });
check("Sixth check from one device in a day is refused", res.status === 429 && (await res.json()).error === "limit");
res = await check2({ task: 2, question: q2, essay: "Too short essay here.", vid: "abcdefgh9999" }, { STATS: fakeD1() });
check("Very short answers are refused", res.status === 400 && (await res.json()).error === "too-short");
res = await check2({ task: 2, question: q2, essay }, { STATS: fakeD1() }, "https://evil.example.com");
check("Essay checks from other websites are refused", res.status === 403);
aiReply = "Sorry, I cannot do that.";
const db3 = fakeD1();
res = await check2({ task: 1, question: "The chart below shows the water levels in reservoirs.", data: "Darwin 45 / 25", essay, vid: "abcdefgh7777" }, { STATS: db3 });
check("An unreadable AI reply gives a clear error and does not use up a check", res.status === 502 && [...db3.rows.values()].every(n => n === 0));
aiReply = JSON.stringify({ bands: { TA: 5, CC: 5, LR: 5, GRA: 6 } });
aiCalls = [];
res = await check2({ task: 1, question: "The chart below shows the water levels in reservoirs.", data: "Darwin 45 / 25", essay, vid: "abcdefgh7777" }, { STATS: db3 });
wbody = await res.json();
check("Task 1 is marked on Task Achievement with the chart figures", res.status === 200 && wbody.bands.TA === 5 && /Darwin 45 \/ 25/.test(aiCalls[0].input.messages[1].content));
let claudeCalls = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => { claudeCalls.push({ url: String(url), headers: init.headers, body: JSON.parse(init.body) }); return new Response(JSON.stringify({ content: [{ type: "text", text: JSON.stringify({ bands: { TR: 7, CC: 7, LR: 7, GRA: 7 } }) }] })); };
res = await check2({ task: 2, question: q2, essay, vid: "abcdefgh5555" }, { STATS: fakeD1(), ANTHROPIC_API_KEY: "sk-test" });
wbody = await res.json();
check("With ANTHROPIC_API_KEY the check uses Claude Haiku 5.5", wbody.provider === "claude" && claudeCalls[0].url === "https://api.anthropic.com/v1/messages" && claudeCalls[0].body.model === "claude-haiku-5-5" && wbody.overall === 7);
globalThis.fetch = realFetch;

// --- AI speaking check ---
{
  const sdb = fakeD1();
  let calls = [];
  let spokenText = "Well I usually get up at seven and have breakfast with my family, then I go to university by bus because it is quite cheap and fast.";
  const SAI = { async run(model, input) {
    calls.push({ model, input });
    if (/whisper/.test(model)) return { text: spokenText };
    return { choices: [{ message: { content: JSON.stringify({ bands: { FC: 6, LR: 6, GRA: 5, P: 6 }, summary: "Good.", strengths: ["Clear"], improvements: [{ criterion: "GRA", advice: "Use past tenses." }], corrections: [] }) } }] };
  } };
  const audio = new Uint8Array(5000).fill(7);
  const speak = (meta, n = 1, origin = SITE, db = sdb) => {
    const fd = new FormData();
    fd.append("meta", JSON.stringify(meta));
    for (let i = 0; i < n; i++) fd.append("audio" + i, new Blob([audio], { type: "audio/webm" }), "a.webm");
    return worker.fetch(new Request(SITE + "/api/speaking-check", { method: "POST", headers: { Origin: origin, "CF-Connecting-IP": "5.6.7.8" }, body: fd }), { ...env, AI: SAI, STATS: db });
  };
  let r = await speak({ mode: "answer", vid: "speakvid0001", parts: [{ part: 1, questions: ["What do you do in the morning?"], seconds: 20 }] });
  let b = await r.json();
  check("Speaking check transcribes with Whisper and marks four criteria", r.status === 200 && calls[0].model === "@cf/openai/whisper-large-v3-turbo" && typeof calls[0].input.audio === "string" && b.bands.P === 6 && b.overall === 6 && b.transcripts[0].text === spokenText, JSON.stringify(b));
  check("Speaking check gives words per minute", b.transcripts[0].wpm === Math.round(b.transcripts[0].words / (20 / 60)));
  check("Speaking prompt includes the question and speaking time", /What do you do in the morning\?/.test(calls[1].input.messages[1].content) && /20 seconds/.test(calls[1].input.messages[1].content));
  calls = [];
  r = await speak({ mode: "mock", vid: "speakvid0001", parts: [1, 2, 3].map(p => ({ part: p, questions: ["Q" + p + " question here"], seconds: 200 })) }, 3);
  b = await r.json();
  check("A full mock sends three parts and costs 4 checks", r.status === 200 && calls.filter(c => /whisper/.test(c.model)).length === 3 && b.cost === 4 && b.left === 3, JSON.stringify(b).slice(0, 200));
  r = await speak({ mode: "mock", vid: "speakvid0001", parts: [1, 2, 3].map(p => ({ part: p, questions: ["Q"], seconds: 200 })) }, 3);
  check("A second mock goes over the daily speaking allowance", r.status === 429 && (await r.json()).error === "limit");
  spokenText = "um";
  const db2 = fakeD1();
  r = await speak({ mode: "answer", vid: "speakvid0002", parts: [{ part: 1, questions: ["Q"], seconds: 10 }] }, 1, SITE, db2);
  check("Silence or a few words is not marked and not counted", r.status === 422 && [...db2.rows.values()].every(n => n === 0));
  r = await speak({ mode: "answer", parts: [{ part: 1, questions: ["Q"], seconds: 10 }] }, 1, "https://evil.example.com");
  check("Speaking checks from other websites are refused", r.status === 403);
  r = await speak({ mode: "answer", parts: [{ part: 1, questions: ["Q"] }] }, 0);
  check("A speaking check without audio is refused", r.status === 400);
}

console.log(failures ? `Worker tests: ${failures} failed, ${passed} passed.` : `Worker tests passed (${passed} checks): form delivery, spam protection, error messages, audio ranges, AI writing and speaking checks.`);
process.exit(failures ? 1 : 0);
