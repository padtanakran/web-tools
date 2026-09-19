/**
 * app.js — Home page logic.
 * Loads tools.json and categories.json, renders tool cards,
 * handles search and category filtering.
 */

(function () {
  'use strict';

  // ---- State ----
  let allTools = [];
  let allCategories = [];
  let activeCategory = 'all';
  let searchQuery = '';

  // ---- Init ----
  async function init() {
    registerServiceWorker('./sw.js');

    try {
      const [toolsRes, catsRes] = await Promise.all([
        fetch('./data/tools.json'),
        fetch('./data/categories.json'),
      ]);
      allTools = await toolsRes.json();
      allCategories = await catsRes.json();
    } catch (err) {
      console.error('Failed to load data:', err);
      showLoadError();
      return;
    }

    buildCategoryTabs();
    renderRecentTools();
    renderTools();
    bindSearch();
    bindInstallBanner();
  }

  // ---- Category tabs ----
  function buildCategoryTabs() {
    const container = $id('category-tabs');
    if (!container) return;

    // "All" tab
    const allTab = makeTab('all', 'All Tools');
    container.appendChild(allTab);

    allCategories.forEach(cat => {
      container.appendChild(makeTab(cat.id, cat.label));
    });
  }

  function makeTab(id, label) {
    const btn = document.createElement('button');
    btn.className = 'filter-tab' + (id === 'all' ? ' active' : '');
    btn.textContent = label;
    btn.dataset.category = id;
    btn.setAttribute('aria-pressed', id === 'all' ? 'true' : 'false');
    btn.addEventListener('click', () => {
      activeCategory = id;
      $qsa('.filter-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.category === id);
        t.setAttribute('aria-pressed', t.dataset.category === id ? 'true' : 'false');
      });
      renderTools();
    });
    return btn;
  }

  // ---- Search ----
  function bindSearch() {
    const input = $id('search-input');
    if (!input) return;
    input.addEventListener('input', () => {
      searchQuery = input.value.trim().toLowerCase();
      renderTools();
    });
  }

  // ---- Filter logic ----
  function getFilteredTools() {
    return allTools.filter(tool => {
      const matchesCat = activeCategory === 'all' || tool.category === activeCategory;
      const matchesSearch = !searchQuery
        || tool.name.toLowerCase().includes(searchQuery)
        || tool.description.toLowerCase().includes(searchQuery)
        || tool.category.toLowerCase().includes(searchQuery);
      return matchesCat && matchesSearch;
    });
  }

  // ---- Render tools grid ----
  function renderTools() {
    const grid = $id('tools-grid');
    if (!grid) return;

    const filtered = getFilteredTools();
    grid.innerHTML = '';

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          ${getIcon('search')}
          <p>No tools found for "<strong>${escapeHtml(searchQuery || activeCategory)}</strong>".</p>
        </div>`;
      return;
    }

    filtered.forEach(tool => {
      const card = buildToolCard(tool);
      grid.appendChild(card);
    });

    // Update visible count
    const countEl = $id('tools-count');
    if (countEl) countEl.textContent = `${filtered.length} tool${filtered.length !== 1 ? 's' : ''}`;
  }

  // ---- Tool card builder ----
  const TOOL_ICONS = {
    'price-comparison': 'shopping-cart',
    'value-calculator': 'star',
    'random-food':      'utensils',
    'percentage-calc':  'percent',
    'unit-converter':   'ruler',
    'random-choice':    'shuffle',
    'finance-calc':     'dollar-sign',
    'text-utils':       'type',
    'everyday-utils':   'grid',
  };

  function buildToolCard(tool) {
    const iconName = TOOL_ICONS[tool.id] || 'tool';

    const card = document.createElement('a');
    card.className = 'tool-card';
    card.href = tool.path;
    card.setAttribute('aria-label', `${tool.name} — ${tool.description}`);
    card.addEventListener('click', () => recordToolVisit(tool.id));

    card.innerHTML = `
      <div class="tool-card-icon" aria-hidden="true">${getIcon(iconName)}</div>
      <div class="tool-card-category">${escapeHtml(getCategoryLabel(tool.category))}</div>
      <div class="tool-card-name">${escapeHtml(tool.name)}</div>
      <div class="tool-card-desc">${escapeHtml(tool.description)}</div>
      <div class="tool-card-cta">Open tool ${getIcon('arrow-right')}</div>
    `;

    return card;
  }

  // ---- Recent tools ----
  function renderRecentTools() {
    const section = $id('recent-section');
    const grid = $id('recent-grid');
    if (!section || !grid) return;

    const recentIds = getRecentTools();
    if (recentIds.length === 0) {
      section.classList.add('hidden');
      return;
    }

    const recentTools = recentIds
      .map(id => allTools.find(t => t.id === id))
      .filter(Boolean);

    if (recentTools.length === 0) {
      section.classList.add('hidden');
      return;
    }

    section.classList.remove('hidden');
    grid.innerHTML = '';
    recentTools.forEach(tool => grid.appendChild(buildToolCard(tool)));
  }

  // ---- Install banner ----
  function bindInstallBanner() {
    const banner = $id('install-banner');
    const installBtn = $id('install-btn');
    const dismissBtn = $id('install-dismiss');

    if (!banner || !installBtn || !dismissBtn) return;

    const dismissed = lsGet('tools-hub:install-dismissed', false);
    if (dismissed) return;

    // Show banner when PWA install event fires
    document.addEventListener('pwa-installable', () => {
      banner.classList.remove('hidden');
    });

    installBtn.addEventListener('click', async () => {
      const accepted = await showInstallPrompt();
      if (accepted) banner.classList.add('hidden');
    });

    dismissBtn.addEventListener('click', () => {
      banner.classList.add('hidden');
      lsSet('tools-hub:install-dismissed', true);
    });
  }

  // ---- Helpers ----
  function getCategoryLabel(id) {
    const cat = allCategories.find(c => c.id === id);
    return cat ? cat.label : id;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showLoadError() {
    const grid = $id('tools-grid');
    if (grid) {
      grid.innerHTML = `<div class="alert alert-danger" style="grid-column:1/-1">
        Failed to load tools. Please check your connection and reload.
      </div>`;
    }
  }

  // ---- Start ----
  document.addEventListener('DOMContentLoaded', init);
})();
