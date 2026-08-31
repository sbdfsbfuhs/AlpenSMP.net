/* Chart hover: Maus/Finger auf der Linie zeigt genaue Spielerzahl */
(function () {
  if (window.__alpenChartHover) return;
  window.__alpenChartHover = true;

  function ensureUi() {
    var canvas = document.getElementById('hoursChart');
    if (!canvas) return null;
    var wrap = document.getElementById('chartWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'chartWrap';
      wrap.className = 'chart-wrap';
      wrap.style.position = 'relative';
      wrap.style.maxWidth = '720px';
      wrap.style.margin = '0 auto';
      canvas.parentNode.insertBefore(wrap, canvas);
      wrap.appendChild(canvas);
    }
    var tip = document.getElementById('chartTip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'chartTip';
      tip.setAttribute('role', 'tooltip');
      wrap.appendChild(tip);
    }
    if (!document.getElementById('chartHoverCss')) {
      var s = document.createElement('style');
      s.id = 'chartHoverCss';
      s.textContent =
        '#hoursChart{cursor:crosshair;touch-action:none}' +
        '#chartTip{position:absolute;display:none;pointer-events:none;z-index:5;transform:translate(-50%,-120%);' +
        'background:rgba(10,12,18,.94);border:1px solid rgba(199,62,62,.45);box-shadow:0 10px 28px rgba(0,0,0,.45);' +
        'color:#fff;border-radius:12px;padding:8px 12px;font-size:.86rem;line-height:1.35;white-space:nowrap;text-align:center}' +
        '#chartTip strong{color:#f87171;font-size:1.05rem}' +
        '#chartTip small{display:block;color:#9aa3b2;font-size:.75rem}';
      document.head.appendChild(s);
    }
    var msg = document.getElementById('chartMsg');
    if (msg && !document.getElementById('chartHoverHint')) {
      var hint = document.createElement('p');
      hint.id = 'chartHoverHint';
      hint.style.cssText = 'color:var(--muted,#6b7280);font-size:.8rem;margin:0 0 8px';
      hint.textContent = 'Maus oder Finger auf die Linie \u2013 zeigt die genaue Spielerzahl.';
      msg.parentNode.insertBefore(hint, msg.nextSibling);
    }
    return { canvas: canvas, tip: tip, wrap: wrap };
  }

  var pts = [];
  var geom = null;
  var hover = null;
  var bound = false;

  function formatTime(t) {
    return new Date(t).toLocaleString('de-DE', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  }

  function pick(xPx) {
    if (!pts.length || !geom) return null;
    var padL = geom.padL, plotW = geom.plotW, tStart = geom.tStart, win = geom.win;
    var x = Math.max(padL, Math.min(xPx, padL + plotW));
    var t = tStart + ((x - padL) / plotW) * win;
    var i = 0;
    while (i < pts.length && pts[i].t < t) i++;
    var n, tShown;
    if (i <= 0) { n = pts[0].n; tShown = pts[0].t; }
    else if (i >= pts.length) { n = pts[pts.length - 1].n; tShown = pts[pts.length - 1].t; }
    else {
      var a = pts[i - 1], b = pts[i];
      var f = (t - a.t) / Math.max(1, b.t - a.t);
      n = a.n + (b.n - a.n) * f;
      tShown = t;
    }
    return { t: tShown, n: n };
  }

  function paint() {
    var ui = ensureUi();
    if (!ui || !geom || pts.length < 2) return;
    var canvas = ui.canvas, tip = ui.tip;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var w = geom.w, h = geom.h, padL = geom.padL, padR = geom.padR, padT = geom.padT, padB = geom.padB;
    var plotW = geom.plotW, plotH = geom.plotH, yMax = geom.yMax, tStart = geom.tStart, win = geom.win;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    function xOf(t) { return padL + ((t - tStart) / win) * plotW; }
    function yOf(v) { return padT + plotH - (v / yMax) * plotH; }

    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    var ySteps = Math.min(Math.max(yMax, 1), 5);
    for (var i = 0; i <= ySteps; i++) {
      var v = Math.round((yMax / ySteps) * i);
      var y = yOf(v);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(String(v), padL - 10, y + 4);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = '#9aa3b2';
    ctx.fillText('Spieler', 8, 14);

    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center';
    var range = (typeof chartRange === 'string') ? chartRange : '24h';
    for (var p = 0; p <= 4; p++) {
      var frac = p / 4;
      var x = padL + frac * plotW;
      var tt = tStart + frac * win;
      var lab = (range === '24h' || range === '1h')
        ? new Date(tt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
        : new Date(tt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      ctx.fillText(lab, x, h - 12);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();
    }
    ctx.textAlign = 'right';
    ctx.fillStyle = '#9aa3b2';
    ctx.fillText(range, w - padR, 14);

    var grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
    grad.addColorStop(0, 'rgba(224,92,92,0.4)');
    grad.addColorStop(1, 'rgba(224,92,92,0.02)');
    ctx.beginPath();
    pts.forEach(function (a, idx) {
      var xx = xOf(a.t), yy = yOf(a.n);
      idx ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
    });
    ctx.lineTo(xOf(pts[pts.length - 1].t), padT + plotH);
    ctx.lineTo(xOf(pts[0].t), padT + plotH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = '#e05c5c';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    pts.forEach(function (a, idx) {
      var xx = xOf(a.t), yy = yOf(a.n);
      idx ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
    });
    ctx.stroke();

    var last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(xOf(last.t), yOf(last.n), 5, 0, Math.PI * 2);
    ctx.fillStyle = '#f87171';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (hover) {
      var hx = xOf(hover.t);
      var hy = yOf(hover.n);
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(248,113,113,.7)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(hx, padT); ctx.lineTo(hx, padT + plotH); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(hx, hy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#e05c5c';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      var count = Math.round(hover.n);
      tip.innerHTML = '<strong>' + count + ' Spieler online</strong><small>' + formatTime(hover.t) + '</small>';
      tip.style.display = 'block';
      var cw = ui.wrap.clientWidth || w;
      tip.style.left = Math.max(54, Math.min(hx, cw - 54)) + 'px';
      tip.style.top = Math.max(18, hy) + 'px';
    } else {
      tip.style.display = 'none';
    }
  }

  function bind() {
    if (bound) return;
    var ui = ensureUi();
    if (!ui) return;
    bound = true;
    var canvas = ui.canvas;
    function eventX(e) {
      var r = canvas.getBoundingClientRect();
      var src = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
      return src.clientX - r.left;
    }
    function apply(e) {
      var hit = pick(eventX(e));
      if (!hit) return;
      hover = hit;
      paint();
    }
    canvas.addEventListener('mousemove', apply);
    canvas.addEventListener('mouseleave', function () { hover = null; paint(); });
    canvas.addEventListener('click', apply);
    canvas.addEventListener('touchstart', apply, { passive: true });
    canvas.addEventListener('touchmove', apply, { passive: true });
  }

  var origDraw = window.drawChart;
  window.drawChart = function (arr) {
    try {
      var ui = ensureUi();
      var msg = document.getElementById('chartMsg');
      var canvas = document.getElementById('hoursChart');
      if (!msg || !canvas) {
        if (typeof origDraw === 'function') return origDraw(arr);
        return;
      }
      var now = Date.now();
      var ms = (typeof CHART_MS === 'object' && CHART_MS) ? CHART_MS : { '1h': 36e5, '24h': 864e5, '7d': 7 * 864e5, '30d': 30 * 864e5 };
      var range = (typeof chartRange === 'string') ? chartRange : '24h';
      var win = ms[range] || ms['24h'];
      var cutoff = now - win;
      arr = (arr || []).filter(function (x) { return x.t >= cutoff; }).sort(function (a, b) { return a.t - b.t; });
      if (typeof updateKpiFromHistory === 'function' && typeof lsGetJSON === 'function') {
        try { updateKpiFromHistory(lsGetJSON('alpensmp_server_history', []).concat(window._remoteHistory || [])); } catch (e) {}
      }
      if (arr.length < 2) {
        msg.style.display = 'block';
        msg.textContent = '\ud83d\udcc8 Noch zu wenig Punkte f\u00fcr ' + range + ' \u2013 Seite kurz offen lassen.';
        canvas.style.display = 'none';
        var tip = document.getElementById('chartTip');
        if (tip) tip.style.display = 'none';
        pts = []; geom = null;
        return;
      }
      msg.style.display = 'none';
      canvas.style.display = 'block';
      var w = canvas.clientWidth || 640, h = 240;
      var padL = 52, padR = 20, padT = 28, padB = 44;
      var plotW = w - padL - padR;
      var plotH = h - padT - padB;
      var vals = arr.map(function (a) { return a.n; });
      var yMax = Math.max(Math.ceil(Math.max.apply(null, vals.concat([1]))), 1);
      pts = arr;
      geom = { w: w, h: h, padL: padL, padR: padR, padT: padT, padB: padB, plotW: plotW, plotH: plotH, yMax: yMax, tStart: cutoff, win: win };
      bind();
      paint();
    } catch (e) {
      if (typeof origDraw === 'function') origDraw(arr);
    }
  };

  function redraw() {
    var local = [];
    try {
      if (typeof lsGetJSON === 'function') local = lsGetJSON('alpensmp_server_history', []) || [];
    } catch (e) {}
    var remote = window._remoteHistory || [];
    if (typeof window.drawChart === 'function') window.drawChart(remote.concat(local));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(redraw, 50); });
  } else {
    setTimeout(redraw, 50);
  }
})();
