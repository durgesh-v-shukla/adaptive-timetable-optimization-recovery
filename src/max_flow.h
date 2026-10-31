#pragma once
#include <vector>
// Maximum Flow — Edmonds-Karp (BFS-based Ford-Fulkerson)
// O(V * E^2)
struct FlowNetwork {
    int n;
    std::vector<std::vector<int>> cap;
    std::vector<std::vector<int>> adj;

    explicit FlowNetwork(int n);
    void addEdge(int u, int v, int c);
    int  bfsPath(int s, int t, std::vector<int>& parent);
    int  maxFlow(int s, int t);
};
