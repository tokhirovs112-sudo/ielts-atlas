(() => {
  "use strict";
  const KEY = "englisity-progress-v1";
  const BOOKMARKS = "englisity-bookmarks-v1";
  const STREAK_KEY = "englisity-quiz-streak-v1";
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const localDateKey = (date = new Date()) => [date.getFullYear(), String(date.getMonth()+1).padStart(2,"0"), String(date.getDate()).padStart(2,"0")].join("-");
  // Use local calendar dates for streaks, but UTC arithmetic for date shifting.
  // This avoids daylight-saving and month/year-boundary errors.
  function shiftDateKey(key, amount) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key || ""));
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      return null;
    }
    date.setUTCDate(date.getUTCDate() + amount);
    return date.toISOString().slice(0, 10);
  }

  function readStreak() {
    const stored = read(STREAK_KEY, {});
    const currentValue = Number(stored && stored.current);
    const longestValue = Number(stored && stored.longest);
    const current = Number.isFinite(currentValue) ? Math.max(0, Math.floor(currentValue)) : 0;
    const longest = Number.isFinite(longestValue) ? Math.max(current, 0, Math.floor(longestValue)) : current;
    const lastActive = stored && typeof stored.lastActive === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(stored.lastActive) ? stored.lastActive : null;
    return { current, longest, lastActive };
  }

  function getCurrentStreak() {
    const streak = readStreak();
    const today = localDateKey();
    const yesterday = shiftDateKey(today, -1);
    if (streak.lastActive !== today && streak.lastActive !== yesterday) {
      return { ...streak, current:0 };
    }
    return streak;
  }

  // A successful learning session records at most one active day, regardless
  // of how many times the event fires or how many quizzes are passed that day.
  function recordStreakActivity() {
    const stored = readStreak();
    const today = localDateKey();
    if (stored.lastActive === today) {
      const current = getCurrentStreak();
      updateStreakPill();
      renderDashboard();
      return current;
    }

    const current = stored.lastActive === shiftDateKey(today, -1)
      ? stored.current + 1
      : 1;
    const next = {
      current,
      longest: Math.max(stored.longest, current),
      lastActive: today
    };
    save(STREAK_KEY, next);
    updateStreakPill();
    renderDashboard();
    return next;
  }

  window.EnglisityProgress = window.EnglisityProgress || {};
  window.EnglisityProgress.recordActivity = recordStreakActivity;
  window.EnglisityProgress.getStreak = getCurrentStreak;
  window.addEventListener("storage", event => {
    if (event.key === STREAK_KEY) {
      updateStreakPill();
      renderDashboard();
    }
  });
  window.addEventListener("pageshow", () => {
    updateStreakPill();
    renderDashboard();
  });
  const page = location.pathname.split("/").pop() || "index.html";
  const labels = { "index.html":"Home", "reading.html":"Reading", "listening.html":"Listening", "writing.html":"Writing", "speaking.html":"Speaking", "vocabulary.html":"Vocabulary", "articles.html":"Articles", "podcasts.html":"Podcasts" };
  const progress = read(KEY, { visits:{}, completed:{}, minutes:0 });
  progress.visits[page] = (progress.visits[page] || 0) + 1;
  save(KEY, progress);

  const styles = document.createElement("style");
  styles.textContent = `
    .eng-progress{max-width:1160px;margin:18px auto;padding:18px 22px;background:#fff;border:1px solid #e5eaf3;border-radius:16px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
    .eng-progress strong{color:#14213d}.eng-progress small{display:block;color:#718096;margin-top:3px}
    .eng-streak-pill{display:inline-flex;align-items:center;padding:8px 11px;border-radius:999px;background:#fff4df;color:#9a5b08;font-size:13px;font-weight:800;white-space:nowrap}
    .eng-progress a,.eng-progress button{border:1px solid #dce5f2;background:#f7f9fd;color:#2457a6;padding:9px 12px;border-radius:9px;font:inherit;font-size:13px;font-weight:700;cursor:pointer}
    .eng-progress-actions{display:flex;gap:8px;flex-wrap:wrap}
    .eng-dashboard{max-width:1160px;margin:0 auto 36px;padding:0 24px}
    .eng-dashboard-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
    .eng-stat,.eng-bookmarks{background:#fff;border:1px solid #e5eaf3;border-radius:15px;padding:18px}
    .eng-stat b{display:block;font-size:24px;color:#14213d}.eng-stat span,.eng-bookmarks p{color:#718096;font-size:13px}
    .eng-bookmarks{grid-column:1/-1}.eng-bookmark-list{display:flex;flex-wrap:wrap;gap:9px}.eng-bookmark-list a{padding:8px 11px;border-radius:9px;background:#edf2ff;color:#2457a6;font-size:13px;font-weight:700}
    .eng-save{border:1px solid #dce5f2;background:#fff;color:#2457a6;border-radius:8px;padding:7px 10px;font:inherit;font-size:12px;font-weight:700;cursor:pointer;margin-top:12px}
    .eng-save.saved{background:#eaf7ef;border-color:#bce4cb;color:#187344}
    .eng-timer{margin-top:16px;padding:14px;border-radius:12px;background:#f6f8fc;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .eng-timer output{font-size:20px;font-weight:800;font-variant-numeric:tabular-nums;color:#14213d;min-width:62px}
    .eng-timer button{border:1px solid #dce5f2;background:#fff;border-radius:8px;padding:7px 10px;cursor:pointer}
    .eng-autosave{font-size:12px;color:#718096;margin-top:7px}
    @media(max-width:650px){.eng-dashboard-grid{grid-template-columns:1fr}.eng-dashboard{padding:0 16px}.eng-progress{margin:14px 12px}}
  `;
  document.head.appendChild(styles);

  const nav = document.querySelector(".topbar");
  // Keep passage-test workspaces focused: do not inject the learning progress strip here.
  if (nav && !document.body.classList.contains("passage-test-page")) {
    const vocabLink = document.createElement("a");
    vocabLink.href = page === "index.html" ? "pages/vocabulary.html" : "../pages/vocabulary.html";
    vocabLink.textContent = "Vocabulary";
    vocabLink.className = "eng-vocab-nav";
    const siteNav = nav.querySelector(".nav");
    if (siteNav && !siteNav.querySelector(".eng-vocab-nav")) siteNav.appendChild(vocabLink);
    if (siteNav && !siteNav.querySelector(".eng-quiz-nav")) {
      const quizLink = document.createElement("a");
      quizLink.href = page === "index.html" ? "pages/vocabulary.html#dailyQuiz" : "../pages/vocabulary.html#dailyQuiz";
      quizLink.textContent = "Quiz";
      quizLink.className = "eng-quiz-nav";
      siteNav.appendChild(quizLink);
    }
    const strip = document.createElement("section");
    strip.className = "eng-progress";
    strip.innerHTML = '<div><strong>My learning</strong><small>Progress is saved on this device.</small></div><div class="eng-progress-actions"><span class="eng-streak-pill" id="engStreakPill">🔥 0-day streak</span><a href="' + (page === "index.html" ? "#myDashboard" : "../index.html#myDashboard") + '">Dashboard</a><a href="' + (page === "index.html" ? "pages/vocabulary.html" : "../pages/vocabulary.html") + '">Daily practice</a></div>';
    updateStreakPill();
    nav.insertAdjacentElement("afterend", strip);
  }

  function bookmarkButton(element, title, url) {
    if (!title || !url || url === "#" || element.querySelector(".eng-save")) return;
    const id = url;
    const list = read(BOOKMARKS, []);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "eng-save" + (list.some(x=>x.url===id) ? " saved" : "");
    button.textContent = list.some(x=>x.url===id) ? "Saved" : "Save resource";
    button.addEventListener("click", () => {
      let items = read(BOOKMARKS, []);
      if (items.some(x=>x.url===id)) {
        items = items.filter(x=>x.url!==id);
        button.textContent = "Save resource";
        button.classList.remove("saved");
      } else {
        items.push({title, url:id});
        button.textContent = "Saved";
        button.classList.add("saved");
      }
      save(BOOKMARKS, items);
      renderDashboard();
    });
    element.appendChild(button);
  }

  function scanBookmarks() {
    document.querySelectorAll(".resource-card").forEach(card => {
      const link = card.querySelector('a[href]');
      const title = card.querySelector("h3")?.textContent?.trim();
      if (link && title) bookmarkButton(card,title,link.getAttribute("href"));
    });
    document.querySelectorAll(".task-library-card").forEach(card => {
      const title = card.querySelector("strong")?.textContent?.trim() || card.textContent.trim();
      bookmarkButton(card,title,location.pathname + "#" + (card.dataset.task1Category || card.dataset.task2Category || title.toLowerCase().replace(/[^a-z0-9]+/g,"-")));
    });
  }

  function updateStreakPill() {
    const pill = document.getElementById("engStreakPill");
    if (!pill) return;
    const streak = getCurrentStreak();
    pill.textContent = "🔥 " + streak.current + "-day streak";
    pill.title = "Longest streak: " + (streak.longest || 0) + " days";
  }

  function renderDashboard() {
    const target = document.getElementById("engDashboardContent");
    if (!target) return;
    const data = read(KEY,{visits:{},completed:{},minutes:0});
    const totalVisits = Object.values(data.visits || {}).reduce((a,b)=>a+b,0);
    const totalCompleted = Object.values(data.completed || {}).reduce((a,b)=>a+b,0);
    const vocabStats = read("englisity-vocab-stats-v1",{passed:0,words:[]});
    const saved = read(BOOKMARKS,[]);
    const streak = getCurrentStreak();
    target.innerHTML = '<div class="eng-dashboard-grid"><div class="eng-stat"><b>'+totalVisits+'</b><span>Page visits</span></div><div class="eng-stat"><b>'+(vocabStats.passed||0)+'</b><span>Vocabulary quizzes passed</span></div><div class="eng-stat"><b>🔥 '+streak.current+'</b><span>Current streak</span></div><div class="eng-stat"><b>'+(streak.longest||0)+'</b><span>Longest streak</span></div><div class="eng-stat"><b>'+saved.length+'</b><span>Saved resources</span></div><div class="eng-bookmarks"><strong>Saved resources</strong><div class="eng-bookmark-list">'+(saved.length?saved.map(x=>'<a href="'+String(x.url).replace(/&/g,"&amp;").replace(/"/g,"&quot;")+'">'+String(x.title).replace(/&/g,"&amp;").replace(/</g,"&lt;")+'</a>').join(""):'<p>You have not saved any resources yet. Use “Save resource” on an existing resource.</p>')+'</div></div></div>';
  }

  function addDashboard() {
    if (page !== "index.html" || document.getElementById("myDashboard")) return;
    const hero = document.querySelector(".home-hero, .home-hero-new");
    if (!hero) return;
    const section = document.createElement("section");
    section.className = "eng-dashboard";
    section.id = "myDashboard";
    section.innerHTML = '<div class="home-section-heading"><span>YOUR ACTIVITY</span><h2>My learning dashboard</h2><p>A simple overview of your activity on this device.</p></div><div id="engDashboardContent"></div>';
    const anchor = document.getElementById("learning-path") || hero;
    anchor.insertAdjacentElement("afterend",section);
    renderDashboard();
  }

  function addTimer() {
    const timerConfigs = [
      { selector: "#task1Draft", label: "Task 1 timer", minutes: 20 },
      { selector: "#task2Draft", label: "Task 2 timer", minutes: 40 },
      { selector: "#writingDraft", label: "Writing timer", minutes: 40 }
    ];

    timerConfigs.forEach(({ selector, label, minutes }) => {
      const editor = document.querySelector(selector);
      if (!editor || editor.parentElement.querySelector(".eng-timer")) return;

      const panel = document.createElement("div");
      panel.className = "eng-timer";
      panel.innerHTML = '<strong>' + label + '</strong><output aria-live="off">' +
        String(minutes).padStart(2, "0") + ':00</output><button type="button" class="eng-timer-start">Start</button><button type="button" class="eng-timer-reset">Reset</button><span class="helper">Optional practice timer. It does not affect your draft.</span>';
      editor.insertAdjacentElement("beforebegin", panel);

      let remaining = minutes * 60;
      let interval = null;
      const output = panel.querySelector("output");
      const startButton = panel.querySelector(".eng-timer-start");
      const resetButton = panel.querySelector(".eng-timer-reset");
      const paint = () => {
        output.textContent = String(Math.floor(remaining / 60)).padStart(2, "0") +
          ":" + String(remaining % 60).padStart(2, "0");
      };

      startButton.addEventListener("click", () => {
        if (interval) {
          clearInterval(interval);
          interval = null;
          startButton.textContent = "Resume";
          return;
        }
        if (remaining <= 0) remaining = minutes * 60;
        startButton.textContent = "Pause";
        interval = setInterval(() => {
          remaining = Math.max(0, remaining - 1);
          paint();
          if (remaining === 0) {
            clearInterval(interval);
            interval = null;
            startButton.textContent = "Start again";
          }
        }, 1000);
      });

      resetButton.addEventListener("click", () => {
        clearInterval(interval);
        interval = null;
        remaining = minutes * 60;
        paint();
        startButton.textContent = "Start";
      });

      paint();
    });
  }

  function initAutosave() {
    const fields=[...document.querySelectorAll("#task1Draft,#task2Draft,#writingDraft")];
    fields.forEach(field=>{
      let status=field.parentElement.querySelector(".eng-autosave");
      if(!status){status=document.createElement("div");status.className="eng-autosave";field.insertAdjacentElement("afterend",status);}
      field.addEventListener("input",()=>{
        let key = "atlas-writing-draft";
        if (field.id === "task1Draft") {
          key = field.dataset.taskId
            ? "englisity-task1-" + field.dataset.taskId + "-draft"
            : "englisity-task1-draft";
        } else if (field.id === "task2Draft" && field.dataset.taskId) {
          key = "englisity-task2-" + field.dataset.taskId + "-draft";
        }
        localStorage.setItem(key, field.value);
        status.textContent = "Autosaved in this browser.";
      });
    });
  }

  window.addEventListener("englisity:quiz-passed", recordStreakActivity);

  document.addEventListener("DOMContentLoaded",()=>{
    addDashboard();scanBookmarks();addTimer();initAutosave();
    const observer=new MutationObserver(()=>scanBookmarks());
    observer.observe(document.body,{childList:true,subtree:true});
  });
})();