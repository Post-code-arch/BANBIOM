/* @ds-bundle: {"format":4,"namespace":"Banbiom","components":[]} */
/* BANBIOM — moteur voronoï partagé.
   Banbiom.field(canvas, opts)        champ animé ou statique (macro, méso, micro)
   Banbiom.division(svg, opts)        division d'un cadre en 2, 3, 6, 12… cellules, avec cellule dominante
   Banbiom.cellPath(seed, w, h, opts) une cellule seule (nano), chemin SVG
   Banbiom.seedsFromSpecies(sp)       graines placées par les données d'une espèce */
(function () {
  "use strict";
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }
  function hash(str) { var h = 2166136261; str = String(str); for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  /* ---------- géométrie ---------- */
  /* demi-plan de puissance entre p et q (poids wp, wq), recul de g/2 vers p */
  function clipPower(poly, p, q, g, wp, wq) {
    var nx = q[0] - p[0], ny = q[1] - p[1], len = Math.hypot(nx, ny) || 1, mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    var shift = (wp - wq) / 2, off = g / 2 * len, out = [];
    function side(v) { return (v[0] - mx) * nx + (v[1] - my) * ny - shift + off; }
    return cutBy(poly, side);
  }
  function cutBy(poly, side) {
    var out = [];
    for (var i = 0; i < poly.length; i++) {
      var a = poly[i], b = poly[(i + 1) % poly.length], sa = side(a), sb = side(b);
      if (sa <= 0) out.push(a);
      if ((sa <= 0) !== (sb <= 0)) { var t = sa / (sa - sb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    return out;
  }
  function frame(w, h, m) { return [[-m, -m], [w + m, -m], [w + m, h + m], [-m, h + m]]; }
  /* diagramme de puissance : chaque graine {x, y, w (poids, px²)} */
  function cells(pts, w, h, gapOf, margin) {
    return pts.map(function (p, i) {
      var poly = frame(w, h, margin == null ? 60 : margin), g = gapOf(p);
      for (var j = 0; j < pts.length && poly.length > 2; j++) if (j !== i) poly = clipPower(poly, [p.x, p.y], [pts[j].x, pts[j].y], g, p.w || 0, pts[j].w || 0);
      return poly;
    });
  }
  function dedupe(poly) {
    var pts = [];
    poly.forEach(function (v) { var l = pts[pts.length - 1]; if (!l || Math.hypot(v[0] - l[0], v[1] - l[1]) > 0.05) pts.push(v); });
    if (pts.length > 1 && Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) <= 0.05) pts.pop();
    return pts;
  }
  function centroid(pts) { var cx = 0, cy = 0; pts.forEach(function (v) { cx += v[0]; cy += v[1]; }); return [cx / pts.length, cy / pts.length]; }
  function inwardNormal(a, b, c) {
    var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    if (nx * (c[0] - a[0]) + ny * (c[1] - a[1]) < 0) { nx = -nx; ny = -ny; }
    return [nx, ny];
  }
  /* arrondi adaptatif : rayon = min(R, moitié de la distance du centre au bord le plus proche).
     La cellule est réduite de ce rayon puis regonflée : coins en arcs exacts, bords inchangés,
     et une petite cellule garde sa forme au lieu de disparaître. */
  function rounded(poly, R) {
    var pts = dedupe(poly); if (pts.length < 3) return null;
    var c = centroid(pts), n = pts.length, dmin = 1e9;
    for (var i = 0; i < n; i++) {
      var a = pts[i], b = pts[(i + 1) % n], nr = inwardNormal(a, b, c);
      dmin = Math.min(dmin, (c[0] - a[0]) * nr[0] + (c[1] - a[1]) * nr[1]);
    }
    if (dmin < 0.8) return null;
    var r = Math.max(0, Math.min(R, dmin * 0.35));
    if (r < 0.6) return { pts: pts, r: 0 };
    var inner = pts;
    for (var k = 0; k < n; k++) {
      (function (a, b) { var nr = inwardNormal(a, b, c); inner = cutBy(inner, function (v) { return r - ((v[0] - a[0]) * nr[0] + (v[1] - a[1]) * nr[1]); }); })(pts[k], pts[(k + 1) % n]);
      if (inner.length < 3) return { pts: pts, r: 0 };
    }
    inner = dedupe(inner); if (inner.length < 3) return { pts: pts, r: 0 };
    return { pts: inner, r: r };
  }
  function arcs(shape) {
    var pts = shape.pts, n = pts.length, c = centroid(pts), out = [];
    for (var i = 0; i < n; i++) {
      var a = pts[(i - 1 + n) % n], b = pts[i], d = pts[(i + 1) % n];
      var n1 = inwardNormal(a, b, c), n2 = inwardNormal(b, d, c);
      n1 = [-n1[0], -n1[1]]; n2 = [-n2[0], -n2[1]];
      out.push({ b: b, a1: Math.atan2(n1[1], n1[0]), a2: Math.atan2(n2[1], n2[0]), n1: n1, n2: n2, ccw: (n1[0] * n2[1] - n1[1] * n2[0]) < 0 });
    }
    return out;
  }
  function traceCanvas(ctx, poly, R) {
    var s = rounded(poly, R); if (!s) return false;
    ctx.beginPath();
    if (!s.r) { s.pts.forEach(function (v, j) { j ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]); }); ctx.closePath(); return true; }
    arcs(s).forEach(function (k) { ctx.arc(k.b[0], k.b[1], s.r, k.a1, k.a2, k.ccw); });
    ctx.closePath(); return true;
  }
  function traceSVG(poly, R) {
    var s = rounded(poly, R); if (!s) return "";
    var f = function (v) { return v.toFixed(2); };
    if (!s.r) return "M" + s.pts.map(function (v) { return f(v[0]) + " " + f(v[1]); }).join("L") + "Z";
    var d = "", r = s.r;
    arcs(s).forEach(function (k, i) {
      var p1 = [k.b[0] + k.n1[0] * r, k.b[1] + k.n1[1] * r], p2 = [k.b[0] + k.n2[0] * r, k.b[1] + k.n2[1] * r];
      d += (i ? "L" : "M") + f(p1[0]) + " " + f(p1[1]) + "A" + f(r) + " " + f(r) + " 0 0 " + (k.ccw ? 0 : 1) + " " + f(p2[0]) + " " + f(p2[1]);
    });
    return d + "Z";
  }
  /* plus grand rectangle (rapport donné) centré dans une cellule convexe : zone de texte */
  function innerRect(poly, aspect) {
    var pts = dedupe(poly); if (pts.length < 3) return null;
    var c = centroid(pts), n = pts.length;
    function inside(x, y) { for (var i = 0; i < n; i++) { var a = pts[i], b = pts[(i + 1) % n], nr = inwardNormal(a, b, c); if ((x - a[0]) * nr[0] + (y - a[1]) * nr[1] < 0) return false; } return true; }
    var lo = 0, hi = 4000;
    for (var it = 0; it < 30; it++) { var m = (lo + hi) / 2, hw = m * aspect / 2, hh = m / 2;
      if (inside(c[0] - hw, c[1] - hh) && inside(c[0] + hw, c[1] - hh) && inside(c[0] + hw, c[1] + hh) && inside(c[0] - hw, c[1] + hh)) lo = m; else hi = m; }
    return { x: c[0] - lo * aspect / 2, y: c[1] - lo / 2, w: lo * aspect, h: lo };
  }

  /* ---------- couleurs (tokens du thème courant) ---------- */
  function hex(h) { h = (h || "#088").trim(); if (h.indexOf("rgb") === 0) return h.replace(/[^\d,.]/g, "").split(",").slice(0, 3).map(Number); h = h.replace("#", ""); if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join(""); var n = parseInt(h.slice(0, 6), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function rgb(a) { return "rgb(" + a.map(Math.round).join(",") + ")"; }
  function pal(el) {
    var cs = getComputedStyle(el || document.documentElement), g = function (n) { return hex(cs.getPropertyValue("--" + n)); };
    return { abyss: g("abyss"), abyss2: g("abyss-2"), cobalt: g("cobalt"), cobalt2: g("cobalt-2"), mist: g("mist"), lagoon: g("lagoon"), foam: g("foam"), deep: g("deep"), ground: g("ground"), vein: g("hero-vein"), paper: g("paper") };
  }

  /* ---------- styles de champ (aplats) ---------- */
  var KINDS = {
    faune: { gap: 1.5, r: 0, bg: function (p) { return p.mist; }, fill: function (s, p) { return s.n < .7 ? p.cobalt : p.cobalt2; } },
    flore: { gap: 10, r: 26, bg: function (p) { return p.ground; }, fill: function (s, p) { var f = [p.lagoon, p.deep, p.foam, p.lagoon, p.abyss]; return f[Math.floor(s.n * f.length) % f.length]; } },
    branche: { gap: 18, r: 40, bg: function (p) { return p.lagoon; }, fill: function (s, p) { return p.abyss; } },
    reseau: { gap: 2, r: 12, bg: function (p) { return p.vein; }, fill: function (s, p) { return s.n < .8 ? p.abyss : p.abyss2; } }
  };

  function makeSeeds(o, w, h) {
    var list;
    if (o.seeds) list = o.seeds(w, h);
    else {
      var r = rng(hash(o.seed || "banbiom")), n = o.cells || Math.max(3, Math.round(w * h / 5200 * (o.density || 1)));
      list = Array.from({ length: Math.min(160, n) }, function () { return { x: r() * w, y: r() * h, n: r() }; });
    }
    if (o.focus) { /* cellule dominante : graine fixée + poids */
      list.push({ x: o.focus.x * w, y: o.focus.y * h, n: .5, w: Math.pow(o.focus.size * Math.min(w, h), 2), pinned: true, focus: true });
    }
    var r2 = rng(hash((o.seed || "b") + "m"));
    return list.map(function (s) { return { hx: s.x, hy: s.y, x: s.x, y: s.y, vx: 0, vy: 0, n: s.n != null ? s.n : .5, w: s.w || 0, pinned: !!s.pinned, focus: !!s.focus, a: r2() * 6.283, s: .08 + r2() * .14, g: 0 }; });
  }

  function field(cv, opts) {
    var o = Object.assign({ kind: "faune", seed: "x", live: false, interactive: false }, opts || {});
    var K = KINDS[o.kind], st = { pts: null, mouse: null, raf: 0, last: 0, t0: performance.now(), energy: 0, vis: true };
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var R = o.radius != null ? o.radius : K.r, GAP = o.gap != null ? o.gap : K.gap;
    function setup() {
      var w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
      var dpr = Math.min(2, window.devicePixelRatio || 1); st.w = w; st.h = h; st.dpr = dpr; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      st.pts = makeSeeds(o, w, h); render(); kick();
    }
    function render() {
      if (!st.pts) return;
      var p = pal(cv), c = cv.getContext("2d"), w = st.w, h = st.h;
      c.setTransform(st.dpr, 0, 0, st.dpr, 0, 0); c.clearRect(0, 0, w, h);
      c.fillStyle = rgb(K.bg(p)); c.fillRect(0, 0, w, h);
      var cs = cells(st.pts, w, h, function (s) { return GAP + s.g; });
      cs.forEach(function (poly, i) {
        var s = st.pts[i]; if (poly.length < 3) return;
        if (!traceCanvas(c, poly, R)) return;
        c.fillStyle = rgb(s.focus && o.focusColor ? p[o.focusColor] : K.fill(s, p)); c.fill();
      });
      if (o.nuclei) st.pts.forEach(function (s, i) { c.fillStyle = o.nucleusColor ? o.nucleusColor(s, i) : rgb(p.mist); c.beginPath(); c.arc(s.x, s.y, o.nucleusSize || 2, 0, 6.283); c.fill(); });
    }
    /* ressorts amortis, mouvement retenu : pas de croisement de graines, pas de saut */
    function step(now) {
      var t = (now - st.t0) / 1000, amp = o.live && !reduce ? Math.min(st.w, st.h) * .025 : 0, reach = Math.max(90, Math.min(st.w, st.h) * .4), e = 0;
      st.pts.forEach(function (p) {
        var tg = 0;
        if (!p.pinned) {
          var tx = p.hx + Math.sin(t * p.s + p.a) * amp, ty = p.hy + Math.cos(t * p.s * .8 + p.n * 9) * amp * .8, ax = (tx - p.x) * .03, ay = (ty - p.y) * .03;
          if (st.mouse) { var dx = p.x - st.mouse.x, dy = p.y - st.mouse.y, d = Math.hypot(dx, dy) || 1; if (d < reach) { var f = Math.pow(1 - d / reach, 2) * 2.4; ax += dx / d * f; ay += dy / d * f; tg = (o.open != null ? o.open : 10) * Math.pow(1 - d / reach, 2); } }
          p.vx = (p.vx + ax) * .8; p.vy = (p.vy + ay) * .8; p.x += p.vx; p.y += p.vy; e += Math.abs(p.vx) + Math.abs(p.vy);
        }
        p.g += (tg - p.g) * .12; e += Math.abs(tg - p.g) * .2;
      });
      st.energy = e / st.pts.length;
    }
    function kick() {
      if (st.raf || !st.pts) return;
      var loop = function (now) {
        var active = (o.live && st.vis && !reduce) || st.mouse || st.energy > .01;
        if (!active || !cv.isConnected) { st.raf = 0; render(); return; }
        if (now - st.last > 16) { step(now); render(); st.last = now; }
        st.raf = requestAnimationFrame(loop);
      };
      st.raf = requestAnimationFrame(loop);
    }
    new ResizeObserver(setup).observe(cv);
    new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    if (o.live && "IntersectionObserver" in window) new IntersectionObserver(function (es) { st.vis = es[0].isIntersecting; kick(); }).observe(cv);
    if (o.interactive && !reduce) {
      var host = o.host || cv.parentElement;
      host.addEventListener("pointermove", function (e) { if (e.pointerType === "touch") return; var b = cv.getBoundingClientRect(); st.mouse = { x: e.clientX - b.left, y: e.clientY - b.top }; kick(); });
      host.addEventListener("pointerleave", function () { st.mouse = null; kick(); });
    }
    return { redraw: render, setup: setup };
  }

  /* ---------- divisions d'un cadre ----------
     n = 2 ou 3 : coupes droites parallèles, inclinées de `angle` degrés ; `sizes` = proportions.
     n ≥ 4 : diagramme de puissance ; `focus` {x, y, size} réserve une cellule dominante (espace typographique).
     Rend des <path> dans le <svg> et renvoie les cellules avec leur zone de texte. */
  function division(svg, opts) {
    var o = Object.assign({ n: 2, gap: 10, radius: 18, angle: 12, colors: ["var(--abyss)", "var(--cobalt)", "var(--lagoon)"], seed: "division", aspect: 1.6 }, opts || {});
    var vb = svg.viewBox.baseVal, w = vb && vb.width ? vb.width : svg.clientWidth, h = vb && vb.height ? vb.height : svg.clientHeight;
    var polys = [], focusIndex = -1;
    if (o.n <= 3) {
      var th = o.angle * Math.PI / 180, ux = Math.cos(th), uy = Math.sin(th), cx = w / 2, cy = h / 2;
      var proj = function (v) { return (v[0] - cx) * ux + (v[1] - cy) * uy; };
      var F = frame(w, h, 0), lo = Math.min.apply(null, F.map(proj)), hi = Math.max.apply(null, F.map(proj));
      var sizes = o.sizes || Array.from({ length: o.n }, function () { return 1; }), tot = sizes.reduce(function (a, b) { return a + b; }, 0), acc = 0;
      var cuts = sizes.map(function (s) { acc += s; return lo + (hi - lo) * acc / tot; });
      for (var i = 0; i < o.n; i++) {
        var a = i ? cuts[i - 1] + o.gap / 2 : -1e9, b = i < o.n - 1 ? cuts[i] - o.gap / 2 : 1e9, poly = F;
        poly = cutBy(poly, function (v) { return a - proj(v); });
        poly = cutBy(poly, function (v) { return proj(v) - b; });
        polys.push(poly);
      }
      if (o.focusCell != null) focusIndex = o.focusCell; else { var mx = Math.max.apply(null, sizes); focusIndex = sizes.indexOf(mx); }
    } else {
      var r = rng(hash(o.seed)), pts = [];
      var fx = o.focus ? o.focus.x * w : -1, fy = o.focus ? o.focus.y * h : -1, fr = o.focus ? o.focus.size * Math.min(w, h) : 0;
      var tries = 0;
      while (pts.length < o.n - (o.focus ? 1 : 0) && tries++ < 2000) {
        var x = r() * w, y = r() * h;
        if (o.focus && Math.hypot(x - fx, y - fy) < fr * 1.15) continue;
        pts.push({ x: x, y: y, w: 0 });
      }
      if (o.focus) { pts.unshift({ x: fx, y: fy, w: fr * fr * 0.9 }); focusIndex = 0; }
      polys = cells(pts, w, h, function () { return o.gap; }, 0);
    }
    var ns = "http://www.w3.org/2000/svg", out = [];
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    polys.forEach(function (poly, i) {
      var d = traceSVG(poly, o.radius); if (!d) return;
      var el = document.createElementNS(ns, "path"); el.setAttribute("d", d);
      var col = i === focusIndex && o.focusColor ? o.focusColor : o.colors[i % o.colors.length];
      el.setAttribute("fill", col); el.setAttribute("data-cell", i); if (i === focusIndex) el.setAttribute("data-focus", "");
      svg.appendChild(el);
      out.push({ index: i, focus: i === focusIndex, text: innerRect(poly, o.aspect) });
    });
    return out;
  }

  /* une cellule seule (nano) */
  function cellPath(seed, w, h, opts) {
    opts = opts || {}; var r = rng(hash(seed)), cx = w / 2, cy = h / 2, k = opts.sides || 6, pts = [{ x: cx, y: cy }];
    for (var i = 0; i < k; i++) { var a = i / k * 6.283 + (r() - .5) * .8, d = 1.0 + r() * .45; pts.push({ x: cx + Math.cos(a) * w * d, y: cy + Math.sin(a) * h * d }); }
    var poly = cells(pts, w, h, function () { return 0; }, -(opts.inset || 0))[0];
    return traceSVG(poly, opts.radius || 0);
  }

  /* graines placées par les données : x = température, y = profondeur, nombre = taille */
  function seedsFromSpecies(sp) {
    return function (w, h) {
      var r = rng(hash(sp.nom_scientifique || "x")), tmin = sp.temperature_min || 10, tmax = sp.temperature_max || 25, dmin = sp.profondeur_min || 0, dmax = sp.profondeur_max || 50;
      var count = Math.max(5, Math.min(22, Math.round(Math.log2((sp.taille_max_cm || 20) + 2) * 2.6)));
      var x0 = (tmin - 5) / 30 * w, x1 = (tmax - 5) / 30 * w, y0 = Math.sqrt(dmin / 1000) * h, y1 = Math.sqrt(Math.max(dmax, dmin + 1) / 1000) * h, out = [];
      for (var i = 0; i < count; i++) { var band = i < count * .65; out.push({ x: band ? x0 + r() * Math.max(14, x1 - x0) : r() * w, y: band ? y0 + r() * Math.max(14, y1 - y0) : r() * h, n: r() }); }
      return out;
    };
  }

  window.Banbiom = { field: field, division: division, cellPath: cellPath, seedsFromSpecies: seedsFromSpecies, kinds: Object.keys(KINDS), _cells: cells, _traceSVG: traceSVG, _rounded: rounded, _arcs: arcs, _innerRect: innerRect, _hash: hash, _rng: rng };
})();
