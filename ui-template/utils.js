/* ============================================
   UI Design System — Shared Utilities
   Imported by Components, Screens, and Flows
   to eliminate boilerplate duplication.
   ============================================ */

/**
 * Inject a stylesheet into <head> once.
 * @param {string} id — unique ID for the <style> element
 * @param {string} css — CSS text
 */
export function injectStyles(id, css) {
  if (!document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
}

/**
 * Set inspector spec metadata on an element.
 * @param {HTMLElement} el
 * @param {{ name: string, states?: string, interactions?: string, data?: string }} spec
 */
export function setSpec(el, spec) {
  el.dataset.specName = spec.name;
  if (spec.states) el.dataset.specStates = spec.states;
  if (spec.interactions) el.dataset.specInteractions = spec.interactions;
  if (spec.data) el.dataset.specData = spec.data;
}

/**
 * Simple screen router for Flows.
 * Creates flow-frame containers, renders screens, returns show() function.
 * @param {HTMLElement} container — flow root
 * @param {Object<string, { render: Function, label?: string }>} screens — { id: { render, label } }
 * @returns {{ show: (id: string) => void }}
 */
export function createRouter(container, screens) {
  const ids = Object.keys(screens);
  container.innerHTML = ids.map((id, i) =>
    `<div class="flow-frame${i > 0 ? ' flow-hidden' : ''}" id="${id}"></div>`
  ).join('');

  for (const [id, screen] of Object.entries(screens)) {
    screen.render(container.querySelector('#' + id));
  }

  return {
    show(id) {
      container.querySelectorAll('.flow-frame').forEach(f =>
        f.classList.toggle('flow-hidden', f.id !== id)
      );
    }
  };
}
