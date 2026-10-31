(() => {
  "use strict";
  const KEY = "englisity-progress-v1";
  const BOOKMARKS = "englisity-bookmarks-v1";
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const page = location.pathname.split("/").pop() || "index.html";
  const labels = { "index.html":"Home", "reading.html":"Reading", "listening.html":"Listening", "writing.html":"Writing", "speaking.html":"Speaking", "articles.html":"Articles", "podcasts.html":"Podcasts" };
  const progress = read(KEY, { visits:{}, completed:{}, minutes:0 });
  progress.visits[page] = (progress.visits[page] || 0) + 1;
  save(KEY, progress);

  const styles = document.createElement("style");
  styles.textContent = `
    .eng-progress{max-width:1160px;margin:18px auto;padding:18px 22px;background:#fff;border:1px solid #e5eaf3;border-radius:16px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
    .eng-progress strong{color:#14213d}.eng-progress small{display:block;color:#718096;margin-top:3px}
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
  if (nav) {
    const strip = document.createElement("section");
    strip.className = "eng-progress";
    strip.innerHTML = '<div><strong>My learning</strong><small>Progress is saved on this device.</small></div><div class="eng-progress-actions"><a href="' + (page === "index.html" ? "#myDashboard" : "../index.html#myDashboard") + '">Dashboard</a><button type="button" id="engMarkVisit">Mark this visit complete</button></div>';
    nav.insertAdjacentElement("afterend", strip);
    strip.querySelector("#engMarkVisit").addEventListener("click", () => {
      const current = read(KEY, {visits:{},completed:{},minutes:0});
      current.completed[page] = (current.completed[page] || 0) + 1;
      save(KEY,current);
      strip.querySelector("small").textContent = "Visit recorded on this device.";
      renderDashboard();
    });
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

  function renderDashboard() {
    const target = document.getElementById("engDashboardContent");
    if (!target) return;
    const data = read(KEY,{visits:{},completed:{},minutes:0});
    const totalVisits = Object.values(data.visits || {}).reduce((a,b)=>a+b,0);
    const totalCompleted = Object.values(data.completed || {}).reduce((a,b)=>a+b,0);
    const saved = read(BOOKMARKS,[]);
    target.innerHTML = '<div class="eng-dashboard-grid"><div class="eng-stat"><b>'+totalVisits+'</b><span>Page visits</span></div><div class="eng-stat"><b>'+totalCompleted+'</b><span>Visits marked complete</span></div><div class="eng-stat"><b>'+saved.length+'</b><span>Saved resources</span></div><div class="eng-bookmarks"><strong>Saved resources</strong><div class="eng-bookmark-list">'+(saved.length?saved.map(x=>'<a href="'+String(x.url).replace(/&/g,"&amp;").replace(/"/g,"&quot;")+'">'+String(x.title).replace(/&/g,"&amp;").replace(/</g,"&lt;")+'</a>').join(""):'<p>You have not saved any resources yet. Use “Save resource” on an existing resource.</p>')+'</div></div></div>';
  }

  function addDashboard() {
    if (page !== "index.html" || document.getElementById("myDashboard")) return;
    const hero = document.querySelector(".home-hero");
    if (!hero) return;
    const section = document.createElement("section");
    section.className = "eng-dashboard";
    section.id = "myDashboard";
    section.innerHTML = '<div class="home-section-heading"><span>YOUR ACTIVITY</span><h2>My learning dashboard</h2><p>A simple overview of your activity on this device.</p></div><div id="engDashboardContent"></div>';
    hero.insertAdjacentElement("afterend",section);
    renderDashboard();
  }

  function addTimer() {
    const editor = document.querySelector("#task1Draft, #task2Draft, #writingDraft");
    if (!editor || document.querySelector(".eng-timer")) return;
    const panel = document.createElement("div");
    panel.className = "eng-timer";
    panel.innerHTML = '<strong>Writing timer</strong><output id="engTimerDisplay">40:00</output><button type="button" id="engTimerStart">Start</button><button type="button" id="engTimerReset">Reset</button><span class="helper">Optional practice timer. It does not affect your draft.</span>';
    editor.insertAdjacentElement("beforebegin",panel);
    let remaining=2400, interval=null;
    const output=panel.querySelector("output");
    const paint=()=>output.textContent=String(Math.floor(remaining/60)).padStart(2,"0")+":"+String(remaining%60).padStart(2,"0");
    panel.querySelector("#engTimerStart").addEventListener("click",()=>{
      if(interval){clearInterval(interval);interval=null;panel.querySelector("#engTimerStart").textContent="Resume";return;}
      panel.querySelector("#engTimerStart").textContent="Pause";
      interval=setInterval(()=>{remaining=Math.max(0,remaining-1);paint();if(!remaining){clearInterval(interval);interval=null;panel.querySelector("#engTimerStart").textContent="Start again";}},1000);
    });
    panel.querySelector("#engTimerReset").addEventListener("click",()=>{clearInterval(interval);interval=null;remaining=2400;paint();panel.querySelector("#engTimerStart").textContent="Start";});
    paint();
  }

  function initAutosave() {
    const fields=[...document.querySelectorAll("#task1Draft,#task2Draft,#writingDraft")];
    fields.forEach(field=>{
      let status=field.parentElement.querySelector(".eng-autosave");
      if(!status){status=document.createElement("div");status.className="eng-autosave";field.insertAdjacentElement("afterend",status);}
      field.addEventListener("input",()=>{
        const key=field.id==="task1Draft"?"englisity-task1-draft":field.id==="task2Draft"?null:"atlas-writing-draft";
        if(key){localStorage.setItem(key,field.value);status.textContent="Autosaved in this browser.";}
        else {
          const active=document.getElementById("task2TaskTitle")?.textContent || "";
          const id=active==="Museums and historical sites"?"museum":active==="Living with climate change"?"climate":active==="Research into family history"?"family":null;
          if(id){localStorage.setItem("englisity-task2-"+id+"-draft",field.value);status.textContent="Autosaved in this browser.";}
        }
      });
    });
  }

  function trackActivities() {
    document.querySelectorAll("audio").forEach(audio=>audio.addEventListener("ended",()=>{
      const data=read(KEY,{visits:{},completed:{},minutes:0});
      data.completed["listening-audio"]=(data.completed["listening-audio"]||0)+1;save(KEY,data);
    }));
    document.querySelectorAll(".recording-playback audio").forEach(audio=>audio.addEventListener("ended",()=>{
      const data=read(KEY,{visits:{},completed:{},minutes:0});
      data.completed["speaking-recordings"]=(data.completed["speaking-recordings"]||0)+1;save(KEY,data);
    }));
  }

  document.addEventListener("DOMContentLoaded",()=>{
    addDashboard();scanBookmarks();addTimer();initAutosave();trackActivities();
    const observer=new MutationObserver(()=>scanBookmarks());
    observer.observe(document.body,{childList:true,subtree:true});
  });
})();