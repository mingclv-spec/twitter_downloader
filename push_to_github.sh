#!/usr/bin/env bash
# ========================================================
#   X-Trans: Automatic Git & Branch Push to GitHub
# ========================================================

set -e

REPO_URL="$1"

if [ -z "$REPO_URL" ]; then
  echo "Usage: ./push_to_github.sh <your-github-repo-url>"
  echo "Example: ./push_to_github.sh https://github.com/your-username/x-trans.git"
  echo ""
  read -p "Enter your GitHub repository URL: " REPO_URL
fi

if [ -z "$REPO_URL" ]; then
  echo "Error: GitHub repository URL cannot be empty."
  exit 1
fi

echo "==> Initializing Git repository..."
if [ ! -d ".git" ]; then
  git init -b main
  git config user.name "X-Trans Developer"
  git config user.email "dev@x-trans.local"
fi

echo "==> Staging all project files..."
git add .
git commit -m "feat: complete X-Trans app (keyless video downloader & WeChat exporter)" || true

echo "==> Creating 'on-premise' and 'online' branches..."
git branch -M main
git branch on-premise || true
git branch online || true

echo "==> Setting remote origin to: $REPO_URL"
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo "==> Pushing 'main' branch..."
git push -u origin main

echo "==> Pushing 'on-premise' branch..."
git push -u origin on-premise

echo "==> Pushing 'online' branch..."
git push -u origin online

echo ""
echo "========================================================"
echo "  SUCCESS! All 3 branches pushed to GitHub:"
echo "    - main"
echo "    - on-premise"
echo "    - online"
echo "  View repository at: $REPO_URL"
echo "========================================================"
