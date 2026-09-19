# Tools Hub

A lightweight, offline-first Progressive Web App containing a growing collection of useful everyday tools. Built with pure HTML, CSS, and Vanilla JavaScript. No frameworks. No backend. No database.

## Live Demo

Deploy to GitHub Pages — see [Deployment](#deployment) below.

## Features

| Tool | Category | Description |
|---|---|---|
| Price Comparison | Shopping | Compare items by price-per-unit to find the best deal |
| Value Calculator | Shopping | Score products on price, quality, and quantity |
| Random Food Picker | Lifestyle | Randomly choose what to eat, with custom food lists |
| Percentage Calculator | Math | 6 modes: percent of, what %, percent change, add/remove %, markup |
| Unit Converter | Math | 6 categories: length, weight, temp, volume, area, speed |
| Random Choice Picker | Lifestyle | Add options and pick at random; history saved locally |
| Finance Calculator | Finance | Loan, compound interest, savings goal, ROI |
| Text Utilities | Productivity | Stats, 20+ transforms, encode/decode |
| Everyday Utilities | Lifestyle | Tip splitter, age, date diff, speed, BMI, discount |

## Tech Stack

- **HTML5** — semantic, accessible
- **CSS3** — custom properties, mobile-first layout
- **Vanilla JavaScript** — no frameworks
- **PWA** — Web App Manifest + Service Worker
- **localStorage** — user preferences and custom data

## Offline First

The app uses a **Cache-First Service Worker** strategy. After the first online load, all tools work completely offline.

Cached resources include:
- All HTML pages
- CSS and JavaScript
- JSON data files
- PWA icons

## Project Structure

```
/
├── index.html          # Home page
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker
├── offline.html        # Offline fallback
├── /tools/             # Individual tool pages
├── /data/              # JSON data files
│   ├── tools.json      # Tool registry
│   ├── foods.json      # Default food list
│   └── categories.json # Category definitions
├── /assets/
│   ├── /css/style.css  # Global design system
│   ├── /js/common.js   # Shared utilities
│   ├── /js/app.js      # Home page logic
│   └── /icons/         # PWA icons
└── /docs/README.md
```

## Deployment

### GitHub Pages

1. Push the project to a GitHub repository
2. Go to **Settings > Pages**
3. Set source to `main` branch, `/ (root)` folder
4. Access at `https://your-username.github.io/your-repo-name/`

> All paths are relative — the app works at any subpath without changes.

### Local development

Open `index.html` directly in a browser, or use a local server:

```bash
# Python
python -m http.server 8080

# Node.js (npx)
npx serve .
```

## Adding a New Tool

1. Create `/tools/your-tool.html` using the shared template (copy an existing tool)
2. Add the tool entry to `/data/tools.json`
3. Add the tool page path to the `PRECACHE_URLS` array in `sw.js`
4. Bump `CACHE_NAME` in `sw.js` (e.g. `tools-hub-v2`)

## Design System

All pages use a single CSS file with CSS custom properties. Do not create per-tool stylesheets.

Key tokens: `--bg`, `--surface`, `--text`, `--primary`, `--border`, `--radius`, `--space-*`

## License

MIT — free to use and modify.
