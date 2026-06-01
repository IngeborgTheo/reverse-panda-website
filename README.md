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
└── live/                   # Full website (preview until launch)
    ├── index.html
    ├── styles.css
    └── script.js
```

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new user-facing functionality
- `fix:` bug fixes
- `chore:` tooling, config, maintenance
