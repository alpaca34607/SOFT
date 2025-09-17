// API 基礎設定
const API_BASE_URL = "http://localhost:3000/api";

// 環境配置
const ENV_CONFIG = {
  // 本地開發環境
  local: "http://localhost:3000",
  // Railway 測試環境
  railway: "https://soft-bio-backend-staging.up.railway.app",
  // Vercel 正式環境 (請替換為您的實際網址)
  vercel: "https://your-vercel-domain.vercel.app"
};

// API 請求工具函數
class API {
  static get baseURL() {
    // 檢查是否有手動設定的環境
    const manualEnv = localStorage.getItem('API_ENVIRONMENT');
    if (manualEnv && ENV_CONFIG[manualEnv]) {
      console.log(`🔧 使用手動設定環境: ${manualEnv} -> ${ENV_CONFIG[manualEnv]}`);
      return ENV_CONFIG[manualEnv];
    }

    // 自動檢測 API 基礎 URL
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return ENV_CONFIG.local;
    } else if (window.location.hostname.includes("railway.app")) {
      // Railway 部署環境
      return window.location.origin;
    } else if (window.location.hostname.includes("vercel.app")) {
      // Vercel 部署環境
      return window.location.origin;
    } else {
      // 其他生產環境：使用相對路徑
      return window.location.origin;
    }
  }

  // 手動設定 API 環境
  static setEnvironment(env) {
    if (ENV_CONFIG[env]) {
      localStorage.setItem('API_ENVIRONMENT', env);
      console.log(`✅ API 環境已切換至: ${env} (${ENV_CONFIG[env]})`);
      return true;
    } else {
      console.error(`❌ 無效的環境: ${env}`);
      console.log('可用環境:', Object.keys(ENV_CONFIG));
      return false;
    }
  }

  // 清除手動環境設定
  static clearEnvironment() {
    localStorage.removeItem('API_ENVIRONMENT');
    console.log('🔄 已清除手動環境設定，恢復自動檢測');
  }

  // 獲取當前環境資訊
  static getEnvironmentInfo() {
    const manualEnv = localStorage.getItem('API_ENVIRONMENT');
    const currentURL = this.baseURL;
    return {
      manual: manualEnv,
      current: currentURL,
      available: ENV_CONFIG
    };
  }

  static async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // 如果 body 是 FormData，不設置 Content-Type（讓瀏覽器自動處理）
    const isFormData = options.body instanceof FormData;

    const defaultOptions = {
      headers: isFormData
        ? {}
        : {
            "Content-Type": "application/json",
          },
    };

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, finalOptions);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {
            error: `HTTP ${response.status}: ${response.statusText}`,
          };
        }
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw error;
    }
  }

  // 健康檢查
  static async checkHealth() {
    try {
      const result = await this.request("/api/health");
      return result.status === "success";
    } catch (error) {
      console.error("API 健康檢查失敗:", error);
      return false;
    }
  }

  // 訂單相關 API
  static async createOrder(orderData) {
    return this.request("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  static async getOrders() {
    return this.request("/api/orders");
  }

  static async getOrderById(orderId) {
    return this.request(`/api/orders/${orderId}`);
  }

  static async searchOrdersByPhone(phone) {
    return this.request(`/api/orders/search/phone/${phone}`);
  }

  static async updateOrderStatus(orderId, status) {
    console.log("發送更新訂單狀態請求:", { orderId, status });
    return this.request(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // 產品相關 API
  static async getProducts() {
    return this.request("/api/products");
  }

  static async getProductById(productId) {
    return this.request(`/api/products/${productId}`);
  }

  static async createProduct(productData) {
    const formData = new FormData();

    // 添加基本資料
    Object.keys(productData).forEach((key) => {
      // 多圖上傳處理
      if (key === "lightslider_images" && Array.isArray(productData[key])) {
        productData[key].forEach((file) => {
          if (file instanceof File) {
            formData.append("lightslider_images", file);
          }
        });
        return;
      }
      if (
        (key === "thumbnail" ||
          key === "lightslider_images" ||
          key === "sketchfab_background" ||
          key === "product_introduction" ||
          key === "preorder_notes") &&
        productData[key] instanceof File
      ) {
        formData.append(key, productData[key]);
      } else if (key === "main_colors" || key === "sub_colors") {
        formData.append(key, JSON.stringify(productData[key]));
      } else {
        formData.append(key, productData[key]);
      }
    });

    return this.request("/api/products", {
      method: "POST",
      body: formData,
    });
  }

  static async updateProduct(productId, productData) {
    const formData = new FormData();

    // 添加基本資料
    Object.keys(productData).forEach((key) => {
      // 多圖上傳處理
      if (key === "lightslider_images" && Array.isArray(productData[key])) {
        productData[key].forEach((file) => {
          if (file instanceof File) {
            formData.append("lightslider_images", file);
          }
        });
        return;
      }
      if (
        (key === "thumbnail" ||
          key === "lightslider_images" ||
          key === "sketchfab_background" ||
          key === "product_introduction" ||
          key === "preorder_notes") &&
        productData[key] instanceof File
      ) {
        formData.append(key, productData[key]);
      } else if (key === "main_colors" || key === "sub_colors") {
        formData.append(key, JSON.stringify(productData[key]));
      } else {
        formData.append(key, productData[key]);
      }
    });

    return this.request(`/api/products/${productId}`, {
      method: "PUT",
      body: formData,
    });
  }

  static async deleteProduct(productId) {
    return this.request(`/api/products/${productId}`, {
      method: "DELETE",
    });
  }

  static async updateProductStock(productId, stockData) {
    return this.request(`/api/products/${productId}/stock`, {
      method: "PATCH",
      body: JSON.stringify(stockData),
    });
  }

  // 這些方法已移除，因為前台現在會動態載入後台資料
  static async generateProductConfig() {
    return { success: true, message: "前台現在會自動從後台載入商品配置" };
  }

  static async updateProductConfigFile() {
    return { success: true, message: "前台現在會自動從後台載入商品配置" };
  }

  // 客戶相關 API
  static async getCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/customers?${queryString}`
      : "/api/customers";
    return this.request(endpoint);
  }

  static async getCustomerById(customerId) {
    return this.request(`/api/customers/${customerId}`);
  }

  static async createCustomer(customerData) {
    return this.request("/api/customers", {
      method: "POST",
      body: JSON.stringify(customerData),
    });
  }

  static async updateCustomer(customerId, customerData) {
    return this.request(`/api/customers/${customerId}`, {
      method: "PUT",
      body: JSON.stringify(customerData),
    });
  }

  static async deleteCustomer(customerId) {
    return this.request(`/api/customers/${customerId}`, {
      method: "DELETE",
    });
  }
}

// 全域 API 健康檢查函數
async function checkAPIHealth() {
  try {
    const isHealthy = await API.checkHealth();
    if (isHealthy) {
      console.log("✅ API 連接正常:", await API.request("/api/health"));
    } else {
      console.log("❌ API 連接失敗");
    }
    return isHealthy;
  } catch (error) {
    console.error("❌ API 健康檢查失敗:", error);
    return false;
  }
}

// 錯誤處理工具
function handleAPIError(error, fallbackMessage = "操作失敗") {
  console.error("API 錯誤:", error);

  // 顯示用戶友好的錯誤訊息
  const message = error.message || fallbackMessage;

  // 如果是網路錯誤，提示用戶檢查連接
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    alert("無法連接到伺服器，請檢查網路連接或稍後再試");
  } else {
    alert(message);
  }
}

// 載入狀態管理
class LoadingManager {
  constructor() {
    this.loadingElements = new Set();
  }

  show(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = "block";
      this.loadingElements.add(elementId);
    }
  }

  hide(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = "none";
      this.loadingElements.delete(elementId);
    }
  }

  hideAll() {
    this.loadingElements.forEach((id) => this.hide(id));
  }
}

// 全域載入管理器
const loadingManager = new LoadingManager();

// 將 API 類別和健康檢查函數設為全域可用
window.API = API;
window.checkAPIHealth = checkAPIHealth;
window.handleAPIError = handleAPIError;
window.loadingManager = loadingManager;

// 確保函數在模組載入後立即可用
console.log("API 模組已載入，可用函數:", {
  API: typeof API,
  checkAPIHealth: typeof checkAPIHealth,
  handleAPIError: typeof handleAPIError,
  loadingManager: typeof loadingManager,
});
