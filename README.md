# ReversePanda Website

This repository hosts the public website for ReversePanda on GitHub Pages.

## Parallel setup (current)

| URL | Purpose | Status |
| --- | --- | --- |
| `https://reverse-panda.ch/` | Temporary coming-soon page | **Public** |
| `https://reverse-panda.ch/live/` | Full website preview / development | **Preview only** (`noindex`) |

### How to work

1. Keep editing the root `index.html` only for urgent coming-soon changes.
2. Build the real website inside the `live/` folder.
3. Test locally or on GitHub Pages at `/live/`.
4. When you are ready to launch, replace the root site with the `live/` version.

### Go-live checklist

- [ ] Copy or move `live/` files to the project root (or replace root `index.html` and assets).
- [ ] Remove the preview banner and `noindex` meta tag.
- [ ] Verify `CNAME` still points to `reverse-panda.ch`.
- [ ] Test contact email, favicon, and mobile layout.
- [ ] Optional: remove the old `/live/` path or redirect it to `/`.

## Project structure

```text
/
├── index.html              # Public coming-soon page
├── CNAME                   # Custom domain for GitHub Pages
├── assets/logo/            # Shared brand assets
├── privacy/                # Public Privacy Policy (/privacy)
└── live/                   # Full website (preview until launch)
    ├── index.html
    ├── contact.html
    ├── firebase-config.js  # Public Firebase / reCAPTCHA site config
    ├── firebase.js         # App Check, Functions, Storage init
    ├── contact.js
    ├── styles.css
    └── script.js
```

## Contact form + Firebase

The Contact page uses the **existing** Android feedback backend:

- Callable: `submitFeedback` (`europe-west1`)
- App Check: reCAPTCHA Enterprise (web) — separate from Play Integrity
- Optional bug screenshots → `feedback-temp/<uuid>/<uuid>.<ext>`
- Mail delivery via Resend to `support@reverse-panda.ch`

Public client config lives in `live/firebase-config.js`.  
Do not put `RESEND_API_KEY` or Admin/Functions secrets in the website.

### Local App Check debug workflow

Production reCAPTCHA Enterprise is registered for `reverse-panda.ch` / `www.reverse-panda.ch` only. Localhost uses App Check debug tokens:

1. Serve the site locally (ES modules need HTTP, not `file://`), e.g. from repo root:
   `npx --yes serve live`
2. Open the Contact page in the browser.
3. Open developer tools → Console. Firebase prints an App Check **debug token**.
4. Copy that token.
5. Firebase Console → App Check → ReversePanda Website → Manage debug tokens → register it.
6. Refresh the website.
7. Submit Say Hello / Bug / Feature forms to exercise `submitFeedback`.

Do not disable App Check enforcement.  
Do not commit registered debug tokens.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new user-facing functionality
- `fix:` bug fixes
- `chore:` tooling, config, maintenance