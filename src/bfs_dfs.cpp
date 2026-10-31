#include "data_model.h"
#include "bfs_dfs.h"
#include <queue>
#include <stack>

// DAA Topic: BFS / DFS on Conflict Graph
// Both functions traverse the conflict-graph neighbourhood of startClassId
// to identify the set of classes potentially affected by a disruption.
// Time Complexity: O(V + E)

// BFS — level-order traversal using a std::queue
std::vector<int> bfsAffected(int startClassId) {
    int n = (int)g_adjList.size();
    vector<bool> visited(n, false);
    vector<int>  result;

    queue<int> q;
    q.push(startClassId);
    visited[startClassId] = true;

    while (!q.empty()) {
        int cur = q.front();
        q.pop();
        result.push_back(cur);

        for (int nb : g_adjList[cur]) {
            if (!visited[nb]) {
                visited[nb] = true;
                q.push(nb);
            }
        }
    }
    return result;
}

// DFS — iterative traversal using a std::stack
std::vector<int> dfsAffected(int startClassId) {
    int n = (int)g_adjList.size();
    vector<bool> visited(n, false);
    vector<int>  result;

    stack<int> stk;
    stk.push(startClassId);

    while (!stk.empty()) {
        int cur = stk.top();
        stk.pop();

        if (visited[cur]) continue;
        visited[cur] = true;
        result.push_back(cur);

        for (int nb : g_adjList[cur]) {
            if (!visited[nb]) {
                stk.push(nb);
            }
        }
    }
    return result;
}
