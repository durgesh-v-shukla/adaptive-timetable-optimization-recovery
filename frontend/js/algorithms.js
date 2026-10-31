// ─────────────────────────────────────────────────────────────
//  algorithms.js  —  Algorithm Cards Renderer
//  Targets: #algo-grid  |  Uses CSS: .algo-card, .algo-grid etc.
// ─────────────────────────────────────────────────────────────

window.renderAlgorithms = function () {
    var grid = document.getElementById('algo-grid');
    if (!grid) return;

    var ALGOS = [
        {
            icon:'🏗️', name:'Graph Representation',
            tag:'Unit II — Graph Theory', color:'#3b82f6',
            time:'O(n²)', space:'O(V+E)',
            desc:'Timetable conflicts are modelled as an undirected adjacency-list graph. Vertex = class, edge = conflict (same student group OR same teacher). Built in <code>conflict_graph.cpp</code>.',
            pseudo:['for i in classes:', '  for j>i in classes:', '    if sameGroup(i,j) or sameTeacher(i,j):', '      adj[i]+=j; adj[j]+=i']
        },
        {
            icon:'🌐', name:'BFS — Disruption Scan',
            tag:'Unit II — BFS Traversal', color:'#06b6d4',
            time:'O(V+E)', space:'O(V)',
            desc:'After a resource becomes unavailable, BFS fans out from the first affected class level-by-level through the conflict graph to find every class that may be impacted.',
            pseudo:['Q.push(start); visited[start]=true','while Q not empty:','  u=Q.pop(); result+=u','  for v in adj[u]:','    if !visited[v]: Q.push(v)']
        },
        {
            icon:'🔍', name:'DFS — Depth Traversal',
            tag:'Unit II — DFS Traversal', color:'#8b5cf6',
            time:'O(V+E)', space:'O(V)',
            desc:'DFS uses an explicit stack to traverse the conflict graph depth-first. Alongside BFS it demonstrates both major graph traversal strategies on the same structure.',
            pseudo:['S.push(start)','while S not empty:','  u=S.pop()','  for v in adj[u]:','    if !visited[v]: S.push(v)']
        },
        {
            icon:'🎨', name:'Greedy Graph Coloring',
            tag:'Unit III — Greedy Algorithm', color:'#10b981',
            time:'O(n·S·R)', space:'O(n)',
            desc:'Welsh-Powell heuristic: sort classes by degree descending, then greedily assign each the smallest valid (slot, room) pair not used by any conflicting neighbour. Polynomial-time approximation.',
            pseudo:['sort classes by degree desc','for c in sorted_classes:','  for each slot s, room r:','    if isValid(c,s,r):','      assign(c,s,r); break']
        },
        {
            icon:'↩️', name:'Backtracking Solver',
            tag:'Unit III — Backtracking', color:'#f59e0b',
            time:'O(n!·S·R) worst', space:'O(n)',
            desc:'Fallback when greedy fails. Recursively tries all (slot, room) combinations with constraint pruning. Guarantees a valid timetable if one exists, at exponential worst-case cost.',
            pseudo:['backtrack(idx):','  if idx==n: return true','  for each (slot s, room r):','    if isValid: assign(c,s,r)','    if backtrack(idx+1): return true','    unassign(c)  // backtrack']
        },
        {
            icon:'📊', name:'Fragility Analysis',
            tag:'Unit I — Asymptotic Analysis', color:'#ec4899',
            time:'O(n·S·R)', space:'O(1)',
            desc:'Pre-disruption risk scoring: temporarily unassign each class and count all valid (slot, room) alternatives. Low count = fragile. Identifies at-risk assignments before any disruption occurs.',
            pseudo:['for each class c:','  unassign(c)','  count = 0','  for each (slot s, room r):','    if isValid(c,s,r): count++','  c.fragility=count; reassign(c)']
        },
        {
            icon:'⚖️', name:'Bipartite Matching',
            tag:'Unit V — Matching', color:'#14b8a6',
            time:'O(V·E)', space:'O(V+E)',
            desc:'Recovery: affected classes on left, valid (slot, room) pairs on right. Maximum bipartite matching finds the largest conflict-free reassignment set.',
            pseudo:['L = {affected classes}','R = {available (slot,room) pairs}','for c in L:','  for p in R: if compatible(c,p):','    addEdge(c,p,cap=1)','maxMatching(L,R)']
        },
        {
            icon:'🌊', name:'Max-Flow — Edmonds-Karp',
            tag:'Unit V — Network Flow', color:'#f97316',
            time:'O(V·E²)', space:'O(V²)',
            desc:'Matching solved as flow: Source→classes (cap 1)→(slot,room) pairs (cap 1)→Sink (cap 1). BFS-based Ford-Fulkerson (Edmonds-Karp) finds maximum flow = maximum classes recovered.',
            pseudo:['while BFS finds s→t path:','  flow = min cap on path','  for edge (u,v) on path:','    cap[u][v] -= flow','    cap[v][u] += flow','  totalFlow += flow']
        },
        {
            icon:'🧮', name:'NP-Completeness',
            tag:'Unit VI — Complexity Theory', color:'#dc2626',
            time:'NP-Complete', space:'—',
            desc:'Optimal graph k-coloring is NP-Complete (3-SAT ≤p 3-Coloring ≤p k-Coloring). Optimal timetabling is therefore NP-Hard. This project uses greedy + backtracking polynomial-time heuristics in practice.',
            pseudo:['3-SAT ≤p Graph-3-Colorability','k-Coloring ≡ Timetable Scheduling','⟹ Optimal scheduling is NP-Hard','⟹ Greedy: poly-time approximation','⟹ Backtracking: exact, exponential']
        }
    ];

    var html = '';
    ALGOS.forEach(function(a) {
        var pseudoLines = a.pseudo.map(function(line){
            return '<div class="algo-pseudo-line">' +
                   line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') +
                   '</div>';
        }).join('');

        html +=
            '<div class="algo-card" style="border-top:3px solid ' + a.color + '">' +
              '<div class="algo-card-header">' +
                '<span class="algo-icon">' + a.icon + '</span>' +
                '<div class="algo-card-title">' +
                  '<h3>' + a.name + '</h3>' +
                  '<span class="algo-tag">' + a.tag + '</span>' +
                '</div>' +
              '</div>' +
              '<p class="algo-desc">' + a.desc + '</p>' +
              '<div class="algo-pseudo">' + pseudoLines + '</div>' +
              '<div class="algo-complexity">' +
                '<span class="badge badge-stable" style="background:#1e3a5f;color:#93c5fd;margin-right:6px">⏱ ' + a.time  + '</span>' +
                '<span class="badge badge-stable" style="background:#1a2f1f;color:#6ee7b7">💾 ' + a.space + '</span>' +
              '</div>' +
            '</div>';
    });

    grid.innerHTML = html;
};
