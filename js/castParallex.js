function castParallax() {
    // 預先取得元素，避免重複查詢
    const secondSection = document.querySelector("#about-soft-intro");
    const layers = document.getElementsByClassName("parallax");
    
    // 初始化時先設定初始位置
    function initParallax() {
        const secondSectionTop = secondSection.offsetTop;
        const initialTop = window.pageYOffset;
        
        // 為每個視差層設定初始位置
        Array.from(layers).forEach(layer => {
            const speed = layer.getAttribute("data-speed");
            const initialYPos = -((initialTop - secondSectionTop) * speed / 100);
            
            // 使用 CSS transform 設定初始位置
            layer.style.transform = `translate3d(0px, ${initialYPos}px, 0px)`;
            
            // 添加過渡效果，但只在初始化後才添加
            setTimeout(() => {
                layer.style.transition = 'transform 0.05s linear';
            }, 100);
        });
    }

    // 處理滾動事件
    function handleScroll() {
        const top = window.pageYOffset;
        const secondSectionTop = secondSection.offsetTop;
        
        // 不管是否滾動到第二區段都計算位置，只是在之前位移為 0
        Array.from(layers).forEach(layer => {
            const speed = layer.getAttribute("data-speed");
            let yPos = 0;
            
            if (top >= secondSectionTop) {
                yPos = -((top - secondSectionTop) * speed / 100);
            }
            
            // 使用 requestAnimationFrame 優化性能
            requestAnimationFrame(() => {
                layer.style.transform = `translate3d(0px, ${yPos}px, 0px)`;
            });
        });
    }

    // 監聽滾動事件，使用 throttle 優化性能
    let ticking = false;
    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    // 初始化
    initParallax();
    
    // 監聽視窗大小改變
    window.addEventListener("resize", initParallax);
}

// 確保 DOM 完全載入後才執行
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", castParallax);
} else {
    castParallax();
}