      // 商品配置資料
      const PRODUCTS_CONFIG = {
        'product-SoftzillaOD': {
            name: '監修中 | 戶外風軟吉拉',
            price: 2500,
            deposit:300,
            maxQuantity: 3,
            mainColors: ['black', 'white'],
            subColors: ['brown', 'green']
        },
        'product-Softzilla': {
            name: '2023出品|軟吉拉公仔',
            price: 1500,
            deposit:300,
            maxQuantity: 3,
            mainColors: ['black', 'white'],
            subColors: ['gold', 'silver', 'red', 'orange', 'yellow', 'blue', 'green']
        },
        'product-Soft': {
            name: '2019出品 | 軟筋臥佛公仔',
            price: 1200,
            deposit:300,
            maxQuantity: 0,
            mainColors: ['white'],
            subColors: ['red', 'green', 'blue']
        },
        'product-Softtwice': {
            name: '2018出品 | 小貓仔黏土偶',
            price: 500,
            deposit:300,
            maxQuantity: 0,
            mainColors: ['white'],
            subColors: ['none']
        },
        'product-Remain': {
            name: '餘量釋出|軟吉拉公仔',
            price: 1000,
            deposit:300,
            maxQuantity: 3,
            mainColors: ['black', 'white'],
            subColors: [ 'red', 'blue', 'green']
        }
    };

    // 顏色名稱對照表
    const COLOR_NAMES = {
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
        'brown':'棕色',
        'none':'無顏色選項',
    };

   // 根據 HTML 頁面上的 data-product-id 自動設定商品 ID
const CURRENT_PRODUCT_ID = document.body.dataset.productId; // 在 <body> 中設置 data-product-id

// 更新顏色選項
function updateColorOptions(productConfig) {
    const mainColorSelect = document.getElementById('mainColor');
    mainColorSelect.innerHTML = '<option value="">選擇主色</option>';
    productConfig.mainColors.forEach(color => {
        const option = document.createElement('option');
        option.value = color;
        option.textContent = COLOR_NAMES[color];
        mainColorSelect.appendChild(option);
    });

    const subColorSelect = document.getElementById('subColor');
    subColorSelect.innerHTML = '<option value="">選擇副色</option>';
    productConfig.subColors.forEach(color => {
        const option = document.createElement('option');
        option.value = color;
        option.textContent = COLOR_NAMES[color];
        subColorSelect.appendChild(option);
    });

    // 數量
    const quantitySelect = document.getElementById('quantity');
    quantitySelect.innerHTML = '';
    for (let i = 1; i <= productConfig.maxQuantity; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        quantitySelect.appendChild(option);
    }
}

// 初始化頁面
window.addEventListener('load', () => {
    const productConfig = PRODUCTS_CONFIG[CURRENT_PRODUCT_ID];
    if (!productConfig) {
        alert('找不到指定商品！');
        return;
    }

    document.getElementById('productName').textContent = productConfig.name;
    document.getElementById('unitPrice').textContent = productConfig.price;
    document.getElementById('unitDeposit').textContent = productConfig.deposit;


    updateColorOptions(productConfig);

    const savedSelection = localStorage.getItem('productSelection');
    if (savedSelection) {
        const selection = JSON.parse(savedSelection);
        if (selection.productId === CURRENT_PRODUCT_ID) {
            document.getElementById('mainColor').value = selection.mainColor;
            document.getElementById('subColor').value = selection.subColor;
            document.getElementById('quantity').value = selection.quantity;
            document.getElementById('totalPrice').textContent = selection.totalPrice;
            document.getElementById('totalDeposit').textContent = selection.totalDeposit;
        }
    }
});

// 按下結帳按鈕時檢查選擇
function updateCheckoutButton() {
    const checkoutButton = document.querySelector('.checkout button');
    const productConfig = PRODUCTS_CONFIG[CURRENT_PRODUCT_ID];
    const mainColor = document.getElementById('mainColor').value;
    const subColor = document.getElementById('subColor').value;
    
    // 檢查是否達到購買上限（maxQuantity 為 0）
    if (productConfig.maxQuantity === 0) {
        checkoutButton.disabled = true;
        checkoutButton.textContent = '已售完';
        checkoutButton.classList.add('disabled');
        return;
    }
    
    // 檢查是否完成所有選擇
    if (!mainColor || !subColor) {
        checkoutButton.disabled = true;
        checkoutButton.textContent = '請選擇款式';
        checkoutButton.classList.add('disabled');
    } else {
        checkoutButton.disabled = false;
        checkoutButton.textContent = '前往預購';
        checkoutButton.classList.remove('disabled');
    }
}

// 更新選擇並儲存到 localStorage
function updateSelection() {
    const productConfig = PRODUCTS_CONFIG[CURRENT_PRODUCT_ID];
    const mainColor = document.getElementById('mainColor').value;
    const subColor = document.getElementById('subColor').value;
    const quantity = parseInt(document.getElementById('quantity').value) || 0;

    // 計算金額
    const totalPrice = productConfig.price * quantity;
    const totalDeposit = productConfig.deposit * quantity;

    // 更新顯示
    document.getElementById('unitPrice').textContent = productConfig.price;
    document.getElementById('unitDeposit').textContent = productConfig.deposit;
    document.getElementById('totalPrice').textContent = totalPrice;
    document.getElementById('totalDeposit').textContent = totalDeposit;

    // 儲存到 localStorage
    const selection = {
        productId: CURRENT_PRODUCT_ID,
        productName: productConfig.name,
        mainColor,
        subColor,
        quantity,
        unitPrice: productConfig.price,
        unitDeposit: productConfig.deposit,
        totalPrice,
        totalDeposit
    };
    localStorage.setItem('productSelection', JSON.stringify(selection));
    
    // 更新按鈕狀態
    updateCheckoutButton();
}

// 前往結帳頁面
// 前往結帳頁面
function goToCheckout() {
    const mainColor = document.getElementById('mainColor').value;
    const subColor = document.getElementById('subColor').value;
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    const productConfig = PRODUCTS_CONFIG[CURRENT_PRODUCT_ID];

    // 驗證是否已選擇所有必要選項
    if (!mainColor || !subColor || !quantity) {
        alert('請完成所有選擇！');
        return;
    }

    // 確保商品還有庫存
    if (productConfig.maxQuantity === 0) {
        alert('很抱歉，此商品已售完！');
        return;
    }

    // 儲存完整的商品資訊到 localStorage
    const selection = {
        productId: CURRENT_PRODUCT_ID,
        productName: productConfig.name,
        mainColor,
        mainColorName: COLOR_NAMES[mainColor],
        subColor,
        subColorName: COLOR_NAMES[subColor],
        quantity,
        unitPrice: productConfig.price,
        unitDeposit: productConfig.deposit,
        totalPrice: productConfig.price * quantity,
        totalDeposit: productConfig.deposit * quantity,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('productSelection', JSON.stringify(selection));
    
    // 導向到結帳頁面
    window.location.href = 'checkout.html';
}

// 監聽所有選擇的變更
['mainColor', 'subColor', 'quantity'].forEach(id => {
    document.getElementById(id).addEventListener('change', updateSelection);
});

// 頁面載入時初始化
window.addEventListener('load', () => {
    const productConfig = PRODUCTS_CONFIG[CURRENT_PRODUCT_ID];
    if (!productConfig) {
        alert('找不到指定商品！');
        return;
    }

    // 設置商品資訊
    document.getElementById('productName').textContent = productConfig.name;
    document.getElementById('unitPrice').textContent = productConfig.price;
    document.getElementById('unitDeposit').textContent = productConfig.deposit;
    
    // 初始化選項
    updateColorOptions(productConfig);
    
    // 檢查是否有已儲存的選擇
    const savedSelection = localStorage.getItem('productSelection');
    if (savedSelection) {
        const selection = JSON.parse(savedSelection);
        if (selection.productId === CURRENT_PRODUCT_ID) {
            document.getElementById('mainColor').value = selection.mainColor;
            document.getElementById('subColor').value = selection.subColor;
            document.getElementById('quantity').value = selection.quantity;
            document.getElementById('totalPrice').textContent = selection.totalPrice;
            document.getElementById('totalDeposit').textContent = selection.totalDeposit;
        }
    }
    
    // 初始化按鈕狀態
    updateCheckoutButton();
});
