#include "data_model.h"
#include "json_writer.h"
#include <fstream>
#include <sstream>
#include <iostream>

// Helper: escape double-quotes and backslashes in a string for JSON
static std::string escJson(const std::string& s) {
    std::string out;
    out.reserve(s.size());
    for (char c : s) {
        if (c == '"')       out += "\\\"";
        else if (c == '\\') out += "\\\\";
        else if (c == '\n') out += "\\n";
        else if (c == '\r') out += "\\r";
        else if (c == '\t') out += "\\t";
        else                out += c;
    }
    return out;
}

void writeJSON(const std::string& filepath, const RecoveryResult* recovery) {
    std::ofstream f(filepath);
    if (!f.is_open()) {
        std::cerr << "[JSON] Cannot open file: " << filepath << "\n";
        return;
    }

    f << "{\n";

    // ── slots ──────────────────────────────────────────────────────────────
    f << "  \"slots\": [\n";
    for (int i = 0; i < (int)g_slots.size(); i++) {
        const TimeSlot& s = g_slots[i];
        f << "    {\"id\": " << s.id
          << ", \"day\": \""  << escJson(s.day)   << "\""
          << ", \"time\": \"" << escJson(s.time)  << "\""
          << ", \"label\": \"" << escJson(s.label) << "\"}";
        if (i + 1 < (int)g_slots.size()) f << ",";
        f << "\n";
    }
    f << "  ],\n";

    // ── rooms ──────────────────────────────────────────────────────────────
    f << "  \"rooms\": [\n";
    for (int i = 0; i < (int)g_rooms.size(); i++) {
        const Room& r = g_rooms[i];
        f << "    {\"id\": "        << r.id
          << ", \"name\": \""       << escJson(r.name) << "\""
          << ", \"isLab\": "        << (r.isLab ? "true" : "false")
          << ", \"capacity\": "     << r.capacity
          << ", \"available\": "    << (r.available ? "true" : "false") << "}";
        if (i + 1 < (int)g_rooms.size()) f << ",";
        f << "\n";
    }
    f << "  ],\n";

    // ── teachers ───────────────────────────────────────────────────────────
    f << "  \"teachers\": [\n";
    for (int i = 0; i < (int)g_teachers.size(); i++) {
        const Teacher& t = g_teachers[i];
        f << "    {\"id\": "        << t.id
          << ", \"name\": \""       << escJson(t.name) << "\""
          << ", \"available\": "    << (t.available ? "true" : "false")
          << ", \"unavailableSlots\": [";
        for (int k = 0; k < (int)t.unavailableSlots.size(); k++) {
            f << t.unavailableSlots[k];
            if (k + 1 < (int)t.unavailableSlots.size()) f << ", ";
        }
        f << "]}";
        if (i + 1 < (int)g_teachers.size()) f << ",";
        f << "\n";
    }
    f << "  ],\n";

    // ── classes ────────────────────────────────────────────────────────────
    f << "  \"classes\": [\n";
    for (int i = 0; i < (int)g_classes.size(); i++) {
        const Class& c = g_classes[i];
        f << "    {\"id\": "           << c.id
          << ", \"subject\": \""       << escJson(c.subject) << "\""
          << ", \"group\": \""         << escJson(c.group)   << "\""
          << ", \"teacherId\": "       << c.teacherId
          << ", \"needsLab\": "        << (c.needsLab ? "true" : "false")
          << ", \"assignedSlot\": "    << c.assignedSlot
          << ", \"assignedRoom\": "    << c.assignedRoom
          << ", \"color\": "           << c.color
          << ", \"fragility\": "       << c.fragility
          << "}";
        if (i + 1 < (int)g_classes.size()) f << ",";
        f << "\n";
    }
    f << "  ]";

    // ── optional recovery object ───────────────────────────────────────────
    if (recovery != nullptr) {
        f << ",\n";
        f << "  \"recovery\": {\n";
        f << "    \"success\": "        << (recovery->success ? "true" : "false") << ",\n";
        f << "    \"affectedCount\": "  << recovery->affectedCount  << ",\n";
        f << "    \"reassignedCount\": "<< recovery->reassignedCount<< ",\n";
        f << "    \"log\": \""          << escJson(recovery->log)   << "\",\n";
        f << "    \"changes\": [\n";
        for (int i = 0; i < (int)recovery->changes.size(); i++) {
            int cid    = recovery->changes[i].first;
            int newS   = recovery->changes[i].second.first;
            int newR   = recovery->changes[i].second.second;
            f << "      {\"classId\": " << cid
              << ", \"newSlot\": "       << newS
              << ", \"newRoom\": "       << newR << "}";
            if (i + 1 < (int)recovery->changes.size()) f << ",";
            f << "\n";
        }
        f << "    ]\n";
        f << "  }";
    }

    f << "\n}\n";
    f.close();
    std::cout << "[JSON] Written to: " << filepath << "\n";
}
