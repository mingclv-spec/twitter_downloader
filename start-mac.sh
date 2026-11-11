#!/bin/bash
set -e

# Start X-Trans locally on macOS.
cd "$(dirname "$0")"

echo "========================================"
echo " X-Trans — On-Premise for macOS"
echo "========================================"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 22 or later is required."
  echo "Install it from https://nodejs.org/en/download"
  echo "Apple Silicon users should choose the macOS ARM64 installer."
  read -r -p "Press Enter to close..."
  exit 1
fi

NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "Detected Node.js $(node --version). Please install Node.js 22 or later."
  read -r -p "Press Enter to close..."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm was not found. Reinstall Node.js from https://nodejs.org/"
  read -r -p "Press Enter to close..."
  exit 1
fi

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
  echo "Created .env. Add your GEMINI_API_KEY to enable live translation."
fi

if [ ! -d "node_modules" ]; then
  echo "Installing application dependencies..."
  npm install
fi

echo ""
echo "Starting X-Trans..."
echo "Open http://127.0.0.1:3000 in your browser."
echo "Keep this Terminal window open while using X-Trans."
echo "Press Control+C to stop the application."
echo ""

npm run dev
