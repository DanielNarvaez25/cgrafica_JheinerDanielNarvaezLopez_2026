@echo off

cd /d "%~dp0frontend"

where node >nul 2>&1
if errorlevel 1 (
    echo No se encontró Node.js.
    echo Instale Node.js 22 LTS.
    pause
    exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    echo No se encontró npm.
    echo Instale Node.js 22 LTS.
    pause
    exit /b 1
)

if not exist node_modules (
    call npm install
)

call npm start

pause