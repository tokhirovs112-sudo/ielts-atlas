# Englisity

**Englisity** is a free, browser-based English-learning platform built to help learners practise IELTS skills, develop vocabulary, and discover useful reading and listening resources.

🌐 **Live site:** https://tokhirovs112-sudo.github.io/ielts-atlas/

## What you can do

- **Reading:** practise with individual IELTS-style passages and review answers.
- **Listening:** use guided listening resources and available practice tests.
- **Writing:** work on IELTS writing tasks and keep drafts for later.
- **Speaking:** explore speaking prompts and record answers for personal review.
- **Vocabulary:** study words with flashcards, quizzes, and a word bank.
- **Articles and podcasts:** explore English-learning resources across different levels and topics.

The platform is a work in progress. Some areas and planned features may not yet be available; the site labels unfinished sections where possible.

## Built with

- HTML, CSS, and vanilla JavaScript
- GitHub Pages for hosting
- Browser storage for selected local progress and saved work
- A service worker and web app manifest for installable/offline-support features

No build step or package installation is required for the static site.

## Run locally

1. Clone or download this repository.
2. Serve the repository folder using a local static web server.
3. Open the local site URL in a browser.

A local server is recommended because service workers and some browser features do not behave the same when pages are opened directly from a file URL.

## Project status

Englisity is actively developed. The individual skill pages and resource library are available, while the complete three-passage Reading test is still being prepared. The project prioritizes clear instructions, responsive layouts, accessible controls, and readable light/dark themes.

## Quality checks

The repository includes automated checks for JavaScript syntax, daily-streak behaviour, and broken local HTML asset references. On GitHub, these run through the **Site quality checks** workflow after pushes and pull requests.

To run the checks locally, use Node.js and Python 3:

```bash
for file in js/*.js; do node --check "$file"; done
node --check sw.js
TZ=Asia/Tashkent node scripts/test-streak.js
python scripts/check-site.py
```

## Important notes

- Englisity is an independent learning project, not an official IELTS product or a substitute for official test materials.
- Saved progress is generally stored in the current browser/device; it is not a user-account cloud sync system.
- Listening, speaking, and scoring features can vary by exercise. Check each activity's instructions before starting.

## Contributing and feedback

If you find a broken link, accessibility issue, incorrect answer, or confusing interaction, please open a GitHub issue with the page name and steps to reproduce it. Small, specific reports are especially helpful.
