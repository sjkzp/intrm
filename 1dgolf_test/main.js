// ===== デバッグトラップ =====
window.onerror = function(msg, src, line, col, err) {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#f00;color:#fff;padding:10px;z-index:9999;font-size:12px;white-space:pre-wrap;overflow-y:auto;max-height:50vh';
  div.textContent = 'ERROR: ' + msg + '\nLine: ' + line + ' Col: ' + col + '\n' + (err && err.stack ? err.stack : '');
  document.body.appendChild(div);
  return true;
};
window.addEventListener('unhandledrejection', function(e) {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#f80;color:#fff;padding:10px;z-index:9999;font-size:12px;white-space:pre-wrap';
  div.textContent = 'UNHANDLED: ' + e.reason;
  document.body.appendChild(div);
});

// ============ ゲームロジック ============
'use strict';

// =============================================
// 言語切替システム
// =============================================
let _lang = 'ja'; // 'ja' | 'en'

const L = {
  ja: {
    btnStart: '▶ ス タ ー ト', btnVS: '⚔ V S モ ー ド',
    btnRec: '🏆 レコード', btnHow: '？ 遊び方', langBtn: 'EN',
    charaTitle: 'キャラクター選択', charaSub: 'タップで詳細を表示・選択',
    charaPrompt: 'キャラを選択してください',
    vsTitle: '対戦相手選択', vsSub: 'CPUのキャラを選んでください', vsSub1: '操作するキャラを選んでください',
    btnDecide: '▶ 決定', btnVSDecide: '⚔ 決定',
    statPow: '腕力：', statTch: '器用さ：', statGeo: '土地勘：', statSpe: '特技：',
    courseTitle: 'コース選択', coursePrac: '練 習 コ ー ス', courseChamp: '選 手 権 コ ー ス',
    coursePracMeta: '<span>1600pts</span><span>6ホール</span>',
    courseChampMeta: '<span>1300pts</span><span>9ホール</span>',
    courseInfoPrac: '練習コース｜6H｜1600pts', courseInfoChamp: '選手権コース｜9H｜1300pts',
    howtoClose: '閉じる', recBack: '← 戻る',
    htCredits: '制作：int ／ キャラグラフィック：YUU（海無軒）',
    // ゲーム画面ラベル
    lbHole:'H', lbPar:'Par', lbShot:'打', lbPoints:'Pts',
    lbDist:'全長', lbLeft:'残り', lbFly:'飛距離', lbPos:'現在',
    lbWait:'風待ち', lbSkill:'特技',
    lbTerrain:'地形', lbScore:'スコア', lbBack:'戻る', lbGiveUp:'ギブアップ',
    lbCpuTurn:'CPU', lbShop:'SHOP', lbShopScore:'スコア',
    scCardTitle:'スコアカード', scCardClose:'閉じる',
    vsScoreCard:'VS スコアカード',
    recHeader:'🏆 レコード',
    recLoading:'読み込み中…',
    recAllTime:'📊 累計実績',
    recHIO:'ホールインワン', recChip:'チップイン',
    recPlays:'🏌️ キャラ別プレイ数',
    recBest:'⛳ ベストスコア',
    recEmpty:'まだ記録がありません',
    recDelete:'🗑 記録をすべて削除',
    recCrsNames:{1:'練習コース',2:'選手権コース'},
    recDelTitle:'記録を削除', recDelBody:'ホールベスト・プレイ回数・<br>実績データがすべて消えます。<br>本当に削除しますか？',
    recDelCancel:'キャンセル', recDelOk:'削除する', recDelDone:'記録を削除しました',
    // 地形名
    terNames:{1:'FAIRWAY',2:'ROUGH',3:'BUNKER',4:'WATER',5:'GREEN',6:'O B'},
    lbWind:'風', lbSlope:'傾',
    lbShotBtn:'打つ', lbUseBtn:'使用', lbWaitBtn:'風待ち',
    lbBuy:'購入', lbSkillPlus:'特技+1', lbMax:'MAX', lbNopts:'pts不足', lbNextHole:'次のホールへ ›', lbFinish:'コース終了', lbStop:'■ STOP',
    lbTot:'合計', lbCount:'回',
    // 遊び方
    htTitle:'HOW TO PLAY',
    htBasicsH:'⛳ 基本操作', htBasicsP:'クラブを選んで「SHOT」ボタンを押すとゲージが動きます。ショットするとボールが飛びます。ゲージが高いほど飛距離が伸びます。',
    htMobileH:'📱 スマホ操作', htMobileP:'<b>タップ</b> SHOT → <b>■STOP</b> でショット',
    htPcH:'🖥️ PC操作', htPcP:'<b>クリック長押し</b> SHOT → 離してショット',
    htWindH:'💨 風待ち', htWindP:'WAITボタンで風の値が変わります。＋なら飛距離が伸び、－なら縮みます。',
    htTerrainH:'🏌️ 地形',
    htTerrainList:'<li><b style="color:#7fd87f">ROUGH</b>：飛距離が落ちます</li><li><b style="color:#ddcc44">BUNKER</b>：飛距離大幅減。アイアン(5I/8I)のみ使用可</li><li><b style="color:#6699ff">WATER / OB</b>：ペナルティ＋1打、前の位置から打ち直し</li><li><b style="color:#00ff88">GREEN</b>：パター(PT)を使用。傾斜±0のガイドが表示されます</li>',
    htSkillH:'✨ 特技',
    htSkillList:'<li><b>パワーショット</b>：ゲージ上限が120%に</li><li><b>地形無視ショット</b>：ROUGH/BUNKER上でもフェアウェイ飛距離</li><li><b>打ち直し</b>：打数を増やさず前の場所から再ショット</li><li><b>風・傾斜消し</b>：風・傾斜を±0にする</li><li><b>スタートオーバー</b>：ホール最初からやり直し</li>',
    htScoreH:'🏆 スコアとポイント', htScoreP:'ショットごとにポイント(pts)が減り、ホールクリアで獲得。par+4以上の打数でギブアップとなります。1ホール終了後はクラブ強化や特技回数増加のショップがあります。',
    htVsH:'⚔ VSモード', htVsP:'選手権コース（9H）のみ。1Pがホールをプレイした後、CPUが同じホールをプレイします。ショップで強化できるのは1Pのみ。',
  },
  en: {
    btnStart: '▶ S T A R T', btnVS: '⚔ V S  M O D E',
    btnRec: '🏆 Records', btnHow: '？ How to Play', langBtn: 'JP',
    charaTitle: 'SELECT CHARACTER', charaSub: 'Tap to view details and select',
    charaPrompt: 'Select a character',
    vsTitle: 'SELECT OPPONENT', vsSub: 'Choose a CPU character', vsSub1: 'Choose your character',
    btnDecide: '▶ Select', btnVSDecide: '⚔ Select',
    statPow: 'Power：', statTch: 'Dexterity：', statGeo: 'Range Finding：', statSpe: 'Skill：',
    courseTitle: 'SELECT COURSE', coursePrac: 'P R A C T I C E', courseChamp: 'C H A M P I O N S H I P',
    coursePracMeta: '<span>1600pts</span><span>6 Holes</span>',
    courseChampMeta: '<span>1300pts</span><span>9 Holes</span>',
    courseInfoPrac: 'Practice | 6H | 1600pts', courseInfoChamp: 'Championship | 9H | 1300pts',
    howtoClose: 'Close', recBack: '← Back',
    htCredits: 'Developer: int ／ Character Art: YUU',
    // ゲーム画面ラベル
    lbHole:'HOLE', lbPar:'PAR', lbShot:'SHOT', lbPoints:'POINTS',
    lbDist:'DIST', lbLeft:'LEFT', lbFly:'SHOT', lbPos:'POS',
    lbWait:'WAIT', lbSkill:'SKILL',
    lbTerrain:'TERRAIN', lbScore:'SCORE', lbBack:'BACK', lbGiveUp:'give up',
    lbCpuTurn:'CPU TURN', lbShop:'SHOP', lbShopScore:'SCORE',
    scCardTitle:'SCORE CARD', scCardClose:'Close',
    vsScoreCard:'VS SCORE CARD',
    recHeader:'🏆 RECORDS',
    recLoading:'Loading…',
    recAllTime:'📊 All-Time Stats',
    recHIO:'Hole in One', recChip:'Chip In',
    recPlays:'🏌️ Plays by Character',
    recBest:'⛳ Best Scores',
    recEmpty:'No records yet',
    recDelete:'🗑 Delete All Records',
    recCrsNames:{1:'Practice',2:'Championship'},
    recDelTitle:'Delete Records', recDelBody:'All best scores, play counts<br>and stats will be erased.<br>Are you sure?',
    recDelCancel:'Cancel', recDelOk:'Delete', recDelDone:'Records deleted',
    // 地形名
    terNames:{1:'FAIRWAY',2:'ROUGH',3:'BUNKER',4:'WATER',5:'GREEN',6:'O B'},
    lbWind:'WIND', lbSlope:'SLP',
    lbShotBtn:'SHOT', lbUseBtn:'USE', lbWaitBtn:'WAIT',
    lbBuy:'BUY', lbSkillPlus:'SKILL+1', lbMax:'MAX', lbNopts:'pts low', lbNextHole:'NEXT HOLE ›', lbFinish:'FINISH', lbStop:'■ STOP',
    lbTot:'TOT', lbCount:'x',
    // 遊び方
    htTitle:'HOW TO PLAY',
    htBasicsH:'⛳ BASICS', htBasicsP:'Select a club and press the SHOT button to start the gauge. Release/stop to fire the ball. Higher gauge = more distance.',
    htMobileH:'📱 Mobile', htMobileP:'<b>Tap</b> SHOT → tap <b>■STOP</b> to fire',
    htPcH:'🖥️ PC', htPcP:'<b>Hold</b> SHOT → release to fire',
    htWindH:'💨 WAIT FOR WIND', htWindP:'Press WAIT n to change the wind value. + extends distance, − shortens it. Usable n times.',
    htTerrainH:'🏌️ TERRAIN',
    htTerrainList:'<li><b style="color:#7fd87f">ROUGH</b>: Distance reduced</li><li><b style="color:#ddcc44">BUNKER</b>: Distance heavily reduced. Irons (5I/8I) only</li><li><b style="color:#6699ff">WATER / OB</b>: +1 stroke penalty, replay from previous position</li><li><b style="color:#00ff88">GREEN</b>: Use putter (PT). Slope ±0 guide is shown</li>',
    htSkillH:'✨ SKILLS',
    htSkillList:'<li><b>Power Shot</b>: Gauge cap raised to 120%</li><li><b>Terrain Ignore</b>: Fairway distance even on ROUGH/BUNKER</li><li><b>Retry Shot</b>: Reshoot from previous position without adding a stroke</li><li><b>Wind/Slope Cancel</b>: Sets wind and slope to ±0</li><li><b>Start Over</b>: Restart the hole from the beginning</li>',
    htScoreH:'🏆 SCORE & POINTS', htScoreP:'Points (pts) decrease per shot and are awarded on hole clear. Give up at par+4 strokes or more. After each hole, visit the SHOP to upgrade clubs or increase skill uses.',
    htVsH:'⚔ VS MODE', htVsP:'Championship course (9H) only. After Player 1 plays a hole, the CPU plays the same hole. Only Player 1 can upgrade in the SHOP.',
  }
};

function toggleLang(){
  _lang = _lang==='ja' ? 'en' : 'ja';
  applyLang();
  dbPut('settings','lang',_lang).catch(()=>{});
}

function applyLang(){
  const t = L[_lang];
  const lb = document.getElementById('langBtn');
  if(lb) lb.textContent = t.langBtn;
  const btnMap = {
    sBtnStart:'btnStart', sBtnVS:'btnVS', sBtnRec:'btnRec', sBtnHow:'btnHow'
  };
  Object.entries(btnMap).forEach(([id,key])=>{
    const el = document.getElementById(id);
    if(el) el.textContent = t[key];
  });
  const dhc = document.getElementById('dlgHowtoClose');
  if(dhc) dhc.textContent = t.howtoClose;
  // キャラ選択ヘッダー
  const cHdr = document.querySelector('#scC #cHeader');
  if(cHdr){
    const h2 = cHdr.querySelector('h2');
    const p  = cHdr.querySelector('p');
    if(h2 && h2._langKey) h2.textContent = t[h2._langKey] || h2.textContent;
    if(p  && p._langKey)  p.textContent  = t[p._langKey]  || p.textContent;
  }
  // キャラ詳細ラベル（テキストノードを直接更新）
  const dStatMap = {dStatPow:'statPow', dStatTch:'statTch', dStatGeo:'statGeo', dStatSpe:'statSpe'};
  Object.entries(dStatMap).forEach(([elId,key])=>{
    const el = document.getElementById(elId);
    if(el && el.childNodes[0]) el.childNodes[0].textContent = t[key];
  });
  const cdn = document.getElementById('cDetailName');
  if(cdn && cdn.dataset.empty==='1') cdn.textContent = t.charaPrompt;
  // 決定ボタン
  const cbn = document.getElementById('cBtnNormal');
  if(cbn) cbn.textContent = t.btnDecide;
  const cbnvs = document.getElementById('cBtnVSoppo');
  if(cbnvs) cbnvs.textContent = t.btnVSDecide;
  // コース選択
  const crH2 = document.querySelector('#crHeader h2');
  if(crH2) crH2.textContent = t.courseTitle;
  const cpName = document.querySelector('#crPrac .crName');
  const ccName = document.querySelector('#crChamp .crName');
  const cpMeta = document.querySelector('#crPrac .crMeta');
  const ccMeta = document.querySelector('#crChamp .crMeta');
  if(cpName) cpName.textContent = t.coursePrac;
  if(ccName) ccName.textContent = t.courseChamp;
  if(cpMeta) cpMeta.innerHTML   = t.coursePracMeta;
  if(ccMeta) ccMeta.innerHTML   = t.courseChampMeta;
  const cct = document.getElementById('crConfirmTitle');
  if(cct) cct.textContent = t.courseConfirmTitle || 'ARE YOU READY?';

  // キャラ詳細パネルが表示されている場合は名前・特技を再描画
  const cdn2 = document.getElementById('cDetailName');
  if(cdn2 && cdn2.dataset.empty !== '1'){
    const selCard = document.querySelector('.csCard.sel');
    if(selCard){
      const selId = parseInt(selCard.id.replace('cs',''));
      const d = (typeof CD !== 'undefined') && CD[selId];
      if(d){
        cdn2.textContent = cdN(d);
        const dSpe = document.getElementById('dSpe');
        if(dSpe) dSpe.textContent = cdS(d);
      }
    }
  }
  // speBox（特技フラッシュ）が表示中なら更新
  const speBox = document.getElementById('speBox');
  if(speBox && speBox.style.display !== 'none' && typeof G !== 'undefined'){
    const curD = (typeof CD !== 'undefined') && CD[G.ch];
    if(curD) speBox.textContent = cdS(curD) || 'SKILL';
  }

  // キャラ選択画面が表示中ならグリッドを再描画（カード名を即時反映）
  const scC = document.getElementById('scC');
  if(scC && scC.classList.contains('on') && typeof drawSlots === 'function'){
    drawSlots();
    // 再描画後にselectionを復元
    if(typeof pendingChara !== 'undefined' && pendingChara){
      const prevSel = document.getElementById('cs'+pendingChara);
      if(prevSel) prevSel.classList.add('sel');
    }
  }

  // レコード画面
  const recH2 = document.querySelector('#recHeader h2');
  if(recH2) recH2.textContent = t.recHeader;
  const recBackBtn = document.getElementById('recBackBtn');
  if(recBackBtn) recBackBtn.textContent = t.recBack;
  // レコード画面表示中は再描画（All-Time Stats等を切り替え）
  const scRec = document.getElementById('scRec');
  if(scRec && scRec.classList.contains('on') && typeof openRecords === 'function'){
    openRecords();
  }

  // ゲーム画面ラベル
  const gLbMap = {
    lbHole:'lbHole', lbPar:'lbPar', lbShot:'lbShot', lbPoints:'lbPoints',
    lbDist:'lbDist', lbLeft:'lbLeft', lbFly:'lbFly', lbPos:'lbPos',
    lbWait:'lbWait', lbTerrain:'lbTerrain', lbScore:'lbScore',
    lbBack:'lbBack', lbGiveUp:'lbGiveUp', lbCpuTurn:'lbCpuTurn',
    lbShop:'lbShop', lbShopScore:'lbShopScore',
  };
  Object.entries(gLbMap).forEach(([id,key])=>{
    const el = document.getElementById(id);
    if(el) el.textContent = t[key];
  });
  const scct = document.getElementById('scCardTitle');
  if(scct) scct.textContent = t.scCardTitle;
  const sccl = document.getElementById('scCardClose');
  if(sccl) sccl.textContent = t.scCardClose;
  const bSpeEl = document.getElementById('bSpeLbl');
  if(bSpeEl) bSpeEl.textContent = t.lbSkill;

  // CPU番バナーの名称更新
  const cpuNameEl = document.getElementById('gCpuName');
  if(cpuNameEl && typeof VS !== 'undefined' && VS.cpuCh){
    const cpuDa = CD[VS.cpuCh];
    if(cpuDa) cpuNameEl.textContent = cdN(cpuDa);
  }

  // bPro ラベル更新
  const bProEl = document.getElementById('bPro');
  if(bProEl && bProEl.style.display !== 'none'){
    const ct = bProEl.textContent;
    if(ct==='NEXT HOLE ›'||ct==='次のホールへ ›') bProEl.textContent=L[_lang].lbNextHole;
    else if(ct==='FINISH'||ct==='コース終了') bProEl.textContent=L[_lang].lbFinish;
  }

  // ゲーム中ならsetTer/updWindLabelを再実行して地形名・風ラベルを更新
  if(typeof G !== 'undefined' && G.ji){
    setTer(G.ji, true);
    updWindLabel();
  }
  // bShotのラベル（SHOTモード時のみ更新、充電中・購入中は触らない）
  const bShotEl = document.getElementById('bShot');
  // bShot が「待機状態」のラベルなら言語に合わせて更新
  if(bShotEl){
    const cur = bShotEl.textContent;
    if(cur==='SHOT'||cur==='打つ') bShotEl.textContent=L[_lang].lbShotBtn;
    else if(cur==='BUY'||cur==='購入') bShotEl.textContent=L[_lang].lbBuy;
    else if(cur==='USE'||cur==='使用') bShotEl.textContent=L[_lang].lbUseBtn;
  }

  // 遊び方ダイアログ
  const htCreditsEl = document.getElementById('htCredits');
  if(htCreditsEl) htCreditsEl.textContent = t.htCredits;

  const htMap = {
    htTitle:'htTitle', htBasicsH:'htBasicsH', htBasicsP:'htBasicsP',
    htMobileH:'htMobileH', htPcH:'htPcH', htPcP:'htPcP',
    htWindH:'htWindH', htWindP:'htWindP',
    htTerrainH:'htTerrainH', htSkillH:'htSkillH',
    htScoreH:'htScoreH', htScoreP:'htScoreP',
    htVsH:'htVsH', htVsP:'htVsP',
  };
  Object.entries(htMap).forEach(([key,id])=>{
    const el = document.getElementById(id);
    if(el) el.textContent = t[key];
  });
  // innerHTML が必要な要素
  const htMobileP = document.getElementById('htMobileP');
  if(htMobileP) htMobileP.innerHTML = t.htMobileP;
  const htPcPEl = document.getElementById('htPcP');
  if(htPcPEl) htPcPEl.innerHTML = t.htPcP;
  const htTerrainList = document.getElementById('htTerrainList');
  if(htTerrainList) htTerrainList.innerHTML = t.htTerrainList;
  const htSkillList = document.getElementById('htSkillList');
  if(htSkillList) htSkillList.innerHTML = t.htSkillList;
}

// キャラ名・特技名を言語別に返す
function cdN(d){ return _lang==='ja' ? (d.jn||d.n) : d.n; }
function cdS(d){ return _lang==='ja' ? (d.js||d.s) : d.s; }
function cdIC(d){ return _lang==='ja' ? d.ic : (d.eic||d.ic); }

function _setCharaHeader(h2text, ptext, h2key, pkey){
  const cHdr = document.querySelector('#scC #cHeader');
  if(!cHdr) return;
  const h2 = cHdr.querySelector('h2'); const p = cHdr.querySelector('p');
  if(h2){ h2.textContent=h2text; h2._langKey=h2key; }
  if(p) { p.textContent=ptext;   p._langKey=pkey;   }
}




// =============================================
// SE (Web Audio API)
// =============================================
const _ac = (()=>{try{return new(window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}})();

function _playTone(freq, type, dur, vol, freqEnd){
  if(!_ac) return;
  // iOSはユーザー操作後に resume が必要
  if(_ac.state==='suspended') _ac.resume();
  const o=_ac.createOscillator();
  const g=_ac.createGain();
  o.connect(g); g.connect(_ac.destination);
  o.type=type||'sine';
  o.frequency.setValueAtTime(freq, _ac.currentTime);
  if(freqEnd) o.frequency.linearRampToValueAtTime(freqEnd, _ac.currentTime+dur);
  g.gain.setValueAtTime(vol||0.18, _ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, _ac.currentTime+dur);
  o.start(_ac.currentTime);
  o.stop(_ac.currentTime+dur);
}

// ショット: ブン（低→高の短い音）
function seShot(){
  _playTone(120,'sawtooth',0.12,0.22,480);
}
// カップイン: 明るいファンファーレ風
function seHoleIn(){
  // カップに落ちるような金属打撃音（短いトーン+減衰）
  _playTone(1200,'triangle',0.30,0.06); // 高音の打撃
  setTimeout(()=>_playTone(800,'triangle',0.20,0.08),50); // 低め余韻
  setTimeout(()=>_playTone(600,'sine',0.10,0.15),100); // 響き
}
// 特技使用: キラッとした高音
function seSpecial(){
  _playTone(1046,'sine',0.08,0.18);
  setTimeout(()=>_playTone(1318,'sine',0.08,0.18),80);
  setTimeout(()=>_playTone(1568,'sine',0.15,0.2),160);
}
// 購入: コイン音
function seBuy(){
  _playTone(880,'square',0.06,0.14);
  setTimeout(()=>_playTone(1108,'square',0.1,0.14),70);
}
// ゲームスタート時
function seStart(){
  _playTone(262,'sine',0.08,0.15);
  setTimeout(()=>_playTone(330,'sine',0.08,0.15),90);
  setTimeout(()=>_playTone(392,'sine',0.08,0.15),180);
  setTimeout(()=>_playTone(523,'sine',0.25,0.2),270);
}
// キャラ選択時（タップで鳴る）
function seSelect(){
  _playTone(660,'sine',0.06,0.12);
  setTimeout(()=>_playTone(880,'sine',0.1,0.15),80);
}
// オングリーン ファン！（高めの短い上昇音）
function seChime(){
  _playTone(880,'sine',0.04,0.22);
  setTimeout(()=>_playTone(1100,'sine',0.04,0.22),50);
  setTimeout(()=>_playTone(1320,'sine',0.04,0.22),100);
  setTimeout(()=>_playTone(1760,'sine',0.18,0.35),150);
}

const CD={
 1:{n:'Mina Ichinose',    jn:'一之瀬 水無', p:'★',      t:'★★★★★',g:'★★★★★',s:'Power Shot',     js:'パワーショット',  col:'#6fdf6f',ic:'水',eic:'M',
    spd:30,sc:1,mx:100,s7:40,sc7:1,x7:100,wz:3,wt:7,pw:800,
    w1:200,c1:90,w2:180,c2:70,i1:130,d1:60,i2:100,d2:40,p1:30,e1:10,p2:15,e2:0,gW:102},
 2:{n:'Soma Migimura',    jn:'右村 走馬',   p:'★★★',   t:'★★★',   g:'★★★',   s:'Terrain Ignore',  js:'地形無視ショット',col:'#6fa8df',ic:'右',eic:'S',
    spd:50,sc:4,mx:112,s7:50,sc7:4,x7:112,wz:2,wt:4,pw:950,
    w1:230,c1:120,w2:200,c2:100,i1:160,d1:80,i2:130,d2:60,p1:30,e1:30,p2:15,e2:10,gW:114},
 3:{n:'Tsuduru Shibata',  jn:'柴田 綴',     p:'★★★★★★',t:'★',      g:'★★',    s:'Retry Shot',      js:'打ち直し',        col:'#df9f4f',ic:'柴',eic:'T',
    spd:28,sc:7,mx:133,s7:28,sc7:7,x7:133,wz:2,wt:2,pw:1050,
    w1:290,c1:190,w2:270,c2:150,i1:230,d1:110,i2:190,d2:80,p1:30,e1:40,p2:15,e2:20,gW:135},
 4:{n:'Kyoko Jin',        jn:'神 響子',     p:'★★',     t:'★★★★',  g:'★★★★',  s:'Wind/Slope Cancel',js:'風・傾斜消し',    col:'#df6fdf',ic:'神',eic:'K',
    spd:50,sc:3,mx:108,s7:50,sc7:3,x7:108,wz:4,wt:5,pw:650,
    w1:220,c1:110,w2:190,c2:90,i1:160,d1:70,i2:120,d2:40,p1:30,e1:20,p2:15,e2:10,gW:110},
 5:{n:'Philip Kitazaki',  jn:'フィリップ 北崎',p:'★★★★',t:'★★★',   g:'★★★★',  s:'Start Over',      js:'スタートオーバー',col:'#ffdf6f',ic:'P',eic:'P',
    spd:43,sc:5,mx:120,s7:40,sc7:5,x7:120,wz:1,wt:3,pw:1200,
    w1:240,c1:150,w2:220,c2:130,i1:180,d1:100,i2:150,d2:80,p1:30,e1:40,p2:15,e2:20,gW:122},
 6:{n:'Hatao Ichinose',   jn:'一之瀬 旗雄', p:'★★★★★',t:'★★★★★',g:'★★★★★',s:'None',             js:'無し',            col:'#ff6f6f',ic:'旗',eic:'H',
    spd:27,sc:1,mx:125,s7:27,sc7:1,x7:125,wz:0,wt:6,pw:0,
    w1:270,c1:100,w2:250,c2:80,i1:200,d1:70,i2:170,d2:50,p1:30,e1:30,p2:15,e2:10,gW:127},
};


const C1=[null,
 {par:4,wa:3,wz:3,kz:1,y:433,g:30,gkz:0,gwa:0,gwz:0,Ra:[211,0,0],Rz:[234,0,0],Wa:[61,0,0],Wz:[108,0,0],Ba:[373,0,0],Bz:[390,0,0]},
 {par:4,wa:3,wz:3,kz:1,y:460,g:15,gkz:1,gwa:1,gwz:1,Ra:[245,0,0],Rz:[283,0,0],Wa:[79,284,0],Wz:[191,319,0],Ba:[404,0,0],Bz:[441,0,0]},
 {par:5,wa:2,wz:5,kz:2,y:589,g:27,gkz:1,gwa:2,gwz:3,Ra:[175,330,0],Rz:[248,385,0],Wa:[0,0,0],Wz:[0,0,0],Ba:[266,0,0],Bz:[301,0,0]},
 {par:3,wa:0,wz:4,kz:2,y:199,g:13,gkz:1,gwa:3,gwz:3,Ra:[5,0,0],Rz:[49,0,0],Wa:[50,0,0],Wz:[160,0,0],Ba:[161,0,0],Bz:[185,0,0]},
 {par:5,wa:5,wz:5,kz:1,y:642,g:12,gkz:3,gwa:1,gwz:4,Ra:[51,351,0],Rz:[101,401,0],Wa:[151,451,0],Wz:[201,501,0],Ba:[251,551,0],Bz:[301,601,0]},
 {par:5,wa:5,wz:6,kz:1,y:578,g:17,gkz:1,gwa:4,gwz:4,Ra:[280,432,0],Rz:[351,465,0],Wa:[173,519,0],Wz:[217,552,0],Ba:[241,386,0],Bz:[279,431,0]},
];

const C2=[null,
 {par:5,wa:4,wz:3,kz:1,y:542,g:20,gkz:0,gwa:0,gwz:0,Ra:[186,264,439],Rz:[225,283,454],Wa:[403,0,0],Wz:[436,0,0],Ba:[226,490,0],Bz:[263,510,0]},
 {par:3,wa:3,wz:7,kz:3,y:155,g:12,gkz:2,gwa:0,gwz:4,Ra:[0,0,0],Rz:[0,0,0],Wa:[5,0,0],Wz:[121,0,0],Ba:[122,0,0],Bz:[142,0,0]},
 {par:5,wa:5,wz:5,kz:1,y:552,g:16,gkz:1,gwa:3,gwz:3,Ra:[193,486,0],Rz:[275,535,0],Wa:[27,307,0],Wz:[160,392,0],Ba:[441,0,0],Bz:[485,0,0]},
 {par:6,wa:3,wz:9,kz:2,y:666,g:25,gkz:3,gwa:3,gwz:4,Ra:[103,351,553],Rz:[222,464,596],Wa:[223,465,0],Wz:[320,552,0],Ba:[597,0,0],Bz:[622,0,0]},
 {par:4,wa:4,wz:2,kz:1,y:492,g:19,gkz:1,gwa:5,gwz:3,Ra:[164,377,0],Rz:[191,472,0],Wa:[231,0,0],Wz:[376,0,0],Ba:[89,192,0],Bz:[130,200,0]},
 {par:5,wa:9,wz:9,kz:1,y:787,g:10,gkz:1,gwa:5,gwz:5,Ra:[0,0,0],Rz:[0,0,0],Wa:[0,0,0],Wz:[0,0,0],Ba:[0,0,0],Bz:[0,0,0]},
 {par:3,wa:6,wz:9,kz:2,y:254,g:14,gkz:1,gwa:2,gwz:2,Ra:[3,237,0],Rz:[9,239,0],Wa:[221,0,0],Wz:[236,0,0],Ba:[10,117,190],Bz:[89,168,220]},
 {par:5,wa:4,wz:7,kz:3,y:478,g:20,gkz:2,gwa:2,gwz:5,Ra:[95,290,0],Rz:[172,363,0],Wa:[182,381,0],Wz:[237,436,0],Ba:[238,0,0],Bz:[276,0,0]},
 {par:6,wa:9,wz:9,kz:1,y:864,g:13,gkz:3,gwa:4,gwz:5,Ra:[140,287,405],Rz:[193,327,572],Wa:[328,710,800],Wz:[404,774,850],Ba:[219,573,775],Bz:[251,602,790]},
];

const G={
 bgm:true,cmd:0,ch:0,hcy:false,cr:0,
 nH:1,par:4,wa:0,wz:0,kz:0,y1:0,y2:0,y3:0,gz:15,gkz:0,gwa:0,gwz:0,holeScores:[],holePars:[],
 Ra:[0,0,0],Rz:[0,0,0],Wa:[0,0,0],Wz:[0,0,0],Ba:[0,0,0],Bz:[0,0,0],
 cp:0,cp2:0,lp:0,ji:1,drv:0,wind:0,
 ns:1,nw:0,nwt:0,nwz:0,mpt:0,bon:0,sc:0,pts:0,lpts:0,lsh:0,lji:0,ly2:0,spc:0,
 nHIO:0,nALB:0,nEAG:0,nBIR:0,nCHP:0,n4:0,maxy:0,
 w1:200,w2:180,i1:130,i2:100,p1:30,p2:15,
 c1:90,c2:70,d1:60,d2:40,e1:10,e2:0,pw:800,
 kw1:0,kw2:0,ki1:0,ki2:0,pw1:900,pw2:700,pi1:600,pi2:500,
 ng:0,price:0,sel:0,
 gMax:100,gSpd:30,gScl:1,gW:0,gDir:false,gIv:null,mHeld:false,
 mv:null,t0:0,
 sm:0,ss:0,st:0,sk:0,sp:0,sh:0,
 uf3:true,uf4:true,uf5:true,uf6:true, // chara3-6初期解放
};


function applyStats(){
  const d=CD[G.ch];
  G.w1=d.w1;G.w2=d.w2;G.i1=d.i1;G.i2=d.i2;G.p1=d.p1;G.p2=d.p2;
  G.c1=d.c1;G.c2=d.c2;G.d1=d.d1;G.d2=d.d2;G.e1=d.e1;G.e2=d.e2;
  G.nwz=d.wz;G.nwt=d.wt;G.pw=d.pw;
  G.gMax=d.mx;  // ゲージMax値(mx) ← gWはwaku表示幅(mx+2)なので別
  G.gWakuW=d.gW; // waku表示幅
  G.kw1=0;G.kw2=0;G.ki1=0;G.ki2=0;
}

function loadHD(){
  const db=G.cr===2?C2:C1;
  const h=db[G.nH]||db[1];
  G.par=h.par;G.wa=h.wa;G.wz=h.wz;G.kz=h.kz;G.y1=h.y;G.gz=h.g;
  G.gkz=h.gkz||0;G.gwa=h.gwa||0;G.gwz=h.gwz||0; // グリーン専用傾斜
  G.Ra=[...h.Ra];G.Rz=[...h.Rz];G.Wa=[...h.Wa];G.Wz=[...h.Wz];G.Ba=[...h.Ba];G.Bz=[...h.Bz];
}

function windK(){
  const prev=G.wind;
  let w=0;
  if(G.kz===0){
    w=0;
  } else if(G.kz===1){
    // Pascal: rnd(0,wndz) - rnd(0,wnda) → repeat until w!=prev
    let tries=0;
    do{ w=Math.round(Math.random()*G.wz)-Math.round(Math.random()*G.wa);tries++; }
    while(w===prev && tries<20);
  } else if(G.kz===2){
    // 追い風固定範囲
    if(G.wa===G.wz){ w=G.wa; }
    else{
      let tries=0;
      do{ w=Math.round(Math.random()*(G.wz-G.wa))+G.wa; tries++; }
      while(w===prev && tries<20);
    }
  } else {
    // 向かい風固定範囲
    if(G.wa===G.wz){ w=-G.wa; }
    else{
      let tries=0;
      do{ w=-(Math.round(Math.random()*(G.wz-G.wa))+G.wa); tries++; }
      while(w===prev && tries<20);
    }
  }
  G.wind=Math.max(-9,Math.min(9,w));showWind();
}

function wCk(){
  if(G.nw<=0)return; G.nw--;T('bWndN',G.nw);E('bWnd',G.nw>0);
  const p=G.wind;let at=0;
  // wnda===wndz（一択）の場合は同じ値になるのは仕方ない
  const canChange = G.kz!==0 && !(G.kz===2&&G.wa===G.wz) && !(G.kz===3&&G.wa===G.wz);
  if(canChange){
    do{windK();at++;}while(G.wind===p&&at<30);
  } else {
    windK();
  }
  if(G.spc===4||G.spc===22){S('speBox','none');E('bSpe',G.nwz>0);}
}

function driveK(){
  let drv=Math.round(G.ng*(G.gW/100)); // Pascal: gauge.width/100
  if(G.spc!==2){
    if(G.ji===2)drv=Math.round(drv*((G.mpt===G.d1||G.mpt===G.d2)?.65:.58));
    else if(G.ji===3)drv=Math.round(drv*.28);
  }
  const wt={'-9':56,'-8':63,'-7':69,'-6':74,'-5':78,'-4':84,'-3':89,'-2':93,'-1':96,
    '0':100,'1':104,'2':107,'3':111,'4':116,'5':122,'6':126,'7':131,'8':137,'9':144};
  drv=Math.round(drv*(wt[String(G.wind)]||100)/100);
  // ブレ: Pascal bukiyo = Round(Random*range+min)
  // n = Round(Random*2): 0→加算, 1or2→減算 (1/3加 2/3減)
  let bu=0;const ch=G.ch;
  if(ch===2) bu=Math.round(Math.random()*7+2);      // 2..9
  else if(ch===3) bu=Math.round(Math.random()*12+5);// 5..17
  else if(ch===4) bu=Math.round(Math.random()*5+2); // 2..7
  else if(ch===5) bu=Math.round(Math.random()*9+3); // 3..12
  const sign=(Math.round(Math.random()*2)===0)?1:-1; // 1/3加, 2/3減
  G._bu=bu; G._buSign=sign; // 計算式用
  drv+=sign*bu;
  if(drv<=0)drv=1;
  if(G.spc===12&&drv>=G.y2-3&&drv<=G.y2+3)drv=G.y2;
  G.drv=drv;
}

function puttK(){
  const wt={'-5':40,'-4':52,'-3':64,'-2':76,'-1':88,'0':100,'1':112,'2':124,'3':136,'4':148,'5':160};
  // gW/gMax で正規化（ドライブと同じスケール）
  let drv = G.ng * (G.gW / 100) * (wt[String(Math.max(-5, Math.min(5, G.wind)))] || 100) / 100;

  // ★切り上げで丸める（1mつぶれ対策）
  drv = Math.round(drv);

  // ★0以下なら1
  if (drv < 1) drv = 1;

  // ★カップイン補正（1mパットは除外）
  if (G.y2 > 1 && drv >= G.y2 && drv <= G.y2 + 1) {
      drv = G.y2;
  }

  G.drv = drv;

  // if(G.drv>=G.y2&&G.drv<=G.y2+1)G.drv=G.y2;
}

// ============================================================
// スコアカード
// ============================================================
function buildScoreCardHTML(){
  const scores = G.holeScores;
  const pars   = G.holePars;
  const n = scores.length;
  if(n===0) return '<div style="color:#666;text-align:center;padding:12px">No scores yet</div>';

  // スコア色
  const scoreCol = d => d<=-2?'#f80':d===-1?'#4df':d===0?'#fff':d===1?'#fa4':'#f66';
  const scoreMark = d => d<=-3?'◎':d===-2?'◎':d===-1?'○':d===0?'―':d===1?'□':d===2?'□□':'×';

  // テーブルを組む
  let html = `<table style="width:100%;border-collapse:collapse;font-family:monospace">
  <thead><tr style="border-bottom:1px solid #2a2a4a;color:#668;font-size:10px">
    <th style="padding:3px 4px;text-align:center">HOLE</th>
    <th style="padding:3px 4px;text-align:center">PAR</th>
    <th style="padding:3px 4px;text-align:center">SHOTS</th>
    <th style="padding:3px 4px;text-align:center">±</th>
    <th style="padding:3px 4px;text-align:center"></th>
  </tr></thead><tbody>`;

  let totalPar=0, totalShots=0;
  for(let i=0;i<n;i++){
    const s=scores[i], p=pars[i], d=s-p;
    totalPar+=p; totalShots+=s;
    const even = i%2===0;
    html += `<tr style="background:${even?'#08080f':'#060610'};border-bottom:1px solid #0f0f1a">
      <td style="padding:4px 6px;text-align:center;color:#aaccee;font-weight:bold">${i+1}</td>
      <td style="padding:4px 6px;text-align:center;color:#668">${p}</td>
      <td style="padding:4px 6px;text-align:center;color:#ccc;font-weight:bold">${s}</td>
      <td style="padding:4px 6px;text-align:center;color:${scoreCol(d)};font-weight:bold">${d>0?'+':''}${d}</td>
      <td style="padding:4px 6px;text-align:center;color:${scoreCol(d)};font-size:13px">${scoreMark(d)}</td>
    </tr>`;
  }

  // 合計行
  const tot=totalShots-totalPar;
  html += `<tr style="background:#0a0a18;border-top:2px solid #2a2a4a">
    <td style="padding:5px 6px;text-align:center;color:#aaccee;font-weight:bold;font-size:12px" colspan="2">TOTAL</td>
    <td style="padding:5px 6px;text-align:center;color:#fff;font-weight:bold;font-size:14px">${totalShots}</td>
    <td style="padding:5px 6px;text-align:center;color:${scoreCol(tot)};font-weight:bold;font-size:14px">${tot>0?'+':''}${tot}</td>
    <td style="padding:5px 6px;text-align:center;color:${scoreCol(tot)};font-size:16px">${scoreMark(tot)}</td>
  </tr>`;

  html += '</tbody></table>';

  // 凡例
  html += `<div style="display:flex;gap:8px;padding:6px 4px;flex-wrap:wrap;justify-content:center">
    <span style="color:#f80;font-size:10px">◎ Eagle+</span>
    <span style="color:#4df;font-size:10px">○ Birdie</span>
    <span style="color:#fff;font-size:10px">― Par</span>
    <span style="color:#fa4;font-size:10px">□ Bogey</span>
    <span style="color:#f66;font-size:10px">× Double+</span>
  </div>`;
  return html;
}

function showScoreCard(){
  const el=document.getElementById('gScoreCard');
  const tbl=document.getElementById('scCardTable');
  const ttl=document.getElementById('scCardTitle');
  if(!el||!tbl) return;
  const cr={1:'Practice',2:'Championship'};
  if(VS.active){
    ttl.textContent=L[_lang].vsScoreCard;
    // 1PとCPUの両スコアカードを横並び
    const scoreCol=d=>d<=-2?'#f80':d===-1?'#4df':d===0?'#fff':d===1?'#fa4':'#f66';
    const pars=G.holePars;
    function makeCol(label,col,scores){
      if(!scores||scores.length===0) return `<div style="flex:1;color:#666;text-align:center;padding:8px">${label}</div>`;
      let h=`<div style="flex:1;background:#060612;border:1px solid ${col}44;border-radius:8px;padding:6px;min-width:0">`;
      h+=`<div style="color:${col};font-size:11px;font-weight:bold;text-align:center;margin-bottom:4px">${label}</div>`;
      h+=`<table style="width:100%;border-collapse:collapse;font-size:10px;font-family:monospace">`;
      h+=`<tr style="color:#556"><td style="padding:1px 3px">H</td><td>Par</td><td>S</td><td>±</td></tr>`;
      let tot=0,totPar=0;
      const maxLen=Math.max(scores.length, pars.length);
      for(let i=0;i<maxLen;i++){
        const s=scores[i],p=pars[i]||4; // sがundefinedなら未プレイ
        const played=s!==undefined&&s>0;
        const d=played?s-p:0;
        if(played){tot+=s;totPar+=p;}
        h+=`<tr style="border-bottom:1px solid #0f0f1a"><td style="padding:2px 3px;color:#aaccee">${i+1}</td><td style="color:#556">${p}</td><td style="color:#ccc;font-weight:bold">${played?s:'-'}</td><td style="color:${played?scoreCol(d):'#666'};font-weight:bold">${played?(d>0?'+':'')+d:'-'}</td></tr>`;
      }
      const td=tot-totPar;
      h+=`<tr style="border-top:1px solid #2a2a4a"><td colspan="2" style="color:#aaccee">${L[_lang].lbTot}</td><td style="color:#fff;font-weight:bold">${tot}</td><td style="color:${scoreCol(td)};font-weight:bold">${td>0?'+':''}${td}</td></tr>`;
      h+='</table></div>';
      return h;
    }
    const pd=CD[G.ch]||{n:'YOU',col:'#aaccee'};
    const cpud=CD[VS.cpuCh]||{n:'CPU',col:'#aaaaaa'};
    tbl.innerHTML=`<div style="display:flex;gap:6px;width:100%">`+
      makeCol('YOU '+cdN(pd).split(' ')[0], pd.col, G.holeScores)+
      makeCol(cdN(cpud).split(' ')[0], cpud.col, VS.cpuScores)+
      `</div>`;
  } else {
    const crNames=L[_lang].recCrsNames||{1:'Practice',2:'Championship'};
    ttl.textContent = (crNames[G.cr]||'') + ' ' + L[_lang].scCardTitle;
    tbl.innerHTML = buildScoreCardHTML();
  }
  el.style.display='flex';
}

function closeScoreCard(){
  const el=document.getElementById('gScoreCard');
  if(el) el.style.display='none';
}


// ============================================================
// VS モード
// ============================================================
const VS = {
  active: false,      // VSモード中か
  cpuCh: 0,           // CPU キャラ番号
  cpuSc: 0,           // CPU 累計スコア
  cpuPts: 0,          // CPU 残ポイント
  cpuScores: [],      // CPU ホール別打数
  cpuPars: [],        // ホール別パー（同一）
  playerTurn: true,   // true=プレイヤーターン, false=CPUターン
  playerSc: 0,        // プレイヤー最終スコア（endGame後に確定）
  playerScores: [],
};

// VSモード開始: キャラ選択へ（自分選択→相手選択の2ステップ）
let vsStep = 0; // 0=通常, 1=自分選択中, 2=相手選択中

function onStartVS(){
  vsStep=1;
  VS.active=false;
  drawSlotsVS(1);
  sc('scC'); G.cmd=1;
}

function drawSlotsVS(step){
  const grid=document.getElementById('cGrid');
  const hdr=document.getElementById('cHeader');
  grid.innerHTML='';
  if(step===1){
    _setCharaHeader(L[_lang].charaTitle, L[_lang].vsSub1, 'charaTitle', 'vsSub1');
    document.getElementById('cBtnNormal').style.display='';
    document.getElementById('cBtnVSoppo').style.display='none';
  } else {
    _setCharaHeader(L[_lang].vsTitle, L[_lang].vsSub, 'vsTitle', 'vsSub');
    document.getElementById('cBtnNormal').style.display='none';
    document.getElementById('cBtnVSoppo').style.display='';
  }
  for(let n=1;n<=6;n++){
    if(step===2 && n===G.ch) continue; // 自分は除外
    const ok=n<=2||G['uf'+n];
    const d=CD[n];
    const card=document.createElement('div');
    card.className='csCard'+(ok?'':' locked');
    card.id='cs'+n;
    card.style.borderColor=ok?d.col+'55':'#1a1a2a';
    if(ok){
      const imgSrc=CHARA_IMG[n]||'';
      card.innerHTML=(imgSrc
        ?`<img src="${imgSrc}" style="max-width:80%;max-height:72px;width:72px;height:72px;object-fit:contain">`
        :`<div class="csIcon" style="color:${d.col}">${d.ic}</div>`)+
        `<div class="csName" style="color:${d.col}aa">${cdN(d)}</div>`;
    } else {
      card.innerHTML=`<div class="csLockMark">🔒</div><div class="csName" style="color:#333">???</div>`;
    }
    card.addEventListener('click',()=>tapChara(n));
    card.addEventListener('touchend',e=>{e.preventDefault();tapChara(n);});
    grid.appendChild(card);
  }
  pendingChara=0;
  const cdet=document.getElementById('cDetail');
  if(cdet) cdet.style.display='flex';
  const cdn0=document.getElementById('cDetailName');
  if(cdn0){cdn0.textContent=L[_lang].charaPrompt; cdn0.style.color='#888'; cdn0.dataset.empty='1';}
  ['dPow','dTch','dGeo','dSpe'].forEach(id=>{document.getElementById(id).textContent='';});
}

function confirmVSOppo(){
  if(!pendingChara) return;
  VS.cpuCh=pendingChara;
  VS.active=true;
  vsStep=2; // コース選択キャンセル時に相手選択画面に戻れるよう維持
  document.getElementById('cDetail').style.display='none';
  // コース選択へ（選手権のみ）
  G.cr=2; G.pts=1300;
  T('crConfirmInfo', L[_lang].courseInfoChamp);
  document.getElementById('crConfirm').style.display='flex';
  sc('scCR'); updCRbtns(); G.cmd=2;
  updGaugeWaku();
}

// VS yesClick: startGameVS
function startGameVS(){
  VS.cpuSc=0; VS.cpuPts=1300; VS.cpuScores=[]; VS.cpuPars=[];
  VS.playerTurn=true; VS.playerSc=0; VS.playerScores=[];
  startGame();
}

// VSモード用 afterJ: プレイヤーターン終了→CPUターン or ゲーム終了
function afterJVS(){
  // プレイヤーターン終了
  G.pts+=G.mpt; T('gPtsV',G.pts); S('scBox','none'); S('terBox','flex');
  // 重複push防止: このホールがまだ記録されていない場合のみpush
  if(G.holeScores.length < G.nH){
    G.holeScores.push(G.ns); G.holePars.push(G.par);
    VS.playerScores.push(G.ns);
  }
  VS.playerSc=G.sc; // プレイヤーターン終了時点でスコアを確定保存
  rankime();
  VS.playerTurn=false;
  // 最終ホール(H9)はショップをスキップしてスコア確認→CPU番へ
  // ※直接vsStartCPUを呼ぶとG.cmdが残留してH9を再プレイするバグが発生するためenterShopVS経由
  if(G.nH>=9){
    enterShopVS();
  } else {
    enterShop(); // 1Pショップ（買い物）
  }
}

// CPUターン開始（ショップなし）
function enterShopVS(){
  // G.nH はそのまま（プレイヤーと同じホールをCPUがプレイ）
  if(G.nH>9){ VS.playerTurn=true; VS.playerSc=G.sc; showVSResult(); return; }
  loadHD(); // 現在のホールデータを再ロード
  // ショップ画面を出さず、VSスコア画面を表示してから次へ
  showVSInterScore();
}

// CPU番終了後→1Pの次ホールプレイを開始
function vsRestoreForPlayer(){
  // CPUバナー非表示
  const cb=document.getElementById('gCpuBanner'); if(cb) cb.style.display='none';
  // 1Pのキャラ情報を確実に復元
  const pCh=VS._savedCh||G.ch;
  G.ch=pCh;
  cpuRestoreStats(); // 1Pのクラブ情報を復元（ショップ購入分を保持）
  // ボタンのopacityを戻す
  document.getElementById('bWnd').style.opacity='';
  document.getElementById('bWnd').style.display=''; // 再表示
  document.getElementById('bSpe').style.opacity='';
  document.getElementById('bSpe').style.display=''; // 再表示
  // POINTS/bShotを再表示
  const gTopSegsR=document.querySelectorAll('#gTop .gTopSeg');
  gTopSegsR.forEach(s=>{ s.style.visibility=''; });
  document.getElementById('bShot').style.visibility='';
  G.cmd=4;
  // スコア確認画面 → ボタン「>」で1Pホール開始
  showVSInterScore(true);
}

// CPU番スコア確認後 → 1Pホール開始
function vsStartPlayer(){
  // G.nHが最終ホールを超えていたらリザルトへ（H9再プレイ防止）
  if(G.nH>9){ VS.playerSc=G.sc; showVSResult(); return; }
  // 背景・UIをゲームモードに戻す
  const scg=document.getElementById('scG'); if(scg) scg.style.background='';
  const gt=document.getElementById('gTop'); if(gt) gt.style.background='';
  const br=document.getElementById('gBtnRow'); if(br) br.style.background='';
  const ca=document.getElementById('gClubArea'); if(ca) ca.style.background='';
  const bn=document.getElementById('gShopBanner'); if(bn) bn.style.display='none';
  // CPU対戦後に残ったstyleを完全リセット
  document.getElementById('bShot').style.visibility='';
  document.getElementById('bWnd').style.display='';
  document.getElementById('bWnd').style.opacity='';
  document.getElementById('bSpe').style.display='';
  document.getElementById('bSpe').style.opacity='';
  document.querySelectorAll('#gTop .gTopSeg').forEach(s=>{s.style.visibility='';});
  const gPtsElH=document.getElementById('gPtsV'); if(gPtsElH) gPtsElH.style.visibility='';
  const ti=document.getElementById('gTerrainInfo');
  if(ti){ti.innerHTML='';ti.style.display='none';}
  document.getElementById('gGaugeArea').style.display='';
  const tc=document.getElementById('gTerCard'); if(tc) tc.style.display='';
  $('bShot').textContent=L[_lang].lbShotBtn; $('bShot').className='';
  $('bShot').style.visibility='';
  E('bShot',false);
  document.getElementById('bWnd').style.display=''; // 再表示
  document.getElementById('bWnd').style.opacity='';
  document.getElementById('bSpe').style.display=''; // 再表示
  document.getElementById('bSpe').style.opacity='';
  const gTopSegsP=document.querySelectorAll('#gTop .gTopSeg');
  gTopSegsP.forEach(s=>{ s.style.visibility=''; });
  holeStart();
}

// ホール間VSスコア表示（ショップの代わり）
function showVSInterScore(afterCPU){
  // ゲーム画面のままショップ背景にする
  const scg=document.getElementById('scG');
  if(scg) scg.style.background='#030d24';
  const gt=document.getElementById('gTop');
  if(gt) gt.style.background='#040e22';
  document.getElementById('gBtnRow').style.background='#030c1e';
  document.getElementById('gClubArea').style.background='#030c1e';
  // ゲージ・クラブ・地形カードを非表示
  document.getElementById('gGaugeArea').style.display='none';
  document.getElementById('gClubNormal').style.display='none';
  document.getElementById('gClubPutt').style.display='none';
  document.getElementById('gClubShop').style.display='none';
  document.getElementById('gTerCard') && (document.getElementById('gTerCard').style.display='none');
  S('gGiveUp',false); S('speBox',false); S('gShotFormula',false);
  // bShotを次へボタンに（cmd経由で制御 → onclick残存問題を回避）
  // onclick=null は削除（HTML属性のonclick="sCk()"をそのまま使う）
  E('bShot',true);
  if(afterCPU){
    $('bShot').textContent='>';
    G.cmd=16; // 16=CPU番終了後の1P開始待機
  } else {
    $('bShot').textContent='>';
    G.cmd=17; // 17=1P終了後のCPU開始待機
  }
  $('bShot').className='ready';
  E('bWnd',false); E('bSpe',false);
  document.getElementById('bWnd').style.display='none';
  document.getElementById('bSpe').style.display='none';
  // バナーにVSスコア表示（CPU番終了後=afterCPU時はSHOP文字非表示）
  const s=G.sc, sg=s<0?'-':s>0?'+':'±';
  const banner=document.getElementById('gShopBanner');
  if(banner){
    if(!afterCPU){
      // 1P番終了後のスコア表示（ショップ画面と同様のバナー）
      document.getElementById('gShopScore').textContent=sg+Math.abs(s);
      banner.style.display='flex';
    } else {
      // CPU番終了後はSHOP文字を出さない
      banner.style.display='none';
    }
  }
  // gTerrainInfo にVSスコア比較
  const cpud=CD[VS.cpuCh];
  const ti=document.getElementById('gTerrainInfo');
  if(ti){
    const n=G.holeScores.length;
    const psc=G.sc;
    const csc=VS.cpuSc;
    const psg=psc<0?'-':psc>0?'+':'±';
    const csg=csc<0?'-':csc>0?'+':'±';
    const pCol=psc<csc?'#4f4':psc>csc?'#f44':'#ff4';
    const cCol=csc<psc?'#4f4':csc>psc?'#f44':'#ff4';
    ti.innerHTML=
      `<span style="color:#aaccee;font-size:12px">H${afterCPU?G.nH-1:G.nH} Done</span>`+
      `<span style="margin-left:8px;color:${pCol};font-size:13px;font-weight:bold">YOU ${psg}${Math.abs(psc)}</span>`+
      `<span style="color:#666;margin:0 6px">vs</span>`+
      `<span style="color:${cCol};font-size:13px;font-weight:bold">${cdN(cpud).split(' ')[0]} ${csg}${Math.abs(csc)}</span>`+
      `<button onclick="showScoreCard()" style="margin-left:auto;background:#061228;border:1px solid #2a5a8a;color:#88ccee;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;touch-action:manipulation">📋</button>`;
    ti.style.display='flex';
    ti.style.alignItems='center';
  }
  document.getElementById('mPos').style.display='none';
}

function vsStartCPU(){
  // ショップ背景をリセット
  const scg=document.getElementById('scG'); if(scg) scg.style.background='';
  const gt=document.getElementById('gTop'); if(gt) gt.style.background='';
  const br=document.getElementById('gBtnRow'); if(br) br.style.background='';
  const ca=document.getElementById('gClubArea'); if(ca) ca.style.background='';
  const bn=document.getElementById('gShopBanner'); if(bn) bn.style.display='none';
  // CPU対戦後に残ったstyleを完全リセット
  document.getElementById('bShot').style.visibility='';
  document.getElementById('bWnd').style.display='';
  document.getElementById('bWnd').style.opacity='';
  document.getElementById('bSpe').style.display='';
  document.getElementById('bSpe').style.opacity='';
  document.querySelectorAll('#gTop .gTopSeg').forEach(s=>{s.style.visibility='';});
  const gPtsElH=document.getElementById('gPtsV'); if(gPtsElH) gPtsElH.style.visibility='';
  // ゲージ・地形カード表示
  document.getElementById('gGaugeArea').style.display='';
  const tc=document.getElementById('gTerCard'); if(tc) tc.style.display='';
  $('bShot').textContent=''; $('bShot').className='';
  E('bShot',false);
  startCPUHole();
}

// ============================================================
// CPU自動プレイ
// ============================================================
const CPU_DELAY = 600; // ms per step

function cpuApplyStats(){
  const d=CD[VS.cpuCh];
  // CPUのステータスをGに一時設定（プレイヤー値を保存してから）
  VS._savedCh=G.ch; VS._savedStats={
    w1:G.w1,w2:G.w2,i1:G.i1,i2:G.i2,p1:G.p1,p2:G.p2,
    c1:G.c1,c2:G.c2,d1:G.d1,d2:G.d2,e1:G.e1,e2:G.e2,
    nwz:G.nwz,nwt:G.nwt,pw:G.pw,gMax:G.gMax,gWakuW:G.gWakuW,
    kw1:G.kw1,kw2:G.kw2,ki1:G.ki1,ki2:G.ki2,
    sc:G.sc, // 1Pスコアを保存
  };
  G.ch=VS.cpuCh;
  G.w1=d.w1;G.w2=d.w2;G.i1=d.i1;G.i2=d.i2;G.p1=d.p1;G.p2=d.p2;
  G.c1=d.c1;G.c2=d.c2;G.d1=d.d1;G.d2=d.d2;G.e1=d.e1;G.e2=d.e2;
  G.nwz=d.wz;G.nwt=d.wt;G.pw=d.pw;G.gMax=d.mx;G.gWakuW=d.gW;
  G.kw1=0;G.kw2=0;G.ki1=0;G.ki2=0;
  G.sc=0; // CPU番中はG.scを0から使う（cpuJudgeShotではVS.cpuScに加算するが念のため）
}

function cpuRestoreStats(){
  G.ch=VS._savedCh;
  const s=VS._savedStats;
  G.w1=s.w1;G.w2=s.w2;G.i1=s.i1;G.i2=s.i2;G.p1=s.p1;G.p2=s.p2;
  G.c1=s.c1;G.c2=s.c2;G.d1=s.d1;G.d2=s.d2;G.e1=s.e1;G.e2=s.e2;
  G.nwz=s.nwz;G.nwt=s.nwt;G.pw=s.pw;G.gMax=s.gMax;G.gWakuW=s.gWakuW;
  G.kw1=s.kw1;G.kw2=s.kw2;G.ki1=s.ki1;G.ki2=s.ki2;
  if(s.sc!==undefined) G.sc=s.sc; // 1Pスコアを復元
}

function startCPUHole(){
  // 画面: CPU番であることを表示
  const cpuD=CD[VS.cpuCh];
  document.getElementById('gGaugeClub').textContent='';
  document.getElementById('gGaugeCost').textContent='';
  // CPU番: POINTSとbShotを非表示（gTopSeg単位で操作、個別指定なし）
  const gTopSegs=document.querySelectorAll('#gTop .gTopSeg');
  gTopSegs.forEach(s=>{if(s.querySelector('#gPtsV'))s.style.visibility='hidden';});
  document.getElementById('bShot').style.visibility='hidden';
  // 1Pショップのクラブボタンを非表示にしてCPU用に切り替え
  document.getElementById('gClubShop').style.display='none';
  document.getElementById('gClubPutt').style.display='none';
  document.getElementById('gClubNormal').style.display='flex';
  // gTerCard でCPUキャラ表示
  const ci=document.getElementById('gCharaImg');
  if(ci&&CHARA_IMG[VS.cpuCh]){ci.src=CHARA_IMG[VS.cpuCh];ci.style.display='block';}
  // gTop に "CPU TURN" 表示
  document.getElementById('gShopBanner').style.display='none';
  const cpuBanner=document.getElementById('gCpuBanner');
  if(cpuBanner){
    cpuBanner.style.display='flex';
    cpuBanner.querySelector('#gCpuName').textContent=cdN(cpuD);
    cpuBanner.style.borderColor=cpuD.col+'88';
  }
  // ホール初期化（CPU用）
  cpuApplyStats();
  G.mpt=0;G.bon=0;G.cp=0;G.cp2=0;G.lp=0;G.lsh=0;G.lpts=VS.cpuPts;G.ly2=0;G.lji=0;
  G.ji=1;G.ns=0;G.nw=G.nwt;G.spc=0;G.gW=0;G.drv=0;
  const d2=CD[G.ch]; if(d2) G.gMax=d2.mx;
  updGaugeWaku(); loadHD(); G.y2=G.y1;G.y3=0;
  resetClubs(true); // CPUのクラブボタンを更新
  updHUD();updGauge();setTer(1);updMap();windK();
  showTerrainInfo();
  S('scBox','none');S('gUp','none');S('bPro','none');S('speBox','none');
  E('bShot',false); T('bShot',L[_lang].lbShotBtn);
  document.getElementById('bWnd').style.display='';
  T('bWndN',G.nw); E('bWnd',false);
  document.getElementById('bWnd').style.display='none'; // CPU番は非表示
  T('bSpeN',G.nwz); E('bSpe',false);
  document.getElementById('bSpe').style.display='none'; // CPU番は非表示
  document.getElementById('mPos').style.display='';
  // 単位・ラベルをydに戻す（ショップ画面やグリーン上から来た場合の残留を防ぐ）
  T('uYd1','yd');T('uYd2','yd');T('uYd3','yd');
  document.getElementById('gStRest').style.display='';
  document.getElementById('gStFly').style.display='';
  document.getElementById('gStYd4').style.display='none';
  const sfEl=document.getElementById('gShotFormula');
  if(sfEl){sfEl.textContent='';sfEl.style.display='none';}
  G._formula='';
  VS._cpuNs=0; VS._cpuSkip=false; VS._cpuLastWater=false; G._cpuTargetDist=0; VS._cpuFireTimer=null;
  // ガイドメモリを非表示（CPUプレイ中は不要）
  document.getElementById('gGaugeMey').style.display='none';
  // スキップボタン表示
  // const skipBtn=document.getElementById('gCpuSkipBtn');
  // if(skipBtn) skipBtn.style.display='block';
  // CPU番中はクラブボタンをプレイヤーが操作できないように無効化
  document.getElementById('gClubNormal').style.pointerEvents='none';
  document.getElementById('gClubNormal').style.opacity='0.4';
  setTimeout(()=>cpuTakeTurn(), CPU_DELAY);
}

// CPU 1打分の処理
function cpuTakeTurn(){
  if(VS._cpuSkip){ cpuFinishHole(); return; }
  G.ns++;
  VS._cpuNs=G.ns;
  // クラブ選択
  cpuSelectClub();
  // gMax をショット種別に合わせて設定
  const cpuD=CD[VS.cpuCh];
  if(G.ji===5){ G.gMax=cpuD.x7; } else { G.gMax=cpuD.mx; }

  // ===== CPU特技AI =====
  const cpuCh=VS.cpuCh;
  G.spc=0;
  if(G.ji!==5){ // グリーン外

    // 水無(ch=1): パワーショット
    // 条件1: 水ゾーンが目前にあり100%では越えられないが120%なら越えられる
    // 条件2: 1打目で100%ゲージ(ng)でROUGH/WATER/BUNKER着地リスク、120%なら回避できる
    // 条件3: 100%ではグリーンに届かないが120%なら届く
    if(cpuCh===1){
      const ng100=G.ng; // 100%飛距離
      const ng120=Math.round(ng100*1.2); // 120%飛距離（風補正前）
      const wt=({'-9':56,'-8':63,'-7':69,'-6':74,'-5':78,'-4':84,'-3':89,'-2':93,'-1':96,'0':100,'1':104,'2':107,'3':111,'4':116,'5':122,'6':126,'7':131,'8':137,'9':144})[String(G.wind)]||100;
      const drv100=Math.round(ng100*(wt/100));
      const drv120=Math.round(ng120*(wt/100));
      const zones=cpuWaterZonesInRange(drv120+30);
      // 条件1: 水ゾーンを100%では越えられないが120%なら越えられる
      const cond1=zones.length>0 && zones.some(z=>z.wz>drv100 && drv120>z.wz);
      // 条件2: 1打目、100%着地がROUGH/BUNKER/WATERリスク、120%で回避
      let cond2=false;
      if(G.ns===1){
        const land100=G.cp+drv100;
        const land120=G.cp+drv120;
        const isRisky=(pos)=>{
          for(let i=0;i<3;i++){
            if(pos>=G.Ra[i]&&pos<=G.Rz[i]) return true;
            if(pos>=G.Wa[i]&&pos<=G.Wz[i]) return true;
            if(pos>=G.Ba[i]&&pos<=G.Bz[i]) return true;
          }
          return false;
        };
        cond2=isRisky(land100) && !isRisky(land120);
      }
      // 条件3: 100%ではグリーンに届かないが120%なら届く
      const greenNear=G.y1-G.gz, greenFar=G.y1+G.gz;
      const land100g=G.cp+drv100, land120g=G.cp+drv120;
      const cond3=!(land100g>=greenNear&&land100g<=greenFar)&&(land120g>=greenNear&&land120g<=greenFar);
      if((cond1||cond2||cond3) && G.nwz>0){
        G.gMax=120; G.spc=1;
        // ターゲット距離を設定（cpuCalcGaugeが正確なゲージ値を算出できるよう）
        if(cond1){const oz=zones.find(z=>z.wz>drv100&&drv120>z.wz);if(oz)G._cpuTargetDist=(drv120>=(G.y2-G.gz)?G.y2:oz.wz+1);}
        else if(cond2){G._cpuTargetDist=drv120;}
        else if(cond3){G._cpuTargetDist=G.y2;}
        seSpecial();
        T('speBox',cdS(CD[cpuCh])||'SKILL'); S('speBox','flex');
        updGaugeWaku(); updGauge();
        cpuCalcGauge(); // gMax=120で再計算
      }
    }

    // 走馬(ch=2): 地形無視。ROUGH/BUNKER上で水回避に飛距離が必要な時に使用
    else if(cpuCh===2 && (G.ji===2||G.ji===3)){
      const zones=cpuWaterZonesInRange(G.ng+30);
      const needIgnore=zones.length>0 && zones.some(z=>z.wa<=G.ng*1.3 && z.wz>G.ng*0.7);
      if(needIgnore && G.nwz>0){
        G.spc=2;
        seSpecial();
        T('speBox',cdS(CD[cpuCh])||'SKILL'); S('speBox','flex');
      }
    }

    // 響子(ch=4): 風消し
    // 向かい風(wind<0)のみ発動。追い風時はグリーン外では使用しない
    else if(cpuCh===4 && G.wind<0 && G.nwz>0){
      G.wind=0; G.spc=4;
      seSpecial();
      T('speBox',cdS(CD[cpuCh])||'SKILL'); S('speBox','flex');
      showWind();
      cpuCalcGauge();
    }
  } // end if(G.ji!==5) グリーン外特技AI

  // ===== グリーン上特技AI（パット時）=====
  if(G.ji===5){
    // 水無(ch=1): 100%では届かないが120%なら届く場合にパワーショット
    if(cpuCh===1 && G.nwz>0){
      const wt_p={'-5':40,'-4':52,'-3':64,'-2':76,'-1':88,'0':100,'1':112,'2':124,'3':136,'4':148,'5':160};
      const wtP=(wt_p[String(Math.max(-5,Math.min(5,G.wind)))]||100)/100;
      const putt100reach=Math.round(G.p1*(cpuD.x7/100)*wtP);
      const putt120reach=Math.round(G.p1*1.2*(cpuD.x7/100)*wtP);
      if(G.y2>putt100reach && G.y2<=putt120reach){
        G.gMax=120; G.spc=1;
        seSpecial();
        T('speBox',cdS(CD[cpuCh])||'SKILL'); S('speBox','flex');
        updGaugeWaku(); updGauge();
        cpuCalcGauge();
      }
    }
    // 響子(ch=4)
    // 向かい風(wind<0)のみ発動。追い風時はグリーン外では使用しない
    if(cpuCh===4 && G.wind<0 && G.nwz>0){
      G.wind=0; G.spc=4;
      seSpecial();
      T('speBox',cdS(CD[cpuCh])||'SKILL'); S('speBox','flex');
      showWind();
      cpuCalcGauge();
    }
  }

  // ゲージアニメーション開始 → 終了後にショット計算してアニメ開始
  cpuChargeGauge();
}

// ゲージをアニメーションで充填してから発射
function cpuChargeGauge(){
  const cpuD=CD[VS.cpuCh];
  const isPutt=G.ji===5;
  const spd=isPutt?cpuD.s7:cpuD.spd;
  const scl=isPutt?cpuD.sc7:cpuD.sc;
  // 目標ゲージ量を先に計算
  cpuCalcGauge();
  const finalGW=G.gW; // 到達目標
  // ゲージアニメ: 0 → finalGW まで増加
  G.gW=0; updGauge();
  document.getElementById('gGaugeWrap').style.borderColor='#f60';
  $('bShot').className='charging'; $('bShot').textContent=''; // CPU番はブランク
  let gDir=false, gW=0;
  if(G.gIv){clearInterval(G.gIv);G.gIv=null;}
  // 往路で finalGW を通過したら止める（折り返しなし）
  // タイムアウト: 最大30000ms で強制発射（フリーズ防止）
  const chargeStart=Date.now();
  const maxChargeSafe=Math.max(1,scl); // sclが0なら1に
  G.gIv=setInterval(()=>{
    if(VS._cpuSkip || Date.now()-chargeStart>30000){
      clearInterval(G.gIv);G.gIv=null;
      G.gW=finalGW; updGauge();
      cpuFireShot(); return;
    }
    gW=Math.min(G.gMax, gW+maxChargeSafe);
    G.gW=gW; updGauge();
    if(gW>=finalGW || gW>=G.gMax){
      G.gW=finalGW; updGauge();
      clearInterval(G.gIv);G.gIv=null;
      document.getElementById('gGaugeWrap').style.borderColor='';
      $('bShot').className=''; $('bShot').textContent='';
      VS._cpuFireTimer=setTimeout(()=>{VS._cpuFireTimer=null;cpuFireShot();}, 200);
    }
  }, spd);
}

function cpuFireShot(){
  // ショット計算
  const _ng=G.ng, _gW=G.gW, _gMax=G.gMax, _wind=G.wind, _ji=G.ji;
  if(G.ji===5){ puttK(); } else { driveK(); }
  // パット時: drv が極小(<3)の場合、キャラの精度に応じたブレを加味しつつ
  // 少なくとも残り距離に近い飛距離になるよう gW を補正して再計算
  //if(G.ji===5 && G.y2>0){
  if(false){
    const wtP2={'-5':40,'-4':52,'-3':64,'-2':76,'-1':88,'0':100,'1':112,'2':124,'3':136,'4':148,'5':160};
    const wtVal2=(wtP2[String(Math.max(-5,Math.min(5,G.wind)))]||100)/100;
    // カップインに必要な最低gW (y2に対応する値)
    const neededGW=G.ng>0&&wtVal2>0?Math.round(G.y2*100/(G.ng*wtVal2)):G.gMax;
    // 届かない場合(drv<y2)は補正してputtK再実行
    if(neededGW<=G.gMax && G.drv<G.y2){
      G.gW=Math.min(G.gMax, neededGW);
      puttK();
    }
  }
  // 計算式を保存（着地後にshowFormula）
  G._formula = buildFormula(_ng, _gW, _gMax, _wind, _ji, G.drv, _ji===5);
  seShot(); // CPUショット効果音
  // pts消費
  // VS.cpuPts=Math.max(0,VS.cpuPts-G.mpt);
  // G.pts=VS.cpuPts; 
  // T('gPtsV',G.pts);
  G.t0=Date.now();
  if(G.ji===5){ startPtCPU(); } else { startMvCPU(); }
}

// CPU: 指定範囲内（cp〜cp+maxDist）で通過する水ゾーンを全て返す
function cpuWaterZonesInRange(maxDist){
  const zones=[];
  for(let i=0;i<3;i++){
    if(!G.Wa[i]&&!G.Wz[i]) continue;
    const wa=G.Wa[i]-G.cp, wz=G.Wz[i]-G.cp;
    if(wz>0 && wa<maxDist) zones.push({wa:Math.max(0,wa), wz, i});
  }
  zones.sort((a,b)=>a.wa-b.wa);
  return zones;
}

// CPU: 水ゾーンを避けた安全な目標飛距離を返す（クラブ最大射程も考慮）
// avoidance: 1=手前停止, 2=超え優先（強キャラ）
// maxReach: そのクラブの最大飛距離（gW=gMax時）
// forceUnder: true=池ポチャ後。最初の水ゾーンの手前に必ず止まる（超えを試みない）
function cpuSafeDist(requested, avoidance, maxReach, forceUnder){
  const reach = maxReach || requested;
  const zones = cpuWaterZonesInRange(reach+30);
  if(zones.length===0) return requested;

  // ★池ポチャ後: 最初のWATERゾーンの手前に必ず止まる（超え判定をスキップ）
  if(forceUnder){
    const z=zones[0];
    return Math.max(1, z.wa-15); // より大きめのマージンで確実に手前
  }

  // avoidance=1: 余裕+5yd、avoidance=2: 余裕+15yd
  // どちらも「超えられるゾーンは超え、超えられないゾーンの手前で止まる」
  const margin = avoidance===2 ? 15 : 5;
  for(const z of zones){
    const over = z.wz + margin;
    if(over > reach || G.cp+over > G.y1+G.gz){
      // 超えられない → 手前で止まる
      return Math.max(1, z.wa-10);
    }
    // 超えられる → 次のゾーンへ
  }
  return requested;
}

function cpuSelectClub(){
  if(G.ji===5){
    // p1=30mパター、p2=15mパター
    // 残距離がp2の射程内（p2*gMax/100 以下）ならp2の方が精度が出る
    // 残距離がp2射程を超えるならp1を使う
    const cpuDp=CD[VS.cpuCh];
    const p2maxReach=Math.round(G.p2*(cpuDp?cpuDp.x7:100)/100);
    if(G.y2<=p2maxReach){
      G.ng=G.p2;G.mpt=G.e2;G.cmd=7;G.sel=6; // 15mパター
    } else {
      G.ng=G.p1;G.mpt=G.e1;G.cmd=7;G.sel=5; // 30mパター
    }
    G._cpuTargetDist=G.y2;
    return;
  }

  const ch=VS.cpuCh;
  const cpuD2=CD[ch];
  const isStrong=(ch===4||ch===5||ch===6); // 響子・フィリップ・旗雄=強キャラ

  // 風補正テーブル（cpuCalcGaugeと同じ）
  const wt_d={'-9':56,'-8':63,'-7':69,'-6':74,'-5':78,'-4':84,'-3':89,'-2':93,'-1':96,
    '0':100,'1':104,'2':107,'3':111,'4':116,'5':122,'6':126,'7':131,'8':137,'9':144};
  const windFactor=(wt_d[String(G.wind)]||100)/100;

  // ★地形補正係数（driveKと同じロジック）
  // ラフ(ji=2): ウッドは58%, アイアンは65%。バンカー(ji=3): 28%（走馬spc=2は除く）
  // ここではspc=0前提（特技AI発動前）で計算
  function terrainFactor(club){
    if(G.ji===2){
      return (club.mpt===G.d1||club.mpt===G.d2)?0.65:0.58;
    }
    if(G.ji===3) return 0.28;
    return 1.0;
  }

  const clubs=[
    {ng:G.w1,mpt:G.c1,cmd:5,sel:1},
    {ng:G.w2,mpt:G.c2,cmd:5,sel:2},
    {ng:G.i1,mpt:G.d1,cmd:5,sel:3},
    {ng:G.i2,mpt:G.d2,cmd:5,sel:4},
  ];
  const valid=G.ji===3?clubs.slice(2):clubs;

  // 各クラブの風込み・地形込み最大飛距離を計算
  // effectiveMax = ng * windFactor * terrainFactor * (gMax/100)
  const gMax=cpuD2?cpuD2.mx:100;
  const clubsWithReach=valid.map(c=>({
    ...c,
    effectiveMax:Math.round(c.ng*windFactor*terrainFactor(c)*gMax/100)
  }));

  // ★STEP1: グリーンに1打で届くか判定（池ポチャ後は除外）
  // 届くクラブのうち、最も必要ゲージが100%に近いものを選ぶ
  let greenClub=null;
  if(!VS._cpuLastWater){
    for(const c of clubsWithReach){
      if(c.effectiveMax>=G.y2){
        // このクラブでy2を狙うのに必要なゲージ率（風込み・地形込み）
        const tf=terrainFactor(c);
        const neededGW=c.ng>0?G.y2*100/(c.ng*windFactor*tf):G.y2;
        if(neededGW>=50 && neededGW<=gMax){
          if(!greenClub||Math.abs(neededGW-100)<Math.abs(greenClub.neededGW-100)){
            greenClub={...c,neededGW};
          }
        }
      }
    }
  }

  // if(greenClub){
  //   // グリーンに届く → グリーンへの経路にWATERがないか確認
  //   // グリーンへ届くクラブの実効最大射程で水チェック
  //   const greenMaxReach=greenClub.effectiveMax;
  //   // avoidance=2（強キャラ）は水を超えようとする、それ以外は手前停止
  //   const greenAvoidance=isStrong?2:1;
  //   const safeDist=cpuSafeDist(G.y2, greenAvoidance, greenMaxReach, false);
  //   if(safeDist===G.y2){
  //     // 経路に問題なし → グリーン狙い確定
  //     G.ng=greenClub.ng; G.mpt=greenClub.mpt; G.cmd=greenClub.cmd; G.sel=greenClub.sel;
  //     G._cpuTargetDist=G.y2;
  //     return;
  //   }
  //   // WATERが邪魔で直接グリーンに届かない → 後続の通常処理へ（水回避）
  // }

  if(greenClub){
    // グリーンに届く → 経路にWATER/BANKERがないか確認
    const greenMaxReach=greenClub.effectiveMax;
    const greenAvoidance=isStrong?2:1;
    const safeDist=cpuSafeDist(G.y2, greenAvoidance, greenMaxReach, false);
    // WATERチェック通過後、BUNKER経路チェック（グリーン着地点がBANKER内でないか）
    const greenAbsPos=G.cp+G.y2;
    let greenPathClear=(safeDist===G.y2);
    if(greenPathClear){
      for(let i=0;i<3;i++){
        if(G.Ba[i]&&G.Bz[i]&&greenAbsPos>=G.Ba[i]&&greenAbsPos<=G.Bz[i]){
          greenPathClear=false; break;
        }
      }
    }
    if(greenPathClear){
      // 経路に問題なし → グリーン狙い確定
      G.ng=greenClub.ng; G.mpt=greenClub.mpt; G.cmd=greenClub.cmd; G.sel=greenClub.sel;
      G._cpuTargetDist=G.y2;
      return;
    }
    // WATER/BANKERが邪魔 → 後続の通常処理へ
  }

  // ★STEP2: グリーンに届かない（またはWATER経由不可）
  // 方針: できるだけグリーンに近い安全な場所（グリーン > フェアウェイ > ラフ）を狙う
  // WATERとOBは絶対回避。BANKERは避ける。ROUGHは許容（BANKERよりグリーン側なら可）
  let avoidance=ch===3?0:(isStrong?2:1);
  if(VS._cpuLastWater && avoidance!==0) avoidance=1;

  // ★forceUnder有効判定: 池ポチャ後でも次のWATERまで40yd以下なら余裕がないので通常回避
  let useForceUnder=VS._cpuLastWater;
  if(useForceUnder){
    const nearZones=cpuWaterZonesInRange(200);
    if(nearZones.length>0 && nearZones[0].wa<=40) useForceUnder=false;
  }

  // 絶対座標posがWATERかOBか判定（avoidance=0の綴はWATERも無視）
  function isDeadly(pos){
    if(avoidance===0) return pos>G.y1+G.gz;
    if(pos>G.y1+G.gz) return true;
    for(let i=0;i<3;i++){
      if(G.Wa[i]&&G.Wz[i]&&pos>=G.Wa[i]&&pos<=G.Wz[i]) return true;
    }
    return false;
  }

  // 絶対座標posの地形ランク（低いほど優先）
  // 0=グリーン 1=フェアウェイ 2=ラフ 3=バンカー 4=WATER/OB（致命的）
  function terrainRank(pos){
    if(pos>G.y1+G.gz) return 4; // OB
    if(pos>=(G.y1-G.gz)) return 0; // グリーン
    for(let i=0;i<3;i++){
      if(G.Wa[i]&&G.Wz[i]&&pos>=G.Wa[i]&&pos<=G.Wz[i]) return 4; // WATER
      if(G.Ba[i]&&G.Bz[i]&&pos>=G.Ba[i]&&pos<=G.Bz[i]) return 3; // BUNKER
      if(G.Ra[i]&&G.Rz[i]&&pos>=G.Ra[i]&&pos<=G.Rz[i]) return 1; // ROUGH
    }
    return 1; // フェアウェイ
  }

  // 現在地からの相対距離distが「打てるか」判定（gW 50%〜gMax% の範囲内）
  // ラフ・バンカー補正済みの実飛距離でdistに届くかを確認
  function canTarget(club, dist){
    if(club.ng<=0) return false;
    const tf=terrainFactor(club);
    const gw=dist*100/(club.ng*windFactor*tf);
    return gw>=50 && gw<=gMax;
  }

  // 最大飛距離クラブ
  let best=clubsWithReach.reduce((a,b)=>b.effectiveMax>a.effectiveMax?b:a);
  const maxReach=best.effectiveMax;

  // 池ポチャ後(forceUnder)は cpuSafeDist に委ねる
  if(useForceUnder){
    const safeDist=cpuSafeDist(G.y2, avoidance, maxReach, true);
    let targetDist=safeDist;
    let safeClub=null;
    for(const c of clubsWithReach){
      if(canTarget(c, targetDist) && (!safeClub||c.ng>safeClub.ng)) safeClub=c;
    }
    if(safeClub) best=safeClub;
    else best=clubsWithReach.reduce((a,b)=>Math.abs(b.ng-targetDist)<Math.abs(a.ng-targetDist)?b:a);
    G.ng=best.ng; G.mpt=best.mpt; G.cmd=best.cmd; G.sel=best.sel;
    G._cpuTargetDist=targetDist;
    return;
  }

  // ★候補距離リストを生成し「最もグリーンに近い安全な着地点」を選ぶ
  // 候補: グリーン圏、最大飛距離、各ゾーン境界の手前・直後、グリーン手前
  // ゲージブレを考慮した安全マージン（強キャラは精度高いが念のため設ける）
  const safeMargin=13; // ゾーン境界からの安全距離(yd)
  const candidates=[];

  // グリーン圏（y1±gz）を最優先候補として追加
  const greenCenterRel=G.y2;
  const greenNearEdgeRel=(G.y1-G.gz)-G.cp;
  if(greenCenterRel>0 && greenCenterRel<=maxReach) candidates.push(greenCenterRel);
  if(greenNearEdgeRel>0 && greenNearEdgeRel<=maxReach) candidates.push(greenNearEdgeRel);

  // 最大飛距離
  candidates.push(maxReach);

  // 各WATERゾーンの手前(safeMargin)と後ろ(safeMargin)
  for(let i=0;i<3;i++){
    if(!G.Wa[i]&&!G.Wz[i]) continue;
    const waRel=G.Wa[i]-G.cp, wzRel=G.Wz[i]-G.cp;
    if(wzRel<=0) continue;
    if(waRel>maxReach) continue;
    if(waRel>safeMargin) candidates.push(waRel-safeMargin);
    if(wzRel+safeMargin<=maxReach) candidates.push(wzRel+safeMargin);
  }

  // 各BANKERゾーンの手前(safeMargin)と後ろ(safeMargin)
  for(let i=0;i<3;i++){
    if(!G.Ba[i]&&!G.Bz[i]) continue;
    const baRel=G.Ba[i]-G.cp, bzRel=G.Bz[i]-G.cp;
    if(bzRel<=0) continue;
    if(baRel>maxReach) continue;
    if(baRel>safeMargin) candidates.push(baRel-safeMargin);
    if(bzRel+safeMargin<=maxReach) candidates.push(bzRel+safeMargin);
  }

  // 各ROUGHゾーンの手前(roughMargin)と後ろ(safeMargin*2)
  // ラフ脱出は余裕を持たせる（ゲージブレでラフに戻らないよう広めに）
  for(let i=0;i<3;i++){
    if(!G.Ra[i]&&!G.Rz[i]) continue;
    const raRel=G.Ra[i]-G.cp, rzRel=G.Rz[i]-G.cp;
    if(rzRel<=0) continue;
    if(raRel>maxReach) continue;
    const roughMargin=Math.ceil(safeMargin/2);
    const roughExitMargin=safeMargin*2; // ラフ後ろは2倍のマージン
    if(raRel>roughMargin) candidates.push(raRel-roughMargin);
    if(rzRel+roughExitMargin<=maxReach) candidates.push(rzRel+roughExitMargin);
  }

  // グリーン手前フェアウェイ（グリーン前縁のsafeMargin手前）
  if(greenNearEdgeRel>safeMargin && greenNearEdgeRel<=maxReach) candidates.push(greenNearEdgeRel-safeMargin);

  // 各候補をフィルタ・評価して最善を選ぶ
  // 評価基準: 1) 致命的(WATER/OB)を除外 2) 地形ランク小 3) グリーンに近い（絶対座標大）
  let bestTarget=null;
  let bestRank=99, bestPos=-1;

  for(const dist of candidates){
    if(dist<=0) continue;
    if(dist>maxReach) continue;
    const absPos=G.cp+dist;
    let rank=terrainRank(absPos);
    if(rank===4) continue; // WATER/OBは除外
    // safeMargin内にWATER/BANKERが隣接している場合はランクを引き上げ（危険）
    // if(rank<3){
    //   for(let i=0;i<3;i++){
    //     if(G.Wa[i]&&G.Wz[i]){
    //       if(absPos>=G.Wa[i]-safeMargin && absPos<G.Wa[i]) rank=Math.max(rank,3);
    //       if(absPos>G.Wz[i] && absPos<=G.Wz[i]+safeMargin) rank=Math.max(rank,3);
    //     }
    //     if(G.Ba[i]&&G.Bz[i]){
    //       if(absPos>=G.Ba[i]-safeMargin && absPos<G.Ba[i]) rank=Math.max(rank,2);
    //       if(absPos>G.Bz[i] && absPos<=G.Bz[i]+safeMargin) rank=Math.max(rank,2);
    //     }
    //   }
    // }
    if(rank<bestRank || (rank===bestRank && absPos>bestPos)){
      bestRank=rank; bestPos=absPos; bestTarget=dist;
    }
  }

  // 有効な候補がない場合はy2（グリーン距離）をフォールバック
  if(bestTarget===null) bestTarget=Math.min(maxReach, G.y2);

  // bestTargetに合うクラブを選択
  let safeClub=null;
  for(const c of clubsWithReach){
    if(canTarget(c, bestTarget) && (!safeClub||c.ng>safeClub.ng)) safeClub=c;
  }
  if(safeClub) best=safeClub;
  else best=clubsWithReach.reduce((a,b)=>Math.abs(b.ng-bestTarget)<Math.abs(a.ng-bestTarget)?b:a);

  G.ng=best.ng; G.mpt=best.mpt; G.cmd=best.cmd; G.sel=best.sel;
  G._cpuTargetDist=bestTarget;
}

function cpuCalcGauge(){
  const wt_d={'-9':56,'-8':63,'-7':69,'-6':74,'-5':78,'-4':84,'-3':89,'-2':93,'-1':96,
    '0':100,'1':104,'2':107,'3':111,'4':116,'5':122,'6':126,'7':131,'8':137,'9':144};
  const wt_p={'-5':40,'-4':52,'-3':64,'-2':76,'-1':88,'0':100,'1':112,'2':124,'3':136,'4':148,'5':160};

  const isPutt = G.ji === 5;
  const wt = isPutt
    ? (wt_p[String(Math.max(-5, Math.min(5, G.wind)))] || 100)
    : (wt_d[String(G.wind)] || 100);

  // ★★★ パット時は絶対に残り距離だけをターゲットにする ★★★
  let target = isPutt ? G.y2 : (G._cpuTargetDist || G.y2);

  // ★地形補正: ラフ・バンカー上では実飛距離が減るので逆算してゲージを大きくする
  let terrainCorr=1.0;
  if(!isPutt && G.spc!==2){
    if(G.ji===2) terrainCorr=(G.mpt===G.d1||G.mpt===G.d2)?0.65:0.58;
    else if(G.ji===3) terrainCorr=0.28;
  }

  let targetGW = G.ng>0 ? target*100/(G.ng*(wt/100)*terrainCorr) : 50;

  const tLv = CD[VS.cpuCh].t.split('★').length-1;
  const ch  = VS.cpuCh;

  let acc;
  if(isPutt){
    acc = (6 - tLv) * 1.5;
    if(ch===5 || ch===6) acc *= 0.5; // 超精密
  } else {
    acc = (ch===5||ch===6)?(6-tLv)*1.5:(6-tLv)*4;
  }

  targetGW += (Math.random() - 0.5) * 2 * acc;

  // gMax の範囲に収める
  if(targetGW > G.gMax) targetGW = G.gMax;
  if(targetGW < 1)      targetGW = 1;

  // パットは最低 20% を保証
  // const gWmin2 = isPutt ? Math.max(1, Math.round(G.gMax * 0.20)) : 1;

  // 最低1保証
  const gWmin2 = 1;

  G.gW = Math.max(gWmin2, Math.min(G.gMax, Math.round(targetGW)));
}

// CPU専用のドライブアニメ（startMv相当、終了後にcpuDropChk）
function startMvCPU(){
  G.y3=0; G.cp2=G.cp; G.t0=Date.now();
  if(G.mv)clearInterval(G.mv);
  G.mv=setInterval(()=>{
    const el=Date.now()-G.t0;
    const pct=G.drv?G.y3/G.drv:1;
    const n=VS._cpuSkip?0:(pct<.25?24:pct<.3?30:pct<.4?34:pct<.6?39:pct<.8?36:39);
    if(el<n)return; G.t0=Date.now();
    G.y3+=2; G.cp2=G.cp+G.y3; G.y2=G.y1-G.cp2;
    const animPos=G.cp+G.y3;
    const mp=$('mPos');
    if(mp){
      if(animPos>G.y1+G.gz){mp.style.display='none';}
      else{mp.style.left=Math.min(97,Math.round(animPos*100/G.y1))+'%';mp.style.display='';}
    }
    updHUD();
    if(G.y3>=G.drv){
      clearInterval(G.mv);G.mv=null;
      const remaining=G.y1-G.cp;
      G.cp=G.cp+G.drv;G.cp2=G.cp;G.y2=G.y1-G.cp;G.y3=G.drv;
      if(G.drv>=remaining&&G.drv<=remaining+1){
        G.y2=0;G.bon=800;showFormula(); updHUD();updPos();
        seHoleIn(); setTimeout(()=>cpuJudgeShot(),800);return;
      }
      showFormula(); updHUD();updPos();cpuDropChk();
    }
  },16);
}

// CPU専用パットアニメ
function startPtCPU() {
  const y2init = G.y2;
  if (y2init <= 0) {
    // すでにカップイン地点
    seHoleIn();
    setTimeout(() => cpuJudgeShot(), 800);
    return;
  }

  // CPU の意図したパット距離（ゲージから算出された距離）
  const stopAt = G.drv; // ★絶対にこの距離だけ進ませる★
  const willHole = (stopAt >= y2init && stopAt <= y2init + 1);

  // 初期速度（プレイヤーと同じ段差式）
  let spd =
    stopAt < 6 ? 300 :
    stopAt < 12 ? 200 :
    stopAt < 18 ? 130 :
    stopAt < 24 ? 100 :
    stopAt < 30 ?  80 :
    stopAt < 36 ?  67 :
    stopAt < 42 ?  55 : 47;

  let st = 0;
  G.t0 = Date.now();
  G.y3 = 0;

  if (G.mv) clearInterval(G.mv);

  G.mv = setInterval(() => {

    // CPU スキップ（デバッグ用）
    if (VS._cpuSkip) {
      clearInterval(G.mv); G.mv = null;
      // ★必ず stopAt だけ進める★
      const moved = stopAt;
      G.y3 = moved;
      G.y2 = Math.max(0, y2init - moved);
      G.cp = G.y1 - G.y2;
      updHUD(); updPos();

      if (G.y2 === 0) {
        G.bon = 0;
        seHoleIn();
        setTimeout(() => cpuJudgeShot(), 800);
      } else {
        setTimeout(() => cpuTakeTurn(), CPU_DELAY);
      }
      return;
    }

    // 時間経過で進行
    if (Date.now() - G.t0 < spd) return;
    G.t0 = Date.now();

    // スピード調整（肥大化しないよう安全処理）
    if (willHole) {
      spd = Math.min(120, spd + (st < 50 ? 2 : st < 100 ? 4 : 6));
    } else {
      spd = Math.min(300, spd + (st < 100 ? 4 : st < 170 ? 8 : st < 250 ? 12 : 18));
    }

    st++;

    // ★必ず y3++ する（アニメーション本体）★
    G.y3++;
    const moved = G.y3;

    // カップからの残り距離（表示用）
    G.y2 = Math.max(0, y2init - moved);

    // 表示用移動ポインタ
    const mp = $('mPos');
    if (mp) {
      const pct = Math.min(97, Math.round((G.cp + moved) * 100 / G.y1));
      mp.style.left = pct + '%';
    }

    updHUD();

    // ★本当の停止条件：stopAt に到達したかどうか★
    if (moved >= stopAt) {
      clearInterval(G.mv); G.mv = null;

      // ▼ カップイン判定
      if (G.y2 === 0 || willHole) {
        // カップイン
        G.y2 = 0;
        G.y3 = y2init;
        G.bon = 0;
        G.cp = G.y1;
        showFormula();
        updHUD(); updPos();
        seHoleIn();
        setTimeout(() => cpuJudgeShot(), 800);
      } else {
        // 入らなかった場合
        G.cp = G.y1 - G.y2;
        showFormula();
        updHUD(); updPos();
        setTimeout(() => cpuTakeTurn(), CPU_DELAY);
      }

      return;
    }

  }, 16);
}

/**
function startPtCPU(){
  const y2init=G.y2;
  // y2=0は既にカップイン位置（cpuDropChkから来た場合など）
  if(y2init<=0){ seHoleIn(); setTimeout(()=>cpuJudgeShot(), 30000); return; }
  const willHole=G.drv>=y2init&&G.drv<=y2init+1; // 元仕様: drv∈[y2, y2+1]のみカップイン
  const stopAt=G.drv;
  // カップイン時は一定速度でアニメ（プレイヤーと同じspdロジック）
  let spd=stopAt<6?300:stopAt<12?200:stopAt<18?130:stopAt<24?100:stopAt<30?80:stopAt<36?67:stopAt<42?55:47;
  let st=0;
  if(G.mv)clearInterval(G.mv);
  G.mv=setInterval(()=>{
    if(VS._cpuSkip){
      clearInterval(G.mv);G.mv=null;
      G.y3=stopAt;G.y2=y2init-stopAt;
      if(willHole){G.y2=0;G.y3=y2init;G.bon=0;G.cp=G.y1;updHUD();updPos();cpuJudgeShot();}
      else{G.cp=G.y1-G.y2;updHUD();updPos();setTimeout(()=>cpuTakeTurn(),CPU_DELAY);}
      return;
    }
    if(Date.now()-G.t0<spd)return; G.t0=Date.now();
    // カップイン時はspdを緩やかに増加（速くなりすぎない）
    if(willHole){
      spd=Math.min(120,spd+(st<50?2:st<100?4:6));
    } else {
      spd=Math.min(450,spd+(st<100?4:st<170?10:st<250?15:st<340?24:32));
    }
    st++;
    G.y3++;G.y2--;
    const putPct=Math.min(97,Math.round((G.cp+G.y3)*100/G.y1));
    const mp=$('mPos'); if(mp) mp.style.left=putPct+'%';
    updHUD();
    if(G.y2<=0&&!willHole){ // y2が0になったらカップイン（willHole未設定でも）
      clearInterval(G.mv);G.mv=null;
      G.y2=0;G.y3=y2init;G.bon=0;G.cp=G.y1;showFormula();updHUD();updPos();
      seHoleIn(); setTimeout(()=>cpuJudgeShot(), 800); return;
    }
    if(G.y3>=stopAt){
      clearInterval(G.mv);G.mv=null;
      if(willHole){
        G.y2=0;G.y3=y2init;G.bon=0;
        G.cp=G.y1;showFormula();updHUD();updPos();
        // カップインのSEを鳴らして少し間を置く
        seHoleIn();
        setTimeout(()=>cpuJudgeShot(), 800);
      } else {
        G.cp=G.y1-G.y2;showFormula();updHUD();updPos();
        setTimeout(()=>cpuTakeTurn(),CPU_DELAY);
      }
    }
  },16);
}
**/

function cpuDropChk(){
  // ショット着地後に特技効果をリセット
  if(G.spc===1){ G.gMax=CD[VS.cpuCh].mx; updGaugeWaku(); } // 水無: ゲージ100%に戻す
  // 走馬(spc=2)はdriveK内で参照後リセット不要（次ショット前にspc=0にする）
  if(G.spc===4){ // 響子: 風・傾斜消し解除（コースの風パラメータ復元）
    loadHD(); // wa/wz/kzをコース値に戻す
  }
  if(G.spc!==0){ S('speBox','none'); G.spc=0; }
  G.ji=1;
  for(let i=0;i<3;i++){
    if(G.cp>=G.Ra[i]&&G.cp<=G.Rz[i])G.ji=2;
    if(G.cp>=G.Wa[i]&&G.cp<=G.Wz[i])G.ji=4;
    if(G.cp>=G.Ba[i]&&G.cp<=G.Bz[i])G.ji=3;
  }
  if(G.cp>=(G.y1-G.gz)&&G.cp<=(G.y1+G.gz))G.ji=5;
  if(G.cp>(G.y1+G.gz))G.ji=6;
  if(G.cp===0)G.ji=1;
  setTer(G.ji,G.ji===5);
  if(G.ji===6){const mp=$('mPos');if(mp)mp.style.display='none';}
  // ★今ターンに水落ち/OBが発生したか記録
  const thisHitWater=(G.ji===4||G.ji===6);
  // OB/ウォーター: ペナルティ
  if(G.ji===4||G.ji===6){
    if(G.ji===4) VS._cpuLastWater=true; // 池ポチャ記録
    G.ns++;VS._cpuNs=G.ns;
    G.cp=G.lp;G.ji=1;
    for(let i=0;i<3;i++){
      if(G.cp>=G.Ra[i]&&G.cp<=G.Rz[i])G.ji=2;
      if(G.cp>=G.Ba[i]&&G.cp<=G.Bz[i])G.ji=3;
    }
    if(G.cp===0)G.ji=1;setTer(G.ji);updPos();
    G.y2=G.y1-G.cp;
    // ギブアップ判定
    if(G.ns>=(G.par+4)){cpuFinishHole();return;}
  }
  if(G.ji===5){
    seChime(); // オングリーン（CPUも同じ効果音）
    G.y2=Math.abs(G.y1-G.cp);
    // ちょうどカップ位置に着地した場合は即カップイン（チップイン）
    if(G.y2===0){G.bon=0;updHUD();updPos();seHoleIn();setTimeout(()=>cpuJudgeShot(),800);return;}
    if(G.ns>=(G.par+4)){cpuFinishHole();return;}
    // グリーン傾斜設定
    G.wa=G.gwa;G.wz=G.gwz;G.kz=G.gkz;windK();
    G.wind=Math.max(-5,Math.min(5,G.wind));
    T('uYd2','m'); T('uYd3','m'); // グリーン上は単位をmに
    updWindLabel(); // 「傾/SLP」ラベルに切替
  }
  if(G.ns>=(G.par+4)){cpuFinishHole();return;}
  G.lp=G.cp;
  // ★池ポチャ後フラグのリセット: 今ターンが安全着地（水落ち/OBなし）の場合のみ
  if(VS._cpuLastWater && !thisHitWater) VS._cpuLastWater=false;
  // 着地後に次打の風を更新（1打目はstartCPUHoleで設定済み）
  if(G.ji!==5) windK(); // グリーン以外は次打の風を変更
  updHUD();
  setTimeout(()=>cpuTakeTurn(),CPU_DELAY);
}

function cpuJudgeShot(){
  const df=G.ns-G.par;
  if(G.ns===1)G.mpt=2400+G.bon+200;
  else if(df<=-5)G.mpt=2100+G.bon+200;
  else if(df===-4)G.mpt=1900+G.bon+200;
  else if(df===-3)G.mpt=1700+G.bon;
  else if(df===-2)G.mpt=1200+G.bon;
  else if(df===-1)G.mpt=800+G.bon;
  else if(df===0)G.mpt=500+G.bon;
  else if(df===1)G.mpt=300+Math.trunc(G.bon/2);
  else if(df===2)G.mpt=200+Math.trunc(G.bon/2);
  else if(df>=3)G.mpt=20+Math.trunc(G.bon/4);
  VS.cpuSc+=(G.ns-G.par); // CPUスコアはVS.cpuScに記録（G.scに混入しない）
  VS.cpuPts=Math.max(0,VS.cpuPts-G.mpt);
  // フラッシュ表示してからcpuFinishHole（スキップ時も表示するが操作をブロック）
  showScoreFlash(G.ns, G.par, null, 1300);
  const _prevCmd=G.cmd; G.cmd=0; // フラッシュ中はsCkを無効化
  setTimeout(()=>{ G.cmd=_prevCmd; cpuFinishHole(); }, 1300);
}

function cpuFinishHole(){
  if(G.mv){clearInterval(G.mv);G.mv=null;}
  VS._cpuNs=G.ns;
  VS.cpuScores.push(G.ns); VS.cpuPars.push(G.par);
  // cpuSc: カップイン時はcpuJudgeShotで更新済み、ギブアップ時はここで計算
  if(G.y2>0){ VS.cpuSc+=(G.ns-G.par); showGiveUpFlash(); } // y2>0=ホール未完了(ギブアップ)
  // スキップボタン非表示
  const skipBtn=document.getElementById('gCpuSkipBtn');
  if(skipBtn) skipBtn.style.display='none';
  const cpuBanner=document.getElementById('gCpuBanner');
  if(cpuBanner) cpuBanner.style.display='none';
  // CPUの統計値を戻す
  cpuRestoreStats();
  // プレイヤーのキャラ画像を戻す
  const ci=document.getElementById('gCharaImg');
  const pCh=VS._savedCh||G.ch;
  if(ci&&CHARA_IMG[pCh]){ci.src=CHARA_IMG[pCh];ci.style.display='block';}
  VS.playerTurn=true;
  // クラブボタンをプレイヤー操作可能に戻す
  document.getElementById('gClubNormal').style.pointerEvents='';
  document.getElementById('gClubNormal').style.opacity='';
  G.nH++; // CPUホール終了後に次ホールへ
  if(G.nH>9){
    VS.playerSc=G.sc; showVSResult(); return;
  }
  // 次ホールの1Pプレイを開始（ショップは1Pホール終了後）
  vsRestoreForPlayer();
}

function skipCPU(){
  VS._cpuSkip=true;
  // ドライブアニメ中断時: G.cpをショット結果の確定値に進める
  if(G.mv && G.drv>0 && G.y3>0 && G.y3<G.drv){
    G.cp=Math.min(G.y1+G.gz, G.cp+G.drv);
    G.y2=G.y1-G.cp;
    G.cp2=G.cp; G.y3=G.drv;
  }
  if(G.gIv){clearInterval(G.gIv);G.gIv=null;}
  if(G.mv){clearInterval(G.mv);G.mv=null;}
  if(VS._cpuFireTimer){clearTimeout(VS._cpuFireTimer);VS._cpuFireTimer=null;}
  // 残りショットをアニメなしで自動完走
  cpuAutoFinish();
}

// アニメなしでCPUのホールを完走させる（スキップ用）
function cpuAutoFinish(){
  const maxShots=G.par+4;
  // 現在地(G.cp)から残り距離(G.y2)がある限りショットを繰り返す
  for(let safety=0; safety<20; safety++){
    if(G.y2<=0){ // カップイン済み
      cpuJudgeShot(); return;
    }
    if(G.ns>=maxShots){ // ギブアップ
      break;
    }
    G.ns++;
    // クラブ選択・ゲージ計算
    cpuSelectClub();
    const cpuD=CD[VS.cpuCh];
    if(G.ji===5){ G.gMax=cpuD.x7; } else { G.gMax=cpuD.mx; }

    // ===== 特技AI（cpuTakeTurnと同等）=====
    G.spc=0;
    if(G.ji!==5){
      // 水無(ch=1): パワーショット
      if(cpuCh===1){
        const ng100=G.ng;
        const ng120=Math.round(ng100*1.2);
        const wt=({'-9':56,'-8':63,'-7':69,'-6':74,'-5':78,'-4':84,'-3':89,'-2':93,'-1':96,'0':100,'1':104,'2':107,'3':111,'4':116,'5':122,'6':126,'7':131,'8':137,'9':144})[String(G.wind)]||100;
        const drv100=Math.round(ng100*(wt/100));
        const drv120=Math.round(ng120*(wt/100));
        const zones=cpuWaterZonesInRange(drv120+30);
        const cond1=zones.length>0 && zones.some(z=>z.wz>drv100 && drv120>z.wz);
        let cond2=false;
        if(G.ns===1){
          const land100=G.cp+drv100, land120=G.cp+drv120;
          const isRisky=(pos)=>{for(let i=0;i<3;i++){if(pos>=G.Ra[i]&&pos<=G.Rz[i])return true;if(pos>=G.Wa[i]&&pos<=G.Wz[i])return true;if(pos>=G.Ba[i]&&pos<=G.Bz[i])return true;}return false;};
          cond2=isRisky(land100)&&!isRisky(land120);
        }
        const greenNear=G.y1-G.gz,greenFar=G.y1+G.gz;
        const land100g=G.cp+drv100,land120g=G.cp+drv120;
        const cond3=!(land100g>=greenNear&&land100g<=greenFar)&&(land120g>=greenNear&&land120g<=greenFar);
        if((cond1||cond2||cond3)&&G.nwz>0){
          G.gMax=120; G.spc=1;
          if(cond1){const oz=zones.find(z=>z.wz>drv100&&drv120>z.wz);if(oz)G._cpuTargetDist=(drv120>=(G.y2-G.gz)?G.y2:oz.wz+1);}
          else if(cond2){G._cpuTargetDist=drv120;}
          else if(cond3){G._cpuTargetDist=G.y2;}          
        }
      }
      // 走馬(ch=2)
      else if(cpuCh===2&&(G.ji===2||G.ji===3)){
        const zones=cpuWaterZonesInRange(G.ng+30);
        if(zones.length>0&&zones.some(z=>z.wa<=G.ng*1.3&&z.wz>G.ng*0.7)&&G.nwz>0){
          G.spc=2;         }
      }
      // 響子(ch=4): 向かい風は常に発動、追い風はグリーン付近または水ゾーンあり
      else if(cpuCh===4 && G.nwz>0){
        const negWind=(G.wind<0);
        const zones=cpuWaterZonesInRange(G.ng*2);
        const waterRisk=zones.length>0;
        const nearGreen=G.y2<=G.ng*1.5;
        if(negWind || waterRisk || nearGreen){
          G.wind=0; G.spc=4;
        }
      }
    } else {
      // グリーン上特技AI
      if(cpuCh===1&&G.nwz>0){
        const wt_p={'-5':40,'-4':52,'-3':64,'-2':76,'-1':88,'0':100,'1':112,'2':124,'3':136,'4':148,'5':160};
        const wtP=(wt_p[String(Math.max(-5,Math.min(5,G.wind)))]||100)/100;
        const putt100reach=Math.round(G.p1*(cpuD.x7/100)*wtP);
        const putt120reach=Math.round(G.p1*1.2*(cpuD.x7/100)*wtP);
        if(G.y2>putt100reach&&G.y2<=putt120reach){G.gMax=120;G.spc=1;}
      }
      // 響子(ch=4): 風が0でなければ風消し
      if(cpuCh===4&&G.wind!==0&&G.nwz>0){G.wind=0;G.spc=4;}
    }

    cpuCalcGauge();
    // ショット計算（アニメなし）
    if(G.ji===5){ puttK(); } else { driveK(); }
    // ショット後の特技効果リセット
    if(G.spc===1){ G.gMax=CD[VS.cpuCh].mx; }
    if(G.spc===4){ loadHD(); }
    G.spc=0;
    // 位置更新
    const remaining=G.y1-G.cp;
    if(G.drv>=remaining&&G.drv<=remaining+1){
      // カップイン
      G.y2=0; G.bon=800; G.cp=G.y1;
      updHUD(); updPos(); // SHOT数・残り距離を更新
      cpuJudgeShot(); return;
    }
    G.cp=Math.min(G.y1+G.gz, G.cp+G.drv);
    G.y2=G.y1-G.cp;
    // 地形判定
    G.ji=1;
    for(let i=0;i<3;i++){
      if(G.cp>=G.Ra[i]&&G.cp<=G.Rz[i])G.ji=2;
      if(G.cp>=G.Wa[i]&&G.cp<=G.Wz[i])G.ji=4;
      if(G.cp>=G.Ba[i]&&G.cp<=G.Bz[i])G.ji=3;
    }
    if(G.cp>=(G.y1-G.gz)&&G.cp<=(G.y1+G.gz))G.ji=5;
    if(G.cp>(G.y1+G.gz))G.ji=6;
    if(G.cp===0)G.ji=1;
    // OB/水: ペナルティ
    if(G.ji===4||G.ji===6){
      if(G.ji===4) VS._cpuLastWater=true;
      G.ns++; G.cp=G.lp; G.y2=G.y1-G.cp;
      G.ji=1;
      for(let i=0;i<3;i++){
        if(G.cp>=G.Ra[i]&&G.cp<=G.Rz[i])G.ji=2;
        if(G.cp>=G.Ba[i]&&G.cp<=G.Bz[i])G.ji=3;
      }
      if(G.cp===0)G.ji=1;
      if(G.ns>=maxShots) break;
    }
    // グリーン傾斜切り替え
    if(G.ji===5){
      G.wa=G.gwa;G.wz=G.gwz;G.kz=G.gkz;windK();
      G.wind=Math.max(-5,Math.min(5,G.wind));
      G.y2=Math.abs(G.y1-G.cp);
    }
    // ★池ポチャ後に安全着地できた→フラグリセット
    if(VS._cpuLastWater && G.ji!==4 && G.ji!==6) VS._cpuLastWater=false;
    G.lp=G.cp;
  }
  // ギブアップ
  G.y2=1;
  updHUD(); updPos();
  cpuFinishHole();
}

// VSリザルト表示
function showVSResult(){
  // ★全ホール完走時にDBへ保存（VSモードはendGameを通らないためここで実行）
  const _lastH=G.cr===2?9:6;
  if(G.holeScores.length >= _lastH){
    const ch=VS._savedCh||G.ch;
    dbSaveRunBest(G.cr, ch, G.holeScores, G.holePars);
    dbRecordPlay(ch);
  }
  const pc=VS._savedCh||G.ch;
  const cc=VS.cpuCh;
  const pd=CD[pc],cpud=CD[cc];
  const pSc=VS.playerSc, cSc=VS.cpuSc;
  const pScores=G.holeScores, cScores=VS.cpuScores;
  const pars=G.holePars;
  const judgeEl=document.getElementById('vsEndJudge');
  let judgeText,judgeColor;
  if(pSc<cSc){judgeText='YOU WIN!';judgeColor='#4f4';}
  else if(pSc>cSc){judgeText='YOU LOSE';judgeColor='#f44';}
  else{judgeText='DRAW';judgeColor='#ff4';}
  judgeEl.textContent=judgeText;
  judgeEl.style.color=judgeColor;
  // スコアカード2列
  const scoreCol=d=>d<=-2?'#f80':d===-1?'#4df':d===0?'#fff':d===1?'#fa4':'#f66';
  function makeCard(name,col,scores,isPlayer,charaKey){
    const imgSrc=CHARA_IMG[charaKey]||'';
    let html=`<div style="flex:1;background:#060612;border:1px solid ${col}44;border-radius:8px;padding:8px;min-width:0">`;
    html+=`<div style="text-align:center;margin-bottom:6px">`;
    if(imgSrc) html+=`<img src="${imgSrc}" style="width:64px;height:64px;object-fit:contain;border-radius:4px;border:1px solid ${col}44">`;
    html+=`</div>`;
    html+=`<div style="color:${col};font-size:11px;font-weight:bold;margin-bottom:4px;text-align:center">${isPlayer?'YOU':''}<br>${name}</div>`;
    html+=`<table style="width:100%;border-collapse:collapse;font-size:10px;font-family:monospace">`;
    html+=`<tr style="color:#556"><td style="padding:1px 2px">H</td><td>Par</td><td>S</td><td>±</td></tr>`;
    let tot=0,totPar=0;
    scores.forEach((s,i)=>{
      const p=pars[i]||4,d=s-p;tot+=s;totPar+=p;
      html+=`<tr style="border-bottom:1px solid #0f0f1a"><td style="padding:2px;color:#aaccee">${i+1}</td><td style="color:#556">${p}</td><td style="color:#ccc;font-weight:bold">${s}</td><td style="color:${scoreCol(d)};font-weight:bold">${d>0?'+':''}${d}</td></tr>`;
    });
    const totD=tot-totPar;
    html+=`<tr style="border-top:1px solid #2a2a4a"><td colspan="2" style="color:#aaccee;font-size:11px">${L[_lang].lbTot}</td><td style="color:#fff;font-weight:bold">${tot}</td><td style="color:${scoreCol(totD)};font-weight:bold">${totD>0?'+':''}${totD}</td></tr>`;
    html+='</table></div>';
    return html;
  }
  document.getElementById('vsEndCards').innerHTML=
    makeCard(cdN(pd),pd.col,pScores,true,pc)+
    makeCard(cdN(cpud),cpud.col,cScores,false,cc);
  sc('scVSEnd');
}


// ショット計算式の可視化
function buildFormula(ng, gW, gMax, wind, ji, result, isPutt){
  const gPct = gW; // ゲージ値をそのまま%として表示（計算式 ng×(gW/100) と一致）
  const base  = Math.round(ng * (gW/100)); // 基礎飛距離
  if(isPutt){
    const wt={'-5':40,'-4':52,'-3':64,'-2':76,'-1':88,'0':100,'1':112,'2':124,'3':136,'4':148,'5':160};
    const slope = Math.max(-5,Math.min(5,wind));
    const wtVal = wt[String(slope)]||100;
    return `PT: ${ng}m × ${gPct}% gauge × slope${slope>=0?'+':''}${slope}(×${wtVal}%) → ${result}m`;
  } else {
    const wt={'-9':56,'-8':63,'-7':69,'-6':74,'-5':78,'-4':84,'-3':89,'-2':93,'-1':96,
      '0':100,'1':104,'2':107,'3':111,'4':116,'5':122,'6':126,'7':131,'8':137,'9':144};
    const wtVal = wt[String(wind)]||100;
    // 地形補正後の基礎
    let afterTer=base;
    let terStr='';
    if(ji===2){
      const isIron=(G.mpt===G.d1||G.mpt===G.d2);
      afterTer=Math.round(base*(isIron?.65:.58));
      terStr=isIron?' ×ROUGH(×65%)':' ×ROUGH(×58%)';
    } else if(ji===3){
      afterTer=Math.round(base*.28);
      terStr=' ×BUNKER(×28%)';
    }
    const afterWind=Math.round(afterTer*(wtVal/100));
    // ブレ（G._bu, G._buSign から）
    const bu=G._bu||0, sgn=G._buSign||0;
    let buStr='';
    if(bu>0){
      const dir=sgn>=0?'+':'−';
      buStr=` ${dir}${bu}(var)`;
    }
    // ブレを計算の一部として先に表示: ng×ゲージ×風±ブレ = result
    return `${ng}yd × ${gPct}% gauge${terStr} × wind${wind>=0?'+':''}${wind}(×${wtVal}%)${buStr} = ${result}yd`;
  }
}

// 計算式を画面に表示
function showFormula(){
  const el=document.getElementById('gShotFormula');
  if(!el||!G._formula) return;
  el.textContent=G._formula;
  el.style.display='flex';
}

// アニメーションスキップ（タップで瞬間移動）
function skipAnim(){
  if(!G.mv) return;          // アニメ中でなければ無視
  if(G.ji===5) return;       // グリーン上は不可
  clearInterval(G.mv);G.mv=null;
  const remaining=G.y1-G.cp;
  G.cp=G.cp+G.drv;G.cp2=G.cp;G.y2=G.y1-G.cp;
  G.y3=G.drv;
  if(G.drv>G.maxy&&G.ji!==4&&G.ji!==6)G.maxy=G.drv;
  if(G.drv>=remaining && G.drv<=remaining+1){
    G.y2=0;G.bon=800;
    updHUD();updPos();
    showFormula();
    if(VS.active&&!VS.playerTurn) cpuJudgeShot(); else judgeShot();
  } else {
    updHUD();updPos();
    showFormula(); // 着地時に計算式表示（CPU/1P共通）
    if(VS.active&&!VS.playerTurn) cpuDropChk(); else dropChk();
  }
}

function startMv(){
  G.y3=0;G.cp2=G.cp;G.t0=Date.now();
  if(G.mv)clearInterval(G.mv);
  G.mv=setInterval(mvTk,16);
}

function mvTk(){
  const el=Date.now()-G.t0;
  const pct=G.drv?G.y3/G.drv:1;
  const n=pct<.25?24:pct<.3?30:pct<.4?34:pct<.6?39:pct<.8?36:39;
  if(el<n)return;G.t0=Date.now();
  G.y3+=2;G.cp2=G.cp+G.y3;G.y2=G.y1-G.cp2;
  // アニメ中のマップ位置 (% 統一)
  const animPos=G.cp+G.y3;
  const mp=$('mPos');
  if(mp){
    if(animPos>G.y1+G.gz){ mp.style.display='none'; } // OB域はバー非表示
    else{ mp.style.left=Math.min(97,Math.round(animPos*100/G.y1))+'%'; mp.style.display=''; }
  }
  if(G.y3>=G.drv){
    clearInterval(G.mv);G.mv=null;
    const remaining=G.y1-G.cp;
    G.cp=G.cp+G.drv;G.cp2=G.cp;G.y2=G.y1-G.cp;
    G.y3=G.drv;
    if(G.drv>G.maxy)G.maxy=G.drv;
    if(G.drv>=remaining && G.drv<=remaining+1){
      G.y2=0;G.bon=800;
      updHUD();updPos();judgeShot();return;
    }
    updHUD();updPos();dropChk();return;
  }
  updHUD();
}

function startPt(){
  if(G.drv<=0) G.drv=1;
  // カップインするか事前に判定（drv >= y2_initial）
  const y2init=G.y2;
  // 元Pascal: nyd2=0 AND nyd3=drv の場合のみホールイン（ちょうど届いた時だけ）
  const willHole=G.drv>=y2init&&G.drv<=y2init+1; // 元仕様: drv∈[y2, y2+1]のみカップイン
  // カップインする場合: y2_initial tick でアニメを止める
  const stopAt=G.drv; // アニメはdrv分だけ動かす（カップイン判定はy3=drvの時点で）
  let spd=stopAt<6?300:stopAt<12?200:stopAt<18?130:stopAt<24?100:stopAt<30?80:stopAt<36?67:stopAt<42?55:47,st=0;
  if(G.mv)clearInterval(G.mv);
  G.mv=setInterval(()=>{
    if(Date.now()-G.t0<spd)return;G.t0=Date.now();
    spd=Math.min(450,spd+(st<100?4:st<170?10:st<250?15:st<340?24:32));st++;
    G.y3++;G.y2--;
    // マップ位置更新
    const putPct=Math.min(97,Math.round((G.cp+G.y3)*100/G.y1));
    const mp=$('mPos'); if(mp) mp.style.left=putPct+'%';
    updHUD();
    if(G.y3>=stopAt){
      clearInterval(G.mv);G.mv=null;
      if(willHole){
        // カップイン: y2=0の瞬間に止まってjudgeShot
        G.y2=0;G.y3=y2init;G.bon=0;
        if(G.drv>G.maxy)G.maxy=G.drv;
        G.cp=G.y1; updHUD();updPos();judgeShot();
      } else {
        // 届かず: 次打へ
        G.cp=G.y1-G.y2;updHUD();updPos();
        const lastP=G.cr===2?9:6;
        if(G.ns>=(G.par+4)){
          S('gUp','block');S('speBox','none');showGiveUpFlash();
          if(G.nH===lastP){G.ns+=2;G.sc+=(G.ns-G.par);T('bPro',L[_lang].lbFinish);S('bPro','block');}
          else{E('bShot',true);T('bShot','>');G.cmd=15;}
          showFormula();
        } else {
          E('bShot',true);T('bShot','>');G.cmd=6;
          showFormula();
        }
      }
    }
  },16);
}

function dropChk(){
  G.ji=1;
  for(let i=0;i<3;i++){
    if(G.cp>=G.Ra[i]&&G.cp<=G.Rz[i])G.ji=2;
    if(G.cp>=G.Wa[i]&&G.cp<=G.Wz[i])G.ji=4;
    if(G.cp>=G.Ba[i]&&G.cp<=G.Bz[i])G.ji=3;
  }
  // グリーン判定: y1-gz ～ y1+gz
  if(G.cp>=(G.y1-G.gz)&&G.cp<=(G.y1+G.gz))G.ji=5;
  // OB: ホールを超えた
  if(G.cp>(G.y1+G.gz))G.ji=6;
  if(G.cp===0)G.ji=1;
  if(G.drv>G.maxy&&G.ji!==4&&G.ji!==6)G.maxy=G.drv;
  // グリーン着地時は風ラベル更新を遅延（>タップ後に「傾」表示）
  setTer(G.ji, G.ji===5);
  // OBは即座にバーを非表示
  if(G.ji===6){ const mp=$('mPos'); if(mp) mp.style.display='none'; }
  const last=G.cr===2?9:6;

  // グリーンにワンショットで乗った = チップイン扱い（ホールインワンは ns=1）
  if(G.ji===5){
    seChime(); // オングリーン チャイム
    // y2 を残り距離（グリーン上の距離）に設定
    G.y2=Math.abs(G.y1-G.cp); // カップを超えた場合も絶対値で残距離
    // ギブアップ判定
    if(((G.ji===4||G.ji===6)&&G.ns>=(G.par+3))||G.ns>=(G.par+4)){
      S('gUp','block');S('speBox','none');showGiveUpFlash();
      if(G.nH===last){
      G.ns+=2;G.sc+=(G.ns-G.par);
      if(VS.active){
        // VS時はホール結果を記録してからCPU番へ
        G.cmd=14; E('bShot',true); $('bShot').textContent='>';
      } else {
        T('bPro',L[_lang].lbFinish);S('bPro','block');
      }
    }
      else{E('bShot',true);T('bShot','>');G.cmd=15;} // 15=ギブアップ後→次ホール
      showFormula();return;
    }
    // グリーン着地: まず '>' を表示して nextShot へ（元Pascal準拠）
    E('bShot',true);T('bShot','>');G.cmd=6;
    showFormula(); // ショット計算式を表示
    updHUD();return;
  }

  // ギブアップ判定
  if(((G.ji===4||G.ji===6)&&G.ns>=(G.par+3))||G.ns>=(G.par+4)){
    S('gUp','block');S('speBox','none');showGiveUpFlash();
    if(G.nH===last){
      G.ns+=2;G.sc+=(G.ns-G.par);
      if(VS.active){
        // VS時はホール結果を記録してからCPU番へ
        G.cmd=14; E('bShot',true); $('bShot').textContent='>';
      } else {
        T('bPro',L[_lang].lbFinish);S('bPro','block');
      }
    }
    else{E('bShot',true);T('bShot','>');G.cmd=15;} // 15=ギブアップ後→次ホール
    showFormula();return;
  }
  E('bShot',true);T('bShot','>');G.cmd=6;
  showFormula();
  // 着地後の特技ボタン有効化
  if(G.ch===5&&G.nwz>0) E('bSpe',true);  // フィリップ: スタートオーバー
  else if(G.ch===1&&G.nwz>0) E('bSpe',true); // 水無: グリーン上でもパワーショット可
  else if(G.ch===3&&G.nwz>0&&G.ji!==5) E('bSpe',true); // 綴: 打ち直し
  else if(G.ch===4&&G.nwz>0) E('bSpe',true); // 響子: グリーン上でも有効
}

function afterJ(){
  if(VS.active){afterJVS();return;}
  G.pts+=G.mpt;T('gPtsV',G.pts);S('scBox','none');S('terBox','flex');
  // ホール結果を記録
  G.holeScores.push(G.ns);
  G.holePars.push(G.par);
  rankime();
  const last=G.cr===2?9:6;
  if(G.nH>=last){endGame();return;}
  enterShop();
}

function nextShot(){
  G.spc=0;G.nw=G.nwt;T('bWndN',G.nw);E('bWnd',G.nw>0);
  // spc=1(水無パワーショット)等でgMaxが拡張された場合をリセット
  const _d=CD[G.ch]; if(_d&&G.gMax!==_d.mx&&G.gMax!==_d.x7){
    G.gMax=G.ji===5?_d.x7:_d.mx; G.gWakuW=_d.gW; updGaugeWaku();
  }
  const sfNs=document.getElementById('gShotFormula');
  if(sfNs){sfNs.textContent='';sfNs.style.display='none';}G._formula='';
  S('gUp','none');G.gW=0;updGauge();G.y3=0;G.cmd=4;
  T('bShot',L[_lang].lbShotBtn);E('bShot',false);S('speBox','none');
  T('vShot',G.ns);T('vYd3','0');
  S('bx2','none');S('bx3','none');S('bx1','block');
  S('bVwC','block');S('bVwS','none');S('bTj2','none');
  if(G.ji===4||G.ji===6){
    G.ns++;             // ペナルティ +1打
    T('vShot',G.ns);
    G.cp=G.lp;G.y2=G.y1-G.cp;T('vYd2',G.y2);
    G.ji=1; // ji をリセットしてから updPos（OB非表示が解除される）
    for(let i=0;i<3;i++){
      if(G.cp>=G.Ra[i]&&G.cp<=G.Rz[i])G.ji=2;
      if(G.cp>=G.Ba[i]&&G.cp<=G.Bz[i])G.ji=3;
    }
    if(G.cp===0)G.ji=1;setTer(G.ji);
    updPos(); // ji再判定後にバー位置を更新（OB解除で再表示）
  }
  if(G.ji===5){
    // グリーン上: ここで「傾」ラベルに更新（>タップ後に反映）
    updWindLabel();
    // グリーン上: パターモード切替（傾斜・m表示・パット選択）
    // y2 を正の値に更新（オーバー後に負になっている場合の修正）
    G.y2=Math.abs(G.y1-G.cp);
    // グリーン専用傾斜値で windK を再実行（Pascal: jimen=5時に別パラメータ設定）
    G.wa=G.gwa; G.wz=G.gwz; G.kz=G.gkz;
    windK(); // 傾斜を新規生成（-5..+5 にはputtK内でclamp）
    G.wind=Math.max(-5,Math.min(5,G.wind)); // パット用に±5クランプ
    G.nw=0; E('bWnd',false);
    document.getElementById('bWnd').style.display='none'; // グリーンでは非表示
    G.gW=0; updGauge(); // gMaxはsDnCore(cmd=7)で設定（キャラ固有値）
    T('uYd2','m'); T('uYd3','m');
    S('gkMey','none');
    // 表示を傾斜モードに（setTerとupdWindLabelが反映）
    document.getElementById('gClubNormal').style.display='none';
    document.getElementById('gClubPutt').style.display='flex';
    // パットボタンを再有効化
    document.getElementById('gClubPutt').querySelectorAll('button').forEach(b=>b.disabled=false);
    G.sel=0; rebuildClubs();

    updHUD();
  } else {
    T('uYd2','yd'); T('uYd3','yd');
    document.getElementById('bWnd').style.display=''; // グリーン外では再表示
    resetClubs(true); windK();
    T('lWind','WIND:');
  }
  // 特技ボタン有効化（ch5=2打目以降、ch3=常時、その他=グリーン外のみ）
  if(G.ch===5) E('bSpe', G.nwz>0);       // フィリップ: 2打目以降
  else if(G.ch===1) E('bSpe', G.nwz>0);  // 水無: グリーン上でもパワーショット可
  else if(G.ch===3) E('bSpe', G.nwz>0);  // 綴: グリーン外なら常時
  else if(G.ch===4) E('bSpe', G.nwz>0);  // 響子: グリーン上でも使用可（風消し）
  else if(G.ji!==5) E('bSpe', G.nwz>0);  // 他: グリーン外のみ
}

function pChk(){
  const t1=[900,1100,1300,1500],t2=[700,850,1000,1150],t3=[600,700,800,900],t4=[500,550,600,650];
  G.pw1=t1[Math.min(3,G.kw1)];G.pw2=t2[Math.min(3,G.kw2)];G.pi1=t3[Math.min(3,G.ki1)];G.pi2=t4[Math.min(3,G.ki2)];
}

function spCk(){
  if(G.nwz<=0)return;
  seSpecial();
  const ch=G.ch;
  // ch3(綴)/ch5(フィリップ)は「使用する」確定時に減算（doUndo内）
  // それ以外は即時減算
  if(ch!==3&&ch!==5){
    G.nwz--;T('bSpeN',G.nwz);E('bSpe',false);
  }

  const d=CD[ch];
  T('speBox',cdS(d)||'SKILL');S('speBox','flex');
  if(ch===1){
    G.gMax=120;G.spc=1;
    updGaugeWaku(); // 目盛りを120%基準に即座に再描画
    updGauge(); // ゲージ上限を即座に120%に更新
    // ガイドゲージ(gGaugeMey)は非表示にしない（グリーン上のガイドを維持）
    // gGaugeMeyの位置をgMax=120基準で再計算
    const mey125=document.getElementById('gGaugeMey');
    if(mey125&&mey125.style.display!=='none'){
      // 既存のleft%をgMax=100→120基準に変換
      const oldPct=parseFloat(mey125.style.left)||0;
      mey125.style.left=(oldPct*100/120)+'%';
    }
    // 目盛りはsDnCoreのupdGaugeWaku(buildGaugeTicks)で再描画される
  }
  else if(ch===2){G.spc=2;}
  else if(ch===3){
    E('bSpe',false); // 使用確定までbSpeを無効化（nwzはdoUndo時に減算）
    G.cmd=12;G.spc=3;
    // クラブエリアを非表示（誤タップ防止）
    document.getElementById('gClubNormal').style.display='none';
    document.getElementById('gClubPutt').style.display='none';
    E('bShot',true);T('bShot',L[_lang].lbUseBtn);
    // タッチ/クリック両方で確実に doUndo を呼ぶ専用ハンドラを設定
    const bsEl=document.getElementById('bShot');
    if(bsEl) bsEl._tsuduruHandler = function(e){
      e.preventDefault(); e.stopPropagation();
      if(G.cmd===12){ doUndo(); }
    };
    if(bsEl){
      bsEl.addEventListener('touchend', bsEl._tsuduruHandler, {once:true});
      bsEl.addEventListener('click', bsEl._tsuduruHandler, {once:true});
    }
  }
  else if(ch===4){G.wind=0;G.spc=4;showWind();}
  else if(ch===5){
    E('bSpe',false); // 使用確定までbSpeを無効化（nwzはdoUndo時に減算）
    G.cmd=13;G.spc=5;G.sel=0;rebuildClubs();E('bShot',true);T('bShot',L[_lang].lbUseBtn);
  }

}

function doUndo(){
  if(G.cmd===12){
    G.nwz--;T('bSpeN',G.nwz); // 使用確定時に減算
    G.pts=G.lpts;G.ns=G.lsh;G.y2=G.ly2;G.ji=G.lji;G.cp=G.lp;G.cp2=G.cp;G.y3=0;
    G.spc=0;G.mpt=0;G.cmd=4;
    // gMax をキャラデフォルトに戻す（水無特技後の打ち直し対応）
    G.gMax=CD[G.ch].mx;
    T('gPtsV',G.pts);T('vYd2',G.y2);T('vYd3','0');T('vShot',G.ns);
    setTer(G.ji);updPos();
    // クラブエリアを再表示してからresetClubs
    document.getElementById('gClubNormal').style.display='flex';
    document.getElementById('gClubPutt').style.display='none';
    // ji<5(グリーン外)に戻る場合はコースの風パラメータを復元
    if(G.ji<5){ loadHD(); } // wa/wz/kzをコース値に戻す
    resetClubs(G.ji<5);windK();
    T('bShot',L[_lang].lbShotBtn);E('bShot',false);S('speBox','none');E('bSpe',G.nwz>0);
    // bWnd: グリーン以外なら表示、グリーン(ji=5)なら非表示
    if(G.ji===5){
      document.getElementById('bWnd').style.display='none';
      E('bWnd',false);
    } else {
      document.getElementById('bWnd').style.display='';
      E('bWnd',G.nw>0);
      T('uYd2','yd'); T('uYd3','yd'); // グリーン外に戻る時は単位をydに戻す
    }
  }else if(G.cmd===13){
    G.nwz--;T('bSpeN',G.nwz); // 使用確定時に減算
    G.pts=G.lpts;G.cp=0;G.cp2=0;G.ns=0;G.nw=G.nwt;G.bon=0;G.ji=1;G.spc=0;G.mpt=0; // ns=0: sReleaseで++→1打目
    G.y2=G.y1;G.y3=0;G.cmd=4;
    // コースの風パラメータを復元（グリーン傾斜値をリセット）
    loadHD(); G.y1=G.y1; // loadHDでwa/wz/kzをコース値に戻す
    // 画面表示を全てリセット
    updHUD(); // vYd1/2/3, vShot, gHlV, gPtsV, vCp まとめて更新
    T('bWndN',G.nw);E('bWnd',G.nw>0);
    document.getElementById('bWnd').style.display=''; // 再表示（グリーン非表示解除）
    setTer(1);updPos();resetClubs(true);windK();
    T('uYd2','yd');T('uYd3','yd');
    // 風ラベルをリセット
    updWindLabel();
    T('gGaugeClub','');T('gGaugeCost','');
    T('bShot',L[_lang].lbShotBtn);E('bShot',false);S('speBox','none');
    // フィリップは1打目はdisabled（2打目以降でenable）
    E('bSpe',false);
  }
}

function rankime(){
  const big=G.par>=5,vb=G.par>=6,rn=n=>Math.round(Math.random()*n);
  if(G.ch!==1){const n=rn(12);if(n<=3)G.sm--;else if(n<=6)G.sm++;else if(n===7&&big)G.sm-=2;else if(n===8&&big)G.sm+=2;}
  if(G.ch!==2){const n=rn(11);if(n<=2)G.ss--;else if(n<=5)G.ss++;else if(n===6&&G.par>=4)G.ss-=2;}
  if(G.ch!==3){const n=rn(23);if(n<=4)G.st--;else if(n<=11)G.st++;else if(n<=19)G.st+=2;else if(n===20)G.st-=2;else if(n===21&&big)G.st-=3;}
  if(G.ch!==4){const n=rn(12);if(n<=6)G.sk--;else if(n<=8)G.sk++;else if(n<=10&&big)G.sk-=2;}
  if(G.ch!==5){const n=rn(15);if(n<=4)G.sp--;else if(n===5)G.sp++;else if(n<=8&&big)G.sp-=2;else if(n===9&&G.par===3)G.sp-=2;else if(big)G.sp--;}
  if(G.ch!==6){const n=rn(11);if(n<=4)G.sh--;else if(n<=8&&big)G.sh-=2;else if(n===9&&vb)G.sh-=3;else if(n===10&&G.par===3)G.sh-=2;else G.sh--;}
  const sv=[null,'sm','ss','st','sk','sp','sh'];if(G.ch>=1&&G.ch<=6)G[sv[G.ch]]=G.sc;
}

function startGame(){
  G.sc=0;G.nH=1;G.nHIO=0;G.nALB=0;G.nEAG=0;G.nBIR=0;G.nCHP=0;G.n4=0;G.maxy=0;
  G.holeScores=[];G.holePars=[];
  G.sm=0;G.ss=0;G.st=0;G.sk=0;G.sp=0;G.sh=0;
  // face (新UIではcFaceなし、endFigに反映)
  const d=CD[G.ch];
  const cf=$('cFace'); if(cf) cf.innerHTML=`<div style="font-size:52px;color:${d.col}">${d.ic}</div>`;
  // ゲーム画面のキャラ画像を設定
  const ci=document.getElementById('gCharaImg');
  if(ci&&CHARA_IMG[G.ch]){ci.src=CHARA_IMG[G.ch];ci.style.display='block';}
  seStart();
  sc('scG'); G.cmd=4; holeStart();
}

function holeStart(){
  // ゲーム画面: 背景を元の黒に戻す
  const scg=document.getElementById('scG');
  if(scg) scg.style.background='';
  const gt=document.getElementById('gTop');
  if(gt) gt.style.background='';
  const br=document.getElementById('gBtnRow'); if(br) br.style.background='';
  const ca=document.getElementById('gClubArea'); if(ca) ca.style.background='';
  const bn=document.getElementById('gShopBanner'); if(bn) bn.style.display='none';
  // CPU対戦後に残ったstyleを完全リセット
  document.getElementById('bShot').style.visibility='';
  document.getElementById('bWnd').style.display='';
  document.getElementById('bWnd').style.opacity='';
  document.getElementById('bSpe').style.display='';
  document.getElementById('bSpe').style.opacity='';
  document.querySelectorAll('#gTop .gTopSeg').forEach(s=>{s.style.visibility='';});
  const gPtsElH=document.getElementById('gPtsV'); if(gPtsElH) gPtsElH.style.visibility='';
  G.mpt=0;G.bon=0;G.cp=0;G.cp2=0;G.lp=0;G.lsh=0;G.lpts=G.pts;G.ly2=0;G.lji=0; // フィリップ用: ホール開始時pts保存
  G.ji=1;G.ns=0;G.nw=G.nwt;G.spc=0;G.gW=0;G.drv=0;
  // spc=1(パワーS)でgMaxが拡張された場合をリセット
  const d2=CD[G.ch];
  if(d2)G.gMax=d2.mx;
  updGaugeWaku();
  loadHD();G.y2=G.y1;G.y3=0;
  updHUD();updGauge();setTer(1);updMap();windK();
  resetClubs(true);
  // ショット計算式をクリア
  const sfEl=document.getElementById('gShotFormula');
  if(sfEl){sfEl.textContent='';sfEl.style.display='none';}
  G._formula='';
  // 地形情報エリアを新ホールの内容で更新（常時表示）
  if(typeof mapInfoTimer!=='undefined'&&mapInfoTimer){clearTimeout(mapInfoTimer);mapInfoTimer=null;}
  showTerrainInfo();
  S('scBox','none');S('gUp','none');S('bPro','none');S('speBox','none');
  S('bVwS','none');S('bTj2','none');S('bVwC','block');
  S('bx1','block');S('bx2','none');S('bx3','none');
  S('lHls','none');S('vHls','none');S('vYd4','none');
  S('terBox','flex');
  document.getElementById('bWnd').style.display='';
  T('bWndN',G.nw); E('bWnd',G.nw>0);
  T('bSpeN',G.nwz);

  // フィリップ: ホール開始(1打目)はdisable、着地後にenable
  E('bSpe', G.nwz>0&&G.ch!==2&&G.ch!==3&&G.ch!==5); // 1打目から使用可能
  E('bShot',false); T('bShot',L[_lang].lbShotBtn);
  S('lWind','block');S('vPlmi','block');S('vWind','block');
  S('lPar','block');S('vPar','block');S('lShot','block');S('vShot','block');
  document.getElementById('gStRest').style.display='';
  document.getElementById('gStFly').style.display='';
  T('uYd1','yd');T('uYd2','yd');T('uYd3','yd');
}

function onStart(){
  drawSlots(); sc('scC'); G.cmd=1;
}


// ============ UI アダプター ============
// =============================================
// UI アダプター層（スマホ対応・旧API互換）
// =============================================

// --- 旧ID → 新ID 完全マッピング ---
const ID_MAP = {
  // ゲーム上部ステータス
  gHlV:'gHlV', gParV:'gParV', gShotV:'gShotV', gPtsV:'gPtsV',
  // 距離表示
  vYd1:'vYd1', vYd2:'vYd2', vYd3:'vYd3', vYd4:'vYd4',
  uYd1:'uYd1', uYd2:'uYd2', uYd3:'uYd3',
  // 風
  gWindSign:'gWindSign', gWindVal:'gWindVal',
  // ゲージ
  gGaugeBar:'gGaugeBar', gGaugeWrap:'gGaugeWrap', gGaugeMey:'gGaugeMey',
  gGaugeClub:'gGaugeClub', gGaugeCost:'gGaugeCost', gGaugeTicks:'gGaugeTicks',
  // 地形カード
  gTerName:'gTerName', gWindRow:'gWindRow', gTerCard:'gTerCard',
  // ボタン
  bWndN:'bWndN', bSpeN:'bSpeN',
  bShot:'bShot', bWnd:'bWnd', bSpe:'bSpe',
  bVwC:'bVwC', bVwS:'bVwS', bTj2:'bTj2', bPro:'bPro',
  // 特技・ギブアップ
  gSpeBar:'gSpeBar', gUp:'gGiveUp', speBox:'gSpeBar',
  // スコアフラッシュ (旧scBox相当)
  gScoreFlash:'gScoreFlash', gScoreFlashTxt:'gScoreFlashTxt', gScoreFlashSub:'gScoreFlashSub',
  scBox:'gScoreFlash',
  // サブパネル (旧bx2/bx3相当)
  gSubPanel:'gSubPanel', bx2:'gSubPanel', bx3:'gSubPanel',
  // クラブエリア
  gClubNormal:'gClubNormal', gClubPutt:'gClubPutt', gClubShop:'gClubShop',
  nClub:'gClubNormal', pClub:'gClubPutt', sClub:'gClubShop',
  // ゲージ目安線
  gkMey:'gGaugeMey',
  // マップ
  mPos:'mPos', mFair:'mFair', mGrn:'mGrn',
  mR0:'mR0', mR1:'mR1', mR2:'mR2',
  mW0:'mW0', mW1:'mW1', mW2:'mW2',
  mB0:'mB0', mB1:'mB1', mB2:'mB2',
  // エンディング
  endFig:'endFig', endTitle:'endTitle', endCrs:'endCrs',
  endScore:'endScore', endPts:'endPts', endStatBox:'endStatBox',
  // コース選択
  bYes:'bYes', bNo:'bNo', crConfirm:'crConfirm',
  crConfirmInfo:'crConfirmInfo',
  // 旧UIのみのID → null (S/Tがnullチェック済み)
  bx1:null, terBox:null,
  lWind:null, vPlmi:null, vWind:null,
  lPar:null, vPar:null, lShot:null, vShot:null,
  lZen:null, lRest:'gStRest', lFly:'gStFly',
  lHls:null, vHls:null,
  // 新UIでの直接アクセス対応
  cFace:null,
  pClub:'gClubPutt',
};

const $=id=>{const mapped=ID_MAP.hasOwnProperty(id)?ID_MAP[id]:id; return mapped?document.getElementById(mapped):null;};
const T=(id,v)=>{const e=$(id);if(e)e.textContent=v;};
const S=(id,v)=>{const e=$(id);if(!e)return;
  if(v==='flex')e.style.display='flex';
  else if(v||v==='')e.style.display=v===true?'':v;
  else e.style.display='none';
};
const E=(id,v)=>{const e=$(id);if(e)e.disabled=!v;};
const rnd=(a,b)=>a+Math.round(Math.random()*(b-a));

// シーン切替
function sc(id){
  ['scT','scC','scCR','scG','scEnd','scVSEnd','scRec'].forEach(s=>{
    const e=document.getElementById(s);
    if(e){e.style.display='none';e.className='sc';}
  });
  const target=document.getElementById(id);
  if(target){target.style.display='flex';target.className='sc on';}
}

// =============================================
// キャラ選択 UI (タップ2段階方式)
// =============================================
let pendingChara = 0;

function drawSlots(){
  if(vsStep===1||vsStep===2){ drawSlotsVS(vsStep); return; }
  // 通常モード: VSボタンを非表示、通常ボタンを表示
  document.getElementById('cBtnNormal').style.display='';
  document.getElementById('cBtnVSoppo').style.display='none';
  const grid = document.getElementById('cGrid');
  grid.innerHTML = '';
  for(let n=1;n<=6;n++){
    const ok = n<=2||G['uf'+n];
    const d = CD[n];
    const card = document.createElement('div');
    card.className = 'csCard' + (ok?'':' locked');
    card.id = 'cs'+n;
    card.style.borderColor = ok ? d.col+'55' : '#1a1a2a';
    if(ok){
      const imgSrc = CHARA_IMG[n] || '';
      card.innerHTML = (imgSrc
        ? `<img src="${imgSrc}" style="max-width:80%;max-height:72px;width:72px;height:72px;object-fit:contain">`
        : `<div class="csIcon" style="color:${d.col}">${d.ic}</div>`) +
        `<div class="csName" style="color:${d.col}aa">${cdN(d)}</div>`;
    } else {
      card.innerHTML = `<div class="csLockMark">🔒</div>`+
        `<div class="csName" style="color:#333">???</div>`;
    }
    card.addEventListener('click', ()=>tapChara(n));
    card.addEventListener('touchend', e=>{e.preventDefault();tapChara(n);});
    grid.appendChild(card);
  }
  pendingChara=0;
  // cDetail をリセット（2回目以降の表示に対応）
  const cdet=document.getElementById('cDetail');
  if(cdet) cdet.style.display='flex';
  const cdn1=document.getElementById('cDetailName');
  if(cdn1){cdn1.textContent=L[_lang].charaPrompt; cdn1.style.color='#888'; cdn1.dataset.empty='1';}
  // cHeaderのlangKey設定（通常モード）
  _setCharaHeader(L[_lang].charaTitle, L[_lang].charaSub, 'charaTitle', 'charaSub');
  document.getElementById('dPow').textContent='';
  document.getElementById('dTch').textContent='';
  document.getElementById('dGeo').textContent='';
  document.getElementById('dSpe').textContent='';
}

function tapChara(n){
  const ok = n<=2||G['uf'+n];
  if(!ok) return;
  if(vsStep===2 && n===G.ch) return; // VS相手選択時は自キャラを選択不可
  seSelect();
  pendingChara=n;
  if(vsStep!==2) G.ch=n; // 相手選択ステップではG.chを上書きしない
  document.querySelectorAll('.csCard').forEach(c=>c.classList.remove('sel'));
  document.getElementById('cs'+n).classList.add('sel');
  const d=CD[n];
  const cdnEl=document.getElementById('cDetailName');
  if(cdnEl){cdnEl.textContent=cdN(d); cdnEl.style.color=d.col; cdnEl.dataset.empty='0';}
  document.getElementById('dPow').textContent=d.p;
  document.getElementById('dTch').textContent=d.t;
  document.getElementById('dGeo').textContent=d.g;
  document.getElementById('dSpe').textContent=cdS(d);
}

function confirmChara(){
  if(!pendingChara) return;
  if(vsStep===1){
    // VSモード: 自分選択完了 → 選択したカードの中身を非表示にして空ボックスを残す
    G.ch=pendingChara; G.hcy=false; applyStats();
    const selCard=document.getElementById('cs'+pendingChara);
    if(selCard){
      selCard.innerHTML=''; // 顔グラと名前だけ消す（枠線・ボックスは残す）
      selCard.style.opacity='';
      selCard.style.borderColor=CD[pendingChara].col+'55'; // 枠線色はキャラカラーのまま維持
    }
    vsStep=2;
    // 相手選択UIに切り替え（grid再描画はしない）
    const hdr=document.getElementById('cHeader');
    _setCharaHeader(L[_lang].vsTitle, L[_lang].vsSub, 'vsTitle', 'vsSub');
    document.getElementById('cBtnNormal').style.display='none';
    document.getElementById('cBtnVSoppo').style.display='';
    // 自分のカード以外を相手候補として再描画（自分のカードは空ボックスのまま）
    for(let n=1;n<=6;n++){
      if(n===pendingChara) continue; // 自分は空ボックスのまま残す
      const card=document.getElementById('cs'+n);
      if(!card) continue;
      const ok=n<=2||G['uf'+n];
      const d=CD[n];
      card.className='csCard'+(ok?'':' locked');
      card.style.borderColor=ok?d.col+'55':'#1a1a2a';
      card.style.opacity='';
      if(ok){
        const imgSrc=CHARA_IMG[n]||'';
        card.innerHTML=(imgSrc
          ?`<img src="${imgSrc}" style="max-width:80%;max-height:72px;width:72px;height:72px;object-fit:contain">`
          :`<div class="csIcon" style="color:${d.col}">${d.ic}</div>`)+
          `<div class="csName" style="color:${d.col}aa">${cdN(d)}</div>`;
      } else {
        card.innerHTML=`<div class="csLockMark">🔒</div><div class="csName" style="color:#333">???</div>`;
      }
      // イベントを付け直す
      card.replaceWith(card.cloneNode(true));
      const newCard=document.getElementById('cs'+n);
      newCard.addEventListener('click',()=>tapChara(n));
      newCard.addEventListener('touchend',e=>{e.preventDefault();tapChara(n);});
    }
    pendingChara=0;
    document.getElementById('cDetailName').textContent=L[_lang].charaPrompt;
    document.getElementById('cDetailName').style.color='#888';
    ['dPow','dTch','dGeo','dSpe'].forEach(id=>{document.getElementById(id).textContent='';});
    return;
  }
  G.ch=pendingChara; G.hcy=false;
  applyStats();
  document.getElementById('cDetail').style.display='none';
  goToCR();
}

// =============================================
// コース選択 UI
// =============================================
function updCRbtns(){
  // EDITコース廃止済み
}
function goToCR(){
  sc('scCR'); updCRbtns(); G.cmd=2;
  document.getElementById('crConfirm').style.display='none';
  updGaugeWaku();
}
function selCR(n){
  if(n===3) return; // EDITコース廃止
  G.cr=n; G.pts=n===1?1600:1300;
  const info = {1:L[_lang].courseInfoPrac, 2:L[_lang].courseInfoChamp};
  T('crConfirmInfo', info[n]||'');
  document.getElementById('crConfirm').style.display='flex';
}
function fmtClick(){
  if(confirm('Reset all records?')) alert('Reset complete');
}
function yesClick(){
  document.getElementById('crConfirm').style.display='none';
  try {
    if(VS.active) startGameVS(); else startGame();
  } catch(e) {
    const div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#f00;color:#fff;padding:10px;z-index:9999;font-size:12px;white-space:pre-wrap;overflow-y:auto;max-height:80vh';
    div.textContent = 'startGame ERROR:\n' + e.message + '\n\n' + (e.stack||'');
    document.body.appendChild(div);
  }
}
function noClick(){
  G.cr=0; G.ch=0; vsStep=0; VS.active=false;
  document.getElementById('crConfirm').style.display='none';
  sc('scT');
}

// =============================================
// ゲーム HUD アダプター
// =============================================
function updHUD(){
  T('gHlV',G.nH); T('gPtsV',G.pts);
  T('gParV',G.par); T('gShotV',G.ns);
  T('vYd1',G.y1); T('vYd2',Math.abs(G.y2)); T('vYd3',G.y3);
  // 現在位置: アニメ中(G.mv!=null)はcp+y3、停止中はcp
  const curPos = G.mv ? G.cp+G.y3 : G.cp;
  T('vCp', Math.min(G.y1, curPos));
}
function updGauge(){
  const pct=Math.max(0,Math.min(100,G.gW/G.gMax*100));
  document.getElementById('gGaugeBar').style.width=pct+'%';
}
function updGaugeWaku(){
  // ゲージ目盛りを再描画
  buildGaugeTicks();
}
function buildGaugeTicks(){
  const ticks = document.getElementById('gGaugeTicks');
  if(!ticks) return;
  ticks.innerHTML='';
  // 25%, 50%, 75%, 100%(, 125%はgMax>100時のみ) のティック
  const marks = [25,50,75,100,125];
  marks.forEach(p=>{
    if(p===125 && G.gMax<=100) return; // gMax=100時は125%ティック不要
    const pct = p/G.gMax*100;
    if(pct>100.5) return; // ゲージ範囲外は非表示
    const tk=document.createElement('div');
    tk.className='gTk';
    tk.style.left=Math.min(100,pct)+'%';
    tk.style.background = p===100?'#ffffff55':(p===125?'#ff660055':'#ffffff25');
    ticks.appendChild(tk);
    const lb=document.createElement('div');
    lb.className='gTkL';
    lb.style.left=Math.min(100,pct)+'%';
    lb.textContent=p+'%';
    if(p===125) lb.style.color='#663300';
    ticks.appendChild(lb);
  });
}
function showWind(){
  const w=G.wind;
  T('gWindSign',w>0?'+':w<0?'-':'±');
  T('gWindVal',Math.abs(w));
}
function updWindLabel(){
  // グリーン上は「傾」、それ以外は「風」
  const lbl=document.getElementById('gWindRowLbl');
  if(lbl) lbl.textContent = G.ji===5 ? L[_lang].lbSlope : L[_lang].lbWind;
}
function setTer(j, skipWindLabel){
  G.ji=j;
  const terN = L[_lang].terNames;
  const cfg={
    1:{n:terN[1], bg:'#08180a',col:'#7fff7f',border:'#2a5a2a'},
    2:{n:terN[2], bg:'#101808',col:'#aaf04a',border:'#3a5a18'},
    3:{n:terN[3], bg:'#1a1400',col:'#ddcc44',border:'#5a4800'},
    4:{n:terN[4], bg:'#000818',col:'#4488ff',border:'#183060'},
    5:{n:terN[5], bg:'#001808',col:'#00ff88',border:'#005830'},
    6:{n:terN[6], bg:'#180000',col:'#ff4444',border:'#580000'},
  };
  const c=cfg[j]||cfg[1];
  const tc=document.getElementById('gTerCard');
  if(tc){tc.style.background=c.bg;tc.style.borderColor=c.border;}
  T('gTerName',c.n);
  document.getElementById('gTerName').style.color=c.col;
  if(!skipWindLabel) updWindLabel();
}
function updPos(){
  const el=$('mPos');
  if(!el) return;
  if(G.ji===6){ el.style.display='none'; return; } // OBは非表示
  if(G.ji===5){ el.style.display='none'; return; } // グリーン上は非表示
  if(G.y2===0){ el.style.display='none'; return; }  // カップインは非表示
  const px=Math.min(96,Math.round(G.cp*100/G.y1));
  el.style.left=px+'%'; el.style.display='';
}
function updMap(){
  const pct=p=>Math.min(100,p/G.y1*100)+'%';
  const setZ=(id,a,z)=>{
    const e=$(id);if(!e)return;
    if(!a&&!z){e.style.display='none';return;}
    e.style.display='block';
    e.style.left=pct(a);
    e.style.width=(Math.max(0,z-a)/G.y1*100)+'%';
  };
  for(let i=0;i<3;i++){
    setZ('mR'+i,G.Ra[i],G.Rz[i]);
    setZ('mW'+i,G.Wa[i],G.Wz[i]);
    setZ('mB'+i,G.Ba[i],G.Bz[i]);
  }
  const ga=G.y1-G.gz, gz=G.y1+G.gz;
  const gEl=$('mGrn');
  if(gEl){gEl.style.left=pct(ga);gEl.style.width=(gz-ga)/G.y1*100+'%';}
  updPos();
}

// マップタップで地形情報表示
let mapInfoTimer=null;
function mapTap(){
  skipAnim(); // アニメ中ならスキップ
  if(G.cmd<4) return;
  showTerrainInfo();
}

// =============================================
// ショット UI (2タップ方式)
// =============================================
let shotPhase=0; // 0=待機 1=チャージ中 2=解放待ち(不使用)
// タッチ操作: touchstart のみで制御（click はそのまま通す）
function bShotTouch(e){
  if($('bShot').disabled) return;
  e.preventDefault(); // 全モードでスクロール防止＆clickキャンセル防止
  if(G.cmd===5||G.cmd===7){
    if(shotPhase===1){ sRelease(); return; }
    sDnCore(); return;
  }
  // それ以外は sCk() に委譲（cmd=6,11,14,15,16,17等）
  sCk();
}
// マウス操作
function bShotMouse(e){
  if(e.button!==0) return;
  if($('bShot').disabled) return;
  // cmd=5,7(ゲージ操作)のみ mousedown で処理
  // それ以外は onclick="sCk()" に委譲（PCでの二重呼び出しを防ぐ）
  if(G.cmd===5||G.cmd===7){
    e.preventDefault(); // ゲージ操作時のみ preventDefault
    if(shotPhase===1){ sRelease(); return; }
    sDnCore();
  }
}
function sDn(e){
  if(e&&e.preventDefault) e.preventDefault();
  if($('bShot').disabled) return;
  if(G.cmd!==5&&G.cmd!==7) return;
  if(shotPhase===1){
    // 2回目タップ → リリース
    sRelease(); return;
  }
  // 1回目タップ → チャージ開始
  sDnCore();
}
function sUp(e){ /* 不使用 */ }
function sDnCore(){
  // チャージ開始共通処理
  shotPhase=1;
  const d=CD[G.ch];
  if(G.cmd===5){G.gSpd=d.spd;G.gScl=d.sc;G.gMax=d.mx;}
  else         {G.gSpd=d.s7; G.gScl=d.sc7;G.gMax=d.x7;}
  if(G.spc===1)G.gMax=120;
  updGaugeWaku(); // gMaxに応じてゲージ目盛りを再描画
  document.getElementById('gGaugeWrap').style.borderColor='#f60';
  G.gW=0;G.gDir=false;G.mHeld=true;
  G.lp=G.cp;
  if(G.ch===3||G.ch===5){G.lpts=G.pts;G.lsh=G.ns;G.lji=G.ji;G.ly2=G.y2;}
  document.getElementById('bWnd').disabled=true;
  document.getElementById('bSpe').disabled=true;
  $('bShot').className='charging';
  $('bShot').textContent=L[_lang].lbStop;
  if(G.gIv)clearInterval(G.gIv);
  G.gIv=setInterval(()=>{
    if(!G.mHeld)return;
    if(G.gDir){G.gW=Math.max(0,G.gW-G.gScl);if(G.gW<=0)G.gDir=false;}
    else       {G.gW=Math.min(G.gMax,G.gW+G.gScl);if(G.gW>=G.gMax)G.gDir=true;}
    updGauge();
  },G.gSpd);
}
function sRelease(){
  if(!G.mHeld) return;
  G.mHeld=false; shotPhase=0;
  if(G.gIv){clearInterval(G.gIv);G.gIv=null;}
  if(G.cmd!==5&&G.cmd!==7) return;
  document.getElementById('gGaugeWrap').style.borderColor='';
  $('bShot').className='';
  $('bShot').textContent=L[_lang].lbShotBtn;
  E('bShot',false);
  G.pts=Math.max(0,G.pts-G.mpt);
  T('gPtsV',G.pts);
  seShot();
  // ショット計算前の値をキャプチャ
  const _ng=G.ng, _gW=G.gW, _gMax=G.gMax, _wind=G.wind, _ji=G.ji;
  G.ns++; T('gShotV',G.ns); // 打った瞬間にSHOT番号確定
  if(G.cmd===5){driveK();startMv();}else{puttK();startPt();}
  // ショット計算式を生成して保存
  G._formula = buildFormula(_ng, _gW, _gMax, _wind, _ji, G.drv, G.cmd===7);
}
function sCk(){
  if(shotPhase===1){sRelease();return;}
  if(G.cmd===6) nextShot();
  else if(G.cmd===14) afterJ();  // カップイン後→ホール終了処理
  else if(G.cmd===16){ vsStartPlayer(); return; } // CPU番終了後→1P開始
  else if(G.cmd===17){ vsStartCPU(); return; }    // 1P終了後→CPU開始
  else if(G.cmd===15){          // ギブアップ後→次ホール
    const lastG=G.cr===2?9:6;
    if(G.nH>=lastG){
      if(VS.active) afterJ(); // VS時はafterJVSを経由してVSリザルトへ
      else endGame();
    }
    else{
      if(VS.active) afterJ(); // VS時はafterJVS経由（ショップ→CPU番）
      else enterShop();
    }
  }
  else if(G.cmd===10) csend();
  else if(G.cmd===12||G.cmd===13) doUndo();
  else if(G.cmd===11) shopBuy();
}

// =============================================
// クラブ選択 UI
// =============================================
function rebuildClubs(){
  const nc=document.getElementById('gClubNormal');
  nc.innerHTML=[
    {n:1,lb:`1W\n${G.w1}yd`},{n:2,lb:`3W\n${G.w2}yd`},
    {n:3,lb:`5I\n${G.i1}yd`},{n:4,lb:`8I\n${G.i2}yd`},
  ].map(c=>`<button class="cBtn${G.sel===c.n?' sel':''}" id="rb${c.n}" onclick="selC(${c.n})" style="white-space:pre-line;font-size:11px;line-height:1.3">${c.lb}</button>`).join('');
  const pc=document.getElementById('gClubPutt');
  pc.innerHTML=[{n:5,lb:`PT1\n${G.p1}m`},{n:6,lb:`PT2\n${G.p2}m`}]
    .map(c=>`<button class="cBtn${G.sel===c.n?' sel':''}" id="rb${c.n}" onclick="selC(${c.n})" style="white-space:pre-line;font-size:11px;line-height:1.3">${c.lb}</button>`).join('');
  if(G.ji===3){['rb1','rb2'].forEach(id=>{const e=$(id);if(e)e.classList.add('dis');});}
}
function resetClubs(drv){
  G.sel=0;T('gGaugeClub','');T('gGaugeCost','');
  document.getElementById('gGaugeMey').style.display='none';
  document.getElementById('gClubNormal').style.display=drv?'flex':'none';
  document.getElementById('gClubPutt').style.display=drv?'none':'flex';
  document.getElementById('gClubShop').style.display='none';
  shotPhase=0;
  $('bShot').textContent=L[_lang].lbShotBtn; $('bShot').className='';
  E('bShot',false);
  rebuildClubs();
}
function selC(n){
  if(G.cmd===11){selShop(n);return;}
  const m={1:[G.w1,G.c1,5],2:[G.w2,G.c2,5],3:[G.i1,G.d1,5],4:[G.i2,G.d2,5],5:[G.p1,G.e1,7],6:[G.p2,G.e2,7]};
  const v=m[n];if(!v)return;
  // ch3/ch5 で cmd=12/13(特技待機)からクラブ選択→特技キャンセル扱い
  if(G.cmd===12||G.cmd===13){
    S('speBox','none'); // 特技名ラベルを非表示
    // nwz はまだ減算していないのでそのまま（spCk遅延方式）
    E('bSpe',G.nwz>0); // 特技ボタンを再有効化
    // ch3: クラブ再表示
    if(G.cmd===12){
      document.getElementById('gClubNormal').style.display='flex';
      document.getElementById('gClubPutt').style.display='none';
    }
  }
  G.ng=v[0];G.mpt=v[1];G.cmd=v[2];G.sel=n;
  rebuildClubs();
  T('gGaugeClub',G.ng+(n<=4?'yd':'m'));
  T('gGaugeCost',`-${G.mpt}pts`);
  E('bShot',true); $('bShot').className='ready'; $('bShot').textContent=L[_lang].lbShotBtn;
  if(n>=5){
    // 傾斜0でカップインするゲージ値(0..gMax): y2*100/ng
    // ゲージバー上の位置% = gWneed/gMax*100
    const gMax = CD[G.ch] ? CD[G.ch].x7 : 100;
    const gWneed = G.ng>0 ? G.y2*100/G.ng : 0; // 必要ゲージ値
    const pct = gMax>0 ? gWneed/gMax*100 : 0;
    if(pct<=100){
      document.getElementById('gGaugeMey').style.left=pct+'%';
      document.getElementById('gGaugeMey').style.display='block';
    } else document.getElementById('gGaugeMey').style.display='none';
  } else document.getElementById('gGaugeMey').style.display='none';
}

// スコアフラッシュを表示する共通関数（1P・CPU共用）
function showScoreFlash(ns, par, bon, dur){
  const df=ns-par;
  const SL=[{d:-99,n:'HOLE IN ONE!',c:'#ff0',sub:''},{d:-4,n:'CONDOR',c:'#f80',sub:''},{d:-3,n:'ALBATROSS',c:'#f80',sub:''},
    {d:-2,n:'EAGLE',c:'#4f4',sub:''},{d:-1,n:'BIRDIE',c:'#4df',sub:''},{d:0,n:'PAR',c:'#fff',sub:''},
    {d:1,n:'BOGEY',c:'#fa4',sub:''},{d:2,n:'DOUBLE BOGEY',c:'#f84',sub:''},{d:3,n:'TRIPLE BOGEY',c:'#f44',sub:''},{d:99,n:'QUAD BOGEY',c:'#f22',sub:''}];
  const entry=(ns===1?SL[0]:SL.slice(1).find(e=>df<=e.d))||SL[SL.length-1];
  const sf=document.getElementById('gScoreFlash');
  const st=document.getElementById('gScoreFlashTxt');
  const ss=document.getElementById('gScoreFlashSub');
  sf.style.borderColor=entry.c+'88';
  st.style.color=entry.c; st.textContent=entry.n;
  ss.textContent=bon!==null?`+${bon}pts`:'';
  sf.style.display='block';
  setTimeout(()=>sf.style.display='none', dur||1300);
}

// ギブアップ時のフラッシュ表示
function showGiveUpFlash(){
  const sf=document.getElementById('gScoreFlash');
  const st=document.getElementById('gScoreFlashTxt');
  const ss=document.getElementById('gScoreFlashSub');
  sf.style.borderColor='#f4488888';
  st.style.color='#f88'; st.textContent='GIVE UP';
  ss.textContent='';
  sf.style.display='block';
  setTimeout(()=>sf.style.display='none', 1300);
}

// =============================================
// スコア結果表示
// =============================================
function judgeShot(){
  const df=G.ns-G.par;
  if(G.ns===1){G.nHIO++;G.mpt=2400+G.bon+200; dbRecordHIO();}
  else if(df<=-5){G.n4++;G.mpt=2100+G.bon+200;}
  else if(df===-4){G.n4++;G.mpt=1900+G.bon+200;}
  else if(df===-3){G.nALB++;G.mpt=1700+G.bon;}
  else if(df===-2){G.nEAG++;G.mpt=1200+G.bon;}
  else if(df===-1){G.nBIR++;G.mpt=800+G.bon;}
  else if(df===0) G.mpt=500+G.bon;
  else if(df===1) G.mpt=300+Math.trunc(G.bon/2);
  else if(df===2) G.mpt=200+Math.trunc(G.bon/2);
  else if(df===3) G.mpt=100+Math.trunc(G.bon/4);
  else if(df>=4)  G.mpt=20+Math.trunc(G.bon/4);
  G.sc+=(G.ns-G.par);
  if(G.cmd===5){G.nCHP++; dbRecordChipIn();}
  const SL=[{d:-99,n:'HOLE IN ONE!',c:'#ff0',sub:''},{d:-4,n:'CONDOR',c:'#f80',sub:''},{d:-3,n:'ALBATROSS',c:'#f80',sub:''},
    {d:-2,n:'EAGLE',c:'#4f4',sub:''},{d:-1,n:'BIRDIE',c:'#4df',sub:''},{d:0,n:'PAR',c:'#fff',sub:''},
    {d:1,n:'BOGEY',c:'#fa4',sub:''},{d:2,n:'DOUBLE BOGEY',c:'#f84',sub:''},{d:3,n:'TRIPLE BOGEY',c:'#f44',sub:''},{d:99,n:'QUAD BOGEY',c:'#f22',sub:''}];
  const entry=(G.ns===1?SL[0]:SL.slice(1).find(e=>df<=e.d))||SL[SL.length-1];
  seHoleIn();
  showFormula();
  showScoreFlash(G.ns, G.par, G.mpt, 1300);
  G.cmd=14; // カップイン後待機（タップで afterJ へ）
  E('bShot',true); $('bShot').textContent='>';
  // パットボタンを無効化（カップイン後は操作不可）
  document.getElementById('gClubPutt').querySelectorAll('button').forEach(b=>b.disabled=true);
}

// =============================================
// ショップ UI
// =============================================
function buildShop(){
  const sc2=document.getElementById('gClubShop');
  // クラブ購入ボタン（ショップ時のみnClubに追加）
  const nc=document.getElementById('gClubNormal');
  pChk();
  nc.innerHTML=[
    {n:1,k:G.kw1,lb:G.kw1>=4?L[_lang].lbMax:`1W+${G.kw1===3?'20':'10'}yd\n-${G.pw1}pts`,dis:G.kw1>=4,noPts:G.kw1<4&&G.pts<G.pw1},
    {n:2,k:G.kw2,lb:G.kw2>=4?L[_lang].lbMax:`3W+${G.kw2===3?'20':'10'}yd\n-${G.pw2}pts`,dis:G.kw2>=4,noPts:G.kw2<4&&G.pts<G.pw2},
    {n:3,k:G.ki1,lb:G.ki1>=4?L[_lang].lbMax:`5I+${G.ki1===3?'20':'10'}yd\n-${G.pi1}pts`,dis:G.ki1>=4,noPts:G.ki1<4&&G.pts<G.pi1},
    {n:4,k:G.ki2,lb:G.ki2>=4?L[_lang].lbMax:`8I+${G.ki2===3?'20':'10'}yd\n-${G.pi2}pts`,dis:G.ki2>=4,noPts:G.ki2<4&&G.pts<G.pi2},
  ].map(c=>{
    if(c.dis){
      // MAX: 枠なし・暗め背景・白文字
      return `<button class="cBtn" id="rb${c.n}" style="white-space:pre-line;font-size:10px;line-height:1.3;flex:1;background:#0d0d0d;border-color:transparent;color:#fff;pointer-events:none">${c.lb}</button>`;
    } else if(c.noPts){
      // pts不足: 枠なし・暗め背景・白文字＋サブラベル
      return `<button class="cBtn" id="rb${c.n}" style="white-space:pre-line;font-size:10px;line-height:1.3;flex:1;background:#0d0d0d;border-color:transparent;color:#fff;pointer-events:none">${c.lb}<br><span style="font-size:9px;color:#fff">${L[_lang].lbNopts}</span></button>`;
    } else {
      return `<button class="cBtn" id="rb${c.n}" onclick="selShop(${c.n})" style="white-space:pre-line;font-size:10px;line-height:1.3;flex:1;color:#fff">${c.lb}</button>`;
    }
  }).join('');
  if(G.nwz<9){
    const sk7NoPts=G.pw>0&&G.pts<G.pw;
    if(sk7NoPts){
      sc2.innerHTML=`<button class="cBtn" id="rb7" style="font-size:11px;flex:1;background:#0d0d0d;border-color:transparent;color:#fff;pointer-events:none">${L[_lang].lbSkillPlus}<br><span style="font-size:9px;color:#fff">${L[_lang].lbNopts}</span></button>`;
    } else {
      sc2.innerHTML=`<button class="cBtn" id="rb7" onclick="selShop(7)" style="font-size:11px;flex:1;color:#fff">${L[_lang].lbSkillPlus}<br><span style="font-size:10px;color:#f88">-${G.pw}pts</span></button>`;
    }
  } else { sc2.innerHTML=''; }
  if(G.pw<=0||G.nwz>=9) {const e=$(7);if(e)e.classList.add('dis');}
}
function selShop(n){
  G.sel=n;
  document.querySelectorAll('.cBtn').forEach(e=>e.classList.remove('sel'));
  const e=document.getElementById('rb'+n);if(e)e.classList.add('sel');
  const pr={1:G.pw1,2:G.pw2,3:G.pi1,4:G.pi2,7:G.pw};
  G.price=pr[n]||0;
  T('gGaugeCost',`-${G.price}pts`);
  E('bShot',true); $('bShot').textContent=L[_lang].lbBuy; $('bShot').className='ready';
}
function shopBuy(){
  if(!G.sel||G.pts<G.price)return;
  seBuy();
  G.pts-=G.price;T('gPtsV',G.pts);
  if(G.sel===1){G.w1+=(G.kw1===3?20:10);G.kw1++;}
  else if(G.sel===2){G.w2+=(G.kw2===3?20:10);G.kw2++;}
  else if(G.sel===3){G.i1+=(G.ki1===3?20:10);G.ki1++;}
  else if(G.sel===4){G.i2+=(G.ki2===3?20:10);G.ki2++;}
  else if(G.sel===7){G.nwz++;T('bSpeN',G.nwz);}
  pChk();G.sel=0;
  E('bShot',false);T('gGaugeCost','');$('bShot').textContent=L[_lang].lbBuy;$('bShot').className='';
  buildShop();
}
function enterShop(){
  if(!VS.active) G.nH++; // 通常時のみここでインクリメント（VS時はcpuFinishHoleで行う）
  G.ns=0;G.cmd=11;loadHD();pChk();
  // 買い物画面: 背景を紺色ベースに変更
  const scg=document.getElementById('scG');
  if(scg) scg.style.background='#030d24';
  const gt=document.getElementById('gTop');
  if(gt) gt.style.background='#040e22';
  document.getElementById('gBtnRow').style.background='#030c1e';
  document.getElementById('gClubArea').style.background='#030c1e';
  // 買い物画面では計算式を非表示
  const sfShop=document.getElementById('gShotFormula');
  if(sfShop){sfShop.textContent='';sfShop.style.display='none';}G._formula='';
  E('bShot',false);$('bShot').textContent=L[_lang].lbBuy;$('bShot').className='';
  document.getElementById('gClubNormal').style.display='flex';
  document.getElementById('gClubPutt').style.display='none';
  document.getElementById('gClubShop').style.display='flex';
  buildShop();
  S('gGiveUp',false);S('bPro',false);S('gTerCard',false);
  document.getElementById('gGaugeArea').style.display='none';
  // gClubArea は表示したまま（ショップボタンを見せる）
  T('gHlV',G.nH);T('gPtsV',G.pts);T('gParV',G.par);
  S('speBox','none'); // 特技名ラベルを非表示（カップイン時に表示されたままになる問題）
  // visibility を確実に戻す（CPU番で非表示にした可能性あり）
  document.querySelectorAll('#gTop .gTopSeg').forEach(s=>{s.style.visibility='';});
  // gPtsV自身も確実に戻す
  const gPtsElR=document.getElementById('gPtsV');
  if(gPtsElR) gPtsElR.style.visibility='';
  document.getElementById('bShot').style.visibility='';
  // document.getElementById('gStYd4').style.display='flex';
  // T('vYd4',G.par); // gStYd4のラベルはHTML固定で「Par」なので値のみセット
  updMap();
  T('uYd1','yd');T('uYd2','yd');T('uYd3','yd');

  S('lRest','none'); S('lFly','none'); // ショップ中は残り・飛距離行を非表示
  // 次のホールのデータを取得して表示（全長のみ表示）
  { const db2=G.cr===2?C2:C1; const nh=db2[G.nH]||db2[1];
    T('vYd1',nh.y); }
  S('bVwC',''); // bVwSは非表示のまま
  E('bWnd',false);E('bSpe',false);
  document.getElementById('bPro').style.display='block';
  T('bPro', VS.active ? '>' : L[_lang].lbNextHole);
  // gShopBanner を表示
  const s=G.sc, sg=s<0?'-':s>0?'+':'±';
  T('gGaugeClub','');
  const banner=document.getElementById('gShopBanner');
  if(banner){
    document.getElementById('gShopScore').textContent=sg+Math.abs(s);
    banner.style.display='flex';
    // バナーのスコアカードボタンにもスコアを反映（上で設定済み）
  }
  // gTerrainInfo: VS時はスコア比較、通常時は非表示
  const ti=document.getElementById('gTerrainInfo');
  if(ti){
    if(VS.active){
      const cpud=CD[VS.cpuCh]||{n:'CPU',col:'#aaa'};
      const psc=G.sc, csc=VS.cpuSc;
      const psg=psc<0?'-':psc>0?'+':'±';
      const csg=csc<0?'-':csc>0?'+':'±';
      const pCol=psc<csc?'#4f4':psc>csc?'#f44':'#ff4';
      const cCol=csc<psc?'#4f4':csc>psc?'#f44':'#ff4';
      const cpuShort=cdN(cpud).split(' ')[0];
      ti.innerHTML=
        `<span style="color:#88ccee;font-size:11px;margin-right:6px">VS</span>`+
        `<span style="color:${pCol};font-size:13px;font-weight:bold">YOU ${psg}${Math.abs(psc)}</span>`+
        `<span style="color:#556;margin:0 5px">vs</span>`+
        `<span style="color:${cCol};font-size:13px;font-weight:bold">${cpuShort} ${csg}${Math.abs(csc)}</span>`;
      ti.style.display='flex';
      ti.style.alignItems='center';
    } else {
      ti.innerHTML=''; ti.style.display='none';
    }
  }
  // 現在位置バーを非表示
  const mpShop=document.getElementById('mPos');
  if(mpShop) mpShop.style.display='none';
}
function proCk(){
  if(G.cmd===11){
    document.getElementById('gSubPanel').className='';
    const tiPro=document.getElementById('gTerrainInfo');
    if(tiPro){tiPro.innerHTML='';tiPro.style.display='none';}
    document.getElementById('bPro').style.display='none';
    document.getElementById('gClubShop').style.display='none';
    document.getElementById('gStYd4').style.display='none';
    document.getElementById('gGaugeArea').style.display='';
    S('gTerCard',true);
    S('bVwS','none');
    if(VS.active){
      // VSモード: 1Pショップ後→直接CPU番開始
      G.cmd=4;
      vsStartCPU(); // CPU番開始（背景リセット済み）
    } else {
      G.cmd=4; holeStart();
    }
  } else {
    // コース終了ボタン: VS時はafterJ→afterJVSを経由してVSリザルトへ
    if(VS.active) afterJ();
    else endGame();
  }
}

// =============================================
// コース・スコアビュー
// =============================================
function vwC(){
  // gTerrainInfo に地形範囲を永続表示
  showTerrainInfo();
}
// 土地勘パターン: キャラ・HCYに応じて地形範囲の start/end を知っているか決定
// 戻り値: {Ra,Rz,Wa,Wz,Ba,Bz} それぞれ3要素の bool 配列 (true=既知, false=??)
function getGeoMask(ch){
  // ch1: 全既知
  if(ch===1) return {
    Ra:[1,1,1], Rz:[1,1,1], Wa:[1,1,1], Wz:[1,1,1], Ba:[1,1,1], Bz:[1,1,1]
  };
  // ch2: 全ゾーン (a-??) ← 始点のみ既知
  if(ch===2) return {
    Ra:[1,1,1], Rz:[0,0,0], Wa:[1,1,1], Wz:[0,0,0], Ba:[1,1,1], Bz:[0,0,0]
  };
  // ch3: R1(a-??),R2(??-??),R3(??-z), W1(a-??),W2(??-??),W3(??-z), B1(a-??),B2(??-??),B3(??-z)
  if(ch===3) return {
    Ra:[1,0,0], Rz:[0,0,1], Wa:[1,0,0], Wz:[0,0,1], Ba:[1,0,0], Bz:[0,0,1]
  };
  // ch4: ゾーン1,2全知、ゾーン3は(??,??)
  if(ch===4) return {
    Ra:[1,1,0], Rz:[1,1,0], Wa:[1,1,0], Wz:[1,1,0], Ba:[1,1,0], Bz:[1,1,0]
  };
  // ch5: R1(??-z),R2(a-??),R3(a-z), W1(a-z),W2(a-??),W3(a-z), B1(a-z),B2(a-??),B3(a-??)
  if(ch===5) return {
    Ra:[0,1,1], Rz:[1,0,1], Wa:[1,1,1], Wz:[1,0,1], Ba:[1,1,1], Bz:[1,0,0]
  };
  // ch6: 全既知
  return {
    Ra:[1,1,1], Rz:[1,1,1], Wa:[1,1,1], Wz:[1,1,1], Ba:[1,1,1], Bz:[1,1,1]
  };
}

// 地形範囲の表示文字列を生成（??マスク付き）
function terrainRangeStr(a, z, maskA, maskZ){
  const sa = maskA ? a : '??';
  const sz = maskZ ? z : '??';
  return `${sa}-${sz}`;
}

function showTerrainInfo(){
  const info=document.getElementById('gTerrainInfo');
  if(!info) return;
  const mask = getGeoMask(G.ch);
  let parts=[];
  // 各ゾーンを {start値, html} の配列に収集してソート
  const zones=[];
  G.Ra.forEach((a,i)=>{
    if(a||G.Rz[i]) zones.push({s:a,
      h:`<span style="color:#7fd87f;margin-right:6px">R:${terrainRangeStr(a,G.Rz[i],mask.Ra[i],mask.Rz[i])}</span>`});
  });
  G.Wa.forEach((a,i)=>{
    if(a||G.Wz[i]) zones.push({s:a,
      h:`<span style="color:#6699ff;margin-right:6px">W:${terrainRangeStr(a,G.Wz[i],mask.Wa[i],mask.Wz[i])}</span>`});
  });
  G.Ba.forEach((a,i)=>{
    if(a||G.Bz[i]) zones.push({s:a,
      h:`<span style="color:#ddcc44;margin-right:6px">B:${terrainRangeStr(a,G.Bz[i],mask.Ba[i],mask.Bz[i])}</span>`});
  });
  // 開始yard の小さい順にソート
  zones.sort((a,b)=>a.s-b.s);
  zones.forEach(z=>parts.push(z.h));
  parts.push(`<span style="color:#00ff88">G:${G.y1-G.gz}-${G.y1+G.gz}</span>`);
  info.innerHTML=parts.join('');
  info.style.display='flex';
  if(mapInfoTimer){clearTimeout(mapInfoTimer);mapInfoTimer=null;}
}
function vwS(){
  const sp=document.getElementById('gSubPanel');
  sp.className='on';
  const ns=['Mina','Soma','Tsuduru','Kyoko','Philip','Hatao'];
  const ss=[G.sm,G.ss,G.st,G.sk,G.sp,G.sh];
  let h='<table><thead><tr><th>Name</th><th style="text-align:right">Score</th></tr></thead><tbody>';
  for(let i=0;i<6;i++){
    const s=ss[i],sg=s<0?'-':s>0?'+':'±',hi=i+1===G.ch?'color:#f88':'color:#99a';
    h+=`<tr><td style="${hi}">${ns[i]}</td><td style="${hi};text-align:right">${sg}${Math.abs(s)}</td></tr>`;
  }
  h+='</tbody></table>';
  sp.innerHTML=h;
  S('bTj2','');S('bVwS','none');
}
function tj2(){
  document.getElementById('gSubPanel').className='';
  S('bVwC','');S('bTj2','none');
}
function csend(){afterJ();}

// =============================================
// エンディング UI
// =============================================
function endGame(){
  // 最終ホールのスコアが未記録の場合（ギブアップ経由など）は補完
  const _lastH=G.cr===2?9:6;
  if(G.holeScores.length < _lastH && G.ns > 0){
    G.holeScores.push(G.ns);
    G.holePars.push(G.par);
  }
  // ★全ホール完走した場合のみDBに保存（途中中断は記録しない）
  if(G.holeScores.length >= _lastH){
    const ch=VS.active?(VS._savedCh||G.ch):G.ch;
    dbSaveRunBest(G.cr, ch, G.holeScores, G.holePars);
    dbRecordPlay(ch);
  }
  rankime();
  if(!G.uf3&&G.sc<=3)G.uf3=true;
  if(!G.uf4&&(G.maxy>=450||G.nHIO>=1))G.uf4=true;
  if(!G.uf5&&G.cr===2&&G.sc<=0)G.uf5=true;
  if(!G.uf6&&G.cr===2&&G.sc<=-5&&G.nHIO+G.n4+G.nALB+G.nEAG>=2)G.uf6=true;
  const d=CD[G.ch];
  const endImgSrc = END_IMG[G.ch] || CHARA_IMG[G.ch] || '';
  document.getElementById('endFig').innerHTML = endImgSrc
    ? `<img src="${endImgSrc}" style="width:165px;height:165px;object-fit:contain">`
    : `<span style="font-size:56px">${d.ic}</span>`;
  document.getElementById('endFig').style.borderColor='';
  const cr={1:'Practice',2:'Championship',3:'Edit'};
  T('endCrs',cr[G.cr]||'');
  const s=G.sc, sg=s<0?'-':s>0?'+':'±';
  document.getElementById('endScore').innerHTML=`<span style="color:${s<=0?'#4f4':'#f84'}">${sg}${Math.abs(s)}</span>`;
  document.getElementById('endScore').style.fontSize='32px';
  document.getElementById('endPts').textContent=G.pts+' pts';
  let rows='';
  if(G.nHIO>0)rows+=`<div class="row">Hole in One<span>${G.nHIO}${L[_lang].lbCount}</span></div>`;
  if(G.nALB>0)rows+=`<div class="row">Albatross<span>${G.nALB}${L[_lang].lbCount}</span></div>`;
  if(G.nEAG>0)rows+=`<div class="row">Eagle<span>${G.nEAG}${L[_lang].lbCount}</span></div>`;
  if(G.nBIR>0)rows+=`<div class="row">Birdie<span>${G.nBIR}${L[_lang].lbCount}</span></div>`;
  if(G.nCHP>0)rows+=`<div class="row">Chip In<span>${G.nCHP}${L[_lang].lbCount}</span></div>`;
  rows+=`<div class="row">Longest Shot<span>${G.maxy}yd</span></div>`;
  // スコアカード
  rows+=`<div style="margin-top:10px;border-top:1px solid #1a1a2a;padding-top:8px">${buildScoreCardHTML()}</div>`;
  document.getElementById('endStatBox').innerHTML=rows;
  sc('scEnd');
}
// =============================================
// IndexedDB 記録モジュール (1DGOLF_DB)
// =============================================
const DB_NAME='1dgolf_records', DB_VER=2;
let _db=null;
function dbOpen(){
  return new Promise((res,rej)=>{
    if(_db){res(_db);return;}
    const req=indexedDB.open(DB_NAME,DB_VER);
    req.onupgradeneeded=e=>{
      const db=e.target.result;
      if(!db.objectStoreNames.contains('bestScores'))
        db.createObjectStore('bestScores');
      if(!db.objectStoreNames.contains('lifetimeStats'))
        db.createObjectStore('lifetimeStats');
      if(!db.objectStoreNames.contains('settings'))
        db.createObjectStore('settings');
    };
    req.onsuccess=e=>{_db=e.target.result;res(_db);};
    req.onerror=e=>rej(e.target.error);
  });
}
function dbGet(store,key){
  return dbOpen().then(db=>new Promise((res,rej)=>{
    const req=db.transaction(store,'readonly').objectStore(store).get(key);
    req.onsuccess=()=>res(req.result);
    req.onerror=e=>rej(e.target.error);
  }));
}
function dbPut(store,key,val){
  return dbOpen().then(db=>new Promise((res,rej)=>{
    const req=db.transaction(store,'readwrite').objectStore(store).put(val,key);
    req.onsuccess=()=>res();
    req.onerror=e=>rej(e.target.error);
  })).catch(e=>console.warn('DB write error:',e));
}
function dbIncr(key){
  return dbGet('lifetimeStats',key).then(cur=>dbPut('lifetimeStats',key,(cur||0)+1));
}
// コース完走記録を保存。合計スコアが過去最小のときのみ全ホール上書き
// キー: "run_${course}_${charId}" 値: {total, holes:[{score,par},...]}
function dbSaveRunBest(course, charId, holeScores, holePars){
  if(course!==1&&course!==2) return Promise.resolve(false);
  const key=`run_${course}_${charId}`;
  const total=holeScores.reduce((a,b)=>a+b,0);
  return dbGet('bestScores',key).then(cur=>{
    const curTotal=(cur&&cur.total!==undefined)?cur.total:Infinity;
    if(total<curTotal){
      const holes=holeScores.map((score,i)=>({score,par:holePars[i]||4}));
      return dbPut('bestScores',key,{total,holes}).then(()=>true);
    }
    return false;
  });
}
function dbRecordPlay(charId){return dbIncr(`play_${charId}`);}
function dbRecordHIO(){return dbIncr('hio');}
function dbRecordChipIn(){return dbIncr('chipIn');}
function dbGetAllRecords(){
  return dbOpen().then(db=>new Promise((res,rej)=>{
    const result={bestScores:{},lifetimeStats:{}};
    const tx=db.transaction(['bestScores','lifetimeStats'],'readonly');
    tx.objectStore('bestScores').openCursor().onsuccess=e=>{
      const cur=e.target.result;
      if(cur){result.bestScores[cur.key]=cur.value;cur.continue();}
    };
    tx.objectStore('lifetimeStats').openCursor().onsuccess=e=>{
      const cur=e.target.result;
      if(cur){result.lifetimeStats[cur.key]=cur.value;cur.continue();}
    };
    tx.oncomplete=()=>res(result);
    tx.onerror=e=>rej(e.target.error);
  }));
}

// =============================================
// レコード画面
// =============================================
function openRecords(){
  sc('scRec');
  const body=document.getElementById('recBody');
  const tRec=L[_lang];
  body.innerHTML='<div style="color:#667;font-size:13px;text-align:center;padding:20px">'+tRec.recLoading+'</div>';

  const COURSE_NAMES=tRec.recCrsNames;
  const HOLE_COUNTS={1:6,2:9};

  dbGetAllRecords().then(rec=>{
    const bs=rec.bestScores||{};
    const ls=rec.lifetimeStats||{};
    let html='';

    // ── 累計実績 ──
    html+='<div class="recSection"><h3>'+tRec.recAllTime+'</h3>';
    const hio=ls['hio']||0, chip=ls['chipIn']||0;
    const plays=Object.keys(CD).map(k=>({id:+k,n:cdN(CD[k]),c:ls[`play_${k}`]||0}));
    html+=`<div class="recStatRow">${tRec.recHIO}<span>${hio}${tRec.lbCount}</span></div>`;
    html+=`<div class="recStatRow">${tRec.recChip}<span>${chip}${tRec.lbCount}</span></div>`;
    html+='</div>';

    // ── キャラ別プレイ回数 ──
    html+='<div class="recSection"><h3>'+tRec.recPlays+'</h3>';
    plays.forEach(p=>{
      html+=`<div class="recStatRow"><span style="color:${CD[p.id].col}">${p.n}</span><span>${p.c}${tRec.lbCount}</span></div>`;
    });
    html+='</div>';

    // ── コース別ホールベスト ──
    [1,2].forEach(cr=>{
      const hmax=HOLE_COUNTS[cr];
      // このコースにデータがあるか確認（run_キー形式）
      let hasData=false;
      for(let ch=1;ch<=6;ch++){
        if(bs[`run_${cr}_${ch}`]!==undefined){hasData=true;break;}
      }
      if(!hasData) return;

      html+=`<div class="recSection"><h3>${tRec.recBest}（${COURSE_NAMES[cr]}）</h3>`;
      html+='<table class="recTable">';
      html+='<colgroup><col style="width:18px"><col style="width:22px">';
      for(let ch=1;ch<=6;ch++) html+='<col>';
      html+='</colgroup>';
      html+='<thead><tr><th>H</th><th>Par</th>';
      for(let ch=1;ch<=6;ch++) html+=`<th style="color:${CD[ch].col}">${cdIC(CD[ch])}</th>`;
      html+='</tr></thead><tbody>';

      // 各キャラのrunデータを取得
      const runs={};
      for(let ch=1;ch<=6;ch++){
        runs[ch]=bs[`run_${cr}_${ch}`]||null;
      }

      for(let h=1;h<=hmax;h++){
        // parはいずれかのrunデータから取得
        let par=0;
        for(let ch=1;ch<=6;ch++){
          const r=runs[ch];
          if(r&&r.holes&&r.holes[h-1]){par=r.holes[h-1].par;break;}
        }
        html+=`<tr><td>${h}</td><td class="par">${par||'—'}</td>`;
        for(let ch=1;ch<=6;ch++){
          const r=runs[ch];
          if(!r||!r.holes||!r.holes[h-1]){html+='<td style="color:#334">—</td>';continue;}
          const score=r.holes[h-1].score;
          const diff=par?score-par:null;
          let cls='best';
          if(diff!==null&&diff<0) cls='under';
          else if(diff===0) cls='par';
          const label=diff!==null?(diff===0?'±0':diff>0?`+${diff}`:`${diff}`):`${score}`;
          html+=`<td class="${cls}">${label}</td>`;
        }
        html+='</tr>';
      }
      // 合計行
      {
        let totalPar=0;
        for(let ch=1;ch<=6;ch++){
          const r=runs[ch];
          if(r&&r.holes){totalPar=r.holes.reduce((a,h)=>a+(h.par||4),0);break;}
        }
        html+=`<tr style="border-top:2px solid #1a1a2a"><td style="color:#aabbcc"><b>${tRec.lbTot}</b></td><td class="par"><b>${totalPar||'—'}</b></td>`;
        for(let ch=1;ch<=6;ch++){
          const r=runs[ch];
          if(!r||!r.total){html+='<td style="color:#334">—</td>';continue;}
          const diff=totalPar?r.total-totalPar:null;
          const sg=diff!==null&&diff>0?'+':'';
          let cls='best';
          if(diff!==null&&diff<0) cls='under';
          else if(diff===0) cls='par';
          html+=`<td class="${cls}"><b>${r.total}</b><br><span style="font-size:9px">${diff!==null?`(${sg}${diff})`:''}</span></td>`;
        }
        html+='</tr>';
      }
      html+='</tbody></table></div>';
    });

    if(!html) html='<div class="recEmpty">'+tRec.recEmpty+'</div>';
    // 削除ボタン：スクロール内の末尾に配置（戻るボタンとの誤タップ防止のため大きく余白）
    html+=`<div style="margin-top:40px;padding:16px 0 24px;text-align:center">
      <button onclick="confirmDeleteRecords()" style="background:transparent;border:1px solid #2a2a3a;color:#556;border-radius:6px;font-size:11px;padding:8px 18px;cursor:pointer;touch-action:manipulation;letter-spacing:0.5px">${tRec.recDelete}</button>
    </div>`;
    body.innerHTML=html;
  }).catch(()=>{
    body.innerHTML='<div class="recEmpty" style="color:#f44">'+(L[_lang].recLoading||'Error')+'</div>';
  });
}

function confirmDeleteRecords(){
  // 既存のダイアログがあれば削除
  const old=document.getElementById('recDelDlg');
  if(old) old.remove();
  const dlg=document.createElement('div');
  dlg.id='recDelDlg';
  dlg.style.cssText='position:fixed;inset:0;background:#000c;display:flex;align-items:center;justify-content:center;z-index:200';
  const td=L[_lang];
  dlg.innerHTML=`
    <div style="background:#0a0a14;border:2px solid #446;border-radius:12px;padding:20px;width:80%;max-width:280px;display:flex;flex-direction:column;gap:14px">
      <div style="color:#aac;font-size:13px;text-align:center;font-weight:bold">${td.recDelTitle}</div>
      <div style="color:#889;font-size:12px;text-align:center;line-height:1.6">${td.recDelBody}</div>
      <div style="display:flex;gap:10px">
        <button onclick="document.getElementById('recDelDlg').remove()" style="flex:1;background:#1a0a0a;border:2px solid #a44;color:#faa;border-radius:8px;font-size:14px;padding:11px;cursor:pointer;touch-action:manipulation">${td.recDelCancel}</button>
        <button onclick="execDeleteRecords()" style="flex:1;background:#0a0a0a;border:2px solid #555;color:#888;border-radius:8px;font-size:14px;padding:11px;cursor:pointer;touch-action:manipulation">${td.recDelOk}</button>
      </div>
    </div>`;
  document.body.appendChild(dlg);
}

function execDeleteRecords(){
  const dlg=document.getElementById('recDelDlg');
  if(dlg) dlg.remove();
  dbOpen().then(db=>{
    const tx=db.transaction(['bestScores','lifetimeStats'],'readwrite');
    tx.objectStore('bestScores').clear();
    tx.objectStore('lifetimeStats').clear();
    tx.oncomplete=()=>{
      _db=null;
      const done=document.createElement('div');
      done.id='recDoneDlg';
      done.style.cssText='position:fixed;inset:0;background:#000c;display:flex;align-items:center;justify-content:center;z-index:200';
      done.innerHTML=`
        <div style="background:#0a0a14;border:2px solid #446;border-radius:12px;padding:24px 20px;width:80%;max-width:280px;display:flex;flex-direction:column;gap:14px;text-align:center">
          <div style="font-size:28px">🗑</div>
          <div style="color:#aac;font-size:14px">${L[_lang].recDelDone}</div>
          <button onclick="document.getElementById('recDoneDlg').remove();openRecords()" style="background:#0a1a0a;border:2px solid #4a8;color:#8fa;border-radius:8px;font-size:14px;padding:11px;cursor:pointer;touch-action:manipulation">OK</button>
        </div>`;
      document.body.appendChild(done);
    };
  }).catch(e=>console.warn('DB delete error:',e));
}

function goT(){
  // アニメーション・ゲージインターバルを完全クリア
  if(G.mv){clearInterval(G.mv);G.mv=null;}
  if(G.gIv){clearInterval(G.gIv);G.gIv=null;}
  G.mHeld=false; shotPhase=0;
  G.ch=0;G.cr=0;G.cmd=0;
  VS.active=false; vsStep=0;
  sc('scT');
}

// =============================================
// ゲームループ内で参照される旧ラベル操作
// =============================================
// holeStart内でのS()呼び出し互換
const _origS=S;
// setYdLabels
function setYdLabels(l2,l3){T('uYd2',l2);T('uYd3',l3);}
// lWind / plmi / valplmi は gWindRow に統合済みなのでノーオペ
function _noop(){}

// =============================================
// 起動
// =============================================
dbGet('settings','lang').then(saved=>{
  if(saved==='en'||saved==='ja'){
    // DB保存値を優先
    _lang=saved;
  } else {
    // 未設定ならブラウザ言語で判定（ja以外はEN）
    const bl=(navigator.language||navigator.userLanguage||'en').toLowerCase();
    _lang=bl.startsWith('ja')?'ja':'en';
  }
  applyLang();
  sc('scT');
  buildGaugeTicks();
}).catch(()=>{
  const bl=(navigator.language||navigator.userLanguage||'en').toLowerCase();
  _lang=bl.startsWith('ja')?'ja':'en';
  applyLang();
  sc('scT');
  buildGaugeTicks();
});

