#pragma once
#include <string>
#include "recovery.h"
void writeJSON(const std::string& filepath, const RecoveryResult* recovery = nullptr);
