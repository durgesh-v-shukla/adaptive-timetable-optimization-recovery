#pragma once
// Graph Representation: adjacency list conflict graph
// O(n^2) build | O(V+E) space
void buildConflictGraph();
bool isValidAssignment(int classId, int slotId, int roomId);
