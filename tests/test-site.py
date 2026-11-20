#!/usr/bin/env python3
"""Englisity end-to-end tests.

Opens every page in a real browser (laptop and phone sizes) and uses each
feature the way a student would. Run from the repository root:

    pip install playwright && python -m playwright install chromium
    python tests/test-site.py            # all tests
    python tests/test-site.py reading    # only tests whose name contains "reading"

Exit code 0 means every check passed.
"""
import functools
import glob
import http.server
import json
import os
import re
import socketserver
import sys
import threading
import time
import traceback

from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

PAGES = ["index.html"] + sorted(glob.glob("pages/*.html")) + sorted(glob.glob("articles/*.html"))
READING_TESTS = ["beatrix-potter", "dolls", "halley-vi", "herding", "keeping-healthy-at-work", "life-on-mars", "power-from-the-sea", "redwoods"]
LISTENING_TESTS = ["listening-test-01", "listening-test-02", "listening-test-03", "listening-test-04"]
DESKTOP = {"viewport": {"width": 1366, "height": 900}}
IGNORED_CONSOLE = ("fonts.googleapis", "fonts.gstatic", "ERR_INTERNET_DISCONNECTED", "ERR_NAME_NOT_RESOLVED", "ERR_CONNECTION", "ERR_TUNNEL", "ERR_PROXY", "net::ERR_FAILED", "api.dictionaryapi.dev", "cloudflareinsights")


# ---------------------------------------------------------------- helpers ---
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def handle_one_request(self):
        try:
            super().handle_one_request()
        except (ConnectionResetError, BrokenPipeError):
            pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):  # the real site sends forms to the Worker; tests mock it instead
        self.send_response(404)
        self.end_headers()


def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    server = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(QuietHandler, directory=ROOT))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, "http://127.0.0.1:%d/" % server.server_address[1]


class Results:
    def __init__(self):
        self.failures, self.checks, self.current = [], 0, ""

    def check(self, ok, message):
        self.checks += 1
        if not ok:
            self.failures.append(f"[{self.current}] {message}")
        return ok


R = Results()
check = R.check


def watch(page):
    """Collect JavaScript errors, console errors and failed local requests."""
    problems = []
    page.on("pageerror", lambda e: problems.append("JS error: " + str(e)[:200]))
    page.on("console", lambda m: problems.append("Console error: " + m.text[:200]) if m.type == "error" and not any(x in m.text for x in IGNORED_CONSOLE) else None)
    page.on("response", lambda r: problems.append(f"HTTP {r.status}: {r.url}") if r.status >= 400 and r.url.startswith(BASE) else None)
    page.on("dialog", lambda d: d.accept())
    return problems


def open_page(ctx, path, wait=500):
    page = ctx.new_page()
    problems = watch(page)
    page.goto(BASE + path, wait_until="load")
    page.wait_for_timeout(wait)
    return page, problems


def no_problems(problems, where):
    check(not problems, f"{where}: " + "; ".join(problems[:4]))
    problems.clear()


def choose_practice_mode(page):
    for sel in ("#practiceModeButton", "#practice"):
        if page.query_selector(sel) and page.is_visible(sel):
            page.click(sel)
            page.wait_for_timeout(300)
            return


# ------------------------------------------------------------------ tests ---
def test_every_page_laptop_and_phone(browser, pw):
    """Every page loads without errors, broken images or sideways scrolling."""
    phone = {k: v for k, v in pw.devices["iPhone 13"].items() if k != "default_browser_type"}
    android = {k: v for k, v in pw.devices["Galaxy S8"].items() if k != "default_browser_type"}
    for label, args in (("laptop", DESKTOP), ("iPhone", phone), ("Android", android)):
        ctx = browser.new_context(**args, service_workers="block")
        for path in PAGES:
            page, problems = open_page(ctx, path)
            info = page.evaluate("""() => {
              const W = document.documentElement.clientWidth;
              const ids = {}; document.querySelectorAll('[id]').forEach(e => ids[e.id] = (ids[e.id] || 0) + 1);
              return {
                overflow: document.documentElement.scrollWidth - W,
                broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map(i => i.getAttribute('src')),
                noAlt: [...document.images].filter(i => !i.hasAttribute('alt')).length,
                dupIds: Object.keys(ids).filter(k => ids[k] > 1),
                h1: document.querySelectorAll('h1').length,
                title: document.title, lang: document.documentElement.lang,
                description: !!document.querySelector('meta[name=description]'),
                viewport: !!document.querySelector('meta[name=viewport]'),
                unlabeled: [...document.querySelectorAll('input:not([type=hidden]),select,textarea')].filter(e => e.offsetParent && !e.labels?.length && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby')).map(e => e.id || e.name || e.type),
                unnamed: [...document.querySelectorAll('button,a[href]')].filter(b => b.offsetParent && !(b.innerText || '').trim() && !b.getAttribute('aria-label') && !b.getAttribute('title') && !b.querySelector('img[alt]:not([alt=""])')).length,
              };
            }""")
            where = f"{label} {path}"
            no_problems(problems, where)
            check(info["overflow"] <= 1, f"{where}: page scrolls sideways by {info['overflow']}px")
            check(not info["broken"], f"{where}: broken images {info['broken']}")
            check(info["noAlt"] == 0, f"{where}: {info['noAlt']} images without alt text")
            check(not info["dupIds"], f"{where}: duplicate ids {info['dupIds']}")
            if label == "laptop":
                check(info["h1"] == 1, f"{where}: has {info['h1']} main headings (h1)")
                check(bool(info["title"]) and "Englisity" in info["title"], f"{where}: page title missing Englisity")
                check(info["lang"] == "en", f"{where}: lang attribute is {info['lang']!r}")
                check(info["description"], f"{where}: missing meta description")
                check(info["viewport"], f"{where}: missing viewport tag")
                check(not info["unlabeled"], f"{where}: form fields without a label {info['unlabeled'][:5]}")
                check(info["unnamed"] == 0, f"{where}: {info['unnamed']} buttons/links with no name for screen readers")
            page.close()
        ctx.close()


def test_navigation_links(browser, pw):
    """Every menu link on every page opens a real page."""
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    page, problems = open_page(ctx, "index.html")
    targets = set()
    for path in PAGES:
        page.goto(BASE + path)
        hrefs = page.evaluate("[...document.querySelectorAll('a[href]')].map(a => a.href).filter(h => h.startsWith(location.origin))")
        targets.update(h.split("#")[0] for h in hrefs)
    for url in sorted(targets):
        r = page.request.get(url)
        check(r.status == 200, f"link target {url} returned {r.status}")
    ctx.close()


def test_dark_mode_and_menu(browser, pw):
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    page, problems = open_page(ctx, "index.html")
    page.click(".theme-toggle")
    page.wait_for_timeout(200)
    check(page.evaluate("document.documentElement.dataset.theme") == "dark", "Dark button does not switch to dark mode")
    page.goto(BASE + "pages/speaking.html")
    page.wait_for_timeout(300)
    check(page.evaluate("document.documentElement.dataset.theme") == "dark", "Dark mode is not remembered on the next page")
    page.click(".theme-toggle")
    check(page.evaluate("document.documentElement.dataset.theme") != "dark", "Light button does not switch back")
    no_problems(problems, "dark mode")
    ctx.close()
    # Phone menu opens and shows the links.
    phone = {k: v for k, v in pw.devices["iPhone 13"].items() if k != "default_browser_type"}
    ctx = browser.new_context(**phone, service_workers="block")
    page, problems = open_page(ctx, "index.html")
    if page.is_visible("#menuToggle"):
        page.click("#menuToggle")
        page.wait_for_timeout(300)
        visible = page.evaluate("[...document.querySelectorAll('nav a')].filter(a => a.offsetParent).length")
        check(visible >= 5, f"phone menu shows only {visible} links after tapping the menu button")
    no_problems(problems, "phone menu")
    ctx.close()


READ_KEY = r"""() => {
  const out = {};
  document.querySelectorAll('[id^=f],[id^=feedback]').forEach(f => {
    const m = f.id.match(/^(?:f|feedback)(\d+)$/); if (!m) return;
    const p = [...f.querySelectorAll('p,div,span')].find(e => /^Correct answer/i.test(e.textContent.trim()));
    if (p) { const b = p.querySelector('b,strong'); out[m[1]] = (b ? b.textContent : p.textContent.replace(/^Correct answer:?/i, '')).trim(); }
  });
  return out;
}"""
FILL = r"""(answers) => {
  const missing = [];
  const norm = s => String(s).trim().toLowerCase().replace(/\s+/g, ' ');
  for (const [n, a] of Object.entries(answers)) {
    const el = document.getElementById('a' + n) || document.querySelector(`input[type=text][name="q${n}"]`);
    const radios = [...document.querySelectorAll(`input[type=radio][name="a${n}"],input[type=radio][name="q${n}"]`)];
    const first = a.split(/\s*(?:\/| or |;)\s*/)[0];
    if (radios.length) {
      const r = radios.find(r => norm(r.value) === norm(a) || norm(r.parentElement.innerText).startsWith(norm(a)));
      if (r) { r.checked = true; r.dispatchEvent(new Event('change', {bubbles: true})); } else missing.push(n + ':' + a);
    } else if (el && el.tagName === 'SELECT') {
      const o = [...el.options].find(o => norm(o.value) === norm(a) || norm(o.text) === norm(a) || norm(o.text).startsWith(norm(a) + '.') || norm(o.text).startsWith(norm(a) + ' '));
      if (o) { el.value = o.value; el.dispatchEvent(new Event('change', {bubbles: true})); } else missing.push(n + ':' + a);
    } else if (el && el.tagName === 'INPUT') {
      el.value = first; el.dispatchEvent(new Event('input', {bubbles: true}));
    } else if (!(el && el.classList.contains('drop-slot'))) missing.push(n + ':' + a);
  }
  return missing;
}"""


def score_of(page):
    text = page.inner_text("#testResult")
    m = re.search(r"(\d+)\s*/\s*(\d+)", text)
    return (int(m.group(1)), int(m.group(2))) if m else (None, None)


def test_reading_tests_full_marks(browser, pw):
    """For each reading test: empty answers score 0, the official answers score full marks."""
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    for slug in READING_TESTS:
        R.current = "reading " + slug
        page, problems = open_page(ctx, f"pages/{slug}.html")
        choose_practice_mode(page)
        page.click("#checkAnswers")
        page.wait_for_timeout(400)
        got, total = score_of(page)
        check(got == 0 and total and total >= 10, f"empty answers should score 0, got {got}/{total}")
        answers = page.evaluate(READ_KEY)
        if slug == "redwoods":
            source = open("js/redwoods.js", encoding="utf-8").read()
            keys = {name: json.loads(re.sub(r"(\w+):", r'"\1":', re.search(r"const %s=(\{[^}]*\});" % name, source).group(1))) for name in ("key", "peopleKey", "textKey")}
        page.click("#resetTest")
        page.wait_for_timeout(400)
        choose_practice_mode(page)
        missing = page.evaluate(FILL, answers)
        check(not missing, f"answer key could not be entered in the form: {missing}")
        if slug == "life-on-mars":
            for n in range(36, 41):
                letter = answers.get(str(n))
                page.click(f'.word-chip[data-value="{letter}"]')
                page.click(f"#a{n}")
        if slug == "redwoods":
            for para, code in keys["key"].items():
                page.click(f'.heading-card[data-heading="{code}"]')
                page.click(f'.drop-slot[data-para="{para}"]')
            for qid, val in keys["peopleKey"].items():
                page.select_option(f"#{qid}", val)
            for qid, val in keys["textKey"].items():
                page.fill(f"#{qid}", val)
        page.click("#checkAnswers")
        page.wait_for_timeout(400)
        got, total = score_of(page)
        check(got == total, f"entering the correct answers scores only {got}/{total}")
        # "Try again" clears everything.
        page.click("#resetTest")
        page.wait_for_timeout(400)
        left = page.evaluate("[...document.querySelectorAll('input[type=text]')].filter(i => i.value).length + [...document.querySelectorAll('input[type=radio]:checked,input[type=checkbox]:checked')].length")
        check(left == 0, f"'Try again' leaves {left} answers filled in")
        # Exam mode shows a running timer.
        if page.query_selector("#examModeButton") and page.is_visible("#examModeButton"):
            page.click("#examModeButton")
            before = page.inner_text("#timerDisplay")
            page.wait_for_timeout(2200)
            check(page.inner_text("#timerDisplay") != before, "exam timer does not count down")
        no_problems(problems, slug)
        page.close()
    ctx.close()


def test_listening_tests_full_marks(browser, pw):
    """Each listening mock: audio file exists, the official answers score 40/40, answers survive a reload."""
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    for slug in LISTENING_TESTS:
        R.current = "listening " + slug
        page, problems = open_page(ctx, f"pages/{slug}.html", 800)
        src = page.evaluate("(document.querySelector('audio source,audio')||{}).src || (document.querySelector('audio')||{}).currentSrc || ''")
        audio_files = [f for f in glob.glob("assets/audio/*.mp3") if slug.replace("listening-test-", "listening-mock-") in f]
        check(bool(audio_files) and os.path.getsize(audio_files[0]) > 1_000_000, f"audio file missing for {slug}")
        check(src.endswith(".mp3"), f"audio player has no mp3 source ({src!r})")
        choose_practice_mode(page)
        html = open(f"pages/{slug}.html", encoding="utf-8").read()
        m_key = re.search(r"const KEY=(\{.*?\});", html)
        if m_key:
            KEY = json.loads(m_key.group(1))
            PAIRS = json.loads(re.sub(r"(\d+):", r'"\1":', re.search(r"const PAIRS=(\{.*?\});", html).group(1)))
            answers = {str(n): v[0] for n, v in KEY.items()}
            pairs = {str(s): letters for s, letters in PAIRS.items()}
        else:
            answers, pairs = None, {}
        filled = page.evaluate("""([answers, pairs]) => {
          const pairStarts = {};
          Object.entries(pairs).forEach(([s, letters]) => letters.forEach((l, i) => pairStarts[+s + i] = [s, l]));
          if (!answers) {
            answers = {};
            for (let n = 1; n <= 40; n++) { const k = key[Math.floor((n - 1) / 10)][(n - 1) % 10]; answers[n] = Array.isArray(k) ? k[0] : k; }
            const group = key[2][4]; if (Array.isArray(group)) group.forEach((l, i) => answers[25 + i] = l);
          }
          for (let n = 1; n <= 40; n++) {
            const v = answers[n];
            if (typeof setAnswerValue === 'function') { setAnswerValue(n, v); continue; }
            if (pairStarts[n]) { const [s, l] = pairStarts[n]; const box = document.querySelector(`.pair-choice-input[data-pair="${s}"][value="${l}"]`); if (box) box.checked = true; continue; }
            const el = document.getElementById('a' + n); if (!el) continue;
            if (el.type === 'radio') { const r = document.querySelector(`input[name="a${n}"][value="${v}"]`); if (r) r.checked = true; }
            else el.value = v;
          }
          document.querySelectorAll('input,select').forEach(el => el.dispatchEvent(new Event(el.tagName === 'SELECT' || el.type === 'radio' || el.type === 'checkbox' ? 'change' : 'input', {bubbles: true})));
          const m = (document.getElementById('answeredCount') || {}).textContent || '';
          return parseInt(m) || 0;
        }""", [answers, pairs])
        check(filled == 40, f"only {filled}/40 official answers could be entered in the form")
        page.wait_for_timeout(300)
        page.reload()
        page.wait_for_timeout(800)
        choose_practice_mode(page)
        kept = page.evaluate("parseInt((document.getElementById('answeredCount') || {}).textContent || '0')")
        check(kept == 40, f"after reloading the page only {kept}/40 answers were kept")
        page.evaluate("document.getElementById('submit').click()")
        page.wait_for_timeout(600)
        text = page.evaluate("[...document.querySelectorAll('#results, #resultModal')].map(e => e.innerText).join(' ')")
        m = re.search(r"Result:\s*(\d+)\s*/\s*40", text)
        score = int(m.group(1)) if m else None
        check(score == 40, f"the official answers score {score}/40")
        no_problems(problems, slug)
        page.close()
    ctx.close()


def test_speaking(browser, pw):
    """Every topic opens, every Part 2 cue card has its points, and the timers run."""
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    page, problems = open_page(ctx, "pages/speaking.html", 700)
    total_questions = 0
    seen = {}
    for part in ("1", "2", "3"):
        page.goto(BASE + "pages/speaking.html")
        page.wait_for_timeout(400)
        page.click(f'[data-part="{part}"]')
        page.wait_for_timeout(250)
        topics = page.evaluate("[...document.querySelectorAll('#topicList button, #topicGrid button, .topic-card')].filter(b => b.offsetParent).map(b => b.innerText.split('\\n')[0].trim())")
        check(len(topics) >= 3, f"Part {part} shows only {len(topics)} topics")
        for i, topic in enumerate(topics):
            page.evaluate("i => [...document.querySelectorAll('#topicList button, #topicGrid button, .topic-card')].filter(b => b.offsetParent)[i].click()", i)
            page.wait_for_timeout(120)
            items = page.evaluate("""() => [...document.querySelectorAll('#questionList .question-item')].map(it => ({
              text: (it.querySelector('.question-text') || it).innerText.trim(),
              date: /Last reported/.test(it.innerText)}))""")
            check(len(items) >= 1, f"Part {part} topic '{topic}' has no questions")
            texts = [x["text"] for x in items]
            check(len(texts) == len(set(texts)), f"Part {part} topic '{topic}' lists the same question twice")
            total_questions += len(items)
            for t in texts:
                key = part + "|" + re.sub(r"[^a-z]", "", t.lower())
                seen[key] = seen.get(key, 0) + 1
            if part == "2":
                for q in range(len(items)):
                    page.evaluate("q => document.querySelectorAll('#questionList .question-item')[q].querySelector('button').click()", q)
                    page.wait_for_timeout(80)
                    card = page.evaluate("({title: document.getElementById('cueCardTitle').textContent.trim(), prompts: [...document.querySelectorAll('#cueCardPrompts li')].map(l => l.textContent.trim())})")
                    check(card["title"].startswith("Describe"), f"cue card title looks wrong: {card['title']!r}")
                    check(len(card["prompts"]) >= 3, f"cue card '{card['title']}' has only {len(card['prompts'])} 'You should say' points")
                    page.click("#backToQuestions")
                    page.wait_for_timeout(60)
            page.click("#backToTopics")
            page.wait_for_timeout(80)
    check(total_questions >= 400, f"only {total_questions} speaking questions found")
    repeated = sorted({q.split("|")[0] + ": " + q.split("|")[1][:60] for q, n in seen.items() if n > 1})
    check(not repeated, f"the same question appears in two topics: {repeated[:5]}")
    # Timers.
    page.goto(BASE + "pages/speaking.html")
    page.wait_for_timeout(400)
    page.click('[data-part="2"]')
    page.wait_for_timeout(200)
    page.evaluate("[...document.querySelectorAll('#topicList button, #topicGrid button, .topic-card')].filter(b => b.offsetParent)[0].click()")
    page.wait_for_timeout(200)
    page.evaluate("document.querySelector('#questionList .question-item button').click()")
    page.wait_for_timeout(300)
    before = page.inner_text("#timerDisplay")
    page.click("#prepTimerButton")
    page.wait_for_timeout(2200)
    check(page.inner_text("#timerDisplay") != before, "Part 2 preparation timer does not run")
    page.click("#resetTimerButton")
    page.wait_for_timeout(200)
    check(page.inner_text("#timerDisplay") == before, "Reset does not reset the timer")
    no_problems(problems, "speaking")
    ctx.close()


def test_writing(browser, pw):
    """Every Task 1 and Task 2 question opens with its text (and chart), the timer runs and drafts are saved."""
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    page, problems = open_page(ctx, "pages/writing.html", 700)
    ids = page.evaluate("""() => ({
      t1: [...document.querySelectorAll('[data-open-task-detail]')].map(b => b.dataset.openTaskDetail),
      t2: [...document.querySelectorAll('[data-open-task2-detail]')].map(b => b.dataset.openTask2Detail)})""")
    check(len(ids["t1"]) >= 5 and len(ids["t2"]) >= 20, f"writing library is smaller than expected: {len(ids['t1'])} Task 1, {len(ids['t2'])} Task 2")
    check(len(ids["t1"]) == len(set(ids["t1"])) and len(ids["t2"]) == len(set(ids["t2"])), "a writing card appears twice in the library")
    for tid in ids["t1"]:
        page.goto(BASE + f"pages/writing.html#task1/{tid}")
        page.wait_for_timeout(350)
        info = page.evaluate("""() => { const img = [...document.querySelectorAll('img')].find(i => i.offsetParent && /images\\/task1\\//.test(i.src));
          return {img: img ? img.naturalWidth : 0, text: document.body.innerText}; }""")
        check(info["img"] > 100, f"Task 1 '{tid}' chart image does not show")
        check("Summarise the information" in info["text"] or "Summarize the information" in info["text"] or "summarise" in info["text"].lower(), f"Task 1 '{tid}' is missing the standard instruction")
    questions = set()
    for tid in ids["t2"]:
        page.goto(BASE + f"pages/writing.html#task2/{tid}")
        page.wait_for_timeout(250)
        q = page.inner_text("#task2Prompt").strip()
        check(len(q) > 40 and q.endswith(("?", ".")), f"Task 2 '{tid}' question looks incomplete: {q[:60]!r}")
        questions.add(re.sub(r"[^a-z]", "", q.lower()))
    check(len(questions) == len(ids["t2"]), "two Task 2 cards show the same question")
    # Draft, word count, autosave and timer.
    tid = ids["t2"][0]
    page.goto(BASE + f"pages/writing.html#task2/{tid}")
    page.wait_for_timeout(400)
    page.fill("#task2Draft", "Some people think technology helps students learn faster. " * 3)
    page.wait_for_timeout(300)
    check(page.inner_text("#task2WordCount").strip() == "24", f"word count shows {page.inner_text('#task2WordCount')!r} for 24 words")
    page.get_by_role("button", name="Save draft").click()
    page.reload()
    page.wait_for_timeout(500)
    check("technology helps" in page.input_value("#task2Draft"), "Task 2 draft is lost after reloading the page")
    start = page.locator("#task2Workspace button", has_text="Start").first
    timer_text = lambda: page.evaluate("document.querySelector('#task2Workspace').innerText.match(/\\d{1,2}:\\d{2}/)?.[0] || ''")
    before = timer_text()
    start.click()
    page.wait_for_timeout(2200)
    check(timer_text() != before, f"writing timer does not run (stays at {before})")
    page.get_by_role("button", name="Clear draft").click()
    page.wait_for_timeout(200)
    check(page.input_value("#task2Draft") == "", "Clear draft does not clear the essay")
    # Filters.
    page.goto(BASE + "pages/writing.html#task2")
    page.wait_for_timeout(400)
    page.select_option("#task2CategoryFilter", "agree-disagree")
    page.wait_for_timeout(200)
    shown = page.evaluate("[...document.querySelectorAll('[data-open-task2-detail]')].filter(b => b.offsetParent).map(b => b.dataset.task2Category)")
    check(shown and all(c == "agree-disagree" for c in shown), "Task 2 type filter shows other essay types")
    no_problems(problems, "writing")
    ctx.close()


def test_vocabulary(browser, pw):
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    page, problems = open_page(ctx, "pages/vocabulary.html", 700)
    counts = lambda: page.evaluate("Object.fromEntries([...document.querySelectorAll('[data-status-count]')].map(e => [e.dataset.statusCount, +e.textContent]))")
    c = counts()
    check(c.get("all", 0) >= 40 and c["new"] == c["all"], f"new student should see every word as New: {c}")
    # Organise words.
    page.click('[data-status="new"]')
    first = page.locator(".vocab-item").first
    word = first.locator("h3").inner_text().replace("🔊", "").strip()
    first.get_by_text("Start learning").click()
    page.locator(".vocab-item").first.get_by_text("I know it").click()
    c = counts()
    check(c["learning"] == 1 and c["memorized"] == 1 and c["new"] == c["all"] - 2, f"Start learning / I know it give wrong counts: {c}")
    page.reload()
    page.wait_for_timeout(500)
    check(counts() == c, "vocabulary progress is lost after reloading")
    # Search.
    page.click('[data-status="all"]')
    page.fill("#wordSearch", word)
    page.wait_for_timeout(200)
    check(page.locator(".vocab-item h3", has_text=word).count() >= 1, f"searching for '{word}' does not find it")
    page.fill("#wordSearch", "zzzzqqq")
    page.wait_for_timeout(200)
    check(page.locator(".vocab-item").count() == 0 and page.locator(".vocab-empty").count() == 1, "search with no results does not show a message")
    page.fill("#wordSearch", "")
    # Topic filter.
    page.select_option("#topicFilter", "Linking ideas")
    page.wait_for_timeout(200)
    metas = page.evaluate("[...document.querySelectorAll('.vocab-item .item-meta')].map(m => m.textContent)")
    check(metas and all("Linking ideas" in m for m in metas), "topic filter shows words from other topics")
    page.select_option("#topicFilter", "all")
    # Flashcards: two "Got it" answers memorise a word.
    page.click("#startAllStudy")
    page.click("#revealStudy")
    page.click("#knowStudy")
    check("come back" in page.inner_text("#studyMessage"), "flashcards give no feedback after 'Got it'")
    page.click("#nextStudy")
    check(page.inner_text("#studyCounter").startswith("Card 2"), "'Next' does not move to the next flashcard")
    page.click("#revealStudy")
    page.click("#againStudy")
    check("again" in page.inner_text("#studyMessage"), "flashcards give no feedback after 'Again'")
    # Daily quiz.
    if page.query_selector("#dailyQuiz"):
        opts = page.locator("#dailyQuiz button, #dailyQuiz input[type=radio]")
        check(opts.count() >= 2, "daily vocabulary quiz has no options")
    no_problems(problems, "vocabulary")
    ctx.close()


def test_articles(browser, pw):
    """Each article: quiz → vocabulary cards → vocabulary quiz → scores saved."""
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    for path in sorted(glob.glob("articles/*.html")):
        R.current = path
        page, problems = open_page(ctx, path, 500)
        check(page.query_selector(".article-end #finishedReadingBtn") is not None, "no 'Start article quiz' button in the article end section")
        page.click("#finishedReadingBtn")
        page.wait_for_timeout(300)
        for step in range(80):
            if page.query_selector(".al-complete"):
                break
            if page.query_selector(".al-card") and not page.query_selector(".al-card.flipped"):
                page.click(".al-card")
            options = page.query_selector_all(".al-option")
            if options and not page.query_selector(".al-option.selected"):
                options[-1].click()
                page.wait_for_timeout(60)
            if page.query_selector(".al-option.al-correct"):
                check(len(page.query_selector_all(".al-option.al-correct")) == 1, "a quiz question marks more than one option as correct")
            buttons = [b for b in page.query_selector_all(".al-btn") if b.is_visible() and b.is_enabled() and "Previous" not in b.inner_text()]
            if not buttons:
                break
            buttons[-1].click() if "Continue" not in buttons[0].inner_text() else buttons[0].click()
            page.wait_for_timeout(60)
        check(page.query_selector(".al-complete") is not None, "could not finish the article quiz and vocabulary steps")
        saved = page.evaluate("JSON.parse(localStorage.getItem('englisityArticleProgress') || '{}')")
        slug = os.path.splitext(os.path.basename(path))[0]
        entry = next((v for k, v in saved.items() if slug in k or k in slug), None)
        check(entry and entry.get("completed") and "comprehension" in entry and "vocabulary" in entry, f"article scores were not saved ({saved})")
        no_problems(problems, path)
        page.close()
    R.current = "articles library"
    page, problems = open_page(ctx, "pages/articles.html", 600)
    n = page.evaluate("[...document.querySelectorAll('a[href*=\"articles/\"]')].filter(a => a.offsetParent).length")
    check(n >= len(glob.glob("articles/*.html")), f"articles page links to only {n} articles")
    page.fill("#resourceSearch", "sleep")
    page.wait_for_timeout(300)
    m = page.evaluate("[...document.querySelectorAll('a[href*=\"articles/\"]')].filter(a => a.offsetParent).length")
    check(0 < m < n, f"searching articles for 'sleep' shows {m} of {n}")
    no_problems(problems, "articles library")
    ctx.close()


def test_report_and_share_forms(browser, pw):
    """The Share and Report forms send the right data and show the result."""
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    sent = []

    def fake_worker(route):
        sent.append(json.loads(route.request.post_data))
        route.fulfill(status=200, content_type="application/json", body='{"ok":true}')

    ctx.route("**/api/submit", fake_worker)
    page, problems = open_page(ctx, "pages/share.html", 400)
    page.fill("#qDate", "2026-11-16")
    page.fill("#qCity", "Tashkent")
    page.select_option("#qModule", index=1)
    page.select_option("#qSection", index=1)
    page.fill("#qText", "Describe a successful business owner. What kind of business do they run?")
    page.wait_for_timeout(3100)  # the form ignores messages sent faster than a person can type
    page.click("#formQuestions button[type=submit]")
    page.wait_for_timeout(500)
    check(sent and sent[-1]["type"] == "questions" and "business" in sent[-1]["text"] and sent[-1]["location"] == "Tashkent", f"shared questions were not sent correctly: {sent[-1:] }")
    check("Thank you" in page.inner_text("#formQuestions"), "no thank-you message after sharing questions")
    page.click("#tabReport")
    page.fill("#rPage", "Speaking")
    page.select_option("#rKind", index=1)
    page.fill("#rText", "Question 3 in this test has the wrong answer.")
    page.wait_for_timeout(3100)
    page.click("#formReport button[type=submit]")
    page.wait_for_timeout(500)
    check(sent and sent[-1]["type"] == "report" and sent[-1]["page"] == "Speaking", f"problem report was not sent correctly: {sent[-1:]}")
    check(not sent[-1].get("website"), "the hidden spam field was filled in")
    # When delivery fails, the student gets another way to send it.
    ctx.unroute("**/api/submit")
    ctx.route("**/api/submit", lambda r: r.fulfill(status=502, content_type="application/json", body='{"error":"delivery-failed","detail":"chat not found"}'))
    page.fill("#rText", "Question 4 in this test has the wrong answer too.")
    page.wait_for_timeout(3100)
    page.click("#formReport button[type=submit]")
    page.wait_for_timeout(500)
    text = page.inner_text("#formReport")
    check("Thank you" not in text and ("Telegram" in text or "copy" in text.lower() or "email" in text.lower()), "failed delivery does not offer another way to send the report")
    page.evaluate("1")
    problems[:] = [p for p in problems if "502" not in p]
    no_problems(problems, "share page")
    # "Report a problem" links on test pages open the form with the page filled in.
    page.goto(BASE + "pages/beatrix-potter.html")
    page.wait_for_timeout(500)
    link = page.evaluate("[...document.querySelectorAll('a[href*=\"share.html\"]')].map(a => a.getAttribute('href')).find(h => /report/.test(h)) || ''")
    check(bool(link), "test page has no 'Report a problem' link")
    if link:
        page.goto(BASE + "pages/" + link if not link.startswith("..") else BASE + "pages/" + link)
        page.wait_for_timeout(500)
        check(page.is_visible("#formReport") and page.input_value("#rPage") != "", "report link does not open the report form with the page filled in")
    ctx.close()


def test_progress_and_bookmarks(browser, pw):
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    page, problems = open_page(ctx, "pages/podcasts.html", 600)
    save = page.locator(".eng-save").first
    if save.count():
        save.click()
        page.wait_for_timeout(200)
        saved = page.evaluate("JSON.parse(localStorage.getItem('englisity-bookmarks-v1') || '[]').length")
        check(saved == 1, f"'Save resource' stored {saved} bookmarks")
        page.goto(BASE + "index.html")
        page.wait_for_timeout(500)
    # Completing a quiz counts for today's streak.
    page.goto(BASE + "pages/beatrix-potter.html")
    page.wait_for_timeout(500)
    choose_practice_mode(page)
    page.click("#checkAnswers")
    page.wait_for_timeout(400)
    page.goto(BASE + "index.html")
    page.wait_for_timeout(500)
    pill = page.inner_text("#engStreakPill") if page.query_selector("#engStreakPill") else ""
    check("1-day" in pill, f"after finishing a test the streak shows {pill!r} instead of a 1-day streak")
    no_problems(problems, "progress")
    ctx.close()


def test_offline(browser, pw):
    """After one visit, the main pages still open without internet (installed app)."""
    ctx = browser.new_context(**DESKTOP)
    page, problems = open_page(ctx, "index.html", 500)
    # The site registers its service worker on https only; register it by hand for the local test server.
    state = page.evaluate("""async () => {
      const reg = await navigator.serviceWorker.register('sw.js', {scope: '/'});
      const sw = reg.installing || reg.waiting || reg.active;
      if (sw && sw.state !== 'activated') await new Promise((resolve, reject) => {
        const t = setTimeout(() => resolve(), 15000);
        sw.addEventListener('statechange', () => { if (sw.state === 'activated' || sw.state === 'redundant') { clearTimeout(t); resolve(); } });
      });
      return (reg.active && reg.active.state) || (sw && sw.state) || 'none';
    }""")
    check(state == "activated", f"offline support (service worker) failed to install: {state}")
    page.reload()
    page.wait_for_timeout(1500)
    ctx.set_offline(True)
    for path in ("index.html", "pages/speaking.html", "pages/vocabulary.html"):
        try:
            page.goto(BASE + path, wait_until="load", timeout=8000)
            ok = "Englisity" in page.title()
        except Exception:
            ok = False
        check(ok, f"{path} does not open offline")
    ctx.set_offline(False)
    ctx.close()


# ------------------------------------------------------------------- main ---
def main():
    global BASE
    server, BASE = start_server()
    wanted = sys.argv[1:]
    tests = [(n, f) for n, f in globals().items() if n.startswith("test_") and callable(f) and (not wanted or any(w in n for w in wanted))]
    started = time.time()
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for name, fn in tests:
            R.current = name[5:].replace("_", " ")
            before = len(R.failures)
            t = time.time()
            try:
                fn(browser, pw)
            except Exception as e:
                R.failures.append(f"[{R.current}] crashed: {str(e).splitlines()[0][:300]}")
                if os.environ.get("DEBUG"):
                    traceback.print_exc()
            status = "ok" if len(R.failures) == before else f"{len(R.failures) - before} problem(s)"
            print(f"{'✓' if status == 'ok' else '✗'} {name[5:].replace('_', ' ')} ({time.time() - t:.0f}s) {'' if status == 'ok' else status}", flush=True)
        browser.close()
    server.shutdown()
    print()
    if R.failures:
        print(f"{len(R.failures)} problem(s) found in {R.checks} checks ({time.time() - started:.0f}s):")
        for f in R.failures:
            print("  - " + f)
        sys.exit(1)
    print(f"All {R.checks} checks passed in {time.time() - started:.0f}s.")


if __name__ == "__main__":
    main()
