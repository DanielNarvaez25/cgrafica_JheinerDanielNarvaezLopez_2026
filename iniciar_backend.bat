@echo off
chcp 65001 >nul

cd /d "%~dp0backend"

set "PY="

where python >nul 2>&1
if %errorlevel%==0 (
    set "PY=python"
)

if not defined PY (
    where py >nul 2>&1
    if %errorlevel%==0 (
        set "PY=py -3"
    )
)

if not defined PY (
    echo No se encontró Python.
    echo Instale Python 3 desde python.org y marque "Add python.exe to PATH".
    pause
    exit /b 1
)

if not exist venv (
    %PY% -m venv venv
)

call venv\Scripts\activate

pip install -r requirements.txt

if not exist .env (
    copy .env.example .env >nul
    echo Se creó backend\.env: escriba su contraseña de MySQL en DB_PASSWORD y déjela vacía si usa XAMPP, cambie JWT_SECRET, guarde y cierre el Bloc de notas
    start /wait notepad .env
    pause
)

uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

pause