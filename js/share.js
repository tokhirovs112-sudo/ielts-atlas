// "Share your exam questions" and "Report a problem" forms.
// Sends to /api/submit (Cloudflare Worker → Telegram). If sending is not
// possible, offers to send the same text via Telegram so nothing is lost.
(() => {
  "use strict";
  const TELEGRAM = "saidalokhonn";
  const openedAt = Date.now();
  const params = new URLSearchParams(location.search);
  const tabs = { questions: document.getElementById("tabQuestions"), report: document.getElementById("tabReport") };
  const forms = { questions: document.getElementById("formQuestions"), report: document.getElementById("formReport") };
  const copy = {
    questions: ["Share your exam questions", "Took IELTS recently? Write down the questions you remember. Every question you share helps the next students practise with real, recent questions."],
    report: ["Report a problem", "Found a wrong answer, a bad definition or something that does not work? Tell us and it will be fixed."]
  };

  function show(type) {
    Object.keys(forms).forEach(key => {
      forms[key].hidden = key !== type;
      tabs[key].setAttribute("aria-selected", String(key === type));
    });
    document.getElementById("shareTitle").textContent = copy[type][0];
    document.getElementById("shareIntro").textContent = copy[type][1];
    document.title = copy[type][0] + " — Englisity";
    const url = new URL(location.href);
    url.searchParams.set("type", type);
    history.replaceState(null, "", url);
  }
  tabs.questions.addEventListener("click", () => show("questions"));
  tabs.report.addEventListener("click", () => show("report"));

  // Pre-fill the report form from the page the learner came from.
  const fromPage = params.get("page");
  if (fromPage) document.getElementById("rPage").value = fromPage.slice(0, 300);
  if (params.get("question")) document.getElementById("rQuestion").value = params.get("question").slice(0, 40);
  show(params.get("type") === "report" ? "report" : "questions");

  function readable(type, data) {
    const lines = [type === "report" ? "Englisity problem report" : "Englisity exam questions"];
    const labels = { testDate: "Test date", location: "Location", module: "Test type", section: "Part", page: "Page", kind: "Problem", question: "Question", name: "Name", contact: "Contact" };
    Object.entries(labels).forEach(([k, label]) => { if (data[k]) lines.push(label + ": " + data[k]); });
    lines.push("", data.text);
    return lines.join("\n");
  }

  function setStatus(form, kind, html) {
    const box = form.querySelector(".share-status");
    box.className = "share-status " + kind;
    box.innerHTML = html;
    box.hidden = false;
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function fallback(form, type, data) {
    const text = readable(type, data);
    setStatus(form, "fallback",
      "<strong>We could not send this automatically.</strong> Please send it on Telegram instead: copy the message, then open the chat and paste it." +
      '<div class="fallback-actions"><button type="button" data-copy>Copy message</button>' +
      '<a href="https://t.me/' + TELEGRAM + '" target="_blank" rel="noopener">Open Telegram @' + TELEGRAM + "</a></div>");
    form.querySelector("[data-copy]").addEventListener("click", async e => {
      try { await navigator.clipboard.writeText(text); e.target.textContent = "✓ Copied"; }
      catch (err) { window.prompt("Copy this message:", text); }
    });
  }

  Object.entries(forms).forEach(([type, form]) => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      Object.keys(data).forEach(k => { data[k] = String(data[k] || "").trim(); });
      if (data.text.length < 10) {
        setStatus(form, "error", "Please write a little more (at least a sentence) so we can understand it.");
        form.querySelector("textarea").focus();
        return;
      }
      const button = form.querySelector(".share-submit");
      button.disabled = true;
      const label = button.textContent;
      button.textContent = "Sending…";
      try {
        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, ...data, elapsed: Date.now() - openedAt, from: type === "report" ? (fromPage || "") : "" })
        });
        if (res.ok) {
          setStatus(form, "ok", type === "report"
            ? "<strong>Thank you!</strong> Your report has been sent and will be checked soon."
            : "<strong>Thank you!</strong> Your questions have been sent. Once they are checked, they will be added for other students to practise.");
          form.reset();
          if (type === "report" && fromPage) document.getElementById("rPage").value = fromPage;
        } else {
          fallback(form, type, data);
        }
      } catch (err) {
        fallback(form, type, data);
      } finally {
        button.disabled = false;
        button.textContent = label;
      }
    });
  });
})();
