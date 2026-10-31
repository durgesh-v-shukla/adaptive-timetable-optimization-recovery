/* ================================================================
   flow.js — Max-Flow / Bipartite Matching SVG Renderer
   ================================================================ */

(function () {
  'use strict';

  window.renderFlowNetwork = function renderFlowNetwork() {
    var APP = window.APP;
    var container = document.getElementById('flow-diagram');
    var complexityEl = document.getElementById('flow-complexity');
    if (!container) return;

    if (!APP || !APP.data) {
      container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-muted)">No data loaded.</p>';
      return;
    }

    var data    = APP.data;
    var classes = data.classes || [];
    var slots   = data.slots   || [];
    var rooms   = data.rooms   || [];

    // ── Determine affected and available nodes ─────────────────────
    var changedIds = APP.changedIds;
    var recovData  = APP.recoveryData;

    var affectedClasses = classes.filter(function(c){ return changedIds.has(c.id); });
    if (affectedClasses.length === 0) {
      // Show all if no disruption simulated
      affectedClasses = classes.slice(0, Math.min(6, classes.length));
    }
    var showAffected = affectedClasses.slice(0, 6);
    var moreAffected = affectedClasses.length > 6;

    // Build (slot,room) pair candidates
    var pairs = [];
    var usedSlots = new Set(classes.map(function(c){ return c.assignedSlot; }));
    var pairCount = 0;
    outerLoop:
    for (var ri = 0; ri < rooms.length && pairCount < 6; ri++) {
      if (!rooms[ri].available) continue;
      for (var si = 0; si < slots.length && pairCount < 6; si++) {
        pairs.push({ slot: slots[si], room: rooms[ri] });
        pairCount++;
      }
    }
    var showPairs = pairs.slice(0, 6);

    // ── SVG dimensions ────────────────────────────────────────────
    var W   = Math.min(container.clientWidth || 900, 920);
    var H   = Math.max(380, showAffected.length * 60 + 80);

    // Column x positions
    var xSrc   = 80;
    var xClass = 240;
    var xPair  = W - 240;
    var xSink  = W - 80;

    // Node y positions
    var classYs = distributeY(showAffected.length, H);
    var pairYs  = distributeY(showPairs.length,   H);

    // Source / Sink y
    var srcY  = H / 2;
    var sinkY = H / 2;

    // Determine matched pairs (use recovery changes, or greedy assignment)
    var matchedClassIds = new Set();
    var matchedPairIdxs = new Set();
    var edges = [];

    // Source → class edges
    showAffected.forEach(function(cls, ci) {
      edges.push({ x1: xSrc, y1: srcY, x2: xClass, y2: classYs[ci], type: 'source' });
    });

    // Class → pair edges (greedy matching)
    showAffected.forEach(function(cls, ci) {
      showPairs.forEach(function(pair, pi) {
        var isMatched = !matchedClassIds.has(ci) && !matchedPairIdxs.has(pi);
        if (isMatched) {
          matchedClassIds.add(ci);
          matchedPairIdxs.add(pi);
          edges.push({ x1: xClass, y1: classYs[ci], x2: xPair, y2: pairYs[pi], type: 'matched' });
        } else if (!matchedClassIds.has(ci)) {
          // Only push unmatched if we haven't yet matched this class
        }
      });
    });

    // Also add some unmatched class→pair edges for visual richness
    showAffected.forEach(function(cls, ci) {
      if (!matchedClassIds.has(ci)) {
        // push unmatched to first available pair
        edges.push({ x1: xClass, y1: classYs[ci], x2: xPair, y2: pairYs[0], type: 'unmatched' });
      }
    });

    // Pair → sink edges
    showPairs.forEach(function(pair, pi) {
      var type = matchedPairIdxs.has(pi) ? 'matched' : 'unmatched';
      edges.push({ x1: xPair, y1: pairYs[pi], x2: xSink, y2: sinkY, type: type });
    });

    // ── Build SVG ─────────────────────────────────────────────────
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" style="font-family:\'Segoe UI\',sans-serif">';

    // Defs: arrowheads
    svg += '<defs>' +
      arrow('arrowGreen', '#10b981') +
      arrow('arrowGrey',  '#4b5563') +
      arrow('arrowBlue',  '#60a5fa') +
    '</defs>';

    // Column labels
    svg += svgText(xSrc,   18, 'SOURCE',  '#60a5fa', 'bold 11px') +
           svgText(xClass, 18, 'CLASSES', '#a78bfa', 'bold 11px') +
           svgText(xPair,  18, 'SLOTS × ROOMS', '#34d399', 'bold 11px') +
           svgText(xSink,  18, 'SINK',    '#60a5fa', 'bold 11px');

    // Draw edges first (behind nodes)
    edges.forEach(function(e) {
      var col, markerId;
      if (e.type === 'matched') { col = '#10b981'; markerId = 'arrowGreen'; }
      else if (e.type === 'source') { col = '#60a5fa'; markerId = 'arrowBlue'; }
      else { col = '#374151'; markerId = 'arrowGrey'; }

      var dash  = e.type === 'unmatched' ? ' stroke-dasharray="5,3"' : '';
      var width = e.type === 'matched' ? '2.5' : '1.5';

      // Bezier curve
      var cx1 = e.x1 + (e.x2 - e.x1) * 0.5;
      var cx2 = cx1;
      svg += '<path d="M ' + e.x1 + ' ' + e.y1 +
             ' C ' + cx1 + ' ' + e.y1 + ', ' + cx2 + ' ' + e.y2 + ', ' + e.x2 + ' ' + e.y2 + '"' +
             ' stroke="' + col + '" stroke-width="' + width + '"' + dash +
             ' fill="none" marker-end="url(#' + markerId + ')"' +
             ' opacity="' + (e.type === 'unmatched' ? '0.4' : '0.9') + '"/>';

      // Capacity label midpoint
      var mx = (e.x1 + e.x2) / 2;
      var my = (e.y1 + e.y2) / 2 - 6;
      if (e.type !== 'unmatched') {
        svg += '<text x="' + mx + '" y="' + my + '" fill="' + col + '" font-size="10" text-anchor="middle" opacity="0.7">cap=1,f=' + (e.type === 'matched' ? 1 : 0) + '</text>';
      }
    });

    // Source node
    svg += nodeRect(xSrc - 30, srcY - 18, 60, 36, '#1e3a5f', '#60a5fa', 'SOURCE');

    // Class nodes
    showAffected.forEach(function(cls, ci) {
      var label = cls.subject.substring(0,5) + '/' + cls.group;
      var col   = matchedClassIds.has(ci) ? '#10b981' : '#8b5cf6';
      var bg    = matchedClassIds.has(ci) ? '#064e3b' : '#2d1b4e';
      svg += nodeRect(xClass - 42, classYs[ci] - 18, 84, 36, bg, col, label);
    });

    if (moreAffected) {
      svg += svgText(xClass, classYs[classYs.length-1] + 30, '... more', '#64748b', '11px');
    }

    // Pair nodes
    showPairs.forEach(function(pair, pi) {
      var label  = (pair.slot.time || '?') + '/' + (pair.room.name || '?').substring(0,7);
      var col    = matchedPairIdxs.has(pi) ? '#10b981' : '#374151';
      var bg     = matchedPairIdxs.has(pi) ? '#064e3b' : '#1a2035';
      svg += nodeRect(xPair - 52, pairYs[pi] - 18, 104, 36, bg, col, label);
    });

    // Sink node
    svg += nodeRect(xSink - 30, sinkY - 18, 60, 36, '#1e3a5f', '#60a5fa', 'SINK');

    // Flow summary
    var flowVal = matchedClassIds.size;
    svg += '<rect x="' + (W/2 - 110) + '" y="' + (H - 40) + '" width="220" height="26" rx="6" fill="#0d1525" stroke="#2d3f5c"/>';
    svg += '<text x="' + W/2 + '" y="' + (H - 22) + '" fill="#94a3b8" font-size="11" text-anchor="middle">' +
           'Max Flow = ' + flowVal + '  |  Matched: ' + flowVal + '/' + showAffected.length + ' classes' +
           '</text>';

    svg += '</svg>';
    container.innerHTML = svg;

    // Complexity note
    if (complexityEl) {
      var V = 2 + showAffected.length + showPairs.length;
      var E = edges.length;
      complexityEl.textContent =
        'Edmonds-Karp complexity: O(V · E²) where V = ' + V + ' nodes, E = ' + E + ' edges. ' +
        'Each BFS augmentation runs in O(E); at most O(V·E) augmentations.';
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────
  function distributeY(count, H) {
    if (count === 0) return [];
    var margin = 60;
    var spacing = (H - 2 * margin) / Math.max(count - 1, 1);
    return Array.from({length: count}, function(_, i) {
      return count === 1 ? H / 2 : margin + i * spacing;
    });
  }

  function arrow(id, color) {
    return '<marker id="' + id + '" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">' +
             '<path d="M0,0 L0,6 L8,3 z" fill="' + color + '"/>' +
           '</marker>';
  }

  function nodeRect(x, y, w, h, bg, stroke, label) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="7"' +
           ' fill="' + bg + '" stroke="' + stroke + '" stroke-width="1.5"/>' +
           '<text x="' + (x + w/2) + '" y="' + (y + h/2 + 4) + '"' +
           ' fill="#e2e8f0" font-size="10" font-weight="600" text-anchor="middle">' +
           escSVG(label) + '</text>';
  }

  function svgText(x, y, text, fill, font) {
    return '<text x="' + x + '" y="' + y + '" fill="' + fill + '"' +
           ' font-size="' + (font || '11px') + '" text-anchor="middle">' + escSVG(text) + '</text>';
  }

  function escSVG(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

}());
