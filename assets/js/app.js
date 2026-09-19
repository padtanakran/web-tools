/**
 * app.js — Home page logic (POS UI Edition)
 * Loads tools.json and categories.json, renders POS square tool cards.
 */

(function () {
  'use strict';

  // ---- State ----
  let allTools = [];
  let allCategories = [];

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

    renderTools();
    bindInstallBanner();
  }

  // ---- Render tools grid ----
  function renderTools() {
    const grid = $id('tools-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (allTools.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <p>ไม่พบรายการเครื่องมือ</p>
        </div>`;
      return;
    }

    allTools.forEach(tool => {
      const card = buildToolCard(tool);
      grid.appendChild(card);
    });
  }

  // ---- Tool card builder (Square POS Tile) ----
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
    card.dataset.cat = tool.category;
    card.setAttribute('aria-label', `${tool.name} — ${tool.description}`);
    card.addEventListener('click', () => recordToolVisit(tool.id));

    card.innerHTML = `
      <div class="tool-card-icon" aria-hidden="true">${getIcon(iconName)}</div>
      <div class="tool-card-name">${escapeHtml(tool.name)}</div>
      <div class="tool-card-category">${escapeHtml(getCategoryLabel(tool.category))}</div>
    `;

    return card;
  }

  // ---- Install banner ----
  function bindInstallBanner() {
    const banner = $id('install-banner');
    const installBtn = $id('install-btn');
    const dismissBtn = $id('install-dismiss');

    if (!banner || !installBtn || !dismissBtn) return;

    const dismissed = lsGet('tools-hub:install-dismissed', false);
    if (dismissed) return;

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
        ไม่สามารถโหลดรายการเครื่องมือได้ กรุณาลองใหม่อีกครั้ง
      </div>`;
    }
  }

  // ---- Start ----
  document.addEventListener('DOMContentLoaded', init);
})();
