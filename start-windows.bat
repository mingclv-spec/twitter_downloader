@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22.13 or later is required. Install it from https://nodejs.org/
  pause
  exit /b 1
)
node -e "const [major,minor]=process.versions.node.split('.').map(Number);process.exit(major>22||(major===22&&minor>=13)?0:1)"
if errorlevel 1 (
  echo Detected an unsupported Node.js version. Please install Node.js 22.13 or later.
  pause
  exit /b 1
)

if not exist ".env" (
  if exist ".env.example" (
    copy ".env.example" ".env" >nul
    echo Created .env from .env.example.
    echo Please edit .env and add your GEMINI_API_KEY before using AI translation.
  )
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Starting X-Trans On-Premise...
echo Open http://127.0.0.1:3000 in your browser.
call npm run dev
pause
