// main.cpp — Entry point
// Usage: ./timetable [room|teacher|slot] [id]
#include <iostream>
#include <iomanip>
#include <string>
#include <cstdlib>
#include "data_model.h"
#include "data_init.h"
#include "conflict_graph.h"
#include "timetable_gen.h"
#include "fragility.h"
#include "bfs_dfs.h"
#include "recovery.h"
#include "json_writer.h"
#include "complexity.h"

using namespace std;

static void sep(char c = '=', int w = 72) {
    for (int i = 0; i < w; i++) cout << c;
    cout << "\n";
}

static void printTimetable() {
    sep();
    cout << "  GENERATED TIMETABLE\n";
    sep();
    printf("  %-4s %-8s %-5s %-20s %-14s %-12s\n",
           "ID","Subject","Grp","Teacher","Room","Slot");
    sep('-');
    for (const Class& c : g_classes) {
        string t = (c.teacherId < (int)g_teachers.size()) ? g_teachers[c.teacherId].name : "?";
        string r = (c.assignedRoom < (int)g_rooms.size()) ? g_rooms[c.assignedRoom].name : "?";
        string s = (c.assignedSlot < (int)g_slots.size()) ? g_slots[c.assignedSlot].label : "?";
        printf("  %-4d %-8s %-5s %-20s %-14s %-12s%s\n",
               c.id, c.subject.c_str(), c.group.c_str(),
               t.c_str(), r.c_str(), s.c_str(),
               c.needsLab ? " [LAB]" : "");
    }
    sep();
}

static void printFragility() {
    sep();
    cout << "  FRAGILITY REPORT  (lower = higher risk)\n";
    sep();
    printf("  %-8s %-5s %-12s %s\n","Subject","Grp","Alternatives","Status");
    sep('-');
    for (const Class& c : g_classes) {
        const char* status = c.fragility <= 1 ? "HIGHLY FRAGILE" :
                             c.fragility <= 3 ? "FRAGILE"        : "Stable";
        printf("  %-8s %-5s %-12d %s\n",
               c.subject.c_str(), c.group.c_str(), c.fragility, status);
    }
    sep();
}

static void printBFS(const vector<int>& affected, int startId) {
    sep();
    cout << "  BFS AFFECTED REGION (from class " << startId << ")\n";
    sep();
    for (int i = 0; i < (int)affected.size(); i++) {
        if (i) cout << " -> ";
        const Class& c = g_classes[affected[i]];
        cout << c.subject << "-" << c.group;
    }
    cout << "\n";
    sep();
}

static void printRecovery(const RecoveryResult& r) {
    sep();
    cout << "  RECOVERY RESULT\n";
    sep();
    cout << "  Success    : " << (r.success ? "YES" : "NO") << "\n";
    cout << "  Affected   : " << r.affectedCount << "\n";
    cout << "  Reassigned : " << r.reassignedCount << "\n\n";
    cout << r.log << "\n";
    sep();
}

int main(int argc, char* argv[]) {
    sep();
    cout << "  Adaptive Timetable Optimization & Recovery Framework\n";
    sep();

    string disruptionType = "room";
    int    disruptedId    = 0;
    if (argc >= 3) {
        disruptionType = argv[1];
        disruptedId    = atoi(argv[2]);
    }
    cout << "  Disruption: " << disruptionType << " #" << disruptedId << "\n\n";

    printComplexity();

    cout << "  [1/5] Initialising data...\n";
    initData();
    cout << "        " << g_classes.size() << " classes | "
         << g_rooms.size() << " rooms | "
         << g_teachers.size() << " teachers | "
         << g_slots.size() << " slots\n";

    cout << "\n  [2/5] Generating timetable...\n";
    if (!generateTimetable()) {
        cerr << "  ERROR: No valid timetable found!\n";
        return 1;
    }
    cout << "        Done.\n";
    printTimetable();

    cout << "  [3/5] Fragility analysis...\n";
    analyzeFragility();
    printFragility();

    cout << "  [4/5] BFS disruption scan...\n";
    int startClass = -1;
    for (const Class& c : g_classes) {
        if (disruptionType == "room"    && c.assignedRoom  == disruptedId) { startClass = c.id; break; }
        if (disruptionType == "teacher" && c.teacherId     == disruptedId) { startClass = c.id; break; }
        if (disruptionType == "slot"    && c.assignedSlot  == disruptedId) { startClass = c.id; break; }
    }
    if (startClass >= 0) {
        vector<int> bfsResult = bfsAffected(startClass);
        vector<int> dfsResult = dfsAffected(startClass);
        printBFS(bfsResult, startClass);
        cout << "  DFS order: ";
        for (int i = 0; i < (int)dfsResult.size(); i++) {
            if (i) cout << " -> ";
            cout << g_classes[dfsResult[i]].subject << "-" << g_classes[dfsResult[i]].group;
        }
        cout << "\n\n";
    }

    cout << "  [5/5] Recovery...\n";
    RecoveryResult recovery = recoverTimetable(disruptionType, disruptedId);
    printRecovery(recovery);

    writeJSON("output/timetable.json", &recovery);
    cout << "  JSON written: output/timetable.json\n";
    cout << "  Open DEMO.html in your browser.\n";
    sep();
    return 0;
}
