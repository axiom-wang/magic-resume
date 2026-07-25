@echo off
cd /d "%~dp0"

where pnpm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] pnpm not found. Please install Node.js / pnpm first.
  pause
  exit /b 1
)

if not exist "node_modules\vite\bin\vite.js" (
  echo [INFO] Dependencies missing or broken. Running pnpm install...
  call pnpm install
  if errorlevel 1 (
    echo [ERROR] pnpm install failed.
    pause
    exit /b 1
  )
)

netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
  echo [INFO] Already running on port 3000, opening browser...
  start "" "http://localhost:3000"
  exit /b 0
)

echo [INFO] Starting Magic Resume...
start "Magic Resume" cmd /k "cd /d ""%~dp0"" && pnpm dev"

echo [INFO] Waiting for server...
set /a count=0
:wait_loop
timeout /t 2 /nobreak >nul
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 goto open_browser
set /a count+=1
if %count% geq 30 (
  echo [ERROR] Server did not start within 60 seconds.
  echo Check the "Magic Resume" window for errors.
  pause
  exit /b 1
)
goto wait_loop

:open_browser
echo [INFO] Server ready, opening browser...
start "" "http://localhost:3000"
exit /b 0
