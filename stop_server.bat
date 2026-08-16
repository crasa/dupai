@echo off
chcp 65001 >nul
title Stop Game Server
echo Stopping game server...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    echo Terminating process PID: %%a
    taskkill /F /PID %%a >nul 2>&1
    echo Process %%a terminated.
)

echo.
echo Server stopped!
echo.
pause
