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
        id: 4,
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
        id: 5,
        name: "軟呱",
        description: "軟雞的拌嘴對象，喜歡逢人就饑哩呱啦，喋喋不休的講個沒完，只有軟雞有辦法聽下去。",
        thumbnailUrl: "./images/gallery/softduck-card.png",
        photos: [
            {
                id: 1,
                url: "./images/gallery/softduck.png",
                caption: ""
            },

        ]
    },
    {
        id: 6,
        name: "軟雞",
        description: "軟呱的拌嘴對象，跟軟呱總是雞同鴨講，但他們總是在一起。在樂團是個鼓手，以「雞軟鼓」為藝名活躍。",
        thumbnailUrl: "./images/gallery/softchicken-card.png",
        photos: [
            {
                id: 1,
                url: "./images/gallery/softchicken.png",
                caption: ""
            },
            {
                id: 2,
                url: "./images/gallery/softchicken_sit.png",
                caption: ""
            },

        ]
    },
    {
        id: 7,
        name: "心太軟",
        description: "不只有外表是柔軟的心型，心太軟胸口內其實也有一顆易碎的心。但只要牠還跳動著，心太軟就會努力站起來。",
        thumbnailUrl: "./images/gallery/softheart-card.png",
        photos: [
            {
                id: 1,
                url: "./images/gallery/softheart.png",
                caption: ""
            },
          
        ]
    },
    {
        id: 8,
        name: "軟兔",
        description: "比起胡蘿蔔，軟兔其實比較喜歡蔬果軟性飲料，畢竟咀嚼久了臉頰也是會痠的。",
        thumbnailUrl: "./images/gallery/softrabbit-card.png",
        photos: [
            {
                id: 1,
                url: "./images/gallery/softrabbit.png",
                caption: ""
            },
          
        ]
    },
    {
        id: 9,
        name: "軟蛙",
        description: "軟蛙是一隻旅行青蛙，常常啟程也常常半途倒下。「不想旅行了...」若在景點聽到這句嘆息，不防看看附近是否躺著軟蛙。",
        thumbnailUrl: "./images/gallery/softfrog-card.png",
        photos: [
            {
                id: 1,
                url: "./images/gallery/softfrog.png",
                caption: ""
            },
            {
                id: 2,
                url: "./images/gallery/softfrog-hat.png",
                caption: ""
            },
          
        ]
    },
    {
        id: 10,
        name: "軟馬",
        description: "「馬上就來!」雖然這樣喊著，但其實還是在原地軟爛，軟馬的步調就是這樣悠閒自在。",
        thumbnailUrl: "./images/gallery/softhorse-card.png",
        photos: [
            {
                id: 1,
                url: "./images/gallery/softhorse.png",
                caption: ""
            },
         
        ]
    },
    {
        id: 11,
        name: "多力多軟",
        description: "被開封之後就被遺忘的多力多滋受潮後的化身，雖然知道再也不會被想起來了，但他還是躺在原地。",
        thumbnailUrl: "./images/gallery/doritosoft-card.png",
        photos: [
            {
                id: 1,
                url: "./images/gallery/doritosoft.png",
                caption: ""
            },
            {
                id: 2,
                url: "./images/gallery/doritosoft2.png",
                caption: ""
            },
         
        ]
    },
    {
        id: 12,
        name: "軟熊",
        description: "胸口有個帥氣的V字，但很少人見過。只要軟熊不想起床，一年四季的賴床全部都算冬眠。",
        thumbnailUrl: "./images/gallery/softbear-card.png",
        photos: [
            {
                id: 1,
                url: "./images/gallery/softbear.png",
                caption: ""
            },
         
        ]
    },
    {
        id: 13,
        name: "基多軟",
        description: "基多軟有3個頭，雖然共用一個身體，但彼此之間其實好像沒有很熟。不過休息時間還是會一起斷電",
        thumbnailUrl: "./images/gallery/Ghidorah-card.png",
        photos: [
            {
                id: 1,
                url: "./images/gallery/Ghidorah.png",
                caption: ""
            },
         
        ]
    },
    {
        id: 14,
        name: "軟糬人",
        description: "被放太久的小米甜甜圈，變硬之後開始到處趴趴走。只要裹上不同口味的調味粉就會成為不同屬性的英雄。",
        thumbnailUrl: "./images/gallery/sofman-card.png",
        photos: [
            {
                id: 1,
                url: "./images/gallery/softman.png",
                caption: ""
            },
         
        ]
    },
    {
        id: 15,
        name: "軟陽陽",
        description: "只要比別人都早起就會得意洋洋的軟陽陽，即使到了秋天也掛在空中跩跩的笑著。",
        thumbnailUrl: "./images/gallery/softsun-card.png",
        photos: [
            {
                id: 1,
                url: "./images/gallery/softsun.png",
                caption: ""
            },
         
        ]
    },
    {
        id: 16,
        name: "軟蝸",
        description: "看似不起眼的軟蝸，在被觀測的時候總是行動緩慢。然而沒有人知道他真正的實力，其實就是這麼慢",
        thumbnailUrl: "./images/gallery/softsnail-card.png",
        photos: [
            {
                id: 1,
                url: "./images/gallery/softsnail.png",
                caption: ""
            },
         
        ]
    },
    // 
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

    // 點擊事件
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
             alt="${currentCharacter.name}" >
           
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