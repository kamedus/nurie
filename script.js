// 画面要素の取得
const selectionScreen = document.getElementById('selectionScreen');
const drawingScreen = document.getElementById('drawingScreen');
const imageGrid = document.getElementById('imageGrid');
const backButton = document.getElementById('backButton');
const currentImageTitle = document.getElementById('currentImageTitle');

// 塗り絵関連要素
const drawingCanvas = document.getElementById('drawingCanvas');
const ctx = drawingCanvas.getContext('2d');
const baseImage = document.getElementById('baseImage');
const resetButton = document.getElementById('resetButton');

let isDrawing = false;
const BRUSH_RADIUS = 5;
let currentImageSet = null; // 現在選択されている画像セット
let originalDisplaySize = null; // 初回計算時のサイズを保存

// 利用可能な塗り絵画像セット
const imagesets = [
    {
        id: 1,
        title: '可愛い動物',
        colorImage: 'images/color1.png',
        monoImage: 'images/mono1.png'
    },
    {
        id: 2,
        title: 'ひなまつり',
        colorImage: 'images/color2.png',
        monoImage: 'images/mono2.png'
    },
    {
        id: 3,
        title: 'ハロウィン',
        colorImage: 'images/color3.png',
        monoImage: 'images/mono3.png'
    },
    {
        id: 4,
        title: 'おさるさん',
        colorImage: 'images/color4.png',
        monoImage: 'images/mono4.png',
        offsetY: 20  // 背景画像を下に20px移動
    },
    {
        id: 5,
        title: 'イルカさん',
        colorImage: 'images/color5.png',
        monoImage: 'images/mono5.jpg',
        offsetX: 10  // 背景画像を右に10px移動
    }
];

// 画像選択画面の初期化
function initSelectionScreen() {
    imageGrid.innerHTML = '';
    
    imagesets.forEach(imageSet => {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.onclick = () => selectImage(imageSet);
        
        card.innerHTML = `
            <img src="${imageSet.colorImage}" alt="${imageSet.title}">
            <h3>${imageSet.title}</h3>
        `;
        
        imageGrid.appendChild(card);
    });
}

// 画像選択処理
function selectImage(imageSet) {
    currentImageSet = imageSet;
    currentImageTitle.textContent = imageSet.title;
    baseImage.src = imageSet.colorImage;
    
    // サイズ情報を完全にリセット
    originalDisplaySize = null;
    
    // キャンバスのスタイルをリセット
    drawingCanvas.style.width = '';
    drawingCanvas.style.height = '';
    baseImage.style.width = '';
    baseImage.style.height = '';
    
    // 画面切り替え
    selectionScreen.classList.add('hidden');
    drawingScreen.classList.remove('hidden');
    
    // 塗り絵キャンバスの初期化
    initDrawingCanvas();
}

// 塗り絵キャンバスの初期化
function initDrawingCanvas(isReset = false) {
    if (!currentImageSet) return;
    
    const monoImage = new Image();
    monoImage.src = currentImageSet.monoImage;
    monoImage.onerror = () => {
        console.error('Failed to load mono image:', currentImageSet.monoImage);
        alert(`画像の読み込みに失敗しました: ${currentImageSet.title}`);
    };
    monoImage.onload = () => {
        // 画像の自然なサイズ
        const naturalWidth = monoImage.naturalWidth;
        const naturalHeight = monoImage.naturalHeight;
        const aspectRatio = naturalWidth / naturalHeight;
        
        let displayWidth, displayHeight;
        
        if (isReset && originalDisplaySize) {
            // リセット時は初回計算サイズを使用
            displayWidth = originalDisplaySize.width;
            displayHeight = originalDisplaySize.height;
        } else {
            // 初回または画面サイズ変更時のみ新規計算
            const containerRect = document.querySelector('.canvas-container').getBoundingClientRect();
            const maxWidth = containerRect.width * 0.9;
            const maxHeight = containerRect.height * 0.9;
            
            // 表示サイズを計算（アスペクト比を維持）
            if (maxWidth / maxHeight > aspectRatio) {
                // 高さが制限要因
                displayHeight = Math.min(maxHeight, naturalHeight);
                displayWidth = displayHeight * aspectRatio;
            } else {
                // 幅が制限要因
                displayWidth = Math.min(maxWidth, naturalWidth);
                displayHeight = displayWidth / aspectRatio;
            }
            
            // 初回計算サイズを保存（isResetがfalseの場合のみ）
            if (!isReset) {
                originalDisplaySize = { width: displayWidth, height: displayHeight };
            }
        }
        
        // キャンバスサイズは元画像サイズに設定（高解像度維持）
        drawingCanvas.width = naturalWidth;
        drawingCanvas.height = naturalHeight;
        
        // 表示サイズを設定
        drawingCanvas.style.width = `${displayWidth}px`;
        drawingCanvas.style.height = `${displayHeight}px`;
        
        baseImage.style.width = `${displayWidth}px`;
        baseImage.style.height = `${displayHeight}px`;
        
        // 画像ごとの位置調整（offsetがある場合）
        let transform = '';
        if (currentImageSet.offsetX) {
            transform += `translateX(${currentImageSet.offsetX}px) `;
        }
        if (currentImageSet.offsetY) {
            transform += `translateY(${currentImageSet.offsetY}px)`;
        }
        baseImage.style.transform = transform.trim();

        ctx.drawImage(monoImage, 0, 0);
        ctx.globalCompositeOperation = 'destination-out';
        
        // デバッグ情報（コンソールに出力）
        console.log(`Initialized canvas for: ${currentImageSet.title}`);
        console.log(`Canvas size: ${naturalWidth}x${naturalHeight}`);
        console.log(`Display size: ${displayWidth}x${displayHeight}`);
    };
}

// 戻るボタンの処理
function goBackToSelection() {
    drawingScreen.classList.add('hidden');
    selectionScreen.classList.remove('hidden');
    currentImageSet = null;
    originalDisplaySize = null; // サイズ情報をリセット
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    
    // キャンバスのスタイルもリセット
    drawingCanvas.style.width = '';
    drawingCanvas.style.height = '';
    baseImage.style.width = '';
    baseImage.style.height = '';
}

// マウスイベント
drawingCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    draw(e);
});

drawingCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    draw(e);
});

drawingCanvas.addEventListener('mouseup', () => {
    isDrawing = false;
    ctx.beginPath(); // 新しいパスを開始して、前の描画と繋がらないようにする
});

drawingCanvas.addEventListener('mouseout', () => {
    isDrawing = false;
    ctx.beginPath();
});

// タッチイベント (モバイル対応)
drawingCanvas.addEventListener('touchstart', (e) => {
    isDrawing = true;
    draw(e.touches[0]);
    e.preventDefault(); // スクロール防止
});

drawingCanvas.addEventListener('touchmove', (e) => {
    if (!isDrawing) return;
    draw(e.touches[0]);
    e.preventDefault();
});

drawingCanvas.addEventListener('touchend', () => {
    isDrawing = false;
    ctx.beginPath();
});

function draw(e) {
    const rect = drawingCanvas.getBoundingClientRect();
    // 表示サイズと元の画像サイズの比率を計算
    const scaleX = drawingCanvas.width / rect.width;
    const scaleY = drawingCanvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // デバイスに応じてブラシサイズを調整
    const devicePixelRatio = window.devicePixelRatio || 1;
    const adjustedBrushRadius = BRUSH_RADIUS * Math.max(scaleX, scaleY) * devicePixelRatio;

    ctx.lineWidth = adjustedBrushRadius * 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black'; // destination-outなので何色でも良い

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // デバッグ: 描画座標をコンソールに出力（イルカさんの場合のみ）
    if (currentImageSet && currentImageSet.title === 'イルカさん') {
        console.log(`Drawing at: ${x.toFixed(1)}, ${y.toFixed(1)} with brush size: ${adjustedBrushRadius.toFixed(1)}`);
    }
}

// イベントリスナーの設定
backButton.addEventListener('click', goBackToSelection);

resetButton.addEventListener('click', () => {
    if (!currentImageSet) return;
    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    initDrawingCanvas(true); // リセットフラグを true に設定
});

// リサイズ対応
function handleResize() {
    if (currentImageSet && !drawingScreen.classList.contains('hidden')) {
        // 現在のキャンバス内容を保存
        const imageData = ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
        
        // サイズ情報をリセットして再計算
        originalDisplaySize = null;
        initDrawingCanvas();
        
        // 画像が読み込まれた後にキャンバス内容を復元
        setTimeout(() => {
            ctx.putImageData(imageData, 0, 0);
            ctx.globalCompositeOperation = 'destination-out';
        }, 100);
    }
}

// デバウンス機能付きリサイズハンドラー
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 250);
});

// 画面の向き変更対応
window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 500); // 向き変更後の遅延を考慮
});

// タッチ操作の改善
function preventScrolling(e) {
    if (e.target === drawingCanvas) {
        e.preventDefault();
    }
}

// パッシブリスナーでスクロール防止
document.addEventListener('touchstart', preventScrolling, { passive: false });
document.addEventListener('touchmove', preventScrolling, { passive: false });

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    initSelectionScreen();
});