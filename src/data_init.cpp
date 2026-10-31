#include "data_model.h"
#include "data_init.h"

vector<TimeSlot>    g_slots;
vector<Room>        g_rooms;
vector<Teacher>     g_teachers;
vector<Class>       g_classes;
vector<vector<int>> g_adjList;

void initData() {
    // 20 time slots: Mon-Fri x 4 periods
    vector<string> days  = {"Mon","Tue","Wed","Thu","Fri"};
    vector<string> times = {"09:00","10:00","11:00","12:00"};
    int sid = 0;
    for (const string& d : days)
        for (const string& t : times) {
            TimeSlot ts;
            ts.id = sid++; ts.day = d; ts.time = t;
            ts.label = d + " " + t;
            g_slots.push_back(ts);
        }

    // 5 rooms: 3 lecture halls + 2 labs
    g_rooms = {
        {0, "Room 101", false, 60, true},
        {1, "Room 102", false, 60, true},
        {2, "Room 103", false, 60, true},
        {3, "Lab 201",  true,  40, true},
        {4, "Lab 202",  true,  40, true}
    };

    // 5 teachers — some have restricted availability to create fragile classes
    // Teacher 3 (Prof. Singh) unavailable Mon morning -> makes his classes fragile
    // Teacher 4 (Dr. Rao)     unavailable Tue, Thu    -> very fragile
    g_teachers = {
        {0, "Dr. Sharma",  {},           true},
        {1, "Prof. Mehta", {},           true},
        {2, "Dr. Verma",   {},           true},
        {3, "Prof. Singh", {0,1,2,3},    true},  // unavailable all Mon slots
        {4, "Dr. Rao",     {4,5,6,7,    // Tue
                            12,13,14,15}, true}   // Thu
    };

    // 20 classes across 4 groups (A, B, C, D)
    // Format: {id, subject, group, teacherId, needsLab, assignedSlot=-1, assignedRoom=-1, color=-1, fragility=0}
    g_classes = {
        // Group A — 5 subjects
        {0,  "DAA",   "A", 0, false, -1,-1,-1,0},
        {1,  "DBMS",  "A", 1, false, -1,-1,-1,0},
        {2,  "CN",    "A", 2, false, -1,-1,-1,0},
        {3,  "AI Lab","A", 3, true,  -1,-1,-1,0},  // Prof.Singh + lab = fragile
        {4,  "OS",    "A", 4, false, -1,-1,-1,0},  // Dr.Rao restricted = fragile

        // Group B — 5 subjects
        {5,  "DAA",   "B", 0, false, -1,-1,-1,0},
        {6,  "TOC",   "B", 1, false, -1,-1,-1,0},
        {7,  "SE",    "B", 2, false, -1,-1,-1,0},
        {8,  "ML Lab","B", 3, true,  -1,-1,-1,0},  // Prof.Singh + lab = fragile
        {9,  "CD",    "B", 4, false, -1,-1,-1,0},  // Dr.Rao restricted = fragile

        // Group C — 5 subjects
        {10, "DBMS",  "C", 1, false, -1,-1,-1,0},
        {11, "CN",    "C", 2, false, -1,-1,-1,0},
        {12, "AI Lab","C", 3, true,  -1,-1,-1,0},  // Prof.Singh + lab = fragile
        {13, "OS",    "C", 0, false, -1,-1,-1,0},
        {14, "SE",    "C", 4, false, -1,-1,-1,0},  // Dr.Rao restricted = fragile

        // Group D — 5 subjects
        {15, "DAA",   "D", 2, false, -1,-1,-1,0},
        {16, "TOC",   "D", 0, false, -1,-1,-1,0},
        {17, "DBMS",  "D", 1, false, -1,-1,-1,0},
        {18, "CV Lab","D", 3, true,  -1,-1,-1,0},  // Prof.Singh + lab = fragile
        {19, "ML",    "D", 4, false, -1,-1,-1,0}   // Dr.Rao restricted = fragile
    };
}
