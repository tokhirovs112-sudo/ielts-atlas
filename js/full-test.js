// Full IELTS Academic Reading test engine: three passages, 40 questions, 60 minutes.
// Test content comes from window.ENGLISITY_FULL_TEST (see js/full-test-01-data.js).
(() => {
"use strict";
const T = window.ENGLISITY_FULL_TEST;
const root = document.getElementById("fullTest");
if (!T || !root) return;

const TOTAL = 40, SECONDS = (T.minutes || 60) * 60;
const SAVE_KEY = "englisity-reading-" + T.id + "-answers-v1";
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const wordify = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])).replace(/(&#?\w+;)|([\p{L}]+(?:['’\-][\p{L}]+)*)/gu, (m, ent, w) => ent ? ent : '<span class="vocab-word" data-word="' + w + '">' + w + '</span>');
const allQuestions = [];
T.parts.forEach((part, pi) => part.groups.forEach(g => g.questions.forEach(q => { q.part = pi; allQuestions.push(q); })));
const byNumber = n => allQuestions.find(q => q.n === n);
const partOf = n => byNumber(n)?.part ?? 0;
let current = 0, submitted = false, timer = null, startTime = 0, exam = false;

// ---------- Rendering ----------
document.getElementById("passageText").innerHTML = T.parts.map((part, pi) =>
  '<section class="ft-passage" data-part="' + pi + '"' + (pi ? " hidden" : "") + '>' +
  '<div class="ft-passage-label">READING ' + esc(part.label.toUpperCase()) + ' · ' + esc(part.range.toUpperCase()) + '</div>' +
  '<h2>' + esc(part.title) + '</h2>' + (part.subtitle ? '<p class="passage-subtitle">' + esc(part.subtitle) + '</p>' : "") +
  part.paras.map(([id, txt]) => '<p id="para' + pi + id + '" data-label="' + id + '">' + (part.hideLabels ? "" : '<span class="para-number">' + id + '</span>') + wordify(txt) + '</p>').join("") +
  '</section>').join("");

const kindOf = g => g.kind ? g.kind : g.pick ? "MULTIPLE CHOICE · CHOOSE TWO" : g.summary ? "SUMMARY COMPLETION" : g.box ? "MATCHING" : g.questions[0].type === "mcq" ? "MULTIPLE CHOICE" : "MATCHING INFORMATION";
function renderControl(q) {
  if (q.type === "text") return '<input class="answer-input" id="a' + q.n + '" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + q.n + '" aria-label="Answer to question ' + q.n + '">';
  if (q.type === "mcq") return '<div class="answer-options" role="radiogroup" aria-label="Question ' + q.n + '">' + q.opts.map(([l, t]) =>
    '<label><input type="radio" name="a' + q.n + '" value="' + l + '"><b>' + l + '</b>' + (t ? '<span>' + esc(t) + '</span>' : "") + '</label>').join("") + '</div>';
  return '<select class="answer-select" id="a' + q.n + '" aria-label="Choose answer for question ' + q.n + '"><option value="">Choose…</option>' +
    (q.choices || q.letters.split("").map(v => [v, v])).map(([v, l]) => '<option value="' + v + '">' + esc(l) + '</option>').join("") + '</select>';
}
function renderQuestion(q) {
  const control = renderControl(q);
  const prompt = q.type === "text" ? esc(q.p).replace("______", control) : esc(q.p);
  return '<section class="question-card" id="q' + q.n + '" data-q="' + q.n + '"><div class="question-number">Question ' + q.n + '</div><p>' + prompt + '</p>' +
    (q.type !== "text" ? control : "") + '<div class="question-feedback" id="f' + q.n + '" hidden></div></section>';
}
function renderPick(g) {
  const nums = g.questions.map(q => q.n);
  return '<section class="question-card pick-card" id="q' + nums[0] + '" data-q="' + nums.join(" ") + '"><div class="question-number">Questions ' + nums.join(" and ") + '</div><p><strong>' + esc(g.pickQ) + '</strong></p><div class="pick-options">' +
    g.pickOpts.map(([l, t]) => '<label class="pick-option"><input type="checkbox" class="pick-input" data-group="' + g.pick + '" data-q="' + nums.join(" ") + '" value="' + l + '"><span><b>' + l + '</b> ' + esc(t) + '</span></label>').join("") +
    '</div><p class="pick-status" id="pickStatus' + g.pick + '">0 of 2 selected</p>' + nums.map(n => '<div class="question-feedback" id="f' + n + '" hidden></div>').join("") + '<span id="q' + nums[1] + '" class="pick-anchor"></span></section>';
}
function renderGroup(g, pi) {
  const box = g.box ? '<div class="ft-box"><div class="ft-box-title">' + (g.boxTitle || (g.box.length > 6 ? "List of effects" : "List of endings")) + '</div>' + g.box.map(([l, t]) => '<div><b>' + l + '</b> ' + esc(t) + '</div>').join("") + '</div>' : "";
  const letters = !g.box && !g.pick && g.questions[0].type === "select" ? '<div class="notice">Choose a paragraph letter, ' + g.questions[0].letters[0] + '–' + g.questions[0].letters.slice(-1) + ', from Reading ' + esc(T.parts[pi].label) + '.</div>' : "";
  return '<section class="question-section"><div class="section-kicker">' + kindOf(g) + '</div><h3>' + esc(g.title) + '</h3><p class="test-instructions">' + esc(g.instructions) + '</p>' +
    box + letters + (g.summary ? '<div class="notice"><b>' + esc(g.summary) + '</b></div>' : "") +
    (g.pick ? renderPick(g) : g.questions.map(renderQuestion).join("")) + '</section>';
}
document.getElementById("questionList").innerHTML = T.parts.map((part, pi) =>
  '<section class="ft-questions" data-part="' + pi + '"' + (pi ? " hidden" : "") + '><h2>' + esc(part.label) + ' · ' + esc(part.range) + '</h2>' +
  '<p class="test-instructions">You should spend about 20 minutes on ' + esc(part.range) + ', which are based on Reading ' + esc(part.label) + '.</p>' +
  part.groups.map(g => renderGroup(g, pi)).join("") +
  (pi < 2 ? '<button type="button" class="ft-next" data-go="' + (pi + 1) + '">Next: ' + esc(T.parts[pi + 1].label) + ' →</button>' : "") + '</section>').join("");

// Part tabs and the 1–40 question navigator.
document.getElementById("partTabs").innerHTML = T.parts.map((part, pi) =>
  '<button type="button" class="part-tab' + (pi ? "" : " active") + '" data-go="' + pi + '" role="tab" aria-selected="' + (pi ? "false" : "true") + '"><strong>' + esc(part.label.replace("Passage", "Part")) + '</strong><span>' + esc(part.range.replace("Questions ", "Q")) + '</span><em id="partCount' + pi + '">0/' + T.parts[pi].groups.reduce((a, g) => a + g.questions.length, 0) + '</em></button>').join("");
document.getElementById("questionNav").innerHTML = T.parts.map((part, pi) =>
  '<div class="qnav-part" data-part="' + pi + '"><span class="qnav-label">' + esc(part.label.replace("Passage", "Part")) + '</span>' +
  allQuestions.filter(q => q.part === pi).map(q => '<button type="button" class="qnav-btn" data-n="' + q.n + '" aria-label="Go to question ' + q.n + '">' + q.n + '</button>').join("") + '</div>').join("");

// ---------- Navigation ----------
function showPart(pi, focusN) {
  current = pi;
  root.querySelectorAll(".ft-passage, .ft-questions").forEach(el => { el.hidden = +el.dataset.part !== pi; });
  root.querySelectorAll(".part-tab").forEach(b => { const on = +b.dataset.go === pi; b.classList.toggle("active", on); b.setAttribute("aria-selected", on ? "true" : "false"); });
  root.querySelectorAll(".qnav-part").forEach(el => el.classList.toggle("active", +el.dataset.part === pi));
  window.EnglisityEvidence?.clear?.();
  const passagePanel = document.querySelector(".passage-panel"), questionPanel = document.getElementById("questionPanel");
  if (focusN) {
    const card = document.getElementById("q" + focusN);
    card?.scrollIntoView({ behavior: "smooth", block: "center" });
    card?.classList.add("flash"); setTimeout(() => card?.classList.remove("flash"), 1200);
  } else {
    passagePanel.scrollTop = 0; questionPanel.scrollTop = 0;
    if (innerWidth <= 900) root.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
root.addEventListener("click", e => {
  const go = e.target.closest("[data-go]");
  if (go) { showPart(+go.dataset.go); return; }
  const nav = e.target.closest(".qnav-btn");
  if (nav) { const n = +nav.dataset.n; showPart(partOf(n), n); }
});

// ---------- Answers ----------
const clean = s => String(s || "").trim().toLowerCase().replace(/[.!?;,:'"“”‘’]/g, "").replace(/\s+/g, " ");
const pickSelected = g => [...root.querySelectorAll('.pick-input[data-group="' + g + '"]:checked')].map(i => i.value);
function valueOf(q) {
  if (q.type === "pick") return pickSelected(q.group).join(", ");
  if (q.type === "mcq") return root.querySelector('input[name="a' + q.n + '"]:checked')?.value || "";
  return document.getElementById("a" + q.n)?.value || "";
}
function answered(q) {
  if (q.type !== "pick") return !!valueOf(q).trim();
  const sel = pickSelected(q.group), nums = allQuestions.filter(x => x.group === q.group).map(x => x.n);
  return sel.length > nums.indexOf(q.n);
}
function isCorrect(q) {
  if (q.type === "pick") return pickSelected(q.group).includes(q.a);
  const v = valueOf(q);
  if (q.type === "text") return [q.a].concat(q.alts || []).some(a => clean(v) === clean(a));
  return v === q.a;
}
function updateProgress() {
  let total = 0;
  T.parts.forEach((part, pi) => {
    const qs = allQuestions.filter(q => q.part === pi), done = qs.filter(answered).length;
    total += done;
    document.getElementById("partCount" + pi).textContent = done + "/" + qs.length;
  });
  if (!submitted) root.querySelectorAll(".qnav-btn").forEach(b => b.classList.toggle("done", answered(byNumber(+b.dataset.n))));
  document.getElementById("answeredCount").textContent = total + " of " + TOTAL + " answered";
}
function save() {
  if (submitted) return;
  const data = {};
  allQuestions.forEach(q => { if (q.type !== "pick") data[q.n] = valueOf(q); });
  [...new Set(allQuestions.filter(q => q.group).map(q => q.group))].forEach(g => { data["pick" + g] = pickSelected(g); });
  data.part = current;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (_) {}
}
function restore() {
  let data = null;
  try { data = JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); } catch (_) {}
  if (!data) return false;
  let any = false;
  allQuestions.forEach(q => {
    const v = data[q.n];
    if (!v || q.type === "pick") return;
    any = true;
    if (q.type === "mcq") { const r = root.querySelector('input[name="a' + q.n + '"][value="' + v + '"]'); if (r) r.checked = true; }
    else { const el = document.getElementById("a" + q.n); if (el) el.value = v; }
  });
  Object.keys(data).filter(k => k.startsWith("pick")).forEach(k => (data[k] || []).forEach(v => {
    const box = root.querySelector('.pick-input[data-group="' + k.slice(4) + '"][value="' + v + '"]'); if (box) { box.checked = true; any = true; }
  }));
  syncPicks();
  if (typeof data.part === "number") showPart(data.part);
  return any;
}
function syncPicks() {
  [...new Set(allQuestions.filter(q => q.group).map(q => q.group))].forEach(g => {
    const boxes = [...root.querySelectorAll('.pick-input[data-group="' + g + '"]')], n = boxes.filter(b => b.checked).length;
    boxes.forEach(b => { if (!submitted) b.disabled = n >= 2 && !b.checked; });
    document.getElementById("pickStatus" + g).textContent = n + " of 2 selected" + (n === 2 ? " — untick one to change" : "");
  });
}
root.addEventListener("change", e => { if (e.target.closest(".pick-input")) syncPicks(); updateProgress(); save(); });
root.addEventListener("input", () => { updateProgress(); save(); });

// ---------- Scoring ----------
const BANDS = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [0, 0]];
const bandFor = s => { const b = BANDS.find(([min]) => s >= min)[1]; return b ? b.toFixed(1) : "Below 2.5"; };
function submit(auto) {
  if (submitted) return;
  const unanswered = allQuestions.filter(q => !answered(q)).length;
  if (!auto && unanswered && !submitConfirmed) {
    const bar = document.getElementById("submitWarning");
    bar.hidden = false;
    bar.querySelector("span").textContent = unanswered + (unanswered === 1 ? " question is" : " questions are") + " still blank. In the real exam a blank answer scores 0, so guess if you can.";
    bar.scrollIntoView({ behavior: "smooth", block: "center" });
    submitConfirmed = true;
    return;
  }
  submitted = true;
  document.getElementById("submitWarning").hidden = true;
  let score = 0;
  const perPart = [0, 0, 0], wrong = [];
  allQuestions.forEach(q => {
    const ok = isCorrect(q), val = valueOf(q);
    if (ok) { score++; perPart[q.part]++; } else wrong.push(q.n);
    const f = document.getElementById("f" + q.n);
    f.hidden = false;
    f.className = "question-feedback " + (ok ? "correct" : "incorrect");
    const yours = q.type === "pick" ? "" : '<p class="ft-yours">Your answer: <b>' + (val.trim() ? esc(val) : "—") + '</b></p>';
    f.innerHTML = '<strong>Question ' + q.n + ' · ' + (ok ? "Correct" : val.trim() ? "Not quite" : "Not answered") + '</strong>' + (ok ? "" : yours) +
      '<p>Correct answer: <b>' + esc(q.a) + '</b>' + (q.alts ? " (also accepted: " + esc(q.alts.join(", ")) + ")" : "") + (q.type === "pick" ? " (in either order)" : "") + '</p>' +
      '<p>' + esc(q.why) + '</p><p><b>Evidence in the passage:</b></p><blockquote>' + esc(q.e) + '</blockquote>' +
      '<a class="view-in-test" href="#para' + q.part + q.para + '" data-para="' + q.part + q.para + '">Show in passage</a>';
    root.querySelector('.qnav-btn[data-n="' + q.n + '"]')?.classList.add(ok ? "right" : "wrong");
  });
  root.querySelectorAll("input,select").forEach(x => x.disabled = true);
  document.getElementById("checkAnswers").disabled = true;
  if (timer) clearInterval(timer);
  const used = Math.floor((Date.now() - startTime) / 1000);
  const result = document.getElementById("testResult");
  result.hidden = false;
  result.innerHTML = '<strong>Your score: ' + score + ' / ' + TOTAL + '</strong>' +
    '<div class="ft-band">Estimated band <b>' + bandFor(score) + '</b><small>Academic Reading conversion, as a guide only</small></div>' +
    '<div class="ft-breakdown">' + T.parts.map((part, pi) => { const n = allQuestions.filter(q => q.part === pi).length; return '<button type="button" data-go="' + pi + '"><span>' + esc(part.label) + '</span><b>' + perPart[pi] + ' / ' + n + '</b><i style="width:' + Math.round(perPart[pi] / n * 100) + '%"></i></button>'; }).join("") + '</div>' +
    '<span>Time used: ' + Math.floor(used / 60) + ' min ' + (used % 60) + ' s' + (used > SECONDS ? " (over the 60-minute limit)" : "") + '</span>' +
    (wrong.length ? '<span>Review these questions: ' + wrong.map(n => '<button type="button" class="ft-review" data-n="' + n + '">' + n + '</button>').join("") + '</span>' : '<span>Perfect score — excellent work!</span>');
  try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
  // Part of a full mock test: save the section result and offer the next section.
  if (T.mock && window.EnglisityMock) {
    window.EnglisityMock.save(T.mock, "reading", { score, total: TOTAL, band: window.EnglisityMock.readingBand(score) });
    result.insertAdjacentHTML("beforeend", '<a class="ft-next-section" href="' + esc(T.next) + '">Next section: ' + esc(T.nextLabel) + ' →</a>');
    window.EnglisityMock.autoNext(T.next, T.nextLabel);
  }
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  document.body.classList.add("ft-submitted");
  window.EnglisityProgress?.recordActivity?.();
  result.scrollIntoView({ behavior: "smooth", block: "center" });
}
let submitConfirmed = false;
document.getElementById("checkAnswers").addEventListener("click", () => submit(false));
document.getElementById("submitAnyway").addEventListener("click", () => { submitConfirmed = true; submit(false); });
document.getElementById("keepWorking").addEventListener("click", () => {
  document.getElementById("submitWarning").hidden = true; submitConfirmed = false;
  const first = allQuestions.find(q => !answered(q));
  if (first) showPart(first.part, first.n);
});
root.addEventListener("click", e => { const r = e.target.closest(".ft-review"); if (r) { const n = +r.dataset.n; showPart(partOf(n), n); } });

document.getElementById("resetTest").addEventListener("click", () => {
  document.getElementById("mockAutoNext")?.querySelector(".stay")?.click();  // trying again stops the countdown to the next section
  submitted = false; submitConfirmed = false;
  root.querySelectorAll("input,select").forEach(x => { x.disabled = false; if (x.type === "radio" || x.type === "checkbox") x.checked = false; else x.value = ""; });
  root.querySelectorAll(".question-feedback").forEach(x => { x.hidden = true; x.innerHTML = ""; });
  root.querySelectorAll(".qnav-btn").forEach(b => b.classList.remove("right", "wrong", "done"));
  syncPicks();
  try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
  document.getElementById("checkAnswers").disabled = false;
  document.getElementById("testResult").hidden = true;
  document.getElementById("submitWarning").hidden = true;
  document.body.classList.remove("practice-mode", "exam-mode", "ft-submitted");
  document.getElementById("modeGate").hidden = false;
  document.getElementById("modeLabel").textContent = "CHOOSE A MODE TO BEGIN";
  if (timer) clearInterval(timer); timer = null;
  document.getElementById("timerDisplay").textContent = String(SECONDS / 60) + ":00";
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  showPart(0); updateProgress();
});

// ---------- Timer and modes ----------
function runTimer() {
  if (timer) clearInterval(timer);
  startTime = Date.now();
  const display = document.getElementById("timerDisplay"), note = document.getElementById("timerNote"), wrap = document.getElementById("readingTimer");
  const tick = () => {
    const left = SECONDS - Math.floor((Date.now() - startTime) / 1000), abs = Math.abs(left);
    display.textContent = (left < 0 ? "-" : "") + String(Math.floor(abs / 60)).padStart(2, "0") + ":" + String(abs % 60).padStart(2, "0");
    note.textContent = left < 0 ? "overtime" : "remaining";
    wrap.classList.toggle("warning", left >= 0 && left <= 600);
    wrap.classList.toggle("overtime", left < 0);
    if (exam && left <= 0 && !submitted) submit(true);
  };
  tick(); timer = setInterval(tick, 250);
}
function start(isExam) {
  exam = isExam;
  document.getElementById("modeGate").hidden = true;
  document.body.classList.add(isExam ? "exam-mode" : "practice-mode");
  document.getElementById("modeLabel").textContent = isExam ? "EXAM MODE · SELECT TEXT TO HIGHLIGHT" : "PRACTICE MODE · CLICK A WORD FOR ITS MEANING";
  document.getElementById("timerHint").textContent = isExam ? "The test submits itself when time runs out." : "Practice mode: you can keep going after 60 minutes.";
  runTimer();
}
document.getElementById("practiceModeButton").addEventListener("click", () => start(false));
// Full mock test flow: arriving from the previous section starts exam mode straight away.
if (T.mock && /[?&]start=exam\b/.test(location.search)) setTimeout(() => start(true), 0);
document.getElementById("examModeButton").addEventListener("click", async () => { start(true); try { if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); } catch (_) {} });

// ---------- Resizable split ----------
const layout = document.getElementById("resizableTest"), divider = document.getElementById("resizeDivider");
let dragging = false;
const setSplit = x => { const r = layout.getBoundingClientRect(), v = Math.max(30, Math.min(70, (x - r.left) / r.width * 100)); layout.style.setProperty("--passage-width", v + "%"); divider.setAttribute("aria-valuenow", String(Math.round(v))); };
divider.addEventListener("pointerdown", e => { dragging = true; divider.setPointerCapture(e.pointerId); e.preventDefault(); });
divider.addEventListener("pointermove", e => { if (dragging) setSplit(e.clientX); });
["pointerup", "pointercancel"].forEach(t => divider.addEventListener(t, () => dragging = false));
divider.addEventListener("keydown", e => { if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return; e.preventDefault(); const r = layout.getBoundingClientRect(), cur = parseFloat(getComputedStyle(layout).getPropertyValue("--passage-width")) || 50; setSplit(r.left + r.width * (cur + (e.key === "ArrowRight" ? 2 : -2)) / 100); });

// ---------- Highlighting and word lookup ----------
const passageNode = document.getElementById("passageText"), toolbar = document.getElementById("selectionToolbar"), action = document.getElementById("selectionAction"), popup = document.getElementById("vocabPopup");
let targetMark = null, lookupId = 0;
const hideToolbar = () => { toolbar.hidden = true; targetMark = null; };
function showToolbar(rect) { toolbar.hidden = false; const w = toolbar.offsetWidth || 150, h = toolbar.offsetHeight || 38; toolbar.style.left = Math.max(8, Math.min(innerWidth - w - 8, rect.left + rect.width / 2 - w / 2)) + "px"; toolbar.style.top = Math.max(8, rect.top - h - 9) + "px"; }
function updateToolbar() { const s = getSelection(); if (!s || s.isCollapsed || !s.rangeCount) { hideToolbar(); return; } const r = s.getRangeAt(0); if (!passageNode.contains(r.commonAncestorContainer)) { hideToolbar(); return; } const node = r.commonAncestorContainer.nodeType === 1 ? r.commonAncestorContainer : r.commonAncestorContainer.parentElement; targetMark = node?.closest?.("mark.user-highlight") || null; action.textContent = targetMark ? "Remove highlight" : "Highlight text"; showToolbar(r.getBoundingClientRect()); }
document.addEventListener("selectionchange", updateToolbar);
toolbar.addEventListener("pointerdown", e => e.preventDefault());
function unwrap(mark) { if (!mark?.isConnected) return; const p = mark.parentNode; while (mark.firstChild) p.insertBefore(mark.firstChild, mark); mark.remove(); p.normalize(); }
action.addEventListener("click", () => { if (targetMark) { unwrap(targetMark); hideToolbar(); getSelection()?.removeAllRanges(); return; } const s = getSelection(); if (!s || s.isCollapsed || !s.rangeCount) return; const r = s.getRangeAt(0); if (!passageNode.contains(r.commonAncestorContainer)) return; const m = document.createElement("mark"); m.className = "user-highlight"; try { r.surroundContents(m); } catch (_) { const f = r.extractContents(); m.appendChild(f); r.insertNode(m); } s.removeAllRanges(); hideToolbar(); });
passageNode.addEventListener("click", e => { const m = e.target.closest("mark.user-highlight"); if (m) { targetMark = m; action.textContent = "Remove highlight"; showToolbar(m.getBoundingClientRect()); } });
passageNode.addEventListener("click", e => { if (!document.body.classList.contains("practice-mode")) return; const w = e.target.closest(".vocab-word"); if (!w || !window.EnglisityLookup) return; const r = w.getBoundingClientRect(), id = ++lookupId; window.EnglisityLookup.show(popup, w.dataset.word, r.left, r.bottom + 7, null, () => id === lookupId); });
document.addEventListener("pointerdown", e => { if (!toolbar.contains(e.target) && !passageNode.contains(e.target)) hideToolbar(); if (!popup.contains(e.target) && !e.target.closest(".vocab-word")) { lookupId++; popup.classList.remove("show"); } });
window.addEventListener("scroll", () => { if (!toolbar.hidden) updateToolbar(); }, true);
window.addEventListener("resize", hideToolbar);

// Keyboard: Alt+← / Alt+→ switches parts.
document.addEventListener("keydown", e => { if (!e.altKey || !["ArrowLeft", "ArrowRight"].includes(e.key)) return; const n = current + (e.key === "ArrowRight" ? 1 : -1); if (n >= 0 && n < T.parts.length) { e.preventDefault(); showPart(n); } });

if (restore()) document.getElementById("restoreNote").hidden = false;
updateProgress();
})();
