document.addEventListener('DOMContentLoaded', () => {
    const productData = [
        { id: 1, title: '監修中 | 戶外風軟吉拉', link:'./product-Softzilla.html', price: 2500, imgUrl: './images/shop/product-SoftzillaOD-thumb.jpg', status:'status-avalible',statusText:'開放預購中', marker:'尚有餘量' ,markerColor:'markerLight'},
        { id: 2, title: '2023出品 | 軟吉拉公仔',link:'./product-Softzilla.html', price: 1500, imgUrl: './images/shop/product-Softzilla-thumb.jpg', status:'status-avalible',statusText:'開放預購中',marker:'尚有餘量',markerColor:'markerLight' },
        { id: 3, title: '2019出品 | 軟筋臥佛公仔', link:'./product-Softzilla.html', price: 1500, imgUrl: './images/shop/product-Soft-thumb.jpg',status:'status-soldout',statusText:'已停止販售',marker:'已售完',markerColor:'markerGrey' },
        { id: 4, title: '2018出品 | 小貓仔黏土偶', link:'./product-Softzilla.html', price: 500, imgUrl: './images/shop/product-Softtwice-thumb.jpg', status:'status-soldout',statusText:'已停止販售', marker:'已售完',markerColor:'markerGrey'},
    ];

    const tbody = document.querySelector('tbody');
    const sortBtn = document.getElementById('sortBtn');
    const sortIcon = sortBtn.querySelector('.sort-icon');
    const searchInput = document.getElementById('search');
    let isAscending = true;

    function updateSortButton() {
        sortIcon.classList.toggle('descending', !isAscending);
        sortBtn.classList.toggle('active');
    }

    function renderProducts(products) {
        tbody.innerHTML = products.map(product => `
       
<tr>
    <td class="product-cell">
        <a href="${product.link}">
            <div class="cell-bg"><img src="./images/shop/Union.svg"></div>
            <div class="${product.status}">${product.statusText}</div>
            <figure class="product-figure">
                <div class="img-wrapper">
                    <div class="${product.markerColor}"> ${product.marker}</div>
                    <img src="${product.imgUrl}" alt="${product.title}">
                </div>
                <figcaption>
                    <div class="product-title">${product.title}</div>
                    <div class="price-cell">NT.${product.price}</div>
                </figcaption>
            </figure>
        </a>
    </td>
</tr>
        
        `).join('');
    }

    function filterAndSortProducts() {
        let filtered = [...productData];

        // 搜尋過濾
        if (searchInput.value) {
            filtered = filtered.filter(product =>
                product.title.includes(searchInput.value)
            );
        }

        
        // 排序
        filtered.sort((a, b) => {
            return isAscending ?
                a.id - b.id :
                b.id - a.id;
        });

        renderProducts(filtered);
    }

    // 事件監聽
    sortBtn.addEventListener('click', () => {
        isAscending = !isAscending;
        updateSortButton();
        filterAndSortProducts();
    });
    searchInput.addEventListener('input', filterAndSortProducts);

    // 初始渲染
    filterAndSortProducts();
});