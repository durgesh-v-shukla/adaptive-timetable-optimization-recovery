#pragma once
#include <vector>
// BFS and DFS on the conflict graph
// O(V + E)
std::vector<int> bfsAffected(int startClassId);
std::vector<int> dfsAffected(int startClassId);
