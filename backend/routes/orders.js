const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query, get, run } = require('../database');

const router = express.Router();

// 建立新訂單
router.post('/', async (req, res) => {
    try {
        const {
            customerInfo,
            items,
            pickupMethod,
            paymentMethod,
            note
        } = req.body;

        // 驗證必要欄位
        if (!customerInfo || !items || !pickupMethod || !paymentMethod) {
            return res.status(400).json({ error: '缺少必要欄位' });
        }

        // 檢查客戶是否存在，不存在則建立
        let customer = await get('SELECT * FROM customers WHERE phone = ?', [customerInfo.phone]);
        
        if (!customer) {
            const customerResult = await run(
                'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)',
                [customerInfo.name, customerInfo.phone, customerInfo.email]
            );
            customer = { id: customerResult.id };
        }

        // 計算總金額
        const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const depositAmount = items.reduce((sum, item) => sum + item.totalDeposit, 0);

        // 建立訂單
        const orderNumber = `SOFT${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        
        const orderResult = await run(
            `INSERT INTO orders (order_number, customer_id, total_amount, deposit_amount, 
             pickup_method, payment_method, note) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [orderNumber, customer.id, totalAmount, depositAmount, pickupMethod, paymentMethod, note]
        );

        // 建立訂單明細
        for (const item of items) {
            await run(
                `INSERT INTO order_items (order_id, product_id, product_name, main_color, 
                 main_color_name, sub_color, sub_color_name, quantity, unit_price, 
                 unit_deposit, total_price, total_deposit) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    orderResult.id,
                    item.productId,
                    item.productName,
                    item.mainColor,
                    item.mainColorName,
                    item.subColor,
                    item.subColorName,
                    item.quantity,
                    item.unitPrice,
                    item.unitDeposit,
                    item.totalPrice,
                    item.totalDeposit
                ]
            );
        }

        // 取得完整訂單資訊
        const order = await get(
            `SELECT o.*, c.name as customer_name, c.phone, c.email 
             FROM orders o 
             JOIN customers c ON o.customer_id = c.id 
             WHERE o.id = ?`,
            [orderResult.id]
        );

        const orderItems = await query(
            'SELECT * FROM order_items WHERE order_id = ?',
            [orderResult.id]
        );

        res.status(201).json({
            success: true,
            message: '訂單建立成功',
            order: {
                ...order,
                items: orderItems
            }
        });

    } catch (error) {
        console.error('建立訂單失敗:', error);
        res.status(500).json({ error: '建立訂單失敗', message: error.message });
    }
});

// 取得所有訂單
router.get('/', async (req, res) => {
    try {
        const { status, phone, limit = 50, offset = 0 } = req.query;
        
        let sql = `
            SELECT o.*, c.name as customer_name, c.phone, c.email 
            FROM orders o 
            JOIN customers c ON o.customer_id = c.id
        `;
        const params = [];

        // 篩選條件
        const conditions = [];
        if (status) {
            conditions.push('o.status = ?');
            params.push(status);
        }
        if (phone) {
            conditions.push('c.phone LIKE ?');
            params.push(`%${phone}%`);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const orders = await query(sql, params);

        // 取得每個訂單的明細
        for (const order of orders) {
            order.items = await query(
                'SELECT * FROM order_items WHERE order_id = ?',
                [order.id]
            );
        }

        res.json({ orders });

    } catch (error) {
        console.error('取得訂單失敗:', error);
        res.status(500).json({ error: '取得訂單失敗', message: error.message });
    }
});

// 取得單一訂單
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const order = await get(
            `SELECT o.*, c.name as customer_name, c.phone, c.email 
             FROM orders o 
             JOIN customers c ON o.customer_id = c.id 
             WHERE o.id = ?`,
            [id]
        );

        if (!order) {
            return res.status(404).json({ error: '訂單不存在' });
        }

        const items = await query(
            'SELECT * FROM order_items WHERE order_id = ?',
            [id]
        );

        res.json({ order: { ...order, items } });

    } catch (error) {
        console.error('取得訂單失敗:', error);
        res.status(500).json({ error: '取得訂單失敗', message: error.message });
    }
});

// 更新訂單狀態
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: '缺少狀態參數' });
        }

        const result = await run(
            'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: '訂單不存在' });
        }

        res.json({ success: true, message: '訂單狀態更新成功' });

    } catch (error) {
        console.error('更新訂單狀態失敗:', error);
        res.status(500).json({ error: '更新訂單狀態失敗', message: error.message });
    }
});

// 根據電話號碼查詢訂單
router.get('/search/phone/:phone', async (req, res) => {
    try {
        const { phone } = req.params;

        const orders = await query(
            `SELECT o.*, c.name as customer_name, c.phone, c.email 
             FROM orders o 
             JOIN customers c ON o.customer_id = c.id 
             WHERE c.phone = ?
             ORDER BY o.created_at DESC`,
            [phone]
        );

        // 取得每個訂單的明細
        for (const order of orders) {
            order.items = await query(
                'SELECT * FROM order_items WHERE order_id = ?',
                [order.id]
            );
        }

        res.json({ orders });

    } catch (error) {
        console.error('查詢訂單失敗:', error);
        res.status(500).json({ error: '查詢訂單失敗', message: error.message });
    }
});

module.exports = router; 