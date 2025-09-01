# Family Travel Globe

A lightweight 3D, click‑to‑color globe you can host on GitHub Pages. Click a country to mark it as:
- **Visited** (green)
- **Intend** (yellow)
- **Not visited** (grey)

Your selections are saved in your browser (localStorage). You can export/import a JSON file to move your data to another device.

## Quick Start (Local)
Just open `index.html` in a modern browser with internet access. (External JS libraries & the world GeoJSON are loaded from CDNs.)

## Deploy on GitHub Pages
1. Create a repo named `family-travel` (or any name you like).
2. Upload these files (or use the Git commands below).
3. In the repository settings, enable **Pages** → **Deploy from branch** → `main` → `/root`.
4. Your site will be live at `https://<your-username>.github.io/<repo>/`.

## Git Commands
```bash
git init
git add .
git commit -m "Family Travel Globe initial commit"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/family-travel.git
git push -u origin main
```

## How it works
- Renders a 3D earth via **three.js** and **three-globe**.
- Loads country polygons from a public GeoJSON.
- Clicking a country sets the current status (toolbar) and re-colors the polygon.
- State is saved to `localStorage` under the key `family-travel-status-v1`.

## Notes
- If you prefer not to rely on third‑party CDNs, you can vendor the JS files & GeoJSON locally and adjust the `<script>`/fetch URLs.
- You can customize colors in `style.css` and `app.js` (`COLORS` map).

MIT License.
