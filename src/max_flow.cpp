#include "max_flow.h"
#include <queue>
#include <vector>
#include <climits>
#include <algorithm>

// DAA Topic: Maximum Flow — Edmonds-Karp (BFS-based Ford-Fulkerson)
// Time Complexity: O(V * E^2)

FlowNetwork::FlowNetwork(int _n)
    : n(_n),
      cap(_n, std::vector<int>(_n, 0)),
      adj(_n)
{}

void FlowNetwork::addEdge(int u, int v, int c) {
    // If edge already exists, just increase capacity
    if (cap[u][v] == 0) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    cap[u][v] += c;
}

// BFS to find augmenting path from s to t.
// Fills parent[] and returns bottleneck flow, or 0 if no path.
int FlowNetwork::bfsPath(int s, int t, std::vector<int>& parent) {
    std::fill(parent.begin(), parent.end(), -1);
    parent[s] = s;

    // queue of (node, flow_so_far)
    std::queue<std::pair<int, int>> q;
    q.push(std::make_pair(s, INT_MAX));

    while (!q.empty()) {
        int cur  = q.front().first;
        int flow = q.front().second;
        q.pop();

        for (int nb : adj[cur]) {
            if (parent[nb] == -1 && cap[cur][nb] > 0) {
                parent[nb]   = cur;
                int newFlow  = std::min(flow, cap[cur][nb]);
                if (nb == t) return newFlow;
                q.push(std::make_pair(nb, newFlow));
            }
        }
    }
    return 0;  // no augmenting path
}

int FlowNetwork::maxFlow(int s, int t) {
    int totalFlow = 0;
    std::vector<int> parent(n);

    int pushed;
    while ((pushed = bfsPath(s, t, parent)) > 0) {
        totalFlow += pushed;
        // Update residual capacities along the path
        int cur = t;
        while (cur != s) {
            int prev = parent[cur];
            cap[prev][cur] -= pushed;
            cap[cur][prev] += pushed;
            cur = prev;
        }
    }
    return totalFlow;
}
