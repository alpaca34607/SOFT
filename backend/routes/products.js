const express = require('express');
const { query, get, run } = require('../database');

const router = express.Router();

// 取得所有商品
router.get('/', async (req, res) => {
    try {
        const products = await query('SELECT * FROM products ORDER BY created_at DESC');
        res.json({ products });
    } catch (error) {
        console.error('取得商品失敗:', error);
        res.status(500).json({ error: '取得商品失敗', message: error.message });
    }
});

// 取得單一商品
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await get('SELECT * FROM products WHERE product_id = ?', [id]);
        
        if (!product) {
            return res.status(404).json({ error: '商品不存在' });
        }
        
        res.json({ product });
    } catch (error) {
        console.error('取得商品失敗:', error);
        res.status(500).json({ error: '取得商品失敗', message: error.message });
    }
});

// 更新商品庫存
router.patch('/:id/stock', async (req, res) => {
    try {
        const { id } = req.params;
        const { max_quantity, status } = req.body;
        
        const result = await run(
            'UPDATE products SET max_quantity = ?, status = ? WHERE product_id = ?',
            [max_quantity, status, id]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ error: '商品不存在' });
        }
        
        res.json({ success: true, message: '商品庫存更新成功' });
    } catch (error) {
        console.error('更新商品庫存失敗:', error);
        res.status(500).json({ error: '更新商品庫存失敗', message: error.message });
    }
});

// 新增商品
router.post('/', async (req, res) => {
    try {
        const { product_id, name, price, deposit, max_quantity, status } = req.body;
        
        if (!product_id || !name || price === undefined || deposit === undefined) {
            return res.status(400).json({ error: '缺少必要欄位' });
        }
        
        const result = await run(
            'INSERT INTO products (product_id, name, price, deposit, max_quantity, status) VALUES (?, ?, ?, ?, ?, ?)',
            [product_id, name, price, deposit, max_quantity || 3, status || 'available']
        );
        
        const product = await get('SELECT * FROM products WHERE id = ?', [result.id]);
        
        res.status(201).json({ success: true, product });
    } catch (error) {
        console.error('新增商品失敗:', error);
        res.status(500).json({ error: '新增商品失敗', message: error.message });
    }
});

module.exports = router; 