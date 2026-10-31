// ─────────────────────────────────────────────────────────────
//  recovery.js  —  Recovery Panel Renderer
//  Uses CSS classes from style.css
// ─────────────────────────────────────────────────────────────

window.renderRecovery = function () {
    var d = window.APP.data;
    var rec = d && d.recovery ? d.recovery : window.APP.recoveryData;

    if (!rec) {
        var logEl0 = document.getElementById('recovery-log');
        if (logEl0) logEl0.innerHTML =
            '<span style="color:#64748b;font-style:italic">No recovery data. Run the C++ engine then click ↺ Reload Data.</span>';
        return;
    }

    var classes = d ? d.classes : [];
    var slots = d ? d.slots : [];
    var rooms = d ? d.rooms : [];
    var unresolved = rec.affectedCount - rec.reassignedCount;

    // ── Banner ─────────────────────────────────────────────
    var bannerEl = document.getElementById('recovery-banner');
    if (bannerEl) {
        bannerEl.className = 'recovery-banner ' + (rec.success ? 'success' : 'failure');
        bannerEl.innerHTML = rec.success
            ? '✅ <strong>Full Recovery</strong> — all ' + rec.affectedCount + ' affected class' +
            (rec.affectedCount !== 1 ? 'es' : '') + ' successfully reassigned.'
            : '⚠️ <strong>Partial Recovery</strong> — ' + rec.reassignedCount + '/' +
            rec.affectedCount + ' reassigned; ' + unresolved + ' unresolved.';
    }

    // ── Pipeline ───────────────────────────────────────────
    var pipeEl = document.getElementById('recovery-pipeline');
    if (pipeEl) {
        pipeEl.innerHTML =
            '<div class="pipeline-step">' +
            mkNode('⚡', 'Disruption', '—', 'pn-active') +
            mkArrow() +
            mkNode('🌐', 'BFS Scan', 'O(V+E)', 'pn-active') +
            mkArrow() +
            mkNode('⚖️', 'Bipartite', 'Match', 'pn-active') +
            mkArrow() +
            mkNode('🌊', 'Max-Flow', 'O(V·E²)', 'pn-active') +
            mkArrow() +
            mkNode(rec.success ? '✅' : '⚠️', rec.success ? 'Recovered' : 'Partial', rec.reassignedCount + '/' + rec.affectedCount, rec.success ? 'pn-success' : 'pn-active') +
            '</div>';
    }

    // ── Stats row ──────────────────────────────────────────
    var statsEl = document.getElementById('recovery-stats-row');
    if (statsEl) {
        statsEl.innerHTML =
            '<div style="display:flex;gap:12px;flex-wrap:wrap;margin:12px 0">' +
            mkStatCard(rec.affectedCount, '#f87171', 'Affected') +
            mkStatCard(rec.reassignedCount, '#34d399', 'Reassigned') +
            mkStatCard(unresolved, unresolved > 0 ? '#fbbf24' : '#34d399', 'Unresolved') +
            '</div>';
    }

    // ── Log ────────────────────────────────────────────────
    var logEl = document.getElementById('recovery-log');
    if (logEl) logEl.textContent = rec.log || 'No log available.';

    // ── Changes table ──────────────────────────────────────
    var tbody = document.getElementById('recovery-tbody');
    if (tbody) {
        if (!rec.changes || rec.changes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#64748b;padding:20px">No reassignments.</td></tr>';
        } else {
            var rows = '';
            rec.changes.forEach(function (ch) {
                var cls = classes.find(function (c) { return c.id === ch.classId; });
                var slot = slots[ch.newSlot] ? slots[ch.newSlot].label : 'Slot ' + ch.newSlot;
                var room = rooms[ch.newRoom] ? rooms[ch.newRoom].name : 'Room ' + ch.newRoom;
                rows +=
                    '<tr style="background:#1c1010">' +
                    '<td style="text-align:center">' + ch.classId + '</td>' +
                    '<td><strong>' + (cls ? cls.subject : '?') + '</strong>' +
                    (cls && cls.needsLab ? ' <span class="badge badge-stable" style="background:#064e3b;color:#6ee7b7;font-size:.68rem">LAB</span>' : '') +
                    '<br><span style="font-size:.72rem;color:#64748b">Grp ' + (cls ? cls.group : '?') + '</span></td>' +
                    '<td style="font-family:monospace;color:#34d399">' + slot + '</td>' +
                    '<td style="font-family:monospace;color:#34d399">' + room + '</td>' +
                    '</tr>';
            });
            tbody.innerHTML = rows;
        }
    }
};

function mkNode(icon, label, sub, modCls) {
    return '<div class="pipeline-node ' + modCls + '">' +
        '<div class="pn-icon">' + icon + '</div>' +
        '<div class="pn-label">' + label + '</div>' +
        '<div class="pn-sub">' + sub + '</div>' +
        '</div>';
}
function mkArrow() { return '<div class="pipeline-arrow">→</div>'; }
function mkStatCard(val, color, label) {
    return '<div class="recovery-stat-card" style="flex:1;min-width:100px">' +
        '<div class="rsv" style="color:' + color + '">' + val + '</div>' +
        '<div class="rsl">' + label + '</div>' +
        '</div>';
}
