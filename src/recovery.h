#pragma once
#include <string>
#include <vector>
// Timetable recovery using Bipartite Matching + Max Flow
struct RecoveryResult {
    bool success;
    int  affectedCount;
    int  reassignedCount;
    std::vector<std::pair<int, std::pair<int,int>>> changes;
    std::string log;
};
RecoveryResult recoverTimetable(const std::string& disruptionType, int disruptedId);
