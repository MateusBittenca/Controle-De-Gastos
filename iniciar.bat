@echo off
REM Se aparecer erro 'cho' ou 'tart', salve este arquivo no Bloco de Notas como "ANSI" (Arquivo > Salvar como > Codificacao: ANSI)
chcp 65001 >nul
title Iniciar - Controle de Gastos

echo.
echo  Iniciando Backend e Frontend...
echo.

start "Backend - API 8000" cmd /k "cd /d "%~dp0backend" && (if exist venv\Scripts\activate.bat call venv\Scripts\activate.bat) && uvicorn app.main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

start "Frontend - React 5173" cmd /k "cd /d "%~dp0frontend\gastos" && npm run dev"

echo.
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:5173
echo.
echo  Feche as janelas para encerrar.
echo.
pause
