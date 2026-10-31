#pragma once
#include <bits/stdc++.h>
using namespace std;

struct TimeSlot {
    int id;
    string day, time, label;
};

struct Room {
    int id;
    string name;
    bool isLab;
    int capacity;
    bool available;
};

struct Teacher {
    int id;
    string name;
    vector<int> unavailableSlots;
    bool available;
};

struct Class {
    int id;
    string subject, group;
    int teacherId;
    bool needsLab;
    int assignedSlot;
    int assignedRoom;
    int color;
    int fragility;
};

extern vector<TimeSlot>    g_slots;
extern vector<Room>        g_rooms;
extern vector<Teacher>     g_teachers;
extern vector<Class>       g_classes;
extern vector<vector<int>> g_adjList;
