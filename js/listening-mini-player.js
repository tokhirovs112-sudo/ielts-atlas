// Compact audio bar for listening tests: keeps the recording's time (and, in
// practice mode, pause / back 10s) visible while the learner scrolls questions.
(() => {
  "use strict";
  const audio = document.getElementById("audio");
  const panel = audio && audio.closest(".audio-panel");
  const testArea = document.getElementById("testArea");
  if (!audio || !panel || !testArea) return;

  const style = document.createElement("style");
  style.textContent = [
    ".mini-player{position:fixed;left:50%;top:calc(8px + env(safe-area-inset-top));transform:translateX(-50%);z-index:70;display:none;align-items:center;gap:8px;padding:6px 8px 6px 12px;border:1px solid #cfe0d4;border-radius:999px;background:#ffffffee;backdrop-filter:blur(6px);box-shadow:0 6px 20px rgba(20,50,40,.16);font-size:.88rem;color:#24463a;max-width:calc(100vw - 24px)}",
    ".mini-player.show{display:flex}",
    ".mini-player time{font-variant-numeric:tabular-nums;font-weight:700;white-space:nowrap}",
    ".mini-player .mini-bar{width:90px;height:5px;display:block;border-radius:5px;background:#dce9df;overflow:hidden}",
    ".mini-player .mini-bar i{display:block;height:100%;width:0;background:#2f7a5f}",
    ".mini-player button{flex:none;width:auto!important;min-width:40px!important;min-height:36px!important;height:36px!important;margin:0!important;border:0!important;border-radius:999px!important;background:#1f6b55!important;color:#fff!important;font:inherit!important;font-size:.85rem!important;font-weight:700!important;line-height:1!important;white-space:nowrap!important;cursor:pointer;padding:0 12px!important;box-shadow:none!important}",
    ".mini-player .mini-bar{flex:1 1 60px;min-width:40px}",
    ".mini-player button.alt{background:#eaf3ec!important;color:#24463a!important}",
    "html[data-theme=\"dark\"] .mini-player{background:#16271fee;border-color:#3d5a4b;color:#e6f2ea}",
    "html[data-theme=\"dark\"] .mini-player .mini-bar{background:#2c4438}",
    "html[data-theme=\"dark\"] .mini-player button.alt{background:#2c4438!important;color:#e6f2ea!important}",
    "@media print{.mini-player{display:none!important}}"
  ].join("");
  document.head.append(style);

  const bar = document.createElement("div");
  bar.className = "mini-player";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Recording controls");
  bar.innerHTML = '<button type="button" class="alt" data-act="back" aria-label="Back 10 seconds">↺ 10s</button>' +
    '<button type="button" data-act="play" aria-label="Play or pause">▶</button>' +
    '<span class="mini-bar" aria-hidden="true"><i></i></span><time>0:00 / 0:00</time>';
  document.body.append(bar);
  const playBtn = bar.querySelector('[data-act="play"]');
  const backBtn = bar.querySelector('[data-act="back"]');
  const fill = bar.querySelector(".mini-bar i");
  const timeEl = bar.querySelector("time");

  const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  // In exam mode the page hides the native controls; mirror that by showing time only.
  const practice = () => audio.controls !== false;

  function update() {
    const offscreen = panel.getBoundingClientRect().bottom < 0;
    const started = !testArea.hidden && (audio.currentTime > 0 || !audio.paused);
    bar.classList.toggle("show", offscreen && started);
    const ok = practice();
    playBtn.hidden = !ok; backBtn.hidden = !ok;
    playBtn.textContent = audio.paused ? "▶" : "❚❚";
    playBtn.setAttribute("aria-label", audio.paused ? "Play" : "Pause");
    const d = isFinite(audio.duration) ? audio.duration : 0;
    timeEl.textContent = fmt(audio.currentTime) + " / " + fmt(d);
    fill.style.width = d ? (audio.currentTime / d * 100) + "%" : "0";
  }
  playBtn.addEventListener("click", () => { if (!practice()) return; if (audio.paused) audio.play().catch(() => {}); else audio.pause(); });
  backBtn.addEventListener("click", () => { if (practice()) audio.currentTime = Math.max(0, audio.currentTime - 10); });
  ["timeupdate", "play", "pause", "ended", "loadedmetadata", "seeked"].forEach(t => audio.addEventListener(t, update));
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  update();
})();
