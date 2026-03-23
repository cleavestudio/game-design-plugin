/* ============================================
   INSPECTOR — Spec tooltips on Alt+Hover
   Hold Alt and hover over elements to see specs.
   ============================================ */

(function() {
  let tooltip = null;
  let currentTarget = null;
  let altHeld = false;

  function init() {
    tooltip = document.createElement('div');
    tooltip.id = 'inspector-tooltip';
    Object.assign(tooltip.style, {
      position: 'fixed',
      zIndex: '99999',
      background: 'var(--sys-bg, #1a1a2e)',
      border: '1px solid var(--sys-accent, #7c6cf0)',
      borderRadius: '4px',
      padding: '12px 16px',
      maxWidth: '360px',
      fontSize: '13px',
      fontFamily: 'var(--sys-font, Inter, sans-serif)',
      color: 'var(--sys-text, #b8b8d0)',
      pointerEvents: 'none',
      display: 'none',
      boxShadow: '0 4px 20px rgba(124, 108, 240, 0.2)',
      lineHeight: '1.5'
    });
    document.body.appendChild(tooltip);

    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    document.addEventListener('mousemove', onMouseMove);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Alt') {
        e.preventDefault();
        altHeld = true;
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'Alt') {
        altHeld = false;
        if (currentTarget) {
          currentTarget.classList.remove('inspector-highlight');
          currentTarget = null;
        }
        hideTooltip();
      }
    });
  }

  function findSpecElement(el) {
    while (el && el !== document.body) {
      if (el.dataset && (el.dataset.specStates || el.dataset.specInteractions || el.dataset.specData || el.dataset.specName)) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  function onMouseOver(e) {
    if (!altHeld) return;
    const specEl = findSpecElement(e.target);
    if (!specEl || specEl === currentTarget) return;

    if (currentTarget) currentTarget.classList.remove('inspector-highlight');

    currentTarget = specEl;
    currentTarget.classList.add('inspector-highlight');
    showTooltip(specEl);
  }

  function onMouseOut(e) {
    if (!altHeld) return;
    const specEl = findSpecElement(e.relatedTarget);
    if (specEl === currentTarget) return;

    if (currentTarget) {
      currentTarget.classList.remove('inspector-highlight');
      currentTarget = null;
    }
    hideTooltip();
  }

  function onMouseMove(e) {
    if (tooltip.style.display === 'none') return;

    let x = e.clientX + 16;
    let y = e.clientY + 16;

    const rect = tooltip.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) x = e.clientX - rect.width - 8;
    if (y + rect.height > window.innerHeight) y = e.clientY - rect.height - 8;

    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  }

  function showTooltip(el) {
    let html = '';

    const name = el.dataset.specName;
    if (name) {
      html += `<div style="font-family: var(--sys-font-mono, monospace); font-size: 12px; font-weight: 700; color: var(--sys-accent, #7c6cf0); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--sys-border, #333355);">${name}</div>`;
    }

    const sections = [
      { key: 'specStates', label: 'STATES' },
      { key: 'specInteractions', label: 'INTERACTIONS' },
      { key: 'specData', label: 'DATA' },
      { key: 'specNotes', label: 'NOTES' }
    ];

    for (const s of sections) {
      const value = el.dataset[s.key];
      if (!value) continue;

      html += `<div style="font-family: var(--sys-font-mono, monospace); font-size: 10px; font-weight: 700; color: var(--sys-text-dim, #6e6e8a); letter-spacing: 1.5px; margin-top: 8px; margin-bottom: 4px;">${s.label}</div>`;

      const items = value.split('|').map(s => s.trim());
      for (const item of items) {
        html += `<div style="padding-left: 8px; margin-bottom: 2px;">• ${item}</div>`;
      }
    }

    if (!html) {
      hideTooltip();
      return;
    }

    tooltip.innerHTML = html;
    tooltip.style.display = 'block';
  }

  function hideTooltip() {
    tooltip.style.display = 'none';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
