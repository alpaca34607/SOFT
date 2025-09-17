# 🔧 API 環境切換工具使用說明

## 概述
這個工具讓您可以在本地開發時測試不同環境的 API，無需重新部署。

## 功能特色
- 🎯 **一鍵切換**：在本地環境中快速切換 API 端點
- 🔄 **即時生效**：切換後自動重新載入頁面
- 💾 **持久化設定**：使用 localStorage 記住您的選擇
- 🎨 **視覺化界面**：右上角顯示當前環境狀態

## 使用方法

### 1. 啟動本地服務
```bash
# 在 backend 目錄下
npm start
```

### 2. 開啟瀏覽器
訪問 `http://localhost:3000` 或任何本地頁面

### 3. 使用環境切換器
在頁面右上角會看到環境切換器，包含：
- **local**: 本地開發環境 (http://localhost:3000)
- **railway**: Railway 測試環境 (https://soft-bio-backend-staging.up.railway.app)
- **vercel**: Vercel 正式環境 (需要設定實際網址)
- **清除**: 恢復自動檢測

### 4. 切換環境
1. 點擊對應的環境按鈕
2. 系統會顯示切換通知
3. 頁面自動重新載入
4. 所有 API 請求將使用新環境

## 程式化使用

### JavaScript API
```javascript
// 切換到 Railway 環境
API.setEnvironment('railway');

// 切換到本地環境
API.setEnvironment('local');

// 清除手動設定，恢復自動檢測
API.clearEnvironment();

// 獲取當前環境資訊
const envInfo = API.getEnvironmentInfo();
console.log(envInfo);
```

### 環境資訊結構
```javascript
{
  manual: 'railway',           // 手動設定的環境
  current: 'https://...',      // 當前使用的 API URL
  available: {                 // 可用的環境配置
    local: 'http://localhost:3000',
    railway: 'https://soft-bio-backend-staging.up.railway.app',
    vercel: 'https://your-vercel-domain.vercel.app'
  }
}
```

## 配置自訂環境

### 修改環境配置
編輯 `js/api.js` 中的 `ENV_CONFIG` 物件：

```javascript
const ENV_CONFIG = {
  local: "http://localhost:3000",
  railway: "https://soft-bio-backend-staging.up.railway.app",
  vercel: "https://your-vercel-domain.vercel.app",
  // 新增自訂環境
  custom: "https://your-custom-api.com"
};
```

### 更新 Vercel 網址
將 `vercel: "https://your-vercel-domain.vercel.app"` 替換為您的實際 Vercel 部署網址。

## 故障排除

### 1. 環境切換器沒有顯示
- 確認您在本地環境 (localhost 或 127.0.0.1)
- 檢查瀏覽器控制台是否有錯誤
- 確認 `js/env-switcher.js` 已正確載入

### 2. API 請求失敗
- 檢查目標環境是否正常運行
- 確認網路連接
- 查看瀏覽器開發者工具的 Network 標籤

### 3. 環境設定沒有保存
- 確認瀏覽器支援 localStorage
- 檢查瀏覽器是否禁用了本地儲存

## 技術細節

### 自動檢測邏輯
1. 檢查 localStorage 中的手動設定
2. 如果沒有手動設定，根據 hostname 自動檢測：
   - `localhost` 或 `127.0.0.1` → local
   - 包含 `railway.app` → Railway 環境
   - 包含 `vercel.app` → Vercel 環境
   - 其他 → 使用相對路徑

### 資料持久化
- 使用 `localStorage.setItem('API_ENVIRONMENT', env)` 保存設定
- 頁面重新載入後會自動讀取設定
- 使用 `localStorage.removeItem('API_ENVIRONMENT')` 清除設定

## 注意事項
- 環境切換器只在本地環境顯示
- 切換環境後會自動重新載入頁面
- 設定會保存在瀏覽器的 localStorage 中
- 清除瀏覽器資料會重置環境設定
