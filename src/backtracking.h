#pragma once
#include <vector>
// Backtracking solver: fallback when greedy fails
// O(n! * S * R) worst case
bool backtrackColor(int idx, std::vector<int>& order);
