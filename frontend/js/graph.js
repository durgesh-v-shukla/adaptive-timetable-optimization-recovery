/* ================================================================
   graph.js — Conflict Graph Canvas Renderer (Welsh-Powell Coloring)
   ================================================================ */

(function () {
  'use strict';

  var _canvas, _ctx, _nodes = [], _edges = [], _hoveredNode = null;
  var _animFrame = null;

  // Slot color palette
  var PALETTE = [
    '#3b82f6','#10b981','#f59e0b','#ef4444',
    '#8b5cf6','#06b6d4','#f97316','#ec4899',
    '#84cc16','#14b8a6','#e879f9','#fb923c'
  ];

  window.renderConflictGraph = function renderConflictGraph() {
    var APP = window.APP;
    _canvas = document.getElementById('graphCanvas');
    if (!_canvas) return;
    _ctx = _canvas.getContext('2d');

    if (!APP || !APP.data) {
      drawEmpty();
      return;
    }

    var data    = APP.data;
    var classes = data.classes  || [];
    var slots   = data.slots    || [];

    // ── Size canvas ───────────────────────────────────────────────
    var container = _canvas.parentElement;
    var W = container ? Math.min(container.clientWidth - 200, 860) : 640;
    var H = Math.max(460, Math.min(W * 0.65, 580));
    _canvas.width  = W;
    _canvas.height = H;

    // ── Build adjacency list (conflict = same teacher OR same room OR same group+slot) ──
    var n = classes.length;
    var adj = Array.from({length: n}, function(){ return []; });

    for (var i = 0; i < n; i++) {
      for (var j = i + 1; j < n; j++) {
        var ci = classes[i], cj = classes[j];
        var conflict =
          ci.assignedSlot === cj.assignedSlot && (
            ci.teacherId   === cj.teacherId  ||
            ci.assignedRoom === cj.assignedRoom ||
            ci.group       === cj.group
          );
        if (conflict) {
          adj[i].push(j);
          adj[j].push(i);
        }
      }
    }

    // ── Build edges list ──────────────────────────────────────────
    _edges = [];
    for (var ii = 0; ii < n; ii++) {
      adj[ii].forEach(function (jj) {
        if (jj > ii) _edges.push({ a: ii, b: jj });
      });
    }

    // ── Sort nodes by degree (Welsh-Powell) ───────────────────────
    var degrees = adj.map(function(a){ return a.length; });
    var order   = classes.map(function(_, i){ return i; });
    order.sort(function(a, b){ return degrees[b] - degrees[a]; });

    // ── Layout nodes in ellipse ───────────────────────────────────
    var cx = W / 2, cy = H / 2;
    var rx = W * 0.37, ry = H * 0.36;
    _nodes = classes.map(function (cls, i) {
      var rank  = order.indexOf(i);
      var angle = (2 * Math.PI * rank / n) - Math.PI / 2;
      var color = PALETTE[cls.color % PALETTE.length];
      var slot  = slots[cls.assignedSlot] || { label: '?' };
      return {
        x:      cx + rx * Math.cos(angle),
        y:      cy + ry * Math.sin(angle),
        r:      Math.max(18, Math.min(28, 400 / n)),
        color:  color,
        label:  cls.subject.substring(0,4) + '/' + cls.group,
        cls:    cls,
        slot:   slot,
        degree: degrees[i],
        adj:    adj[i]
      };
    });

    // ── Initial draw ──────────────────────────────────────────────
    draw();

    // ── Render legend ─────────────────────────────────────────────
    renderGraphLegend(data);

    // ── Hover interaction ─────────────────────────────────────────
    _canvas.onmousemove = function(e) {
      var rect = _canvas.getBoundingClientRect();
      var mx   = (e.clientX - rect.left) * (_canvas.width  / rect.width);
      var my   = (e.clientY - rect.top)  * (_canvas.height / rect.height);
      var hit  = null;
      _nodes.forEach(function(nd, i) {
        var dx = mx - nd.x, dy = my - nd.y;
        if (Math.sqrt(dx*dx + dy*dy) <= nd.r) hit = i;
      });
      if (hit !== _hoveredNode) {
        _hoveredNode = hit;
        draw();
      }

      if (hit !== null) {
        window.showTooltip && window.showTooltip(e, classes[hit].id);
      } else {
        window.hideTooltip && window.hideTooltip();
      }
    };
    _canvas.onmouseleave = function() {
      _hoveredNode = null;
      draw();
      window.hideTooltip && window.hideTooltip();
    };
  };

  function draw() {
    if (!_ctx || !_canvas) return;
    var W = _canvas.width, H = _canvas.height;
    _ctx.clearRect(0, 0, W, H);

    // Background
    _ctx.fillStyle = '#1a2035';
    _ctx.fillRect(0, 0, W, H);

    // Draw edges
    _edges.forEach(function(e) {
      var na = _nodes[e.a], nb = _nodes[e.b];
      var isAdj = _hoveredNode !== null && (e.a === _hoveredNode || e.b === _hoveredNode);
      var isHov = _hoveredNode !== null;

      _ctx.beginPath();
      _ctx.moveTo(na.x, na.y);
      _ctx.lineTo(nb.x, nb.y);

      if (!isHov) {
        _ctx.strokeStyle = 'rgba(96,165,250,.15)';
        _ctx.lineWidth   = 1;
      } else if (isAdj) {
        _ctx.strokeStyle = 'rgba(248,113,113,.85)';
        _ctx.lineWidth   = 2;
      } else {
        _ctx.strokeStyle = 'rgba(96,165,250,.05)';
        _ctx.lineWidth   = 0.5;
      }
      _ctx.stroke();
    });

    // Draw nodes
    _nodes.forEach(function(nd, i) {
      var isHovered  = i === _hoveredNode;
      var isNeighbor = _hoveredNode !== null && nd.adj.indexOf(_hoveredNode) !== -1;
      var isDimmed   = _hoveredNode !== null && !isHovered && !isNeighbor;
      var alpha      = isDimmed ? 0.3 : 1;

      _ctx.globalAlpha = alpha;

      // Outer glow for hovered
      if (isHovered) {
        _ctx.beginPath();
        _ctx.arc(nd.x, nd.y, nd.r + 8, 0, Math.PI * 2);
        _ctx.fillStyle = nd.color + '33';
        _ctx.fill();
      }

      // Node circle
      _ctx.beginPath();
      _ctx.arc(nd.x, nd.y, nd.r, 0, Math.PI * 2);
      _ctx.fillStyle = nd.color + (isDimmed ? '55' : 'cc');
      _ctx.fill();
      _ctx.strokeStyle = isHovered ? '#fff' : isNeighbor ? '#f87171' : nd.color;
      _ctx.lineWidth   = isHovered ? 2.5 : 1.5;
      _ctx.stroke();

      // Degree badge for top-3 nodes
      if (nd.degree > 0 && (isHovered || isNeighbor)) {
        _ctx.beginPath();
        _ctx.arc(nd.x + nd.r - 4, nd.y - nd.r + 4, 7, 0, Math.PI * 2);
        _ctx.fillStyle = '#ef4444';
        _ctx.fill();
        _ctx.fillStyle = '#fff';
        _ctx.font = 'bold 7px sans-serif';
        _ctx.textAlign = 'center';
        _ctx.textBaseline = 'middle';
        _ctx.fillText(nd.degree, nd.x + nd.r - 4, nd.y - nd.r + 4);
      }

      // Label
      _ctx.fillStyle = isDimmed ? '#888' : '#fff';
      _ctx.font      = (isHovered ? 'bold ' : '') + Math.max(9, nd.r * 0.5) + 'px "Segoe UI",sans-serif';
      _ctx.textAlign    = 'center';
      _ctx.textBaseline = 'middle';
      _ctx.fillText(nd.label, nd.x, nd.y);

      _ctx.globalAlpha = 1;
    });

    // Center info if hovering
    if (_hoveredNode !== null) {
      var nd = _nodes[_hoveredNode];
      _ctx.fillStyle = 'rgba(15,17,23,.8)';
      _ctx.beginPath();
      _ctx.roundRect(W/2 - 100, H - 46, 200, 34, 8);
      _ctx.fill();
      _ctx.fillStyle = '#94a3b8';
      _ctx.font = '11px "Segoe UI",sans-serif';
      _ctx.textAlign = 'center';
      _ctx.textBaseline = 'middle';
      _ctx.fillText(nd.cls.subject + ' · Group ' + nd.cls.group + ' · ' + nd.degree + ' conflict(s)', W/2, H - 29);
    }
  }

  function drawEmpty() {
    var W = _canvas.width  || 400;
    var H = _canvas.height || 300;
    _canvas.width = W; _canvas.height = H;
    _ctx.fillStyle = '#1a2035';
    _ctx.fillRect(0,0,W,H);
    _ctx.fillStyle = '#64748b';
    _ctx.font = '14px "Segoe UI",sans-serif';
    _ctx.textAlign = 'center';
    _ctx.textBaseline = 'middle';
    _ctx.fillText('No data — load timetable.json', W/2, H/2);
  }

  function renderGraphLegend(data) {
    var legendEl = document.getElementById('graph-legend');
    if (!legendEl) return;

    var usedColors = {};
    (data.classes || []).forEach(function(cls) {
      var c = PALETTE[cls.color % PALETTE.length];
      if (!usedColors[c]) usedColors[c] = 'Color #' + cls.color;
    });

    var html = '<h4>Slot Colors</h4>';
    Object.keys(usedColors).slice(0, 10).forEach(function(c) {
      html += '<div class="graph-legend-item">' +
                '<div class="legend-color-dot" style="background:' + c + '"></div>' +
                '<span>' + usedColors[c] + '</span>' +
              '</div>';
    });
    html += '<hr style="border-color:var(--border);margin:10px 0">';
    html += '<div style="font-size:.7rem;color:var(--text-muted);line-height:1.5">' +
              '<strong style="color:var(--text-secondary)">Edge</strong> = conflict<br>' +
              '<strong style="color:var(--red)">Red edge</strong> = hovered conflicts<br>' +
              '<strong style="color:var(--text-secondary)">Sorted</strong> by degree (Welsh-Powell)' +
            '</div>';

    legendEl.innerHTML = html;
  }

}());
