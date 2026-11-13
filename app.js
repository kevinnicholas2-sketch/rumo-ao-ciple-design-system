(() => {
'use strict';

/* ---------- Colour maths ---------- */
const hexOk = h => typeof h === 'string' && /^#[0-9a-f]{6}$/i.test(h);
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = a => '#' + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };
const lum = h => { const [r, g, b] = rgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05); };
const onC = bg => (ratio(bg, '#FFFFFF') >= ratio(bg, '#111111') ? '#FFFFFF' : '#111111');
function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, l = (max + min) / 2;
  let h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6; else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return [h, s, l];
}
function hslToRgb([h, s, l]) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
const rotate = (hex, deg) => { const [h, s, l] = rgbToHsl(rgb(hex)); return toHex(hslToRgb([((h + deg) % 360 + 360) % 360, s, l])); };
const r1 = n => Math.round(n * 10) / 10;
const px = n => r1(n) + 'px';
const fmtRatio = r => (Math.floor(r * 100) / 100).toFixed(2) + ':1';

/* ---------- Data ---------- */
const FONTS = {
  'Fraunces':               { stack: "'Fraunces', Georgia, serif",                    weights: [400, 500, 600, 700] },
  'Source Sans 3':          { stack: "'Source Sans 3', system-ui, sans-serif",       weights: [400, 500, 600, 700] },
  'Source Serif 4':         { stack: "'Source Serif 4', Georgia, serif",              weights: [400, 500, 600, 700] },
  'Literata':               { stack: "'Literata', Georgia, serif",                    weights: [400, 500, 600, 700] },
  'Lora':                   { stack: "'Lora', Georgia, serif",                        weights: [400, 500, 600, 700] },
  'Inter':                  { stack: "'Inter', system-ui, sans-serif",                weights: [400, 500, 600, 700] },
  'DM Sans':                { stack: "'DM Sans', system-ui, sans-serif",              weights: [400, 500, 600, 700] },
  'Nunito Sans':            { stack: "'Nunito Sans', system-ui, sans-serif",          weights: [400, 500, 600, 700] },
  'Atkinson Hyperlegible':  { stack: "'Atkinson Hyperlegible', system-ui, sans-serif", weights: [400, 700] },
};

// Roles replace the old brand names. Legacy names stay as aliases so nothing downstream breaks:
// red = error, gold = accent, tile blue = secondary, paper = background, ink = text, line = border.
const ROLE_GROUPS = [
  ['Brand', [
    ['primary', 'Primary', 'Sidebar, buttons, progress'],
    ['secondary', 'Secondary', 'Tile blue: azulejo patterns, numbering'],
    ['accent', 'Accent', 'Streak, highlights, focus rings'],
    ['on-primary', 'Label on primary and secondary', 'Text on filled buttons and the sidebar'],
  ]],
  ['Neutrals', [
    ['background', 'Background', 'Page ground'],
    ['surface', 'Surface', 'Cards and raised things'],
    ['text', 'Text', 'Body text'],
    ['muted', 'Muted text', 'Labels, footer'],
    ['border', 'Border', 'Dividers and card edges'],
    ['border-strong', 'Border strong', 'Inputs and controls (needs 3:1)'],
  ]],
  ['Feedback', [
    ['success', 'Success', 'Correct answers, saved'],
    ['warning', 'Warning', 'Time running out'],
    ['error', 'Error', 'Countdown, emphasis, mistakes'],
    ['info', 'Info', 'Tips and notices'],
  ]],
];
const ROLE_IDS = ROLE_GROUPS.flatMap(([, l]) => l.map(r => r[0]));

const lightFrom = (paper, ink, primary, secondary, accent, error, o = {}) => Object.assign({
  primary, secondary, accent, 'on-primary': onC(primary),
  background: paper, surface: mix(paper, ink, .045), text: ink, muted: mix(ink, paper, .3),
  border: mix(paper, ink, .16), 'border-strong': mix(ink, paper, .42),
  success: '#1B7F4B', warning: '#B45309', error, info: '#2563EB',
}, o);

const BASE_TYPE = {
  heading: 'Source Serif 4', body: 'Source Sans 3',
  w: { heading: 600, subheading: 600, button: 600, label: 600, body: 400 },
  title: 32, titleMobile: 26, section: 22, reading: 18, instr: 16, label: 14, display: 64,
  printTitle: 22, printBody: 12,
  lhReading: 1.6,
  sp: {
    h1: { lh: 1.1, ls: -0.02 }, h2: { lh: 1.15, ls: -0.015 }, h3: { lh: 1.25, ls: -0.01 },
    body: { lh: 1.5, ls: 0 }, label: { lh: 1.4, ls: 0.08 }, button: { lh: 1.2, ls: 0 },
  },
  btnCaps: false,
  scale: { on: false, base: 16, ratio: 1.25 },
};
const clone = o => JSON.parse(JSON.stringify(o));
const TYPE = (o = {}, w = {}) => { const t = clone(BASE_TYPE); Object.assign(t, o); Object.assign(t.w, w); return t; };

const AZ_DARK = { primary: '#4FB387', secondary: '#7FA6DD', accent: '#E6B94A', 'on-primary': '#0F1713', background: '#0F1713', surface: '#17221C', text: '#ECE7D8', muted: '#9DB0A5', border: '#2B3A32', 'border-strong': '#6B8176', success: '#5CCB92', warning: '#F2B84B', error: '#EF7B74', info: '#6EA8F5' };
const VI_DARK = { primary: '#7FA8E8', secondary: '#5FBF8F', accent: '#E6B94A', 'on-primary': '#0E141C', background: '#0E141C', surface: '#172029', text: '#E7EAEE', muted: '#9AA6B4', border: '#2A3441', 'border-strong': '#66778C', success: '#5CCB92', warning: '#F2B84B', error: '#EF7B74', info: '#6EA8F5' };

const DEFAULT = {
  name: 'Azulejo', mode: 'light',
  roles: { light: lightFrom('#FBF6EA', '#1A2620', '#0F5C3A', '#1E4F94', '#E0B03A', '#C4302B'), dark: Object.assign({}, AZ_DARK) },
  gen: { base: '#4F46E5', harmony: 'complementary' },
  type: TYPE(),
  space: { unit: 4, v: 2 },
  layout: { cols: 12, g: 3, m: 4, mode: 'combo', bp0: 360, bp1: 560, bp2: 768, w: 640, overlay: false, snap: false, content: 'web', t0: 320, t1: 375, t2: 768, t3: 1024, big: false },
  shape: { radius: 10, border: 1 },
};

const PRESETS = [
  DEFAULT,
  { name: 'Vidrado', mode: 'light',
    roles: { light: lightFrom('#F8F5EC', '#17202B', '#1B4B8A', '#0F5C3A', '#E0B03A', '#C4302B'), dark: Object.assign({}, VI_DARK) },
    gen: { base: '#1B4B8A', harmony: 'analogous' },
    type: TYPE({ heading: 'Literata', body: 'Inter' }), space: { unit: 4, v: 2 }, shape: { radius: 6, border: 1 } },
  { name: 'Noite', mode: 'light',
    roles: { light: lightFrom('#14201B', '#F2ECDD', '#2E8B63', '#6E9BD8', '#E6B94A', '#E0574F', { success: '#4CC38A', warning: '#F2B84B', info: '#60A5FA' }), dark: Object.assign({}, AZ_DARK) },
    gen: { base: '#2E8B63', harmony: 'triadic' },
    type: TYPE({ heading: 'DM Sans', body: 'DM Sans' }, { heading: 700 }), space: { unit: 4, v: 2 }, shape: { radius: 14, border: 1 } },
  { name: 'Indigo', mode: 'light',
    roles: {
      light: { primary: '#4F46E5', secondary: '#9F46E5', accent: '#F59E0B', 'on-primary': '#FFFFFF', background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A', muted: '#64748B', border: '#E2E8F0', 'border-strong': '#7C8AA0', success: '#198754', warning: '#B45309', error: '#C92A2A', info: '#2563EB' },
      dark:  { primary: '#8B85F0', secondary: '#C084F0', accent: '#F59E0B', 'on-primary': '#0F1117', background: '#0F1117', surface: '#1A1D24', text: '#E6E8EC', muted: '#9AA4B2', border: '#2C313C', 'border-strong': '#6B7688', success: '#4CC38A', warning: '#F2B84B', error: '#F87171', info: '#60A5FA' } },
    gen: { base: '#4F46E5', harmony: 'complementary' },
    type: TYPE({ heading: 'Inter', body: 'Inter' }), space: { unit: 4, v: 2 }, shape: { radius: 8, border: 1 } },
];

PRESETS.forEach(p => { if (!p.layout) p.layout = JSON.parse(JSON.stringify(DEFAULT.layout)); });

const HARMONIES = {
  complementary: ['Complementary', [['Complementary', 180]]],
  analogous:     ['Analogous',     [['Analogous −30°', -30], ['Analogous +30°', 30]]],
  triadic:       ['Triadic',       [['Triadic +120°', 120], ['Triadic +240°', 240]]],
  split:         ['Split complementary', [['Split +150°', 150], ['Split +210°', 210]]],
};
const RAMP = [[50, 'white', .92], [100, 'white', .8], [200, 'white', .6], [300, 'white', .4], [400, 'white', .2], [500, null, 0],
              [600, 'black', .2], [700, 'black', .4], [800, 'black', .6], [900, 'black', .8]];
const AMOUNTS = [.15, .3, .45, .6, .75];
const RATIO_PRESETS = [['Minor Third 1.2', 1.2], ['Major Third 1.25', 1.25], ['Perfect Fourth 1.333', 1.333], ['Golden Ratio 1.618', 1.618]];
const WROLES = [['body', 'Body', 'body'], ['label', 'Label', 'body'], ['subheading', 'Subheading', 'body'], ['button', 'Button', 'body'], ['heading', 'Heading', 'heading']];
const SP_STEPS = [['h1', 'H1'], ['h2', 'H2'], ['h3', 'H3 / subheading'], ['body', 'Body'], ['label', 'Label (all caps)'], ['button', 'Button']];
const SPACE_STEPS = [1, 2, 3, 4, 6, 8, 12, 16];
const MODE_NAME = { light: 'Light', dark: 'Dark' };

/* ---------- State ---------- */
let state = clone(DEFAULT);
let viewOnly = false;
let picked = null, applyTarget = 'primary';

const key = k => (k === '@' ? state.mode : k);
const get = (o, p) => p.split('.').reduce((a, k) => a[key(k)], o);
const set = (o, p, v) => { const ks = p.split('.'); const last = key(ks.pop()); ks.reduce((a, k) => a[key(k)], o)[last] = v; };

/* ---------- Effective type sizes (manual sliders, or driven by the modular scale) ---------- */
function sizesOf(t) {
  const s = t.scale, o = { title: t.title, titleMobile: t.titleMobile, section: t.section, reading: t.reading, instr: t.instr, label: t.label, display: t.display };
  if (s.on) {
    const r = s.ratio, b = s.base;
    Object.assign(o, { instr: b, reading: b * r ** .5, label: b / r ** .5, section: b * r ** 2, title: b * r ** 3, titleMobile: b * r ** 2.5, display: b * r ** 4 });
  }
  return o;
}

/* ---------- Tokens ---------- */
function tokens(s, mode = s.mode) {
  const r = s.roles[mode], t = s.type, u = s.space.unit, rad = s.shape.radius, z = sizesOf(t);
  const list = [];
  const add = (group, name, value) => list.push({ group, name: '--cip-' + name, value: String(value) });

  add('Color', 'color-primary', r.primary);
  add('Color', 'color-on-primary', r['on-primary']);
  add('Color', 'color-primary-soft', mix(r.background, r.primary, .14));
  add('Color', 'color-secondary', r.secondary);
  add('Color', 'color-accent', r.accent);
  add('Color', 'color-on-accent', onC(r.accent));
  add('Color', 'color-background', r.background);
  add('Color', 'color-surface', r.surface);
  add('Color', 'color-text', r.text);
  add('Color', 'color-muted', r.muted);
  add('Color', 'color-border', r.border);
  add('Color', 'color-border-strong', r['border-strong']);
  add('Color', 'color-success', r.success);
  add('Color', 'color-warning', r.warning);
  add('Color', 'color-error', r.error);
  add('Color', 'color-on-error', onC(r.error));
  add('Color', 'color-info', r.info);

  add('Legacy aliases', 'color-red', 'var(--cip-color-error)');
  add('Legacy aliases', 'color-on-red', 'var(--cip-color-on-error)');
  add('Legacy aliases', 'color-gold', 'var(--cip-color-accent)');
  add('Legacy aliases', 'color-on-gold', 'var(--cip-color-on-accent)');
  add('Legacy aliases', 'color-tile-blue', 'var(--cip-color-secondary)');
  add('Legacy aliases', 'color-on-tile-blue', 'var(--cip-color-on-primary)');
  add('Legacy aliases', 'color-paper', 'var(--cip-color-background)');
  add('Legacy aliases', 'color-ink', 'var(--cip-color-text)');
  add('Legacy aliases', 'color-line', 'var(--cip-color-border)');

  const pt = n => (Math.round(n * 2) / 2) + 'pt';
  add('Typography', 'font-heading', FONTS[t.heading].stack);
  add('Typography', 'font-body', FONTS[t.body].stack);
  add('Typography', 'fw-heading', t.w.heading);
  add('Typography', 'fw-subheading', t.w.subheading);
  add('Typography', 'fw-ui', t.w.subheading);
  add('Typography', 'fw-button', t.w.button);
  add('Typography', 'fw-label', t.w.label);
  add('Typography', 'fw-body', t.w.body);
  add('Typography', 'fs-title', px(z.title));
  add('Typography', 'fs-title-mobile', px(z.titleMobile));
  add('Typography', 'fs-section', px(z.section));
  add('Typography', 'fs-reading', px(z.reading));
  add('Typography', 'fs-body', px(z.instr));
  add('Typography', 'fs-label', px(z.label));
  add('Typography', 'fs-display', px(z.display));
  add('Typography', 'fs-print-title', pt(t.printTitle));
  add('Typography', 'fs-print-heading', pt(t.printBody * 7 / 6));
  add('Typography', 'fs-print-body', pt(t.printBody));
  add('Typography', 'fs-print-label', pt(t.printBody * 5 / 6));
  SP_STEPS.forEach(([k]) => { add('Typography', 'lh-' + k, t.sp[k].lh); add('Typography', 'ls-' + k, t.sp[k].ls + 'em'); });
  add('Typography', 'tt-button', t.btnCaps ? 'uppercase' : 'none');
  add('Typography', 'lh-reading', t.lhReading);

  const ly = s.layout || DEFAULT.layout, bpS = [ly.bp0, ly.bp1, ly.bp2].slice().sort((a, b) => a - b);
  add('Layout', 'grid-cols', ly.cols);
  add('Layout', 'gutter', `var(--cip-space-${ly.g})`);
  add('Layout', 'margin', `var(--cip-space-${ly.m})`);
  ['sm', 'md', 'lg'].forEach((k, i) => add('Layout', 'bp-' + k, px(bpS[i])));
  add('Spacing', 'space-unit', px(u));
  SPACE_STEPS.forEach(n => add('Spacing', 'space-' + n, `calc(${n} * var(--cip-space-unit))`));

  add('Shape', 'radius-sm', px(rad * .5));
  add('Shape', 'radius-md', px(rad));
  add('Shape', 'radius-lg', px(rad * 1.5));
  add('Shape', 'radius-pill', '999px');
  add('Shape', 'border-width', px(s.shape.border));
  return list;
}

const tileSvg = (col, op) => {
  const c = col.replace('#', '%23');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'><g fill='none' stroke='${c}' stroke-opacity='${op}' stroke-width='1.6'><circle cx='0' cy='0' r='24'/><circle cx='48' cy='0' r='24'/><circle cx='0' cy='48' r='24'/><circle cx='48' cy='48' r='24'/><circle cx='24' cy='24' r='9'/><path d='M24 15v18M15 24h18'/></g><circle cx='24' cy='24' r='3' fill='${c}' fill-opacity='${op}'/></svg>`;
  return `url("data:image/svg+xml,${svg.replace(/"/g, "'").replace(/</g, '%3C').replace(/>/g, '%3E')}")`;
};

function applyTokens() {
  const root = document.documentElement.style;
  const list = tokens(state);
  list.forEach(({ name, value }) => root.setProperty(name, value));
  const r = state.roles[state.mode];
  root.setProperty('--pv-tile', tileSvg(r.secondary, .55));
  root.setProperty('--pv-tile-light', tileSvg(r['on-primary'], .35));
  return list;
}

/* ---------- DOM helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const PX = v => v + ' px', PT = v => v + ' pt', X2 = v => v.toFixed(2), RT = v => String(+v.toFixed(3));
const SLIDERS = {
  typoWeb: [
    ['type.title', 'Page title, desktop', 28, 40, 1, PX, 'title'],
    ['type.titleMobile', 'Page title, mobile', 22, 30, 1, PX, 'titleMobile'],
    ['type.section', 'Section heading', 18, 28, 1, PX, 'section'],
    ['type.reading', 'Reading passage', 16, 22, 1, PX, 'reading'],
    ['type.instr', 'Instructions', 14, 18, 1, PX, 'instr'],
    ['type.label', 'Labels', 12, 16, 1, PX, 'label'],
    ['type.display', 'Social headline', 48, 96, 2, PX, 'display'],
  ],
  typoPrint: [
    ['type.printTitle', 'Worksheet title', 18, 28, 1, PT],
    ['type.printBody', 'Worksheet body', 10, 14, .5, PT],
  ],
  lhReading: [['type.lhReading', 'Reading passage line height', 1.4, 1.8, .05, X2]],
  scale: [
    ['type.scale.base', 'Base body size', 12, 24, 1, PX],
    ['type.scale.ratio', 'Custom ratio', 1.1, 1.7, .001, RT],
  ],
  layout: [['layout.cols', 'Columns', 1, 24, 1, v => String(v)]],
  space: [['space.unit', 'Or any value from 2 to 12', 2, 12, 1, PX]],
  shape: [
    ['shape.radius', 'Corner radius', 0, 24, 1, PX],
    ['shape.border', 'Border width', 0, 3, 1, PX],
  ],
};
const sid = p => 's-' + p.replace(/\./g, '-');
const SLIDER_SCOPE = { 'type.title': 'web', 'type.titleMobile': 'mobile', 'type.section': 'web social', 'type.reading': 'mobile social', 'type.instr': 'web mobile', 'type.label': 'web mobile social', 'type.display': 'social',
  'type.printTitle': 'print', 'type.printBody': 'print', 'layout.cols': 'grid' };
function sliderHTML([path, label, min, max, step]) {
  const id = sid(path), sc = SLIDER_SCOPE[path];
  return `<div class="field"${sc ? ` data-for="${sc}"` : ''}><label for="${id}">${label}<output id="${id}-o"></output></label><input type="range" id="${id}" data-path="${path}" min="${min}" max="${max}" step="${step}"></div>`;
}
const fontOptions = sel => Object.keys(FONTS).map(f => `<option${f === sel ? ' selected' : ''}>${f}</option>`).join('');
const colorField = (path, label, hint, idBase, extra = '') => `
  <div class="field"><label for="${idBase}">${label}${extra}</label>
    <div class="color-in"><input type="color" id="${idBase}" data-path="${path}"><input type="text" maxlength="7" data-hex="${path}" aria-label="${esc(label)} hex value" spellcheck="false"></div>
    ${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;

const PANEL_TABS = [['themes', 'Themes'], ['color', 'Color'], ['type', 'Type'], ['layout', 'Layout'], ['export', 'Export']];
const subtabs = (group, items) => `<div class="subtabs" role="tablist" data-group="${group}">${items.map(([k, l]) => `<button type="button" role="tab" data-sub="${group}:${k}">${l}</button>`).join('')}</div>`;

let panelTab = 'themes';
function showPanelTab(name) {
  panelTab = name;
  $$('.ptab').forEach(p => { p.hidden = p.id !== 'pt-' + name; });
  $$('[data-ptab-btn]').forEach(b => { const on = b.dataset.ptabBtn === name; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
}
function buildPanel() {
  const SP_ROWS = SP_STEPS.map(([k, label]) => `
    <div class="sprow" data-sp-row="${k}">
      <div class="sprow-h"><b>${label}</b>${k === 'button' ? '<label class="caps"><input type="checkbox" data-path="type.btnCaps"> All caps</label>' : ''}</div>
      <div class="two">
        <div class="field"><label for="lh-${k}">Line height</label><input type="number" id="lh-${k}" data-path="type.sp.${k}.lh" min="0.8" max="2.5" step="0.05" data-num></div>
        <div class="field"><label for="ls-${k}">Tracking (em)</label><input type="number" id="ls-${k}" data-path="type.sp.${k}.ls" min="-0.1" max="0.3" step="0.005" data-num></div>
      </div>
      <div class="note2" id="gl-${k}" role="status"></div>
    </div>`).join('');

  const W_ROWS = WROLES.map(([k, label]) => `
    <div class="wrow" data-w-row="${k}">
      <div class="two">
        <div class="field"><label for="w-${k}">${label} weight</label><input type="number" id="w-${k}" data-path="type.w.${k}" min="100" max="900" step="100" data-num></div>
        <div class="wsmp" id="wsmp-${k}">Rumo ao CIPLE</div>
      </div>
      <div class="note2" id="wn-${k}" role="status"></div>
    </div>`).join('');

  const SHORT = { 'on-primary': 'Label', 'border-strong': 'Border strong', muted: 'Muted' };
  const ROLE_CELLS = ROLE_GROUPS.flatMap(([, l]) => l).map(([id, label, hint]) => `
    <div class="rc" title="${esc(label + ': ' + hint)}">
      <input type="color" class="sw32" id="r-${id}" data-path="roles.@.${id}" aria-label="${esc(label)} color">
      <div class="rt"><label class="rn" for="r-${id}">${esc(SHORT[id] || label)}</label>
        <input type="text" class="rh" maxlength="7" data-hex="roles.@.${id}" aria-label="${esc(label)} hex value" spellcheck="false"></div>
    </div>`).join('');

  $('#panel').innerHTML = `
  <div class="phead">
    <div class="phead-row"><span>Design Options</span><span class="hist"><button type="button" class="btn sm" id="btnUndo" data-act="undo" aria-label="Undo" disabled>↶ Undo</button><button type="button" class="btn sm" id="btnRedo" data-act="redo" aria-label="Redo" disabled>↷ Redo</button></span></div>
    <div class="subtabs ptabs" role="tablist" aria-label="Design option groups">${PANEL_TABS.map(([k, l]) => `<button type="button" role="tab" id="ptb-${k}" data-ptab-btn="${k}" aria-controls="pt-${k}" aria-selected="false">${l}</button>`).join('')}</div>
  </div>

  <div class="ptab" id="pt-themes" role="tabpanel" aria-labelledby="ptb-themes">
  <div class="grp"><h2>Themes</h2>
    <div class="chips" id="presetChips"></div>
    <div class="save-row"><input class="name-in" id="themeName" type="text" placeholder="Name this theme" aria-label="Theme name" maxlength="32"><button class="btn" id="btnSaveTheme" type="button">Save</button></div>
    <ul class="saved" id="savedList"></ul>
  </div>

  </div>
  <div class="ptab" id="pt-color" role="tabpanel" aria-labelledby="ptb-color" hidden>
  <div class="grp"><h2>Generate from a base color</h2>
    <div class="gen-row">
      <input type="color" class="sw32 big" id="c-base" data-path="gen.base" aria-label="Base color">
      <select id="gen-harmony" data-path="gen.harmony" aria-label="Harmony">${Object.entries(HARMONIES).map(([k, [n]]) => `<option value="${k}">${n}</option>`).join('')}</select>
    </div>
    <button type="button" class="btn dark wide" data-act="generate">Generate palette</button>
    <input type="text" class="rh baseHex" maxlength="7" data-hex="gen.base" aria-label="Base color hex value" spellcheck="false">
    <details class="more"><summary>Palette explorer: harmony, ramp, tints, shades, tones</summary><div id="genOut"></div></details>
  </div>

  <div class="grp"><h2>Colors <span class="mode-note">editing the <b id="editingMode">light</b> palette</span></h2>
    <div class="role-grid">${ROLE_CELLS}</div>
    <div class="choice" id="labelChoice" hidden><span>Dark mode label:</span><button type="button" class="btn sm" data-act="label-dark">Dark</button><button type="button" class="btn sm" data-act="label-white">White</button></div>
    <details class="more"><summary>Contrast checks <span id="colorBadge" class="cbadge" hidden></span><span class="mode-note">(<b id="checkMode">light</b>)</span></summary><div id="checksOut"></div></details>
  </div>

  </div>
  <div class="ptab" id="pt-type" role="tabpanel" aria-labelledby="ptb-type" hidden>
  <div class="grp"><h2>Fonts</h2>
    <div class="field"><label for="t-heading">Heading font</label><select id="t-heading" data-path="type.heading">${fontOptions(state.type.heading)}</select><span class="hint" id="ship-heading"></span></div>
    <div class="field"><label for="t-body">Body text font</label><select id="t-body" data-path="type.body">${fontOptions(state.type.body)}</select><span class="hint" id="ship-body"></span></div>
    <div class="two"><button type="button" class="btn wide" data-act="randomize">⤮ Randomize</button><button type="button" class="btn wide" data-act="swap">⇄ Swap</button></div>
    <details class="more"><summary>Weight roles</summary>
      <p class="hint pad">Change the number each role uses. A weight the font doesn't ship is flagged in red.</p>
      ${W_ROWS}
    </details>
    <div class="field"><span class="lbl">Portuguese characters</span>
      <div class="glyph" id="glyphH"><small>Heading font</small>ã õ ç ê á é í ó ú à â</div>
      <div class="glyph" id="glyphB"><small>Body font</small>ã õ ç ê á é í ó ú à â</div></div>
  </div>

  <div class="grp"><h2>Type scale</h2>
    <label class="check"><input type="checkbox" data-path="type.scale.on"> Drive the text sizes from this scale</label>
    <fieldset class="scale-ctl" id="scaleCtl">
      <legend class="sr">Scale controls</legend>
      ${sliderHTML(SLIDERS.scale[0])}
      <div class="field"><label for="ratioPreset">Ratio</label><select id="ratioPreset">${RATIO_PRESETS.map(([n, v]) => `<option value="${v}">${n}</option>`).join('')}<option value="custom">Custom</option></select></div>
      ${sliderHTML(SLIDERS.scale[1])}
      <div class="scale-out" id="scaleOut"></div>
    </fieldset>
    <p class="hint pad" id="scaleNote">Text sizes come from the scale above. Untick the box to set each size by hand.</p>
    <div class="sizes">${SLIDERS.typoWeb.map(sliderHTML).join('')}</div>
    <details class="more" data-for="print"><summary>Sizes: print</summary>${SLIDERS.typoPrint.map(sliderHTML).join('')}</details>
    <details class="more"><summary>Line height and tracking</summary>
      <p class="hint pad">Line height is a multiple of the font size and tracking is in em. Set per step. A note turns amber outside the guideline; it is a nudge, not an error.</p>
      ${SP_ROWS}
      ${SLIDERS.lhReading.map(sliderHTML).join('')}
    </details>
  </div>

  </div>
  <div class="ptab" id="pt-layout" role="tabpanel" aria-labelledby="ptb-layout" hidden>
  <div class="grp"><h2>Spacing</h2>
    <div class="field"><span class="lbl">Base unit</span>
      <div class="seg unit-seg" role="radiogroup" aria-label="Common base units">
        <label><input type="radio" name="base-unit" value="4"><span>4 px</span></label>
        <label><input type="radio" name="base-unit" value="8"><span>8 px</span></label>
      </div></div>
    ${SLIDERS.space.map(sliderHTML).join('')}
    <table class="sptab"><thead><tr><th scope="col">Name</th><th scope="col">Size</th><th scope="col">Pixels</th><th scope="col"></th></tr></thead>
      <tbody>${SPACE_STEPS.map(n => `<tr data-sp-n="${n}"><td class="n">space-${n}</td><td class="m">${n} × base</td><td class="pxv"></td><td><div class="spbar" style="--w:var(--cip-space-${n})"></div></td></tr>`).join('')}</tbody></table>
    <button type="button" class="btn wide" data-act="showspace">See the sample cards</button>
  </div>
  <div class="grp" data-for="grid snap strategy respcontent"><h2>Layout grid</h2>
    ${SLIDERS.layout.map(sliderHTML).join('')}
    <div class="two" data-for="grid">
      <div class="field"><label for="l-g">Gutter</label><select id="l-g" data-path="layout.g" data-num>${SPACE_STEPS.map(n => `<option value="${n}"></option>`).join('')}</select></div>
      <div class="field"><label for="l-m">Outer margin</label><select id="l-m" data-path="layout.m" data-num>${SPACE_STEPS.map(n => `<option value="${n}"></option>`).join('')}</select></div>
    </div>
    <label class="check" data-for="grid"><input type="checkbox" data-path="layout.overlay"> Show the grid over every preview</label>
    <label class="check" data-for="snap"><input type="checkbox" data-path="layout.snap"> Snap the web dashboard to the grid</label>
    <button type="button" class="btn wide" data-act="showgrid" data-for="grid">See the column grid</button>
    <div class="field" data-for="strategy"><span class="lbl">Responsive strategy</span>
      <div class="seg unit-seg" role="radiogroup" aria-label="Responsive mode">
        <label><input type="radio" name="rmode" value="fluid"><span>Fluid</span></label>
        <label><input type="radio" name="rmode" value="adaptive"><span>Adaptive</span></label>
        <label><input type="radio" name="rmode" value="combo"><span>Combination</span></label>
      </div></div>
    <div class="field" data-for="respcontent"><span class="lbl">Responsive frame shows</span>
      <div class="seg unit-seg" role="radiogroup" aria-label="Responsive frame content">
        <label><input type="radio" name="rcontent" value="web"><span>Dashboard</span></label>
        <label><input type="radio" name="rcontent" value="mobile"><span>Reading</span></label>
        <label><input type="radio" name="rcontent" value="cards"><span>Cards</span></label>
      </div></div>
    <span class="lbl" data-for="strategy">Breakpoints (px): 2, 3 and 4 columns</span>
    <div class="three" data-for="strategy">
      <div class="field"><label for="l-bp0">2 cols</label><input type="number" id="l-bp0" data-path="layout.bp0" min="240" max="900" step="10" data-num></div>
      <div class="field"><label for="l-bp1">3 cols</label><input type="number" id="l-bp1" data-path="layout.bp1" min="240" max="900" step="10" data-num></div>
      <div class="field"><label for="l-bp2">4 cols</label><input type="number" id="l-bp2" data-path="layout.bp2" min="240" max="900" step="10" data-num></div>
    </div>
    <button type="button" class="btn wide" data-act="showresp" data-for="strategy">See the responsive frame</button>
  </div>
  <div class="grp" data-for="checks"><h2>Layout checks</h2>
    <p class="hint pad">Runs the real dashboard and reading screens at these widths, using the strategy and breakpoints above.</p>
    <div class="four">
      <div class="field"><label for="l-t0">Width 1</label><input type="number" id="l-t0" data-path="layout.t0" min="240" max="1600" step="1" data-num></div>
      <div class="field"><label for="l-t1">Width 2</label><input type="number" id="l-t1" data-path="layout.t1" min="240" max="1600" step="1" data-num></div>
      <div class="field"><label for="l-t2">Width 3</label><input type="number" id="l-t2" data-path="layout.t2" min="240" max="1600" step="1" data-num></div>
      <div class="field"><label for="l-t3">Width 4</label><input type="number" id="l-t3" data-path="layout.t3" min="240" max="1600" step="1" data-num></div>
    </div>
    <label class="check"><input type="checkbox" data-path="layout.big"> Test with text 25% larger</label>
    <button type="button" class="btn dark wide" data-act="showchecks">Run layout checks</button>
  </div>
  <div class="grp"><h2>Shape</h2>${SLIDERS.shape.map(sliderHTML).join('')}</div>

  </div>
  <div class="ptab" id="pt-export" role="tabpanel" aria-labelledby="ptb-export" hidden>
  <div class="grp"><h2>Export</h2>
    <p class="hint pad">tokens.css uses the shared names (--color-primary, --space-4 and so on). Light as :root, Dark under :root[data-theme="dark"].</p>
    <div class="stack">
      <button type="button" class="btn" data-act="copycss">Copy tokens.css</button>
      <button type="button" class="btn" data-act="dlcss">Download tokens.css</button>
      <button type="button" class="btn" data-act="dljson">Download theme (.json)</button>
      <button type="button" class="btn" data-act="share">Copy view-only share link</button>
      <button type="button" class="btn" data-act="print">Print worksheet</button>
      <button type="button" class="btn ghost" data-act="showcss">Show CSS in the preview</button>
    </div>
  </div>
  <div class="grp"><h2>Import</h2>
    <p class="hint pad">Load a tokens.css, a theme .json or a share link. Anything the tool can't map is listed and left as it is.</p>
    <label class="btn wide filebtn">Choose a file<input type="file" id="importFile" accept=".css,.json,.txt,text/css,application/json,text/plain"></label>
    <textarea id="importText" class="import-text" rows="4" placeholder="…or paste CSS, JSON or a share link here" spellcheck="false" aria-label="Text to import"></textarea>
    <button type="button" class="btn dark wide" data-act="import">Import pasted text</button>
    <p class="note2" id="importMsg" role="status"></p>
  </div>
  </div>`;

  showPanelTab(panelTab); updateHistoryButtons();
  $('#presetChips').innerHTML = PRESETS.map((pr, i) => `<button class="chip" type="button" data-preset="${i}"><i>${['primary', 'error', 'accent'].map(k => `<span style="background:${pr.roles.light[k]}"></span>`).join('')}</i>${pr.name}</button>`).join('');
}

/* ---------- Panel sync ---------- */
function syncPanel() {
  const z = sizesOf(state.type), lock = state.type.scale.on;
  const active = document.activeElement;
  $$('[data-path]').forEach(el => {
    if (el === active && (el.type === 'number' || el.type === 'text')) return;
    const v = get(state, el.dataset.path);
    if (el.type === 'checkbox') el.checked = !!v; else el.value = v;
  });
  $$('[data-hex]').forEach(el => { if (el === active) return; el.value = get(state, el.dataset.hex); el.classList.remove('bad'); });
  SLIDERS.typoWeb.forEach(([path, , , , , fmt, k]) => { const o = $('#' + sid(path) + '-o'); if (o) o.textContent = fmt(r1(lock ? z[k] : get(state, path))); });
  [SLIDERS.typoPrint, SLIDERS.lhReading, SLIDERS.scale, SLIDERS.space, SLIDERS.layout, SLIDERS.shape].flat().forEach(([path, , , , , fmt]) => {
    const o = $('#' + sid(path) + '-o'); if (o) o.textContent = fmt(get(state, path));
  });
  $('#scaleCtl').hidden = !lock; $('#scaleNote').hidden = !lock;
  applyScope();

  const sc = state.type.scale, rp = $('#ratioPreset');
  rp.value = RATIO_PRESETS.some(([, v]) => v === sc.ratio) ? String(sc.ratio) : 'custom';
  const b = sc.base, r = sc.ratio;
  $('#scaleOut').innerHTML = [['H1', 4], ['H2', 3], ['H3', 2], ['Body', 0]].map(([n, e]) => `<div><b>${n}</b><span>${r1(b * r ** e)} px</span><small>${e ? 'base × ratio' + ['', '', '²', '³', '⁴'][e] : 'base'}</small></div>`).join('') +
    `<p class="hint">Page title = H2, section heading = H3, social headline = H1, instructions = body.</p>`;

  [['glyphH', state.type.heading, state.type.w.heading], ['glyphB', state.type.body, state.type.w.body]].forEach(([id, f, w]) => { const g = $('#' + id); if (g) { g.style.fontFamily = FONTS[f].stack; g.style.fontWeight = w; } });
  $('#editingMode').textContent = MODE_NAME[state.mode].toLowerCase();
  $('#checkMode').textContent = MODE_NAME[state.mode].toLowerCase();
  $('#labelChoice').hidden = state.mode !== 'dark';
  renderWeights(); renderSpacingNotes(); renderSpace();
}

function renderSpace() {
  const u = state.space.unit;
  $$('[data-sp-n]').forEach(r => { r.querySelector('.pxv').textContent = (r.dataset.spN * u) + ' px'; });
  $$('input[name=base-unit]').forEach(r => { r.checked = +r.value === u; });
}

function nearestWeight(avail, w) { return avail.reduce((a, c) => Math.abs(c - w) < Math.abs(a - w) ? c : a); }
function renderWeights() {
  const t = state.type;
  $('#ship-heading').textContent = `Ships: ${FONTS[t.heading].weights.join(', ')}`;
  $('#ship-body').textContent = `Ships: ${FONTS[t.body].weights.join(', ')}`;
  WROLES.forEach(([k, , which]) => {
    const font = which === 'heading' ? t.heading : t.body, avail = FONTS[font].weights, w = t.w[k];
    const sm = $('#wsmp-' + k); sm.style.fontFamily = FONTS[font].stack; sm.style.fontWeight = w;
    const n = $('#wn-' + k);
    if (avail.includes(w)) { n.className = 'note2 ok'; n.textContent = `✓ ${font} ships ${w}`; return; }
    const near = nearestWeight(avail, w), fake = w >= 600 && near < 600;
    n.className = 'note2 bad';
    n.textContent = `✕ ${font} doesn't ship ${w} (ships ${avail.join(', ')}). The browser would use ${near}${fake ? ' and fake bold by smearing the letters' : ''}.`;
  });
}

function guideline(k) {
  const v = state.type.sp[k], out = [], inR = (x, lo, hi) => x >= lo - 1e-9 && x <= hi + 1e-9, sg = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
  if (k === 'h1' || k === 'h2' || k === 'h3') {
    if (!inR(v.lh, 1.1, 1.25)) out.push(`Line height ${v.lh} is outside 1.1–1.25 for headings.`);
    if (v.ls > 0 || v.ls < -0.04) out.push(`Tracking ${sg(v.ls)}em is outside slightly negative (0 to −0.04em).`);
  } else if (k === 'body') {
    if (!inR(v.lh, 1.4, 1.6)) out.push(`Line height ${v.lh} is outside about 1.5 (1.4–1.6).`);
    if (!inR(v.ls, -0.01, 0.01)) out.push(`Tracking ${sg(v.ls)}em is outside about zero (±0.01em).`);
  } else if (k === 'label') {
    if (!inR(v.ls, 0.02, 0.15)) out.push(`Tracking ${sg(v.ls)}em is outside a little positive (0.02–0.15em).`);
  } else if (k === 'button') {
    const caps = state.type.btnCaps;
    if (caps ? !inR(v.ls, 0.02, 0.1) : !inR(v.ls, -0.01, 0.01)) out.push(caps ? `All-caps button: tracking ${sg(v.ls)}em is outside a little positive (0.02–0.1em).` : `Tracking ${sg(v.ls)}em is outside none (±0.01em).`);
  }
  return out;
}
function renderSpacingNotes() {
  SP_STEPS.forEach(([k]) => {
    const g = guideline(k), c = $('#gl-' + k);
    c.className = 'note2 ' + (g.length ? 'warn' : 'ok');
    c.innerHTML = g.length ? g.map(x => `<div>${x}</div>`).join('') : '✓ Within the guideline';
  });
}

/* ---------- Color: generate ---------- */
function renderGenerate() {
  const base = state.gen.base.toUpperCase(), [hname, steps] = HARMONIES[state.gen.harmony];
  const sw = (name, hex, cls = '') => `<button type="button" class="swb ${cls}${hex === picked ? ' pick' : ''}" data-sw="${hex}" aria-label="${esc(name)} ${hex}"><span class="chip" style="background:${hex}"></span><span class="sn">${esc(name)}</span><span class="sh">${hex}</span></button>`;
  const items = steps.map(([l, d]) => ({ l, hex: rotate(base, d) }));
  const harmony = state.gen.harmony === 'analogous' ? sw(items[0].l, items[0].hex) + sw('Base', base, 'base') + sw(items[1].l, items[1].hex) : sw('Base', base, 'base') + items.map(i => sw(i.l, i.hex)).join('');
  const ramp = RAMP.map(([n, to, t]) => sw(String(n), to ? mix(base, to === 'white' ? '#FFFFFF' : '#000000', t) : base, n === 500 ? 'base' : '')).join('');
  const set = target => AMOUNTS.map(t => sw(Math.round(t * 100) + '%', mix(base, target, t))).join('');
  const roleOpts = ROLE_IDS.map(id => `<option value="${id}"${id === applyTarget ? ' selected' : ''}>${id}</option>`).join('');
  $('#genOut').innerHTML = `
    <div class="pickbox">${picked ? `<span class="chip" style="background:${picked}"></span><b>${picked}</b><button type="button" class="btn sm" data-act="copy-sw">Copy</button><span class="pb2"><select id="applyRole" aria-label="Role to apply to">${roleOpts}</select><button type="button" class="btn sm solid" data-act="apply-role">Apply to ${MODE_NAME[state.mode].toLowerCase()} role</button></span>` : '<span class="hint">Click a swatch to copy it or apply it to a role.</span>'}</div>
    <h3 class="sub">${hname}: ${steps.map(([, d]) => (d > 0 ? '+' : '−') + Math.abs(d) + '°').join(' and ')}</h3><div class="swgrid g3">${harmony}</div>
    <h3 class="sub">Tonal ramp</h3><div class="swgrid g5">${ramp}</div>
    <h3 class="sub">Tints (toward white)</h3><div class="swgrid g5">${set('#FFFFFF')}</div>
    <h3 class="sub">Shades (toward black)</h3><div class="swgrid g5">${set('#000000')}</div>
    <h3 class="sub">Tones (toward gray)</h3><div class="swgrid g5">${set('#808080')}</div>`;
}

/* ---------- Color: contrast ---------- */
const badge = ([c, t]) => `<span class="badge ${c}">${c === 'fail' ? '✕ ' : '✓ '}${t}</span>`;
const grade = (r, aa, aaa) => r >= aaa ? ['aaa', 'AAA'] : r >= aa ? ['aa', 'AA'] : ['fail', 'Fail'];
function contrastData(mode = state.mode) {
  const P = state.roles[mode], dark = mode === 'dark';
  const text = [
    ['Text on background', 'text', 'background'], ['Text on surface', 'text', 'surface'], ['Muted on surface', 'muted', 'surface'],
    ['Label on primary', 'on-primary', 'primary'], ['Label on secondary', 'on-primary', 'secondary'],
    dark ? ['Label on accent', 'on-primary', 'accent'] : ['Text on accent', 'text', 'accent'],
    ['Label on success', 'on-primary', 'success'], ['Label on warning', 'on-primary', 'warning'], ['Label on error', 'on-primary', 'error'], ['Label on info', 'on-primary', 'info'],
  ].map(([n, f, b]) => ({ n, fg: P[f], bg: P[b], r: ratio(P[f], P[b]) }));
  const ui = [['Border on surface (decorative)', 'border', 'surface', true], ['Border strong on surface (inputs)', 'border-strong', 'surface'], ['Primary on background', 'primary', 'background']]
    .map(([n, f, b, deco]) => ({ n, fg: P[f], bg: P[b], r: ratio(P[f], P[b]), deco }));
  return { text, ui };
}
function renderChecks() {
  const { text, ui } = contrastData();
  const fails = text.filter(x => x.r < 4.5).length + ui.filter(x => x.r < 3 && !x.deco).length;
  const bd = $('#colorBadge'); bd.hidden = !fails; bd.textContent = fails; bd.title = fails + ' contrast failure' + (fails === 1 ? '' : 's');
  $('#checksOut').innerHTML = `
    <p class="hint pad">Normal text: 4.5:1 AA, 7:1 AAA. Large text (24px regular or 19px bold): 3:1 AA, 4.5:1 AAA. Ratios round down.</p>
    <div class="crow chead"><span></span><span>Text pair</span><span>Ratio</span><span>Normal</span><span>Large</span></div>
    ${text.map(x => `<div class="crow"><span class="pchip" style="background:${x.bg};color:${x.fg}" aria-hidden="true">Aa</span><span class="cn">${x.n}</span><b class="cr">${fmtRatio(x.r)}</b>${badge(grade(x.r, 4.5, 7))}${badge(grade(x.r, 3, 4.5))}</div>`).join('')}
    <h3 class="sub">UI parts (need 3:1)</h3>
    ${ui.map(x => `<div class="crow ui"><span class="pchip" style="background:${x.bg};border:3px solid ${x.fg}" aria-hidden="true"></span><span class="cn">${x.n}</span><b class="cr">${fmtRatio(x.r)}</b>${x.r >= 3 ? '<span class="badge ok">✓ Pass</span>' : '<span class="badge fail">✕ Fail</span>'}</div>`).join('')}`;
}

/* ---------- Sample UI (role-only, both palettes) ---------- */
const UI_TEMPLATE = `
  <div class="row"><button type="button" class="btn primary">Primary action</button><button type="button" class="btn secondary">Secondary outlined</button><button type="button" class="btn secondary-fill">Secondary filled</button></div>
  <label class="field-demo"><span>Your name</span><input type="text" placeholder="Ana Silva"></label>
  <div class="card"><h3>Lesson 4: Ordering at a café</h3><p>Practise the phrases you will need to order a coffee and a pastel de nata, and to ask for the bill.</p><div class="tip">Raised: a lighter surface, no shadow.</div></div>
  <div class="alerts">
    <div class="alert success"><strong>Success.</strong> Your answers were saved.</div>
    <div class="alert warning"><strong>Warning.</strong> You have 5 minutes left in this exercise.</div>
    <div class="alert error"><strong>Error.</strong> We could not check your answer. Try again.</div>
    <div class="alert info"><strong>Info.</strong> A new reading text is available at level A2.</div>
  </div>`;
function buildUi() {
  $('#uiBoth').innerHTML = ['light', 'dark'].map(m => `<figure class="pvw" id="pw-${m}"><figcaption>${MODE_NAME[m]} mode</figcaption><div class="ui" id="ui-${m}" style="color-scheme:${m}">${UI_TEMPLATE}</div></figure>`).join('');
}
function applyUiVars() {
  ['light', 'dark'].forEach(m => {
    const el = $('#ui-' + m); if (!el) return;
    ROLE_IDS.forEach(id => el.style.setProperty('--color-' + id, state.roles[m][id]));
    $('#pw-' + m).classList.toggle('sel', m === state.mode);
  });
}

/* ---------- Outputs ---------- */
function cssText() {
  const block = (list, head) => { let out = head, g = ''; list.forEach(x => { if (x.group !== g) { g = x.group; out += (out.endsWith('{\n') ? '' : '\n') + `  /* ${g} */\n`; } out += `  ${x.name}: ${x.value};\n`; }); return out + '}\n'; };
  const light = tokens(state, 'light'), dark = tokens(state, 'dark').filter(x => x.group === 'Color');
  return block(light, '/* Rumo ao CIPLE design tokens: ' + state.name + ' (light) */\n:root {\n') +
    '\n' + block(dark, '/* Dark palette: set data-theme="dark" on the root element */\n:root[data-theme="dark"] {\n');
}
function cssHtml(text) { return esc(text).replace(/(\/\*.*?\*\/)/g, '<span class="c">$1</span>').replace(/(--[a-z][\w-]*)/g, '<span class="k">$1</span>'); }
/* ---------- Shared tokens.css schema (what token-cascade and share-playground read) ---------- */
function schemaTokens(s) {
  const t = s.type, z = sizesOf(t), u = s.space.unit, rad = s.shape.radius, bw = s.shape.border;
  const px = v => (Math.round(v * 10) / 10) + 'px';
  const build = mode => {
    const r = s.roles[mode], dark = mode === 'dark', L = [], W = '#FFFFFF', K = '#000000';
    const add = (g, n, v) => L.push({ group: g, name: '--' + n, value: String(v) });
    add('color', 'color-primary', r.primary);
    add('color', 'color-primary-hover', dark ? mix(r.primary, W, .2) : mix(r.primary, K, .2));
    add('color', 'color-on-primary', r['on-primary']);
    add('color', 'color-secondary', r.secondary);
    add('color', 'color-accent', r.accent);
    add('color', 'color-on-accent', onC(r.accent));
    add('color', 'color-bg', r.background);
    add('color', 'color-surface', r.surface);
    add('color', 'color-surface-raised', dark ? mix(r.surface, W, .06) : r.surface);
    add('color', 'color-text', r.text);
    add('color', 'color-muted', r.muted);
    add('color', 'color-border', r.border);
    add('color', 'color-border-strong', r['border-strong']);
    add('color', 'color-focus', r.secondary);
    add('color', 'color-success', r.success);
    add('color', 'color-warning', r.warning);
    add('color', 'color-error', r.error);
    add('color', 'color-info', r.info);
    add('font', 'font-heading', FONTS[t.heading].stack);
    add('font', 'font-body', FONTS[t.body].stack);
    add('font', 'font-mono', "ui-monospace, 'Cascadia Mono', Consolas, monospace");
    add('font', 'type-base', px(z.instr));
    add('font', 'font-size-sm', px(z.label));
    add('font', 'font-size-md', px(z.instr));
    add('font', 'font-size-lg', px(z.section));
    add('font', 'font-size-xl', px(z.title));
    add('font', 'font-weight-regular', t.w.body);
    add('font', 'font-weight-semibold', t.w.subheading);
    add('font', 'font-weight-bold', t.w.heading);
    add('line', 'line-height-body', t.sp.body.lh);
    add('line', 'line-height-heading', t.sp.h1.lh);
    add('space', 'space-unit', px(u));
    SPACE_STEPS.forEach(n => add('space', 'space-' + n, `calc(${n} * var(--space-unit))`));
    add('radius', 'radius-none', '0');
    add('radius', 'radius-sm', px(Math.round(rad / 2)));
    add('radius', 'radius-md', px(rad));
    add('radius', 'radius-lg', px(rad * 2));
    add('radius', 'radius-full', '9999px');
    add('border', 'border-width-default', px(bw));
    add('border', 'border-width-emphasis', px(Math.max(2, bw + 1)));
    add('border', 'border-width-focus', px(Math.max(3, bw + 2)));
    const [R, G, B] = rgb(r.text);
    const sh = (a, b, c, d, e, f) => dark ? 'none' : `0 ${a}px ${b}px rgba(${R}, ${G}, ${B}, ${c}), 0 ${d}px ${e}px rgba(${R}, ${G}, ${B}, ${f})`;
    add('shadow', 'shadow-sm', sh(1, 2, .12, 2, 4, .06));
    add('shadow', 'shadow-md', sh(2, 4, .10, 8, 16, .08));
    add('shadow', 'shadow-lg', sh(4, 8, .10, 16, 32, .12));
    return L;
  };
  return { light: build('light'), dark: build('dark').filter(x => x.group === 'color' || x.group === 'shadow') };
}
function schemaCss(s) {
  const T = schemaTokens(s), COMMENT = { space: 'space: every step is its number times the unit', shadow: 'shadow (none in dark: elevation is a lighter surface)' };
  const block = (head, list) => { let out = head, g = ''; list.forEach(x => { if (x.group !== g) { out += (g ? '\n' : '') + `  /* ${COMMENT[x.group] || x.group} */\n`; g = x.group; } out += `  ${x.name}: ${x.value};\n`; }); return out + '}\n'; };
  return `/* Rumo ao CIPLE design tokens: ${s.name}. Written by the design system tool. Light is the default; dark overrides only what changes. */\n` +
    block(':root {\n', T.light) + '\n' + block(':root[data-theme="dark"] {\n', T.dark);
}

/* ---------- Import: tokens.css, theme .json or a share link ---------- */
function colorToHex(v) {
  v = String(v).trim();
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toUpperCase();
  if (/^#[0-9a-f]{3}$/i.test(v)) return ('#' + [...v.slice(1)].map(c => c + c).join('')).toUpperCase();
  if (window.CSS && CSS.supports('color', v) && !/var\(/i.test(v)) {
    const el = document.createElement('span'); el.style.color = v; document.body.appendChild(el);
    const c = getComputedStyle(el).color; el.remove();
    const m = c.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    if (m && (m[4] === undefined || +m[4] === 1)) return toHex([+m[1], +m[2], +m[3]]);
  }
  return null;
}
const pxNum = v => { const m = String(v).trim().match(/^(-?[\d.]+)(px|rem|em)?$/); return m ? ((m[2] === 'rem' || m[2] === 'em') ? +m[1] * 16 : +m[1]) : null; };
const clampN = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
function readCssTokens(text) {
  const sh = new CSSStyleSheet(); sh.replaceSync(text);
  const out = { light: {}, dark: {} };
  const walk = rules => {
    for (const r of rules) {
      if (r.style && r.selectorText) {
        if (!/:root|html|\[data-theme/.test(r.selectorText)) continue;
        const dest = /data-theme\s*=\s*["']?dark/.test(r.selectorText) ? out.dark : out.light;
        for (let i = 0; i < r.style.length; i++) { const n = r.style[i]; if (n.startsWith('--')) dest[n] = r.style.getPropertyValue(n).trim(); }
      } else if (r.cssRules) walk(r.cssRules);
    }
  };
  walk(sh.cssRules);
  return out;
}
const IMPORT_COLORS = { 'color-primary': 'primary', 'color-secondary': 'secondary', 'color-accent': 'accent', 'color-on-primary': 'on-primary', 'color-bg': 'background', 'color-surface': 'surface',
  'color-text': 'text', 'color-muted': 'muted', 'color-border': 'border', 'color-border-strong': 'border-strong', 'color-success': 'success', 'color-warning': 'warning', 'color-error': 'error', 'color-info': 'info' };
const DERIVED = /^--(color-(primary-hover|on-accent|surface-raised|focus)|font-mono|type-base|space-\d+|radius-(none|sm|lg|full)|border-width-(emphasis|focus)|shadow-(sm|md|lg))$/;
function importCss(text, base) {
  const T = readCssTokens(text), s = clone(base), handled = new Set(), note = [];
  const hit = (n, mode) => handled.add(n);
  ['light', 'dark'].forEach(mode => {
    const src = T[mode];
    Object.entries(IMPORT_COLORS).forEach(([k, role]) => {
      const raw = src['--' + k]; if (raw === undefined) return;
      const hx = colorToHex(raw);
      if (hx) { s.roles[mode][role] = hx; hit('--' + k); } else note.push(`--${k}${mode === 'dark' ? ' (dark)' : ''}: "${raw}" is not a plain color`);
    });
  });
  const L = T.light, fam = v => v.split(',')[0].replace(/["']/g, '').trim();
  [['--font-heading', 'heading'], ['--font-body', 'body']].forEach(([n, k]) => {
    if (L[n] === undefined) return;
    const f = fam(L[n]); if (FONTS[f]) { s.type[k] = f; hit(n); } else note.push(`${n}: "${f}" is not in the tool's font list`);
  });
  const num = (n, fn) => { if (L[n] === undefined) return; const v = pxNum(L[n]); if (v === null || !Number.isFinite(v)) { note.push(`${n}: "${L[n]}" is not a number`); return; } fn(v); hit(n); };
  let sizes = false;
  num('--font-size-xl', v => { s.type.title = clampN(Math.round(v), 28, 40); sizes = true; });
  num('--font-size-lg', v => { s.type.section = clampN(Math.round(v), 18, 28); sizes = true; });
  num('--font-size-md', v => { s.type.instr = clampN(Math.round(v), 14, 18); sizes = true; });
  num('--font-size-sm', v => { s.type.label = clampN(Math.round(v), 12, 16); sizes = true; });
  if (sizes) s.type.scale.on = false;
  const wt = v => clampN(Math.round(v / 100) * 100, 100, 900);
  num('--font-weight-regular', v => { s.type.w.body = wt(v); });
  num('--font-weight-semibold', v => { s.type.w.subheading = wt(v); });
  num('--font-weight-bold', v => { s.type.w.heading = wt(v); });
  num('--line-height-body', v => { s.type.sp.body.lh = clampN(v, 0.8, 2.5); });
  num('--line-height-heading', v => { ['h1', 'h2', 'h3'].forEach(k => { s.type.sp[k].lh = clampN(v, 0.8, 2.5); }); });
  num('--space-unit', v => { s.space.unit = clampN(Math.round(v), 2, 12); });
  num('--radius-md', v => { s.shape.radius = clampN(Math.round(v), 0, 24); });
  num('--border-width-default', v => { s.shape.border = clampN(Math.round(v), 0, 3); });
  const names = new Set([...Object.keys(T.light), ...Object.keys(T.dark)]);
  const derived = [...names].filter(n => !handled.has(n) && DERIVED.test(n)).length;
  const unknown = [...names].filter(n => !handled.has(n) && !DERIVED.test(n));
  return { state: s, handled: handled.size, derived, unknown, note, total: names.size };
}
function importAny(text, fileName) {
  const t = text.trim(); if (!t) throw new Error('Nothing to import. Paste some text or choose a file.');
  const keep = state.mode, nm = (fileName || '').replace(/\.[^.]+$/, '').slice(0, 32);
  let msg;
  if (t[0] === '{' && !/--[a-z]/.test(t.slice(0, 200))) {
    let o; try { o = JSON.parse(t); } catch (e) { throw new Error('That looks like JSON but could not be read.'); }
    if (!o || !o.roles) throw new Error('This JSON is not a saved theme (it has no "roles").');
    state = sanitize(o); msg = 'Imported the theme' + (state.name ? ' “' + state.name + '”' : '') + ' from JSON.';
  } else if (/#s=[\w-]+/.test(t) || /^[\w-]{40,}$/.test(t)) {
    const m = t.match(/#s=([\w-]+)/); let o; try { o = dec(m ? m[1] : t); } catch (e) { throw new Error('That share link could not be read.'); }
    state = sanitize(o); msg = 'Imported the theme from a share link.';
  } else if (t.includes('{') && /--[a-z]/.test(t)) {
    let r; try { r = importCss(t, state); } catch (e) { throw new Error('That CSS could not be parsed.'); }
    if (!r.handled) throw new Error('No tokens the tool recognises were found. Expected names like --color-primary and --space-unit.');
    state = sanitize(r.state); if (nm) state.name = nm;
    msg = `Imported ${r.handled} of ${r.total} tokens.` + (r.derived ? ` ${r.derived} more (shadows, spacing steps, hover colors and so on) are derived by the tool.` : '') +
      (r.unknown.length ? ` Not used: ${r.unknown.slice(0, 8).join(', ')}${r.unknown.length > 8 ? ', …' : ''}.` : '') + (r.note.length ? ' Skipped: ' + r.note.join('; ') + '.' : '');
  } else throw new Error('This is not CSS with custom properties, a theme .json, or a share link.');
  state.mode = keep;
  return msg;
}
function doImport(text, fileName) {
  const out = $('#importMsg');
  try { const msg = importAny(text, fileName); update(); out.textContent = msg; out.classList.remove('bad'); toast('Imported'); }
  catch (e) { out.textContent = e.message; out.classList.add('bad'); }
}


function specs(list) {
  const T = Object.fromEntries(list.map(x => [x.name, x.value]));
  const t = state.type, w = t.w, sp = t.sp;
  const wname = { 100: 'Thin', 200: 'Extra light', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'Semibold', 700: 'Bold', 800: 'Extra bold', 900: 'Black' };
  const ptpx = v => { const n = parseFloat(v); return [r1(n) + ' pt', r1(n * 4 / 3) + ' px']; };
  const sg = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
  const row = (el, f, wt, size, step) => { const [a, b] = ptpx(size); return `<tr><td>${el}<small>line height ${step.lh}, tracking ${sg(step.ls)}em</small></td><td>${f}<small>${wname[wt] || ''} ${wt}</small></td><td class="mono">${a}<small>${b}</small></td></tr>`; };
  $('#specType').innerHTML = `<table><thead><tr><th>Element</th><th>Font</th><th>Size</th></tr></thead><tbody>
    ${row('Worksheet title', t.heading, w.heading, T['--cip-fs-print-title'], sp.h1)}
    ${row('Exercise heading', t.heading, w.heading, T['--cip-fs-print-heading'], sp.h2)}
    ${row('Body text', t.body, w.body, T['--cip-fs-print-body'], sp.body)}
    ${row('Exercise numbers', t.body, w.label, T['--cip-fs-print-label'], { lh: 1, ls: 0 })}
    ${row('Name line, footer', t.body, w.body, T['--cip-fs-print-label'], sp.body)}
  </tbody></table>`;
  const col = (n, h, use) => `<tr><td><span class="sw" style="background:${h}"></span>${n}<small>${use}</small></td><td class="mono">${h}</td></tr>`;
  $('#specColor').innerHTML = `<table><thead><tr><th>Colour role</th><th>Hex</th></tr></thead><tbody>
    ${col('Background', T['--cip-color-background'], 'Page')}
    ${col('Text', T['--cip-color-text'], 'Text, answer lines')}
    ${col('Secondary', T['--cip-color-secondary'], 'Header pattern, numbers')}
    ${col('Error', T['--cip-color-error'], 'Emphasised words')}
    ${col('Accent', T['--cip-color-accent'], 'Underline accent')}
    ${col('Muted text', T['--cip-color-muted'], 'Labels, footer')}
    ${col('Border', T['--cip-color-border'], 'Writing lines, dividers')}
  </tbody></table>
  <p class="note">Page: A4, 210 × 297 mm. Corner radius ${T['--cip-radius-md']}, line weight ${T['--cip-border-width']}. The tile band is a vector pattern in the secondary color. Previewing the ${MODE_NAME[state.mode].toLowerCase()} palette.</p>`;
}

let lastCss = '', lastSchema = '', cssKind = 'shared';
function renderCssOut() {
  $('#cssOut').innerHTML = cssHtml(cssKind === 'shared' ? lastSchema : lastCss);
  $('#cssNote').textContent = cssKind === 'shared'
    ? 'These are the names the other pages read (token-cascade, share-playground). Save the file as tokens.css next to them, or just open those pages: they pick up this theme automatically.'
    : 'The variables behind the four previews (--cip-*). What you see on the previews is exactly this.';
  $$('input[name=csskind]').forEach(r => { r.checked = r.value === cssKind; });
}
function update(persist = true) {
  const list = applyTokens();
  lastCss = cssText();
  lastSchema = schemaCss(state);
  renderCssOut();
  specs(list);
  applyUiVars();
  renderLayout();
  if ($('#view-checks').classList.contains('on')) runChecks();
  $$('#modeSeg input').forEach(i => { i.checked = i.value === state.mode; });
  if (!viewOnly) { syncPanel(); renderGenerate(); renderChecks(); }
  if (!viewOnly) { scheduleHealth(); commitHistory(); if ($('#view-compare').classList.contains('on')) scheduleCompare(); }
  if (persist && !viewOnly) { store('cip-current', state); store('cip-tokens-css', { css: lastSchema, name: state.name, at: Date.now() }); }
  fitSoon();
}

/* ---------- Fit previews ---------- */
let raf = 0;
const fitSoon = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); };
function fit() {
  const view = $('.view.on'); if (!view) return;
  const all = view.id === 'view-all';
  $$('.fit', view).forEach(box => {
    const frame = box.firstElementChild, w = +box.dataset.w;
    frame.style.width = w + 'px';
    const availW = box.parentElement.clientWidth || w;
    const maxH = all ? 430 : Math.max(460, innerHeight - 190);
    const h = frame.offsetHeight;
    const s = Math.min(availW / w, maxH / h, all ? 1 : 1.35);
    frame.style.transform = `scale(${s})`;
    box.style.width = Math.floor(w * s) + 'px';
    box.style.height = Math.ceil(h * s) + 'px';
  });
}

function buildAll() {
  const grid = $('#allGrid'); grid.innerHTML = '';
  ['web', 'mobile', 'social', 'print'].forEach(k => {
    const src = $(`#view-${k} .fit`);
    const cell = document.createElement('div'); cell.className = 'cell';
    cell.innerHTML = `<h3>${esc(src.dataset.name)}</h3><div class="slot"></div>`;
    cell.lastElementChild.appendChild(src.cloneNode(true));
    grid.appendChild(cell);
  });
}

/* ---------- Storage, share, themes ---------- */
function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
function load(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }

function sanitize(s) {
  const out = clone(DEFAULT);
  if (!s || typeof s !== 'object') return out;
  if (typeof s.name === 'string') out.name = s.name.slice(0, 32);
  out.mode = s.mode === 'dark' ? 'dark' : 'light';
  const num = (v, lo, hi, d) => (typeof v === 'number' && v >= lo && v <= hi ? v : d);
  // roles; old saved themes only had six brand colors, map them onto the light palette
  if (s.roles && typeof s.roles === 'object') {
    ['light', 'dark'].forEach(m => ROLE_IDS.forEach(id => { const v = s.roles[m] && s.roles[m][id]; if (hexOk(v)) out.roles[m][id] = v.toUpperCase(); }));
  } else if (s.colors && ['primary', 'red', 'gold', 'blue', 'paper', 'ink'].every(k => hexOk(s.colors[k]))) {
    const c = s.colors; out.roles.light = lightFrom(c.paper.toUpperCase(), c.ink.toUpperCase(), c.primary.toUpperCase(), c.blue.toUpperCase(), c.gold.toUpperCase(), c.red.toUpperCase());
  }
  const g = s.gen || {};
  if (hexOk(g.base)) out.gen.base = g.base.toUpperCase();
  if (HARMONIES[g.harmony]) out.gen.harmony = g.harmony;
  const t = s.type || {}, B = BASE_TYPE;
  if (FONTS[t.heading]) out.type.heading = t.heading;
  if (FONTS[t.body]) out.type.body = t.body;
  const w = t.w || {};
  const legacy = { heading: t.headingWeight, body: t.bodyWeight, subheading: t.uiWeight, button: t.uiWeight, label: t.uiWeight };
  Object.keys(B.w).forEach(k => { out.type.w[k] = num(w[k], 100, 900, num(legacy[k], 100, 900, B.w[k])); });
  [['title', 28, 40], ['titleMobile', 22, 30], ['section', 18, 28], ['reading', 16, 22], ['instr', 14, 18], ['label', 12, 16], ['display', 48, 96], ['printTitle', 18, 28], ['printBody', 10, 14], ['lhReading', 1.4, 1.8]]
    .forEach(([k, lo, hi]) => { out.type[k] = num(t[k], lo, hi, B[k]); });
  const sp = t.sp || {};
  Object.keys(B.sp).forEach(k => { out.type.sp[k].lh = num(sp[k] && sp[k].lh, 0.8, 2.5, B.sp[k].lh); out.type.sp[k].ls = num(sp[k] && sp[k].ls, -0.1, 0.3, B.sp[k].ls); });
  out.type.btnCaps = t.btnCaps === true;
  const sc = t.scale || {};
  out.type.scale = { on: sc.on === true, base: num(sc.base, 12, 24, 16), ratio: num(sc.ratio, 1.1, 1.7, 1.25) };
  // v2 = named scale (2 to 12). Older saves used a different unit, so they fall back to the new default.
  out.space.unit = s.space && s.space.v === 2 ? num(s.space.unit, 2, 12, 4) : 4;
  const ly = s.layout || {}, D = DEFAULT.layout;
  out.layout = { cols: num(ly.cols, 1, 24, D.cols), g: SPACE_STEPS.includes(ly.g) ? ly.g : D.g, m: SPACE_STEPS.includes(ly.m) ? ly.m : D.m, mode: RMODES[ly.mode] ? ly.mode : D.mode,
    bp0: num(ly.bp0, 240, 900, D.bp0), bp1: num(ly.bp1, 240, 900, D.bp1), bp2: num(ly.bp2, 240, 900, D.bp2), w: num(ly.w, 240, 900, D.w),
    overlay: ly.overlay === true, snap: ly.snap === true, content: ['cards', 'web', 'mobile'].includes(ly.content) ? ly.content : D.content,
    t0: num(ly.t0, 240, 1600, D.t0), t1: num(ly.t1, 240, 1600, D.t1), t2: num(ly.t2, 240, 1600, D.t2), t3: num(ly.t3, 240, 1600, D.t3), big: ly.big === true };
  out.shape.radius = num(s.shape && s.shape.radius, 0, 24, 10);
  out.shape.border = num(s.shape && s.shape.border, 0, 3, 1);
  return out;
}

const enc = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const dec = s => JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))));
function shareUrl() { return location.href.split('#')[0] + '#s=' + enc(state); }
function readHash() {
  const m = location.hash.match(/^#s=([\w-]+)/);
  if (!m) return null;
  try { return sanitize(dec(m[1])); } catch (e) { return null; }
}

let toastT = 0;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2200);
}
async function copy(text, ok) {
  try { await navigator.clipboard.writeText(text); toast(ok); }
  catch (e) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(ok); } catch (e2) { toast('Copy failed. Select the text and copy it manually.'); }
    ta.remove();
  }
}
function downloadFile(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function downloadCss() {
  if (cssKind === 'shared') downloadFile('tokens.css', lastSchema, 'text/css'); else downloadFile('rumo-ao-ciple-preview-vars.css', lastCss, 'text/css');
}

function renderSaved() {
  const list = load('cip-themes') || [];
  const ul = $('#savedList'); if (!ul) return;
  ul.innerHTML = list.length ? list.map((t, i) => `<li><span>${esc(t.name)}</span><div><button class="btn sm" type="button" data-load="${i}">Load</button><button class="btn sm ghost" type="button" data-del="${i}" aria-label="Delete ${esc(t.name)}">Delete</button></div></li>`).join('') : '';
}

/* ---------- Print ---------- */
function printWorksheet() {
  const src = $('#view-print .frame');
  const holder = document.createElement('div'); holder.id = 'print-clone';
  holder.appendChild(src.cloneNode(true));
  document.body.appendChild(holder);
  document.body.classList.add('printing');
  const done = () => { document.body.classList.remove('printing'); holder.remove(); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
}

/* ---------- Spacing view: sample cards use only space names ---------- */
function buildSpaceView() {
  const CARDS = [['Spending', 'Tap to pay anywhere, with instant alerts.'], ['Saving', 'Automatic round-ups that earn while you sleep.'], ['Investing', 'A diversified portfolio in minutes.']];
  const gap = n => `<div class="spl-g spl-gv" style="--gv:var(--cip-space-${n})"><span class="spl-lab">space-${n}</span></div>`;
  $('#splCards').innerHTML = CARDS.map(([t, p], i) => `
    <article class="spl-card" aria-label="${t}"><span class="spl-padlab">padding: space-4</span>
      <div class="spl-inner"><span class="spl-tag">New</span>${gap(2)}<h3>${t}</h3>${gap(3)}<p>${p}</p>${gap(3)}<button type="button" class="spl-btn">Learn more</button><span class="spl-btnlab">button padding: space-2 space-4</span></div>
    </article>` + (i < CARDS.length - 1 ? `<div class="spl-g spl-gh" style="--gh:var(--cip-space-6)" aria-hidden="true"><span class="spl-lab">space-6</span></div>` : '')).join('');
  $('#splGuides').addEventListener('change', e => { const st = $('#splStage'); st.classList.toggle('spl-on', e.target.checked); st.classList.toggle('spl-off', !e.target.checked); });
}

/* ---------- Layout views: column grid and responsive strategies ---------- */
const GRID_ROWS = [[1/2, 1/2], [1/3, 1/3, 1/3], [2/3, 1/3], [1/4, 1/4, 1/4, 1/4], [1]];
const RMODES = { fluid: 'Fluid', adaptive: 'Adaptive', combo: 'Combination' };
const spansFor = (fr, cols) => {
  if (cols < fr.length) return null;
  const s = fr.map(x => Math.max(1, Math.round(x * cols)));
  s[s.length - 1] = cols - s.slice(0, -1).reduce((a, b) => a + b, 0);
  return s[s.length - 1] < 1 ? null : s;
};
const bpList = () => [state.layout.bp0, state.layout.bp1, state.layout.bp2].slice().sort((a, b) => a - b);
function buildLayoutViews() {
  $('#rcards').innerHTML = [1, 2, 3, 4, 5, 6].map(i => `<div class="lay-rc"><strong>Card ${i}</strong><span></span></div>`).join('');
  const h = $('#rhandle'), frame = $('#rframe');
  const setW = w => { state.layout.w = Math.round(Math.min(Math.min(900, $('#rstage').clientWidth), Math.max(240, w))); update(); };
  h.addEventListener('pointerdown', e => { h.setPointerCapture(e.pointerId); e.preventDefault(); });
  h.addEventListener('pointermove', e => { if (h.hasPointerCapture(e.pointerId)) setW(e.clientX - frame.getBoundingClientRect().left); });
  h.addEventListener('keydown', e => {
    const st = e.shiftKey ? 50 : 10, w = state.layout.w;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setW(w + st);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setW(w - st);
    else if (e.key === 'Home') setW(240); else if (e.key === 'End') setW(900); else return;
    e.preventDefault();
  });
}

function applyLayoutVars() {
  const L = state.layout, r = document.documentElement.style;
  r.setProperty('--l-cols', L.cols); r.setProperty('--l-gut', `var(--cip-space-${L.g})`); r.setProperty('--l-mar', `var(--cip-space-${L.m})`);
  const side = Math.max(1, Math.min(L.cols - 1, Math.round(L.cols / 4))), M = Math.max(1, L.cols - side), a = Math.ceil(M / 2);
  const n1 = Math.max(1, Math.min(M - 1, Math.round(M * 0.6)));
  [['side', side], ['main', M], ['a', a], ['b', Math.max(1, M - a)], ['n1', n1], ['n2', Math.max(1, M - n1)]].forEach(([k, v]) => r.setProperty('--l-' + k, v));
  document.body.classList.toggle('show-grid', L.overlay);
  $$('.pv-web').forEach(el => { if (!el.closest('.lay-frame')) el.classList.toggle('snap', L.snap && L.cols >= 3); });
  $$('.frame.pv').forEach(f => {
    if (!f.querySelector(':scope > .grid-ov')) f.insertAdjacentHTML('beforeend', '<div class="grid-ov" aria-hidden="true"><div class="gov-m"></div><div class="gov-c"></div><div class="gov-m"></div></div>');
    const c = f.querySelector(':scope > .grid-ov .gov-c'); if (c.childElementCount !== L.cols) c.innerHTML = '<i></i>'.repeat(L.cols);
  });
  const bg = $('#btnGrid'); if (bg) bg.setAttribute('aria-pressed', String(L.overlay));
}
function renderReal(L, n, w, b) {
  const real = $('#rreal'), cards = $('#rcards'), fr = $('#rframe'), isReal = L.content !== 'cards';
  fr.classList.toggle('real', isReal); fr.classList.toggle('adaptive', isReal && L.mode === 'adaptive');
  cards.hidden = isReal; real.hidden = !isReal;
  if (!isReal) return;
  if (real.dataset.src !== L.content) {
    const c = $(`#view-${L.content} .frame`).cloneNode(true);
    c.style.transform = ''; c.style.width = ''; // fit() scales the originals with inline styles; a clone must start clean
    const ov = c.querySelector(':scope > .grid-ov'); if (ov) ov.remove(); c.classList.remove('snap');
    real.innerHTML = ''; real.appendChild(c); real.dataset.src = L.content;
  }
  const c = real.firstElementChild; c.dataset.n = n;
  c.style.width = L.mode === 'adaptive' ? Math.min(w, n === 1 ? 320 : b[n - 2]) + 'px' : '';
}

/* ---------- Layout checks: run the real screens at chosen widths ---------- */
const CK_STRESS = ['Compreensão oral extraordinariamente', 'Inconstitucionalissimamente', 'Responsabilidade'];
const ckStatus = (v, pass, warn) => v >= pass ? 'pass' : v >= warn ? 'warn' : 'fail';
let ckCanvas;
function cpl(el) {
  const cs = getComputedStyle(el), t = el.textContent.trim(); if (!t) return null;
  ckCanvas = ckCanvas || document.createElement('canvas');
  const ctx = ckCanvas.getContext('2d'); ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const avg = ctx.measureText(t).width / t.length;
  return avg ? Math.round(el.clientWidth / avg) : null;
}
function overflowPx(c) {
  const cr = c.getBoundingClientRect(); let o = c.scrollWidth - c.clientWidth;
  c.querySelectorAll('*').forEach(e => { if (!e.closest('.grid-ov')) o = Math.max(o, e.getBoundingClientRect().right - cr.right); });
  return Math.round(o);
}
function layoutRows(vars) {
  const L = state.layout, b = bpList(), widths = [L.t0, L.t1, L.t2, L.t3], rs = document.documentElement.style;
  const host = document.createElement('div'); host.className = 'lay-real'; host.style.cssText = 'position:absolute;left:-10000px;top:0;visibility:hidden;';
  document.body.appendChild(host);
  if (vars) vars.forEach(({ name, value }) => host.style.setProperty(name, value));
  const fsGet = vars ? Object.fromEntries(vars.filter(v => v.name.startsWith('--cip-fs-')).map(v => [v.name, v.value])) : null;
  const fsNames = fsGet ? Object.keys(fsGet) : Array.from({ length: rs.length }, (_, i) => rs[i]).filter(k => k.startsWith('--cip-fs-'));
  const rows = [];
  [['web', 'Dashboard'], ['mobile', 'Reading']].forEach(([key, name]) => widths.forEach(w => {
    const n = L.mode === 'fluid' ? 3 : 1 + b.filter(x => w >= x).length;
    const fw = L.mode === 'adaptive' ? Math.min(w, n === 1 ? 320 : b[n - 2]) : w;
    const build = stress => {
      host.innerHTML = ''; host.style.width = fw + 'px';
      fsNames.forEach(k => { const val = fsGet ? fsGet[k] : rs.getPropertyValue(k); if (L.big) host.style.setProperty(k, `calc(${val} * 1.25)`); else if (!fsGet) host.style.removeProperty(k); });
      const c = $(`#view-${key} .frame`).cloneNode(true);
      c.style.transform = '';
      const ov = c.querySelector(':scope > .grid-ov'); if (ov) ov.remove(); c.classList.remove('snap'); c.dataset.n = n; c.style.width = '100%';
      host.appendChild(c);
      if (stress) c.querySelectorAll('.skill h3, .w-nav span, .m-q h3, .opt').forEach((el, i) => {
        const tn = [...el.childNodes].filter(x => x.nodeType === 3).pop(); if (tn) tn.textContent = CK_STRESS[i % CK_STRESS.length];
      });
      return c;
    };
    let c = build(false);
    const ov = overflowPx(c);
    let minFs = 99; c.querySelectorAll('*').forEach(e => { if (e.closest('.grid-ov')) return; if ([...e.childNodes].some(x => x.nodeType === 3 && x.textContent.trim())) minFs = Math.min(minFs, parseFloat(getComputedStyle(e).fontSize)); });
    let minTap = 999; c.querySelectorAll('.pv-btn, .opt, .m-back, .w-nav span').forEach(e => { const r = e.getBoundingClientRect(); minTap = Math.min(minTap, Math.round(Math.min(r.width, r.height))); });
    const lineEl = c.querySelector('.m-text'), line = lineEl ? cpl(lineEl) : null;
    const so = overflowPx(build(true));
    rows.push({ name, w, n,
      overflow: { s: ov > 1 ? 'fail' : 'pass', t: ov > 1 ? `${ov} px over` : 'none' },
      text: { s: ckStatus(minFs, 14, 12), t: `${Math.round(minFs * 10) / 10} px` },
      tap: { s: minTap === 999 ? 'pass' : ckStatus(minTap, 44, 24), t: minTap === 999 ? '–' : `${minTap} px` },
      line: line == null ? { s: 'na', t: '–' } : { s: fw < 480 ? (line >= 32 && line <= 60 ? 'pass' : line >= 25 && line <= 75 ? 'warn' : 'fail') : (line >= 45 && line <= 75 ? 'pass' : line >= 35 && line <= 90 ? 'warn' : 'fail'), t: `${line} chars` },
      words: { s: so > 1 ? 'fail' : 'pass', t: so > 1 ? `${so} px over` : 'holds' } });
  }));
  host.remove();
  return rows;
}
function runChecks() {
  const L = state.layout, rows = layoutRows();
  const all = rows.flatMap(r => [r.overflow, r.text, r.tap, r.line, r.words]);
  const f = all.filter(x => x.s === 'fail').length, wn = all.filter(x => x.s === 'warn').length;
  const cell = x => `<td><span class="ck ck-${x.s}">${x.s === 'na' ? '–' : x.s === 'pass' ? 'Pass' : x.s === 'warn' ? 'Warn' : 'Fail'}</span> <small>${x.t}</small></td>`;
  $('#ckOut').innerHTML = `<p class="ck-sum"><b>${f}</b> fail · <b>${wn}</b> warn · ${all.length - f - wn} pass or not applicable · mode <b>${RMODES[L.mode]}</b>${L.big ? ' · text 25% larger' : ''}</p>
    <div class="ck-wrap"><table class="ck-table"><thead><tr><th>Screen</th><th>Width</th><th>Cols</th><th>Overflow</th><th>Smallest text</th><th>Tap target</th><th>Line length</th><th>Long words</th></tr></thead><tbody>` +
    rows.map(r => `<tr><th scope="row">${r.name}</th><td>${r.w} px</td><td>${r.n}</td>${cell(r.overflow)}${cell(r.text)}${cell(r.tap)}${cell(r.line)}${cell(r.words)}</tr>`).join('') + '</tbody></table></div>';
  const bd = $('#ckBadge'); if (bd) { bd.textContent = f; bd.hidden = !f; }
}
function renderLayout() {
  const L = state.layout, u = state.space.unit;
  if (!viewOnly) {
    $$('#l-g option, #l-m option').forEach(o => { o.textContent = `space-${o.value} · ${o.value * u} px`; });
    $$('input[name=rmode]').forEach(r => { r.checked = r.value === L.mode; });
    $$('input[name=rcontent]').forEach(r => { r.checked = r.value === L.content; });
  }
  // column grid
  const gs = $('#lgStage').style;
  gs.setProperty('--cols', L.cols); gs.setProperty('--gutter', `var(--cip-space-${L.g})`); gs.setProperty('--margin', `var(--cip-space-${L.m})`);
  $('#lgBands').innerHTML = '<i></i>'.repeat(L.cols);
  const seen = new Set();
  $('#lgRows').innerHTML = GRID_ROWS.map(fr => spansFor(fr, L.cols)).filter(s => s && !seen.has(s.join()) && seen.add(s.join()))
    .map(s => `<div class="lg-row">${s.map(n => `<div class="lg-b" style="--s:${n}">${n}</div>`).join('')}</div>`).join('');
  const b0 = $('#lgBands').firstElementChild;
  $('#lgRead').textContent = `${L.cols} columns · column ${b0 && b0.getBoundingClientRect().width ? b0.getBoundingClientRect().width.toFixed(1) : '–'} px · gutter ${L.g * u} px (space-${L.g}) · margin ${L.m * u} px (space-${L.m})`;
  // responsive strategies
  const stageW = $('#rstage').clientWidth || 900;
  const w = Math.round(Math.min(Math.min(900, stageW), Math.max(240, L.w))), b = bpList();
  const n = L.mode === 'fluid' ? 3 : 1 + b.filter(x => w >= x).length;
  $('#rframe').style.width = w + 'px';
  const rc = $('#rcards'); rc.className = 'lay-rcards ' + (L.mode === 'adaptive' ? 'adaptive' : 'flex'); rc.style.setProperty('--n', n);
  $('#rhandle').setAttribute('aria-valuenow', w);
  $('#rW').textContent = `Frame ${w} px`; $('#rC').textContent = `${n} column${n > 1 ? 's' : ''}`;
  let range = 'no breakpoints';
  if (L.mode !== 'fluid') { const lo = [0, ...b].filter(x => x <= w).pop(), hi = b.find(x => x > w); range = !lo ? `range under ${b[0]} px` : `range ${lo}${hi ? ' – ' + (hi - 1) : '+'} px`; }
  $('#rR').textContent = `${RMODES[L.mode]} · ${range}`;
  $('#rRuler').innerHTML = L.mode === 'fluid' ? '' : b.map(x => `<b style="left:${x}px">${x}</b>`).join('');
  renderReal(L, n, w, b);
  if (L.content === 'cards') [...rc.children].forEach(c => { c.lastElementChild.textContent = Math.round(c.getBoundingClientRect().width) + ' px wide'; });
  applyLayoutVars();
}

/* ---------- Health summary: contrast, layout, font weights and type spacing in one place ---------- */
let health = null, healthT = 0;
const CK_LABEL = { overflow: 'Overflow', text: 'Smallest text', tap: 'Tap target', line: 'Line length', words: 'Long words' };
function healthData(vars) {
  const items = [], tot = { contrast: 0, layout: 0, fonts: 0, spacing: 0 };
  ['light', 'dark'].forEach(m => {
    const { text, ui } = contrastData(m);
    tot.contrast += text.length + ui.filter(x => !x.deco).length;
    text.filter(x => x.r < 4.5).forEach(x => items.push({ cat: 'contrast', sev: 'fail', msg: `${MODE_NAME[m]}: ${x.n} is ${fmtRatio(x.r)} and needs 4.5:1`, go: { mode: m, panel: 'color', view: 'ui', target: '#checksOut' } }));
    ui.filter(x => !x.deco && x.r < 3).forEach(x => items.push({ cat: 'contrast', sev: 'fail', msg: `${MODE_NAME[m]}: ${x.n} is ${fmtRatio(x.r)} and needs 3:1`, go: { mode: m, panel: 'color', view: 'ui', target: '#checksOut' } }));
  });
  const groups = new Map();
  layoutRows(vars).forEach(r => Object.keys(CK_LABEL).forEach(k => {
    const c = r[k]; if (c.s === 'na') return; tot.layout++; if (c.s === 'pass') return;
    const key = r.name + '|' + k, g = groups.get(key) || { name: r.name, k, sev: 'warn', widths: [] };
    if (c.s === 'fail') g.sev = 'fail'; g.widths.push(r.w); groups.set(key, g);
  }));
  groups.forEach(g => items.push({ cat: 'layout', sev: g.sev, msg: `${g.name}: ${CK_LABEL[g.k]} ${g.sev === 'fail' ? 'fails' : 'needs a look'} at ${g.widths.join(', ')} px`, go: { panel: 'layout', view: 'checks' } }));
  const t = state.type;
  WROLES.forEach(([k, label, which]) => {
    tot.fonts++;
    const font = which === 'heading' ? t.heading : t.body, avail = FONTS[font].weights, w = t.w[k];
    if (!avail.includes(w)) items.push({ cat: 'fonts', sev: 'fail', msg: `${label} weight ${w}: ${font} doesn't ship it, so the browser would use ${nearestWeight(avail, w)}`, go: { panel: 'type', view: 'web', target: `[data-w-row="${k}"]` } });
  });
  SP_STEPS.forEach(([k, label]) => {
    tot.spacing++;
    guideline(k).forEach(m => items.push({ cat: 'spacing', sev: 'warn', msg: `${label}: ${m}`, go: { panel: 'type', view: 'web', target: `[data-sp-row="${k}"]` } }));
  });
  return { items, tot };
}
function healthNow() {
  clearTimeout(healthT);
  if (viewOnly) return;
  health = healthData();
  const fails = health.items.filter(i => i.sev === 'fail').length, warns = health.items.length - fails, pill = $('#healthPill');
  pill.className = 'btn ghost health ' + (fails ? 'bad' : warns ? 'warn' : 'ok');
  pill.querySelector('.ht').textContent = fails ? `${fails} to fix` : warns ? `${warns} to review` : 'All clear';
  pill.setAttribute('aria-label', 'Health: ' + pill.querySelector('.ht').textContent + '. Open the health summary.');
  if ($('#view-health').classList.contains('on')) renderHealth();
}
const scheduleHealth = () => { clearTimeout(healthT); healthT = setTimeout(healthNow, 350); };
function renderHealth() {
  if (!health) healthNow();
  const { items, tot } = health, L = state.layout;
  const fails = items.filter(i => i.sev === 'fail').length, warns = items.length - fails;
  $('#hlTitle').textContent = fails ? `${fails} to fix${warns ? `, ${warns} to review` : ''}` : warns ? `${warns} to review` : 'All clear';
  $('#hlTitle').className = 'hl-title ' + (fails ? 'bad' : warns ? 'warn' : 'ok');
  $('#hlSub').textContent = fails || warns ? 'Fix the red items before shipping. Amber ones are worth a look. Each row has a button that takes you to the control.'
    : 'Contrast passes in Light and Dark, the layout holds at every tested width, every font weight ships and the type spacing is within guidelines.';
  const cats = [['contrast', 'Contrast', 'Light and Dark palettes'], ['layout', 'Layout', `${RMODES[L.mode]} at ${[L.t0, L.t1, L.t2, L.t3].join(', ')} px`], ['fonts', 'Font weights', 'Each weight role against its font'], ['spacing', 'Type spacing', 'Line height and tracking guidelines']];
  $('#hlCats').innerHTML = cats.map(([k, name, sub]) => {
    const mine = items.filter(i => i.cat === k), f = mine.filter(i => i.sev === 'fail').length, w = mine.length - f;
    const cls = f ? 'bad' : w ? 'warn' : 'ok', chip = f ? `${f} to fix` : w ? `${w} to review` : '✓ Clear';
    return `<div class="hl-cat"><div class="hl-cat-h"><b>${name}</b><span class="hl-chip ${cls}">${chip}</span></div><p>${sub}</p><small>${tot[k]} ${k === 'spacing' ? 'steps' : 'checks'}</small></div>`;
  }).join('');
  $('#hlList').innerHTML = items.length ? items.map((i, n) => `<li class="hl-item ${i.sev}"><span class="hl-ic" aria-hidden="true">${i.sev === 'fail' ? '✕' : '!'}</span><span class="hl-msg">${esc(i.msg)}</span><button type="button" class="btn sm" data-hgo="${n}">Go to it</button></li>`).join('')
    : '<li class="hl-item ok"><span class="hl-ic" aria-hidden="true">✓</span><span class="hl-msg">Nothing to fix or review.</span></li>';
}
function healthGo(g) {
  if (g.mode && state.mode !== g.mode) { state.mode = g.mode; update(); }
  showPanelTab(g.panel); showView(g.view);
  if (g.target) {
    const el = $(g.target); if (!el) return;
    let d = el.closest('details'); while (d) { d.open = true; d = d.parentElement && d.parentElement.closest('details'); }
    el.scrollIntoView({ block: 'center' });
  }
}

/* ---------- Undo and redo: design edits only (view settings like Light/Dark and the frame width are not tracked) ---------- */
const H = { undo: [], redo: [], cur: null, t: 0, busy: false };
const HIST_LABEL = { roles: 'colors', type: 'type', space: 'spacing', shape: 'shape', layout: 'layout', gen: 'the palette generator', name: 'the theme name' };
function snapOf() {
  const o = clone(state); delete o.mode;
  if (o.layout) { delete o.layout.w; delete o.layout.overlay; delete o.layout.content; }
  return JSON.stringify(o);
}
function histLabel(a, b) {
  const x = JSON.parse(a), y = JSON.parse(b);
  const keys = Object.keys(HIST_LABEL).filter(k => JSON.stringify(x[k]) !== JSON.stringify(y[k]));
  return keys.length ? keys.map(k => HIST_LABEL[k]).join(' and ') : 'a change';
}
function updateHistoryButtons() {
  const u = $('#btnUndo'), r = $('#btnRedo');
  if (u) { u.disabled = !H.undo.length; u.title = H.undo.length ? `Undo (Ctrl+Z), ${H.undo.length} step${H.undo.length === 1 ? '' : 's'}` : 'Nothing to undo'; }
  if (r) { r.disabled = !H.redo.length; r.title = H.redo.length ? `Redo (Ctrl+Shift+Z), ${H.redo.length} step${H.redo.length === 1 ? '' : 's'}` : 'Nothing to redo'; }
}
function commitHistory() {
  const snap = snapOf();
  if (H.cur === null) { H.cur = snap; updateHistoryButtons(); return; }
  if (snap === H.cur) return;
  if (H.busy) { H.cur = snap; return; }
  const now = Date.now();
  if (now - H.t > 500 || !H.undo.length) { H.undo.push(H.cur); if (H.undo.length > 100) H.undo.shift(); }  // a new burst of edits starts here
  H.t = now; H.redo.length = 0; H.cur = snap; updateHistoryButtons();
}
function restoreSnap(snap) {
  const keep = { mode: state.mode, w: state.layout.w, overlay: state.layout.overlay, content: state.layout.content };
  const o = JSON.parse(snap); o.mode = keep.mode;
  state = sanitize(o); Object.assign(state.layout, { w: keep.w, overlay: keep.overlay, content: keep.content });
  H.busy = true; try { update(); } finally { H.busy = false; }
  H.cur = snapOf();
}
function undo() {
  if (viewOnly || !H.undo.length) return;
  const from = H.cur, to = H.undo.pop(); H.redo.push(from); H.t = 0;
  restoreSnap(to); updateHistoryButtons(); toast('Undid ' + histLabel(from, to));
}
function redo() {
  if (viewOnly || !H.redo.length) return;
  const from = H.cur, to = H.redo.pop(); H.undo.push(from); H.t = 0;
  restoreSnap(to); updateHistoryButtons(); toast('Redid ' + histLabel(from, to));
}

/* ---------- A/B compare: two themes, same screen, side by side, each with its own health ---------- */
let cmpA = 'cur', cmpB = 'p1', cmpScreen = 'web', cmpT = 0, cmpSig = '';
function compareThemes() {
  const list = [{ id: 'cur', name: 'Current edit' + (state.name ? ' (' + state.name + ')' : ''), st: clone(state) }];
  PRESETS.forEach((p, i) => list.push({ id: 'p' + i, name: p.name + ' (preset)', st: sanitize(p) }));
  (load('cip-themes') || []).forEach((t, i) => { if (t && t.name) list.push({ id: 's' + i, name: String(t.name).slice(0, 32) + ' (saved)', st: sanitize(t) }); });
  return list;
}
const withState = (s, fn) => { const keep = state; state = s; try { return fn(); } finally { state = keep; } };
function renderCompare() {
  clearTimeout(cmpT);
  const list = compareThemes(), sig = list.map(t => t.id + t.name).join('|');
  if (sig !== cmpSig) {
    cmpSig = sig;
    ['A', 'B'].forEach(k => { $('#cmp' + k).innerHTML = list.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join(''); });
  }
  if (!list.some(t => t.id === cmpA)) cmpA = 'cur';
  if (!list.some(t => t.id === cmpB)) cmpB = list.find(t => t.id !== cmpA).id;
  $('#cmpA').value = cmpA; $('#cmpB').value = cmpB;
  $$('input[name=cmpscreen]').forEach(r => { r.checked = r.value === cmpScreen; });
  $('#cmpNote').textContent = `Shown in ${MODE_NAME[state.mode]} mode (switch in the top bar). Health uses your current layout strategy and widths.`;
  [['a', cmpA], ['b', cmpB]].forEach(([side, id]) => {
    const th = list.find(t => t.id === id), s = clone(th.st);
    s.mode = state.mode; s.layout = clone(state.layout);
    const vars = tokens(s, state.mode), r = s.roles[state.mode];
    $('#cmp-' + side + '-h').textContent = th.name;
    $(`[data-use="${side}"]`).hidden = id === 'cur';
    $('#cmp-' + side + ' .cmp-sw').innerHTML = ['primary', 'secondary', 'accent', 'background', 'surface', 'text'].map(k => `<i style="background:${r[k]}" title="${k} ${r[k]}"></i>`).join('');
    const hd = withState(s, () => healthData(vars));
    const fails = hd.items.filter(i => i.sev === 'fail'), warns = hd.items.length - fails.length;
    const cls = fails.length ? 'bad' : warns ? 'warn' : 'ok';
    $('#cmp-' + side + ' .cmp-health').className = 'cmp-health ' + cls;
    $('#cmp-' + side + ' .cmp-health').innerHTML = `<b>${fails.length ? fails.length + ' to fix' : warns ? warns + ' to review' : 'All clear'}${fails.length && warns ? ', ' + warns + ' to review' : ''}</b>` +
      (hd.items.length ? '<ul>' + hd.items.slice(0, 4).map(i => `<li class="${i.sev}">${esc(i.msg)}</li>`).join('') + (hd.items.length > 4 ? `<li class="more">+ ${hd.items.length - 4} more</li>` : '') + '</ul>' : '');
    const holder = $('#cmp-' + side + ' .cmp-view');
    holder.removeAttribute('style');
    vars.forEach(({ name, value }) => holder.style.setProperty(name, value));
    holder.style.setProperty('--pv-tile', tileSvg(r.secondary, .55)); holder.style.setProperty('--pv-tile-light', tileSvg(r['on-primary'], .35));
    const src = $(`#view-${cmpScreen} .frame`), c = src.cloneNode(true);
    c.removeAttribute('style'); c.classList.remove('snap'); const ov = c.querySelector(':scope > .grid-ov'); if (ov) ov.remove();
    holder.innerHTML = `<div class="slot"><div class="fit" data-w="${cmpScreen === 'web' ? 960 : 360}"></div></div>`;
    holder.querySelector('.fit').appendChild(c);
  });
  fit(); applyScope();
}
const scheduleCompare = () => { clearTimeout(cmpT); cmpT = setTimeout(renderCompare, 350); };

/* ---------- Design Options show only what applies to the preview on screen ---------- */
const ALL_TAGS = ['web', 'mobile', 'social', 'print', 'grid', 'snap', 'strategy', 'respcontent', 'checks'];
function scopeTags() {
  const name = (($('.view.on') || {}).id || 'view-web').replace('view-', ''), L = state.layout;
  switch (name) {
    case 'web': return new Set(['web', 'grid', 'snap']);
    case 'mobile': return new Set(['mobile', 'grid']);
    case 'social': return new Set(['social', 'grid']);
    case 'print': return new Set(['print', 'grid']);
    case 'all': return new Set(['web', 'mobile', 'social', 'print', 'grid', 'snap']);
    case 'grid': return new Set(['grid', 'snap']);
    case 'resp': return new Set(['strategy', 'respcontent', L.content === 'cards' ? '' : L.content]);
    case 'checks': return new Set(['strategy', 'checks', 'web', 'mobile']);
    case 'compare': return new Set(['strategy', cmpScreen]);
    case 'health': case 'css': return new Set(ALL_TAGS);
    default: return new Set();   // sample UI and spacing: colors and tokens only
  }
}
function applyScope() {
  if (!$('#panel') || viewOnly) return;
  const set = scopeTags();
  $$('#panel [data-for]').forEach(el => { el.hidden = !el.dataset.for.split(' ').some(t => set.has(t)); });
  const sizes = $('#panel .sizes'); if (sizes) sizes.hidden = state.type.scale.on || !$$('.field', sizes).some(f => !f.hidden);
}

/* ---------- Generate palette, randomize fonts ---------- */
function generatePalette() {
  const base = state.gen.base.toUpperCase(), hs = HARMONIES[state.gen.harmony][1].map(([, d]) => rotate(base, d));
  const sec = hs[0], acc = hs[1] || rotate(base, 60), r = state.roles[state.mode], W = '#FFFFFF', K = '#000000';
  if (state.mode === 'light') {
    const text = mix(base, K, .85);
    Object.assign(r, { primary: base, secondary: sec, accent: acc, background: mix(base, W, .96), surface: W, text, muted: mix(text, W, .38), border: mix(base, W, .88), 'border-strong': mix(text, W, .55) });
    r['on-primary'] = onC(base);
  } else {
    const lift = c => mix(c, W, .28);
    Object.assign(r, { primary: lift(base), secondary: lift(sec), accent: lift(acc), background: mix(base, K, .9), surface: mix(base, K, .83), text: mix(base, W, .9), muted: mix(base, W, .62), border: mix(base, K, .7), 'border-strong': mix(base, W, .35) });
    r['on-primary'] = onC(r.primary);
  }
  update(); toast('Generated the ' + state.mode + ' palette from ' + base);
}
function randomizeFonts() {
  const names = Object.keys(FONTS), pick = () => names[Math.floor(Math.random() * names.length)];
  const h = pick(); let b = pick(); if (b === h) b = names[(names.indexOf(b) + 1) % names.length];
  state.type.heading = h; state.type.body = b; update();
}

/* ---------- Wiring ---------- */
function showView(name) {
  $$('.tabs [role=tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.view === name)));
  $$('.view').forEach(v => v.classList.toggle('on', v.id === 'view-' + name));
  if (name === 'grid' || name === 'resp') renderLayout();
  if (name === 'checks') runChecks();
  if (name === 'health') renderHealth();
  if (name === 'compare') renderCompare();
  applyScope();
  fit();
}
const withMode = pr => Object.assign(clone(pr), { mode: state.mode });

function bind() {
  const panel = $('#panel');
  panel.addEventListener('input', e => {
    const el = e.target;
    if (el.id === 'applyRole') { applyTarget = el.value; return; }
    if (el.name === 'rcontent') { state.layout.content = el.value; update(); return; }
    if (el.name === 'rmode') { state.layout.mode = el.value; update(); return; }
    if (el.name === 'base-unit') { state.space.unit = +el.value; update(); return; }
    if (el.id === 'ratioPreset') { if (el.value !== 'custom') { state.type.scale.ratio = parseFloat(el.value); update(); } return; }
    if (el.dataset.hex) {
      let v = el.value.trim(); if (v && v[0] !== '#') v = '#' + v;
      if (hexOk(v)) { set(state, el.dataset.hex, v.toUpperCase()); el.classList.remove('bad'); const c = $(`input[type=color][data-path="${el.dataset.hex}"]`, panel); if (c) c.value = v; update(); }
      else el.classList.add('bad');
      return;
    }
    if (!el.dataset.path) return;
    let v = el.value;
    if (el.type === 'checkbox') {
      v = el.checked;
      if (el.dataset.path === 'type.btnCaps') { const b = state.type.sp.button; if (v && b.ls === 0) b.ls = 0.04; else if (!v && b.ls === 0.04) b.ls = 0; }
    } else if (el.type === 'range' || el.type === 'number' || el.hasAttribute('data-num')) { v = parseFloat(v); if (!Number.isFinite(v)) return; }
    if (el.type === 'color') v = v.toUpperCase();
    set(state, el.dataset.path, v);
    update();
  });
  panel.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.ptabBtn) { showPanelTab(b.dataset.ptabBtn); panel.scrollTop = 0; return; }
    if (b.dataset.sw) { picked = b.dataset.sw; renderGenerate(); copy(picked, 'Copied ' + picked); return; }
    if (b.dataset.act) {
      const a = b.dataset.act;
      if (a === 'generate') generatePalette();
      else if (a === 'randomize') randomizeFonts();
      else if (a === 'swap') { const t = state.type; [t.heading, t.body] = [t.body, t.heading]; update(); }
      else if (a === 'label-dark') { state.roles.dark['on-primary'] = state.roles.dark.background; update(); }
      else if (a === 'label-white') { state.roles.dark['on-primary'] = '#FFFFFF'; update(); }
      else if (a === 'copy-sw') copy(picked, 'Copied ' + picked);
      else if (a === 'apply-role') { if (picked) { state.roles[state.mode][applyTarget] = picked; update(); toast(`${applyTarget} (${state.mode}) set to ${picked}`); } }
      else if (a === 'copycss') copy(lastSchema, 'tokens.css copied');
      else if (a === 'dljson') { downloadFile('rumo-ao-ciple-theme.json', JSON.stringify(state, null, 2), 'application/json'); toast('Downloaded the theme .json'); }
      else if (a === 'import') doImport($('#importText').value, '');
      else if (a === 'dlcss') downloadCss();
      else if (a === 'share') copy(shareUrl(), 'View-only link copied');
      else if (a === 'print') printWorksheet();
      else if (a === 'showcss') showView('css');
      else if (a === 'showspace') showView('space');
      else if (a === 'undo') undo();
      else if (a === 'redo') redo();
      else if (a === 'showgrid') showView('grid');
      else if (a === 'showchecks') showView('checks');
      else if (a === 'showresp') showView('resp');
      return;
    }
    if (b.dataset.preset) { const keepL = state.layout; state = withMode(PRESETS[+b.dataset.preset]); state.layout = keepL; update(); }
    else if (b.dataset.load) { const t = (load('cip-themes') || [])[+b.dataset.load]; if (t) { const keep = state.mode; state = sanitize(t); state.mode = keep; update(); toast('Loaded “' + state.name + '”'); } }
    else if (b.dataset.del) { const l = load('cip-themes') || []; l.splice(+b.dataset.del, 1); store('cip-themes', l); renderSaved(); }
    else if (b.id === 'btnSaveTheme') {
      const name = $('#themeName').value.trim() || 'My theme';
      const l = load('cip-themes') || []; const i = l.findIndex(t => t.name === name);
      const entry = Object.assign(clone(state), { name });
      if (i >= 0) l[i] = entry; else l.push(entry);
      state.name = name; store('cip-themes', l); renderSaved(); update(); $('#themeName').value = ''; toast('Saved “' + name + '”');
    }
  });

  panel.addEventListener('keydown', e => {
    if (!e.target.dataset.ptabBtn || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const ks = PANEL_TABS.map(t => t[0]), i = ks.indexOf(e.target.dataset.ptabBtn), n = ks[(i + (e.key === 'ArrowRight' ? 1 : -1) + ks.length) % ks.length];
    showPanelTab(n); $('#ptb-' + n).focus();
  });
  $('#modeSeg').addEventListener('change', e => { if (e.target.checked) { state.mode = e.target.value; update(!viewOnly); } });

  $$('.tabs [role=tab]').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));
  $('.tabs').addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const tabs = $$('.tabs [role=tab]').filter(t => t.offsetParent); const i = tabs.indexOf(document.activeElement); if (i < 0) return;
    const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]; n.focus(); n.click();
  });

  document.addEventListener('keydown', e => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey || viewOnly) return;
    const k = e.key.toLowerCase(); if (k !== 'z' && k !== 'y') return;
    const t = e.target, typing = t.isContentEditable || t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && !['range', 'color', 'checkbox', 'radio', 'button'].includes(t.type));
    if (typing) return;  // let text fields keep their own undo
    e.preventDefault();
    if (k === 'y' || e.shiftKey) redo(); else undo();
  });
  $('#cmpA').addEventListener('change', e => { cmpA = e.target.value; renderCompare(); });
  $('#cmpB').addEventListener('change', e => { cmpB = e.target.value; renderCompare(); });
  $('#cmpSwap').addEventListener('click', () => { [cmpA, cmpB] = [cmpB, cmpA]; renderCompare(); });
  $$('input[name=cmpscreen]').forEach(r => r.addEventListener('change', () => { if (r.checked) { cmpScreen = r.value; renderCompare(); } }));
  $$('[data-use]').forEach(b => b.addEventListener('click', () => {
    const th = compareThemes().find(t => t.id === (b.dataset.use === 'a' ? cmpA : cmpB)); if (!th) return;
    const keep = state.mode; state = sanitize(th.st); state.mode = keep; update(); toast('Loaded “' + state.name + '” into the editor');
  }));
  $('#healthPill').addEventListener('click', () => { healthNow(); showView('health'); });
  $('#hlList').addEventListener('click', e => { const b = e.target.closest('[data-hgo]'); if (b && health) healthGo(health.items[+b.dataset.hgo].go); });
  $('#btnGrid').addEventListener('click', () => { state.layout.overlay = !state.layout.overlay; update(); });
  const tb = $('#toolsBtn'), tl = $('#toolsList');
  const toolsOpen = open => { tl.hidden = !open; tb.setAttribute('aria-expanded', String(open)); };
  tb.addEventListener('click', e => { e.stopPropagation(); toolsOpen(tl.hidden); if (!tl.hidden) tl.querySelector('a').focus(); });
  document.addEventListener('click', e => { if (!tl.hidden && !$('#toolsMenu').contains(e.target)) toolsOpen(false); });
  $('#toolsMenu').addEventListener('keydown', e => { if (e.key === 'Escape' && !tl.hidden) { toolsOpen(false); tb.focus(); } });
  $('#toolsMenu').addEventListener('focusout', e => { if (!tl.hidden && !$('#toolsMenu').contains(e.relatedTarget)) toolsOpen(false); });
  $('#btnShare').addEventListener('click', () => copy(shareUrl(), 'View-only link copied'));
  $('#btnReset').addEventListener('click', () => { state = withMode(DEFAULT); update(); toast('Reset to Azulejo'); });
  $('#btnCopyCss').addEventListener('click', () => copy(cssKind === 'shared' ? lastSchema : lastCss, 'CSS copied'));
  $$('input[name=csskind]').forEach(r => r.addEventListener('change', () => { if (r.checked) { cssKind = r.value; renderCssOut(); } }));
  panel.addEventListener('change', e => {
    if (e.target.id !== 'importFile' || !e.target.files[0]) return;
    const f = e.target.files[0], rd = new FileReader();
    rd.onload = () => { $('#importText').value = String(rd.result).slice(0, 400000); doImport(String(rd.result).slice(0, 400000), f.name); e.target.value = ''; };
    rd.onerror = () => { $('#importMsg').textContent = 'The file could not be read.'; };
    rd.readAsText(f);
  });
  $('#btnDownloadCss').addEventListener('click', downloadCss);  $('#btnPrint').addEventListener('click', printWorksheet);
  $('#btnEdit').addEventListener('click', () => { history.replaceState(null, '', location.pathname + location.search); enterEditor(state); });

  addEventListener('resize', fitSoon);
  addEventListener('hashchange', () => { const s = readHash(); if (s) enterViewer(s); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitSoon);
  if (document.fonts) document.fonts.addEventListener && document.fonts.addEventListener('loadingdone', fitSoon);
}

function enterViewer(s) {
  viewOnly = true; state = s;
  document.body.classList.add('view-only');
  $('#viewBadge').hidden = false; $('#btnEdit').hidden = false;
  showView('web'); update(false);
}
function enterEditor(s) {
  viewOnly = false; state = s; H.undo = []; H.redo = []; H.cur = null;
  document.body.classList.remove('view-only');
  $('#viewBadge').hidden = true; $('#btnEdit').hidden = true;
  buildPanel(); renderSaved(); update();
}

/* ---------- Boot ---------- */
buildAll();
buildUi();
buildSpaceView();
buildLayoutViews();
bind();
const shared = readHash();
if (shared) { buildPanel(); enterViewer(shared); }
else { buildPanel(); renderSaved(); state = sanitize(load('cip-current') || DEFAULT); update(); }
// the tool opens on the dashboard
showView('web');
})();
