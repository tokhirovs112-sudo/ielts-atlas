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

console.log(failures ? `Worker tests: ${failures} failed, ${passed} passed.` : `Worker tests passed (${passed} checks): form delivery, spam protection, error messages, audio ranges.`);
process.exit(failures ? 1 : 0);
