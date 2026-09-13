# ReversePanda Website

Public website for ReversePanda, served from GitHub Pages.

**Production:** https://reverse-panda.ch/

## Structure

```text
/
├── index.html           # Homepage
├── contact.html         # Contact / feedback
├── privacy.html         # Privacy Policy
├── privacy/index.html   # Redirects /privacy → /privacy.html
├── styles.css
├── script.js
├── previews.js
├── contact.js
├── firebase.js          # App Check, Functions, Storage
├── firebase-config.js   # Public Firebase / reCAPTCHA site config
├── CNAME                # reverse-panda.ch
└── assets/              # Logos and story imagery
```

Static HTML/CSS/JS only — no build framework. Firebase client SDK is loaded from the CDN.

## Contact form + Firebase

The Contact page uses the existing Android feedback backend:

- Callable: `submitFeedback` (`europe-west1`)
- App Check: reCAPTCHA Enterprise (web)
- Optional bug screenshots → `feedback-temp/<uuid>/<uuid>.<ext>`
- Mail delivery via Resend to `support@reverse-panda.ch`

Public client config: `firebase-config.js`  
Never put `RESEND_API_KEY` or Admin/Functions secrets in this repository.

### Local App Check debug workflow

Production reCAPTCHA Enterprise is registered for `reverse-panda.ch` / `www.reverse-panda.ch` only. Localhost uses App Check debug tokens:

1. Serve the site locally (ES modules need HTTP, not `file://`):
   `npx --yes serve .`
2. Open the Contact page.
3. DevTools → Console → copy the App Check **debug token**.
4. Firebase Console → App Check → ReversePanda Website → Manage debug tokens → register it.
5. Refresh and test Say Hello / Bug / Feature submissions.

Do not disable App Check enforcement.  
Do not commit registered debug tokens.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new user-facing functionality
- `fix:` bug fixes
- `chore:` tooling, config, maintenance
