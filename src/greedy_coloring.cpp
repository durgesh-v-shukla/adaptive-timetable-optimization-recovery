#include "data_model.h"
#include "conflict_graph.h"
#include "greedy_coloring.h"

// DAA Topic: Greedy Algorithm + Graph Coloring
// Welsh-Powell heuristic:
//   1. Sort vertices by degree (descending).
//   2. For each vertex in that order, try every (slot, room) pair via isValidAssignment.
//   3. Assign the first valid pair found.
// Returns true if all classes could be assigned, false otherwise.
// Time Complexity: O(n * S * R)

bool greedyColor() {
    int n = (int)g_classes.size();
    int S = (int)g_slots.size();
    int R = (int)g_rooms.size();

    // Build order by degree descending (Welsh-Powell)
    vector<int> order(n);
    for (int i = 0; i < n; i++) order[i] = i;
    sort(order.begin(), order.end(), [](int a, int b) {
        return g_adjList[a].size() > g_adjList[b].size();
    });

    for (int idx = 0; idx < n; idx++) {
        int cid = order[idx];
        bool assigned = false;

        for (int s = 0; s < S && !assigned; s++) {
            for (int r = 0; r < R && !assigned; r++) {
                if (isValidAssignment(cid, s, r)) {
                    g_classes[cid].assignedSlot = s;
                    g_classes[cid].assignedRoom = r;
                    g_classes[cid].color        = s;
                    assigned = true;
                }
            }
        }

        if (!assigned) {
            return false;  // greedy failed for this class
        }
    }
    return true;
}
