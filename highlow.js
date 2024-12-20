// 処理済みの数字配列
var discards = [];

// 勝利と敗北のカウント
var winCount = 0;
var loseCount = 0;

// 現在の試合数
var currentRound = 1;

// ゲーム終了のフラグ
var gameOver = false;

// 現在の場にあるカード
var currentCard = 0; 
// 引かれたカード
var drawnCard = 0; 

// プレイ可能な時間
// var playSpan = 23 * 60 * 60 * 1000;
var playSpan = 0 * 60 * 1000;

const text_high_low = "High or Low?"; 
const text_current = "現在のカード: ";
const text_win = "Win!";
const text_choice = "選択: ";
const text_high = `<span class="highlow-text high"> High </span>`;
const text_low = `<span class="highlow-text low"> Low </span>`;
const text_gameover = `<span class="result-text lose"> ゲームオーバー... </span>`;
const text_congrats = `<span class="result-text win"> チケットを獲得！ </span>`;
const text_results = "Results: ";

// ユーザーのゲームプレイ記録を保存するためのLocalStorageキー
const gameRecordKey = 'highLowGameRecord';

// ユーザーのゲームプレイ記録を取得
var gameRecord = JSON.parse(localStorage.getItem(gameRecordKey)) || { lastPlayedDate: null, playCount: 0 };

// ガチャチケットの初期枚数を設定（初回のみ）
if (localStorage.getItem('gachaTickets') === null) {
    localStorage.setItem('gachaTickets', '0');
}

// ガチャチケットの枚数を取得
var gachaTickets = parseInt(localStorage.getItem('gachaTickets'));

function drawCard() {
    let card = Math.floor(Math.random() * 13) + 1;
    while (discards.includes(card)) {
        card = Math.floor(Math.random() * 13) + 1;
    }
    discards.push(card);
    return card;
}

function replayGame() {

    discards = [];
    winCount = 0;
    loseCount = 0;
    currentRound = 1;
    currentCard = 0;
    gameOver = false;
    document.getElementById("Result").innerHTML = "";
    currentCard = 0; // ゲームをリセットしたら場にあるカードもリセット
    document.getElementById("card_first").src = "card_0.png";
    document.getElementById("card_second").src = "card_0.png";
    document.getElementById("Before").innerHTML = "";
    document.getElementById("After").innerHTML = text_high_low;
    document.getElementById("After").style.display = "none"; 
    document.getElementById("CollectionButton").style.display = "block"; 
    document.getElementById("ReplayButton").style.display = "none"; 
    document.getElementById("GameStartButton").style.display = "block"; 
    document.getElementById("HighButton").style.display = "none"; 
    document.getElementById("LowButton").style.display = "none"; 
    document.getElementById("NextButton").style.display = "none"; 

    updateRoundDisplay();
}

function startGame() {
    var currentDate = new Date();
    
    // 前回のゲームプレイ日時を取得
    var lastPlayedDate = new Date(gameRecord.lastPlayedDate);

    // 前回のゲームプレイからの経過時間（ミリ秒）を計算
    var elapsedTime = currentDate - lastPlayedDate;

    // 前回のゲームプレイから一定時間経過している場合は新しいゲームを開始できる
    if (currentDate - lastPlayedDate >= playSpan) {
        currentCard = drawCard();
        document.getElementById("card_first").src = "card_" + currentCard + ".png";
        document.getElementById("GameStartButton").style.display = "none";
        document.getElementById("HighButton").style.display = "block";
        document.getElementById("LowButton").style.display = "block";
        document.getElementById("Before").style.display = "block";
        document.getElementById("After").style.display = "block";
        document.getElementById("Before").innerHTML = text_current + currentCard;
        document.getElementById("After").innerHTML = text_high_low;
        document.getElementById("CollectionButton").style.display = "none";

        // 前回のゲームプレイ日時を更新
        gameRecord.lastPlayedDate = currentDate.toISOString();
        gameRecord.playCount++;
        localStorage.setItem(gameRecordKey, JSON.stringify(gameRecord));

        // プレイ可能な日時をクリア
        document.getElementById("PlayAvailableTime").innerHTML = '';
    } else {
        // プレイ可能な日時を計算
        var playAvailableDate = new Date(lastPlayedDate.getTime() + (playSpan));

	var remainingTime = playSpan - elapsedTime;
        var remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
        var remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
        var remainingSeconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

	// 残り時間を表示
        var remainingTimeText = formatTime(remainingHours, remainingMinutes, remainingSeconds);

        // プレイ可能な日時を表示
        document.getElementById("PlayAvailableTime").innerHTML = `次回のプレイ可能日時: ${playAvailableDate.toLocaleString()} (あと ${remainingTimeText})`;
    }
}

function formatTime(hours, minutes, seconds) {
    var formattedTime = '';
    if (hours > 0) {
        formattedTime += `${hours}時間 `;
    }
    if (minutes > 0 || hours > 0) {
        formattedTime += `${minutes}分 `;
    }
    formattedTime += `${seconds}秒`;
    return formattedTime;
}

function showNextButton() {
    document.getElementById("HighButton").style.display = "none"; // High ボタンを非表示にする
    document.getElementById("LowButton").style.display = "none"; // Low ボタンを非表示にする
    document.getElementById("NextButton").style.display = "block"; // Next ボタンを表示する
}

function nextRound() {
    currentCard = drawnCard;
    document.getElementById("card_first").src = "card_" + currentCard + ".png";
    document.getElementById("card_second").src = "card_0.png";
    document.getElementById("NextButton").style.display = "none"; // Next ボタンを非表示にする
    document.getElementById("Before").style.display = "block";
    document.getElementById("After").style.display = "block";
    document.getElementById("Before").innerHTML = text_current + currentCard;
    document.getElementById("After").innerHTML = text_high_low;
    document.getElementById("HighButton").style.display = "block"; // High ボタンを表示する
    document.getElementById("LowButton").style.display = "block"; // Low ボタンを表示する
    document.getElementById("Result").style.display = "none"; // ResultTextを非表示にする
    currentRound++;
    updateRoundDisplay();
}

function updateRoundDisplay() {
    document.getElementById("Round").innerHTML = "Round " + currentRound + " / 5";
}

function High_Low(highLow) {
    if (gameOver) {
        return;
    }

    drawnCard = drawCard();

    document.getElementById("card_first").src = "card_" + currentCard + ".png";

    var choiceText = "";
    var resultText = "";
   
    document.getElementById("card_second").src = "card_" + drawnCard + ".png";
    document.getElementById("card_second").alt = drawnCard;
    document.getElementById("Before").style.display = "none";
    document.getElementById("After").style.display = "block";
    document.getElementById("Result").style.display = "block";

    if (highLow === 1) {
	choiceText = text_choice + text_high;	
    } else {
	choiceText = text_choice + text_low;
    }

    if ((currentCard < drawnCard && highLow === 1) || (currentCard > drawnCard && highLow === 0)) {
	resultText = text_win;
        winCount++;
    } else {
        loseCount++;
    }

    if (winCount === 5) {
        // ガチャチケットを1枚獲得
        gachaTickets++;
        localStorage.setItem('gachaTickets', gachaTickets.toString());

        document.getElementById("After").innerHTML = choiceText;
        document.getElementById("Result").innerHTML = text_congrats;
        gameOver = true;
        document.getElementById("CollectionButton").style.display = "block"; 
        document.getElementById("HighButton").style.display = "none"; 
        document.getElementById("LowButton").style.display = "none"; 
        document.getElementById("NextButton").style.display = "none"; ; 
    } else if (loseCount === 1) {
        document.getElementById("After").innerHTML = choiceText;
        document.getElementById("Result").innerHTML = text_gameover;
        gameOver = true;
        document.getElementById("ReplayButton").style.display = "block"; 
        document.getElementById("CollectionButton").style.display = "block"; 
        document.getElementById("HighButton").style.display = "none"; 
        document.getElementById("LowButton").style.display = "none"; 
        document.getElementById("NextButton").style.display = "none"; ;
    } else {
        document.getElementById("After").innerHTML = choiceText;
        document.getElementById("Result").innerHTML = resultText;
        showNextButton();
    }
}
