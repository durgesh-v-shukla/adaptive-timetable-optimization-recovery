#include "data_model.h"
#include "conflict_graph.h"

// DAA Topic: Graph Representation (Adjacency List)
// Two classes conflict if they share the same student group OR same teacher.
// Time Complexity: O(n^2)  Space: O(n + E)

void buildConflictGraph() {
    int n = (int)g_classes.size();
    g_adjList.assign(n, vector<int>());

    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            bool sameGroup   = (g_classes[i].group     == g_classes[j].group);
            bool sameTeacher = (g_classes[i].teacherId == g_classes[j].teacherId);
            if (sameGroup || sameTeacher) {
                g_adjList[i].push_back(j);
                g_adjList[j].push_back(i);
            }
        }
    }
}

// Checks whether assigning (slotId, roomId) to classId is valid.
// Conditions:
//   1. Room exists and is available
//   2. Lab requirement satisfied
//   3. Teacher is available and the slot is not in unavailableSlots
//   4. No conflicting neighbour already occupies slotId
//   5. No other class already occupies (roomId, slotId) simultaneously
bool isValidAssignment(int classId, int slotId, int roomId) {
    const Class&   cls  = g_classes[classId];
    const Room&    room = g_rooms[roomId];
    const Teacher& tch  = g_teachers[cls.teacherId];

    // 1. Room available
    if (!room.available) return false;

    // 2. Lab requirement
    if (cls.needsLab && !room.isLab) return false;
    if (!cls.needsLab && room.isLab) return false;

    // 3. Teacher availability
    if (!tch.available) return false;
    const vector<int>& unavail = tch.unavailableSlots;
    if (find(unavail.begin(), unavail.end(), slotId) != unavail.end()) return false;

    // 4. No conflict-graph neighbour has the same slot
    for (int nb : g_adjList[classId]) {
        if (g_classes[nb].assignedSlot == slotId) return false;
    }

    // 5. No other class occupies (roomId, slotId)
    for (int i = 0; i < (int)g_classes.size(); i++) {
        if (i == classId) continue;
        if (g_classes[i].assignedSlot == slotId &&
            g_classes[i].assignedRoom == roomId) {
            return false;
        }
    }

    return true;
}
