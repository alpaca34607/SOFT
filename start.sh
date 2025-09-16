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

# 檢查圖片檔案
echo "🔍 檢查圖片檔案..."
if [ -d "images/products" ]; then
  echo "  - images/products 目錄存在"
  ls -la images/products/ | head -5
else
  echo "  - images/products 目錄不存在"
fi

if [ -d "images/shop" ]; then
  echo "  - images/shop 目錄存在"
  ls -la images/shop/ | head -5
else
  echo "  - images/shop 目錄不存在"
fi

# 如果是測試環境，執行圖片遷移
if [ "$NODE_ENV" = "staging" ]; then
  echo "🔄 執行測試環境圖片遷移..."
  node backend/migrate-staging-images.js
fi

# 啟動應用程式
echo "🏃 啟動後端服務..."
node backend/server.js
