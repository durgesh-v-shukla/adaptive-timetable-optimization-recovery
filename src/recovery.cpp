#include "data_model.h"
#include "conflict_graph.h"
#include "max_flow.h"
#include "recovery.h"
#include <sstream>
#include <iostream>

// DAA Topic: Bipartite Matching via Maximum Flow for timetable repair
//
// Network layout:
//   Node 0           : SOURCE
//   Nodes 1 .. A     : one node per affected class (A = affectedCount)
//   Nodes A+1 .. A+K : one node per valid (slot, room) pair   (K = candidate pairs)
//   Node A+K+1       : SINK
//
// Edges:
//   SOURCE  → class_node        (cap 1)
//   class_node → pair_node      (cap 1, if isValidAssignment)
//   pair_node  → SINK           (cap 1)
//
// After maxFlow, a pair_node → class_node residual edge with cap == 1 means
// that pair was used to reassign that class.

RecoveryResult recoverTimetable(const std::string& disruptionType, int disruptedId) {
    RecoveryResult res;
    res.success          = false;
    res.affectedCount    = 0;
    res.reassignedCount  = 0;
    std::ostringstream logStream;

    // ── Step 1: Mark the disrupted resource as unavailable ─────────────────
    if (disruptionType == "room") {
        if (disruptedId < 0 || disruptedId >= (int)g_rooms.size()) {
            res.log = "Invalid room id.";
            return res;
        }
        g_rooms[disruptedId].available = false;
        logStream << "Disruption: Room \"" << g_rooms[disruptedId].name << "\" unavailable.\n";
    } else if (disruptionType == "teacher") {
        if (disruptedId < 0 || disruptedId >= (int)g_teachers.size()) {
            res.log = "Invalid teacher id.";
            return res;
        }
        g_teachers[disruptedId].available = false;
        logStream << "Disruption: Teacher \"" << g_teachers[disruptedId].name << "\" unavailable.\n";
    } else if (disruptionType == "slot") {
        if (disruptedId < 0 || disruptedId >= (int)g_slots.size()) {
            res.log = "Invalid slot id.";
            return res;
        }
        // Add slot to all teachers' unavailableSlots
        for (Teacher& t : g_teachers) {
            t.unavailableSlots.push_back(disruptedId);
        }
        logStream << "Disruption: Slot \"" << g_slots[disruptedId].label << "\" blocked.\n";
    } else {
        res.log = "Unknown disruption type: " + disruptionType;
        return res;
    }

    // ── Step 2: Find directly affected classes ─────────────────────────────
    vector<int> affected;
    for (int i = 0; i < (int)g_classes.size(); i++) {
        const Class& c = g_classes[i];
        bool directlyAffected = false;

        if (disruptionType == "room") {
            directlyAffected = (c.assignedRoom == disruptedId);
        } else if (disruptionType == "teacher") {
            directlyAffected = (c.teacherId == disruptedId);
        } else if (disruptionType == "slot") {
            directlyAffected = (c.assignedSlot == disruptedId);
        }

        if (directlyAffected) {
            affected.push_back(i);
        }
    }

    res.affectedCount = (int)affected.size();
    logStream << "Affected classes: " << res.affectedCount << "\n";

    if (affected.empty()) {
        res.success = true;
        res.log     = logStream.str();
        return res;
    }

    // ── Step 3: Save and temporarily unassign affected classes ────────────
    vector<int> savedSlot(affected.size());
    vector<int> savedRoom(affected.size());

    for (int i = 0; i < (int)affected.size(); i++) {
        int cid = affected[i];
        savedSlot[i] = g_classes[cid].assignedSlot;
        savedRoom[i] = g_classes[cid].assignedRoom;
        g_classes[cid].assignedSlot = -1;
        g_classes[cid].assignedRoom = -1;
        g_classes[cid].color        = -1;
    }

    // ── Step 4: Enumerate valid (slot, room) candidate pairs ───────────────
    // A candidate pair is valid for at least one affected class.
    int S = (int)g_slots.size();
    int R = (int)g_rooms.size();
    int A = (int)affected.size();

    // pairs[k] = {slotId, roomId}
    vector<pair<int,int>> pairs;
    // pairIndex[{s,r}] = index k in pairs[]
    map<pair<int,int>, int> pairIndex;

    // For each affected class, collect valid (s,r) pairs
    // validPairsForClass[i] = list of pair-indices valid for affected[i]
    vector<vector<int>> validPairsForClass(A);

    for (int i = 0; i < A; i++) {
        int cid = affected[i];
        for (int s = 0; s < S; s++) {
            for (int r = 0; r < R; r++) {
                if (isValidAssignment(cid, s, r)) {
                    pair<int,int> pr = make_pair(s, r);
                    if (pairIndex.find(pr) == pairIndex.end()) {
                        pairIndex[pr] = (int)pairs.size();
                        pairs.push_back(pr);
                    }
                    validPairsForClass[i].push_back(pairIndex[pr]);
                }
            }
        }
    }

    int K = (int)pairs.size();
    // Nodes: 0=SRC, 1..A=classes, A+1..A+K=pairs, A+K+1=SINK
    int SRC  = 0;
    int SINK = A + K + 1;
    int totalNodes = A + K + 2;

    FlowNetwork fn(totalNodes);

    // SRC → each class node (cap 1)
    for (int i = 0; i < A; i++) {
        fn.addEdge(SRC, 1 + i, 1);
    }

    // class node → valid pair nodes (cap 1)
    for (int i = 0; i < A; i++) {
        for (int pk : validPairsForClass[i]) {
            fn.addEdge(1 + i, A + 1 + pk, 1);
        }
    }

    // pair nodes → SINK (cap 1) — each (slot,room) pair can be used at most once
    for (int k = 0; k < K; k++) {
        fn.addEdge(A + 1 + k, SINK, 1);
    }

    // ── Step 5: Run Edmonds-Karp max flow ─────────────────────────────────
    int flow = fn.maxFlow(SRC, SINK);
    logStream << "Max-flow reassignments: " << flow << " / " << A << "\n";

    // ── Step 6: Read back matching from residual graph ────────────────────
    // For each pair node pk: if fn.cap[A+1+pk][classNode] == 1, that class was matched
    vector<bool> reassigned(A, false);

    for (int pk = 0; pk < K; pk++) {
        int pairNode = A + 1 + pk;
        for (int i = 0; i < A; i++) {
            int classNode = 1 + i;
            // Residual edge pairNode → classNode exists iff cap[pairNode][classNode] == 1
            if (fn.cap[pairNode][classNode] == 1) {
                int cid  = affected[i];
                int newS = pairs[pk].first;
                int newR = pairs[pk].second;

                g_classes[cid].assignedSlot = newS;
                g_classes[cid].assignedRoom = newR;
                g_classes[cid].color        = newS;
                reassigned[i]               = true;

                res.changes.push_back(make_pair(cid, make_pair(newS, newR)));
                logStream << "  Class " << cid << " (" << g_classes[cid].subject
                          << "-" << g_classes[cid].group << ")"
                          << " → Slot " << newS << " (" << g_slots[newS].label
                          << "), Room " << newR << " (" << g_rooms[newR].name << ")\n";
                break;
            }
        }
    }

    // ── Step 7: Restore unmatched classes to original assignments ─────────
    for (int i = 0; i < A; i++) {
        if (!reassigned[i]) {
            int cid = affected[i];
            g_classes[cid].assignedSlot = savedSlot[i];
            g_classes[cid].assignedRoom = savedRoom[i];
            g_classes[cid].color        = savedSlot[i];
            logStream << "  Class " << cid << " (" << g_classes[cid].subject
                      << "-" << g_classes[cid].group << ")"
                      << " could NOT be reassigned — kept original.\n";
        }
    }

    res.reassignedCount = flow;
    res.success         = (flow == A);
    res.log             = logStream.str();
    return res;
}
