const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { setupDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 靜態檔案服務 (開發和生產環境都啟用)
app.use(express.static(path.join(__dirname, '../')));

// 健康檢查端點 (必須在其他 API 路由之前)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: '軟筋生物預購系統 API 運行中',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API 路由
app.use('/api/orders', require('./routes/orders'));
app.use('/api/products', require('./routes/products'));
app.use('/api/customers', require('./routes/customers'));

// 生產環境：所有非 API 路由都返回前端頁面
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        // 如果是 API 路由，不處理
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ error: 'API endpoint not found' });
        }
        
        // 根據路徑返回對應的 HTML 檔案
        let htmlFile = 'index.html';
        
        // 映射路由到 HTML 檔案
        const routeMap = {
            '/checkout': 'checkout.html',
            '/admin': 'admin.html',
            '/Get-Soft': 'Get-Soft.html',
            '/product-SoftzillaOD': 'product-SoftzillaOD.html',
            '/product-Softzilla': 'product-Softzilla.html',
            '/product-Softtwice': 'product-Softtwice.html',
            '/product-Soft': 'product-Soft.html',
            '/product-Remain': 'product-Remain.html',
            '/WhatsNew': 'WhatsNew.html',
            '/Learning-Soft': 'Learning-Soft.html',
            '/Becoming-Soft': 'Becoming-Soft.html'
        };
        
        if (routeMap[req.path]) {
            htmlFile = routeMap[req.path];
        }
        
        res.sendFile(path.join(__dirname, '../', htmlFile));
    });
}

// 啟動伺服器
async function startServer() {
    try {
        await setupDatabase();
        console.log('✅ 成功連接到 SQLite 資料庫');
        console.log('🔄 初始化資料庫...');
        console.log('✅ 資料庫表格初始化完成');
        
        app.listen(PORT, () => {
            console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
            console.log(`📊 API 文檔: http://localhost:${PORT}/api/health`);
            console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🏠 網站首頁: http://localhost:${PORT}/index.html`);
            console.log(`🛒 商店頁面: http://localhost:${PORT}/Get-Soft.html`);
            console.log(`📋 管理後台: http://localhost:${PORT}/admin.html`);
        });
    } catch (error) {
        console.error('❌ 伺服器啟動失敗:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app; 