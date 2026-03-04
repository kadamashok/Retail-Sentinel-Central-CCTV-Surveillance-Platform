@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\health-check.ps1" %*
