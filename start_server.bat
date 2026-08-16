@echo off
chcp 65001 >nul
title Game Server
echo Starting game server...
echo.
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8080
pause
