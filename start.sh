#!/usr/bin/env bash
echo "========================================================"
echo "  Starting X-Trans: Twitter Video Downloader & Translator"
echo "  Zero API Key Required - 100% Free"
echo "========================================================"
echo ""

if [ ! -d "node_modules" ]; then
    echo "[First Run] Installing dependencies, please wait..."
    npm install
fi

echo "Starting server on http://localhost:3000 ..."
npm run dev
