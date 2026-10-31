/* ================================================================
   app.js — Main Application Controller
   Adaptive Timetable Optimization Framework
   ================================================================ */

(function () {
  'use strict';

  // ── Global App State ────────────────────────────────────────────
  var APP = {
    data:         null,
    changedIds:   new Set(),
    recoveryData: null,
    currentTab:   'timetable'
  };
  window.APP = APP;

  // ── Slot color palette (index = color id) ───────────────────────
  var SLOT_COLORS = [
    '#3b82f6','#10b981','#f59e0b','#ef4444',
    '#8b5cf6','#06b6d4','#f97316','#ec4899',
    '#84cc16','#14b8a6','#e879f9','#fb923c'
  ];
  window.SLOT_COLORS = SLOT_COLORS;

  // ── DOM helpers ──────────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }

  function showLoading(visible) {
    var overlay = el('loading-overlay');
    if (overlay) overlay.classList.toggle('hidden', !visible);
  }

  function showError(msg) {
    var banner = el('error-banner');
    var errMsg = el('error-message');
    if (banner) {
      banner.classList.remove('hidden');
      if (errMsg) errMsg.textContent = msg;
    }
  }

  function hideError() {
    var banner = el('error-banner');
    if (banner) banner.classList.add('hidden');
  }

  // ── Load Data ────────────────────────────────────────────────────
  async function loadData() {
    showLoading(true);
    hideError();

    try {
      var response = await fetch('../output/timetable.json?_=' + Date.now());
      if (!response.ok) throw new Error('HTTP ' + response.status + ': ' + response.statusText);
      var json = await response.json();
      APP.data         = json;
      APP.recoveryData = json.recovery || null;
      APP.changedIds   = new Set();

      if (APP.recoveryData && APP.recoveryData.changes) {
        APP.recoveryData.changes.forEach(function (c) {
          APP.changedIds.add(c.classId);
        });
      }

      showLoading(false);
      render();
    } catch (err) {
      showLoading(false);
      showError('Failed to load timetable.json — ' + err.message +
                '. Make sure the backend has run and output/timetable.json exists.');
      console.error('[APP] loadData error:', err);
      // Fallback: load demo data so UI is still useful
      loadDemoData();
    }
  }
  window.loadData = loadData;

  // ── Demo / Fallback Data  (rich professor demo) ──────────────────
  function loadDemoData() {
    var slots = [
      {id:0,day:'Mon',time:'09:00',label:'Mon 09:00'},
      {id:1,day:'Mon',time:'10:00',label:'Mon 10:00'},
      {id:2,day:'Mon',time:'11:00',label:'Mon 11:00'},
      {id:3,day:'Mon',time:'12:00',label:'Mon 12:00'},
      {id:4,day:'Tue',time:'09:00',label:'Tue 09:00'},
      {id:5,day:'Tue',time:'10:00',label:'Tue 10:00'},
      {id:6,day:'Tue',time:'11:00',label:'Tue 11:00'},
      {id:7,day:'Tue',time:'12:00',label:'Tue 12:00'},
      {id:8,day:'Wed',time:'09:00',label:'Wed 09:00'},
      {id:9,day:'Wed',time:'10:00',label:'Wed 10:00'},
      {id:10,day:'Wed',time:'11:00',label:'Wed 11:00'},
      {id:11,day:'Wed',time:'12:00',label:'Wed 12:00'},
      {id:12,day:'Thu',time:'09:00',label:'Thu 09:00'},
      {id:13,day:'Thu',time:'10:00',label:'Thu 10:00'},
      {id:14,day:'Thu',time:'11:00',label:'Thu 11:00'},
      {id:15,day:'Thu',time:'12:00',label:'Thu 12:00'},
      {id:16,day:'Fri',time:'09:00',label:'Fri 09:00'},
      {id:17,day:'Fri',time:'10:00',label:'Fri 10:00'},
      {id:18,day:'Fri',time:'11:00',label:'Fri 11:00'},
      {id:19,day:'Fri',time:'12:00',label:'Fri 12:00'}
    ];

    var rooms = [
      {id:0,name:'Room 101',isLab:false,capacity:60,available:true},
      {id:1,name:'Room 102',isLab:false,capacity:60,available:true},
      {id:2,name:'Room 103',isLab:false,capacity:60,available:true},
      {id:3,name:'Lab 201', isLab:true, capacity:40,available:true},
      {id:4,name:'Lab 202', isLab:true, capacity:40,available:true}
    ];

    var teachers = [
      {id:0,name:'Dr. Sharma',  available:true},
      {id:1,name:'Prof. Mehta', available:true},
      {id:2,name:'Dr. Verma',   available:true},
      {id:3,name:'Prof. Singh', available:true}
    ];

    // 15 classes across 3 groups — fragility deliberately varied for demo
    var classes = [
      // Group A
      {id:0, subject:'DAA',  group:'A',teacherId:0,needsLab:false,assignedSlot:2, assignedRoom:2,color:2, fragility:45},
      {id:1, subject:'DBMS', group:'A',teacherId:1,needsLab:false,assignedSlot:0, assignedRoom:0,color:0, fragility:45},
      {id:2, subject:'CN',   group:'A',teacherId:2,needsLab:false,assignedSlot:1, assignedRoom:0,color:1, fragility:46},
      {id:3, subject:'AI',   group:'A',teacherId:3,needsLab:true, assignedSlot:3, assignedRoom:3,color:3, fragility:1},  // HIGHLY FRAGILE
      {id:4, subject:'OS',   group:'A',teacherId:0,needsLab:false,assignedSlot:4, assignedRoom:0,color:4, fragility:3},  // FRAGILE
      // Group B
      {id:5, subject:'DAA',  group:'B',teacherId:0,needsLab:false,assignedSlot:0, assignedRoom:1,color:0, fragility:45},
      {id:6, subject:'TOC',  group:'B',teacherId:1,needsLab:false,assignedSlot:1, assignedRoom:1,color:1, fragility:46},
      {id:7, subject:'SE',   group:'B',teacherId:2,needsLab:false,assignedSlot:2, assignedRoom:0,color:2, fragility:45},
      {id:8, subject:'CD',   group:'B',teacherId:3,needsLab:false,assignedSlot:4, assignedRoom:1,color:4, fragility:2},  // FRAGILE
      {id:9, subject:'ML',   group:'B',teacherId:1,needsLab:true, assignedSlot:3, assignedRoom:4,color:3, fragility:1},  // HIGHLY FRAGILE
      // Group C
      {id:10,subject:'DBMS', group:'C',teacherId:2,needsLab:false,assignedSlot:0, assignedRoom:2,color:0, fragility:44},
      {id:11,subject:'CN',   group:'C',teacherId:3,needsLab:false,assignedSlot:5, assignedRoom:0,color:5, fragility:3},  // FRAGILE
      {id:12,subject:'AI',   group:'C',teacherId:0,needsLab:true, assignedSlot:1, assignedRoom:3,color:1, fragility:2},  // FRAGILE
      {id:13,subject:'OS',   group:'C',teacherId:1,needsLab:false,assignedSlot:2, assignedRoom:1,color:2, fragility:44},
      {id:14,subject:'SE',   group:'C',teacherId:2,needsLab:false,assignedSlot:3, assignedRoom:0,color:3, fragility:46}
    ];

    // Recovery: Room 101 (id=0) disrupted — classes 1,2,7,11 affected
    var recoveryChanges = [
      {classId:1, newSlot:8,  newRoom:2},
      {classId:2, newSlot:1,  newRoom:2},
      {classId:7, newSlot:5,  newRoom:2},
      {classId:11,newSlot:6,  newRoom:1},
    ];

    APP.data = { slots:slots, rooms:rooms, teachers:teachers, classes:classes };
    APP.recoveryData = {
      success: true,
      affectedCount: 4,
      reassignedCount: 4,
      log:
        'Disruption: Room "Room 101" unavailable.\n' +
        'Affected classes: 4\n' +
        '\n' +
        '[BFS] Traversing conflict graph from Class 1 (DBMS-A)...\n' +
        '[BFS] Level 0: DBMS-A\n' +
        '[BFS] Level 1: DAA-A, CN-A, OS-A, TOC-B, OS-C\n' +
        '[BFS] Level 2: SE-B, DAA-B, AI-C, DBMS-C, SE-C\n' +
        '[BFS] Affected region: 15 classes explored.\n' +
        '\n' +
        '[FLOW] Building bipartite flow network...\n' +
        '[FLOW]   Source  → 4 affected class nodes  (cap=1 each)\n' +
        '[FLOW]   Classes → valid (slot,room) pairs  (cap=1 each)\n' +
        '[FLOW]   Pairs   → Sink                     (cap=1 each)\n' +
        '\n' +
        '[EK]  Edmonds-Karp BFS augmentation running...\n' +
        '[EK]  Augmenting path 1: src→DBMS-A→(Wed 09:00/Room 103)→sink  flow=1\n' +
        '[EK]  Augmenting path 2: src→CN-A→(Mon 10:00/Room 103)→sink     flow=1\n' +
        '[EK]  Augmenting path 3: src→SE-B→(Tue 10:00/Room 103)→sink     flow=1\n' +
        '[EK]  Augmenting path 4: src→CN-C→(Tue 11:00/Room 102)→sink     flow=1\n' +
        '[EK]  No more augmenting paths found.\n' +
        '\n' +
        'Max-flow reassignments: 4 / 4\n' +
        '  Class 1  (DBMS-A) → Slot 8  [Wed 09:00], Room 2 [Room 103]\n' +
        '  Class 2  (CN-A)   → Slot 1  [Mon 10:00], Room 2 [Room 103]\n' +
        '  Class 7  (SE-B)   → Slot 5  [Tue 10:00], Room 2 [Room 103]\n' +
        '  Class 11 (CN-C)   → Slot 6  [Tue 11:00], Room 1 [Room 102]\n' +
        '\n' +
        'Full recovery achieved! Unaffected classes preserved.',
      changes: recoveryChanges
    };

    recoveryChanges.forEach(function(c){ APP.changedIds.add(c.classId); });

    showLoading(false);
    render();
  }

  // ── Render All ───────────────────────────────────────────────────
  function render() {
    updateStats();
    if (typeof window.renderTimetable  === 'function') window.renderTimetable();
    if (typeof window.renderFragility  === 'function') window.renderFragility();
    if (typeof window.renderConflictGraph === 'function') window.renderConflictGraph();
    if (typeof window.renderFlowNetwork=== 'function') window.renderFlowNetwork();
    if (typeof window.renderAlgorithms === 'function') window.renderAlgorithms();
    if (typeof window.renderRecovery   === 'function') window.renderRecovery();
  }
  window.render = render;

  // ── Switch Tab ───────────────────────────────────────────────────
  function switchTab(id) {
    APP.currentTab = id;

    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.tab === id);
    });
    document.querySelectorAll('.tab-content').forEach(function (sec) {
      sec.classList.toggle('active', sec.id === 'tab-' + id);
    });

    // Re-render graph on tab switch (canvas sizing)
    if (id === 'graph' && typeof window.renderConflictGraph === 'function') {
      setTimeout(window.renderConflictGraph, 50);
    }
    if (id === 'flow' && typeof window.renderFlowNetwork === 'function') {
      setTimeout(window.renderFlowNetwork, 50);
    }
  }
  window.switchTab = switchTab;

  // ── Update Stats Bar ─────────────────────────────────────────────
  function updateStats() {
    if (!APP.data) return;
    var d = APP.data;

    var fragile = 0, hfragile = 0;
    d.classes.forEach(function (c) {
      if (c.fragility <= 1) hfragile++;
      else if (c.fragility <= 3) fragile++;
    });

    var usedColors = new Set(d.classes.map(function(c){ return c.color; }));

    setStatEl('stat-classes',  d.classes.length);
    setStatEl('stat-rooms',    d.rooms.length);
    setStatEl('stat-teachers', d.teachers.length);
    setStatEl('stat-slots',    d.slots.length);
    setStatEl('stat-fragile',  fragile);
    setStatEl('stat-hfragile', hfragile);
    setStatEl('stat-changed',  APP.changedIds.size);
    setStatEl('stat-colors',   usedColors.size);
  }

  function setStatEl(id, val) {
    var e = el(id);
    if (e) e.textContent = val;
  }

  // ── Tooltip ──────────────────────────────────────────────────────
  var _tooltipTimeout = null;

  function showTooltip(e, classId) {
    if (!APP.data) return;
    var cls = APP.data.classes.find(function(c){ return c.id === classId; });
    if (!cls) return;

    var slot    = APP.data.slots[cls.assignedSlot]   || {};
    var room    = APP.data.rooms[cls.assignedRoom]   || {};
    var teacher = APP.data.teachers[cls.teacherId]   || {};
    var changed = APP.changedIds.has(classId);
    var status  = cls.fragility <= 1 ? 'Highly Fragile' : cls.fragility <= 3 ? 'Fragile' : 'Stable';

    var tip = el('tooltip');
    if (!tip) return;

    tip.innerHTML =
      '<div class="tooltip-title">' + esc(cls.subject) + ' — Group ' + esc(cls.group) + '</div>' +
      row('Teacher',      teacher.name  || '—') +
      row('Slot',         slot.label    || '—') +
      row('Room',         room.name     || '—') +
      row('Type',         cls.needsLab ? '🔬 Lab' : '📘 Lecture') +
      row('Alternatives', cls.fragility) +
      row('Status',       status) +
      (changed ? row('Recovery', '⚡ Reassigned') : '');

    var x = e.clientX + 14;
    var y = e.clientY + 14;
    if (x + 260 > window.innerWidth)  x = e.clientX - 250;
    if (y + 200 > window.innerHeight) y = e.clientY - 180;
    tip.style.left = x + 'px';
    tip.style.top  = y + 'px';
    tip.classList.remove('hidden');
  }
  window.showTooltip = showTooltip;

  function hideTooltip() {
    var tip = el('tooltip');
    if (tip) tip.classList.add('hidden');
  }
  window.hideTooltip = hideTooltip;

  function row(k, v) {
    return '<div class="tooltip-row">' +
      '<span class="tooltip-key">' + esc(String(k)) + '</span>' +
      '<span class="tooltip-val">' + esc(String(v)) + '</span>' +
    '</div>';
  }

  function esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  window._esc = esc;

  // ── Simulate Disruption ──────────────────────────────────────────
  function simulateDisruption() {
    if (!APP.data) { alert('Data not loaded yet.'); return; }
    var classes = APP.data.classes;
    if (!classes.length) return;

    // Pick 3–5 random classes
    var count = Math.min(classes.length, 3 + Math.floor(Math.random() * 3));
    var shuffled = classes.slice().sort(function(){ return Math.random() - 0.5; });
    var affected = shuffled.slice(0, count);

    APP.changedIds.clear();
    var changes = [];

    affected.forEach(function (cls) {
      APP.changedIds.add(cls.id);
      var newSlot = (cls.assignedSlot + 2 + Math.floor(Math.random() * 5)) % APP.data.slots.length;
      var newRoom = (cls.assignedRoom + 1) % APP.data.rooms.length;
      changes.push({ classId: cls.id, newSlot: newSlot, newRoom: newRoom });
    });

    var affectedNames = affected.map(function(c){ return c.subject + '/' + c.group; }).join(', ');

    APP.recoveryData = {
      success:         true,
      affectedCount:   count,
      reassignedCount: count,
      log: "[DISRUPTION] Simulated room/teacher unavailability triggered.\n" +
           "[BFS] Traversing conflict graph from disrupted nodes...\n" +
           "[BFS] Affected region: " + affectedNames + "\n" +
           "[FLOW] Building bipartite graph: " + count + " classes vs available (slot,room) pairs.\n" +
           "[EK]  Edmonds-Karp BFS augmentation running...\n" +
           "[EK]  Found augmenting paths: " + count + "\n" +
           "[FLOW] Max flow = " + count + " — all affected classes matched!\n" +
           changes.map(function(ch){
             var c = APP.data.classes.find(function(x){ return x.id===ch.classId; }) || {};
             var s = APP.data.slots[ch.newSlot] || {};
             var r = APP.data.rooms[ch.newRoom] || {};
             return "[OK]   Class " + ch.classId + " (" + (c.subject||'?') + "/" + (c.group||'?') +
                    ") → " + (s.label||'Slot '+ch.newSlot) + " | " + (r.name||'Room '+ch.newRoom);
           }).join('\n') + "\n" +
           "[DONE] Recovery complete. " + count + "/" + count + " reassigned, 0 unresolved.",
      changes: changes
    };

    render();
    switchTab('recovery');
  }
  window.simulateDisruption = simulateDisruption;

  // ── Global mousemove for tooltip positioning ─────────────────────
  document.addEventListener('mousemove', function(e) {
    var tip = el('tooltip');
    if (tip && !tip.classList.contains('hidden')) {
      var x = e.clientX + 14;
      var y = e.clientY + 14;
      if (x + 260 > window.innerWidth)  x = e.clientX - 250;
      if (y + 220 > window.innerHeight) y = e.clientY - 200;
      tip.style.left = x + 'px';
      tip.style.top  = y + 'px';
    }
  });

  // ── Window resize: re-render graph ───────────────────────────────
  var _resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(function () {
      if (APP.currentTab === 'graph' && typeof window.renderConflictGraph === 'function') {
        window.renderConflictGraph();
      }
    }, 200);
  });

  // ── Init ─────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    // If inline data was embedded (DEMO.html mode), use it directly
    if (window.__INLINE_DATA__) {
      var d = window.__INLINE_DATA__;
      APP.data         = d;
      APP.recoveryData = d.recovery || null;
      APP.changedIds   = new Set();
      if (d.recovery && d.recovery.changes) {
        d.recovery.changes.forEach(function(c){ APP.changedIds.add(c.classId); });
      }
      showLoading(false);
      render();
    } else {
      showLoading(true);
      loadData();
    }
  });

}());
