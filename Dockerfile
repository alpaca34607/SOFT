# 使用官方 Node.js 18 映像
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY backend/package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製所有檔案
COPY . .

# 建立必要的目錄
RUN mkdir -p images/products logs

# 確保圖片目錄存在且有正確權限
RUN chmod -R 755 images/

# 設定啟動腳本權限
RUN chmod +x start.sh

# 設定環境變數
ENV NODE_ENV=staging
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 啟動應用程式
CMD ["./start.sh"]
