document.querySelectorAll('.news-button').forEach(button => {
    button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        const icon = button.querySelector('.icon');
        const title = button.querySelector('h3');  
        
        // 關閉其他已開啟的項目
        document.querySelectorAll('.news-content').forEach(item => {
            if (item !== content) {
                item.classList.remove('active');
                const prevButton = item.previousElementSibling;
                prevButton.querySelector('.icon').classList.remove('active');
                prevButton.classList.remove('active');  
                prevButton.querySelector('h3').classList.remove('active');  
            }
        });

        // 切換選擇的項目
        content.classList.toggle('active');
        icon.classList.toggle('active');
        button.classList.toggle('active');
        title.classList.toggle('active');  
    });
});