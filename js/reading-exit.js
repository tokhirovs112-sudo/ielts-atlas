(() => {
  "use strict";
  const PAUSED_KEY = "englisity-reading-paused-test-v1";
  const page = location.pathname.split("/").pop() || "";
  const testId = page.replace(/\.html$/i, "");
  const isReadingTest = !!document.getElementById("exitTest") && !!document.querySelector(".test-main, #herdingTest, #seaTest, #halleyTest, #marsTest, #beatrixTest");

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
      index, text: el.textContent || "", word: el.dataset.word || "", className: el.className
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
      el.className = saved.className || el.className;
    });
    document.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function makeModal() {
    const style = document.createElement("style");
    style.textContent = `
      .eng-exit-overlay{position:fixed;inset:0;z-index:5000;display:grid;place-items:center;padding:20px;background:rgba(9,20,14,.68);backdrop-filter:blur(5px)}
      .eng-exit-dialog{width:min(480px,100%);padding:26px;border:1px solid var(--border,#dce5dd);border-radius:18px;background:var(--surface,#fff);color:var(--text,#203c30);box-shadow:0 24px 70px rgba(0,0,0,.25)}
      .eng-exit-dialog h2{margin:0 0 9px;font-size:23px;color:inherit}
      .eng-exit-dialog p{margin:0 0 22px;line-height:1.65;color:var(--muted,#68756b)}
      .eng-exit-actions{display:flex;flex-wrap:wrap;gap:9px;justify-content:flex-end}
      .eng-exit-actions button{min-height:42px;padding:10px 14px;border:1px solid var(--border,#dce5dd);border-radius:10px;background:var(--surface-soft,#f4f7f4);color:var(--text,#203c30);font:inherit;font-weight:750;cursor:pointer}
      .eng-exit-actions .save-leave{background:#286b49;border-color:#286b49;color:#fff}
      .eng-exit-actions .discard-leave{background:#fff;border-color:#d8a5a5;color:#9d3030}
      html[data-theme="dark"] .eng-exit-dialog{background:#172722;border-color:#40564b;color:#edf5ef}
      html[data-theme="dark"] .eng-exit-actions button{background:#20332d;border-color:#496355;color:#e7eee9}
      html[data-theme="dark"] .eng-exit-actions .save-leave{background:#347b52;border-color:#347b52;color:#fff}
      html[data-theme="dark"] .eng-exit-actions .discard-leave{background:#382629;border-color:#8c555a;color:#ffdfe1}
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