@echo off
REM ============================
REM Optimierte Installation für Tutorix
REM ============================

REM ----------------------------
REM 1. Adminrechte prüfen
REM ----------------------------
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Adminrechte erforderlich. Starte Script erneut mit Adminrechten...
    powershell -Command "Start-Process '%~0' -Verb runAs"
    exit
)

REM ----------------------------
REM 2. In Bot-Ordner wechseln
REM ----------------------------
cd /d "%~dp0\..\Tutorix\Tutorix-bot\Bot"

echo.
echo ============================
echo Ueberpruefe Abhaengigkeiten...
echo ============================

REM ----------------------------
REM 3. Node.js prüfen/installieren
REM ----------------------------
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js wird installiert...
    winget install OpenJS.NodeJS.LTS -e --source winget
) else (
    echo Node.js bereits installiert
)

REM ----------------------------
REM 4. Git prüfen/installieren
REM ----------------------------
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Git wird installiert...
    winget install Git.Git -e --source winget
) else (
    echo Git bereits installiert
)

REM ----------------------------
REM 5. Ollama prüfen/installieren
REM ----------------------------
where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo Ollama wird installiert...
    winget install Ollama.Ollama -e --source winget
) else (
    echo Ollama bereits installiert
)

REM ----------------------------
REM 6. Kurze Pause, damit PATH aktualisiert wird
REM ----------------------------
echo Warte kurz, PATH wird aktualisiert...
timeout /t 10 >nul

REM ----------------------------
REM 7. Node-Abhängigkeiten installieren
REM ----------------------------
if exist "package.json" (
    echo Installiere Node-Abhängigkeiten...
    npm install
)

REM ----------------------------
REM 8. LLM Modell llama3.2:latest laden
REM ----------------------------
echo Lade LLM Modell llama3.2:latest...
ollama pull llama3.2:latest

echo.
echo ============================
echo Installation abgeschlossen!
echo ============================
pause