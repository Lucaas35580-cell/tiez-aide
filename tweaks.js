/* ─────────────────────────────────────────────────────────
   Tiez Aide — Tweaks panel
   Three expressive knobs: palette, voice, density.
   Follows the host edit-mode protocol.
   ───────────────────────────────────────────────────────── */
(function () {
  const DEFAULTS = window.__TWEAKS_DEFAULTS__ || {
    palette: 'bretagne',
    voice: 'editorial',
    density: 'aere'
  };

  /* current state */
  const state = { ...DEFAULTS };

  /* ── apply: writes state to <body data-*> ─────────────── */
  function apply() {
    document.body.setAttribute('data-palette', state.palette);
    document.body.setAttribute('data-voice',   state.voice);
    document.body.setAttribute('data-density', state.density);
  }
  /* run apply immediately so persisted defaults take effect on load */
  if (document.body) apply();
  else document.addEventListener('DOMContentLoaded', apply, { once: true });

  /* ── tweak definitions ────────────────────────────────── */
  const TWEAKS = [
    {
      key: 'palette',
      title: 'Palette',
      hint: 'Ambiance chromatique',
      options: [
        { value: 'bretagne', label: 'Bretagne', swatch: ['#2E5B8A','#4A9B6F','#E8845A'] },
        { value: 'terre',    label: 'Terre',    swatch: ['#8B4A3A','#C99454','#4F7A75'] },
        { value: 'ardoise',  label: 'Ardoise',  swatch: ['#3D4F66','#6B8E6E','#B8923C'] },
      ],
      render: (opt) => `
        <span class="tw-swatch" aria-hidden="true">
          <i style="background:${opt.swatch[0]}"></i>
          <i style="background:${opt.swatch[1]}"></i>
          <i style="background:${opt.swatch[2]}"></i>
        </span>
        <span>${opt.label}</span>
      `
    },
    {
      key: 'voice',
      title: 'Voix',
      hint: 'Personnalité typographique',
      options: [
        { value: 'editorial', label: 'Éditorial', cls: 'editorial', glyph: 'Aa' },
        { value: 'moderne',   label: 'Moderne',   cls: 'moderne',   glyph: 'Aa' },
        { value: 'affiche',   label: 'Affiche',   cls: 'affiche',   glyph: 'Aa' },
      ],
      render: (opt) => `
        <span class="tw-type tw-type--${opt.cls}" aria-hidden="true">${opt.glyph}</span>
        <span>${opt.label}</span>
      `
    },
    {
      key: 'density',
      title: 'Souffle',
      hint: 'Rythme & espacement',
      options: [
        { value: 'aere',     label: 'Aéré',     bars: 'aere' },
        { value: 'standard', label: 'Standard', bars: 'standard' },
        { value: 'compact',  label: 'Compact',  bars: 'compact' },
      ],
      render: (opt) => `
        <span class="tw-bars tw-bars--${opt.bars}" aria-hidden="true">
          <i></i><i></i><i></i>
        </span>
        <span>${opt.label}</span>
      `
    },
  ];

  /* ── DOM ──────────────────────────────────────────────── */
  const panel = document.createElement('div');
  panel.className = 'tw-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Tweaks');
  panel.innerHTML = `
    <div class="tw-panel__head">
      <span class="tw-panel__title">Tweaks</span>
      <button type="button" class="tw-panel__close" aria-label="Fermer">×</button>
    </div>
    <div class="tw-panel__body">
      ${TWEAKS.map(t => `
        <div class="tw-group" data-tweak="${t.key}">
          <div class="tw-group__label">
            <span>${t.title}</span>
            <span class="tw-group__hint">${t.hint}</span>
          </div>
          <div class="tw-segs" role="radiogroup" aria-label="${t.title}">
            ${t.options.map(opt => `
              <button type="button" class="tw-seg" role="radio"
                      aria-pressed="${state[t.key] === opt.value ? 'true' : 'false'}"
                      data-value="${opt.value}">
                ${t.render(opt)}
              </button>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
  /* hidden until the host activates edit mode */
  document.body.appendChild(panel);

  /* ── wire up buttons ──────────────────────────────────── */
  panel.querySelectorAll('.tw-group').forEach(group => {
    const key = group.dataset.tweak;
    group.querySelectorAll('.tw-seg').forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.value;
        if (state[key] === value) return;
        state[key] = value;
        /* update pressed state in this group */
        group.querySelectorAll('.tw-seg').forEach(b => {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        apply();
        /* persist via host */
        try {
          window.parent.postMessage(
            { type: '__edit_mode_set_keys', edits: { [key]: value } },
            '*'
          );
        } catch (e) { /* noop in standalone */ }
      });
    });
  });

  /* ── close button ─────────────────────────────────────── */
  panel.querySelector('.tw-panel__close').addEventListener('click', () => {
    panel.classList.remove('is-open');
    try {
      window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
    } catch (e) { /* noop */ }
  });

  /* ── host protocol ────────────────────────────────────── */
  /* REGISTER LISTENER FIRST */
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.type === '__activate_edit_mode')   panel.classList.add('is-open');
    if (d.type === '__deactivate_edit_mode') panel.classList.remove('is-open');
  });
  /* THEN announce availability */
  try {
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
  } catch (e) { /* noop */ }
})();
