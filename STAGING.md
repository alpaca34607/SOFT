# Staging Environment - 軟筋生物預購系統

## 🌿 Staging 環境說明

這是軟筋生物預購系統的測試環境，用於：
- 功能測試和驗證
- 新功能的預覽
- 客戶演示
- 生產環境部署前的最終測試

## 🚀 部署方式

### 方案 1: Vercel (推薦)

1. **建立 Vercel 專案**
   - 專案名稱：`soft-bio-staging`
   - 分支：`staging`
   - 配置檔案：`vercel-staging.json`

2. **環境變數設定**
   ```
   NODE_ENV=staging
   ```

3. **自動部署**
   - 每次推送到 `staging` 分支時自動部署
   - 部署 URL：`https://soft-bio-staging.vercel.app`

### 方案 2: Railway

1. **建立 Railway 專案**
   - 專案名稱：`soft-bio-staging`
   - 分支：`staging`
   - 配置檔案：`railway-staging.json`

2. **環境變數設定**
   ```
   NODE_ENV=staging
   PORT=3000
   ```

### 方案 3: Render

1. **建立 Render 服務**
   - 服務名稱：`soft-bio-staging`
   - 分支：`staging`
   - 配置檔案：`render-staging.yaml`

2. **環境變數設定**
   ```
   NODE_ENV=staging
   PORT=10000
   ```

## 📊 環境差異

| 項目 | Production | Staging |
|------|------------|---------|
| 資料庫 | PostgreSQL | SQLite |
| 日誌等級 | info | debug |
| 除錯模式 | 關閉 | 開啟 |
| CORS | 限制 | 開放 |
| 快取 | 開啟 | 關閉 |

## 🔄 工作流程

### 1. 開發流程
```
feature-branch → staging → main → production
```

### 2. 部署流程
1. 開發完成後合併到 `staging` 分支
2. 自動部署到 staging 環境
3. 在 staging 環境測試
4. 測試通過後合併到 `main` 分支
5. 部署到 production 環境

### 3. 分支管理
- `main`: 生產環境分支
- `staging`: 測試環境分支
- `backend_feat_picture`: 功能開發分支
- `dev_backend`: 後端開發分支

## 🛠️ 本地開發

### 啟動 Staging 環境
```bash
# 切換到 staging 分支
git checkout staging

# 安裝依賴
cd backend && npm install

# 啟動服務
npm start
```

### 環境變數
使用 `env.staging` 檔案中的配置

## 📝 注意事項

1. **資料庫**: Staging 環境使用 SQLite，資料可能遺失
2. **安全性**: 不要在此環境使用真實的敏感資料
3. **效能**: 此環境可能比生產環境慢
4. **備份**: 定期備份 staging 環境的資料

## 🔗 相關連結

- [Production Environment](../README.md)
- [Deployment Guide](../DEPLOYMENT.md)
- [API Documentation](../backend/README.md)

## 📞 支援

如有問題，請聯繫開發團隊或建立 Issue。
