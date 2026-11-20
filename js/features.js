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
  if (nav && !document.body.classList.contains("passage-test-page") && !/^listening-test-/.test(page) && page.replace(/\.html$/, "") !== "stats") {
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

  // Site footer on every page (like a normal website footer): practice links, learning links,
  // About / Share questions / Report a problem, and contact. Hidden inside full tests so students are not distracted.
  const ICON={
    home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    book:'<path d="M2 5.5C4.5 4 8 4 12 6c4-2 7.5-2 10-.5V19c-2.5-1.5-6-1.5-10 .5-4-2-7.5-2-10-.5z"/><path d="M12 6v13.5"/>',
    headphones:'<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/>',
    pen:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8"/>',
    cards:'<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',
    news:'<path d="M4 4h13v16H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2M8 8h5M8 12h5M8 16h3"/>',
    podcast:'<circle cx="12" cy="11" r="3"/><path d="M12 14v7M6.3 16.5a8 8 0 1 1 11.4 0"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    share:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v6M9 10h6"/>',
    flag:'<path d="M4 21V4M4 4h12l-2 4 2 4H4"/>',
    send:'<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'
  };
  const icon=n=>'<svg class="sf-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+ICON[n]+'</svg>';
  function addSiteFooter(){
    if(document.querySelector(".site-footer"))return;
    const inTest=!!document.querySelector("#resizableTest, #testArea, .test-main");
    if(inTest)return;
    const inSub=/\/(pages|articles)\//.test(location.pathname);
    const root=inSub?"../":"";
    const pg=root+"pages/";
    const title=(document.title||"").replace(/\s*[—|-]\s*Englisity.*$/i,"").trim()||"This page";
    const reportHref=()=>pg+"share.html?type=report&page="+encodeURIComponent(title+" ("+location.pathname+location.hash+")");
    const link=(href,ic,text,ext)=>'<a href="'+href+'"'+(ext?' target="_blank" rel="noopener"':'')+'>'+icon(ic)+'<span>'+text+'</span></a>';
    const col=(h,items)=>'<div class="sf-col"><h2>'+h+'</h2>'+items.join("")+'</div>';
    const f=document.createElement("footer");
    f.className="site-footer";
    f.innerHTML='<div class="sf-inner"><div class="sf-grid">'+
      col("Practice",[link(root+"index.html","home","Home"),link(pg+"reading.html","book","Reading"),link(pg+"listening.html","headphones","Listening"),link(pg+"writing.html","pen","Writing"),link(pg+"speaking.html","mic","Speaking")])+
      col("Learn",[link(pg+"vocabulary.html","cards","Vocabulary"),link(pg+"articles.html","news","Articles"),link(pg+"podcasts.html","podcast","Podcasts"),link(root+"index.html#myDashboard","chart","My progress")])+
      col("Englisity",[link(pg+"about.html","info","About Englisity"),link(pg+"share.html","share","Share your exam questions"),'<a href="'+reportHref()+'" data-report-link>'+icon("flag")+'<span>Report a problem</span></a>'])+
      col("Connect",[link("https://t.me/TokhirovEnglisity","send","Telegram channel",true),link("mailto:tokhirovs112@gmail.com","mail","Contact us")])+
      '</div><div class="sf-bottom"><a class="sf-brand" href="'+root+'index.html"><img src="'+root+'assets/englisity-mark.svg?v=20261117-logo" alt="" width="28" height="28"><span>Englisity</span></a><span class="sf-copy">© '+new Date().getFullYear()+' Englisity · Free IELTS practice</span></div></div>';
    f.querySelector("[data-report-link]").addEventListener("click",e=>{e.currentTarget.href=reportHref();});
    document.querySelectorAll("footer.footer, footer.home-footer, .eng-site-links").forEach(el=>el.remove());
    const scripts=document.body.querySelector(":scope > script");
    document.body.insertBefore(f,scripts||null);
  }
  const footerStyles=document.createElement("style");
  footerStyles.textContent=".site-footer{margin-top:48px;background:#e6ede8;border-top:1px solid #d5e0d9;color:#203b31;font-size:15px}.sf-inner{max-width:1180px;margin:0 auto;padding:44px 24px 26px}.sf-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px}.sf-col h2{font-size:16px;font-weight:700;margin:0 0 14px;color:#183b34;letter-spacing:0}.sf-col a{display:flex;align-items:center;gap:10px;padding:7px 0;color:#2b4a3f;text-decoration:none;line-height:1.3}.sf-col a:hover{color:#1f6b55}.sf-col a:hover span{text-decoration:underline}.sf-icon{width:17px;height:17px;flex:none;color:#3d6656}.sf-bottom{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-top:32px;padding-top:22px;border-top:1px solid #d1ddd5}.sf-brand{display:flex;align-items:center;gap:10px;color:#183b34;font-weight:700;font-size:17px;text-decoration:none}.sf-brand img{border-radius:7px}.sf-copy{color:#4d6359;font-size:14px}html[data-theme=\"dark\"] .site-footer{background:#14211d;border-color:#22332d;color:#d6e3dc}html[data-theme=\"dark\"] .sf-col h2,html[data-theme=\"dark\"] .sf-brand{color:#eef5f1}html[data-theme=\"dark\"] .sf-col a{color:#c3d4cb}html[data-theme=\"dark\"] .sf-icon{color:#8fc2ab}html[data-theme=\"dark\"] .sf-bottom{border-color:#22332d}html[data-theme=\"dark\"] .sf-copy{color:#9fb5aa}@media(max-width:820px){.sf-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 18px}.sf-inner{padding:34px 20px 22px}}@media(max-width:380px){.sf-grid{grid-template-columns:1fr}}@media print{.site-footer{display:none}}";
  document.head.appendChild(footerStyles);

  // "Spot a mistake? Report it" next to test and quiz results, with this page filled in.
  const REPORT_TARGETS=[
    ["#testResult","inside"],
    ["#results > h2","after"],
    ["#articleLearning .al-score","after"],
    ["#quizArea .vocab-result > h3","after"]
  ];
  function addResultReportLinks(){
    if(page.replace(/\.html$/,"")==="share")return;
    const inSub=/\/(pages|articles)\//.test(location.pathname);
    const base=inSub?"../pages/":"pages/";
    REPORT_TARGETS.forEach(([selector,where])=>{
      document.querySelectorAll(selector).forEach(el=>{
        if(!el.textContent.trim()||el.hidden)return;
        const holder=where==="inside"?el:el.parentElement;
        if(holder.querySelector(":scope > .eng-report-inline"))return;
        const title=(document.title||"").replace(/\s*[—|-]\s*Englisity.*$/i,"").trim()||"This page";
        const a=document.createElement("a");
        a.className="eng-report-inline";
        a.href=base+"share.html?type=report&kind="+encodeURIComponent("Wrong answer in a test")+"&page="+encodeURIComponent(title+" ("+location.pathname+location.hash+")");
        a.textContent="Spot a mistake? Report it";
        if(where==="inside"){holder.appendChild(document.createElement("br"));holder.appendChild(a);}
        else el.insertAdjacentElement("afterend",a);
      });
    });
  }
  let reportLinkTimer=null;


  // ---- Private usage statistics (no cookies, no names; owner-only stats page) ----
  // Sends small anonymous events to /api/track on the live site only. Respects "Do Not Track".
  const NOOP={add(){},start(){},finish(){},view(){}};
  const Track=(()=>{try{
    if(typeof navigator==="undefined"||typeof crypto==="undefined"||!crypto.getRandomValues)return NOOP;
    let debug=false;try{debug=localStorage.getItem("englisity-track-debug")==="1";}catch(e){}
    const live=debug||(location.protocol==="https:"&&!/^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname));
    const dnt=navigator.doNotTrack==="1"||window.doNotTrack==="1";
    const slug=page.replace(/\.html$/,"");
    const inArticle=/\/articles\//.test(location.pathname);
    const SECTION_OF={index:"home",reading:"reading","passage-1":"reading","passage-2":"reading","passage-3":"reading","full-tests":"reading",listening:"listening",writing:"writing",speaking:"speaking",vocabulary:"vocabulary",articles:"articles",podcasts:"podcasts",about:"about",share:"share",stats:"stats"};
    const section=inArticle?"articles":SECTION_OF[slug]||(document.getElementById("resizableTest")?"reading":/^listening-test/.test(slug)?"listening":"other");
    const enabled=live&&!dnt&&section!=="stats";
    const rid=()=>Array.from(crypto.getRandomValues(new Uint8Array(12)),b=>(b%36).toString(36)).join("");
    let vid="",sid="";
    try{vid=localStorage.getItem("englisity-vid")||"";if(!/^[a-z0-9]{8,40}$/.test(vid)){vid=rid();localStorage.setItem("englisity-vid",vid);}}catch(e){vid=rid();}
    try{sid=sessionStorage.getItem("englisity-sid")||"";if(!/^[a-z0-9]{8,40}$/.test(sid)){sid=rid();sessionStorage.setItem("englisity-sid",sid);}}catch(e){sid=rid();}
    const queue=[];
    const testName=(document.title||"").replace(/\s*[—|-]\s*(IELTS Reading|IELTS Listening)?\s*\|?\s*Englisity.*$/i,"").replace(/\s*[—|]\s*IELTS Reading$/i,"").trim();
    function flush(useBeacon){
      if(!enabled||!queue.length)return;
      const body=JSON.stringify({vid,sid,events:queue.splice(0,25)});
      const url="/api/track";
      if(useBeacon&&navigator.sendBeacon){navigator.sendBeacon(url,new Blob([body],{type:"application/json"}));}
      else{fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body,keepalive:true}).catch(()=>{});}
      if(queue.length)flush(useBeacon);
    }
    function add(type,extra){if(!enabled)return;queue.push(Object.assign({type,section,path:location.pathname.slice(0,120)},extra||{}));if(queue.length>=10)flush(false);}
    // Active time: counted in 15-second steps while the page is visible and the student is
    // reading, scrolling, typing or listening (audio playing). Idle open tabs are not counted.
    let lastInput=Date.now(),activeSecs=0;
    ["pointerdown","keydown","scroll","touchstart","wheel","input"].forEach(ev=>addEventListener(ev,()=>{lastInput=Date.now();},{passive:true,capture:true}));
    setInterval(()=>{
      if(document.visibilityState!=="visible")return;
      const playing=[...document.querySelectorAll("audio,video")].some(a=>!a.paused&&!a.ended);
      if(playing||Date.now()-lastInput<60000){activeSecs+=15;if(activeSecs>=60){add("active",{seconds:activeSecs});activeSecs=0;}}
    },15000);
    const leave=()=>{if(activeSecs){add("active",{seconds:activeSecs});activeSecs=0;}flush(true);};
    addEventListener("pagehide",leave);
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")leave();});
    setInterval(()=>flush(false),60000);
    return {
      add,
      start(){add("start",{item:(section==="listening"?"Listening: ":section==="articles"?"Article quiz: ":"Reading: ")+testName});},
      finish(score,total,name){add("finish",{item:name||((section==="listening"?"Listening: ":section==="articles"?"Article quiz: ":"Reading: ")+testName),score,total});},
      view(){add("view",{ref:document.referrer||""});}
    };
  }catch(e){return NOOP;}})();
  window.EnglisityTrack=Track;
  function initTracking(){
    Track.view();
    // Test started: mode buttons on reading/listening tests and the article quiz button.
    document.addEventListener("click",e=>{
      const b=e.target.closest("#practiceModeButton,#examModeButton,#practice,#exam,#finishedReadingBtn");
      if(b)Track.start();
      const sq=e.target.closest("#questionList .question-item button");
      if(sq&&/speaking/.test(page)){const q=sq.closest(".question-item").querySelector(".question-text");if(q)Track.add("open",{item:q.textContent.trim().slice(0,160)});}
      const vs=e.target.closest("#startAllStudy,#startDueStudy,#startSavedStudy,#practiseShown");
      if(vs)Track.add("start",{item:"Vocabulary flashcards"});
    },true);
    // Writing task opened (via #task1/… or #task2/… links).
    const openWriting=()=>{const m=location.hash.match(/^#(task[12])\/([\w-]+)/);if(!m||!/writing/.test(page))return;setTimeout(()=>{const t=document.getElementById(m[1]+"TaskTitle");const name=(t&&t.textContent.trim())||m[2];Track.add("open",{item:(m[1]==="task1"?"Task 1: ":"Task 2: ")+name});},400);};
    addEventListener("hashchange",openWriting);openWriting();
    // Test finished: read the score when the result appears (once per result).
    const seen=new Set();
    const check=()=>{
      [["#testResult",/(\d+)\s*\/\s*(\d+)/],["#results > h2",/(\d+)\s*\/\s*(\d+)/],[".al-complete",/(\d+)\s*\/\s*(\d+)/]].forEach(([sel,re])=>{
        const el=document.querySelector(sel);if(!el||el.hidden||!el.offsetParent)return;
        const m=el.textContent.match(re);if(!m)return;const key=sel+"|"+m[0]+"|"+el.textContent.length;
        if(seen.has(key))return;seen.add(key);Track.finish(+m[1],+m[2]);
      });
      const vq=document.querySelector("#quizArea .vocab-result > h3");
      if(vq&&!seen.has("vq|"+vq.textContent)){const m=vq.textContent.match(/(\d+)\s*\/\s*(\d+)/);if(m){seen.add("vq|"+vq.textContent);Track.finish(+m[1],+m[2],"Vocabulary quiz");}}
    };
    let t=null;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(check,300);}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden"]});
  }
  document.addEventListener("DOMContentLoaded",()=>{
    try{initTracking();}catch(e){}
    addSiteFooter();
    new MutationObserver(()=>{clearTimeout(reportLinkTimer);reportLinkTimer=setTimeout(addResultReportLinks,150);}).observe(document.body,{childList:true,subtree:true});
    addDashboard();scanBookmarks();addTimer();initAutosave();
    const observer=new MutationObserver(()=>scanBookmarks());
    observer.observe(document.body,{childList:true,subtree:true});
  });
})();