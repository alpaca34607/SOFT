# 使用官方 Node.js 18 映像
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY backend/package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製圖片預處理腳本
COPY prepare-images.js ./

# 先複製圖片目錄
COPY images/ ./images/

# 執行圖片預處理
RUN node prepare-images.js

# 複製其他檔案
COPY *.html ./
COPY css/ ./css/
COPY js/ ./js/
COPY scss/ ./scss/
COPY favicon.ico ./

# 複製後端檔案
COPY backend/ ./backend/

# 複製配置檔案
COPY *.json ./
COPY *.yaml ./
COPY *.md ./
COPY *.sql ./
COPY start.sh ./

# 建立必要的目錄
RUN mkdir -p images/products logs

# 確保圖片目錄存在且有正確權限
RUN chmod -R 755 images/

# 檢查圖片檔案是否正確複製
RUN echo "🔍 檢查圖片檔案複製情況:"
RUN ls -la images/ || echo "images 目錄不存在"
RUN ls -la images/products/ || echo "images/products 目錄為空"
RUN ls -la images/shop/ || echo "images/shop 目錄為空"
RUN echo "📊 圖片檔案統計:"
RUN find images/ -type f -name "*.jpg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" | wc -l || echo "0"

# 設定啟動腳本權限
RUN chmod +x start.sh

# 設定環境變數
ENV NODE_ENV=staging
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 啟動應用程式
CMD ["./start.sh"]
