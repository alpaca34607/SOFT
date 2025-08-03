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
    const totalDepositRevenue = orders.reduce((sum, order) => sum + order.deposit_amount, 0);
    const totalCustomers = customers.length;
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString();
    document.getElementById('totalDepositRevenue').textContent = totalDepositRevenue.toLocaleString();
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
        console.log('開始更新訂單狀態:', { orderId, status });
        const result = await API.updateOrderStatus(orderId, status);
        console.log('訂單狀態更新成功:', result);
        // 重新載入訂單列表以顯示更新後的狀態
        await loadOrders();
    } catch (error) {
        console.error('更新訂單狀態失敗:', error);
        handleAPIError(error, '更新訂單狀態失敗');
        // 重新載入訂單列表以恢復原始狀態
        await loadOrders();
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
                <div>
                    <button onclick="editProduct('${product.product_id}')" class="btn-edit">編輯</button>
                    <button onclick="deleteProduct('${product.product_id}')" class="btn-delete">刪除</button>
                </div>
            </div>
            <div class="order-details">
                <p>價格: NT$ ${product.price.toLocaleString()}</p>
                <p>訂金: NT$ ${product.deposit.toLocaleString()}</p>
                <p>最大數量: ${product.max_quantity}</p>
                <p>狀態: ${getProductStatusText(product.status)}</p>
                ${product.description ? `<p>描述: ${product.description}</p>` : ''}
                ${product.image_path ? `<p>圖片: <img src="${product.image_path}" alt="${product.name}" style="max-width: 100px; max-height: 100px;"></p>` : ''}
                <p>主色選項: ${Array.isArray(product.main_colors) ? product.main_colors.join(', ') : (product.main_colors || '無')}</p>
                <p>副色選項: ${Array.isArray(product.sub_colors) ? product.sub_colors.join(', ') : (product.sub_colors || '無')}</p>
                <p>建立時間: ${new Date(product.created_at).toLocaleString()}</p>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = `
        <div style="margin-bottom: 20px;">
            <button onclick="showAddProductForm()" class="btn-add">新增商品</button>
            <button onclick="syncProductConfig()" class="btn-sync">同步前端配置</button>
        </div>
        ${productsHTML}
    `;
}

// 顯示新增商品表單
function showAddProductForm() {
    const container = document.getElementById('productsList');
    
    // 從前台的 shopping.js 中獲取顏色選項
    const getFrontendColors = () => {
        // 嘗試從前台的 shopping.js 中讀取顏色配置
        const frontendColors = [
            'black', 'white', 'gray', 'gold', 'silver', 'bronze', 
            'red', 'orange', 'yellow', 'blue', 'green', 'brown', 'none'
        ];
        
        const colorNames = {
            'black': '黑色',
            'white': '白色',
            'gray': '灰色',
            'gold': '金色',
            'silver': '銀色',
            'bronze': '銅色',
            'red': '紅色',
            'orange': '橙色',
            'yellow': '黃色',
            'blue': '藍色',
            'green': '綠色',
            'brown': '棕色',
            'none': '無顏色選項'
        };
        
        return { colors: frontendColors, names: colorNames };
    };
    
    const { colors: availableColors, names: colorNames } = getFrontendColors();
    
    // 生成顏色選項的HTML
    const generateColorCheckboxes = (prefix, defaultColors = []) => {
        return availableColors.map(color => `
            <label class="color-checkbox">
                <input type="checkbox" name="${prefix}Colors" value="${color}" 
                       ${defaultColors.includes(color) ? 'checked' : ''}>
                <span class="color-label">${colorNames[color]}</span>
            </label>
        `).join('');
    };
    
    container.innerHTML = `
        <div class="product-form">
            <h3>新增商品</h3>
            <form id="addProductForm">
                <div class="form-group">
                    <label>商品ID:</label>
                    <input type="text" id="productId" required>
                </div>
                <div class="form-group">
                    <label>商品名稱:</label>
                    <input type="text" id="productName" required>
                </div>
                <div class="form-group">
                    <label>價格:</label>
                    <input type="number" id="productPrice" required>
                </div>
                <div class="form-group">
                    <label>訂金:</label>
                    <input type="number" id="productDeposit" required>
                </div>
                <div class="form-group">
                    <label>最大數量:</label>
                    <input type="number" id="productMaxQuantity" value="3">
                </div>
                <div class="form-group">
                    <label>狀態:</label>
                    <select id="productStatus">
                        <option value="available">可購買</option>
                        <option value="sold_out">已售完</option>
                        <option value="discontinued">已停售</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>描述:</label>
                    <textarea id="productDescription"></textarea>
                </div>
                <div class="form-group">
                    <label>主色選項:</label>
                    <div class="color-options">
                        ${generateColorCheckboxes('main', ['black', 'white'])}
                    </div>
                </div>
                <div class="form-group">
                    <label>副色選項:</label>
                    <div class="color-options">
                        ${generateColorCheckboxes('sub', ['red', 'blue', 'green', 'brown'])}
                    </div>
                </div>
                <div class="form-group">
                    <label>商品圖片:</label>
                    <input type="file" id="productImage" accept="image/*">
                </div>
                <div class="form-actions">
                    <button type="submit">新增商品</button>
                    <button type="button" onclick="loadProducts()">取消</button>
                </div>
            </form>
        </div>
    `;

    // 綁定表單提交事件
    document.getElementById('addProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await addProduct();
    });
}

// 新增商品
async function addProduct() {
    try {
        // 獲取選中的顏色
        const getSelectedColors = (prefix) => {
            const checkboxes = document.querySelectorAll(`input[name="${prefix}Colors"]:checked`);
            return Array.from(checkboxes).map(cb => cb.value);
        };
        
        const formData = {
            product_id: document.getElementById('productId').value,
            name: document.getElementById('productName').value,
            price: parseInt(document.getElementById('productPrice').value),
            deposit: parseInt(document.getElementById('productDeposit').value),
            max_quantity: parseInt(document.getElementById('productMaxQuantity').value),
            status: document.getElementById('productStatus').value,
            description: document.getElementById('productDescription').value,
            main_colors: getSelectedColors('main'),
            sub_colors: getSelectedColors('sub')
        };

        const imageFile = document.getElementById('productImage').files[0];
        if (imageFile) {
            formData.image = imageFile;
        }

        await API.createProduct(formData);
        alert('商品新增成功！');
        loadProducts();
    } catch (error) {
        handleAPIError(error, '新增商品失敗');
    }
}

// 編輯商品
async function editProduct(productId) {
    try {
        const response = await API.getProductById(productId);
        const product = response.product;
        
        // 從前台的 shopping.js 中獲取顏色選項
        const getFrontendColors = () => {
            const frontendColors = [
                'black', 'white', 'gray', 'gold', 'silver', 'bronze', 
                'red', 'orange', 'yellow', 'blue', 'green', 'brown', 'none'
            ];
            
            const colorNames = {
                'black': '黑色',
                'white': '白色',
                'gray': '灰色',
                'gold': '金色',
                'silver': '銀色',
                'bronze': '銅色',
                'red': '紅色',
                'orange': '橙色',
                'yellow': '黃色',
                'blue': '藍色',
                'green': '綠色',
                'brown': '棕色',
                'none': '無顏色選項'
            };
            
            return { colors: frontendColors, names: colorNames };
        };
        
        const { colors: availableColors, names: colorNames } = getFrontendColors();
        
        // 生成顏色選項的HTML，並預選現有的顏色
        const generateColorCheckboxes = (prefix, existingColors = []) => {
            return availableColors.map(color => `
                <label class="color-checkbox">
                    <input type="checkbox" name="${prefix}Colors" value="${color}" 
                           ${existingColors.includes(color) ? 'checked' : ''}>
                    <span class="color-label">${colorNames[color]}</span>
                </label>
            `).join('');
        };
        
        const container = document.getElementById('productsList');
        container.innerHTML = `
            <div class="product-form">
                <h3>編輯商品</h3>
                <form id="editProductForm">
                    <div class="form-group">
                        <label>商品ID:</label>
                        <input type="text" id="editProductId" value="${product.product_id}" readonly>
                    </div>
                    <div class="form-group">
                        <label>商品名稱:</label>
                        <input type="text" id="editProductName" value="${product.name}" required>
                    </div>
                    <div class="form-group">
                        <label>價格:</label>
                        <input type="number" id="editProductPrice" value="${product.price}" required>
                    </div>
                    <div class="form-group">
                        <label>訂金:</label>
                        <input type="number" id="editProductDeposit" value="${product.deposit}" required>
                    </div>
                    <div class="form-group">
                        <label>最大數量:</label>
                        <input type="number" id="editProductMaxQuantity" value="${product.max_quantity}">
                    </div>
                    <div class="form-group">
                        <label>狀態:</label>
                        <select id="editProductStatus">
                            <option value="available" ${product.status === 'available' ? 'selected' : ''}>可購買</option>
                            <option value="sold_out" ${product.status === 'sold_out' ? 'selected' : ''}>已售完</option>
                            <option value="discontinued" ${product.status === 'discontinued' ? 'selected' : ''}>已停售</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>描述:</label>
                        <textarea id="editProductDescription">${product.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>主色選項:</label>
                        <div class="color-options">
                            ${generateColorCheckboxes('main', Array.isArray(product.main_colors) ? product.main_colors : [])}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>副色選項:</label>
                        <div class="color-options">
                            ${generateColorCheckboxes('sub', Array.isArray(product.sub_colors) ? product.sub_colors : [])}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>商品圖片:</label>
                        <input type="file" id="editProductImage" accept="image/*">
                        ${product.image_path ? `<p>目前圖片: <img src="${product.image_path}" alt="${product.name}" style="max-width: 100px; max-height: 100px;"></p>` : ''}
                    </div>
                    <div class="form-actions">
                        <button type="submit">更新商品</button>
                        <button type="button" onclick="loadProducts()">取消</button>
                    </div>
                </form>
            </div>
        `;

        // 綁定表單提交事件
        document.getElementById('editProductForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await updateProduct(productId);
        });
    } catch (error) {
        handleAPIError(error, '載入商品資料失敗');
    }
}

// 更新商品
async function updateProduct(productId) {
    try {
        // 獲取選中的顏色
        const getSelectedColors = (prefix) => {
            const checkboxes = document.querySelectorAll(`input[name="${prefix}Colors"]:checked`);
            return Array.from(checkboxes).map(cb => cb.value);
        };
        
        const formData = {
            name: document.getElementById('editProductName').value,
            price: parseInt(document.getElementById('editProductPrice').value),
            deposit: parseInt(document.getElementById('editProductDeposit').value),
            max_quantity: parseInt(document.getElementById('editProductMaxQuantity').value),
            status: document.getElementById('editProductStatus').value,
            description: document.getElementById('editProductDescription').value,
            main_colors: getSelectedColors('main'),
            sub_colors: getSelectedColors('sub')
        };

        const imageFile = document.getElementById('editProductImage').files[0];
        if (imageFile) {
            formData.image = imageFile;
        }

        await API.updateProduct(productId, formData);
        alert('商品更新成功！');
        loadProducts();
    } catch (error) {
        handleAPIError(error, '更新商品失敗');
    }
}

// 刪除商品
async function deleteProduct(productId) {
    if (!confirm('確定要刪除這個商品嗎？此操作無法復原。')) {
        return;
    }

    try {
        await API.deleteProduct(productId);
        alert('商品刪除成功！');
        loadProducts();
    } catch (error) {
        handleAPIError(error, '刪除商品失敗');
    }
}

// 同步前端商品配置 (已移除，改為前台動態載入)
async function syncProductConfig() {
    alert('前端現在會自動從後台載入商品配置，無需手動同步！\n\n前台會自動獲取最新的商品資料和顏色選項。');
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
    // 在頁面上顯示錯誤訊息
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '20px';
    errorDiv.style.right = '20px';
    errorDiv.style.zIndex = '1000';
    errorDiv.style.padding = '10px 20px';
    errorDiv.style.backgroundColor = '#f8d7da';
    errorDiv.style.color = '#721c24';
    errorDiv.style.border = '1px solid #f5c6cb';
    errorDiv.style.borderRadius = '5px';
    
    document.body.appendChild(errorDiv);
    
    // 3秒後自動移除
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 3000);
} 