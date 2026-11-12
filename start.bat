@echo off
echo ========================================================
echo   Starting X-Trans: Twitter Video Downloader & Translator
echo   Zero API Key Required - 100% Free
echo ========================================================
echo.

if not exist node_modules (
    echo [First Run] Installing dependencies, please wait...
    call npm install
)

echo Starting server on http://localhost:3000 ...
call npm run dev
pause
