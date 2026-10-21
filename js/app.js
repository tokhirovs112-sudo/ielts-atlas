
(() => {
  const resources = window.ATLAS_RESOURCES || [];
  const LEVELS = ["All levels", "A1–A2", "B1–B2", "C1–C2"];
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  function getLevel() {
    return localStorage.getItem("atlas-level") || "All levels";
  }

  function setLevel(level) {
    localStorage.setItem("atlas-level", level);
  }

  function levelButtons() {
    return `<div class="level-picker">${LEVELS.map(level =>
      `<button class="level-button ${getLevel() === level ? "active" : ""}" data-level="${level}">${level}</button>`
    ).join("")}</div>`;
  }

  function resourceCard(resource) {
    const safeTitle = escapeHTML(resource.title);
    const safeTopic = escapeHTML(resource.topic);
    const safeDescription = escapeHTML(resource.description);
    const safeLevel = escapeHTML(resource.level);
    const safeDate = escapeHTML(resource.date);
    const safeURL = resource.url === "#" ? "#" : escapeHTML(resource.url);
    const action = resource.url === "#"
      ? `<span class="small-button">Content coming soon</span>`
      : `<a class="small-button primary" href="${safeURL}" target="_blank" rel="noopener noreferrer">Open resource ↗</a>`;

    return `<article class="resource-card">
      <div class="resource-meta"><span class="tag">${safeLevel}</span><span>${safeTopic}</span><span>${safeDate}</span></div>
      <h3>${safeTitle}</h3><p>${safeDescription}</p>
      <div class="resource-actions">${action}</div>
    </article>`;
  }

  function renderRecent() {
    const target = document.getElementById("recentResources");
    if (!target) return;
    const selected = getLevel();
    const list = resources.filter(item => selected === "All levels" || item.level === selected)
      .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
    target.innerHTML = list.length ? list.map(resourceCard).join("")
      : `<div class="empty">No resources for this level yet.</div>`;
  }

  function renderLibrary() {
    const target = document.getElementById("libraryResources");
    if (!target) return;
    const type = document.body.dataset.resourceType;
    const search = (document.getElementById("resourceSearch")?.value || "").toLowerCase();
    const sort = document.getElementById("resourceSort")?.value || "newest";
    const selected = getLevel();

    let list = resources.filter(item => item.type === type)
      .filter(item => selected === "All levels" || item.level === selected)
      .filter(item => `${item.title} ${item.topic} ${item.description}`.toLowerCase().includes(search));

    if (sort === "oldest") list.sort((a, b) => a.date.localeCompare(b.date));
    else if (sort === "title") list.sort((a, b) => a.title.localeCompare(b.title));
    else list.sort((a, b) => b.date.localeCompare(a.date));

    target.innerHTML = list.length ? list.map(resourceCard).join("")
      : `<div class="empty">No results. Try another level or search term.</div>`;
  }

  function initLevels() {
    document.querySelectorAll("[data-level]").forEach(button => {
      button.addEventListener("click", () => {
        setLevel(button.dataset.level);
        document.querySelectorAll("[data-level]").forEach(item =>
          item.classList.toggle("active", item.dataset.level === getLevel()));
        const message = document.getElementById("homeLevelMessage");
        if (message) message.textContent = `Selected level: ${getLevel()}. Your preference is saved in this browser.`;
        renderRecent();
        renderLibrary();
      });
    });
  }

  function initMenu() {
    const toggle = document.getElementById("menuToggle");
    const nav = document.getElementById("navigation");
    if (toggle && nav) {
      toggle.addEventListener("click", () => nav.classList.toggle("open"));
    }
  }

  function initWriting() {
    const editor = document.getElementById("writingDraft");
    const save = document.getElementById("saveDraft");
    const status = document.getElementById("draftStatus");
    if (!editor || !save) return;

    editor.value = localStorage.getItem("atlas-writing-draft") || "";
    save.addEventListener("click", () => {
      localStorage.setItem("atlas-writing-draft", editor.value);
      if (status) status.textContent = "Draft saved in this browser.";
    });
  }

  function initSpeaking() {
    const start = document.getElementById("startRecording");
    const stop = document.getElementById("stopRecording");
    const status = document.getElementById("recordingStatus");
    const audio = document.getElementById("recordedAudio");
    let recorder;
    let chunks = [];

    if (!start || !stop || !status || !audio) return;

    start.addEventListener("click", async () => {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        status.textContent = "Recording is not supported in this browser or page context.";
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunks = [];
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = event => {
          if (event.data.size) chunks.push(event.data);
        };
        recorder.onstop = () => {
          audio.src = URL.createObjectURL(new Blob(chunks, { type: "audio/webm" }));
          audio.hidden = false;
          stream.getTracks().forEach(track => track.stop());
          status.textContent = "Recording ready. Play it back below.";
        };
        recorder.start();
        start.disabled = true;
        stop.disabled = false;
        status.textContent = "Recording…";
      } catch {
        status.textContent = "Microphone access was denied or is unavailable.";
      }
    });

    stop.addEventListener("click", () => {
      if (recorder && recorder.state !== "inactive") recorder.stop();
      start.disabled = false;
      stop.disabled = true;
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLevels();
    initMenu();
    initWriting();
    initSpeaking();
    renderRecent();
    renderLibrary();
  });
})();
