@echo off
title Adaptive Timetable Framework

echo.
echo  =========================================
echo   Adaptive Timetable Optimization ^& Recovery
echo  =========================================
echo.

:: ── Step 1: Compile ─────────────────────────────────────────────────
echo [1/3] Compiling C++ backend...
g++ -std=c++14 -O2 -Isrc ^
    src\data_init.cpp ^
    src\conflict_graph.cpp ^
    src\greedy_coloring.cpp ^
    src\backtracking.cpp ^
    src\timetable_gen.cpp ^
    src\fragility.cpp ^
    src\bfs_dfs.cpp ^
    src\max_flow.cpp ^
    src\recovery.cpp ^
    src\json_writer.cpp ^
    src\complexity.cpp ^
    src\main.cpp ^
    -o build\timetable.exe

if errorlevel 1 (
    echo  [ERROR] Compilation failed. Check g++ is in PATH.
    pause
    exit /b 1
)
echo  Compiled successfully.
echo.

:: ── Step 2: Run backend (room 0 disruption demo) ─────────────────────
echo [2/3] Running timetable engine...
build\timetable.exe room 0
echo.

:: ── Step 3: Start server and open browser ────────────────────────────
echo [3/3] Starting web server at http://localhost:3000 ...
start "" http://localhost:3000
node server.js
