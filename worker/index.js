// Englisity Worker: serves the static site and receives form messages.
// POST /api/submit → forwards to Telegram (secrets: TELEGRAM_BOT_TOKEN,
// TELEGRAM_CHAT_ID). Everything else is served from the static files.

const LIMITS = { text: 4000, testDate: 20, location: 80, module: 30, section: 40, page: 300, kind: 60, question: 40, name: 60, contact: 100, from: 300 };
const LABELS = { testDate: "Test date", location: "Location", module: "Test type", section: "Part", page: "Page", kind: "Problem", question: "Question", name: "Name", contact: "Contact" };

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
});
const escapeHtml = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

async function handleSubmit(request, env) {
  if (request.method !== "POST") return json({ error: "method-not-allowed" }, 405);

  // Only accept forms sent from this site.
  const origin = request.headers.get("Origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: "forbidden" }, 403);

  let data;
  try {
    const raw = await request.text();
    if (raw.length > 20000) return json({ error: "too-large" }, 413);
    data = JSON.parse(raw);
  } catch (e) {
    return json({ error: "bad-request" }, 400);
  }
  if (!data || typeof data !== "object") return json({ error: "bad-request" }, 400);

  // Spam checks: hidden field filled in, or sent faster than a person could type.
  // Pretend success so bots learn nothing.
  if (data.website || Number(data.elapsed) < 3000) return json({ ok: true });

  const type = data.type === "report" ? "report" : data.type === "questions" ? "questions" : null;
  if (!type) return json({ error: "bad-type" }, 400);

  const clean = {};
  for (const [key, max] of Object.entries(LIMITS)) {
    clean[key] = String(data[key] ?? "").replace(/\u0000/g, "").trim().slice(0, max);
  }
  if (clean.text.length < 10) return json({ error: "too-short" }, 400);

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    const missing = ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"].filter(k => !env[k]).join(", ");
    return json({ error: "not-configured", detail: "Missing setting: " + missing }, 503);
  }

  const title = type === "report" ? "⚑ <b>Problem report</b>" : "✎ <b>New exam questions</b>";
  const lines = [title];
  for (const [key, label] of Object.entries(LABELS)) {
    if (clean[key]) lines.push(`<b>${label}:</b> ${escapeHtml(clean[key])}`);
  }
  if (clean.from && clean.from !== clean.page) lines.push(`<b>Sent from:</b> ${escapeHtml(clean.from)}`);
  lines.push("", escapeHtml(clean.text));
  const country = request.cf && request.cf.country ? request.cf.country : "";
  if (country) lines.push("", `<i>Country (approx.): ${escapeHtml(country)}</i>`);
  let message = lines.join("\n");
  if (message.length > 4000) message = message.slice(0, 3990) + "…";

  const api = (env.TELEGRAM_API || "https://api.telegram.org").replace(/\/$/, "");
  try {
    const res = await fetch(`${api}/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: message, parse_mode: "HTML", disable_web_page_preview: true })
    });
    if (!res.ok) {
      // Pass on Telegram's reason (e.g. "chat not found", "Unauthorized") so problems are easy to fix.
      const info = await res.json().catch(() => ({}));
      return json({ error: "delivery-failed", detail: String(info.description || "Telegram HTTP " + res.status).slice(0, 200) }, 502);
    }
  } catch (e) {
    return json({ error: "delivery-failed", detail: "Could not reach Telegram" }, 502);
  }
  return json({ ok: true });
}

// Audio needs HTTP Range support: players request parts of the file to seek,
// and Safari on iPhone will not play audio without it. Static assets return
// whole files only, so the Worker serves the requested byte range itself.
async function serveAudio(request, env) {
  if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
  let asset = await env.ASSETS.fetch(new Request(request.url, { method: "GET" }));
  if (!asset.ok || !asset.body) return asset;
  let size = Number(asset.headers.get("Content-Length"));
  if (!size) {
    // Size not given: read the file once so we know its length (files are ~11 MB).
    const buffer = await asset.arrayBuffer();
    size = buffer.byteLength;
    asset = new Response(buffer, asset);
  }

  const headers = new Headers();
  headers.set("Content-Type", asset.headers.get("Content-Type") || "audio/mpeg");
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=86400");
  const etag = asset.headers.get("ETag");
  if (etag) headers.set("ETag", etag);

  const range = request.headers.get("Range");
  const match = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!match || (!match[1] && !match[2])) {
    headers.set("Content-Length", String(size));
    if (request.method === "HEAD") { asset.body.cancel(); return new Response(null, { status: 200, headers }); }
    return new Response(asset.body, { status: 200, headers });
  }

  let start, end;
  if (match[1] === "") { start = Math.max(0, size - Number(match[2])); end = size - 1; }      // bytes=-500
  else { start = Number(match[1]); end = match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1); }
  if (!(start <= end) || start >= size) {
    asset.body.cancel();
    headers.set("Content-Range", `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }
  const length = end - start + 1;
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(length));
  if (request.method === "HEAD") { asset.body.cancel(); return new Response(null, { status: 206, headers }); }

  // Stream only the requested bytes; stop reading once the range is complete.
  const reader = asset.body.getReader();
  let position = 0;
  const sliced = new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { controller.close(); return; }
        const chunkStart = position;
        position += value.byteLength;
        if (position <= start) continue;
        const from = Math.max(start - chunkStart, 0);
        const to = Math.min(end + 1 - chunkStart, value.byteLength);
        controller.enqueue(value.subarray(from, to));
        if (position > end) { controller.close(); reader.cancel().catch(() => {}); }
        return;
      }
    },
    cancel() { reader.cancel().catch(() => {}); }
  });
  const body = typeof FixedLengthStream === "function" ? sliced.pipeThrough(new FixedLengthStream(length)) : sliced;
  return new Response(body, { status: 206, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/submit") return handleSubmit(request, env);
    if (url.pathname.startsWith("/assets/audio/")) return serveAudio(request, env);
    return env.ASSETS.fetch(request);
  }
};
