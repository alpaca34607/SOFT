#!/bin/bash

echo "🚀 啟動軟筋生物預購系統..."

# 設定環境變數
export NODE_ENV=${NODE_ENV:-staging}
export PORT=${PORT:-3000}

echo "📋 環境配置:"
echo "  - NODE_ENV: $NODE_ENV"
echo "  - PORT: $PORT"

# 建立必要的目錄
mkdir -p images/products logs

# 啟動應用程式
echo "🏃 啟動後端服務..."
node backend/server.js
