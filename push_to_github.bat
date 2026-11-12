@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   X-Trans: 1-Click Push to GitHub (main, on-premise, online)
echo ========================================================
echo.

set REPO_URL=%1
if "%REPO_URL%"=="" (
    set /p REPO_URL="Enter your GitHub repository URL (e.g. https://github.com/username/x-trans.git): "
)

if "%REPO_URL%"=="" (
    echo Error: GitHub repository URL cannot be empty.
    pause
    exit /b 1
)

echo.
echo [1/5] Initializing local Git repository...
if not exist ".git" (
    git init -b main
    git config user.name "X-Trans Developer"
    git config user.email "dev@x-trans.local"
)

echo [2/5] Committing project files...
git add .
git commit -m "feat: complete X-Trans app (keyless video downloader & WeChat exporter)"

echo [3/5] Creating 'on-premise' and 'online' branches...
git branch -M main
git branch on-premise 2>nul
git branch online 2>nul

echo [4/5] Connecting to remote GitHub repository...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo [5/5] Pushing all 3 branches to GitHub...
echo Pushing main...
git push -u origin main
echo Pushing on-premise...
git push -u origin on-premise
echo Pushing online...
git push -u origin online

echo.
echo ========================================================
echo   SUCCESS! All 3 branches pushed to GitHub:
echo     - main
echo     - on-premise
echo     - online
echo ========================================================
pause
