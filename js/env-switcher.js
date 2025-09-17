/**
 * 環境切換工具
 * 用於在本地開發時測試不同環境的 API
 */

class EnvironmentSwitcher {
  constructor() {
    this.init();
  }

  init() {
    // 創建環境切換按鈕
    this.createSwitcherUI();
    this.updateDisplay();
  }

  createSwitcherUI() {
    // 檢查是否已存在切換器
    if (document.getElementById('env-switcher')) {
      return;
    }

    // 創建切換器容器
    const switcher = document.createElement('div');
    switcher.id = 'env-switcher';
    switcher.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      min-width: 200px;
    `;

    // 標題
    const title = document.createElement('div');
    title.textContent = '🔧 API 環境切換';
    title.style.cssText = 'font-weight: bold; margin-bottom: 8px;';

    // 當前環境顯示
    const currentEnv = document.createElement('div');
    currentEnv.id = 'current-env-display';
    currentEnv.style.cssText = 'margin-bottom: 8px; font-size: 11px;';

    // 按鈕容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 4px; flex-wrap: wrap;';

    // 創建環境按鈕
    const environments = ['local', 'railway', 'vercel'];
    environments.forEach(env => {
      const button = document.createElement('button');
      button.textContent = env;
      button.style.cssText = `
        padding: 4px 8px;
        border: 1px solid #ccc;
        background: #333;
        color: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 10px;
      `;
      button.onclick = () => this.switchEnvironment(env);
      buttonContainer.appendChild(button);
    });

    // 清除按鈕
    const clearButton = document.createElement('button');
    clearButton.textContent = '清除';
    clearButton.style.cssText = `
      padding: 4px 8px;
      border: 1px solid #ccc;
      background: #666;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 10px;
    `;
    clearButton.onclick = () => this.clearEnvironment();
    buttonContainer.appendChild(clearButton);

    // 組裝 UI
    switcher.appendChild(title);
    switcher.appendChild(currentEnv);
    switcher.appendChild(buttonContainer);

    // 添加到頁面
    document.body.appendChild(switcher);
  }

  switchEnvironment(env) {
    if (window.API && window.API.setEnvironment) {
      const success = window.API.setEnvironment(env);
      if (success) {
        this.updateDisplay();
        this.showNotification(`已切換至 ${env} 環境`);
        // 重新載入頁面以應用新環境
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } else {
      console.error('API 類別未載入');
    }
  }

  clearEnvironment() {
    if (window.API && window.API.clearEnvironment) {
      window.API.clearEnvironment();
      this.updateDisplay();
      this.showNotification('已清除手動環境設定');
      // 重新載入頁面
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  updateDisplay() {
    const display = document.getElementById('current-env-display');
    if (display && window.API) {
      const envInfo = window.API.getEnvironmentInfo();
      const currentURL = envInfo.current;
      const manualEnv = envInfo.manual;
      
      display.innerHTML = `
        <div>當前: ${manualEnv ? manualEnv : '自動檢測'}</div>
        <div style="color: #ccc; font-size: 10px;">${currentURL}</div>
      `;
    }
  }

  showNotification(message) {
    // 創建通知元素
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 14px;
      z-index: 10001;
      animation: fadeInOut 2s ease-in-out;
    `;

    // 添加動畫樣式
    if (!document.getElementById('env-switcher-styles')) {
      const style = document.createElement('style');
      style.id = 'env-switcher-styles';
      style.textContent = `
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // 2秒後移除通知
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2000);
  }
}

// 自動初始化環境切換器
document.addEventListener('DOMContentLoaded', () => {
  // 只在本地環境顯示切換器
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    new EnvironmentSwitcher();
  }
});

// 導出類別供手動使用
window.EnvironmentSwitcher = EnvironmentSwitcher;
