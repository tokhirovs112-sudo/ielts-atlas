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
READING_TESTS = ["full-test-01", "full-test-02", "mock-01-reading", "mock-02-reading", "beatrix-potter", "dolls", "foot-pedal-irrigation", "seeing-in-the-sea", "halley-vi", "herding", "keeping-healthy-at-work", "life-on-mars", "power-from-the-sea", "redwoods"]
LISTENING_TESTS = ["listening-test-01", "listening-test-02", "listening-test-03", "listening-test-04", "mock-01-listening", "mock-02-listening"]
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


def test_consistent_design(browser, pw):
    """Every hub page uses the shared hero with a clickable breadcrumb, one brand tagline, and the listening count is right."""
    hubs = ["reading", "listening", "writing", "speaking", "vocabulary", "articles", "podcasts", "about", "share", "passage-1", "passage-2", "passage-3", "full-tests"]
    for name in hubs:
        html = open(f"pages/{name}.html", encoding="utf-8").read()
        check('class="page-hero' in html, f"{name}: does not use the shared page hero")
        check('<nav class="breadcrumb"' in html and 'href="../index.html">Home</a>' in html, f"{name}: no clickable breadcrumb")
    for path in PAGES:
        html = open(path, encoding="utf-8").read()
        m = re.search(r'<a class="brand"[^>]*>.*?<small>([^<]*)</small>', html, re.S)
        check(not m or m.group(1) == "LEARN WITH PURPOSE", f"{path}: brand tagline is '{m.group(1) if m else ''}'")
    html = open("pages/listening.html", encoding="utf-8").read()
    n = len(set(re.findall(r'href="(listening-test-\d+\.html)"', html)))
    check(f">{n} TESTS AVAILABLE<" in html, f"listening hub count does not say {n} tests")


def test_dark_hover(browser, pw):
    """In dark mode, hovering tabs and buttons never turns them into light boxes with unreadable light text."""
    js = """(el) => { const c = getComputedStyle(el), p = s => (s.match(/\\d+(\\.\\d+)?/g) || []).map(Number);
      const [r, g, b, a = 1] = p(c.backgroundColor), [fr, fg, fb] = p(c.color);
      return a > 0.5 && (r * 299 + g * 587 + b * 114) / 1000 > 200 && (fr * 299 + fg * 587 + fb * 114) / 1000 > 170; }"""
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    ctx.add_init_script("try { localStorage.setItem('englisity-theme', 'dark'); } catch (e) {}")
    for path, sel in [("pages/vocabulary.html#topics", ".vocab-tabs a, .topic-card"), ("pages/reading.html", "nav.nav a, main a"), ("pages/full-tests.html", "main a")]:
        R.current = "dark hover " + path
        page, problems = open_page(ctx, path)
        bad = []
        for el in page.query_selector_all(sel)[:30]:
            if not el.is_visible():
                continue
            el.hover()
            page.wait_for_timeout(200)
            if el.evaluate(js):
                bad.append(el.inner_text().strip()[:25])
        check(not bad, f"{path}: light hover box with light text on {bad}")
        page.close()
    ctx.close()


def test_speaking_mocks(browser, pw):
    """Speaking mock tests: every mock has 3 Part 1 topics, a cue card with prompts and 5 linked Part 3 questions; a full run reaches the end screen."""
    for device in (DESKTOP, {k: v for k, v in pw.devices["iPhone 13"].items() if k != "default_browser_type"}):
        ctx = browser.new_context(**device, service_workers="block")
        page, problems = open_page(ctx, "pages/speaking.html")
        page.click(".mock-banner")
        page.wait_for_timeout(300)
        check(page.evaluate("location.hash") == "#mock" and page.locator(".mock-card").count() == 16, f"expected 16 mock cards, found {page.locator('.mock-card').count()}")
        info = page.evaluate("EnglisitySpeakingMock.list().map(m => [m.n, m.part1.length, m.part1.every(t => t.questions.length >= 3), m.prompts.length, m.part3.length])")
        bad = [m for m in info if m[1] != 3 or not m[2] or m[3] < 3 or m[4] != 5]
        check(not bad, f"mocks with missing questions (n, topics, enough, prompts, part3): {bad}")
        page.click(".mock-card >> nth=0")
        page.wait_for_timeout(200)
        page.uncheck("#mockRecord")
        page.click("#mockBegin")
        page.wait_for_timeout(300)
        seen = set()
        for _ in range(40):
            if page.query_selector(".mock-end"):
                break
            label = page.inner_text(".mock-steps span.on") if page.query_selector(".mock-steps span.on") else ""
            seen.add(label)
            if page.query_selector("#mockNotes"):
                page.fill("#mockNotes", "notes")
            page.click("#mockNext")
            page.wait_for_timeout(120)
        page.wait_for_timeout(500)
        check(page.query_selector(".mock-end") is not None, "a full mock does not reach the end screen")
        check({"Part 1", "Part 2", "Part 3"} <= seen, f"the mock skipped a part: saw {seen}")
        check("Describe a time when you got up early." in page.text_content(".mock-review"), "end screen does not list the cue card")
        page.go_back()
        page.wait_for_timeout(300)
        check(page.is_visible("#mockSection"), "Back button does not return to the mock start page")
        page.goto(BASE + "pages/speaking.html#part2")
        page.wait_for_timeout(300)
        check(page.is_visible("#topicSection") and not page.is_visible("#mockSection"), "Part 2 link still shows the mock screen")
        no_problems(problems, "speaking mocks")
        ctx.close()


def test_app_icon_links(browser, pw):
    """Every page links the manifest and the new E app icon in its HTML, so phones and installed apps pick up the current logo."""
    for path in PAGES:
        html = open(path, encoding="utf-8").read()
        check('rel="manifest"' in html, f"{path}: no manifest link in the HTML")
        check('rel="apple-touch-icon"' in html and "englisity-app-icon.png" in html, f"{path}: no apple-touch-icon link to the E logo")
        check('rel="icon"' in html and "englisity-mark.svg" in html, f"{path}: no favicon link to the E logo")


def test_site_footer(browser, pw):
    """Normal pages end with the site footer (About, Share questions, Report a problem); full tests don't show it."""
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    tests = set(READING_TESTS) | set(LISTENING_TESTS)
    for path in PAGES:
        page, problems = open_page(ctx, path, 400)
        slug = os.path.splitext(os.path.basename(path))[0]
        info = page.evaluate("""() => { const f = document.querySelector('.site-footer');
          return {has: !!f, text: f ? f.innerText : '', last: f ? !f.nextElementSibling || f.nextElementSibling.tagName === 'SCRIPT' || !!document.querySelector('.site-footer ~ script') : false,
                  old: document.querySelectorAll('footer.footer, footer.home-footer, .eng-site-links').length}; }""")
        if slug in tests:
            check(not info["has"], f"{path}: the site footer should not show inside a test")
        else:
            check(info["has"], f"{path}: missing the site footer")
            for t in ("About Englisity", "Share your exam questions", "Report a problem", "Telegram channel"):
                check(t in info["text"] or (slug == "about" and t == "About Englisity"), f"{path}: footer is missing '{t}'")
            check(info["old"] == 0, f"{path}: the old small footer is still showing")
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
    page.click(".sb-theme" if page.is_visible(".sb-theme") else ".theme-toggle")  # laptops: the sidebar has the theme button
    page.wait_for_timeout(200)
    check(page.evaluate("document.documentElement.dataset.theme") == "dark", "Dark button does not switch to dark mode")
    page.goto(BASE + "pages/speaking.html")
    page.wait_for_timeout(300)
    check(page.evaluate("document.documentElement.dataset.theme") == "dark", "Dark mode is not remembered on the next page")
    page.click(".sb-theme" if page.is_visible(".sb-theme") else ".theme-toggle")  # laptops: the sidebar has the theme button
    check(page.evaluate("document.documentElement.dataset.theme") != "dark", "Light button does not switch back")
    no_problems(problems, "dark mode")
    ctx.close()
    # No white flash: in dark mode, the page must already be dark when the browser starts drawing the body.
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    ctx.add_init_script("""
      try { localStorage.setItem('englisity-theme', 'dark'); } catch (e) {}
      window.__themeAtBody = 'not seen';
      new MutationObserver((list, obs) => { if (document.body) { window.__themeAtBody = document.documentElement.dataset.theme || 'none'; obs.disconnect(); } })
        .observe(document, {childList: true, subtree: true});
    """)
    page = ctx.new_page()
    for path in PAGES:
        page.goto(BASE + path, wait_until="domcontentloaded")
        seen = page.evaluate("window.__themeAtBody")
        check(seen == "dark", f"{path}: dark mode flashes light while loading (theme when page started drawing: {seen})")
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
    } else if (document.querySelector(`input[type=checkbox][data-q~="${n}"][value="${a}"]`)) {
      const box = document.querySelector(`input[type=checkbox][data-q~="${n}"][value="${a}"]`); box.checked = true; box.dispatchEvent(new Event('change', {bubbles: true}));
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
        if page.query_selector("#submitWarning") and page.is_visible("#submitWarning"):
            check("blank" in page.inner_text("#submitWarning"), "the blank-answers warning does not say how many are blank")
            page.click("#submitAnyway")
            page.wait_for_timeout(400)
        got, total = score_of(page)
        check(got == 0 and total and total >= 10, f"empty answers should score 0, got {got}/{total}")
        answers = page.evaluate(READ_KEY)
        if slug == "redwoods":
            source = open("js/redwoods.js", encoding="utf-8").read()
            keys = {name: json.loads(re.sub(r"(\w+):", r'"\1":', re.search(r"const %s=(\{[^}]*\});" % name, source).group(1))) for name in ("key", "peopleKey", "textKey")}
        if page.is_visible("#mockAutoNext"):
            page.click("#mockAutoNext .stay")  # full mock test: stay on the page instead of moving to Writing
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
        if page.is_visible("#mockAutoNext"):
            page.click("#mockAutoNext .stay")
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


SHOW_ALL_EVIDENCE = r"""async () => {
  const norm = s => String(s).toLowerCase().replace(/[‘’`´]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
  const out = [];
  for (const link of [...document.querySelectorAll('.view-in-test')]) {
    const part = link.closest('.ft-questions');
    if (part && part.hidden) document.querySelector('.part-tab[data-go="' + part.dataset.part + '"]').click();
    link.click();
    await new Promise(r => setTimeout(r, 30));
    const marks = [...document.querySelectorAll('#passageText mark.evidence-mark')];
    const quote = norm(link.closest('.question-feedback').querySelector('blockquote').textContent);
    const text = norm(marks.map(m => m.textContent).join(' '));
    const n = ((link.closest('.question-feedback').id || '').match(/(\d+)$/) || [])[1];
    const chip = document.querySelector('.evidence-chip');
    if (!marks.length) out.push(n + ': nothing highlighted');
    else if (marks.some(m => m.offsetParent === null)) out.push(n + ': highlight is in a hidden passage');
    else if (text.length < Math.min(25, quote.length * 0.5)) out.push(n + ': only "' + text.slice(0, 40) + '" highlighted');
    else if (!quote.replace(/[^a-z0-9]/g, '').includes(text.replace(/[^a-z0-9]/g, '').slice(0, 30))) out.push(n + ': highlight does not match the evidence');
    if (!chip || chip.hidden || !/Back to question \d+/.test(chip.innerText)) out.push(n + ': no "Back to question" button');
  }
  return out;
}"""


def test_show_in_passage(browser, pw):
    """After submitting, every 'Show in passage' button highlights the exact evidence and offers a way back."""
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    for slug in READING_TESTS:
        R.current = "show in passage " + slug
        page, problems = open_page(ctx, f"pages/{slug}.html")
        choose_practice_mode(page)
        page.click("#checkAnswers")
        page.wait_for_timeout(300)
        if page.query_selector("#submitAnyway") and page.is_visible("#submitAnyway"):
            page.click("#submitAnyway")
            page.wait_for_timeout(300)
        if page.is_visible("#mockAutoNext"):
            page.click("#mockAutoNext .stay")
        count = page.evaluate("document.querySelectorAll('.view-in-test').length")
        if slug != "redwoods":
            check(count >= 10, f"only {count} 'Show in passage' buttons after submitting")
        bad = page.evaluate(SHOW_ALL_EVIDENCE)
        check(not bad, f"'Show in passage' problems: {bad[:8]}")
        if count:
            page.click(".evidence-chip .back")
            page.wait_for_timeout(200)
            check(page.evaluate("document.querySelector('.evidence-chip').hidden"), "'Back to question' does not close the bar")
        no_problems(problems, slug)
        page.close()
    ctx.close()


def test_full_reading_test(browser, pw):
    """Full test: part tabs, 1-40 navigator, answers saved after reload, band score."""
    for device in (DESKTOP, {k: v for k, v in pw.devices["iPhone 13"].items() if k != "default_browser_type"}):
        ctx = browser.new_context(**device, service_workers="block")
        page, problems = open_page(ctx, "pages/full-test-01.html")
        choose_practice_mode(page)
        visible = lambda: page.evaluate("[...document.querySelectorAll('.ft-passage')].filter(p => !p.hidden).map(p => p.querySelector('h2').textContent)")
        check(visible() == ["Indoor Pollution"], f"Part 1 should show first, got {visible()}")
        page.click('.part-tab[data-go="2"]')
        check(visible() == ["Left or right?"], f"Part 3 tab shows {visible()}")
        page.click('.qnav-btn[data-n="16"]')
        page.wait_for_timeout(300)
        check(visible() == ["Saving bugs to find new drugs"], f"navigator button 16 shows {visible()}")
        check(page.evaluate("document.getElementById('a16').offsetParent !== null"), "question 16 is not visible after using the navigator")
        page.select_option("#a16", "A")
        page.fill("#a23", "ecology")
        check("2 of 40" in page.inner_text("#answeredCount"), f"answered counter says {page.inner_text('#answeredCount')!r}")
        check(page.evaluate("document.querySelector('.qnav-btn[data-n=\"16\"]').classList.contains('done')"), "navigator does not mark answered questions")
        page.reload()
        page.wait_for_timeout(500)
        check(page.evaluate("document.getElementById('a16').value") == "A" and page.evaluate("document.getElementById('a23').value") == "ecology", "answers are not restored after reloading")
        check(page.is_visible("#restoreNote"), "no 'answers restored' note after reloading")
        choose_practice_mode(page)
        page.click("#checkAnswers")
        page.wait_for_timeout(300)
        check(page.is_visible("#submitWarning") and "38" in page.inner_text("#submitWarning"), "no warning about the 38 blank answers")
        page.click("#submitAnyway")
        page.wait_for_timeout(400)
        text = page.inner_text("#testResult")
        check("2 / 40" in text and "Estimated band" in text and "Passage 2" in text, f"result is missing score, band or breakdown: {text[:200]!r}")
        check(page.evaluate("document.querySelectorAll('.qnav-btn.right').length") == 2, "navigator does not colour correct answers")
        no_problems(problems, "full reading test")
        ctx.close()
    # Dark mode: tabs, counters and navigator colours must stay readable.
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    ctx.add_init_script("try { localStorage.setItem('englisity-theme', 'dark'); } catch (e) {}")
    page, problems = open_page(ctx, "pages/full-test-01.html")
    choose_practice_mode(page)
    page.check('input[name="a1"][value="D"]')
    page.wait_for_timeout(600)
    info = page.evaluate("""() => { const st = s => getComputedStyle(document.querySelector(s));
      return {active: st('.part-tab.active').backgroundColor, other: st('.part-tab:not(.active)').backgroundColor,
              badgeBg: st('.part-tab:not(.active) em').backgroundColor, badgeFg: st('.part-tab:not(.active) em').color,
              done: st('.qnav-btn.done').backgroundColor, plain: st('.qnav-btn:not(.done)').backgroundColor}; }""")
    check(info["active"] != info["other"], f"dark mode: the active part tab looks the same as the others ({info})")
    check(info["badgeBg"] != info["badgeFg"] and "237, 245, 239" not in info["badgeBg"], f"dark mode: part counters are unreadable ({info})")
    check(info["done"] != info["plain"], f"dark mode: answered questions are not marked in the navigator ({info})")
    no_problems(problems, "full reading test dark")
    ctx.close()


def test_listening_tests_full_marks(browser, pw):
    """Each listening mock: audio file exists, the official answers score 40/40, answers survive a reload."""
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    for slug in LISTENING_TESTS:
        R.current = "listening " + slug
        page, problems = open_page(ctx, f"pages/{slug}.html", 800)
        src = page.evaluate("(document.querySelector('audio source,audio')||{}).src || (document.querySelector('audio')||{}).currentSrc || ''")
        audio_files = [f for f in glob.glob("assets/audio/*.mp3") if src and os.path.basename(f) == src.rsplit("/", 1)[-1].split("?")[0]]
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
    page.goto(BASE + "pages/writing.html#task2/international-cooperation")
    page.wait_for_timeout(300)
    check(page.is_visible("#task2AlsoReported") and "relationships between countries" in page.inner_text("#task2AlsoReported"), "the second wording of a repeated question is not shown")
    page.goto(BASE + "pages/writing.html#task2/climate")
    page.wait_for_timeout(300)
    check(not page.is_visible("#task2AlsoReported"), "'Also reported' box shows on a question without a second wording")
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
    # Tabs: Today is first; old links still open the right tab.
    check(page.is_visible("#todayPlan") and not page.is_visible("#wordBank"), "Vocabulary should open on the Today tab")
    page.click('[data-tab="words"]')
    page.wait_for_timeout(200)
    check(page.is_visible("#wordBank") and page.evaluate("location.hash") == "#words", "My words tab does not open")
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
    check(page.is_visible("#wordBank"), "reloading does not stay on the same tab")
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
    page.select_option("#topicFilter", "Cause and effect")
    page.wait_for_timeout(200)
    metas = page.evaluate("[...document.querySelectorAll('#wordList .vocab-item .item-meta')].map(m => m.textContent)")
    check(metas and all("Cause and effect" in m for m in metas), "topic filter shows words from other topics")
    page.select_option("#topicFilter", "all")
    # Topics: every word belongs to one of the 12 topics; a topic page lists its words and starts its own flashcards and quiz.
    page.click('[data-tab="topics"]')
    page.wait_for_timeout(200)
    page.evaluate("window.scrollTo(0, 900)")
    page.wait_for_timeout(300)
    gap = page.evaluate("Math.round(document.getElementById('vocabTabs').getBoundingClientRect().top - Math.max(0, document.querySelector('.topbar').getBoundingClientRect().bottom))")
    check(gap >= 0, f"the vocabulary tab bar covers the site header when scrolling ({gap}px)")
    cards = page.locator(".topic-card")
    check(cards.count() == 13, f"expected 13 topic cards, found {cards.count()}")
    total = page.evaluate("[...document.querySelectorAll('.topic-card .topic-meta b:first-child')].reduce((a, b) => a + parseInt(b.textContent), 0)")
    check(total == c["all"], f"topic cards cover {total} words but there are {c['all']}")
    page.click(".topic-card >> nth=5")
    page.wait_for_timeout(200)
    title = page.inner_text("#topicTitle")
    n_words = page.locator("#topicWordList .vocab-item").count()
    check(title and n_words >= 5, f"topic page '{title}' shows {n_words} words")
    page.click("#topicQuiz")
    page.wait_for_timeout(200)
    check(page.is_visible("#dailyQuiz") and "Question 1 of" in page.inner_text("#quizProgress"), "'Quiz on this topic' does not start a quiz")
    check("streak" in page.inner_text("#quizNote") and title in page.evaluate("document.getElementById('quizDeck').selectedOptions[0].textContent"), "topic quiz is not set to the chosen topic")
    page.go_back()
    page.wait_for_timeout(200)
    check(page.is_visible("#topicDetail") and page.inner_text("#topicTitle") == title, "Back button does not return to the topic page")
    page.click("#topicFlashcards")
    page.wait_for_timeout(200)
    check(page.is_visible("#study") and page.inner_text("#studyCounter").startswith("Card 1 of"), "'Flashcards for this topic' does not start flashcards")
    page.goto(BASE + "pages/vocabulary.html#dailyQuiz")
    page.wait_for_timeout(400)
    check(page.is_visible("#dailyQuiz"), "old #dailyQuiz link does not open the Quiz tab")
    # Flashcards: two "Got it" answers memorise a word.
    page.click('[data-tab="flashcards"]')
    page.select_option("#studyDeck", "all")
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
    words = re.findall(r'word:"([^"]+)"', open("js/vocabulary.js", encoding="utf-8").read().split("const QUESTIONS")[0])
    dupes = sorted({w for w in words if [x.lower() for x in words].count(w.lower()) > 1})
    check(not dupes, f"vocabulary has duplicate words: {dupes}")
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
    choose_practice_mode(page)
    page.click("#checkAnswers")
    page.wait_for_timeout(600)
    link = page.evaluate("[...document.querySelectorAll('a[href*=\"share.html\"]')].map(a => a.getAttribute('href')).find(h => /report/.test(h)) || ''")
    check(bool(link), "test results have no 'Spot a mistake? Report it' link")
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


PHONE_LAYOUT_JS = r"""() => {
  const out = {tiny: [], smalltext: [], inputs: [], squeezed: []};
  const shown = el => { const r = el.getBoundingClientRect(); if (!r.width || !r.height) return false;
    for (let p = el; p; p = p.parentElement) { if (p.hidden) return false; const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) return false; }
    return true; };
  const label = el => (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '') + ' "' + (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 25) + '"');
  for (const el of document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button]')) {
    if (!shown(el)) continue;
    const r = el.getBoundingClientRect(), c = getComputedStyle(el);
    if (r.right <= 0 || r.left >= innerWidth) continue;  // off-screen helpers such as "skip to content"
    if (el.tagName === 'A' && c.display === 'inline' && el.closest('p, li, td, blockquote, small, .helper, .note')) continue;  // a link inside a sentence
    const lab = el.closest('label');
    if ((el.type === 'checkbox' || el.type === 'radio') && lab && lab.getBoundingClientRect().height >= 24) continue;
    if (r.width < 24 || r.height < 24) out.tiny.push(label(el) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && !/^(checkbox|radio|range|button|submit|file|color)$/.test(el.type) && parseFloat(c.fontSize) < 16) out.inputs.push(label(el) + ' ' + c.fontSize);
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const seen = new Set(); let n;
  while ((n = walker.nextNode())) {
    const el = n.parentElement; if (!el || seen.has(el) || !n.nodeValue.trim()) continue; seen.add(el);
    if (el.closest('script, style, noscript, svg') || !shown(el)) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < 9) out.smalltext.push(label(el) + ' ' + fs + 'px');
  }
  // Sentences squeezed into a narrow column (words broken in the middle, e.g. "speakin g").
  for (const el of document.querySelectorAll('p, span, strong, b, em, h1, h2, h3, h4, a, button, li, label, small, div')) {
    const own = [...el.childNodes].filter(t => t.nodeType === 3).map(t => t.nodeValue).join('').trim();
    if (own.length < 16 || !/\s/.test(own) || !shown(el)) continue;
    const r = el.getBoundingClientRect(), c = getComputedStyle(el);
    if (r.width >= 100) continue;
    const lh = parseFloat(c.lineHeight) || parseFloat(c.fontSize) * 1.3;
    if (r.height / lh >= 3.5) out.squeezed.push(label(el) + ' ' + Math.round(r.width) + 'px wide');
  }
  for (const k in out) out[k] = [...new Set(out[k])].slice(0, 6);
  return out;
}"""


def test_phone_layout(browser, pw):
    """On phones every button and link is big enough to tap (24px or more), no text is smaller than 9px,
    form fields use 16px text so iPhones don't zoom in, and a phone turned sideways gets the short header."""
    for name in ("iPhone 13", "Galaxy S8"):
        dev = {k: v for k, v in pw.devices[name].items() if k != "default_browser_type"}
        ctx = browser.new_context(**dev, service_workers="block")
        page = ctx.new_page()
        problems = watch(page)
        for path in PAGES:
            page.goto(BASE + path, wait_until="load")
            page.wait_for_timeout(250)
            r = page.evaluate(PHONE_LAYOUT_JS)
            where = f"{name} {path}"
            check(not r["tiny"], f"{where}: too small to tap {r['tiny']}")
            check(not r["smalltext"], f"{where}: text smaller than 9px {r['smalltext']}")
            check(not r["inputs"], f"{where}: form fields under 16px make iPhones zoom in {r['inputs']}")
            check(not r["squeezed"], f"{where}: text squeezed into a narrow column {r['squeezed']}")
        # Listening mode buttons keep their full width (they were once squeezed into a narrow column).
        page.goto(BASE + "pages/listening-test-01.html", wait_until="load")
        page.wait_for_timeout(300)
        info = page.evaluate("""() => { const b = document.getElementById('practice'), s = b.querySelector('strong'), r = document.createRange();
          r.selectNodeContents(s); return {width: b.getBoundingClientRect().width, lines: new Set([...r.getClientRects()].map(x => Math.round(x.top))).size}; }""")
        check(info["width"] >= 200 and info["lines"] == 1, f"{name}: listening 'Practice mode' button is squeezed ({info})")
        no_problems(problems, f"phone layout {name}")
        ctx.close()
    ctx = browser.new_context(viewport={"width": 740, "height": 360}, is_mobile=True, has_touch=True, device_scale_factor=2, service_workers="block")
    page = ctx.new_page()
    for path in ("index.html", "pages/writing.html", "pages/vocabulary.html"):
        page.goto(BASE + path, wait_until="load")
        page.wait_for_timeout(300)
        h = page.evaluate("Math.round(document.querySelector('.topbar').getBoundingClientRect().height)")
        check(h <= 72, f"phone turned sideways, {path}: the header is {h}px tall instead of folding the menu away")
        if page.is_visible("#menuToggle"):
            page.click("#menuToggle")
            page.wait_for_timeout(250)
            links = page.evaluate("[...document.querySelectorAll('#navigation a')].filter(a => a.offsetParent).length")
            check(links >= 5, f"phone turned sideways, {path}: the menu shows {links} links")
        else:
            check(False, f"phone turned sideways, {path}: no menu button")
    ctx.close()


CONTRAST_JS = r"""(limit) => {
  const p = s => (s.match(/[\d.]+/g) || []).map(Number);
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const A = lum(a), B = lum(b); return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05); };
  const blend = (top, under) => { const a = top[3] === undefined ? 1 : top[3]; return [0, 1, 2].map(i => top[i] * a + under[i] * (1 - a)); };
  const bgOf = el => {
    const stack = [];
    for (let e = el; e; e = e.parentElement) {
      const c = getComputedStyle(e);
      if (c.backgroundImage && c.backgroundImage !== 'none' && !/url\(/.test(c.backgroundImage)) {
        const m = c.backgroundImage.match(/rgba?\([^)]+\)/);
        if (m) { const col = p(m[0]); stack.push(col.length === 3 ? [...col, 1] : col); if ((col[3] ?? 1) >= 0.95) break; }
      }
      const col = p(c.backgroundColor);
      if (col.length >= 3) { const a = col.length > 3 ? col[3] : 1; if (a > 0) { stack.push([col[0], col[1], col[2], a]); if (a >= 0.95) break; } }
    }
    let base = document.documentElement.dataset.theme === 'dark' ? [17, 27, 26] : [255, 255, 255];
    for (let i = stack.length - 1; i >= 0; i--) base = blend(stack[i], base);
    return base;
  };
  const out = [], seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const el = n.parentElement, text = n.nodeValue.trim();
    if (!el || seen.has(el) || !text || /^[·•|\/–—-]$/.test(text)) continue;  // separators are decoration
    seen.add(el);
    if (el.closest('script, style, noscript, svg, option, [aria-hidden=true], .sr-only, button:disabled, input:disabled, select:disabled, [aria-disabled=true]')) continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    let hidden = false;
    for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e); if (e.hidden || c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.15) { hidden = true; break; } }
    if (hidden) continue;
    const fg = p(getComputedStyle(el).color); if (fg.length < 3) continue;
    const bg = bgOf(el), col = fg.length > 3 ? blend(fg, bg) : fg, cr = ratio(col, bg);
    if (cr < limit) out.push(el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : '') + ' "' + text.replace(/\s+/g, ' ').slice(0, 25) + '" ' + cr.toFixed(2));
  }
  return [...new Set(out)].slice(0, 6);
}"""


def test_readable_text_light_and_dark(browser, pw):
    """Text is easy to read in light and dark mode (contrast 4:1 or better), on every page and after answers are checked;
    dark mode has no big white boxes."""
    white_box = """() => { const out = [], p = s => (s.match(/\\d+(\\.\\d+)?/g) || []).map(Number);
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect(); if (r.width * r.height < 1200 || el.closest('img, svg, canvas, video, audio, picture, figure, .task-image, mark')) continue;
        let hid = false; for (let q = el; q; q = q.parentElement) { const c = getComputedStyle(q); if (q.hidden || c.display === 'none' || c.visibility === 'hidden') { hid = true; break; } }
        if (hid) continue;
        const [R, G, B, A = 1] = p(getComputedStyle(el).backgroundColor);
        if (A >= 0.6 && (R * 299 + G * 587 + B * 114) / 1000 > 200 && !el.querySelector('img')) out.push(el.tagName.toLowerCase() + '.' + [...el.classList].slice(0, 2).join('.') + ' "' + (el.innerText || '').trim().slice(0, 25) + '"');
      }
      return [...new Set(out)].slice(0, 5); }"""
    phone = {k: v for k, v in pw.devices["Galaxy S8"].items() if k != "default_browser_type"}
    for theme in ("light", "dark"):
        ctx = browser.new_context(**phone, service_workers="block")
        ctx.add_init_script(f"try {{ localStorage.setItem('englisity-theme', '{theme}'); }} catch (e) {{}}")
        page = ctx.new_page()
        problems = watch(page)
        def scan(where):
            bad = page.evaluate(CONTRAST_JS, 4.0)
            check(not bad, f"{theme} {where}: hard to read {bad}")
            if theme == "dark":
                boxes = page.evaluate(white_box)
                check(not boxes, f"dark {where}: white boxes {boxes}")
        for path in PAGES:
            page.goto(BASE + path, wait_until="load")
            page.wait_for_timeout(250)
            scan(path)
        for slug in ("redwoods", "full-test-02"):
            page.goto(BASE + f"pages/{slug}.html", wait_until="load")
            page.wait_for_timeout(300)
            choose_practice_mode(page)
            page.click("#checkAnswers")
            page.wait_for_timeout(300)
            if page.query_selector("#submitAnyway") and page.is_visible("#submitAnyway"):
                page.click("#submitAnyway")
                page.wait_for_timeout(300)
            scan(f"{slug} after checking")
        page.goto(BASE + "pages/listening-test-01.html", wait_until="load")
        page.wait_for_timeout(300)
        page.click("#practice")
        page.wait_for_timeout(300)
        page.evaluate("document.getElementById('submit').click()")
        page.wait_for_timeout(400)
        scan("listening after checking")
        page.goto(BASE + "pages/writing.html#task1/australia-reservoir-levels", wait_until="load")
        page.wait_for_timeout(400)
        scan("writing Task 1")
        no_problems(problems, f"readable text {theme}")
        ctx.close()


def test_new_visitors_and_latest(browser, pw):
    """A first visit shows no empty streak or dashboard; the home page lists the latest questions newest first;
    the writing page lists its four newest tasks; speaking says how recent its questions are; 'Save resource' on a
    writing task saves that task without opening it."""
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    page, problems = open_page(ctx, "index.html", 600)
    check(not page.is_visible(".eng-progress"), "a first-time visitor sees the 0-day streak strip")
    check(not page.is_visible("#myDashboard"), "a first-time visitor sees an empty dashboard")
    dates = page.evaluate("[...document.querySelectorAll('#latest .latest-list time')].map(t => t.getAttribute('datetime'))")
    check(3 <= len(dates) <= 6, f"home 'Latest questions and tests' shows {len(dates)} items")
    check(dates == sorted(dates, reverse=True), f"home latest items are not newest first: {dates}")
    # Writing: the four newest tasks, newest first, and each opens its task.
    page.goto(BASE + "pages/writing.html")
    page.wait_for_timeout(500)
    info = page.evaluate("""() => ({
      shown: [...document.querySelectorAll('#writingLatestList a')].map(a => [a.getAttribute('href'), a.querySelector('time').getAttribute('datetime')]),
      newest: [...document.querySelectorAll('.task-library-card[data-sort-date]')].map(c => c.dataset.sortDate).sort().reverse().slice(0, 4)})""")
    check(page.is_visible("#writingLatest") and len(info["shown"]) == 4, f"writing page does not list 4 latest questions: {info['shown']}")
    check([d for _, d in info["shown"]] == info["newest"], f"writing latest list is not the newest tasks: {info}")
    href = info["shown"][0][0] if info["shown"] else ""
    page.click("#writingLatestList a >> nth=0")
    page.wait_for_timeout(400)
    check(page.evaluate("location.hash") == href and (page.is_visible("#task1Workspace") or page.is_visible("#task2Workspace")), f"latest question link {href} does not open its task")
    check(not page.is_visible("#writingLatest"), "the latest list still shows inside an open task")
    page.go_back()
    page.wait_for_timeout(400)
    check(page.is_visible("#writingLatest") and page.is_visible("#taskChooser"), "Back does not return to the writing start page with the latest list")
    # Save resource on a writing card: saved under the task's own address, and the task does not open.
    page.goto(BASE + "pages/writing.html#task2")
    page.wait_for_timeout(500)
    card = page.locator("#task2TaskGrid .task-library-card").first
    tid = card.get_attribute("data-open-task2-detail")
    card.locator(".eng-save").click()
    page.wait_for_timeout(300)
    saved = page.evaluate("JSON.parse(localStorage.getItem('englisity-bookmarks-v1') || '[]').map(b => b.url)")
    check(any(u.endswith("#task2/" + tid) for u in saved), f"'Save resource' on a writing task saved {saved}")
    check(page.is_visible("#task2Library") and not page.is_visible("#task2Workspace"), "'Save resource' on a writing card also opened the task")
    page.goto(BASE + "index.html")
    page.wait_for_timeout(500)
    check(page.is_visible(".eng-progress"), "after saving something, the progress strip does not show")
    # Speaking: "questions reported up to <newest date>".
    page.goto(BASE + "pages/speaking.html")
    page.wait_for_timeout(500)
    newest = page.evaluate("""() => { const b = window.EnglisitySpeakingBank, order = {October: 10, November: 11, December: 12, January: 13, February: 14, March: 15, April: 16, May: 17, June: 18, July: 19, August: 20, September: 21};
      const v = d => { const [m, n] = String(d || '').split(' '); return (order[m] || 0) * 100 + Number(n || 0); };
      return Object.values(b.sets).flatMap(set => set.flatMap(t => t.questions)).map(q => b.reported(q)).reduce((a, d) => v(d) > v(a) ? d : a, ''); }""")
    fresh = page.inner_text("#speakingFresh") if page.is_visible("#speakingFresh") else ""
    check(bool(newest) and newest in fresh, f"speaking page says {fresh!r}; newest reported date is {newest!r}")
    no_problems(problems, "new visitors and latest lists")
    ctx.close()


def test_ai_writing_check(browser, pw):
    """'Check my writing with AI' sends the open task (with Task 1 chart figures) and shows bands, advice and
    corrections; short answers get a warning first; the daily limit and errors show clear messages."""
    import json as _json
    sent = []
    reply = {"status": 200, "body": {"ok": True, "task": 2, "words": 260, "left": 4, "provider": "workers-ai", "bands": {"TR": 6, "CC": 6, "LR": 5, "GRA": 6}, "overall": 6.0,
             "summary": "A clear answer <b>not bold</b>.", "strengths": ["Clear position"], "improvements": [{"criterion": "LR", "advice": "Use more precise words."}],
             "corrections": [{"original": "more crimes", "better": "more crime", "why": "uncountable"}]}}
    def handle(route):
        sent.append(_json.loads(route.request.post_data))
        route.fulfill(status=reply["status"], content_type="application/json", body=_json.dumps(reply["body"]))
    for name, dev in (("laptop", DESKTOP), ("phone", {k: v for k, v in pw.devices["iPhone 13"].items() if k != "default_browser_type"})):
        ctx = browser.new_context(**dev, service_workers="block")
        ctx.route("**/api/writing-check", handle)
        page, problems = open_page(ctx, "pages/writing.html#task2/youth-crime", 600)
        wrap = "#task2Workspace [data-ai-check]"
        check(page.is_visible(wrap + " .ai-check-btn"), f"{name}: no AI check button on a Task 2 question")
        page.fill("#task2Draft", "word " * 120)
        before = len(sent)
        page.click(wrap + " .ai-check-btn")
        page.wait_for_timeout(200)
        check("120 words" in page.inner_text(wrap + " .ai-result") and len(sent) == before, f"{name}: a short essay is sent without a warning")
        page.click(wrap + " .ai-check-btn")
        page.wait_for_selector(wrap + " .ai-overall", timeout=5000)
        out = page.inner_text(wrap + " .ai-result")
        check(sent and sent[-1]["task"] == 2 and "committing more crimes" in sent[-1]["question"] and len(sent[-1]["essay"].split()) == 120, f"{name}: wrong data sent {sent[-1:]}")
        check("6.0" in out and "Task Response" in out and "Lexical Resource" in out and "more crime" in out and "Use more precise words." in out, f"{name}: result missing parts: {out[:300]}")
        check(page.locator(wrap + " .ai-result b").count() == 0, f"{name}: AI text is shown as HTML")
        reply["status"], reply["body"] = 200, {"error": "limit", "limit": 5}
        page.click(wrap + " .ai-check-btn")
        page.wait_for_timeout(400)
        check("today's 5 free AI checks" in page.inner_text(wrap + " .ai-result"), f"{name}: daily limit message missing")
        reply["status"], reply["body"] = 200, {"error": "ai-failed"}
        page.click(wrap + " .ai-check-btn")
        page.wait_for_timeout(400)
        check("try again" in page.inner_text(wrap + " .ai-result"), f"{name}: error message missing")
        reply["status"], reply["body"] = 200, dict(reply["body"])
        # Task 1 sends the chart figures.
        reply["body"] = {"ok": True, "task": 1, "words": 170, "left": 3, "bands": {"TA": 5, "CC": 6, "LR": 6, "GRA": 6}, "overall": 6.0, "summary": "", "strengths": [], "improvements": [], "corrections": []}
        page.goto(BASE + "pages/writing.html#task1/australia-reservoir-levels")
        page.wait_for_timeout(500)
        page.fill("#task1Draft", "word " * 170)
        page.click("#task1Workspace [data-ai-check] .ai-check-btn")
        page.wait_for_selector("#task1Workspace .ai-overall", timeout=5000)
        check(sent[-1]["task"] == 1 and "Darwin 45 / 25" in sent[-1]["data"], f"{name}: Task 1 chart figures not sent {sent[-1]}")
        check("Task Achievement" in page.inner_text("#task1Workspace .ai-result"), f"{name}: Task 1 result is not on Task Achievement")
        reply["status"], reply["body"] = 200, {"ok": True, "task": 2, "words": 260, "left": 4, "bands": {"TR": 6, "CC": 6, "LR": 5, "GRA": 6}, "overall": 6.0, "summary": "A clear answer <b>not bold</b>.", "strengths": ["Clear position"], "improvements": [{"criterion": "LR", "advice": "Use more precise words."}], "corrections": [{"original": "more crimes", "better": "more crime", "why": "uncountable"}]}
        no_problems(problems, f"AI writing check {name}")
        ctx.close()


def test_ai_speaking_check(browser, pw):
    """'Check my answer with AI' (practice) and 'Get my estimated band' (end of a mock) send the recordings
    with their questions and show bands, transcript and corrections. Uses Chrome's fake microphone."""
    import json as _json
    fake = pw.chromium.launch(args=["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"])
    sent = []
    reply = {"ok": True, "mode": "answer", "left": 7, "cost": 1, "bands": {"FC": 6, "LR": 6, "GRA": 5, "P": 6}, "overall": 6.0,
             "summary": "Clear answer.", "strengths": ["Good ideas"], "improvements": [{"criterion": "GRA", "advice": "Use the past tense for past events."}],
             "corrections": [{"original": "I go there yesterday", "better": "I went there yesterday", "why": "past tense"}],
             "transcripts": [{"part": 2, "text": "I go there yesterday with my friends", "words": 7, "seconds": 4, "wpm": 105}]}
    def handle(route):
        body = route.request.post_data_buffer or b""
        sent.append({"size": len(body), "meta": _json.loads(re.search(rb'name="meta"\r\n\r\n(.*?)\r\n--', body, re.S).group(1)), "files": len(re.findall(rb'name="audio\d"', body))})
        route.fulfill(status=200, content_type="application/json", body=_json.dumps(reply))
    ctx = fake.new_context(**DESKTOP, service_workers="block", permissions=["microphone"])
    ctx.route("**/api/speaking-check", handle)
    page, problems = open_page(ctx, "pages/speaking.html#part2/0/0", 700)
    page.click("#startRecording")
    page.wait_for_timeout(9500)
    page.click("#stopRecording")
    page.wait_for_selector("#practiceAi .speak-ai-btn", state="visible", timeout=5000)
    page.click("#practiceAi .speak-ai-btn")
    page.wait_for_selector("#practiceAi .ai-overall", timeout=8000)
    out = page.inner_text("#practiceAi .ai-result")
    meta = sent[-1]["meta"] if sent else {}
    check(sent and meta.get("mode") == "answer" and sent[-1]["files"] == 1 and meta["parts"][0]["part"] == 2 and "You should say" in meta["parts"][0]["questions"][0] and meta["parts"][0]["seconds"] >= 9, f"practice answer sent wrongly: {meta}")
    check("6.0" in out and "Pronunciation" in out and "I went there yesterday" in out and "Fluency and Coherence" in out, f"practice result missing parts: {out[:300]}")
    page.click("#practiceAi .ai-transcript summary")
    check("about 105 words a minute" in page.inner_text("#practiceAi .ai-transcript"), "transcript is not shown")
    # Full mock with recording: one AI recording per part (Part 2 only while talking).
    reply["mode"] = "mock"
    page.goto(BASE + "pages/speaking.html#mock/1")
    page.wait_for_timeout(500)
    page.check("#mockRecord")
    page.click("#mockBegin")
    page.wait_for_timeout(600)
    for _ in range(40):
        if page.query_selector(".mock-end"):
            break
        if page.query_selector("#mockNotes"):
            page.fill("#mockNotes", "notes")
        page.click("#mockNext")
        page.wait_for_timeout(700)
    page.wait_for_selector("#mockAi .speak-ai-btn", timeout=8000)
    page.click("#mockAi .speak-ai-btn")
    page.wait_for_selector("#mockAi .ai-overall", timeout=8000)
    meta = sent[-1]["meta"]
    parts = [p["part"] for p in meta["parts"]]
    check(meta["mode"] == "mock" and parts == [1, 2, 3] and sent[-1]["files"] == 3, f"mock sent {parts} with {sent[-1]['files']} recordings")
    check(len(meta["parts"][0]["questions"]) >= 8 and "You should say" in meta["parts"][1]["questions"][0] and len(meta["parts"][2]["questions"]) == 5, "mock questions not sent with each part")
    check(sent[-1]["size"] < 2_000_000, f"mock upload is {sent[-1]['size']} bytes")
    no_problems(problems, "AI speaking check")
    ctx.close()
    fake.close()


def test_my_progress(browser, pw):
    """My progress shows real results: finished tests and AI checks are kept on the device and turned into
    an estimated band per skill, an overall band when all four skills have one, and a list of recent results."""
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    page, problems = open_page(ctx, "pages/progress.html", 400)
    check(page.is_visible("#pgEmpty") and "Page visits" not in page.inner_text("main"), "a new student does not see the empty state on My progress")
    check(page.locator('.sb-nav a.on').inner_text().strip() == "My progress", "sidebar does not highlight My progress")
    # Finish a 40-question listening test and get Writing and Speaking marked (the same calls the site makes).
    page.goto(BASE + "pages/listening-test-01.html")
    page.wait_for_timeout(300)
    page.evaluate("EnglisityTrack.finish(30, 40); EnglisityTrack.finish(30, 40)")
    page.goto(BASE + "pages/passage-1.html")
    page.wait_for_timeout(300)
    page.evaluate("document.body.classList.add('exam-mode'); EnglisityTrack.finish(27, 40, 'Reading: Full test')")
    page.evaluate("EnglisityTrack.finish(12, 18, 'AI writing check: Task 2 youth-crime'); EnglisityTrack.finish(13, 18, 'AI speaking check: answer')")
    page.goto(BASE + "pages/progress.html")
    page.wait_for_timeout(400)
    skills = page.evaluate("Object.fromEntries([...document.querySelectorAll('.pg-skill[data-skill]')].map(a => [a.dataset.skill, a.querySelector('b').textContent]))")
    check(skills == {"listening": "7.0", "reading": "6.5", "writing": "6.0", "speaking": "6.5"}, f"bands per skill: {skills}")
    check(page.is_visible("#pgOverall") and page.inner_text("#pgOverall b") == "6.5", "no overall band when all four skills have one")
    items = page.locator("#pgRecent li").count()
    check(items == 4, f"recent results should list 4 (the duplicate listening result once), got {items}")
    check("Exam mode" in page.inner_text("#pgRecent") and "30 / 40" in page.inner_text("#pgRecent"), "recent results miss scores or the exam-mode tag")
    # Old home dashboard link goes to the new page; the home page no longer shows page visits.
    page.goto(BASE + "index.html#myDashboard")
    page.wait_for_timeout(600)
    check(page.url.endswith("pages/progress.html"), f"old dashboard link opens {page.url}")
    no_problems(problems, "my progress")
    ctx.close()
    phone = {k: v for k, v in pw.devices["iPhone 13"].items() if k != "default_browser_type"}
    ctx = browser.new_context(**phone, service_workers="block")
    page, problems = open_page(ctx, "pages/progress.html", 400)
    check(page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), "My progress is wider than a phone screen")
    no_problems(problems, "my progress phone")
    ctx.close()


def test_full_mock_test(browser, pw):
    """Full Mock Test 1: Writing and Speaking sections save their results, the hub shows progress, a resume
    banner and the estimated band; the sidebar menu shows on laptops (not on phones or exam screens)."""
    import json as _json
    ctx = browser.new_context(**DESKTOP, service_workers="block")
    marked = []
    def fake_mark(route):
        t = _json.loads(route.request.post_data)["task"]
        marked.append(t)
        route.fulfill(status=200, content_type="application/json", body=_json.dumps({"ok": True, "task": t, "words": 200, "left": 3, "bands": {"TR": 6, "CC": 6, "LR": 6, "GRA": 6},
            "overall": 6.0 if t == 1 else 7.0, "summary": "Fine.", "strengths": [], "improvements": [], "corrections": []}))
    ctx.route("**/api/writing-check", fake_mark)
    page, problems = open_page(ctx, "pages/mock-tests.html", 500)
    check(page.is_hidden("#mkScore") and page.is_hidden("#mkResume"), "a new student already sees a band card or a resume banner")
    check(page.is_visible(".sb") and not page.is_visible(".topbar"), "laptop: the sidebar menu is not shown")
    links = page.evaluate("[...document.querySelectorAll('.sb-nav a')].map(a => a.textContent.trim())")
    check(links[:2] == ["Home", "Full mock tests"] and "Vocabulary" in links and "My progress" in links, f"sidebar links: {links}")
    check(page.locator(".sb-nav a.on").inner_text().strip() == "Full mock tests", "sidebar does not highlight the current page")
    page.click(".mk-card .mk-btn.pri")
    page.wait_for_timeout(400)
    check(page.url.endswith("mock-02-listening.html"), f"Start test on the newest mock opens {page.url}")
    page.go_back()
    page.wait_for_timeout(300)
    titles = page.evaluate("[...document.querySelectorAll('.mk-card h3')].map(h => h.textContent)")
    check(titles == ["Full Mock Test 2", "Full Mock Test 1"] and "Coming soon" not in page.inner_text("main"), f"hub cards: {titles}")
    page.click(".mk-card:nth-child(2) .mk-btn.pri")
    page.wait_for_timeout(400)
    check(page.url.endswith("mock-01-listening.html"), f"Start Full Mock Test 1 opens {page.url}")
    page.goto(BASE + "pages/mock-02-speaking.html")
    page.wait_for_timeout(400)
    t = page.inner_text("#mockSection")
    check(page.is_visible(".mock-start") and "MOCK 2" in t and "street markets" in t and not page.is_visible(".card-link"), "Full Mock Test 2 Speaking does not open its own test")
    page.goto(BASE + "pages/mock-02-writing.html")
    page.wait_for_timeout(300)
    check("mobile phones" in page.inner_text("#mwTask1") and page.evaluate("document.querySelector('.mw-chart').naturalWidth") > 0, "Full Mock Test 2 Writing Task 1 or its chart is missing")
    check(not page.is_visible(".sb"), "the sidebar covers an exam screen")
    # Writing: answers are kept, finishing saves the section.
    page.goto(BASE + "pages/mock-01-writing.html")
    page.wait_for_timeout(400)
    page.fill("#task1Draft", "word " * 160)
    page.reload()
    page.wait_for_timeout(400)
    check(len(page.input_value("#task1Draft").split()) == 160, "writing is not saved after a reload")
    check("Darwin" not in page.content() and "Quality of air in cities" in page.get_attribute(".mw-chart", "alt"), "Task 1 chart missing")
    page.click('.mw-tab[data-task="2"]')
    check(page.is_visible("#task2Draft") and not page.is_visible("#task1Draft"), "Task 2 tab does not switch tasks")
    page.fill("#task2Draft", "word " * 260)
    check(page.query_selector_all(".ai-check-btn:visible") == [] and "Check my writing" not in page.inner_text("main"), "an AI check is offered in the middle of the mock exam")
    page.click("#mwFinish")
    page.wait_for_timeout(1200)
    check(page.is_visible("#mwSummary") and "mock-01-speaking.html" in page.inner_html("#mwSummary"), "finishing writing does not lead to Speaking")
    check(sorted(marked) == [1, 2] and "6.5" in page.inner_text("#mwBand"), f"after finishing, both tasks are not marked by AI: {marked}, {page.inner_text('#mwBand')!r}")
    check(page.is_hidden("#task1Draft") and page.is_hidden("#mwFinish"), "the exam is still editable after finishing")
    check(page.evaluate("EnglisityMock.get('mock-01').writing.band") == 6.5, "the Writing band is not saved for the hub")
    page.click("#mockAutoNext .stay")
    # Speaking: the fixed mock runs to the end and is saved.
    page.goto(BASE + "pages/mock-01-speaking.html")
    page.wait_for_timeout(500)
    page.uncheck("#mockRecord")
    page.click("#mockBegin")
    page.wait_for_timeout(300)
    asked = set()
    for _ in range(40):
        if page.query_selector(".mock-end"):
            break
        q = page.query_selector(".mock-q")
        if q:
            asked.add(q.inner_text().strip())
        if page.query_selector("#mockNotes"):
            page.fill("#mockNotes", "notes")
        page.click("#mockNext")
        page.wait_for_timeout(100)
    page.wait_for_timeout(400)
    check(page.query_selector(".mock-end") is not None, "the speaking section does not reach its end screen")
    check(any("expensive watches" in a for a in asked) and any("traditional products" in a for a in asked), f"speaking questions missing: {sorted(asked)[:5]}")
    check("Describe a traditional product that is made in your country." in page.text_content(".mock-review"), "the cue card is not on the end screen")
    page.goto(BASE + "pages/mock-tests.html")
    page.wait_for_timeout(400)
    check(page.is_visible("#mkResume") and "Listening next" in page.inner_text("#mkResume"), "the hub does not offer to resume with Listening")
    page.evaluate("EnglisityMock.save('mock-01', 'listening', {score: 30, total: 40, band: EnglisityMock.listeningBand(30)}); EnglisityMock.save('mock-01', 'reading', {score: 27, total: 40, band: EnglisityMock.readingBand(27)}); EnglisityMock.save('mock-01', 'writing', {band: 6}); EnglisityMock.save('mock-01', 'speaking', {band: 6})")
    page.reload()
    page.wait_for_timeout(400)
    check(page.inner_text("#mkBig").strip() == "6.5" and "FULL TEST" in page.inner_text("#mkConf"), f"overall band for 7/6.5/6/6 should be 6.5, got {page.inner_text('#mkBig')}")
    # Exam-day flow: each section leads into the next by itself; a 10-minute break before Speaking.
    page.goto(BASE + "pages/mock-01-listening.html")
    page.wait_for_timeout(300)
    page.click("#exam")
    page.evaluate("document.getElementById('audio').dispatchEvent(new Event('ended'))")
    page.wait_for_timeout(1200)
    check("to check your answers" in page.inner_text("#status"), "after the recording ends there is no 2-minute checking time")
    page.evaluate("document.getElementById('submit').click()")
    page.wait_for_timeout(300)
    check(page.is_visible("#mockAutoNext") and "Reading starts in" in page.inner_text("#mockAutoNext"), "no countdown to Reading after Listening")
    page.click("#mockAutoNext .go")
    page.wait_for_timeout(700)
    check("mock-01-reading.html?start=exam" in page.url and page.is_hidden("#modeGate") and page.evaluate("document.body.classList.contains('exam-mode')"), "Reading does not start in exam mode after Listening")
    page.click("#checkAnswers")
    page.wait_for_timeout(300)
    if page.is_visible("#submitAnyway"):
        page.click("#submitAnyway")
        page.wait_for_timeout(300)
    check("Writing starts in" in page.inner_text("#mockAutoNext"), "no countdown to Writing after Reading")
    page.click("#mockAutoNext .stay")
    check(page.query_selector("#mockAutoNext") is None and page.is_visible(".ft-next-section"), "'Stay and review' does not stop the countdown")
    page.goto(BASE + "pages/mock-01-writing.html")
    page.wait_for_timeout(300)
    page.evaluate("const k='englisity-mock-01-writing'; const s=JSON.parse(localStorage.getItem(k)); s.started=Date.now()-3601000; s.finished=false; localStorage.setItem(k, JSON.stringify(s))")
    page.reload()
    page.wait_for_timeout(1500)
    check(page.is_visible("#mwSummary") and "break starts in" in page.inner_text("#mockAutoNext"), "Writing does not finish by itself when time is up")
    page.click("#mockAutoNext .go")
    page.wait_for_timeout(1300)
    check(page.is_visible("#mkBreak") and page.is_hidden("#mockSection") and page.inner_text("#mkBreakTime").startswith("09:"), "no 10-minute break before Speaking")
    page.click("#mkBreakSkip")
    page.wait_for_timeout(300)
    check(page.is_visible("#mockBegin"), "skipping the break does not show the Speaking test")
    no_problems(problems, "full mock test")
    ctx.close()
    phone = {k: v for k, v in pw.devices["iPhone 13"].items() if k != "default_browser_type"}
    ctx = browser.new_context(**phone, service_workers="block")
    page, problems = open_page(ctx, "pages/mock-tests.html", 400)
    check(not page.is_visible(".sb") and page.is_visible(".topbar"), "phone: the sidebar shows instead of the top bar")
    page.click("#menuToggle")
    page.wait_for_timeout(250)
    check(page.is_visible('#navigation a[href$="mock-tests.html"]'), "phone menu has no Mock tests link")
    no_problems(problems, "full mock test phone")
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
