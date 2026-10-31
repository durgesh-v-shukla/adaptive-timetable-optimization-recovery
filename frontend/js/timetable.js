/* ================================================================
   timetable.js — Timetable Grid Renderer
   ================================================================ */

(function () {
  'use strict';

  // Day order & set
  var DAY_ORDER = ['Mon','Tue','Wed','Thu','Fri'];

  window.renderTimetable = function renderTimetable() {
    var grid   = document.getElementById('timetable-grid');
    var legend = document.getElementById('timetable-legend');
    var APP    = window.APP;

    if (!APP || !APP.data) {
      if (grid) grid.innerHTML = emptyState('No timetable data loaded.');
      return;
    }

    var data     = APP.data;
    var classes  = data.classes  || [];
    var slots    = data.slots    || [];
    var rooms    = data.rooms    || [];
    var teachers = data.teachers || [];

    // ── Build time-period and day sets ────────────────────────────
    var timePeriods = [];
    var timeSeen    = {};
    var days        = [];
    var daySeen     = {};

    slots.forEach(function (s) {
      if (!timeSeen[s.time]) { timeSeen[s.time] = true; timePeriods.push(s.time); }
      if (!daySeen[s.day])   { daySeen[s.day]   = true; days.push(s.day); }
    });

    // Sort days by canonical order
    days.sort(function (a, b) {
      var ia = DAY_ORDER.indexOf(a);
      var ib = DAY_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    // Sort times chronologically
    timePeriods.sort(function (a, b) {
      return a.localeCompare(b);
    });

    // ── Build lookup: slotId → {day, time} ───────────────────────
    var slotMap = {};
    slots.forEach(function (s) { slotMap[s.id] = s; });

    // ── Build cell map: "day|time" → [classObjs] ─────────────────
    var cellMap = {};
    classes.forEach(function (cls) {
      var s = slotMap[cls.assignedSlot];
      if (!s) return;
      var key = s.day + '|' + s.time;
      if (!cellMap[key]) cellMap[key] = [];
      cellMap[key].push(cls);
    });

    // ── Grid template columns ─────────────────────────────────────
    var colCount = 1 + days.length;
    var colDef   = '80px ' + days.map(function(){ return '1fr'; }).join(' ');

    // ── Render Legend ─────────────────────────────────────────────
    if (legend) {
      legend.innerHTML =
        legendItem('lc-regular', 'Regular Class') +
        legendItem('lc-lab',     'Lab Session') +
        (APP.changedIds.size > 0 ? legendItem('lc-changed', 'Recovered/Changed') : '') +
        legendItem('lc-fragile',  'Fragile (≤3 alternatives)') +
        legendItem('lc-hfragile', 'Highly Fragile (≤1 alternative)');
    }

    // ── Build grid HTML ───────────────────────────────────────────
    var html = '';
    grid.style.gridTemplateColumns = colDef;

    // Header row: blank corner + day headers
    html += '<div class="tt-header-cell" style="position:sticky;left:0;z-index:3;"></div>';
    days.forEach(function (d) {
      html += '<div class="tt-header-cell">' + d + '</div>';
    });

    // Data rows: one row per time period
    timePeriods.forEach(function (time) {
      // Time label
      html += '<div class="tt-time-cell">' + time + '</div>';

      days.forEach(function (day) {
        var key  = day + '|' + time;
        var list = cellMap[key] || [];
        html += '<div class="tt-cell">';

        if (list.length > 0) {
          html += '<div class="tt-chips">';
          list.forEach(function (cls) {
            html += buildChip(cls, rooms, teachers, APP.changedIds);
          });
          html += '</div>';
        }

        html += '</div>';
      });
    });

    grid.innerHTML = html;

    // ── Attach tooltip events ─────────────────────────────────────
    grid.querySelectorAll('.chip').forEach(function (chip) {
      var cid = parseInt(chip.dataset.cid, 10);
      chip.addEventListener('mouseenter', function (e) {
        window.showTooltip && window.showTooltip(e, cid);
      });
      chip.addEventListener('mouseleave', function () {
        window.hideTooltip && window.hideTooltip();
      });
    });
  };

  // ── Chip builder ─────────────────────────────────────────────────
  function buildChip(cls, rooms, teachers, changedIds) {
    var room    = rooms[cls.assignedRoom]   || { name: '?' };
    var teacher = teachers[cls.teacherId]  || { name: '?' };
    var changed = changedIds.has(cls.id);

    var typeClass = changed ? 'chip-changed'
                 : cls.needsLab ? 'chip-lab'
                 : 'chip-regular';

    var fragClass = '';
    if (cls.fragility <= 1)      fragClass = ' chip-highly-fragile';
    else if (cls.fragility <= 3) fragClass = ' chip-fragile';

    var colorStyle = '';
    if (!changed && window.SLOT_COLORS) {
      var c = window.SLOT_COLORS[cls.color % window.SLOT_COLORS.length];
      colorStyle = ' style="border-color:' + c + '22;box-shadow:0 0 0 1px ' + c + '55"';
    }

    return '<div class="chip ' + typeClass + fragClass + '"' +
           colorStyle +
           ' data-cid="' + cls.id + '"' +
           ' title="' + window._esc(cls.subject + ' / ' + cls.group) + '">' +
             '<span class="chip-dot"></span>' +
             '<span>' + window._esc(cls.subject) + '</span>' +
             '<span style="opacity:.7;font-size:.65rem">/' + window._esc(cls.group) + '</span>' +
             (changed ? '<span style="margin-left:auto;font-size:.7rem">⚡</span>' : '') +
           '</div>';
  }

  function legendItem(cls, label) {
    return '<div class="legend-item">' +
             '<div class="legend-chip ' + cls + '"></div>' +
             '<span>' + label + '</span>' +
           '</div>';
  }

  function emptyState(msg) {
    return '<div class="empty-state" style="grid-column:1/-1">' +
             '<div class="empty-state-icon">📭</div>' +
             '<div class="empty-state-msg">' + msg + '</div>' +
           '</div>';
  }

}());
