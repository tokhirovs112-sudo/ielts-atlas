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
