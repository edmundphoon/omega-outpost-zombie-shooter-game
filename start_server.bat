@echo off
title Outpost Omega - Localhost Defense Server
echo =======================================================================
echo  Starting Outpost Omega Localhost Server...
echo =======================================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" %*
pause
