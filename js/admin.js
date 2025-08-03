// 管理後台功能

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    loadDashboard();
});

// 初始化導航
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.dataset.section;
            
            // 更新按鈕狀態
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 顯示對應內容
            contentSections.forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(targetSection).style.display = 'block';
            
            // 載入對應資料
            switch(targetSection) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'orders':
                    loadOrders();
                    break;
                case 'products':
                    loadProducts();
                    break;
                case 'customers':
                    loadCustomers();
                    break;
            }
        });
    });
}

// 載入儀表板
async function loadDashboard() {
    try {
        const isAPIHealthy = await checkAPIHealth();
        if (!isAPIHealthy) {
            showError('無法連接到伺服器');
            return;
        }
        
        // 載入統計資料
        const [ordersData, customersData] = await Promise.all([
            API.getOrders({ limit: 1000 }),
            API.getCustomers({ limit: 1000 })
        ]);
        
        updateDashboardStats(ordersData.orders, customersData.customers);
        updateRecentOrders(ordersData.orders.slice(0, 5));
        
    } catch (error) {
        handleAPIError(error, '載入儀表板失敗');
    }
}

// 更新儀表板統計
function updateDashboardStats(orders, customers) {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const totalCustomers = customers.length;
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString();
    document.getElementById('totalCustomers').textContent = totalCustomers;
}

// 更新最近訂單
function updateRecentOrders(orders) {
    const container = document.getElementById('recentOrders');
    
    if (orders.length === 0) {
        container.innerHTML = '<h3>最近訂單</h3><p>尚無訂單</p>';
        return;
    }
    
    const ordersHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <strong>訂單編號: ${order.order_number}</strong><br>
                    <small>客戶: ${order.customer_name} (${order.phone})</small><br>
                    <small>建立時間: ${new Date(order.created_at).toLocaleString()}</small>
                </div>
                <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
            </div>
            <div class="order-details">
                <p><strong>總金額: NT$ ${order.total_amount.toLocaleString()}</strong></p>
                <p>訂金: NT$ ${order.deposit_amount.toLocaleString()}</p>
                <p>取貨方式: ${getPickupMethodText(order.pickup_method)}</p>
                <p>付款方式: ${getPaymentMethodText(order.payment_method)}</p>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = `<h3>最近訂單</h3>${ordersHTML}`;
}

// 載入訂單列表
async function loadOrders() {
    const container = document.getElementById('ordersList');
    container.innerHTML = '<div class="loading">載入中...</div>';
    
    try {
        const statusFilter = document.getElementById('statusFilter').value;
        const phoneFilter = document.getElementById('phoneFilter').value;
        
        const params = {};
        if (statusFilter) params.status = statusFilter;
        if (phoneFilter) params.phone = phoneFilter;
        
        const data = await API.getOrders(params);
        displayOrders(data.orders);
        
    } catch (error) {
        handleAPIError(error, '載入訂單失敗');
        container.innerHTML = '<div class="error">載入訂單失敗</div>';
    }
}

// 顯示訂單列表
function displayOrders(orders) {
    const container = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        container.innerHTML = '<p>沒有找到訂單</p>';
        return;
    }
    
    const ordersHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <strong>訂單編號: ${order.order_number}</strong><br>
                    <small>客戶: ${order.customer_name} (${order.phone})</small><br>
                    <small>建立時間: ${new Date(order.created_at).toLocaleString()}</small>
                </div>
                <div>
                    <select class="status-select" onchange="updateOrderStatus(${order.id}, this.value)">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>待處理</option>
                        <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>已確認</option>
                        <option value="paid" ${order.status === 'paid' ? 'selected' : ''}>已付款</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>已出貨</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>已完成</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>已取消</option>
                    </select>
                </div>
            </div>
            <div class="order-details">
                <p><strong>總金額: NT$ ${order.total_amount.toLocaleString()}</strong></p>
                <p>訂金: NT$ ${order.deposit_amount.toLocaleString()}</p>
                <p>取貨方式: ${getPickupMethodText(order.pickup_method)}</p>
                <p>付款方式: ${getPaymentMethodText(order.payment_method)}</p>
                ${order.note ? `<p>備註: ${order.note}</p>` : ''}
            </div>
        </div>
    `).join('');
    
    container.innerHTML = ordersHTML;
}

// 更新訂單狀態
async function updateOrderStatus(orderId, status) {
    try {
        await API.updateOrderStatus(orderId, status);
        console.log('訂單狀態更新成功');
    } catch (error) {
        handleAPIError(error, '更新訂單狀態失敗');
    }
}

// 載入商品列表
async function loadProducts() {
    const container = document.getElementById('productsList');
    container.innerHTML = '<div class="loading">載入中...</div>';
    
    try {
        const data = await API.getProducts();
        displayProducts(data.products);
        
    } catch (error) {
        handleAPIError(error, '載入商品失敗');
        container.innerHTML = '<div class="error">載入商品失敗</div>';
    }
}

// 顯示商品列表
function displayProducts(products) {
    const container = document.getElementById('productsList');
    
    if (products.length === 0) {
        container.innerHTML = '<p>沒有找到商品</p>';
        return;
    }
    
    const productsHTML = products.map(product => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <strong>${product.name}</strong><br>
                    <small>商品ID: ${product.product_id}</small>
                </div>
                <span class="order-status status-${product.status}">${getProductStatusText(product.status)}</span>
            </div>
            <div class="order-details">
                <p>價格: NT$ ${product.price.toLocaleString()}</p>
                <p>訂金: NT$ ${product.deposit.toLocaleString()}</p>
                <p>最大數量: ${product.max_quantity}</p>
                <p>建立時間: ${new Date(product.created_at).toLocaleString()}</p>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = productsHTML;
}

// 載入客戶列表
async function loadCustomers() {
    const container = document.getElementById('customersList');
    container.innerHTML = '<div class="loading">載入中...</div>';
    
    try {
        const phoneFilter = document.getElementById('customerPhoneFilter').value;
        const params = phoneFilter ? { phone: phoneFilter } : {};
        
        const data = await API.getCustomers(params);
        displayCustomers(data.customers);
        
    } catch (error) {
        handleAPIError(error, '載入客戶失敗');
        container.innerHTML = '<div class="error">載入客戶失敗</div>';
    }
}

// 顯示客戶列表
function displayCustomers(customers) {
    const container = document.getElementById('customersList');
    
    if (customers.length === 0) {
        container.innerHTML = '<p>沒有找到客戶</p>';
        return;
    }
    
    const customersHTML = customers.map(customer => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <strong>${customer.name}</strong><br>
                    <small>電話: ${customer.phone}</small>
                    ${customer.email ? `<br><small>信箱: ${customer.email}</small>` : ''}
                </div>
            </div>
            <div class="order-details">
                <p>註冊時間: ${new Date(customer.created_at).toLocaleString()}</p>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = customersHTML;
}

// 工具函數
function getStatusText(status) {
    const statusMap = {
        'pending': '待處理',
        'confirmed': '已確認',
        'paid': '已付款',
        'shipped': '已出貨',
        'completed': '已完成',
        'cancelled': '已取消'
    };
    return statusMap[status] || status;
}

function getProductStatusText(status) {
    const statusMap = {
        'available': '可購買',
        'sold_out': '已售完',
        'discontinued': '已停售'
    };
    return statusMap[status] || status;
}

function getPickupMethodText(method) {
    const methodMap = {
        'self_pickup': '自取',
        'delivery': '宅配'
    };
    return methodMap[method] || method;
}

function getPaymentMethodText(method) {
    const methodMap = {
        'credit_card': '信用卡',
        'bank_transfer': '銀行轉帳'
    };
    return methodMap[method] || method;
}

function showError(message) {
    console.error(message);
    // 可以在頁面上顯示錯誤訊息
} 