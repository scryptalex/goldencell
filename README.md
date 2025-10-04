Golden Cell — Static Site

Overview
- Multilingual static website for Golden Cell in 9 languages.
- Golden theme design with SVG brand assets and illustrations.
- Ready for GitHub Pages deployment via Actions workflow.

Local Preview
- Open `index.html` in your browser.
- Switch language via the dropdown (persists in `localStorage`).

Customize
- Edit translations: `assets/i18n/*.json`.
- Colors/styles: `assets/css/styles.css`.
- Logos/images: `assets/img/`.
- Pages: `about.html`, `technology.html`, `therapies.html`, `products.html`, `pipeline.html`, `team.html`, `investors.html`, `contact.html`, `privacy.html`, `careers.html`.

GitHub Pages Deploy (via Actions)
1) Create a GitHub repo (or let me run the commands with your repo URL).
2) Push this folder contents to the repo default branch (e.g., `main`).
3) Ensure Pages source is set to "GitHub Actions". The provided workflow publishes the static site.
4) (Optional) Add `CNAME` file with your custom domain.

Manual publish alternative
- Enable Pages from `main` branch and `/` root, or move files into `/docs` and choose `/docs` as Pages source.

