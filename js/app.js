
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

  function levelButtons() {
    return `<div class="level-picker">
      ${LEVELS.map(level => `
        <button
          class="level-button ${getLevel() === level ? "active" : ""}"
          data-level="${level}"
          type="button"
        >${level}</button>
      `).join("")}
    </div>`;
  }

  function resourceCard(resource) {
    const safeTitle = escapeHTML(resource.title);
    const safeTopic = escapeHTML(resource.topic);
    const safeDescription = escapeHTML(resource.description);
    const safeLevel = escapeHTML(resource.level);
    const safeDate = escapeHTML(resource.date);

    const action = !resource.url || resource.url === "#"
      ? `<span class="small-button">Content coming soon</span>`
      : `<a class="small-button primary"
           href="${escapeHTML(resource.url)}"
           target="_blank"
           rel="noopener noreferrer">Open resource ↗</a>`;

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
      .filter(item =>
        selected === "All levels" || item.level === selected
      )
      .sort((a, b) => b.date.localeCompare(a.date))
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
    ).toLowerCase();

    const sort =
      document.getElementById("resourceSort")?.value || "newest";

    const selected = getLevel();

    let list = resources
      .filter(item => item.type === type)
      .filter(item =>
        selected === "All levels" || item.level === selected
      )
      .filter(item =>
        `${item.title} ${item.topic} ${item.description}`
          .toLowerCase()
          .includes(search)
      );

    if (sort === "oldest") {
      list.sort((a, b) => a.date.localeCompare(b.date));
    } else if (sort === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list.sort((a, b) => b.date.localeCompare(a.date));
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

        // Use the same key as getLevel().
        localStorage.setItem("atlas-level", level);

        // Update every level button on this page.
        buttons.forEach(item => {
          item.classList.toggle("active", item.dataset.level === level);
        });

        renderRecent();
        renderLibrary();
      });
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

    document.querySelectorAll(
      "#resourceSearch, #resourceSort"
    ).forEach(control => {
      control.addEventListener("input", renderLibrary);
      control.addEventListener("change", renderLibrary);
    });

    renderRecent();
    renderLibrary();
  });
})();
