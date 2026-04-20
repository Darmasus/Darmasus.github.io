# Darmasus.github.io

A single-page ePortfolio that pulls public repositories live from the GitHub
REST API and renders them as a typeset specimen catalog.

- **Stack:** pure static HTML / CSS / JS. No build step, no framework.
- **Fonts:** Fraunces + JetBrains Mono (Google Fonts).
- **Data:** `https://api.github.com/users/Darmasus/repos` — refreshed every visit.

## Local preview

```bash
# any static server works; pick one:
python -m http.server 8000
# or
npx serve .
```

Then open http://localhost:8000.

## Deploy to GitHub Pages

1. Create a repo named **`Darmasus.github.io`** on GitHub (must match your
   username exactly for a user-scoped Pages site).
2. From this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/Darmasus/Darmasus.github.io.git
   git push -u origin main
   ```
3. In the repo's **Settings → Pages**, confirm the source is `main` branch,
   root folder. The site will be live at
   <https://Darmasus.github.io> within a minute.

## Editing

- Hero copy, statement, and colophon live in `index.html`.
- Typography, palette, and layout in `styles.css` (see the `:root` block).
- Repo rendering, filtering, and description overrides in `app.js`
  (search for `OVERRIDES` to polish descriptions for repos without one).
- To hide a repo (e.g. a fork), add its name to the `HIDDEN` set in `app.js`.
