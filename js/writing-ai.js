// AI writing check on the Writing page: sends the open task's question and the student's answer to
// /api/writing-check and shows band estimates, strengths, improvements and corrections.
(function () {
  const NAMES = { TA: "Task Achievement", TR: "Task Response", CC: "Coherence and Cohesion", LR: "Lexical Resource", GRA: "Grammatical Range and Accuracy" };
  const MIN = { task1: 150, task2: 250 };

  function visitorId() {
    try {
      let id = localStorage.getItem("englisity-vid");
      if (!id || !/^[a-z0-9]{8,40}$/.test(id)) { id = (Date.now().toString(36) + Math.random().toString(36).slice(2, 10)).slice(0, 20); localStorage.setItem("englisity-vid", id); }
      return id;
    } catch (e) { return ""; }
  }
  const words = text => (String(text).trim().match(/[A-Za-z0-9’'-]+/g) || []).length;
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function message(box, text, kind) {
    box.replaceChildren(el("p", "ai-msg" + (kind ? " ai-msg-" + kind : ""), text));
    box.hidden = false;
  }

  function render(box, r) {
    box.replaceChildren();
    const head = el("div", "ai-head");
    const overall = el("div", "ai-overall");
    overall.append(el("small", "", "Estimated band"), el("strong", "", r.overall.toFixed(1)));
    const summary = el("div", "ai-summary");
    summary.append(el("p", "", r.summary || ""), el("p", "ai-fine", "AI estimate, not an official IELTS score. " + (r.words || 0) + " words." + (r.left !== null && r.left !== undefined ? " Checks left today: " + r.left + "." : "")));
    head.append(overall, summary);
    const grid = el("div", "ai-bands");
    for (const [key, band] of Object.entries(r.bands)) {
      const item = el("div", "ai-band");
      item.append(el("span", "", NAMES[key] || key), el("strong", "", String(band)));
      grid.append(item);
    }
    box.append(head, grid);
    if (r.strengths && r.strengths.length) {
      box.append(el("h3", "", "What you did well"));
      const ul = el("ul", "ai-list ai-good");
      r.strengths.forEach(s => ul.append(el("li", "", s)));
      box.append(ul);
    }
    if (r.improvements && r.improvements.length) {
      box.append(el("h3", "", "How to get a higher band"));
      const ol = el("ol", "ai-list");
      r.improvements.forEach(i => {
        const li = el("li");
        if (i.criterion && NAMES[i.criterion]) li.append(el("span", "ai-tag", NAMES[i.criterion]));
        li.append(document.createTextNode(i.advice));
        ol.append(li);
      });
      box.append(ol);
    }
    if (r.corrections && r.corrections.length) {
      box.append(el("h3", "", "Corrections"));
      const list = el("div", "ai-corrections");
      r.corrections.forEach(c => {
        const row = el("div", "ai-correction");
        row.append(el("del", "", c.original), el("ins", "", c.better));
        if (c.why) row.append(el("small", "", c.why));
        list.append(row);
      });
      box.append(list);
    }
    box.hidden = false;
  }

  async function check(wrap) {
    const type = wrap.dataset.aiCheck;
    const button = wrap.querySelector(".ai-check-btn");
    const box = wrap.querySelector(".ai-result");
    const draft = document.getElementById(type + "Draft");
    const task = window.EnglisityWriting && window.EnglisityWriting.current(type);
    if (!task || !draft) return;
    const essay = draft.value.trim();
    const n = words(essay);
    if (n < 50) { message(box, "Write at least 50 words first (" + MIN[type] + " or more is best), then check your answer.", "warn"); return; }
    if (n < MIN[type] && !wrap.dataset.shortOk) {
      wrap.dataset.shortOk = "1";
      message(box, "Your answer has " + n + " words. IELTS needs at least " + MIN[type] + ", and short answers lose marks. Tap the button again to check it anyway.", "warn");
      return;
    }
    button.disabled = true;
    const label = button.textContent;
    button.textContent = "Checking… (about 20–40 seconds)";
    message(box, "The AI examiner is reading your answer…", "wait");
    try {
      const res = await fetch("/api/writing-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: task.task, question: task.question, data: task.data, essay, vid: visitorId() })
      });
      const r = await res.json().catch(() => ({}));
      if (res.ok && r.ok) {
        render(box, r);
        try { document.dispatchEvent(new CustomEvent("englisity:writing-ai", { detail: { type, task: task.task, overall: r.overall } })); } catch (e) {}
        try { localStorage.setItem("englisity-ai-check-" + type + "-" + task.id, JSON.stringify({ at: Date.now(), overall: r.overall, bands: r.bands })); } catch (e) {}
        try { window.EnglisityTrack && window.EnglisityTrack.finish(Math.round(r.overall * 2), 18, "AI writing check: Task " + task.task + " " + task.id); } catch (e) {}
      } else if (r.error === "limit") message(box, "You have used today's " + (r.limit || 5) + " free AI checks. Come back tomorrow, or use the checklist below to review your writing.", "warn");
      else if (r.error === "busy") message(box, "So many students used the AI checker today that it has reached its daily limit. Please try again tomorrow.", "warn");
      else if (r.error === "too-short") message(box, "Write at least 50 words first, then check your answer.", "warn");
      else if (r.error === "too-long") message(box, "Your answer is too long to check (over 900 words).", "warn");
      else message(box, "The AI checker could not mark this right now. Please try again in a minute.", "error");
    } catch (e) {
      message(box, "No internet connection. Connect and try again; your draft is still here.", "error");
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  }

  window.EnglisityWritingAI = { check };
  document.querySelectorAll("[data-ai-check]:not([data-ai-manual])").forEach(wrap => {
    wrap.querySelector(".ai-check-btn").addEventListener("click", () => check(wrap));
  });
  // A new task opens with an empty result box.
  new MutationObserver(() => document.querySelectorAll("[data-ai-check] .ai-result").forEach(b => { if ((!b.hidden || b.firstChild) && b.parentElement.closest("[hidden]")) { b.hidden = true; b.replaceChildren(); } }))
    .observe(document.querySelector("main") || document.body, { attributes: true, attributeFilter: ["hidden"], subtree: true });
})();
