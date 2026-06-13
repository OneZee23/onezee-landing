/**
 * Liquid Glass — real optical refraction for the web (Apple "Liquid Glass" lens).
 *
 * A displacement map is generated on a <canvas> (red = X bend, blue = Y bend,
 * with a blurred neutral core so the centre stays optically flat and only the
 * rim refracts — thick-bezel optics, not a fisheye). That map feeds three
 * <feDisplacementMap> passes (one per RGB channel, slightly different scales)
 * for chromatic aberration, wired into `backdrop-filter: url(#id)` so it bends
 * the page content behind the element.
 *
 * Real refraction in Chromium (SVG filters in backdrop-filter); clean
 * `backdrop-filter: blur()` fallback on Safari/Firefox via CSS.supports.
 * Zero dependencies. MIT. Adapted from rizroze/liquid-glass + kube.io writeup.
 */

/** True only where SVG filters work as a backdrop-filter (real refraction). */
export function supportsRefraction() {
  if (typeof CSS === 'undefined' || !CSS.supports) return false;
  return (
    CSS.supports('backdrop-filter', 'url(#a)') ||
    CSS.supports('-webkit-backdrop-filter', 'url(#a)')
  );
}

const SVG_NS = 'http://www.w3.org/2000/svg';
let _uid = 0;

function resolve(el, opts) {
  const rect = el.getBoundingClientRect();
  const width = Math.max(1, Math.round(opts.width ?? rect.width));
  const height = Math.max(1, Math.round(opts.height ?? rect.height));
  const minSide = Math.min(width, height);

  let radius = opts.radius;
  if (radius == null) radius = Math.min(24, minSide / 2);
  if (radius === 'max' || radius === Infinity) radius = minSide / 2;
  radius = Math.min(radius, minSide / 2);

  return {
    width,
    height,
    radius,
    scale: opts.scale ?? opts.displace ?? 70,
    chroma: opts.chroma ?? 6,
    blur: opts.blur ?? Math.max(2, minSide * 0.06),
    core: opts.core ?? 0.18,
    backdropBlur: opts.backdropBlur ?? 2,
    saturation: opts.saturation ?? 1.6,
    specular: opts.specular ?? 0.5,
    tint: opts.tint ?? 0.04,
    fallbackBlur: opts.fallbackBlur ?? 10,
  };
}

function buildDisplacementMap(c) {
  const pad = Math.ceil(c.scale) + 2;
  const W = c.width + pad * 2;
  const H = c.height + pad * 2;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgb(128,128,128)';
  ctx.fillRect(0, 0, W, H);

  const ox = pad;
  const oy = pad;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(ox, oy, c.width, c.height, c.radius);
  ctx.clip();

  ctx.fillStyle = '#000';
  ctx.fillRect(ox, oy, c.width, c.height);

  const rg = ctx.createLinearGradient(ox, oy, ox + c.width, oy);
  rg.addColorStop(0, '#000');
  rg.addColorStop(1, '#f00');
  ctx.fillStyle = rg;
  ctx.fillRect(ox, oy, c.width, c.height);

  ctx.globalCompositeOperation = 'difference';
  const bg = ctx.createLinearGradient(ox, oy, ox, oy + c.height);
  bg.addColorStop(0, '#000');
  bg.addColorStop(1, '#00f');
  ctx.fillStyle = bg;
  ctx.fillRect(ox, oy, c.width, c.height);

  ctx.globalCompositeOperation = 'source-over';
  const inset = Math.min(c.width, c.height) * c.core;
  const coreRadius = Math.max(0, c.radius - inset);
  ctx.filter = `blur(${c.blur}px)`;
  ctx.fillStyle = 'rgb(128,128,128)';
  ctx.beginPath();
  ctx.roundRect(
    ox + inset,
    oy + inset,
    Math.max(1, c.width - inset * 2),
    Math.max(1, c.height - inset * 2),
    coreRadius
  );
  ctx.fill();
  ctx.filter = 'none';

  ctx.restore();

  return { uri: canvas.toDataURL(), pad };
}

function buildFilterSVG(id) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute(
    'style',
    'position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;opacity:0;z-index:-1;'
  );

  svg.innerHTML = `
    <defs>
      <filter id="${id}" color-interpolation-filters="sRGB"
              x="0" y="0" width="100%" height="100%">
        <feImage result="map" preserveAspectRatio="none" crossorigin="anonymous"/>

        <feDisplacementMap in="SourceGraphic" in2="map"
            xChannelSelector="R" yChannelSelector="B" data-ch="r" result="dR"/>
        <feColorMatrix in="dR" type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="cR"/>

        <feDisplacementMap in="SourceGraphic" in2="map"
            xChannelSelector="R" yChannelSelector="B" data-ch="g" result="dG"/>
        <feColorMatrix in="dG" type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="cG"/>

        <feDisplacementMap in="SourceGraphic" in2="map"
            xChannelSelector="R" yChannelSelector="B" data-ch="b" result="dB"/>
        <feColorMatrix in="dB" type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cB"/>

        <feBlend in="cR" in2="cG" mode="screen" result="rg"/>
        <feBlend in="rg" in2="cB" mode="screen" result="refracted"/>

        <feGaussianBlur in="refracted" stdDeviation="0" data-ch="soft"/>
      </filter>
    </defs>`;

  return {
    svg,
    filter: svg.querySelector('filter'),
    feImage: svg.querySelector('feImage'),
    r: svg.querySelector('[data-ch="r"]'),
    g: svg.querySelector('[data-ch="g"]'),
    b: svg.querySelector('[data-ch="b"]'),
    soft: svg.querySelector('[data-ch="soft"]'),
  };
}

function applyFilter(c, refs) {
  const { uri, pad } = buildDisplacementMap(c);

  const px = Math.ceil((pad / c.width) * 100);
  const py = Math.ceil((pad / c.height) * 100);
  refs.filter.setAttribute('x', `-${px}%`);
  refs.filter.setAttribute('y', `-${py}%`);
  refs.filter.setAttribute('width', `${100 + px * 2}%`);
  refs.filter.setAttribute('height', `${100 + py * 2}%`);

  refs.feImage.setAttribute('x', `-${px}%`);
  refs.feImage.setAttribute('y', `-${py}%`);
  refs.feImage.setAttribute('width', `${100 + px * 2}%`);
  refs.feImage.setAttribute('height', `${100 + py * 2}%`);
  refs.feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', uri);
  refs.feImage.setAttribute('href', uri);

  refs.r.setAttribute('scale', String(c.scale));
  refs.g.setAttribute('scale', String(c.scale + c.chroma));
  refs.b.setAttribute('scale', String(c.scale + c.chroma * 2));

  refs.soft.setAttribute('stdDeviation', String(Math.max(0, c.backdropBlur)));
}

function styleElement(el, c, filterId, active) {
  el.style.setProperty('isolation', 'isolate');

  if (active) {
    const f = `url(#${filterId}) saturate(${c.saturation})`;
    el.style.backdropFilter = f;
    el.style.setProperty('-webkit-backdrop-filter', f);
  } else {
    const f = `blur(${c.fallbackBlur}px) saturate(${c.saturation})`;
    el.style.backdropFilter = f;
    el.style.setProperty('-webkit-backdrop-filter', f);
  }

  if (c.tint > 0) {
    el.style.backgroundColor = `rgba(255,255,255,${c.tint})`;
  }
  const parts = [];
  if (c.specular > 0) {
    const s = c.specular;
    parts.push(`inset 0 1px 1px rgba(255,255,255,${0.55 * s})`);
    parts.push(`inset 1px 0 1px rgba(255,255,255,${0.25 * s})`);
    parts.push(`inset 0 -1px 1px rgba(0,0,0,${0.18 * s})`);
    parts.push(`inset -1px 0 1px rgba(0,0,0,${0.1 * s})`);
  }
  parts.push(`0 6px 20px rgba(20,28,56,${0.16})`);
  el.style.boxShadow = parts.join(', ');
}

/**
 * Attach a Liquid Glass refraction lens to an element (give it a border-radius).
 * Returns { update(o), destroy(), active, svg }.
 */
export function initLiquidGlass(el, opts = {}) {
  if (!el) throw new Error('initLiquidGlass: element required');

  const active = supportsRefraction();
  let options = { ...opts };
  let config = resolve(el, options);

  if (!active) {
    styleElement(el, config, null, false);
    let ro = null;
    if (options.width == null || options.height == null) {
      ro = new ResizeObserver(() => {
        config = resolve(el, options);
        styleElement(el, config, null, false);
      });
      ro.observe(el);
    }
    return {
      active: false,
      svg: null,
      update(o) {
        options = { ...options, ...o };
        config = resolve(el, options);
        styleElement(el, config, null, false);
      },
      destroy() {
        if (ro) ro.disconnect();
        el.style.backdropFilter = '';
        el.style.removeProperty('-webkit-backdrop-filter');
        el.style.boxShadow = '';
        el.style.backgroundColor = '';
        el.style.removeProperty('isolation');
      },
    };
  }

  const id =
    options.filterId ?? `liquid-glass-${++_uid}-${Math.random().toString(36).slice(2, 7)}`;
  const refs = buildFilterSVG(id);
  document.body.appendChild(refs.svg);

  applyFilter(config, refs);
  styleElement(el, config, id, true);

  let ro = null;
  let raf = 0;
  if (options.width == null || options.height == null) {
    ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        config = resolve(el, options);
        applyFilter(config, refs);
        styleElement(el, config, id, true);
      });
    });
    ro.observe(el);
  }

  const api = {
    active: true,
    svg: refs.svg,
    update(o) {
      options = { ...options, ...o };
      config = resolve(el, options);
      applyFilter(config, refs);
      styleElement(el, config, id, true);
    },
    destroy() {
      if (ro) ro.disconnect();
      cancelAnimationFrame(raf);
      unwirePress();
      refs.svg.remove();
      el.style.backdropFilter = '';
      el.style.removeProperty('-webkit-backdrop-filter');
      el.style.boxShadow = '';
      el.style.backgroundColor = '';
      el.style.removeProperty('isolation');
    },
  };

  // Press: the glass refracts harder while held — the real material response
  // (the displacement scale bumps up on pointer-down, reverts on release).
  const baseScale = config.scale;
  let unwirePress = () => {};
  if (options.press) {
    const factor = options.pressFactor ?? 1.7;
    let pressed = false;
    const down = () => { pressed = true; api.update({ scale: baseScale * factor }); };
    const up = () => { if (!pressed) return; pressed = false; api.update({ scale: baseScale }); };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('pointerleave', up);
    unwirePress = () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('pointerleave', up);
    };
  }

  return api;
}

export default initLiquidGlass;
