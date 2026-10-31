#include "data_model.h"
#include "conflict_graph.h"
#include "greedy_coloring.h"
#include "backtracking.h"
#include "timetable_gen.h"
#include <iostream>

// Orchestrates timetable generation:
//   1. Build conflict graph (adjacency list).
//   2. Attempt Welsh-Powell greedy coloring.
//   3. If greedy fails, reset all assignments and fall back to backtracking
//      (using the same degree-descending order).
// Returns true if a full valid timetable was produced, false otherwise.

bool generateTimetable() {
    buildConflictGraph();

    std::cout << "\n[Timetable Gen] Building conflict graph ... done ("
              << g_classes.size() << " classes)\n";

    // --- Greedy attempt ---
    std::cout << "[Timetable Gen] Trying Welsh-Powell greedy coloring ...\n";
    bool ok = greedyColor();

    if (ok) {
        std::cout << "[Timetable Gen] Greedy coloring succeeded.\n";
        return true;
    }

    std::cout << "[Timetable Gen] Greedy coloring FAILED. Falling back to backtracking ...\n";

    // Reset all assignments
    for (Class& c : g_classes) {
        c.assignedSlot = -1;
        c.assignedRoom = -1;
        c.color        = -1;
    }

    // Build degree-descending order for backtracking
    int n = (int)g_classes.size();
    vector<int> order(n);
    for (int i = 0; i < n; i++) order[i] = i;
    sort(order.begin(), order.end(), [](int a, int b) {
        return g_adjList[a].size() > g_adjList[b].size();
    });

    bool btOk = backtrackColor(0, order);

    if (btOk) {
        std::cout << "[Timetable Gen] Backtracking succeeded.\n";
    } else {
        std::cout << "[Timetable Gen] Backtracking also FAILED — no valid timetable found.\n";
    }
    return btOk;
}
