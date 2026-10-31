#include "data_model.h"
#include "conflict_graph.h"
#include "fragility.h"

// DAA Topic: Pre-disruption risk analysis
// For each class:
//   1. Temporarily unassign it (so isValidAssignment treats it as free).
//   2. Count every (slot, room) pair for which isValidAssignment returns true.
//   3. Store the count in c.fragility (lower = more fragile / harder to reschedule).
//   4. Re-assign the original (slot, room).
// Time Complexity: O(n * S * R)

void analyzeFragility() {
    int S = (int)g_slots.size();
    int R = (int)g_rooms.size();

    for (int i = 0; i < (int)g_classes.size(); i++) {
        Class& c = g_classes[i];

        // Save current assignment
        int savedSlot = c.assignedSlot;
        int savedRoom = c.assignedRoom;
        int savedColor = c.color;

        // Temporarily unassign
        c.assignedSlot = -1;
        c.assignedRoom = -1;
        c.color        = -1;

        // Count valid alternatives
        int count = 0;
        for (int s = 0; s < S; s++) {
            for (int r = 0; r < R; r++) {
                if (isValidAssignment(i, s, r)) {
                    count++;
                }
            }
        }
        c.fragility = count;

        // Restore assignment
        c.assignedSlot = savedSlot;
        c.assignedRoom = savedRoom;
        c.color        = savedColor;
    }
}
