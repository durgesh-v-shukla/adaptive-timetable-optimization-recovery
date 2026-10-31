#include "data_model.h"
#include "conflict_graph.h"
#include "backtracking.h"

// DAA Topic: Backtracking
// Recursively assigns (slot, room) to each class in the given order.
// If no valid assignment exists for a class, backtracks to the previous class
// and tries the next (slot, room) combination.
// Time Complexity: O(n! * S * R) worst case

bool backtrackColor(int idx, vector<int>& order) {
    int n = (int)order.size();
    if (idx == n) return true;   // all classes assigned

    int cid = order[idx];
    int S   = (int)g_slots.size();
    int R   = (int)g_rooms.size();

    for (int s = 0; s < S; s++) {
        for (int r = 0; r < R; r++) {
            if (isValidAssignment(cid, s, r)) {
                // Tentatively assign
                g_classes[cid].assignedSlot = s;
                g_classes[cid].assignedRoom = r;
                g_classes[cid].color        = s;

                if (backtrackColor(idx + 1, order)) return true;

                // Backtrack
                g_classes[cid].assignedSlot = -1;
                g_classes[cid].assignedRoom = -1;
                g_classes[cid].color        = -1;
            }
        }
    }
    return false;  // no valid assignment found — trigger backtrack
}
