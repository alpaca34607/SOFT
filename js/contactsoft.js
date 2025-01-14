// 聯絡軟筋表單
const openContactBtn = document.getElementById('open-contact');
const closeContactBtn = document.getElementById('close-contact');
const contactPopup = document.getElementById('contact-popup');
const contactForm = document.getElementById('contact-form');
const messageInput = document.getElementById('message');
const charCount = document.getElementById('char-count');

// 開啟聯絡表單彈窗
openContactBtn.addEventListener('click', () => {
    contactPopup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
});

// 關閉聯絡表單彈窗
closeContactBtn.addEventListener('click', () => {
    contactPopup.style.display = 'none';
    document.body.style.overflow = '';
});

// 點擊外部關閉聯絡表單彈窗
window.addEventListener('click', (event) => {
    if (event.target === contactPopup) {
        contactPopup.style.display = 'none';
        document.body.style.overflow = '';
    }
});

// 字數計算
messageInput.addEventListener('input', () => {
    charCount.textContent = messageInput.value.length;
});

// 表單提交
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
  
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    console.log('表單提交的數資料:', formData);
    
    // 清空表單
    contactForm.reset();
    
    // 關閉彈窗
    Contact.style.display = 'none';
    document.body.style.overflow = '';
    
    // 交出表單後的提示訊息
    alert('感謝您的回饋！');
});