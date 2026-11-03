
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

  // Search is forgiving: ignore capitalisation/accents/punctuation and allow small typos.
  function normalizeSearchText(value) {
    return String(value || "")
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function editDistanceAtMost(a, b, limit) {
    if (Math.abs(a.length - b.length) > limit) return limit + 1;
    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const current = [i];
      let rowMin = i;
      for (let j = 1; j <= b.length; j++) {
        current[j] = Math.min(
          current[j - 1] + 1,
          previous[j] + 1,
          previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
        rowMin = Math.min(rowMin, current[j]);
      }
      if (rowMin > limit) return limit + 1;
      previous = current;
    }
    return previous[b.length];
  }

  function forgivingSearchMatch(query, searchableText) {
    const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return true;
    const text = normalizeSearchText(searchableText);
    const words = text.split(/\s+/).filter(Boolean);
    return terms.every(term => {
      if (text.includes(term)) return true;
      const limit = term.length >= 8 ? 2 : term.length >= 4 ? 1 : 0;
      return words.some(word => {
        if (word.startsWith(term) || term.startsWith(word)) return true;
        return limit > 0 && editDistanceAtMost(term, word, limit) <= limit;
      });
    });
  }

  function renderLibrary() {
    const target = document.getElementById("libraryResources");
    if (!target) return;

    const type = document.body.dataset.resourceType;

    const search = document.getElementById("resourceSearch")?.value || "";

    const sort =
      document.getElementById("resourceSort")?.value || "newest";

    const selected = getLevel();

    let list = resources
      .filter(item => item.type === type)
      .filter(item => matchesLevel(item.level, selected))
      .filter(item => forgivingSearchMatch(
        search,
        `${item.title || ""} ${item.topic || ""} ${item.description || ""} ${(item.keywords || []).join(" ")}`
      ));

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


  function initTheme() {
    const header = document.querySelector(".topbar");
    if (!header || document.querySelector(".theme-toggle")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
    button.setAttribute("aria-label", "Switch to dark mode");

    const applyTheme = theme => {
      const dark = theme === "dark";
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      button.textContent = dark ? "☀ Light" : "☾ Dark";
      button.setAttribute("aria-pressed", String(dark));
      button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", dark ? "#111b1a" : "#f5f7f4");
    };

    const saved = localStorage.getItem("englisity-theme");
    applyTheme(saved === "dark" ? "dark" : "light");
    button.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem("englisity-theme", next);
      applyTheme(next);
    });

    const brand = header.querySelector(".brand");
    if (brand) brand.insertAdjacentElement("afterend", button);
    else header.insertBefore(button, header.firstChild);
  }

  function initMenu() {
    const toggle = document.getElementById("menuToggle");
    const nav = document.getElementById("navigation");

    if (toggle && nav) {
      toggle.setAttribute("aria-controls", nav.id);
      toggle.setAttribute("aria-expanded", String(nav.classList.contains("open")));
      toggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });
      nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }));
      document.addEventListener("keydown", event => {
        if (event.key === "Escape" && nav.classList.contains("open")) {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.focus();
        }
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


  // Add the shared mobile presentation and PWA shell without changing desktop styles.
  function getAppRoot() {
    const nestedPage = /\/(?:pages|articles)\//.test(window.location.pathname);
    return new URL(nestedPage ? "../" : "./", window.location.href);
  }

  let deferredInstallPrompt = null;

  function initPWAAssets() {
    const appRoot = getAppRoot();
    const addLink = (rel, href, extra = {}) => {
      let link = document.querySelector('link[rel="' + rel + '"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
      Object.entries(extra).forEach(([key, value]) => link.setAttribute(key, value));
    };

    addLink("manifest", new URL("manifest.webmanifest", appRoot).href);
    addLink("apple-touch-icon", new URL("assets/englisity-app-icon.png", appRoot).href, { sizes: "180x180" });

    if (!document.querySelector('link[data-englisity-mobile-css]')) {
      const mobileStyles = document.createElement("link");
      mobileStyles.rel = "stylesheet";
      mobileStyles.href = new URL("css/mobile.css?v=20261103-responsive-pwa-1", appRoot).href;
      mobileStyles.dataset.englisityMobileCss = "true";
      document.head.appendChild(mobileStyles);
    }

    const ensureMeta = (name, content) => {
      let meta = document.querySelector('meta[name="' + name + '"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    ensureMeta("theme-color", "#183b34");
    ensureMeta("mobile-web-app-capable", "yes");
    ensureMeta("apple-mobile-web-app-capable", "yes");
    ensureMeta("apple-mobile-web-app-title", "Englisity");
    ensureMeta("apple-mobile-web-app-status-bar-style", "black-translucent");

    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport && !/viewport-fit\s*=\s*cover/i.test(viewport.content)) {
      viewport.content += ", viewport-fit=cover";
    }

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    document.documentElement.classList.toggle("pwa-standalone", isStandalone);

    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      deferredInstallPrompt = event;
    });

    window.addEventListener("appinstalled", () => {
      const installButton = document.querySelector(".pwa-install-button");
      if (installButton) {
        installButton.textContent = "Installed";
        installButton.disabled = true;
        installButton.setAttribute("aria-label", "Englisity is installed");
      }
    });

    if ("serviceWorker" in navigator && window.location.protocol === "https:") {
      const register = () => {
        navigator.serviceWorker.register(new URL("sw.js", appRoot).href, {
          scope: appRoot.pathname,
          updateViaCache: "none"
        }).catch(error => {
          console.warn("Englisity offline support could not be enabled.", error);
        });
      };

      if (document.readyState === "complete") register();
      else window.addEventListener("load", register, { once: true });
    }
  }

  function initPWAInstall() {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    const nav = document.getElementById("navigation");
    if (!nav || nav.querySelector(".pwa-install-button")) return;

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "pwa-install-button";
    button.textContent = "Install Englisity";
    button.setAttribute("aria-label", "Install Englisity on this device");

    const dialog = document.createElement("dialog");
    dialog.className = "pwa-install-dialog";
    dialog.innerHTML =
      '<div class="pwa-install-dialog-content">' +
        '<p class="pwa-install-kicker">ENGLISITY APP</p>' +
        '<h2>Use Englisity like an app</h2>' +
        '<p class="pwa-install-instructions"></p>' +
        '<form method="dialog"><button type="submit">Got it</button></form>' +
      '</div>';
    const instructions = dialog.querySelector(".pwa-install-instructions");
    instructions.textContent = isIOS
      ? "In Safari, tap the Share button, choose “Add to Home Screen”, then tap Add."
      : "Open your browser menu and choose “Install app” or “Add to Home Screen”. The exact wording depends on your browser.";

    if (document.body) document.body.appendChild(dialog);

    button.addEventListener("click", async () => {
      if (deferredInstallPrompt) {
        const promptEvent = deferredInstallPrompt;
        deferredInstallPrompt = null;
        try {
          await promptEvent.prompt();
          const choice = await promptEvent.userChoice;
          if (choice && choice.outcome === "accepted") button.hidden = true;
        } catch (error) {
          console.warn("The install prompt was not available.", error);
          if (typeof dialog.showModal === "function") dialog.showModal();
          else dialog.open = true;
        }
        return;
      }

      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.open = true;
    });

    nav.appendChild(button);
  }

  initPWAAssets();


  document.addEventListener("DOMContentLoaded", () => {
    initLevels();
    initTheme();
    initPWAInstall();
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
