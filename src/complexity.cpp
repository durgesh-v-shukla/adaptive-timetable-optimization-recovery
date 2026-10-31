#include "complexity.h"
#include <iostream>
#include <iomanip>
#include <string>

// Prints a formatted table of all DAA topics used in the project
// along with their time and space complexities.

void printComplexity() {
    using std::cout;
    using std::setw;
    using std::left;
    using std::string;

    const int W1 = 30, W2 = 26, W3 = 20, W4 = 18;
    string line(W1 + W2 + W3 + W4 + 5, '-');

    cout << "\n" << line << "\n";
    cout << left
         << setw(W1) << "  Algorithm / Module"
         << setw(W2) << "DAA Topic"
         << setw(W3) << "Time Complexity"
         << setw(W4) << "Space Complexity"
         << "\n";
    cout << line << "\n";

    struct Row { string algo, topic, time, space; };
    Row rows[] = {
        {"  buildConflictGraph",     "Graph (Adj. List)",       "O(n^2)",          "O(n + E)"},
        {"  isValidAssignment",      "Graph Traversal",         "O(deg(v))",       "O(1)"},
        {"  greedyColor",            "Greedy + Graph Coloring", "O(n * S * R)",    "O(n)"},
        {"  backtrackColor",         "Backtracking",            "O(n! * S * R)",   "O(n)"},
        {"  generateTimetable",      "Orchestration",           "O(n * S * R)",    "O(n + E)"},
        {"  analyzeFragility",       "Brute-force Counting",    "O(n * S * R)",    "O(1)"},
        {"  bfsAffected",            "BFS on Graph",            "O(V + E)",        "O(V)"},
        {"  dfsAffected",            "DFS on Graph",            "O(V + E)",        "O(V)"},
        {"  FlowNetwork::maxFlow",   "Edmonds-Karp Max Flow",   "O(V * E^2)",      "O(V^2)"},
        {"  recoverTimetable",       "Bipartite Matching",      "O(V * E^2)",      "O(V + E)"},
    };

    for (const Row& r : rows) {
        cout << left
             << setw(W1) << r.algo
             << setw(W2) << r.topic
             << setw(W3) << r.time
             << setw(W4) << r.space
             << "\n";
    }
    cout << line << "\n";
    cout << "  n = classes, S = time slots, R = rooms, V = vertices, E = edges\n";
    cout << "  NP-Note: Optimal graph k-coloring is NP-Complete;\n";
    cout << "           greedy gives a polynomial-time approximation.\n";
    cout << line << "\n\n";
}
