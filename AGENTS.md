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
