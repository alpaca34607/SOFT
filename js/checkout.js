// 顏色名稱對照表 - 從 shopping.js 移植過來
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
    'brown': '棕色',
    'none': '無顏色選項',
};

// 從 localStorage 獲取商品選擇資訊
const productSelection = JSON.parse(localStorage.getItem('productSelection'));

// 付款方式相關欄位控制
function handlePaymentMethodChange() {
    const paymentMethod = document.getElementById('paymentMethod').value;
    const creditCardFields = document.getElementById('creditCardFields');
    const qrcodeSection = document.getElementById('qrcodeSection');
    
    if (paymentMethod === 'creditCard') {
        creditCardFields.style.display = 'block';
        qrcodeSection.style.display = 'none';
    } else {
        creditCardFields.style.display = 'none';
        qrcodeSection.style.display = 'block';
    }
}

// 更新訂單摘要區域
function updateOrderSummary() {
    if (!productSelection) return;

// 更新商品資訊區塊 - 使用已存在的顏色名稱
document.getElementById('productSummary').innerHTML = `
<div class="product-info">
    <div class="detail-area">
        <div class="num-img-wrapper">
            <p>${productSelection.quantity}</p>
            <img src="images/shop/${productSelection.productId}-thumb.jpg" alt="${productSelection.productName}" />
        </div>
        <div class="details">
            <h3>${productSelection.productName}</h3>
            <div class="color-detail">
                <p>主色: ${productSelection.mainColorName || COLOR_NAMES[productSelection.mainColor]}</p>
                <p>副色: ${productSelection.subColorName || COLOR_NAMES[productSelection.subColor]}</p>
            </div>
            <p class="per-price">單價: NT$ ${productSelection.unitPrice}</p>
        </div>
    </div>
    <div class="total-area">
        <h4 class="total">合計<br/>總金額</h4>
        <p> NT$ ${productSelection.totalPrice}</p>
    </div>
</div>
`;

// 更新訂金資訊區塊
document.getElementById('depositSummary').innerHTML = `
<div class="deposit-info">
    <div class="detail-area">
        <div class="num-img-wrapper">
            <p>${productSelection.quantity}</p>
            <img src="images/shop/${productSelection.productId}-thumb.jpg" alt="${productSelection.productName}" />
        </div>
        <div class="details">
            <h3>${productSelection.productName}</h3>

            <p class="per-price">單件訂金: NT$ ${productSelection.unitDeposit}</p>
        </div>
    </div>
    <div class="total-area">
        <h4 class="total">訂金<br/>總額</h4>
        <p> NT$ ${productSelection.totalDeposit}</p>
    </div>
</div>
`;
}

// 表單驗證提交
function validateAndSubmitForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // 基本驗證
    if (!formData.get('name') || !formData.get('phone') || !formData.get('email')) {
        alert('請填寫必要欄位！');
        return;
    }

    // 儲存電話號碼到 localStorage
    const phoneNumber = formData.get('phone');
    let purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || {};
    purchaseHistory[phoneNumber] = purchaseHistory[phoneNumber] || [];
    
    // 建立訂單資訊
    const orderInfo = {
        orderDate: new Date().toISOString(),
        productInfo: productSelection,
        customerInfo: {
            name: formData.get('name'),
            phone: phoneNumber,
            email: formData.get('email'),
            pickupMethod: formData.get('pickupMethod'),
            paymentMethod: formData.get('paymentMethod'),
            note: formData.get('note')
        },
        totalAmount: productSelection.totalPrice,
        depositAmount: productSelection.totalDeposit
    };

    // 將訂單加入購買歷史
    purchaseHistory[phoneNumber].push(orderInfo);
    localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));

    // 送出訂單到後端
    alert('訂單已送出！');
    // window.location.href = 'order-complete.html';
}

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', () => {
    // 檢查是否有商品選擇
    if (!productSelection) {
        alert('未找到商品選擇資訊！');
        window.location.href = 'products.html';
        return;
    }

    // 初始化訂單摘要
    updateOrderSummary();

    // 設置付款方式變更監聽
    document.getElementById('paymentMethod').addEventListener('change', handlePaymentMethodChange);

    // 設置表單提交監聽
    document.getElementById('checkoutForm').addEventListener('submit', validateAndSubmitForm);
});