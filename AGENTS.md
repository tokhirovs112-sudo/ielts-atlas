# Permanent project features

## Article learning system — DO NOT REMOVE

The article learning flow is a permanent Englisity feature. Do not delete, disable, replace, or remove it during unrelated updates unless the user explicitly asks for its removal.

Every article page must retain:
- A visible **Start article quiz** button in its static HTML inside `.article-end`.
- The `js/article-learning.js` script include with a cache-busting version.
- Its article-specific comprehension quiz (5 questions).
- Vocabulary flashcards.
- A vocabulary multiple-choice quiz.
- Separate comprehension and vocabulary scores saved in local storage.

When adding a new article:
1. Add its slug and article-specific quiz/vocabulary data to `js/article-learning.js`.
2. Add the static quiz-start button and script include to the article HTML.
3. Ensure the article contains both `.article-body` and `.article-end`.
4. Update the article-learning script cache-busting version in article pages and `sw.js`.
5. Keep the learning script in the service worker's core cache so the feature remains available offline.

When editing existing article pages or the shared learning script, preserve this feature and all existing article content. Never replace the static button with a JavaScript-generated button.

# Tests — run before every push

- `python tests/test-site.py` opens every page in a real browser (laptop, iPhone, Android sizes) and uses each feature: reading tests score full marks with their own answer keys, listening mocks score 40/40, every cue card has its points, every writing task opens, vocabulary, article quizzes, forms, streak and offline mode. Add a check here whenever a new feature is added.
- `node tests/test-worker.mjs` tests the form endpoint and audio byte ranges in `worker/index.js`.
- GitHub runs both on every push (Site quality checks) and checks outside links (YouTube etc.) every Monday.

# Full Reading tests

- Each full test is `pages/full-test-NN.html` + `js/full-test-NN-data.js` (passages, questions, answers, evidence) and shares the engine `js/full-test.js`. Every question's `e` (evidence) must be copied exactly from its paragraph so "Show in passage" can highlight it; `tests/test-site.py` checks this for every reading test.
- "Show in passage" (exact-sentence highlight + "Back to question" bar) lives in `js/reading-exit.js` and works for every reading test that puts the evidence in a `<blockquote>` next to a `.view-in-test` link.

# Home page "Latest questions and tests"

- `index.html` has a "Latest questions and tests" list (`#latest`): five items, newest first, each with its date in `<time datetime="YYYY-MM-DD">`. Whenever new questions or tests go live, add a line at the top and remove the oldest one. `tests/test-site.py` checks the order.
- The Writing page's "Latest reported questions" list is built automatically from the four newest task cards (`data-sort-date`), and the Speaking page's "questions reported up to …" line from the newest date in the question bank, so they need no manual update.
- Speaking dates have no year: October–December are 2026 and January–September are 2027 (`monthIndex` in `pages/speaking.html`).

# Phones and readability

- `tests/test-site.py` also checks every page on iPhone and Android sizes: tap targets at least 24px, no text under 9px, form fields at 16px (so iPhones don't zoom), no sentence squeezed into a narrow column, a short header when a phone is turned sideways, and text contrast of at least 4:1 in light and dark mode (plus no white boxes in dark mode).
- Grey helper text uses `var(--ink-XXXXXX,#XXXXXX)`: darker in light mode, the original shade in dark mode (defined at the end of `css/design.css`). Use these variables for new grey text instead of a lighter grey.

# AI writing check

- Writing page: "Check my writing with AI" (`js/writing-ai.js`) posts to `/api/writing-check` (`worker/writing-check.js`), which marks against summaries of the public IELTS band descriptors and returns JSON (bands, overall, strengths, improvements, corrections). The overall band is calculated in the Worker, not by the AI.
- Provider: Cloudflare Workers AI (`ai` binding, model `@cf/openai/gpt-oss-120b`, free daily allowance) unless the secret `ANTHROPIC_API_KEY` is set, then Claude Haiku 5.5. Limits per day in table `ai_usage`: 5 per device, 12 per network, 40 in total on Workers AI (400 with Claude).
- Every Task 1 task in `pages/writing.html` needs a `data:` line with the chart/table/map figures, so the AI can check the numbers. Add it whenever a Task 1 task is added.
- Live self-test: `GET /api/writing-check?selftest=0|1|2` marks built-in essays at about band 5, 6.5 and 8 (`worker/writing-samples.js`); results are cached for 6 hours.
- Essays are never stored. Tests: `tests/test-worker.mjs` (endpoint, limits, rounding, Claude switch) and `test_ai_writing_check` in `tests/test-site.py`.

# AI speaking check

- Speaking page: "Check my answer with AI" under the practice recorder, and "Get my estimated band with AI" at the end of a mock test (only when recording was on). Client: `js/speaking-ai.js`; the mock keeps a second, low-bitrate recording per part (Part 2 only while talking) in `js/speaking-mock.js`.
- `/api/speaking-check` (`worker/speaking-check.js`): multipart form (`meta` JSON + `audio0..2`), Whisper `@cf/openai/whisper-large-v3-turbo` for the transcript, then the same AI as the writing check, marked on FC, LR, GRA and P using a summary of the official Speaking band descriptors. Pronunciation is labelled a rough estimate (the AI only sees text). Recordings are never stored.
- Limits share the "all" daily pool with writing (an answer costs 1, a full mock 4); 8 speaking points per device and 16 per network a day.
- Daily self-test (cron): transcribes `assets/audio/selftest/answer.webm` and `.m4a` and marks the WebM one; result in `ai_selftest` (key `speaking-selftest`).
