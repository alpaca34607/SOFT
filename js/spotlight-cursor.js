document.body.addEventListener("mousemove", evt => {
  const mouseX = evt.clientX;
  const mouseY = evt.clientY;

  // 設定滑鼠的自訂游標位置
  gsap.set(".cursor", {
    x: mouseX + 5, // 使游標中心偏移
    y: mouseY + 5
  });

  gsap.to(".shape", {
    x: mouseX,
    y: mouseY,
    stagger: -0.1
  });

  // 偵測滑鼠周圍的50px範圍
  const clickableElements = document.querySelectorAll('.clickable');
  clickableElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const elementX = rect.left + rect.width / 2;
    const elementY = rect.top + rect.height / 2;

    const distance = Math.sqrt(Math.pow(mouseX - elementX, 2) + Math.pow(mouseY - elementY, 2));

    // 假設距離小於 25px 就算是可點擊範圍
    if (distance <= 25) {
      el.classList.add('hover'); // 增加 hover 類別，或其他行為
    } else {
      el.classList.remove('hover');
    }
  });
});
