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

# 設定環境變數
ENV NODE_ENV=staging
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 啟動應用程式
CMD ["node", "backend/server.js"]
