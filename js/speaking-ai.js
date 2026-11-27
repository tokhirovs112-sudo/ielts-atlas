// AI speaking check: sends recorded answers (one practice answer, or the three parts of a mock test)
// to /api/speaking-check and shows band estimates, a transcript and feedback. Shared by
// pages/speaking.html (practice recorder) and js/speaking-mock.js (end of a mock test).
(function () {
  const NAMES = { FC: "Fluency and Coherence", LR: "Lexical Resource", GRA: "Grammatical Range and Accuracy", P: "Pronunciation (rough estimate)" };
  function visitorId() {
    try {
      let id = localStorage.getItem("englisity-vid");
      if (!id || !/^[a-z0-9]{8,40}$/.test(id)) { id = (Date.now().toString(36) + Math.random().toString(36).slice(2, 10)).slice(0, 20); localStorage.setItem("englisity-vid", id); }
      return id;
    } catch (e) { return ""; }
  }
  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
  function message(box, text, kind) { box.replaceChildren(el("p", "ai-msg" + (kind ? " ai-msg-" + kind : ""), text)); box.hidden = false; }

  function render(box, r) {
    box.replaceChildren();
    const head = el("div", "ai-head");
    const overall = el("div", "ai-overall");
    overall.append(el("small", "", "Estimated band"), el("strong", "", r.overall.toFixed(1)));
    const summary = el("div", "ai-summary");
    const fine = "AI estimate, not an official IELTS score." + (r.mode === "answer" ? " Based on one answer; a full mock test gives a fairer estimate." : "") + (r.left !== null && r.left !== undefined ? " Speaking checks left today: " + r.left + "." : "");
    summary.append(el("p", "", r.summary || ""), el("p", "ai-fine", fine));
    head.append(overall, summary);
    const grid = el("div", "ai-bands");
    for (const [key, band] of Object.entries(r.bands)) { const item = el("div", "ai-band"); item.append(el("span", "", NAMES[key] || key), el("strong", "", String(band))); grid.append(item); }
    box.append(head, grid);
    if (r.strengths && r.strengths.length) { box.append(el("h3", "", "What you did well")); const ul = el("ul", "ai-list"); r.strengths.forEach(s => ul.append(el("li", "", s))); box.append(ul); }
    if (r.improvements && r.improvements.length) {
      box.append(el("h3", "", "How to get a higher band"));
      const ol = el("ol", "ai-list");
      r.improvements.forEach(i => { const li = el("li"); if (i.criterion && NAMES[i.criterion]) li.append(el("span", "ai-tag", NAMES[i.criterion].replace(" (rough estimate)", ""))); li.append(document.createTextNode(i.advice)); ol.append(li); });
      box.append(ol);
    }
    if (r.corrections && r.corrections.length) {
      box.append(el("h3", "", "Corrections"));
      const list = el("div", "ai-corrections");
      r.corrections.forEach(c => { const row = el("div", "ai-correction"); row.append(el("del", "", c.original), el("ins", "", c.better)); if (c.why) row.append(el("small", "", c.why)); list.append(row); });
      box.append(list);
    }
    if (r.transcripts && r.transcripts.length) {
      const d = el("details", "ai-transcript");
      d.append(el("summary", "", "What the AI heard (transcript)"));
      r.transcripts.forEach(t => {
        const p = el("p");
        const label = (r.mode === "mock" ? "Part " + t.part : "Your answer") + (t.wpm ? " · about " + t.wpm + " words a minute" : "") + ": ";
        p.append(el("b", "", label), document.createTextNode(t.text || "(nothing recognised)"));
        d.append(p);
      });
      d.append(el("p", "ai-fine", "If words here are wrong, the AI may not have understood them clearly. Speak a little slower and more clearly in that part."));
      box.append(d);
    }
    box.hidden = false;
  }

  async function check(wrap, mode, parts, button) {
    const box = wrap.querySelector(".ai-result");
    parts = (parts || []).filter(p => p.blob && p.blob.size > 2000);
    if (!parts.length) { message(box, "There is no recording to check. Record your answer first.", "warn"); return; }
    const seconds = parts.reduce((a, p) => a + (p.seconds || 0), 0);
    if (seconds && seconds < 8) { message(box, "Your recording is very short. Answer the question in a few sentences, then check it.", "warn"); return; }
    const fd = new FormData();
    fd.append("meta", JSON.stringify({ mode, vid: visitorId(), parts: parts.map(p => ({ part: p.part, questions: p.questions, seconds: p.seconds })) }));
    parts.forEach((p, i) => fd.append("audio" + i, p.blob, "part" + p.part + (/mp4/.test(p.blob.type) ? ".m4a" : ".webm")));
    const label = button ? button.textContent : "";
    if (button) { button.disabled = true; button.textContent = mode === "mock" ? "Checking… (up to a minute)" : "Checking… (about 20 seconds)"; }
    message(box, "The AI examiner is listening to your answer…", "wait");
    try {
      const res = await fetch("/api/speaking-check", { method: "POST", body: fd });
      const r = await res.json().catch(() => ({}));
      if (res.ok && r.ok) {
        render(box, r);
        try { document.dispatchEvent(new CustomEvent("englisity:speaking-ai", { detail: { mode: r.mode || mode, overall: r.overall } })); } catch (e) {}
        try { window.EnglisityTrack && window.EnglisityTrack.finish(Math.round(r.overall * 2), 18, "AI speaking check: " + mode); } catch (e) {}
      } else if (r.error === "limit") message(box, mode === "mock" ? "A full mock uses 4 of your " + (r.limit || 8) + " daily speaking checks, and there are not enough left today. Come back tomorrow, or check single answers in the practice section." : "You have used today's free speaking checks. Come back tomorrow.", "warn");
      else if (r.error === "busy") message(box, "So many students used the AI checker today that it has reached its daily limit. Please try again tomorrow.", "warn");
      else if (r.error === "no-speech") message(box, "The AI could not hear enough English in your recording. Check that your microphone works, speak clearly, and try again.", "warn");
      else if (r.error === "too-long") message(box, "This recording is too long to check. Keep each answer under about 10 minutes.", "warn");
      else if (r.error === "too-short") message(box, "Your recording is too short to check.", "warn");
      else message(box, "The AI checker could not mark this right now. Please try again in a minute.", "error");
    } catch (e) {
      message(box, "No internet connection. Connect and try again; your recording is still here.", "error");
    } finally {
      if (button) { button.disabled = false; button.textContent = label; }
    }
  }
  window.EnglisitySpeakingAI = { check };
})();
