// ─────────────────────────────────────────────────────────────
//  fragility.js  —  Fragility Analysis Tab Renderer
//  Uses CSS classes from style.css
// ─────────────────────────────────────────────────────────────

window.renderFragility = function () {
    var d = window.APP.data;
    if (!d) return;

    var classes  = d.classes;
    var teachers = d.teachers;
    var rooms    = d.rooms;
    var slots    = d.slots;

    // ── Count buckets ──────────────────────────────────────
    var stable   = classes.filter(function(c){ return c.fragility > 3; }).length;
    var fragile  = classes.filter(function(c){ return c.fragility > 1 && c.fragility <= 3; }).length;
    var hFragile = classes.filter(function(c){ return c.fragility <= 1; }).length;
    var maxFrag  = 1;
    classes.forEach(function(c){ if (c.fragility > maxFrag) maxFrag = c.fragility; });

    // ── Summary cards ──────────────────────────────────────
    var summaryEl = document.getElementById('fragility-summary');
    if (summaryEl) {
        summaryEl.innerHTML =
            '<div class="fragility-summary" style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">' +
              fSumCard(stable,   '#34d399', '✅', 'Stable',         'Plenty of alternatives') +
              fSumCard(fragile,  '#fbbf24', '⚠️', 'Fragile',        'Few alternatives (≤3)') +
              fSumCard(hFragile, '#f87171', '🔴', 'Highly Fragile', 'Critical — ≤1 alternative') +
            '</div>' +
            '<p style="font-size:.8rem;color:#64748b;margin-bottom:12px">' +
              'Sorted by ascending alternatives (highest risk first). ' +
              'Fragility = number of valid (slot, room) pairs available as alternatives.' +
            '</p>';
    }

    // ── Sort ascending fragility ───────────────────────────
    var sorted = classes.slice().sort(function(a, b){ return a.fragility - b.fragility; });

    // ── Table body ─────────────────────────────────────────
    var tbody = document.getElementById('fragility-tbody');
    if (!tbody) return;

    var rows = '';
    sorted.forEach(function(c, i) {
        var teacher = teachers[c.teacherId] ? teachers[c.teacherId].name : '—';
        var room    = rooms[c.assignedRoom]  ? rooms[c.assignedRoom].name  : '—';
        var slot    = slots[c.assignedSlot]  ? slots[c.assignedSlot].label : '—';
        var changed = window.APP.changedIds.has(c.id);

        var badgeCls = c.fragility <= 1 ? 'badge-highly-fragile' :
                       c.fragility <= 3 ? 'badge-fragile'         : 'badge-stable';
        var badgeTxt = c.fragility <= 1 ? '🔴 Highly Fragile' :
                       c.fragility <= 3 ? '⚠️ Fragile'        : '✅ Stable';

        // Risk bar: invert fragility (more alternatives = less risk)
        var riskPct = Math.max(0, 100 - Math.round((c.fragility / maxFrag) * 100));
        var fillColor = c.fragility <= 1 ? '#ef4444' :
                        c.fragility <= 3 ? '#f59e0b' : '#10b981';

        rows +=
            '<tr' + (changed ? ' style="background:#1c1010"' : '') + '>' +
              '<td style="text-align:center;color:#64748b">' + (i + 1) + '</td>' +
              '<td><strong>' + c.subject + '</strong>' +
                  (c.needsLab ? ' <span class="badge badge-stable" style="background:#064e3b;color:#6ee7b7;font-size:.68rem">LAB</span>' : '') +
              '</td>' +
              '<td><span class="badge badge-stable" style="font-size:.72rem">' + c.group + '</span></td>' +
              '<td style="color:#94a3b8;font-size:.82rem">' + teacher + '</td>' +
              '<td style="font-family:monospace;font-size:.8rem">' + slot + '</td>' +
              '<td style="font-family:monospace;font-size:.8rem">' + room + '</td>' +
              '<td style="text-align:center;font-weight:700;color:' + fillColor + '">' + c.fragility + '</td>' +
              '<td><span class="badge ' + badgeCls + '">' + badgeTxt + '</span></td>' +
              '<td style="min-width:120px">' +
                '<div class="risk-bar">' +
                  '<div class="risk-fill" style="width:' + riskPct + '%;background:' + fillColor + '"></div>' +
                '</div>' +
                '<span style="font-size:.68rem;color:#64748b">' + riskPct + '% risk</span>' +
              '</td>' +
            '</tr>';
    });
    tbody.innerHTML = rows;
};

function fSumCard(val, color, icon, label, sub) {
    return '<div class="frag-summary-card" style="flex:1;min-width:140px">' +
           '<div class="fsv" style="color:' + color + '">' + icon + ' ' + val + '</div>' +
           '<div class="fsl">' + label + '</div>' +
           '<div style="font-size:.7rem;color:#64748b">' + sub + '</div>' +
           '</div>';
}
