# Testing the site locally

Quick steps to run and verify the login, language switch and avatar dropdown locally.

1. Start a static HTTP server from the site's root (where `index.html` is located):

```bash
cd "/workspaces/web/lavoro 2 scuola"
python3 -m http.server 8000
```

2. Open the site in your browser:

- Login page: http://localhost:8000/login.html
- Home page: http://localhost:8000/index.html

3. Test flow

- On `login.html`:
  - Choose language in the form (العربية / Italiano).
  - Fill a username and password (these are stored client-side for demo). Optionally upload an avatar image.
  - Click "تسجيل الدخول" / "Accedi". You will be redirected to `index.html`.

- On `index.html`:
  - The header shows an avatar on the right. Click it to open a compact dropdown with user info and a logout button.
  - Use the language selector in the header (the select with id `language-select`) to pick 🇸🇦 or 🇮🇹. The page text (elements marked with `data-key` or `data-translate`) will update without reloading.
  - Open a country details modal (المزيد / Altro). If you change language while a modal is open, its content will refresh in the new language.

4. Data locations

- Translations: `/lang/ar.json` and `/lang/it.json` (loaded by `js/i18n.js`).
- Scripts: `js/i18n.js`, `assets/js/main-impl.js`, `assets/js/login-impl.js`.
- Country data: `data/countries_ar.json` and `data/countries_it.json` (used by modals).

5. Notes & debugging

- If translations do not appear, check the browser console for fetch errors (path should be `/lang/{ar|it}.json`).
- If login seems to redirect constantly, inspect `localStorage.userData` via DevTools Application tab.
- To reset state: open DevTools -> Application -> Local Storage -> delete `userData`, `selectedLang`, `lang`, `language`, `quizScore`.

If you want, I can:
- Move the remaining JS files (`rulers.js`, `quiz.js`, `book.js`, `admin.js`) into `assets/js` and update their references too,
- Sweep the entire HTML to add `data-key` keys for full site translation coverage and update `lang/*.json` accordingly,
- Implement language-specific quiz/book loaders (fetch `data/quiz_{lang}.json`) and re-render on `langChanged`.

Tell me which follow-up you prefer and I implement it next.
