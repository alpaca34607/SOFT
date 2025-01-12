// script.js
// 模擬角色資料
const characters = [
    {
        id: 1,
        name: "軟筋",
        description: "隨遇而安的小貓仔，擅長融入各種環境，沒什麼主見，總是在任何想軟爛的地方擺出軟軟姿態。",
        thumbnailUrl: "./images/gallery/soft-card.png",
        photos: [
            {
                id: 1,
                url: "./images/gallery/soft-christmas.png",
                caption: ""
            },
            {
                id: 2,
                url: "./images/gallery/soft-vampire.png",
                caption: ""
            },
            {
                id: 3,
                url: "./images/gallery/soft-chips.png",
                caption: ""
            },
            {
                id: 4,
                url: "./images/gallery/soft-sleep.png",
                caption: ""
            },
            {
                id: 5,
                url: "./images/gallery/soft-lying.png",
                caption: ""
            },
        ]
    },
    {
        id: 2,
        name: "軟吉拉",
        description: "心寬體胖的軟軟版哥吉拉，喜歡汽水、甜食、爆米花。肚子不餓的時候很溫和，但餓到了可就另當別論。",
        thumbnailUrl: "./images/gallery/softzilla-card.png",
        photos: [
            {
                id: 1,
                url: "./images/gallery/softzilla.png",
                caption: ""
            },
            {
                id: 2,
                url: "./images/gallery/softzilla-halloween.png",
                caption: ""
            },
            {
                id: 3,
                url: "./images/gallery/softzilla-blue.png",
                caption: ""
            },
            {
                id: 4,
                url: "./images/gallery/softzilla-camp.png",
                caption: ""
            },
           
           
        ]
    },
    {
        id: 3,
        name: "軟龍",
        description: "代表著吉祥之兆的軟龍，雖然外觀像白帶魚，但以生物學來說是爬蟲類，龍華富貴。",
        thumbnailUrl: "./images/gallery/softdragon-card.png",
        photos: [
            {
                id: 1,
                url: "./images/gallery/softdragon.png",
                caption: ""
            },
        
        ]
    },
    {
        id:4,
        name: "軟泥馬",
        description: "平時喜歡坐在柔軟的草地，像隻毛毛蟲靜靜享受溫暖的陽光。個性溫和，即使莫名被當成坐騎也毫無反應。",
        thumbnailUrl: "./images/gallery/softpaca-card.png",
        photos: [
            {
                id: 1,
                url: "./images/gallery/softpaca.png",
                caption: ""
            },
        
        ]
    },
    {
        id:5,
        name: "軟呱",
        description: "平時喜歡坐在柔軟的草地，像隻毛毛蟲靜靜享受溫暖的陽光。個性溫和，即使莫名被當成坐騎也毫無反應。",
        thumbnailUrl: "./images/gallery/softduck-card.png",
        photos: [
            {
                id: 1,
                url: "./images/gallery/softduck.png",
                caption: ""
            },
        
        ]
    },
    // ... 其他角色資料
];

let currentPage = 1;
let currentCharacter = null;
let currentPhotoIndex = 0;

// DOM 元素
const cardGrid = document.getElementById('cardGrid');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const albumSection = document.getElementById('albumSection');
const prevPhotoBtn = document.getElementById('prevPhoto');
const nextPhotoBtn = document.getElementById('nextPhoto');

// 初始化頁面
function initializePage() {
    renderCards();
    updatePaginationButtons();

    // 自動選擇第一個角色
    const firstCharacter = characters[0];
    showCharacterAlbum(firstCharacter.id);

    // 為第一張卡片添加選中效果
    const firstCard = cardGrid.querySelector('.character-card');
    if (firstCard) {
        firstCard.classList.add('active');
    }
}

// 渲染角色卡片
function renderCards() {
    const startIndex = (currentPage - 1) * 12;
    const endIndex = startIndex + 12;
    const currentCharacters = characters.slice(startIndex, endIndex);

    cardGrid.innerHTML = currentCharacters.map(char => `
        <div class="character-card ${char.id === currentCharacter?.id ? 'active' : ''}" 
             data-id="${char.id}">
            <img src="${char.thumbnailUrl}" alt="${char.name}">
        </div>
    `).join('');

    // 添加點擊事件
    cardGrid.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', () => {
            // 移除所有卡片的選中狀態
            cardGrid.querySelectorAll('.character-card').forEach(c =>
                c.classList.remove('active')
            );
            // 添加當前卡片的選中狀態
            card.classList.add('active');
            showCharacterAlbum(parseInt(card.dataset.id));
        });
    });
}

// 更新分頁按鈕狀態
function updatePaginationButtons() {
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === 2;
    pageInfo.textContent = `${currentPage} / 2`;
}

// 顯示角色相簿
function showCharacterAlbum(characterId) {
    currentCharacter = characters.find(char => char.id === characterId);
    currentPhotoIndex = 0;

    const albumContent = albumSection.querySelector('.album-content');
    albumContent.querySelector('.character-name').textContent = currentCharacter.name;
    albumContent.querySelector('.character-description').textContent = currentCharacter.description;
    albumContent.querySelector('.character-sname').textContent = currentCharacter.name;

    updateMainPhoto();
    updateThumbnails();
    albumSection.style.display = 'block';
}

// 更新主要照片
function updateMainPhoto() {
    const mainPhoto = albumSection.querySelector('.main-photo');
    mainPhoto.innerHTML = `
        <img src="${currentCharacter.photos[currentPhotoIndex].url}" 
             alt="${currentCharacter.name}">
        ${currentCharacter.photos[currentPhotoIndex].caption ?
            `<div class="photo-caption">${currentCharacter.photos[currentPhotoIndex].caption}</div>`
            : ''}
    `;
}

// 更新縮圖列表
function updateThumbnails() {
    const thumbnailList = albumSection.querySelector('.thumbnail-list');
    thumbnailList.innerHTML = currentCharacter.photos.map((photo, index) => `
        <div class="thumbnail-item ${index === currentPhotoIndex ? 'active' : ''}">
            <img src="${photo.url}" 
                 alt="thumbnail" 
                 onclick="changePhoto(${index})">
            ${photo.caption ? `<div class="thumbnail-caption">${photo.caption}</div>` : ''}
        </div>
    `).join('');
}

// 切換照片
function changePhoto(index) {
    currentPhotoIndex = index;
    updateMainPhoto();
    updateThumbnails();
}

// 事件監聽器
prevPageBtn.addEventListener('click', () => {
    currentPage--;
    renderCards();
    updatePaginationButtons();
});

nextPageBtn.addEventListener('click', () => {
    currentPage++;
    renderCards();
    updatePaginationButtons();
});

prevPhotoBtn.addEventListener('click', () => {
    if (currentPhotoIndex > 0) {
        changePhoto(currentPhotoIndex - 1);
    }
});

nextPhotoBtn.addEventListener('click', () => {
    if (currentPhotoIndex < currentCharacter.photos.length - 1) {
        changePhoto(currentPhotoIndex + 1);
    }
});

// 初始化頁面
initializePage();