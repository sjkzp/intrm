var cardList = document.getElementById('card-list');
var resetButton = document.getElementById('reset-button');

var cards = []; // カード情報を格納する配列
const cardImages = ['prize1.png', 'prize2.png', 'prize3.png', 'prize4.png', 'prize5.png', 'prize6.png', 'prize7.png', 'prize8.png', 'prize9.png', 'prize10.png', 'prize11.png', 'prize12.png', 'prize13.png', 'prize14.png'];

const text_ticket = "チケット: "; 

// LocalStorageからガチャ結果を取得
var gachaResults = JSON.parse(localStorage.getItem('gachaResults')) || [];

// ガチャチケットの初期枚数を設定（初回のみ）
if (localStorage.getItem('gachaTickets') === null) {
    localStorage.setItem('gachaTickets', '0');
}

// ガチャチケットの枚数を取得
var gachaTickets = parseInt(localStorage.getItem('gachaTickets'));

// 残カードを取得
var availableCards = cardImages.filter((cardImage, index) => !gachaResults.includes(index + 1));

document.getElementById("Tickets").innerHTML = text_ticket + gachaTickets;

if (gachaTickets > 0 && availableCards.length > 0) {
    document.getElementById("GachaButton").style.display = "block"; 
} else {
    document.getElementById("GachaButton").style.display = "none"; 
}

// カード一覧の初期化
for (let i = 0; i < cardImages.length; i++) {
    var cardContainer = document.createElement('div');
    cardContainer.className = 'card-container';
    var cardInner = document.createElement('div');
    cardInner.className = 'card-inner';
    var card = document.createElement('div');
    card.className = 'card';
    cardContainer.appendChild(cardInner);
    cardInner.appendChild(card);
    cardList.appendChild(cardContainer);
    cards.push(card);

    // ガチャ結果でなければ裏面を表示
    if (!gachaResults.includes(i + 1)) {
	card.classList.add('back');
    } else {
	card.classList.add('front');
	card.style.backgroundImage = `url(${cardImages[i]})`;
	card.style.transform = 'rotateY(0deg)'; // カードのめくれるアニメーション修正
    }
}

// ガチャを引く関数
function drawGacha() {
    document.getElementById("GachaButton").style.display = "none"; 

    var availableCards = cardImages.filter((cardImage, index) => !gachaResults.includes(index + 1));
    
    // ガチャチケットを1枚消費
    gachaTickets--;
    localStorage.setItem('gachaTickets', gachaTickets.toString());
    document.getElementById("Tickets").innerHTML = text_ticket + gachaTickets;

    var randomCardIndex = Math.floor(Math.random() * availableCards.length);
    var selectedCardIndex = cardImages.indexOf(availableCards[randomCardIndex]);
    var selectedCard = cards[selectedCardIndex];

    location.href='./collection.html#card-list'

    // カードをめくるアニメーションを追加
    selectedCard.style.transform = 'rotateY(360deg)'; // カードをめくるアニメーションを追加
    
    if (gachaTickets > 0 && availableCards.length > 1) {
        document.getElementById("GachaButton").style.display = "block"; 
    }

    // ガチャ後の処理（結果を表示など）
    setTimeout(() => {
	gachaResults.push(selectedCardIndex + 1); // ガチャ結果を記録
	localStorage.setItem('gachaResults', JSON.stringify(gachaResults)); // LocalStorageに保存
	selectedCard.style.backgroundImage = `url(${availableCards[randomCardIndex]})`; // 獲得したカードの画像を表示
    }, 500);
}


function confirmResetLocalStorage() {
    const confirmation = confirm("データを初期化します。本当によろしいですか？");

    if (confirmation) {
        // ユーザーが確認ボタンをクリックした場合
        resetLocalStorage();
    } else {
        // ユーザーがキャンセルボタンをクリックした場合
        // 何もしないか、必要な処理を追加
    }
}

// LocalStorageをリセットする関数
function resetLocalStorage() {
    localStorage.removeItem('highLowGameRecord');
    localStorage.removeItem('gachaResults');
    localStorage.removeItem('gachaTickets');
    alert('データを初期化しました。');
    location.reload(); // ページをリロードして初期状態に戻す
}
