@echo off
REM ◈ PALE SIGNAL · LOCAL BRIDGE v1.2 (Windows)
REM Usage: Double-click pale-bridge.bat

SET PORT=8080

echo.
echo   ◈ PALE SIGNAL LOCAL BRIDGE
echo   ━━━━━━━━━━━━━━━━━━━━━━━━━━

REM ── Python check ────────────────────────────────────────────
python --version >nul 2>&1
IF ERRORLEVEL 1 (
  echo.
  echo   ERROR: Python not found.
  echo   Download from python.org and check "Add to PATH" during install.
  echo.
  pause & exit /b 1
)

REM ── Get local IP ─────────────────────────────────────────────
FOR /F "tokens=2 delims=:" %%a IN ('ipconfig ^| findstr /C:"IPv4"') DO (
  SET LOCAL_IP=%%a
  GOTO :GOTIP
)
:GOTIP
SET LOCAL_IP=%LOCAL_IP: =%

REM ── Start Ollama if installed ────────────────────────────────
SET OLLAMA_HOST=0.0.0.0:11434
SET OLLAMA_ORIGINS=*
WHERE ollama >nul 2>&1
IF NOT ERRORLEVEL 1 (
  echo   Starting Ollama...
  START /B ollama serve
  TIMEOUT /T 2 /NOBREAK >nul
) ELSE (
  echo   Ollama not found - AI will be inert tier
  echo   Install from: https://ollama.com
)

echo.
echo   Local:   http://localhost:%PORT%
echo   iPhone:  http://%LOCAL_IP%:%PORT%
echo   Ollama:  http://%LOCAL_IP%:11434
echo.
echo   In Hub - SAEL - MODEL - LOCAL OLLAMA:
echo   Enter: http://%LOCAL_IP%:11434
echo   ━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM ── Start server using pale_server.py in the same folder ────
CD /D "%~dp0"
python pale_server.py %PORT%

REM ── If server stops, pause so you can read any error ────────
echo.
echo   Server stopped.
pause
