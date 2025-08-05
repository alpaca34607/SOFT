// 管理後台功能

// 格式化時間為台北時間
function formatDateTime(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// 頁面載入時初始化
document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();
  loadDashboard();
});

// 初始化導航
function initializeNavigation() {
  const navButtons = document.querySelectorAll(".nav-btn");
  const contentSections = document.querySelectorAll(".content-section");

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetSection = button.dataset.section;

      // 更新按鈕狀態
      navButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // 顯示對應內容
      contentSections.forEach((section) => {
        section.style.display = "none";
      });
      document.getElementById(targetSection).style.display = "block";

      // 載入對應資料
      switch (targetSection) {
        case "dashboard":
          loadDashboard();
          break;
        case "orders":
          loadOrders();
          break;
        case "products":
          loadProducts();
          break;
        case "customers":
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
      showError("無法連接到伺服器");
      return;
    }

    // 載入統計資料
    const [ordersData, customersData] = await Promise.all([
      API.getOrders({ limit: 1000 }),
      API.getCustomers({ limit: 1000 }),
    ]);

    updateDashboardStats(ordersData.orders, customersData.customers);
    updateRecentOrders(ordersData.orders.slice(0, 5));
  } catch (error) {
    handleAPIError(error, "載入儀表板失敗");
  }
}

// 更新儀表板統計
function updateDashboardStats(orders, customers) {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.total_amount,
    0
  );
  const totalDepositRevenue = orders.reduce(
    (sum, order) => sum + order.deposit_amount,
    0
  );
  const totalCustomers = customers.length;

  document.getElementById("totalOrders").textContent = totalOrders;
  document.getElementById("pendingOrders").textContent = pendingOrders;
  document.getElementById("totalRevenue").textContent =
    totalRevenue.toLocaleString();
  document.getElementById("totalDepositRevenue").textContent =
    totalDepositRevenue.toLocaleString();
  document.getElementById("totalCustomers").textContent = totalCustomers;
}

// 更新最近訂單
function updateRecentOrders(orders) {
  const container = document.getElementById("recentOrders");

  if (orders.length === 0) {
    container.innerHTML = "<h3>最近訂單</h3><p>尚無訂單</p>";
    return;
  }

  const ordersHTML = orders
    .map(
      (order) => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <strong>訂單編號: ${order.order_number}</strong><br>
                    <small>客戶: ${order.customer_name} (${
        order.phone
      })</small><br>
                    <small>建立時間: ${formatDateTime(order.created_at)}</small>
                </div>
                <span class="order-status status-${
                  order.status
                }">${getStatusText(order.status)}</span>
            </div>
            <div class="order-details">
                <p><strong>總金額: NT$ ${order.total_amount.toLocaleString()}</strong></p>
                <p>訂金: NT$ ${order.deposit_amount.toLocaleString()}</p>
                <p>取貨方式: ${getPickupMethodText(order.pickup_method)}</p>
                <p>付款方式: ${getPaymentMethodText(order.payment_method)}</p>
            </div>
        </div>
    `
    )
    .join("");

  container.innerHTML = `<h3>最近訂單</h3>${ordersHTML}`;
}

// 載入訂單列表
async function loadOrders() {
  const container = document.getElementById("ordersList");
  container.innerHTML = '<div class="loading">載入中...</div>';

  try {
    const statusFilter = document.getElementById("statusFilter").value;
    const phoneFilter = document.getElementById("phoneFilter").value;

    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (phoneFilter) params.phone = phoneFilter;

    const data = await API.getOrders(params);
    displayOrders(data.orders);
  } catch (error) {
    handleAPIError(error, "載入訂單失敗");
    container.innerHTML = '<div class="error">載入訂單失敗</div>';
  }
}

// 顯示訂單列表
function displayOrders(orders) {
  const container = document.getElementById("ordersList");

  if (orders.length === 0) {
    container.innerHTML = "<p>沒有找到訂單</p>";
    return;
  }

  const ordersHTML = orders
    .map(
      (order) => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <strong>訂單編號: ${order.order_number}</strong><br>
                    <small>客戶: ${order.customer_name} (${
        order.phone
      })</small><br>
                    <small>建立時間: ${formatDateTime(order.created_at)}</small>
                </div>
                <div>
                    <select class="status-select" onchange="updateOrderStatus(${
                      order.id
                    }, this.value)">
                        <option value="pending" ${
                          order.status === "pending" ? "selected" : ""
                        }>待處理</option>
                        <option value="confirmed" ${
                          order.status === "confirmed" ? "selected" : ""
                        }>已確認</option>
                        <option value="paid" ${
                          order.status === "paid" ? "selected" : ""
                        }>已付款</option>
                        <option value="shipped" ${
                          order.status === "shipped" ? "selected" : ""
                        }>已出貨</option>
                        <option value="completed" ${
                          order.status === "completed" ? "selected" : ""
                        }>已完成</option>
                        <option value="cancelled" ${
                          order.status === "cancelled" ? "selected" : ""
                        }>已取消</option>
                    </select>

                </div>
            </div>
            <div class="order-details">
                <p><strong>總金額: NT$ ${order.total_amount.toLocaleString()}</strong></p>
                <p>訂金: NT$ ${order.deposit_amount.toLocaleString()}</p>
                <p>取貨方式: ${getPickupMethodText(order.pickup_method)}</p>
                <p>付款方式: ${getPaymentMethodText(order.payment_method)}</p>
                ${order.note ? `<p>備註: ${order.note}</p>` : ""}
            </div>
             <button onclick="deleteOrder(${order.id}, '${
        order.order_number
      }')" class="btn-delete" style="">🗑️ 刪除</button>
        </div>
    `
    )
    .join("");

  container.innerHTML = `
        <div style="margin-bottom: 20px;">
            <button onclick="deleteAllOrders()" class="btn-delete">⚠️ 清空所有訂單</button>
        </div>
        ${ordersHTML}
    `;
}

// 更新訂單狀態
async function updateOrderStatus(orderId, status) {
  try {
    console.log("開始更新訂單狀態:", { orderId, status });
    const result = await API.updateOrderStatus(orderId, status);
    console.log("訂單狀態更新成功:", result);
    // 重新載入訂單列表以顯示更新後的狀態
    await loadOrders();
  } catch (error) {
    console.error("更新訂單狀態失敗:", error);
    handleAPIError(error, "更新訂單狀態失敗");
    // 重新載入訂單列表以恢復原始狀態
    await loadOrders();
  }
}

// 載入商品列表
async function loadProducts() {
  const container = document.getElementById("productsList");
  container.innerHTML = '<div class="loading">載入中...</div>';

  try {
    const data = await API.getProducts();
    displayProducts(data.products);
  } catch (error) {
    handleAPIError(error, "載入商品失敗");
    container.innerHTML = '<div class="error">載入商品失敗</div>';
  }
}

// 顯示商品列表
function displayProducts(products) {
  const container = document.getElementById("productsList");

  if (products.length === 0) {
    container.innerHTML = "<p>沒有找到商品</p>";
    return;
  }

  const productsHTML = products
    .map(
      (product) => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <strong>${product.name}</strong><br>
                    <small>商品ID: ${product.product_id}</small>
                </div>
                <div>
                    <button onclick="editProduct('${
                      product.product_id
                    }')" class="btn-edit">編輯</button>
                    <button onclick="deleteProduct('${
                      product.product_id
                    }')" class="btn-delete">刪除</button>
                </div>
            </div>
            <div class="order-details">
                <p>價格: NT$ ${product.price.toLocaleString()}</p>
                <p>訂金: NT$ ${product.deposit.toLocaleString()}</p>
                <p>最大數量: ${product.max_quantity}</p>
                <p>狀態: ${getProductStatusText(product.status)}</p>
                <p>預購按鈕狀態: ${getPreorderButtonStatusText(
                  product.preorder_button_status
                )}</p>
                <p>開放狀態: ${getCellOpenStatusText(
                  product.cell_open_status
                )}</p>
                <p>餘量狀態: ${getCellRemainingStatusText(
                  product.cell_remaining_status
                )}</p>
                ${
                  product.specifications
                    ? `<p>規格: ${product.specifications}</p>`
                    : ""
                }
                ${
                  product.pickup_info
                    ? `<p>取貨資訊: ${product.pickup_info}</p>`
                    : ""
                }
                ${
                  product.thumbnail_path
                    ? `<p>縮圖: <img src="${product.thumbnail_path}" alt="${product.name}" style="max-width: 100px; max-height: 100px;"></p>`
                    : ""
                }
                ${
                  product.lightslider_images &&
                  product.lightslider_images.length > 0
                    ? `<p>LightSlider圖片: ${product.lightslider_images.length} 張</p>`
                    : ""
                }
                ${
                  product.sketchfab_embed_link
                    ? `<p>Sketchfab連結: ${product.sketchfab_embed_link}</p>`
                    : ""
                }
                ${
                  product.product_introduction
                    ? `<p>商品介紹: ${product.product_introduction.substring(
                        0,
                        100
                      )}${
                        product.product_introduction.length > 100 ? "..." : ""
                      }</p>`
                    : ""
                }
                ${
                  product.preorder_notes
                    ? `<p>預購注意事項: ${product.preorder_notes.substring(
                        0,
                        100
                      )}${product.preorder_notes.length > 100 ? "..." : ""}</p>`
                    : ""
                }
                <p>主色選項: ${
                  Array.isArray(product.main_colors)
                    ? product.main_colors.join(", ")
                    : product.main_colors || "無"
                }</p>
                <p>副色選項: ${
                  Array.isArray(product.sub_colors)
                    ? product.sub_colors.join(", ")
                    : product.sub_colors || "無"
                }</p>
                <p>建立時間: ${formatDateTime(product.created_at)}</p>
            </div>
        </div>
    `
    )
    .join("");

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
  const container = document.getElementById("productsList");

  // 從前台的 shopping.js 中獲取顏色選項
  const getFrontendColors = () => {
    // 嘗試從前台的 shopping.js 中讀取顏色配置
    const frontendColors = [
      "black",
      "white",
      "gray",
      "gold",
      "silver",
      "bronze",
      "red",
      "orange",
      "yellow",
      "blue",
      "green",
      "brown",
      "none",
    ];

    const colorNames = {
      black: "黑色",
      white: "白色",
      gray: "灰色",
      gold: "金色",
      silver: "銀色",
      bronze: "銅色",
      red: "紅色",
      orange: "橙色",
      yellow: "黃色",
      blue: "藍色",
      green: "綠色",
      brown: "棕色",
      none: "無顏色選項",
    };

    return { colors: frontendColors, names: colorNames };
  };

  const { colors: availableColors, names: colorNames } = getFrontendColors();

  // 生成顏色選項的HTML
  const generateColorCheckboxes = (prefix, defaultColors = []) => {
    return availableColors
      .map(
        (color) => `
            <label class="color-checkbox">
                <input type="checkbox" name="${prefix}Colors" value="${color}" 
                       ${defaultColors.includes(color) ? "checked" : ""}>
                <span class="color-label">${colorNames[color]}</span>
            </label>
        `
      )
      .join("");
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
                    <label>規格:</label>
                    <textarea id="productSpecifications" placeholder="例如: 寬5cm*高8cm / 模型光固化樹脂"></textarea>
                </div>
                <div class="form-group">
                    <label>預購取貨時間與地點:</label>
                    <textarea id="productPickupInfo" placeholder="例如: 2023/10月中 / Taipei Toy Festival台北國際玩具創作大展"></textarea>
                </div>
                <div class="form-group">
                    <label>預購按鈕顯示狀態:</label>
                    <select id="productPreorderButtonStatus">
                        <option value="select_style">請選擇款式/前往預購</option>
                        <option value="sold_out">已售完</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>顯示在product cell的開放狀態:</label>
                    <select id="productCellOpenStatus">
                        <option value="preparing">準備中</option>
                        <option value="open_for_preorder">開放預購中</option>
                        <option value="stopped_selling">已停止販售</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>顯示在product cell的餘量狀態:</label>
                    <select id="productCellRemainingStatus">
                        <option value="still_available">尚有餘量</option>
                        <option value="sold_out">已售完</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>主色選項:</label>
                    <div class="color-options">
                        ${generateColorCheckboxes("main", ["black", "white"])}
                    </div>
                </div>
                <div class="form-group">
                    <label>副色選項:</label>
                    <div class="color-options">
                        ${generateColorCheckboxes("sub", [
                          "red",
                          "blue",
                          "green",
                          "brown",
                        ])}
                    </div>
                </div>
                <div class="form-group">
                    <label>上傳商品縮圖(thumb):</label>
                    <input type="file" id="productThumbnail" accept="image/*">
                </div>
                <div class="form-group">
                    <label>上傳LightSlider圖片:</label>
                    <input type="file" id="productLightSliderImages" accept="image/*" multiple>
                </div>
                <div class="form-group">
                    <label>sketchfab嵌入連結:</label>
                    <input type="url" id="productSketchfabEmbedLink" placeholder="例如: https://sketchfab.com/models/...">
                </div>
                <div class="form-group">
                    <label>sketchfab背景:</label>
                    <input type="file" id="productSketchfabBackground" accept="image/*">
                </div>
                <div class="form-group">
                    <label>商品介紹:</label>
                    <textarea id="productIntroduction" placeholder="商品詳細介紹內容"></textarea>
                </div>
                <div class="form-group">
                    <label>預購注意事項:</label>
                    <textarea id="productPreorderNotes" placeholder="預購相關注意事項"></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit">新增商品</button>
                    <button type="button" onclick="loadProducts()">取消</button>
                </div>
            </form>
        </div>
    `;

  // 綁定表單提交事件
  document
    .getElementById("addProductForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await addProduct();
    });
}

// 新增商品
async function addProduct() {
  try {
    // 獲取選中的顏色
    const getSelectedColors = (prefix) => {
      const checkboxes = document.querySelectorAll(
        `input[name="${prefix}Colors"]:checked`
      );
      return Array.from(checkboxes).map((cb) => cb.value);
    };

    const formData = {
      product_id: document.getElementById("productId").value,
      name: document.getElementById("productName").value,
      price: parseInt(document.getElementById("productPrice").value),
      deposit: parseInt(document.getElementById("productDeposit").value),
      max_quantity: parseInt(
        document.getElementById("productMaxQuantity").value
      ),
      status: document.getElementById("productStatus").value,
      specifications: document.getElementById("productSpecifications").value,
      pickup_info: document.getElementById("productPickupInfo").value,
      preorder_button_status: document.getElementById(
        "productPreorderButtonStatus"
      ).value,
      cell_open_status: document.getElementById("productCellOpenStatus").value,
      cell_remaining_status: document.getElementById(
        "productCellRemainingStatus"
      ).value,
      sketchfab_embed_link: document.getElementById("productSketchfabEmbedLink")
        .value,
      product_introduction: document.getElementById("productIntroduction")
        .value,
      preorder_notes: document.getElementById("productPreorderNotes").value,
      main_colors: getSelectedColors("main"),
      sub_colors: getSelectedColors("sub"),
    };

    const thumbnailFile = document.getElementById("productThumbnail").files[0];
    if (thumbnailFile) {
      formData.thumbnail = thumbnailFile;
    }

    const lightsliderFiles = document.getElementById(
      "productLightSliderImages"
    ).files;
    if (lightsliderFiles.length > 0) {
      Array.from(lightsliderFiles).forEach((file, index) => {
        formData[`lightslider_images`] = file;
      });
    }

    const sketchfabBackgroundFile = document.getElementById(
      "productSketchfabBackground"
    ).files[0];
    if (sketchfabBackgroundFile) {
      formData.sketchfab_background = sketchfabBackgroundFile;
    }

    await API.createProduct(formData);
    alert("商品新增成功！");
    loadProducts();
  } catch (error) {
    handleAPIError(error, "新增商品失敗");
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
        "black",
        "white",
        "gray",
        "gold",
        "silver",
        "bronze",
        "red",
        "orange",
        "yellow",
        "blue",
        "green",
        "brown",
        "none",
      ];

      const colorNames = {
        black: "黑色",
        white: "白色",
        gray: "灰色",
        gold: "金色",
        silver: "銀色",
        bronze: "銅色",
        red: "紅色",
        orange: "橙色",
        yellow: "黃色",
        blue: "藍色",
        green: "綠色",
        brown: "棕色",
        none: "無顏色選項",
      };

      return { colors: frontendColors, names: colorNames };
    };

    const { colors: availableColors, names: colorNames } = getFrontendColors();

    // 生成顏色選項的HTML，並預選現有的顏色
    const generateColorCheckboxes = (prefix, existingColors = []) => {
      return availableColors
        .map(
          (color) => `
                <label class="color-checkbox">
                    <input type="checkbox" name="${prefix}Colors" value="${color}" 
                           ${existingColors.includes(color) ? "checked" : ""}>
                    <span class="color-label">${colorNames[color]}</span>
                </label>
            `
        )
        .join("");
    };

    const container = document.getElementById("productsList");
    container.innerHTML = `
            <div class="product-form">
                <h3>編輯商品</h3>
                <form id="editProductForm">
                    <div class="form-group">
                        <label>商品ID:</label>
                        <input type="text" id="editProductId" value="${
                          product.product_id
                        }" readonly>
                    </div>
                    <div class="form-group">
                        <label>商品名稱:</label>
                        <input type="text" id="editProductName" value="${
                          product.name
                        }" required>
                    </div>
                    <div class="form-group">
                        <label>價格:</label>
                        <input type="number" id="editProductPrice" value="${
                          product.price
                        }" required>
                    </div>
                    <div class="form-group">
                        <label>訂金:</label>
                        <input type="number" id="editProductDeposit" value="${
                          product.deposit
                        }" required>
                    </div>
                    <div class="form-group">
                        <label>最大數量:</label>
                        <input type="number" id="editProductMaxQuantity" value="${
                          product.max_quantity
                        }">
                    </div>
                    <div class="form-group">
                        <label>狀態:</label>
                        <select id="editProductStatus">
                            <option value="available" ${
                              product.status === "available" ? "selected" : ""
                            }>可購買</option>
                            <option value="sold_out" ${
                              product.status === "sold_out" ? "selected" : ""
                            }>已售完</option>
                            <option value="discontinued" ${
                              product.status === "discontinued"
                                ? "selected"
                                : ""
                            }>已停售</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>規格:</label>
                        <textarea id="editProductSpecifications">${
                          product.specifications || ""
                        }</textarea>
                    </div>
                    <div class="form-group">
                        <label>預購取貨時間與地點:</label>
                        <textarea id="editProductPickupInfo">${
                          product.pickup_info || ""
                        }</textarea>
                    </div>
                    <div class="form-group">
                        <label>預購按鈕顯示狀態:</label>
                        <select id="editProductPreorderButtonStatus">
                            <option value="select_style" ${
                              product.preorder_button_status === "select_style"
                                ? "selected"
                                : ""
                            }>請選擇款式/前往預購</option>
                            <option value="sold_out" ${
                              product.preorder_button_status === "sold_out"
                                ? "selected"
                                : ""
                            }>已售完</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>顯示在product cell的開放狀態:</label>
                        <select id="editProductCellOpenStatus">
                            <option value="preparing" ${
                              product.cell_open_status === "preparing"
                                ? "selected"
                                : ""
                            }>準備中</option>
                            <option value="open_for_preorder" ${
                              product.cell_open_status === "open_for_preorder"
                                ? "selected"
                                : ""
                            }>開放預購中</option>
                            <option value="stopped_selling" ${
                              product.cell_open_status === "stopped_selling"
                                ? "selected"
                                : ""
                            }>已停止販售</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>顯示在product cell的餘量狀態:</label>
                        <select id="editProductCellRemainingStatus">
                            <option value="still_available" ${
                              product.cell_remaining_status ===
                              "still_available"
                                ? "selected"
                                : ""
                            }>尚有餘量</option>
                            <option value="sold_out" ${
                              product.cell_remaining_status === "sold_out"
                                ? "selected"
                                : ""
                            }>已售完</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>主色選項:</label>
                        <div class="color-options">
                            ${generateColorCheckboxes(
                              "main",
                              Array.isArray(product.main_colors)
                                ? product.main_colors
                                : []
                            )}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>副色選項:</label>
                        <div class="color-options">
                            ${generateColorCheckboxes(
                              "sub",
                              Array.isArray(product.sub_colors)
                                ? product.sub_colors
                                : []
                            )}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>上傳商品縮圖(thumb):</label>
                        <input type="file" id="editProductThumbnail" accept="image/*">
                        ${
                          product.thumbnail_path
                            ? `<div class="current-image">
                                <p>目前縮圖:</p>
                                <img src="${product.thumbnail_path}" alt="${product.name}" style="max-width: 150px; max-height: 150px; border: 1px solid #ccc; margin: 5px;">
                                <button type="button" onclick="deleteImage('thumbnail', '${product.product_id}')" style="background: #ff4444; color: white; border: none; padding: 5px 10px; margin-left: 10px; cursor: pointer;">刪除</button>
                               </div>`
                            : "<p>目前無縮圖</p>"
                        }
                    </div>
                    <div class="form-group">
                        <label>上傳LightSlider圖片:</label>
                        <input type="file" id="editProductLightSliderImages" accept="image/*" multiple>
                        ${
                          product.lightslider_images &&
                          product.lightslider_images.length > 0
                            ? `<div class="current-images">
                                <p>目前LightSlider圖片 (${
                                  product.lightslider_images.length
                                } 張):</p>
                                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0;">
                                  ${product.lightslider_images
                                    .map(
                                      (img, index) => `
                                    <div style="position: relative; display: inline-block;">
                                      <img src="${img}" alt="LightSlider圖片${
                                        index + 1
                                      }" style="max-width: 100px; max-height: 100px; border: 1px solid #ccc;">
                                      <button type="button" onclick="deleteImage('lightslider', '${
                                        product.product_id
                                      }', ${index})" style="position: absolute; top: -5px; right: -5px; background: #ff4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; cursor: pointer;">×</button>
                                    </div>
                                  `
                                    )
                                    .join("")}
                                </div>
                                <button type="button" onclick="deleteAllImages('lightslider', '${
                                  product.product_id
                                }')" style="background: #ff8800; color: white; border: none; padding: 5px 10px; cursor: pointer;">刪除所有LightSlider圖片</button>
                               </div>`
                            : "<p>目前無LightSlider圖片</p>"
                        }
                    </div>
                    <div class="form-group">
                        <label>sketchfab嵌入連結:</label>
                        <input type="url" id="editProductSketchfabEmbedLink" value="${
                          product.sketchfab_embed_link || ""
                        }">
                    </div>
                    <div class="form-group">
                        <label>sketchfab背景:</label>
                        <input type="file" id="editProductSketchfabBackground" accept="image/*">
                        ${
                          product.sketchfab_background
                            ? `<p>目前背景: <img src="${product.sketchfab_background}" alt="sketchfab背景" style="max-width: 100px; max-height: 100px;"></p>`
                            : ""
                        }
                    </div>
                    <div class="form-group">
                        <label>商品介紹:</label>
                        <textarea id="editProductIntroduction">${
                          product.product_introduction || ""
                        }</textarea>
                    </div>
                    <div class="form-group">
                        <label>預購注意事項:</label>
                        <textarea id="editProductPreorderNotes">${
                          product.preorder_notes || ""
                        }</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit">更新商品</button>
                        <button type="button" onclick="loadProducts()">取消</button>
                    </div>
                </form>
            </div>
        `;

    // 綁定表單提交事件
    document
      .getElementById("editProductForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        await updateProduct(productId);
      });
  } catch (error) {
    handleAPIError(error, "載入商品資料失敗");
  }
}

// 更新商品
async function updateProduct(productId) {
  try {
    // 獲取選中的顏色
    const getSelectedColors = (prefix) => {
      const checkboxes = document.querySelectorAll(
        `input[name="${prefix}Colors"]:checked`
      );
      return Array.from(checkboxes).map((cb) => cb.value);
    };

    const formData = {
      name: document.getElementById("editProductName").value,
      price: parseInt(document.getElementById("editProductPrice").value),
      deposit: parseInt(document.getElementById("editProductDeposit").value),
      max_quantity: parseInt(
        document.getElementById("editProductMaxQuantity").value
      ),
      status: document.getElementById("editProductStatus").value,
      specifications: document.getElementById("editProductSpecifications")
        .value,
      pickup_info: document.getElementById("editProductPickupInfo").value,
      preorder_button_status: document.getElementById(
        "editProductPreorderButtonStatus"
      ).value,
      cell_open_status: document.getElementById("editProductCellOpenStatus")
        .value,
      cell_remaining_status: document.getElementById(
        "editProductCellRemainingStatus"
      ).value,
      sketchfab_embed_link: document.getElementById(
        "editProductSketchfabEmbedLink"
      ).value,
      product_introduction: document.getElementById("editProductIntroduction")
        .value,
      preorder_notes: document.getElementById("editProductPreorderNotes").value,
      main_colors: getSelectedColors("main"),
      sub_colors: getSelectedColors("sub"),
    };

    const thumbnailFile = document.getElementById("editProductThumbnail")
      .files[0];
    if (thumbnailFile) {
      formData.thumbnail = thumbnailFile;
    }

    const lightsliderFiles = document.getElementById(
      "editProductLightSliderImages"
    ).files;
    if (lightsliderFiles.length > 0) {
      Array.from(lightsliderFiles).forEach((file, index) => {
        formData[`lightslider_images`] = file;
      });
    }

    const sketchfabBackgroundFile = document.getElementById(
      "editProductSketchfabBackground"
    ).files[0];
    if (sketchfabBackgroundFile) {
      formData.sketchfab_background = sketchfabBackgroundFile;
    }

    await API.updateProduct(productId, formData);
    alert("商品更新成功！");
    loadProducts();
  } catch (error) {
    handleAPIError(error, "更新商品失敗");
  }
}

// 刪除商品
async function deleteProduct(productId) {
  if (!confirm("確定要刪除這個商品嗎？此操作無法復原。")) {
    return;
  }

  try {
    await API.deleteProduct(productId);
    alert("商品刪除成功！");
    loadProducts();
  } catch (error) {
    handleAPIError(error, "刪除商品失敗");
  }
}

// 同步前端商品配置 (已移除，改為前台動態載入)
async function syncProductConfig() {
  alert(
    "前端現在會自動從後台載入商品配置，無需手動同步！\n\n前台會自動獲取最新的商品資料和顏色選項。"
  );
}

// 載入客戶列表
async function loadCustomers() {
  const container = document.getElementById("customersList");
  container.innerHTML = '<div class="loading">載入中...</div>';

  try {
    const phoneFilter = document.getElementById("customerPhoneFilter").value;
    const params = phoneFilter ? { phone: phoneFilter } : {};

    console.log("載入客戶，參數:", params);
    const data = await API.getCustomers(params);
    console.log("客戶資料回應:", data);

    if (!data || !data.customers) {
      console.error("API 回應格式錯誤:", data);
      container.innerHTML =
        '<div class="error">載入客戶資料失敗：回應格式錯誤</div>';
      return;
    }

    displayCustomers(data.customers);
  } catch (error) {
    console.error("載入客戶失敗:", error);
    handleAPIError(error, "載入客戶失敗");
    container.innerHTML = '<div class="error">載入客戶失敗</div>';
  }
}

// 顯示客戶列表
function displayCustomers(customers) {
  const container = document.getElementById("customersList");

  // 確保 customers 是陣列
  if (!Array.isArray(customers)) {
    console.error("customers 不是陣列:", customers);
    container.innerHTML =
      '<div class="error">載入客戶資料失敗：資料格式錯誤</div>';
    return;
  }

  if (customers.length === 0) {
    container.innerHTML = "<p>沒有找到客戶</p>";
    return;
  }

  const customersHTML = customers
    .map(
      (customer) => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <strong>${customer.name}</strong><br>
                    <small>電話: ${customer.phone}</small>
                    ${
                      customer.email
                        ? `<br><small>信箱: ${customer.email}</small>`
                        : ""
                    }
                </div>
            </div>
            <div class="order-details">
                <p>註冊時間: ${formatDateTime(customer.created_at)}</p>
            </div>
        </div>
    `
    )
    .join("");

  container.innerHTML = customersHTML;
}

// 工具函數
function getStatusText(status) {
  const statusMap = {
    pending: "待處理",
    confirmed: "已確認",
    paid: "已付款",
    shipped: "已出貨",
    completed: "已完成",
    cancelled: "已取消",
  };
  return statusMap[status] || status;
}

function getProductStatusText(status) {
  const statusMap = {
    available: "可購買",
    sold_out: "已售完",
    discontinued: "已停售",
  };
  return statusMap[status] || status;
}

function getPreorderButtonStatusText(status) {
  const statusMap = {
    select_style: "請選擇款式/前往預購",
    sold_out: "已售完",
  };
  return statusMap[status] || status;
}

function getCellOpenStatusText(status) {
  const statusMap = {
    preparing: "準備中",
    open_for_preorder: "開放預購中",
    stopped_selling: "已停止販售",
  };
  return statusMap[status] || status;
}

function getCellRemainingStatusText(status) {
  const statusMap = {
    still_available: "尚有餘量",
    sold_out: "已售完",
  };
  return statusMap[status] || status;
}

function getPickupMethodText(method) {
  const methodMap = {
    self_pickup: "自取",
    delivery: "宅配",
  };
  return methodMap[method] || method;
}

function getPaymentMethodText(method) {
  const methodMap = {
    credit_card: "信用卡",
    bank_transfer: "銀行轉帳",
  };
  return methodMap[method] || method;
}

function showError(message) {
  console.error(message);
  // 在頁面上顯示錯誤訊息
  const errorDiv = document.createElement("div");
  errorDiv.className = "error";
  errorDiv.textContent = message;
  errorDiv.style.position = "fixed";
  errorDiv.style.top = "20px";
  errorDiv.style.right = "20px";
  errorDiv.style.zIndex = "1000";
  errorDiv.style.padding = "10px 20px";
  errorDiv.style.backgroundColor = "#f8d7da";
  errorDiv.style.color = "#721c24";
  errorDiv.style.border = "1px solid #f5c6cb";
  errorDiv.style.borderRadius = "5px";

  document.body.appendChild(errorDiv);

  // 3秒後自動移除
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 3000);
}

// 刪除單一訂單
async function deleteOrder(orderId, orderNumber) {
  const confirmed = confirm(
    `確定要刪除訂單 ${orderNumber} 嗎？\n\n此操作無法復原！`
  );

  if (!confirmed) {
    return;
  }

  try {
    console.log(`開始刪除訂單: ${orderId} (${orderNumber})`);

    const response = await fetch(`/api/orders/${orderId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("刪除成功:", result);

    // 顯示成功訊息
    showSuccessToast(`訂單 ${orderNumber} 已成功刪除`);

    // 重新載入訂單列表
    loadOrders();
  } catch (error) {
    console.error("刪除訂單失敗:", error);
    alert(`刪除訂單失敗: ${error.message}`);
  }
}

// 批量刪除所有訂單 (危險操作)
async function deleteAllOrders() {
  const confirmed = confirm(
    "⚠️ 警告：這將刪除所有訂單及相關資料！\n\n此操作無法復原，請再次確認是否要繼續？"
  );

  if (!confirmed) {
    return;
  }

  const doubleConfirmed = confirm(
    "最後確認：真的要清空所有訂單嗎？\n\n這包括：\n- 所有訂單記錄\n- 所有訂單明細\n\n此操作無法復原！"
  );

  if (!doubleConfirmed) {
    return;
  }

  try {
    console.log("開始批量刪除所有訂單...");

    const response = await fetch("/api/orders/batch/all", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        confirm: "DELETE_ALL_ORDERS",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("批量刪除成功:", result);

    // 顯示成功訊息
    showSuccessToast(
      `已清空所有訂單 (${result.deletedOrders} 筆訂單，${result.deletedItems} 筆明細)`
    );

    // 重新載入訂單列表
    loadOrders();
  } catch (error) {
    console.error("批量刪除訂單失敗:", error);
    alert(`批量刪除失敗: ${error.message}`);
  }
}

// 顯示成功訊息
function showSuccessToast(message) {
  const toast = document.createElement("div");
  toast.className = "success-toast";
  toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-size: 14px;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}

// 刪除單張圖片
async function deleteImage(imageType, productId, imageIndex = null) {
  try {
    if (
      !confirm(
        `確定要刪除這張${
          imageType === "thumbnail" ? "縮圖" : "LightSlider圖片"
        }嗎？`
      )
    ) {
      return;
    }

    const response = await fetch(`/api/products/${productId}/images`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageType: imageType,
        imageIndex: imageIndex,
      }),
    });

    if (response.ok) {
      showSuccessToast("圖片刪除成功！");
      // 重新載入商品編輯表單
      await editProduct(productId);
    } else {
      const error = await response.json();
      throw new Error(error.message || "刪除圖片失敗");
    }
  } catch (error) {
    console.error("刪除圖片失敗:", error);
    alert("刪除圖片失敗: " + error.message);
  }
}

// 刪除所有LightSlider圖片
async function deleteAllImages(imageType, productId) {
  try {
    if (
      !confirm(
        `確定要刪除所有${
          imageType === "thumbnail" ? "縮圖" : "LightSlider圖片"
        }嗎？`
      )
    ) {
      return;
    }

    const response = await fetch(`/api/products/${productId}/images`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageType: imageType,
        deleteAll: true,
      }),
    });

    if (response.ok) {
      showSuccessToast("所有圖片刪除成功！");
      // 重新載入商品編輯表單
      await editProduct(productId);
    } else {
      const error = await response.json();
      throw new Error(error.message || "刪除圖片失敗");
    }
  } catch (error) {
    console.error("刪除圖片失敗:", error);
    alert("刪除圖片失敗: " + error.message);
  }
}
