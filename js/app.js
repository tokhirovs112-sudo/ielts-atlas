
(() => {
  const resources = window.ATLAS_RESOURCES || [];

  const LEVELS = ["All levels", "A1–A2", "B1–B2", "C1–C2"];

  const escapeHTML = value =>
    String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);

  function getLevel() {
    return localStorage.getItem("atlas-level") || "All levels";
  }

  function setLevel(level) {
    localStorage.setItem("atlas-level", level);
  }

  // Convert an individual level into its standard format.
  function normalizeLevel(level) {
    return String(level || "").trim().toUpperCase();
  }

  // Check whether a resource belongs to the selected level group.
  function matchesLevel(resourceLevel, selectedLevel) {
    if (selectedLevel === "All levels") return true;

    const levelGroups = {
      "A1–A2": ["A1", "A2"],
      "B1–B2": ["B1", "B2"],
      "C1–C2": ["C1", "C2"]
    };

    const allowedLevels = levelGroups[selectedLevel];

    if (!allowedLevels) {
      return normalizeLevel(resourceLevel) === normalizeLevel(selectedLevel);
    }

    return allowedLevels.includes(normalizeLevel(resourceLevel));
  }

  // Makes article links work from both the homepage and pages/ folder.
  function getResourceURL(url) {
    if (!url || url === "#") return "#";

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    const cleanURL = url.replace(/^(\.\.\/)+/, "");

    const siteRoot = window.location.pathname.includes("/pages/")
      ? new URL("../", window.location.href)
      : new URL("./", window.location.href);

    return new URL(cleanURL, siteRoot).href;
  }

  function resourceCard(resource) {
    const safeTitle = escapeHTML(resource.title);
    const safeTopic = escapeHTML(resource.topic || "General");
    const safeDescription = escapeHTML(resource.description || "");
    const safeLevel = escapeHTML(resource.level || "All levels");
    const safeDate = escapeHTML(resource.date || "");
    const safeURL = escapeHTML(getResourceURL(resource.url));

    const action = resource.url && resource.url !== "#"
      ? `<a class="small-button primary"
            href="${safeURL}"
            ${/^https?:\/\//i.test(resource.url) ? 'target="_blank" rel="noopener noreferrer"' : ""}>
            ${resource.type === "article" ? "Start reading →" : "Open resource ↗"}
         </a>`
      : `<span class="small-button">Content coming soon</span>`;

    return `
      <article class="resource-card">
        <div class="resource-meta">
          <span class="tag">${safeLevel}</span>
          <span>${safeTopic}</span>
          <span>${safeDate}</span>
        </div>
        <h3>${safeTitle}</h3>
        <p>${safeDescription}</p>
        <div class="resource-actions">${action}</div>
      </article>
    `;
  }

  function renderRecent() {
    const target = document.getElementById("recentResources");
    if (!target) return;

    const selected = getLevel();

    const list = resources
      .filter(item => matchesLevel(item.level, selected))
      .sort((a, b) =>
        (b.date || "").localeCompare(a.date || "")
      )
      .slice(0, 4);

    target.innerHTML = list.length
      ? list.map(resourceCard).join("")
      : `<div class="empty">No resources for this level yet.</div>`;
  }

  function renderLibrary() {
    const target = document.getElementById("libraryResources");
    if (!target) return;

    const type = document.body.dataset.resourceType;

    const search = (
      document.getElementById("resourceSearch")?.value || ""
    ).toLowerCase().trim();

    const sort =
      document.getElementById("resourceSort")?.value || "newest";

    const selected = getLevel();

    let list = resources
      .filter(item => item.type === type)
      .filter(item => matchesLevel(item.level, selected))
      .filter(item =>
        `${item.title || ""} ${item.topic || ""} ${item.description || ""}`
          .toLowerCase()
          .includes(search)
      );

    if (sort === "oldest") {
      list.sort((a, b) =>
        (a.date || "").localeCompare(b.date || "")
      );
    } else if (sort === "title") {
      list.sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
    } else {
      list.sort((a, b) =>
        (b.date || "").localeCompare(a.date || "")
      );
    }

    target.innerHTML = list.length
      ? list.map(resourceCard).join("")
      : `<div class="empty">No results. Try another level or search term.</div>`;
  }

  function initLevels() {
    const buttons = document.querySelectorAll("[data-level]");

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        const level = button.dataset.level;

        setLevel(level);

        document.querySelectorAll("[data-level]").forEach(item => {
          item.classList.toggle(
            "active",
            item.dataset.level === level
          );
        });

        renderRecent();
        renderLibrary();
      });
    });

    const savedLevel = getLevel();

    buttons.forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.level === savedLevel
      );
    });
  }

  function initMenu() {
    const toggle = document.getElementById("menuToggle");
    const nav = document.getElementById("navigation");

    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        nav.classList.toggle("open");
      });
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

      if (status) {
        status.textContent = "Draft saved in this browser.";
      }
    });
  }

  function initReadingPassages() {
    const buttons = document.querySelectorAll("[data-passage]");
    const passages = document.querySelectorAll("[data-passage-content]");

    if (!buttons.length || !passages.length) return;

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        const selected = button.dataset.passage;

        buttons.forEach(item => {
          item.classList.toggle("active", item === button);
        });

        passages.forEach(passage => {
          passage.hidden =
            passage.dataset.passageContent !== selected;
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLevels();
    initMenu();
    initWriting();
    initReadingPassages();

    renderRecent();
    renderLibrary();

    document
      .querySelectorAll("#resourceSearch, #resourceSort")
      .forEach(control => {
        control.addEventListener("input", renderLibrary);
        control.addEventListener("change", renderLibrary);
      });
  });
})();
