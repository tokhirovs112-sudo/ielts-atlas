(() => {
  "use strict";
  const PAUSED_KEY = "englisity-reading-paused-test-v1";
  const page = location.pathname.split("/").pop() || "";
  const testId = page.replace(/\.html$/i, "");
  const isReadingTest = !!document.getElementById("exitTest") && !!document.querySelector(".test-main, #herdingTest, #dollsTest, #footPedalTest, #seaVisionTest, #fullTest, #seaTest, #halleyTest, #marsTest, #beatrixTest");

  function readPaused() {
    try { return JSON.parse(localStorage.getItem(PAUSED_KEY) || "null"); }
    catch (_) { return null; }
  }

  function clearTestStorage(id) {
    if (!id) return;
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith("englisity-reading-") && key.toLowerCase().includes(id.toLowerCase())) {
          localStorage.removeItem(key);
        }
      });
    } catch (_) {}
  }

  function captureAnswers() {
    const fields = Array.from(document.querySelectorAll("input, select, textarea")).map((el, index) => ({
      index, id: el.id || "", name: el.name || "", tag: el.tagName.toLowerCase(),
      type: el.type || "", value: el.value, checked: !!el.checked
    }));
    const slots = Array.from(document.querySelectorAll(".drop-slot")).map((el, index) => ({
      index, text: el.textContent || "", word: el.dataset.word || "", value: el.dataset.value || "", className: el.className
    }));
    return { fields, slots };
  }

  function restoreAnswers(snapshot) {
    if (!snapshot) return;
    const fields = Array.from(document.querySelectorAll("input, select, textarea"));
    (snapshot.fields || []).forEach(saved => {
      const el = (saved.id && document.getElementById(saved.id)) || fields[saved.index];
      if (!el || el.tagName.toLowerCase() !== saved.tag) return;
      if (el.type === "checkbox" || el.type === "radio") el.checked = !!saved.checked;
      else el.value = saved.value ?? "";
    });
    const slots = Array.from(document.querySelectorAll(".drop-slot"));
    (snapshot.slots || []).forEach(saved => {
      const el = slots[saved.index];
      if (!el) return;
      el.textContent = saved.text;
      if (saved.word) el.dataset.word = saved.word;
      if (saved.value) el.dataset.value = saved.value;
      el.className = saved.className || el.className;
    });
    const usedWords = new Set(slots.map(el => el.dataset.value).filter(Boolean));
    document.querySelectorAll(".word-chip[data-value]").forEach(chip => chip.classList.toggle("used", usedWords.has(chip.dataset.value)));
    document.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function makeModal() {
    const style = document.createElement("style");
    style.textContent = `
      .eng-exit-overlay[hidden]{display:none}
      .eng-exit-overlay{position:fixed;inset:0;z-index:5000;display:grid;place-items:center;padding:20px;background:rgba(9,20,14,.68);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px)}
      .eng-exit-dialog{width:min(480px,100%);padding:26px;border:1px solid var(--border,#dce5dd);border-radius:18px;background:var(--surface,#fff);color:var(--text,#203c30);box-shadow:0 24px 70px rgba(0,0,0,.25)}
      .eng-exit-dialog h2{margin:0 0 9px;font-size:23px;color:inherit}
      .eng-exit-dialog p{margin:0 0 22px;line-height:1.65;color:var(--muted,#68756b)}
      .eng-exit-actions{display:flex;flex-wrap:wrap;gap:9px;justify-content:flex-end}
      .eng-exit-actions button{min-height:42px;padding:10px 14px;border:1px solid var(--border,#dce5dd);border-radius:10px;background:var(--surface-soft,#f4f7f4);color:var(--text,#203c30);font:inherit;font-weight:750;cursor:pointer}
      .eng-exit-actions .stay{display:none}
      .eng-exit-actions .save-leave{background:#286b49;border-color:#286b49;color:#fff}
      .eng-exit-actions .discard-leave{background:#fff;border-color:#d8a5a5;color:#9d3030}
      html[data-theme="dark"] .eng-exit-dialog{background:#161616;border-color:#363636;color:#f1f1f1}
      html[data-theme="dark"] .eng-exit-actions button{background:#1e1e1e;border-color:#3e3e3e;color:#ebebeb}
      html[data-theme="dark"] .eng-exit-actions .save-leave{background:#347b52;border-color:#347b52;color:#ffffff}
      html[data-theme="dark"] .eng-exit-actions .discard-leave{background:#222222;border-color:#8c555a;color:#ffdfe1}
    `;
    document.head.appendChild(style);
    const overlay = document.createElement("div");
    overlay.className = "eng-exit-overlay";
    overlay.hidden = true;
    overlay.innerHTML = '<section class="eng-exit-dialog" role="dialog" aria-modal="true" aria-labelledby="engExitTitle" aria-describedby="engExitDescription"><h2 id="engExitTitle">Leave this test?</h2><p id="engExitDescription">Your current answers have not been submitted.</p><div class="eng-exit-actions"><button type="button" class="stay">Stay in test</button><button type="button" class="save-leave">Save &amp; Leave</button><button type="button" class="discard-leave">Leave &amp; Don\'t Save</button></div></section>';
    document.body.appendChild(overlay);
    return overlay;
  }

  if (isReadingTest) {
    const exitButton = document.getElementById("exitTest");
    const overlay = makeModal();
    const close = () => { overlay.hidden = true; };
    overlay.querySelector(".stay").addEventListener("click", close);
    overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
    function leave(save) {
      if (save) {
        const title = document.querySelector(".test-column h2, .passage-panel h2, main h2")?.textContent?.trim() || document.title;
        localStorage.setItem(PAUSED_KEY, JSON.stringify({
          id: testId, path: page, title, savedAt: Date.now(), answers: captureAnswers()
        }));
      } else {
        const paused = readPaused();
        if (paused?.id === testId) localStorage.removeItem(PAUSED_KEY);
        clearTestStorage(testId);
      }
      if (window.examTimer) clearInterval(window.examTimer);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      location.href = "reading.html";
    }
    overlay.querySelector(".save-leave").addEventListener("click", () => leave(true));
    overlay.querySelector(".discard-leave").addEventListener("click", () => leave(false));
    document.addEventListener("click", event => { if (event.target.closest("#exitTest")) { event.preventDefault(); event.stopPropagation(); overlay.hidden = false; } }, true);
    const paused = readPaused();
    if (paused?.id === testId && paused.answers) restoreAnswers(paused.answers);
    const syncPausedAnswers = () => {
      const current = readPaused();
      if (current?.id !== testId) return;
      current.answers = captureAnswers();
      current.savedAt = Date.now();
      try { localStorage.setItem(PAUSED_KEY, JSON.stringify(current)); } catch (_) {}
    };
    document.addEventListener("input", syncPausedAnswers);
    document.addEventListener("change", syncPausedAnswers);
    document.getElementById("checkAnswers")?.addEventListener("click", () => {
      const current = readPaused();
      if (current?.id === testId) localStorage.removeItem(PAUSED_KEY);
    });
    document.getElementById("resetTest")?.addEventListener("click", () => {
      const current = readPaused();
      if (current?.id === testId) localStorage.removeItem(PAUSED_KEY);
    });
  }

  const chooser = document.getElementById("readingChooser");
  if (chooser) {
    const paused = readPaused();
    if (paused?.path && paused?.title) {
      const banner = document.createElement("section");
      banner.className = "panel";
      banner.style.cssText = "margin:0 0 22px;border:1px solid #a8c9ae;background:linear-gradient(120deg,#f0f8f1,#fff);";
      const heading = document.createElement("h2");
      heading.textContent = "You have a paused Reading test";
      const copy = document.createElement("p");
      copy.textContent = paused.title + " is waiting for you. Continue where you left off or discard your saved answers.";
      const actions = document.createElement("div");
      actions.style.cssText = "display:flex;flex-wrap:wrap;gap:10px;margin-top:16px";
      const resume = document.createElement("a");
      resume.href = paused.path;
      resume.className = "small-button primary";
      resume.textContent = "Continue paused test";
      const discard = document.createElement("button");
      discard.type = "button";
      discard.className = "small-button";
      discard.textContent = "Discard paused test";
      discard.addEventListener("click", () => {
        localStorage.removeItem(PAUSED_KEY);
        clearTestStorage(paused.id);
        banner.remove();
      });
      actions.append(resume, discard);
      banner.append(heading, copy, actions);
      chooser.parentNode.insertBefore(banner, chooser);
    }
  }
})();
// On phones the passage and questions are stacked, so offer a one-tap jump between them.
(() => {
  "use strict";
  const passage = document.getElementById("passageText");
  if (!passage || !document.getElementById("checkAnswers")) return;
  const questions = Array.from(document.querySelectorAll(".test-column")).find(col => !col.contains(passage)) ||
    document.getElementById("questionList");
  if (!questions) return;
  const style = document.createElement("style");
  style.textContent = ".reading-jump{position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:60;display:none;align-items:center;gap:6px;min-height:44px;padding:10px 16px;border:0;border-radius:999px;background:#1f6b55;color:#fff;font:inherit;font-size:.9rem;font-weight:700;box-shadow:0 6px 18px rgba(20,50,40,.25);cursor:pointer}.reading-jump.show{display:inline-flex}html[data-theme=\"dark\"] .reading-jump{background:#a7d9b7;color:#181818}@media print{.reading-jump{display:none!important}}";
  document.head.append(style);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "reading-jump";
  document.body.append(button);
  let lastPassageY = 0;
  const stacked = () => questions.getBoundingClientRect().top - passage.getBoundingClientRect().top > 400 &&
    Math.abs(questions.getBoundingClientRect().left - passage.getBoundingClientRect().left) < 80;
  const gateOpen = () => { const gate = document.getElementById("modeGate"); return !!gate && !gate.hidden && getComputedStyle(gate).display !== "none"; };
  function update() {
    if (!stacked() || gateOpen()) { button.classList.remove("show"); return; }
    const inQuestions = questions.getBoundingClientRect().top < innerHeight * 0.5;
    button.textContent = inQuestions ? "↑ Passage" : "Questions ↓";
    button.setAttribute("aria-label", inQuestions ? "Back to the passage" : "Jump to the questions");
    button.classList.add("show");
  }
  button.addEventListener("click", () => {
    const inQuestions = questions.getBoundingClientRect().top < innerHeight * 0.5;
    if (inQuestions) window.scrollTo({ top: lastPassageY || passage.getBoundingClientRect().top + scrollY - 80, behavior: "smooth" });
    else { lastPassageY = scrollY; questions.scrollIntoView({ behavior: "smooth", block: "start" }); }
  });
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  document.addEventListener("click", () => setTimeout(update, 50));
  update();
})();
// "Show in passage": highlight the exact evidence sentence (not just the paragraph),
// scroll to it, and offer a one-tap way back to the question.
(() => {
  "use strict";
  const passage = document.getElementById("passageText");
  if (!passage) return;
  const style = document.createElement("style");
  style.textContent = `
    .view-in-test{display:inline-flex!important;align-items:center;gap:7px;margin-top:8px!important;padding:8px 13px;border:1px solid #9fc8b3;border-radius:999px;background:#fff;color:#1f6b55!important;font-size:13px;font-weight:800!important;line-height:1.2;text-decoration:none!important;cursor:pointer;transition:background .15s,border-color .15s}
    .view-in-test:hover,.view-in-test:focus-visible{background:#e8f4ed;border-color:#1f6b55;outline:none}
    .view-in-test:before{content:"";width:15px;height:15px;flex:0 0 15px;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z'/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z'/%3E%3C/svg%3E") center/contain no-repeat}
    #passageText mark.evidence-mark{background:#ffe27a;color:inherit;border-radius:0;padding:2px 0;animation:evidencePulse 1.8s ease-out 1}
    #passageText p.evidence-para{background:#fffbea;outline:1px dashed #e3c75a}
    @keyframes evidencePulse{0%,35%{background:#f7c548}100%{background:#ffe27a}}
    .evidence-chip{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:70;display:flex;align-items:center;gap:4px;padding:5px;border-radius:999px;background:#17352b;box-shadow:0 10px 28px rgba(10,30,22,.3);font-size:13px;max-width:calc(100vw - 24px)}
    .evidence-chip[hidden]{display:none}
    body.evidence-open .reading-jump{display:none!important}
    .evidence-chip button{border:0;border-radius:999px;background:transparent;color:#fff;font:inherit;font-weight:800;padding:9px 14px;cursor:pointer;white-space:nowrap}
    .evidence-chip .back{background:#fff;color:#17352b}
    .evidence-chip .note{color:#cfe3d8;padding:0 8px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    html[data-theme="dark"] .view-in-test{background:#1b1b1b;border-color:#3d3d3d;color:#a7d9b7!important}
    html[data-theme="dark"] #passageText mark.evidence-mark{background:#6b5a12;color:#fff8dc;animation:none}
    html[data-theme="dark"] #passageText p.evidence-para{background:#191919;outline-color:#2d2d2d}
    @media(max-width:600px){.evidence-chip .note{display:none}}
  `;
  document.head.append(style);

  const chip = document.createElement("div");
  chip.className = "evidence-chip";
  chip.hidden = true;
  chip.innerHTML = '<span class="note"></span><button type="button" class="back"></button><button type="button" class="close" aria-label="Clear highlight">✕</button>';
  document.body.append(chip);
  let returnTo = null;

  // Map passage text to a normalised string, remembering which text node each character came from.
  const normChar = c => {
    if (/[‘’ʼ`´]/.test(c)) return "'";
    if (/[“”„]/.test(c)) return '"';
    if (/[–—‑]/.test(c)) return "-";
    if (/\s/.test(c)) return " ";
    return c.toLowerCase();
  };
  function indexPassage() {
    const map = [];
    let text = "";
    const walker = document.createTreeWalker(passage, NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.parentElement.closest(".para-number, .vocab-popup, .selection-toolbar, script, style, [hidden]") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    let node, lastBlock = null;
    while ((node = walker.nextNode())) {
      const block = node.parentElement.closest("p, li, h3, h4, div");
      if (block !== lastBlock && text && !text.endsWith(" ")) { text += " "; map.push(null); }
      lastBlock = block;
      const s = node.nodeValue;
      for (let i = 0; i < s.length; i++) {
        const c = normChar(s[i]);
        if (c === " " && text.endsWith(" ")) continue;
        text += c;
        map.push([node, i]);
      }
    }
    return { text, map };
  }
  const normalise = s => Array.from(String(s)).map(normChar).join("").replace(/\s+/g, " ").trim();

  // Find [start, end] ranges in the passage for the evidence text.
  function findRanges(evidence, text) {
    const pieces = evidence.split(/\s*(?:…|\.\.\.)\s*/).map(p => normalise(p).replace(/^[.,;:'"\s]+|[.,;:'"\s]+$/g, "")).filter(p => p.length > 3);
    const out = [];
    let from = 0;
    for (const piece of pieces) {
      let at = text.indexOf(piece, from);
      if (at < 0) at = text.indexOf(piece);
      if (at < 0) {
        // Try the longest run of leading words that still matches.
        const words = piece.split(" ");
        for (let n = words.length - 1; n >= 4 && at < 0; n--) {
          const sub = words.slice(0, n).join(" ");
          at = text.indexOf(sub);
          if (at >= 0) { out.push([at, at + sub.length]); from = at + sub.length; }
        }
        continue;
      }
      out.push([at, at + piece.length]);
      from = at + piece.length;
    }
    return out;
  }

  function clearMarks() {
    passage.querySelectorAll("mark.evidence-mark").forEach(m => {
      const p = m.parentNode;
      while (m.firstChild) p.insertBefore(m.firstChild, m);
      m.remove();
      p.normalize();
    });
    passage.querySelectorAll(".evidence-para, .is-highlighted").forEach(p => p.classList.remove("evidence-para", "is-highlighted"));
  }

  function wrapRange(map, start, end) {
    // Group character positions by text node, then wrap each node's slice.
    const slices = new Map();
    for (let i = start; i < end; i++) {
      const at = map[i];
      if (!at) continue;
      const [node, offset] = at;
      const s = slices.get(node);
      if (s) s[1] = offset + 1; else slices.set(node, [offset, offset + 1]);
    }
    const marks = [];
    slices.forEach(([a, b], node) => {
      let target = node;
      if (a > 0) target = target.splitText(a);
      if (b - a < target.nodeValue.length) target.splitText(b - a);
      const mark = document.createElement("mark");
      mark.className = "evidence-mark";
      target.parentNode.insertBefore(mark, target);
      mark.append(target);
      marks.push(mark);
    });
    return marks;
  }

  function findParagraph(key) {
    if (!key) return null;
    return document.getElementById("para" + key) || document.getElementById(key) || document.getElementById("p" + key);
  }

  function show(link) {
    clearMarks();
    const box = link.closest(".question-feedback") || link.parentElement;
    const quote = box?.querySelector("blockquote")?.textContent || "";
    let marks = [];
    if (quote.trim()) {
      const { text, map } = indexPassage();
      findRanges(quote, text).forEach(([a, b]) => { marks = marks.concat(wrapRange(map, a, b)); });
    }
    const para = marks[0]?.closest("p") || findParagraph(link.dataset.para);
    if (para && !marks.length) para.classList.add("evidence-para");
    const target = marks[0] || para;
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    const num = (box?.id || "").match(/^(?:f|feedback)(\d+)$/)?.[1] || (link.closest("[id^=q]")?.id || "").match(/\d+/)?.[0];
    returnTo = box;
    const label = para?.id ? (para.querySelector(".para-number")?.textContent || para.id.replace(/^para|^p/, "")) : "";
    chip.querySelector(".note").textContent = marks.length ? "Evidence highlighted" + (label ? " · Paragraph " + label : "") : (label ? "Paragraph " + label : "");
    chip.querySelector(".back").textContent = num ? "← Back to question " + num : "← Back to question";
    chip.hidden = false;
    document.body.classList.add("evidence-open");
  }

  document.addEventListener("click", event => {
    const link = event.target.closest(".view-in-test");
    if (!link) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    show(link);
  }, true);
  const hideChip = () => { chip.hidden = true; document.body.classList.remove("evidence-open"); };
  chip.querySelector(".back").addEventListener("click", () => {
    hideChip();
    returnTo?.scrollIntoView({ behavior: "smooth", block: "center" });
    returnTo?.querySelector(".view-in-test")?.focus({ preventScroll: true });
  });
  chip.querySelector(".close").addEventListener("click", () => { hideChip(); clearMarks(); });
  document.getElementById("resetTest")?.addEventListener("click", () => { hideChip(); clearMarks(); });
  window.EnglisityEvidence = { show, clear: () => { hideChip(); clearMarks(); } };
})();
// Touch screens: say "tap" instead of "click" in the test instructions.
(() => {
  "use strict";
  if (!window.matchMedia || !matchMedia("(pointer: coarse)").matches) return;
  const ends = { s: "s", ed: "ped", ing: "ping", S: "S", ED: "PED", ING: "PING" };
  const swap = t => t
    .replace(/\bCLICK(S|ED|ING)?\b/g, (m, end) => "TAP" + (ends[end] || ""))
    .replace(/\b([Cc])lick(s|ed|ing)?\b/g, (m, c, end) => (c === "C" ? "Tap" : "tap") + (ends[end] || ""));
  const fix = root => {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) { const v = swap(node.nodeValue); if (v !== node.nodeValue) node.nodeValue = v; }
  };
  const LIVE = "#modeLabel, .mode-label, .passage-tools";
  document.querySelectorAll(".mode-card, .mode-gate, .test-instructions, " + LIVE).forEach(fix);
  // Mode labels change when a mode is chosen, so keep watching them.
  const observer = new MutationObserver(list => {
    for (const m of list) {
      const el = m.target.nodeType === 3 ? m.target.parentElement : m.target;
      const box = el && el.closest && el.closest(LIVE);
      if (box) fix(box);
    }
  });
  document.querySelectorAll(LIVE).forEach(el => observer.observe(el, { childList: true, characterData: true, subtree: true }));
})();
