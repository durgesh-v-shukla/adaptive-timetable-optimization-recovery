@echo off
title Adaptive Timetable Optimization Framework
color 0A

echo.
echo  ====================================================
echo   Adaptive Timetable Optimization ^& Recovery System
echo   DAA Final Project
echo  ====================================================
echo.

REM ─── Check g++ ───
where g++ >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] g++ not found. Please install MinGW and add it to PATH.
    echo          Download: https://winlibs.com/
    pause
    exit /b 1
)

REM ─── Create folders ───
if not exist build   mkdir build
if not exist output  mkdir output

REM ─── Choose disruption ───
set DTYPE=room
set DID=0

if not "%~1"=="" set DTYPE=%~1
if not "%~2"=="" set DID=%~2

echo  Disruption type : %DTYPE%
echo  Disruption ID   : %DID%
echo.

REM ─── Compile ───
echo  [1/3] Compiling...
g++ -std=c++14 -O2 -Isrc -o build\timetable.exe ^
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
    src\main.cpp

if errorlevel 1 (
    echo.
    echo  [ERROR] Compilation failed. See errors above.
    pause
    exit /b 1
)
echo         Compiled successfully.
echo.

REM ─── Run ───
echo  [2/3] Running engine...
echo  ─────────────────────────────────────────────────
build\timetable.exe %DTYPE% %DID%
echo  ─────────────────────────────────────────────────
echo.

REM ─── Open browser ───
echo  [3/3] Opening frontend...
if exist frontend\index.html (
    start "" frontend\index.html
    echo         Frontend opened in browser.
) else (
    echo  [WARN] frontend\index.html not found.
)
echo.
echo  Done! Press any key to exit.
pause >nul

