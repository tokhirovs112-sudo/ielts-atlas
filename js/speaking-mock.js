// Full IELTS Speaking mock tests: Part 1 → Part 2 (1 min prep, 2 min talk) → Part 3.
// Questions come from the Speaking question bank on pages/speaking.html (window.EnglisitySpeakingBank),
// so every mock uses questions students have actually reported.
(() => {
"use strict";

// Each mock: three Part 1 topics, one cue card, and Part 3 questions that follow on from the cue card.
const MOCKS = [
  { p1: ["Work and studies", "Mornings", "Headphones"], p2: "Describe a time when you got up early.",
    p3: ["Why do people get up early?", "If everyone went to bed early, would everyone get up early?", "What are the benefits of arriving on time?", "Why do some people dislike following a routine?", "What kinds of plans do people often make?"] },
  { p1: ["Hometown", "Parks", "Social media"], p2: "Describe a crowded place you have visited.",
    p3: ["What kinds of places are usually crowded in Uzbek cities?", "Do crowded cities need some quiet places?", "What are the benefits of travelling when there are fewer people?", "Are big cities more interesting than small towns?", "Why do some people prefer living in big cities?"] },
  { p1: ["Home and accommodation", "Music", "Colours"], p2: "Describe a noisy place you have been to.",
    p3: ["What places are noisy in your country?", "What do people usually do when they encounter noisy behaviour?", "What effects can noise have on people, for example on their sleep?", "Do creative workers need a quiet environment to work for long periods?", "Do you think a certain amount of stress is good for people?"] },
  { p1: ["Work and studies", "Shopping", "Watches"], p2: "Describe a person you know who has a successful business.",
    p3: ["Are there any new businesses opening where you live?", "What might cause a business to fail?", "In which fields do companies succeed more easily?", "What are the advantages of working with family members?", "Do you think family businesses are more successful than other businesses?"] },
  { p1: ["Hometown", "Teachers", "Websites"], p2: "Describe a person who is very good at learning languages.",
    p3: ["Why do children learn languages faster than adults?", "What are the best ways for adults to learn a new language?", "Can people learn a language well using websites?", "In what situations do people need to speak a foreign language?", "Is it good that many people now use the internet to learn skills?"] },
  { p1: ["Work and studies", "Food", "Fruits and vegetables"], p2: "Describe a type of food eaten on special occasions.",
    p3: ["Do people usually cook special-occasion food at home or eat out?", "How are eating habits today different from those in the past?", "How does food reflect a country's culture?", "In your country, is food important at parties? Why?", "Do you think traditional celebrations are still important nowadays?"] },
  { p1: ["Home and accommodation", "Sleep", "Free time and leisure"], p2: "Describe a time when you saved money to buy something special.",
    p3: ["Why is it not easy to save money?", "Which is more important, money or happiness?", "Should schools teach students how to manage money from a young age?", "Should parents teach children to be generous with money?", "Why do some people like shopping at small shops?"] },
  { p1: ["Hometown", "Advertisements", "Clothes"], p2: "Describe an advertisement that featured a famous person.",
    p3: ["Why do companies use famous people in advertisements?", "Do famous people make advertisements more effective?", "Do people trust advertisements featuring celebrities?", "What makes an advertisement memorable?", "How have advertisements changed over the years?"] },
  { p1: ["Work and studies", "Secondary school", "Science"], p2: "Describe a person you know who likes learning history.",
    p3: ["Why do some people find it difficult to learn history?", "Do people know more about ancient history or modern history?", "Why should historical buildings be protected?", "Which historical buildings are worth preserving?", "Would you travel to a foreign country because of its history?"] },
  { p1: ["Hometown", "Daily routine", "Plants"], p2: "Describe someone you know who wants to work in the medical field.",
    p3: ["Why do some people want to be doctors?", "Why are children attracted to biology?", "Is the healthcare system in your country good?", "What should people do to stay healthy and fit today?", "Does the government have a role in building healthy communities?"] },
  { p1: ["Work and studies", "Travelling", "Trying new things"], p2: "Describe an ambition or a dream you have.",
    p3: ["What do most young people in your country dream of?", "Is ambition important for young people?", "Is it good or bad to have ambitious people in a team?", "What qualities do people need to succeed in difficult tasks?", "Why do many young people refuse to take advice from adults?"] },
  { p1: ["Home and accommodation", "Jokes and comedy", "Outer space and stars"], p2: "Describe a live competition that you watched.",
    p3: ["Why do people enjoy watching live competitions?", "Do people prefer watching competitions live or on television?", "What types of competitions are popular in your country?", "Do you think competition is important for children?", "What are the advantages and disadvantages of competition?"] },
  { p1: ["Work and studies", "Tidiness", "Remembering names"], p2: "Describe a person you know who is well organised.",
    p3: ["Should parents teach their children to be well organised?", "What can people do to become more organised?", "Do managers need to be well organised?", "Do people like it when plans change at the last minute?", "Do people often face changes at work?"] },
  { p1: ["Hometown", "Singing", "Paper and letters"], p2: "Describe a time when you sent someone a message and they took a long time to reply.",
    p3: ["Why do people sometimes not reply to messages quickly?", "How has the way people communicate changed?", "What happens if people do not listen carefully when others are talking?", "Do older people use social media in the same way as young people?", "Why do some older people find it difficult to use social media?"] },
  { p1: ["Work and studies", "Feeling bored", "Rubbish and recycling"], p2: "Describe an important decision you made with the help of someone.",
    p3: ["Do you think people make better decisions alone or with the help of others?", "At what age do most children begin to make their own decisions?", "Do you think parents should make important decisions for their children?", "Is it better to make decisions quickly or take a long time to think?", "How has technology changed the way people make decisions?"] },
  { p1: ["Home and accommodation", "Shoes", "New opportunities"], p2: "Describe a sportsperson who is good at their sport.",
    p3: ["What qualities does a successful sportsperson need?", "How do sportspeople influence young people?", "Do you think athletes are paid too much money?", "Should governments spend more money supporting professional sports?", "Should students have physical education and do sports at school?"] }
];
const P1_PER_TOPIC = 4;
const PREP_SECONDS = 60, TALK_SECONDS = 120;
const VOICE_KEY = "englisity-mock-voice", DONE_KEY = "englisity-speaking-mocks-done";

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const $ = id => document.getElementById(id);
let bank = null, root = null, mocks = [];

function build() {
  bank = window.EnglisitySpeakingBank;
  const find = (part, name) => bank.sets[part].filter(t => t.topic === name).flatMap(t => t.questions);
  const all3 = new Set(bank.sets[3].flatMap(t => t.questions));
  const all2 = new Set(bank.sets[2].flatMap(t => t.questions));
  mocks = MOCKS.map((m, i) => ({
    n: i + 1,
    part1: m.p1.map(topic => ({ topic, questions: [...new Set(find(1, topic))].slice(0, P1_PER_TOPIC) })).filter(t => t.questions.length),
    cue: all2.has(m.p2) ? m.p2 : null,
    prompts: bank.cuePrompts(m.p2),
    part3: m.p3.filter(q => all3.has(q)),
    reported: bank.reported(m.p2)
  })).filter(m => m.cue && m.part1.length >= 2 && m.part3.length >= 3);
}

// ---------- Voice (the "examiner" reads each question) ----------
const canSpeak = "speechSynthesis" in window && typeof SpeechSynthesisUtterance === "function";
let voiceOn = canSpeak && (() => { try { return localStorage.getItem(VOICE_KEY) !== "off"; } catch (_) { return true; } })();
function pickVoice() {
  const voices = speechSynthesis.getVoices();
  return voices.find(v => /en-GB/i.test(v.lang) && /female|libby|sonia|serena|kate|google uk english female/i.test(v.name))
    || voices.find(v => /en-GB/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang)) || null;
}
function say(text) {
  if (!canSpeak || !voiceOn) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(); if (v) u.voice = v;
    u.lang = v?.lang || "en-GB"; u.rate = 0.95;
    speechSynthesis.speak(u);
  } catch (_) {}
}
function hush() { try { if (canSpeak) speechSynthesis.cancel(); } catch (_) {} }

// ---------- Recording the whole test ----------
let stream = null, recorder = null, chunks = [], recordingUrl = null;
async function startRecording() {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return "unsupported";
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = [];
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    recorder.start(1000);
    return "on";
  } catch (_) { return "denied"; }
}
function stopRecording() {
  return new Promise(resolve => {
    if (!recorder || recorder.state === "inactive") { release(); resolve(null); return; }
    recorder.onstop = () => {
      release();
      if (!chunks.length) { resolve(null); return; }
      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
      recordingUrl = URL.createObjectURL(blob);
      resolve({ url: recordingUrl, type: blob.type });
    };
    recorder.stop();
  });
}
function release() { stream?.getTracks().forEach(t => t.stop()); stream = null; }

// ---------- Screens ----------
function doneSet() { try { return new Set(JSON.parse(localStorage.getItem(DONE_KEY) || "[]")); } catch (_) { return new Set(); } }
function markDone(n) { const s = doneSet(); s.add(n); try { localStorage.setItem(DONE_KEY, JSON.stringify([...s])); } catch (_) {} }

function renderList() {
  stopAll();
  const done = doneSet();
  root.innerHTML = '<a class="back-button" href="#parts">← All speaking parts</a>' +
    '<div class="mock-head"><h2>Full speaking mock tests</h2><p>Practise the whole test in order, like the real exam: Part 1 interview, a Part 2 cue card with one minute to prepare and two minutes to talk, then a Part 3 discussion on the same theme. Each mock takes about 11–14 minutes and uses questions students have recently reported.</p></div>' +
    '<div class="mock-grid">' + mocks.map(m => '<a class="mock-card" href="#mock/' + m.n + '">' +
      '<span class="mock-num">Mock ' + m.n + (done.has(m.n) ? ' <em>✓ done</em>' : '') + '</span>' +
      '<strong>' + esc(m.cue.replace(/^Describe /, "").replace(/\.$/, "").replace(/^./, c => c.toUpperCase())) + '</strong>' +
      '<span>Part 1: ' + m.part1.map(t => esc(t.topic)).join(" · ") + '</span>' +
      (m.reported ? '<span class="mock-date">Cue card last reported: ' + esc(m.reported) + '</span>' : '') +
      '<span class="card-link">Start mock →</span></a>').join("") + '</div>';
}

let mock = null, steps = [], stepIndex = 0, tick = null, partStart = {}, partTime = {}, recState = "off";
function buildSteps(m) {
  const s = [{ kind: "intro", part: 1 }];
  m.part1.forEach((t, ti) => t.questions.forEach((q, qi) => s.push({ kind: "q", part: 1, q, topic: t.topic, lead: qi === 0 ? (ti === 0 ? "Let's talk about " : "Now let's move on to ") + t.topic.toLowerCase() + "." : "" })));
  s.push({ kind: "prep", part: 2 }, { kind: "talk", part: 2 });
  m.part3.forEach((q, i) => s.push({ kind: "q", part: 3, q, lead: i === 0 ? "Thank you. Now I'd like to ask you some more general questions related to this topic." : "" }));
  s.push({ kind: "end", part: 3 });
  return s;
}

function renderStart(n) {
  stopAll();
  mock = mocks.find(m => m.n === n);
  if (!mock) { renderList(); return; }
  const count1 = mock.part1.reduce((a, t) => a + t.questions.length, 0);
  root.innerHTML = '<a class="back-button" href="#mock">← All mock tests</a>' +
    '<div class="mock-start"><div class="mock-head"><div class="mock-kicker">IELTS SPEAKING · MOCK ' + mock.n + '</div><h2>Full speaking test</h2><p>About 11–14 minutes. Answer out loud, as you would to a real examiner.</p></div>' +
    '<ol class="mock-outline"><li><b>Part 1 · 4–5 min</b><span>' + count1 + ' questions on ' + mock.part1.map(t => esc(t.topic.toLowerCase())).join(", ") + '.</span></li>' +
    '<li><b>Part 2 · 3–4 min</b><span>One cue card. 1 minute to prepare and make notes, then speak for up to 2 minutes.</span></li>' +
    '<li><b>Part 3 · 4–5 min</b><span>' + mock.part3.length + ' discussion questions linked to the cue card.</span></li></ol>' +
    '<div class="mock-options">' +
    (canSpeak ? '<label class="mock-toggle"><input type="checkbox" id="mockVoice"' + (voiceOn ? " checked" : "") + '> <span><b>Examiner voice</b> reads every question aloud</span></label>' : '') +
    '<label class="mock-toggle"><input type="checkbox" id="mockRecord" checked> <span><b>Record my answers</b> so I can listen back at the end (stays on this device)</span></label></div>' +
    '<button class="mock-primary" type="button" id="mockBegin">Start the test</button>' +
    '<p class="mock-small">Tip: use headphones so the examiner voice is not recorded, and find a quiet place.</p></div>';
  $("mockVoice")?.addEventListener("change", e => { voiceOn = e.target.checked; try { localStorage.setItem(VOICE_KEY, voiceOn ? "on" : "off"); } catch (_) {} });
  $("mockBegin").addEventListener("click", async () => {
    $("mockBegin").disabled = true;
    recState = $("mockRecord").checked ? await startRecording() : "off";
    steps = buildSteps(mock); stepIndex = 0; partStart = {}; partTime = {};
    renderStep();
  });
}

function partBar(part) {
  return '<div class="mock-steps">' + [1, 2, 3].map(p => '<span class="' + (p === part ? "on" : p < part ? "done" : "") + '">Part ' + p + '</span>').join("") +
    '<span class="mock-rec ' + (recState === "on" ? "live" : "") + '">' + (recState === "on" ? "● Recording" : recState === "saved" ? "✓ Recording saved below" : recState === "denied" ? "Microphone blocked · not recording" : recState === "unsupported" ? "Recording not supported" : "Not recording") + '</span></div>';
}
function notePart(part) {
  if (!partStart[part]) partStart[part] = Date.now();
  [1, 2, 3].forEach(p => { if (p < part && partStart[p] && !partTime[p]) partTime[p] = Math.round((partStart[p + 1] || Date.now()) - partStart[p]) / 1000; });
}
const fmt = s => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(Math.max(0, s % 60)).padStart(2, "0");

function renderStep() {
  clearInterval(tick); hush();
  const st = steps[stepIndex];
  notePart(st.part);
  const total = steps.filter(x => x.kind === "q" && x.part === st.part).length;
  const num = steps.slice(0, stepIndex + 1).filter(x => x.kind === "q" && x.part === st.part).length;
  let html = partBar(st.part);
  if (st.kind === "intro") {
    html += '<div class="mock-stage"><div class="mock-label">Examiner</div><p class="mock-q">Good morning. My name is Sarah, and I will be your examiner today. Can you tell me your full name, please? And where are you from?</p><p class="mock-hint">Answer briefly, as you would in the real test, then continue.</p></div>' + nav("Continue to Part 1");
    root.innerHTML = html; bindNav(); say("Good morning. My name is Sarah, and I will be your examiner today. Can you tell me your full name, please? And where are you from?");
    return;
  }
  if (st.kind === "q") {
    html += '<div class="mock-stage"><div class="mock-label">Part ' + st.part + ' · Question ' + num + ' of ' + total + (st.topic ? ' · ' + esc(st.topic) : '') + '</div>' +
      (st.lead ? '<p class="mock-lead">' + esc(st.lead) + '</p>' : '') + '<p class="mock-q">' + esc(st.q) + '</p>' +
      '<p class="mock-hint">' + (st.part === 1 ? "Aim for 2–3 sentences: answer, give a reason, add a detail." : "Aim for 4–6 sentences: give your view, explain why, add an example, and consider another side.") + '</p>' +
      '<div class="mock-clock" id="mockClock">00:00</div></div>';
    const last = steps[stepIndex + 1]?.part !== st.part;
    html += nav(last ? (st.part === 1 ? "Finish Part 1 → Part 2" : "Finish the test") : "Next question");
    root.innerHTML = html; bindNav();
    say((st.lead ? st.lead + " " : "") + st.q);
    countUp();
    return;
  }
  if (st.kind === "prep" || st.kind === "talk") {
    const prep = st.kind === "prep";
    html += '<div class="mock-stage mock-cue"><div class="mock-label">Part 2 · ' + (prep ? "Prepare: 1 minute" : "Speak: up to 2 minutes") + '</div>' +
      '<div class="cue"><strong>' + esc(mock.cue) + '</strong>' + (mock.prompts.length ? '<span>You should say:</span><ul>' + mock.prompts.map(p => '<li>' + esc(p) + '</li>').join("") + '</ul>' : '') + '</div>' +
      (prep ? '<label class="mock-notes-label" for="mockNotes">Your notes</label><textarea id="mockNotes" placeholder="Write a few key words for each point…">' + esc(mock.notes || "") + '</textarea>'
            : (mock.notes ? '<div class="mock-notes-view"><b>Your notes</b><p>' + esc(mock.notes) + '</p></div>' : '')) +
      '<div class="mock-clock big" id="mockClock">' + fmt(prep ? PREP_SECONDS : TALK_SECONDS) + '</div></div>';
    html += '<div class="mock-nav"><button type="button" class="mock-primary" id="mockNext">' + (prep ? "I'm ready: start speaking" : "Finish my talk") + '</button></div>';
    root.innerHTML = html;
    $("mockNotes")?.addEventListener("input", e => { mock.notes = e.target.value; });
    $("mockNext").addEventListener("click", next);
    say(prep ? "Now I'm going to give you a topic, and I'd like you to talk about it for one to two minutes. You have one minute to think about what you are going to say. You can make some notes if you wish. " + mock.cue
             : "All right? Remember, you have one to two minutes for this. I'll tell you when the time is up. Can you start speaking now, please?");
    countDown(prep ? PREP_SECONDS : TALK_SECONDS, prep);
    return;
  }
  finish();
}
function nav(label) { return '<div class="mock-nav"><button type="button" class="mock-secondary" id="mockRepeat">🔊 Repeat question</button><button type="button" class="mock-primary" id="mockNext">' + esc(label) + ' →</button></div>'; }
function bindNav() {
  $("mockNext").addEventListener("click", next);
  const rep = $("mockRepeat");
  if (rep) { if (!canSpeak || !voiceOn) rep.hidden = true; rep.addEventListener("click", () => { const st = steps[stepIndex]; say(st.kind === "q" ? st.q : root.querySelector(".mock-q")?.textContent || ""); }); }
}
function countUp() { const t0 = Date.now(), el = $("mockClock"); tick = setInterval(() => { if (el.isConnected) el.textContent = fmt(Math.floor((Date.now() - t0) / 1000)); }, 500); }
function countDown(secs, prep) {
  const end = Date.now() + secs * 1000, el = $("mockClock");
  let warned = false;
  tick = setInterval(() => {
    const left = Math.ceil((end - Date.now()) / 1000);
    if (!el.isConnected) { clearInterval(tick); return; }
    el.textContent = fmt(Math.max(0, left));
    el.classList.toggle("low", left <= (prep ? 10 : 20));
    if (!prep && !warned && left <= 0) { warned = true; }
    if (left <= 0) { clearInterval(tick); if (prep) next(); else { say("Thank you."); setTimeout(() => { if (steps[stepIndex]?.kind === "talk") next(); }, 1200); } }
  }, 250);
}
function next() { clearInterval(tick); stepIndex = Math.min(stepIndex + 1, steps.length - 1); renderStep(); window.scrollTo({ top: root.getBoundingClientRect().top + scrollY - 80, behavior: "smooth" }); }

async function finish() {
  clearInterval(tick);
  partTime[3] = partStart[3] ? Math.round((Date.now() - partStart[3]) / 1000) : 0;
  [1, 2].forEach(p => { if (!partTime[p] && partStart[p]) partTime[p] = Math.round(((partStart[p + 1] || Date.now()) - partStart[p]) / 1000); });
  say("Thank you. That is the end of the speaking test.");
  markDone(mock.n);
  const rec = await stopRecording();
  if (recState === "on") recState = rec ? "saved" : "off";
  const total = (partTime[1] || 0) + (partTime[2] || 0) + (partTime[3] || 0);
  const all1 = mock.part1.flatMap(t => t.questions);
  root.innerHTML = partBar(4).replace(/class=""/g, 'class="done"') +
    '<div class="mock-stage mock-end"><div class="mock-kicker">MOCK ' + mock.n + ' COMPLETE</div><h2>Well done, that is the end of the test.</h2>' +
    '<div class="mock-times">' + [1, 2, 3].map(p => '<div><b>' + fmt(Math.round(partTime[p] || 0)) + '</b><span>Part ' + p + '</span></div>').join("") + '<div><b>' + fmt(Math.round(total)) + '</b><span>Total</span></div></div>' +
    (rec ? '<div class="mock-recording"><b>Listen to your answers</b><audio controls src="' + rec.url + '"></audio><a href="' + rec.url + '" download="englisity-speaking-mock-' + mock.n + '.' + (/mp4/.test(rec.type) ? "m4a" : "webm") + '">Download recording</a></div>' : '') +
    '<div class="mock-check"><b>Check yourself while you listen</b><ul>' +
    '<li><b>Fluency:</b> Did you keep talking without long pauses? Did you use linking words (because, for example, on the other hand)?</li>' +
    '<li><b>Part 2:</b> Did you speak for close to 2 minutes and cover every point on the card?</li>' +
    '<li><b>Vocabulary:</b> Did you use some less common words or phrases instead of repeating “good”, “bad”, “very”?</li>' +
    '<li><b>Grammar:</b> Did you use different tenses correctly, and some longer sentences (if, when, which, although)?</li>' +
    '<li><b>Pronunciation:</b> Were you clear? Would someone who does not know your language understand every word?</li></ul></div>' +
    '<details class="mock-review"><summary>See all the questions in this mock</summary><h4>Part 1</h4><ol>' + all1.map(q => '<li>' + esc(q) + '</li>').join("") + '</ol><h4>Part 2</h4><p>' + esc(mock.cue) + '</p><h4>Part 3</h4><ol>' + mock.part3.map(q => '<li>' + esc(q) + '</li>').join("") + '</ol></details>' +
    '<div class="mock-nav"><a class="mock-secondary" href="#mock/' + mock.n + '">Try this mock again</a>' +
    (mocks.find(m => m.n === mock.n + 1) ? '<a class="mock-primary" href="#mock/' + (mock.n + 1) + '">Next mock: Mock ' + (mock.n + 1) + ' →</a>' : '<a class="mock-primary" href="#mock">All mock tests</a>') + '</div></div>';
  window.EnglisityProgress?.recordActivity?.();
}

function stopAll() { clearInterval(tick); hush(); if (recorder && recorder.state !== "inactive") { try { recorder.stop(); } catch (_) {} } release(); }

window.EnglisitySpeakingMock = {
  init(container) {
    root = container; build();
  },
  show(n) { if (!bank) build(); n ? renderStart(n) : renderList(); },
  stop: stopAll,
  list: () => mocks
};
addEventListener("beforeunload", stopAll);
})();
