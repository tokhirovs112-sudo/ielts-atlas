// Private, cookie-free usage statistics for Englisity.
// POST /api/track  ← small batches of anonymous events from the site (no names, no IP addresses stored).
// GET  /api/stats  → totals for the owner's stats page; needs the STATS_PASSWORD secret.
// Data lives in the D1 database bound as STATS.

const TYPES = new Set(["view", "active", "start", "finish", "open"]);
const ID = /^[a-z0-9]{8,40}$/;
const SECTIONS = new Set(["home", "reading", "listening", "writing", "speaking", "vocabulary", "articles", "podcasts", "about", "share", "stats", "other"]);

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
});
const clip = (v, n) => (v == null ? null : String(v).slice(0, n));
const int = (v, lo, hi) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : null; };
// Days follow Uzbekistan time (UTC+5), so "today" matches the owner's calendar.
const dayOf = ms => new Date(ms + 5 * 3600 * 1000).toISOString().slice(0, 10);

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, day TEXT NOT NULL, vid TEXT NOT NULL, sid TEXT, type TEXT NOT NULL, section TEXT, path TEXT, item TEXT, score INTEGER, total INTEGER, seconds INTEGER, device TEXT, country TEXT, referrer TEXT, detail TEXT)",
  "CREATE INDEX IF NOT EXISTS idx_events_day ON events(day)",
  "CREATE INDEX IF NOT EXISTS idx_events_type_day ON events(type, day)",
  "CREATE INDEX IF NOT EXISTS idx_events_vid ON events(vid)"
];
let schemaReady = false;
async function ensureSchema(db) {
  if (schemaReady) return;
  await db.batch(SCHEMA.map(s => db.prepare(s)));
  try { await db.prepare("ALTER TABLE events ADD COLUMN detail TEXT").run(); } catch { /* already there */ }
  schemaReady = true;
}

function deviceOf(ua) {
  ua = ua || "";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|Android/i.test(ua)) return "phone";
  return "computer";
}

function referrerHost(ref, selfHost) {
  try {
    const h = new URL(ref).hostname.replace(/^www\./, "");
    if (!h || h === selfHost) return null;
    if (/(^|\.)t\.me$|telegram/.test(h)) return "Telegram";
    if (/instagram/.test(h)) return "Instagram";
    if (/google\./.test(h)) return "Google";
    if (/linkedin|lnkd\.in/.test(h)) return "LinkedIn";
    if (/facebook|fb\.com/.test(h)) return "Facebook";
    if (/youtube/.test(h)) return "YouTube";
    return h.slice(0, 60);
  } catch { return null; }
}

export async function handleTrack(request, env) {
  if (request.method !== "POST") return json({ error: "method" }, 405);
  const host = new URL(request.url).host;
  const origin = request.headers.get("Origin");
  if (origin && new URL(origin).host !== host) return json({ error: "forbidden" }, 403);
  if (!env.STATS) return new Response(null, { status: 204 });
  const raw = await request.text();
  if (raw.length > 8000) return json({ error: "too-large" }, 413);
  let data;
  try { data = JSON.parse(raw); } catch { return json({ error: "bad-json" }, 400); }
  const vid = String(data.vid || ""), sid = String(data.sid || "");
  if (!ID.test(vid) || (sid && !ID.test(sid))) return json({ error: "bad-id" }, 400);
  const events = Array.isArray(data.events) ? data.events.slice(0, 25) : [];
  const now = Date.now(), day = dayOf(now);
  const device = deviceOf(request.headers.get("User-Agent"));
  const country = clip(request.cf?.country, 2);
  const selfHost = host.split(":")[0];
  const rows = [];
  for (const e of events) {
    if (!e || !TYPES.has(e.type)) continue;
    const section = SECTIONS.has(e.section) ? e.section : "other";
    rows.push([now, day, vid, sid || null, e.type, section, clip(e.path, 120), clip(e.item, 160),
      e.type === "finish" ? int(e.score, 0, 1000) : null, e.type === "finish" ? int(e.total, 1, 1000) : null,
      e.type === "active" ? int(e.seconds, 1, 120) : null, device, country,
      e.type === "view" && e.ref ? referrerHost(e.ref, selfHost) : null,
      e.type === "finish" && typeof e.wrong === "string" && /^[0-9,]{0,200}$/.test(e.wrong) ? e.wrong : null]);
  }
  if (!rows.length) return new Response(null, { status: 204 });
  try {
    await ensureSchema(env.STATS);
    const stmt = env.STATS.prepare("INSERT INTO events (ts, day, vid, sid, type, section, path, item, score, total, seconds, device, country, referrer, detail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    const batch = rows.map(r => stmt.bind(...r));
    // Keep the database small: drop events older than about 13 months now and then.
    if (Math.random() < 0.01) batch.push(env.STATS.prepare("DELETE FROM events WHERE ts < ?").bind(now - 400 * 86400 * 1000));
    await env.STATS.batch(batch);
  } catch (err) {
    return json({ error: "store-failed", detail: String(err?.message || err).slice(0, 200) }, 500);
  }
  return new Response(null, { status: 204 });
}

function samePassword(a, b) {
  a = String(a || ""); b = String(b || "");
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function handleStats(request, env) {
  if (request.method !== "GET") return json({ error: "method" }, 405);
  if (!env.STATS_PASSWORD) return json({ error: "not-configured", configured: false, detail: "Add a secret called STATS_PASSWORD in Cloudflare (Worker → Settings → Variables and Secrets)." }, 503);
  if (!env.STATS) return json({ error: "not-configured", detail: "The STATS database is not connected to the Worker." }, 503);
  const given = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!given) return json({ error: "password-needed", configured: true }, 401);
  if (!samePassword(given, env.STATS_PASSWORD)) {
    await new Promise(r => setTimeout(r, 400)); // slow down password guessing
    return json({ error: "wrong-password" }, 401);
  }
  const url = new URL(request.url);
  const days = int(url.searchParams.get("days"), 1, 365) || 30;
  // The owner's own device can be left out, so testing the site does not hide what students do.
  const exclude = ID.test(url.searchParams.get("exclude") || "") ? url.searchParams.get("exclude") : "";
  const now = Date.now(), today = dayOf(now);
  const from = dayOf(now - (days - 1) * 86400 * 1000);
  const db = env.STATS;
  await ensureSchema(db);
  const q = (sql, ...args) => db.prepare(sql).bind(...args);
  const range = "day >= ?1 AND vid IS NOT ?2";
  const [totals, todayRow, weekRow, returning, perDay, sections, starts, finishes, opens, pages, devices, countries, referrers, newVisitors, liveNow, details, flow] = await db.batch([
    q(`SELECT COUNT(DISTINCT vid) AS visitors, COUNT(DISTINCT sid) AS sessions, SUM(type='view') AS views, COALESCE(SUM(seconds),0) AS seconds FROM events WHERE ${range}`, from, exclude),
    q("SELECT COUNT(DISTINCT vid) AS visitors, COALESCE(SUM(seconds),0) AS seconds FROM events WHERE day = ?1 AND vid IS NOT ?2", today, exclude),
    q("SELECT COUNT(DISTINCT vid) AS visitors FROM events WHERE day >= ?1 AND vid IS NOT ?2", dayOf(now - 6 * 86400 * 1000), exclude),
    q(`SELECT COUNT(*) AS n FROM (SELECT vid FROM events WHERE ${range} GROUP BY vid HAVING COUNT(DISTINCT day) > 1)`, from, exclude),
    q(`SELECT day, COUNT(DISTINCT vid) AS visitors, SUM(type='view') AS views, COALESCE(SUM(seconds),0) AS seconds FROM events WHERE ${range} GROUP BY day ORDER BY day`, from, exclude),
    q(`SELECT section, COUNT(DISTINCT vid) AS visitors, SUM(type='view') AS views, COALESCE(SUM(seconds),0) AS seconds FROM events WHERE ${range} GROUP BY section ORDER BY seconds DESC`, from, exclude),
    q(`SELECT item, COUNT(*) AS started, COUNT(DISTINCT vid) AS people FROM events WHERE type='start' AND ${range} GROUP BY item ORDER BY started DESC LIMIT 40`, from, exclude),
    q(`SELECT item, COUNT(*) AS finished, ROUND(AVG(score),1) AS avg_score, MAX(total) AS total FROM events WHERE type='finish' AND ${range} GROUP BY item ORDER BY finished DESC LIMIT 40`, from, exclude),
    q(`SELECT section, item, COUNT(*) AS opens, COUNT(DISTINCT vid) AS people FROM events WHERE type='open' AND ${range} GROUP BY section, item ORDER BY opens DESC LIMIT 30`, from, exclude),
    q(`SELECT path, COUNT(*) AS views, COUNT(DISTINCT vid) AS people FROM events WHERE type='view' AND ${range} GROUP BY path ORDER BY views DESC LIMIT 25`, from, exclude),
    q(`SELECT device, COUNT(DISTINCT vid) AS visitors FROM events WHERE ${range} GROUP BY device ORDER BY visitors DESC`, from, exclude),
    q(`SELECT country, COUNT(DISTINCT vid) AS visitors FROM events WHERE ${range} AND country IS NOT NULL GROUP BY country ORDER BY visitors DESC LIMIT 15`, from, exclude),
    q(`SELECT referrer, COUNT(DISTINCT vid) AS visitors FROM events WHERE ${range} AND referrer IS NOT NULL GROUP BY referrer ORDER BY visitors DESC LIMIT 15`, from, exclude),
    q(`SELECT COUNT(*) AS n FROM (SELECT vid, MIN(day) AS first FROM events WHERE vid IS NOT ?2 GROUP BY vid HAVING first >= ?1)`, from, exclude),
    q("SELECT COUNT(DISTINCT vid) AS n FROM events WHERE ts >= ?1 AND vid IS NOT ?2", now - 5 * 60 * 1000, exclude),
    q(`SELECT item, total, detail FROM events WHERE type='finish' AND detail IS NOT NULL AND ${range} ORDER BY ts DESC LIMIT 3000`, from, exclude),
    // Page-by-page flow of each visit, to see where visitors leave and how fast.
    q(`SELECT sid, path, type, seconds FROM events WHERE ${range} AND sid IS NOT NULL AND type IN ('view','active') ORDER BY sid, ts, id LIMIT 20000`, from, exclude)
  ]);
  const one = r => (r.results && r.results[0]) || {};
  const finishMap = Object.fromEntries((finishes.results || []).map(r => [r.item, r]));
  const tests = (starts.results || []).map(r => ({ item: r.item, started: r.started, people: r.people, finished: finishMap[r.item]?.finished || 0, avg_score: finishMap[r.item]?.avg_score ?? null, total: finishMap[r.item]?.total ?? null }));
  (finishes.results || []).forEach(r => { if (!tests.some(t => t.item === r.item)) tests.push({ item: r.item, started: 0, people: 0, finished: r.finished, avg_score: r.avg_score, total: r.total }); });
  // Hardest questions: how often each question number was answered wrongly in finished tests.
  const perTest = {};
  for (const r of details.results || []) {
    const t = perTest[r.item] || (perTest[r.item] = { finishes: 0, wrong: {} });
    t.finishes++;
    for (const n of String(r.detail).split(",").filter(Boolean)) t.wrong[n] = (t.wrong[n] || 0) + 1;
  }
  const hardest = [];
  for (const [item, t] of Object.entries(perTest)) {
    for (const [n, w] of Object.entries(t.wrong)) hardest.push({ item, question: +n, wrong: w, finishes: t.finishes, rate: Math.round(100 * w / t.finishes) });
  }
  hardest.sort((a, b) => b.rate - a.rate || b.wrong - a.wrong);
  // Where visits end: the last page of each visit, and whether the visitor left it within 15 seconds.
  const exitMap = {};
  let visits = 0, quickBounces = 0;
  const closeVisit = v => {
    if (!v || !v.last) return;
    visits++;
    const e = exitMap[v.last] || (exitMap[v.last] = { path: v.last, views: 0, left: 0, quick: 0 });
    e.left++;
    if (v.lastSecs < 15) e.quick++;
    if (v.views === 1 && v.lastSecs < 15) quickBounces++;
  };
  let cur = null;
  for (const r of flow.results || []) {
    if (!cur || cur.sid !== r.sid) { closeVisit(cur); cur = { sid: r.sid, last: null, lastSecs: 0, views: 0 }; }
    if (r.type === "view") {
      cur.views++; cur.last = r.path; cur.lastSecs = 0;
      const e = exitMap[r.path] || (exitMap[r.path] = { path: r.path, views: 0, left: 0, quick: 0 });
      e.views++;
    } else if (r.type === "active" && r.path === cur.last) cur.lastSecs += r.seconds || 0;
  }
  closeVisit(cur);
  const exits = Object.values(exitMap).filter(e => e.left).sort((a, b) => b.quick - a.quick || b.left - a.left).slice(0, 25);
  return json({
    days, from, today, excluded: !!exclude, live_now: one(liveNow).n || 0,
    exits, visits, quick_bounces: quickBounces, hardest: hardest.filter(h => h.finishes >= 3).slice(0, 25),
    totals: one(totals), today_: one(todayRow), last7: one(weekRow),
    returning: one(returning).n || 0, new_visitors: one(newVisitors).n || 0,
    per_day: perDay.results || [], sections: sections.results || [], tests,
    opens: opens.results || [], pages: pages.results || [], devices: devices.results || [],
    countries: countries.results || [], referrers: referrers.results || []
  });
}
