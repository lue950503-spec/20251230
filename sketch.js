// 中央角色與下方多狀態精靈動畫範例
// 中央：使用 '角色/全部.png'（原有）
// 下方：顯示 idle/walk/run/attack 四種狀態，按鍵控制

let spriteImg; // 中央的舊精靈（如果有）
let bgImg; // 背景圖片
let celebrationBgImg; // 慶祝背景圖片
const SRC_W = 61; // 若有，保留原來的 source 設定
const SRC_H = 78;
let FRAMES = 0;
const DISPLAY_W = 56;
const DISPLAY_H = 78;
let frameIndex = 0;
let lastFrameTime = 0;
const FRAME_DURATION = 60;

// 遊戲狀態與介面相關
let startBgImg; // 開始畫面背景
let gameState = 'START'; // 狀態: 'START', 'CONTROLS', 'PLAYING'
let btnStart, btnControls, btnBack; // 按鈕

// 下方多狀態精靈
let idleImg, walkImg, runImg, attackImg, dieImg;
let gameOverBgImg; // 遊戲結束背景
const anims = {
  idle: { img: null, frames: 2, srcW: 0, srcH: 0, dispW: 0, dispH: 0 },
  walk: { img: null, frames: 4, srcW: 0, srcH: 0, dispW: 0, dispH: 0 },
  run:  { img: null, frames: 4, srcW: 0, srcH: 0, dispW: 0, dispH: 0 },
  attack: { img: null, frames: 3, srcW: 0, srcH: 0, dispW: 0, dispH: 0 },
  die: { img: null, frames: 2, srcW: 0, srcH: 0, dispW: 0, dispH: 0 }
};

let currentAnimKey = 'idle';
let prevAnimKey = 'idle';
let isAttack = false;
let bottomFrameIndex = 0;
let bottomLastFrameTime = 0;
let isDead = false; // 角色是否死亡
const BOTTOM_FRAME_DURATION = 100; // 可調整播放速度

// 下方角色位置與方向
let bottomX = 0; // 初始位置（會在 setup 中設定為 width / 2）
let bottomY = 0;
let direction = 1; // 1 = 右, -1 = 左
const MOVE_SPEED = 3; // 走路速度（像素/幀，可調整）
const RUN_SPEED = 6;  // 跑步速度（像素/幀，可調整）

// 問題1 精靈（單張圖片，固定尺寸）
let problem1Img = null;

// --- 問題3: 中間新增精靈（5 幀, 每幀 300x68）
let problem3Img = null;
const PROBLEM3_FRAMES = 5; // 圖片內共有 5 幀
let problem3FrameIndex = 0;
let problem3LastFrameTime = 0;
const PROBLEM3_FRAME_DURATION = 100; // 每幀停留毫秒
let problem3SrcW = 300; // 每幀寬（若圖片總寬不同會在 setup 調整）
let problem3SrcH = 68;  // 每幀高
let problem3DisplayW = 300; // 顯示寬高，之後可縮放
let problem3DisplayH = 68;

// 背景音樂
let bgMusic = null;
let volumeSlider = null;
let bgMusic2 = null; // 完成後要切換的音樂

// 完成慶祝
let showCelebration = false;
let fireworks = [];

// 煙火音效所需
let fwNoise = null;
let fwOsc = null;
let fwEnv = null;
// IME 組字狀態
let isComposing = false;

// 問題3 死亡動畫（4 幀，327x59）
let problem3DeathImg = null;
const PROBLEM3_DEATH_W = 327;
const PROBLEM3_DEATH_H = 59;
const PROBLEM3_DEATH_FRAMES = 4;
let problem3DeathFrameIndex = 0;
let problem3DeathLastFrameTime = 0;
const PROBLEM3_DEATH_FRAME_DURATION = 120;
let isProblem3Answered = false; // 問題3 是否答對（觸發死亡動畫）
let problem3DeathFinished = false;
let problem3DeathDirection = 1;

// 問題1答對精靈（3張圖片，298x52）
let problem1CorrectImg = null;
const PROBLEM1_CORRECT_W = 298;
const PROBLEM1_CORRECT_H = 52;
let problem1CorrectFrameIndex = 0;
let problem1CorrectLastFrameTime = 0;
const PROBLEM1_CORRECT_FRAME_DURATION = 150;
let isProblem1Answered = false; // 記錄問題1是否已答對
let problem1DeathFinished = false; // 死亡動畫是否已播放完畢（播放一次）
let problem1DeathDirection = 1; // 記錄問題1死亡時的方向

// --- 問題2: 右側精靈（不動：3張 217x49；死亡動畫：8張 875x49）
let problem2Img = null;
const PROBLEM2_W = 217;
const PROBLEM2_H = 49;
let problem2FrameIndex = 0;
let problem2LastFrameTime = 0;
const PROBLEM2_FRAME_DURATION = 200;
let problem2Facing = 1;

let problem2DeathImg = null;
const PROBLEM2_DEATH_W = 875;
const PROBLEM2_DEATH_H = 49;
let problem2DeathFrameIndex = 0;
let problem2DeathLastFrameTime = 0;
const PROBLEM2_DEATH_FRAME_DURATION = 120;
let isProblem2Answered = false; // 問題2答對狀態
let problem2DeathFinished = false; // 死亡動畫是否已播放完畢（播放一次）
let problem2DeathDirection = 1; // 記錄問題2死亡時的方向

// 題目系統
const QUESTIONS = [
  { text: "地錯貝爾的母親叫甚麼名字?", answer: "梅特利亞", hint: "梅00亞" },
  { text: "地錯貝爾的魔法叫做麼?", answer: "火焰閃電", hint: "火0閃0" }
];
let currentQuestion = null;
let userInput = "";
let questionActive = false;
let questionStartTime = 0;

// 碰撞檢測相關
// 碰撞檢測相關（分別為問題1與問題2獨立檢查）
let lastCollisionCheckP1 = 0;
let lastCollisionCheckP2 = 0;
let lastCollisionCheckP3 = 0; // 問題3 的碰撞檢查時間戳
const COLLISION_CHECK_INTERVAL = 100; // 每100ms檢查一次
const COLLISION_DISTANCE_P1 = 80; // 問題1 碰撞偵測範圍
const COLLISION_DISTANCE_P2 = 100; // 問題2 碰撞偵測範圍（較大，方便觸發）
const COLLISION_DISTANCE_P3 = 100; // 問題3 碰撞距離（可調整）

// 固定 X 或偏移量（便於微調位置）
const PROBLEM1_X = 100; // 問題1 固定 X
const PROBLEM2_X_OFFSET = 100; // 問題2 距離右側的偏移量（小）

function preload() {
  // 載入背景圖片
  bgImg = loadImage('origbig.png');
  celebrationBgImg = loadImage('Forest-and-Trees-Free-Pixel-Backgrounds3.png');
  startBgImg = loadImage('origbig1.png');
 
  // 中央精靈（如果你的專案需要保留）
  spriteImg = loadImage('角色/全部.png');

  // 下方四種狀態的精靈表
  idleImg = loadImage('角色/全部停止.png');      // 2 幀, 總尺寸 147 x 85
  walkImg = loadImage('角色/全部跑步.png');      // 4 幀, 總尺寸 247 x 91
  runImg  = loadImage('角色/全部跑步.png');      // 4 幀, 總尺寸 391 x 81
  attackImg = loadImage('角色/全部攻擊.png');   // 3 幀, 總尺寸 400 x 77
  dieImg = loadImage('角色/全部死亡.png');      // 2 幀, 239x68
  gameOverBgImg = loadImage('ab67616d0000b273bd05173ef76dfa8a6106570a.jpg'); // 死亡後背景
  
  // 載入問題1單張精靈
  problem1Img = loadImage('角色/問題1不動.png');
  
  // 載入問題1答對動畫精靈（3張圖片）
  problem1CorrectImg = loadImage('角色/問題1答對.png');
  
  // 載入問題2精靈（3 幀, 總寬 217, 高 49）與死亡動畫（8 幀, 總寬 875, 高 49）
  problem2Img = loadImage('角色/問題二不動.png');
  problem2DeathImg = loadImage('角色/問題二死亡.png');
  
  // 載入問題3精靈（5 幀，每幀約 300x68）
  problem3Img = loadImage('角色/問題三不動.png');
  // 載入問題3死亡動畫（4 幀）
  problem3DeathImg = loadImage('角色/問題三死亡.png');
  // 載入背景音樂（嘗試使用 encodeURI 避免特殊字元問題）
  try {
    bgMusic = loadSound(encodeURI("光與影33號遠征隊Une vie à t'aimer 用一生去愛  (中英法歌詞 劇透注意).mp3"));
  } catch (e) {
    // 若載入失敗，保留為 null
    bgMusic = null;
  }
  // 預載入完成後要切換的音樂
  try {
    bgMusic2 = loadSound(encodeURI("Official Music Video春日影(MyGO!!!!! ver.)  MyGO!!!!!オリジナル楽曲.mp3"));
  } catch (e) {
    bgMusic2 = null;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);

  // 中央精靈的幀數（若沒有載入成功這行不會造成錯誤）
  if (spriteImg) {
    FRAMES = Math.max(1, Math.floor(spriteImg.width / SRC_W));
  }
  lastFrameTime = millis();

  // 設定下方各精靈屬性（依載入後的圖檔計算每格寬度）
  anims.idle.img = idleImg;
  anims.walk.img = walkImg;
  anims.run.img = runImg;
  anims.attack.img = attackImg;
  anims.die.img = dieImg;

  // 想要下方動畫顯示的高度（像素），可調整此值
  const bottomDisplayH = 78; // 例如 78px 高

  for (let k in anims) {
    const a = anims[k];
    if (a.img) {
      a.srcW = Math.max(1, a.img.width / a.frames);
      a.srcH = a.img.height;
      // 保持高度為 bottomDisplayH，計算寬度以保持比例
      const scale = bottomDisplayH / a.srcH;
      a.dispH = a.srcH * scale;
      a.dispW = a.srcW * scale;
    }
  }
  bottomLastFrameTime = millis();
  
  // 初始化下方角色位置
  // 預設放在問題1 (PROBLEM1_X) 與問題3 (畫面中央) 的中間位置
  bottomX = (PROBLEM1_X + width / 2) / 2;
  bottomY = height - 40; // 離底部約 40px

  // 問題3 的來源與顯示尺寸設定（若圖片載入成功，依實際寬度調整）
  if (problem3Img) {
    // 若圖片為整張 spritesheet，計算每幀寬度
    problem3SrcW = Math.max(1, problem3Img.width / PROBLEM3_FRAMES);
    problem3SrcH = problem3Img.height;
    // 預設顯示高度為原始高度（可在此縮放）
    problem3DisplayH = problem3SrcH;
    problem3DisplayW = problem3SrcW;
  }

  problem3LastFrameTime = millis();
  lastCollisionCheckP1 = millis();
  lastCollisionCheckP2 = millis();
  lastCollisionCheckP3 = millis();
  
  // 設置中文輸入支持
  setupChineseInput();

  // 建立音量滑桿
  volumeSlider = createSlider(0, 1, 0.5, 0.01);
  volumeSlider.position(20, 20);
  volumeSlider.style('width', '100px');
  // 當使用者拉動滑桿時，確保音訊環境已啟動（解決瀏覽器阻擋自動播放問題）
  volumeSlider.input(() => {
    userStartAudio();
  });

  // --- 建立開始畫面按鈕 ---
  btnStart = createButton('遊戲開始');
  btnStart.position(width / 2, height / 2);
  btnStart.size(150, 50);
  btnStart.style('font-size', '20px');
  btnStart.style('transform', 'translate(-50%, -50%)'); // 置中
  btnStart.mousePressed(() => {
    gameState = 'PLAYING';
    updateUI();
    userStartAudio(); // 確保音效啟動
    if (bgMusic && !bgMusic.isPlaying()) {
      bgMusic.loop();
    }
  });

  btnControls = createButton('角色操作');
  btnControls.position(width / 2, height / 2 + 70);
  btnControls.size(150, 50);
  btnControls.style('font-size', '20px');
  btnControls.style('transform', 'translate(-50%, -50%)');
  btnControls.mousePressed(() => {
    gameState = 'CONTROLS';
    updateUI();
  });

  btnBack = createButton('返回');
  btnBack.position(width / 2, height - 100);
  btnBack.size(100, 40);
  btnBack.style('font-size', '18px');
  btnBack.style('transform', 'translate(-50%, -50%)');
  btnBack.mousePressed(() => {
    gameState = 'START';
    updateUI();
  });

  // 初始化 UI 狀態
  updateUI();

  // 嘗試自動播放音樂；若被瀏覽器阻擋會等待使用者互動
  if (bgMusic) {
    bgMusic.setLoop(true);
    // 嘗試直接啟動（若瀏覽器允許自動播放）
    try {
      if (getAudioContext && getAudioContext().state !== 'running') {
        // 嘗試以 user gesture 恢復（可能被阻擋）
        userStartAudio().then(() => {
          bgMusic.loop();
        }).catch(() => {
          // 不做事，等待使用者按鈕
        });
      } else {
        bgMusic.loop();
      }
    } catch (e) {
      // 忽略錯誤，等待使用者操作
    }
  }
}

// 設置中文輸入法支持
function setupChineseInput() {
  const hiddenInput = document.getElementById('hiddenInput');
  if (hiddenInput) {
    // 監聽輸入事件（適用於中文、英文、特殊字符等）
    hiddenInput.addEventListener('input', (e) => {
      if (questionActive) {
        userInput = e.target.value;
        // 更新隱藏輸入欄的值以與顯示同步
        hiddenInput.value = userInput;
      }
    });
    
    // 監聽鍵盤按下事件
    hiddenInput.addEventListener('keydown', (e) => {
      if (questionActive) {
        if (e.key === 'Enter') {
          // 若正在組字中，忽略 Enter（讓 compositionend 先完成）
          if (isComposing) { return; }
          e.preventDefault();
          if (currentQuestion) {
            checkAnswer();
          }
        } else if (e.key === 'Backspace') {
          // 若正在組字中，讓 IME 處理 Backspace
          if (isComposing) { return; }
          e.preventDefault();
          userInput = userInput.slice(0, -1);
          hiddenInput.value = userInput;
        }
      }
    });

    // IME 組字事件：開始/更新/結束
    hiddenInput.addEventListener('compositionstart', (e) => {
      isComposing = true;
    });
    hiddenInput.addEventListener('compositionupdate', (e) => {
      // 顯示中間組字
      if (questionActive) {
        userInput = e.target.value;
      }
    });
    hiddenInput.addEventListener('compositionend', (e) => {
      isComposing = false;
      if (questionActive) {
        userInput = e.target.value;
        hiddenInput.value = userInput;
      }
    });
  }
}

function draw() {
  // --- 遊戲狀態控制 ---
  if (gameState === 'START') {
    background(220);
    // 繪製開始畫面背景
    if (startBgImg && startBgImg.width > 1) {
      push();
      let scaleFactor = Math.max(width / startBgImg.width, height / startBgImg.height);
      let newW = startBgImg.width * scaleFactor;
      let newH = startBgImg.height * scaleFactor;
      imageMode(CENTER);
      image(startBgImg, width / 2, height / 2, newW, newH);
      pop();
    } else {
      // 若圖片讀取失敗，顯示藍色背景與除錯提示
      background(70, 130, 180); // 預設藍色背景
      push();
      fill(255);
      stroke(0);
      strokeWeight(4);
      textAlign(CENTER, CENTER);
      textSize(60);
      text("遊戲標題", width / 2, height / 2 - 100);
      
      // 顯示除錯訊息
      textSize(20);
      noStroke();
      fill(255, 200, 200);
      text("圖片讀取失敗: origbig1.png", width / 2, height / 2 - 20);
      text("提示: 請檢查檔名是否變成了 origbig1.png.png", width / 2, height / 2 + 10);
      pop();
    }
    // 保持音量控制運作
    if (volumeSlider) outputVolume(volumeSlider.value());
    return; // 暫停執行後續遊戲邏輯
  }

  if (gameState === 'CONTROLS') {
    background(50); // 深色背景
    // 繪製操作說明文字
    push();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(40);
    text("角色操作說明", width / 2, height / 2 - 120);
    
    textSize(24);
    text("A / D : 左右移動", width / 2, height / 2 - 40);
    text("Shift : 按住加速 (跑步)", width / 2, height / 2 + 10);
    text("左方向鍵 (←) : 攻擊", width / 2, height / 2 + 60);
    
    textSize(16);
    fill(200);
    text("靠近題目會自動觸發問答", width / 2, height / 2 + 120);
    pop();

    if (volumeSlider) outputVolume(volumeSlider.value());
    return;
  }

  // 1. 先填滿底色，清除上一幀的畫面 (解決殘影問題)
  background(220);

  // 根據滑桿更新全域音量
  if (volumeSlider) {
    outputVolume(volumeSlider.value());
  }

  // 2. 繪製背景圖片，並強制拉伸至全視窗大小
  if (bgImg) {
    push();
    // 計算縮放比例以覆蓋整個畫布 (Cover mode)
    let scaleFactor = Math.max(width / bgImg.width, height / bgImg.height);
    let newW = bgImg.width * scaleFactor;
    let newH = bgImg.height * scaleFactor;
    imageMode(CENTER);
    image(bgImg, width / 2, height / 2, newW, newH);
    pop();
  }
  
  // --- 中央原本的動畫（保持不變） ---
  if (spriteImg && FRAMES > 0 && bgImg !== gameOverBgImg) {
    if (millis() - lastFrameTime > FRAME_DURATION) {
      frameIndex = (frameIndex + 1) % FRAMES;
      lastFrameTime = millis();
    }
    const sx = frameIndex * SRC_W;
    const sy = 0;
    noTint();
    image(spriteImg, width / 2, height / 2, DISPLAY_W, DISPLAY_H, sx, sy, SRC_W, SRC_H);
  }

  // --- 問題3: 顯示不動動畫 ---
  if (!isProblem3Answered && bgImg !== gameOverBgImg) {
    let imgToDraw, frameIndexToUse, sx, srcW, srcH, dispW, dispH;

    imgToDraw = problem3Img;
    if (imgToDraw) {
      if (millis() - problem3LastFrameTime > PROBLEM3_FRAME_DURATION) {
        problem3FrameIndex = (problem3FrameIndex + 1) % PROBLEM3_FRAMES;
        problem3LastFrameTime = millis();
      }
      frameIndexToUse = problem3FrameIndex;
      srcW = problem3Img.width / PROBLEM3_FRAMES;
      srcH = problem3Img.height;
      dispW = problem3DisplayW;
      dispH = problem3DisplayH;

      const cx = width / 2;
      const cy = bottomY;
      sx = frameIndexToUse * srcW;

      push();
      translate(cx, cy);
      let p3Facing = (bottomX < cx) ? -1 : 1;
      scale(p3Facing, 1);
      imageMode(CENTER);
      noTint();
      image(imgToDraw, 0, 0, dispW, dispH, sx, 0, srcW, srcH);
      pop();
    }
  }

  // --- 下方狀態機與移動控制 ---
  if (!isAttack && !isDead) {
    let currentSpeed = MOVE_SPEED; // 預設為走路速度
    
    // 按住 d 向右走；若同時按住 shift，改為跑步
    if (keyIsDown(68)) { // 'd'
      if (direction !== 1) {
        direction = 1; // 面向右
        bottomFrameIndex = 0;
      }
      if (keyIsDown(16)) { // shift
        if (currentAnimKey !== 'run') { currentAnimKey = 'run'; bottomFrameIndex = 0; }
        currentSpeed = RUN_SPEED; // 跑步速度
      } else {
        if (currentAnimKey !== 'walk') { currentAnimKey = 'walk'; bottomFrameIndex = 0; }
        currentSpeed = MOVE_SPEED; // 走路速度
      }
      // 向右移動
      bottomX += currentSpeed;
    } 
    // 按住 a 向左走；若同時按住 shift，改為跑步
    else if (keyIsDown(65)) { // 'a'
      if (direction !== -1) {
        direction = -1; // 面向左
        bottomFrameIndex = 0;
      }
      if (keyIsDown(16)) { // shift
        if (currentAnimKey !== 'run') { currentAnimKey = 'run'; bottomFrameIndex = 0; }
        currentSpeed = RUN_SPEED; // 跑步速度
      } else {
        if (currentAnimKey !== 'walk') { currentAnimKey = 'walk'; bottomFrameIndex = 0; }
        currentSpeed = MOVE_SPEED; // 走路速度
      }
      // 向左移動
      bottomX -= currentSpeed;
    } 
    else {
      if (currentAnimKey !== 'idle' && !isDead) { currentAnimKey = 'idle'; bottomFrameIndex = 0; }
    }
  }

  // 約束角色不超出畫面邊界（可選）
  // 約束角色不超出畫面邊界
  bottomX = constrain(bottomX, 0, width);

  // --- 更新下方動畫幀 ---
  const curAnim = anims[currentAnimKey];
  if (curAnim && curAnim.img) {
    if (millis() - bottomLastFrameTime > BOTTOM_FRAME_DURATION) {
      // 若是死亡動畫，播到最後一幀停止並切換背景
      if (currentAnimKey === 'die' && bottomFrameIndex === curAnim.frames - 1) {
        // 保持在最後一幀
        if (bgImg !== gameOverBgImg && gameOverBgImg) {
          bgImg = gameOverBgImg;
        }
      } else {
        bottomFrameIndex = (bottomFrameIndex + 1) % curAnim.frames;
        bottomLastFrameTime = millis();
      }
    }

    // 如果正在攻擊且已播放到最後一幀，結束攻擊並回復先前狀態
    if (isAttack && bottomFrameIndex === curAnim.frames - 1) {
      // 結束攻擊狀態
      isAttack = false;
      currentAnimKey = prevAnimKey || 'idle';
      bottomFrameIndex = 0;
      bottomLastFrameTime = millis();
    }

    // 繪製下方動畫（使用 bottomX, bottomY 位置）
    if (bgImg !== gameOverBgImg) {
      const sx2 = bottomFrameIndex * curAnim.srcW;
      const sy2 = 0;
      
      noTint();
      // 保存變換矩陣
      push();
      translate(bottomX, bottomY);
      // 根據 direction 翻轉水平方向
      scale(direction, 1);
      image(curAnim.img, 0, 0, curAnim.dispW, curAnim.dispH, sx2, sy2, curAnim.srcW, curAnim.srcH);
      pop();
    }
  }

  // 繪製問題1精靈（固定位置，不隨角色移動，但跟隨視角翻轉） ---
  // 碰撞檢測
  if (!isProblem1Answered && millis() - lastCollisionCheckP1 > COLLISION_CHECK_INTERVAL) {
    lastCollisionCheckP1 = millis();
    const distanceToP1 = Math.abs(bottomX - PROBLEM1_X); // 問題1的固定X位置
    // 修改：需同時靠近且處於攻擊狀態 (isAttack) 才會觸發
    if (distanceToP1 < COLLISION_DISTANCE_P1) {
      if (isAttack && !questionActive) {
        questionActive = true;
        questionStartTime = millis();
        currentQuestion = random(QUESTIONS);
        userInput = "";
        // 聚焦隱藏輸入欄以接收中文輸入
        const hiddenInput = document.getElementById('hiddenInput');
        if (hiddenInput) {
          hiddenInput.value = "";
          hiddenInput.focus();
        }
      } else if (!isAttack && !questionActive && !isDead && (currentAnimKey === 'walk' || currentAnimKey === 'run')) {
        triggerDeath();
      }
    }
  }

  // 碰撞檢測（問題2：右側精靈）
  if (!isProblem2Answered && millis() - lastCollisionCheckP2 > COLLISION_CHECK_INTERVAL) {
    lastCollisionCheckP2 = millis();
    const p2X = width - PROBLEM2_X_OFFSET; // 問題2 固定 X（向右微調）
    const distanceToP2 = Math.abs(bottomX - p2X);
    if (distanceToP2 < COLLISION_DISTANCE_P2) {
      if (isAttack && !questionActive) {
        questionActive = true;
        questionStartTime = millis();
        // 問題2題庫（數字題）
        const p2Questions = [
          { text: "50*50=", answer: "2500", hint: "先算5*5等於多少再看看有多少0再加上去" },
          { text: "1600+1600=", answer: "3200", hint: "換角度去思考1600*2等於多少呢(可以先看看16*2=? )" },
          { text: "20*20-100=", answer: "300", hint: "先乘除後加減" }
        ];
        const idx = Math.floor(random(0, p2Questions.length));
        currentQuestion = p2Questions[idx];
        currentQuestion.source = 'problem2';
        currentQuestion.hintDisplay = false;
        userInput = "";
        const hiddenInput = document.getElementById('hiddenInput');
        if (hiddenInput) { hiddenInput.value = ""; hiddenInput.focus(); }
      } else if (!isAttack && !questionActive && !isDead && (currentAnimKey === 'walk' || currentAnimKey === 'run')) {
        triggerDeath();
      }
    }
  }

  // 碰撞檢查（問題3：中間精靈）
  if (millis() - lastCollisionCheckP3 > COLLISION_CHECK_INTERVAL) {
    lastCollisionCheckP3 = millis();
    const p3X = width / 2; // 問題3 固定在畫面中央
    const distanceToP3 = Math.abs(bottomX - p3X);
    if (!isProblem3Answered && !questionActive && distanceToP3 < COLLISION_DISTANCE_P3) {
      if (isAttack) {
      // 隨機選題（兩題）
      const p3Questions = [
        { text: "今年的goty是哪個遊戲", answer: "33號遠征隊", hint: "33號oo隊" },
        { text: "今年的神魔之塔的最後個黑金叫什麼名字", answer: "曼陀羅", hint: "喇叭花的另一個名字" }
      ];
      const idx3 = Math.floor(random(0, p3Questions.length));
      currentQuestion = Object.assign({}, p3Questions[idx3]);
      currentQuestion.source = 'problem3';
      currentQuestion.hintDisplay = false;
      questionActive = true;
      questionStartTime = millis();
      userInput = "";
      const hiddenInput = document.getElementById('hiddenInput');
      if (hiddenInput) { hiddenInput.value = ""; hiddenInput.focus(); }
      } else if (!isDead && (currentAnimKey === 'walk' || currentAnimKey === 'run')) {
        triggerDeath();
      }
    }
  }

  // 繪製問題1精靈 (加入狀態切換與死亡隱藏)
  if (!isProblem1Answered && bgImg !== gameOverBgImg) {
    const fixedX = PROBLEM1_X; // 固定在視窗 X
    const fixedY = bottomY; // 與下方角色同一行
    let p1Img = problem1Img; // 預設為不動
    let srcW = p1Img ? p1Img.width : 0;
    let srcH = p1Img ? p1Img.height : 0;
    let sx = 0;

    push();
    translate(fixedX, fixedY);
    // 讓精靈面對角色 (若角色在左邊，精靈面向左)
    if (bottomX < fixedX) {
      scale(-1, 1);
    }
    if (p1Img) {
      image(p1Img, 0, 0, srcW, srcH, sx, 0, srcW, srcH);
    }
    pop();
  }

  // 繪製問題2精靈（右側）
  if (!isProblem2Answered && bgImg !== gameOverBgImg) {
    const fixedX = width - PROBLEM2_X_OFFSET; // 靠右，微調偏移量
    const fixedY = bottomY;
    let p2Img, p2Sx, p2SrcW, p2SrcH, p2DispW, p2DispH;
    
    if (problem2Img) {
      // 播放不動動畫
      if (millis() - problem2LastFrameTime > PROBLEM2_FRAME_DURATION) {
        problem2FrameIndex = (problem2FrameIndex + 1) % 3;
        problem2LastFrameTime = millis();
      }
      p2Img = problem2Img;
      p2SrcW = p2Img.width / 3;
      p2SrcH = p2Img.height;
      p2Sx = problem2FrameIndex * p2SrcW;
      p2DispW = PROBLEM2_W;
      p2DispH = PROBLEM2_H;
    }

    if (p2Img) {
      push();
      translate(fixedX, fixedY);
      problem2Facing = (bottomX < fixedX) ? -1 : 1;
      scale(problem2Facing, 1);
      image(p2Img, 0, 0, p2DispW, p2DispH, p2Sx, 0, p2SrcW, p2SrcH);
      pop();
    }
  }

  // 繪製問題2死亡動畫（答對後）
  if (isProblem2Answered && problem2DeathImg && bgImg !== gameOverBgImg) {
    // 更新死亡動畫幀
    if (millis() - problem2DeathLastFrameTime > PROBLEM2_DEATH_FRAME_DURATION) {
      if (!problem2DeathFinished) {
        if (problem2DeathFrameIndex < 7) {
          problem2DeathFrameIndex = problem2DeathFrameIndex + 1;
          problem2DeathLastFrameTime = millis();
        } else {
          // 已到最後一幀，標記為完成並停止自動更新
          problem2DeathFinished = true;
        }
      }
    }

    const fixedX = width - PROBLEM2_X_OFFSET;
    const fixedY = bottomY;
    const srcW = problem2DeathImg.width / 8;
    const srcH = problem2DeathImg.height;
    const sx = problem2DeathFrameIndex * srcW;
    
    // 計算顯示尺寸，保持與不動精靈相同的高度比例
    const displayH = PROBLEM2_H; // 使用不動精靈的高度
    const displayW = displayH * (srcW / srcH); // 保持寬高比

    push();
    translate(fixedX, fixedY);
    // 死亡動畫播放期間面對角色，播放完畢後保持最後方向
    if (!problem2DeathFinished) {
      // 修正：如果角色在左邊，面向左(-1)，否則面向右(1)
      problem2DeathDirection = (bottomX < fixedX) ? -1 : 1;
    }
    scale(problem2DeathDirection, 1);
    image(problem2DeathImg, 0, 0, displayW, displayH, sx, 0, srcW, srcH);
    pop();
  }

  // 繪製問題3死亡動畫（答對後）
  if (isProblem3Answered && problem3DeathImg && bgImg !== gameOverBgImg) {
    // 更新死亡動畫幀
    if (millis() - problem3DeathLastFrameTime > PROBLEM3_DEATH_FRAME_DURATION) {
      if (!problem3DeathFinished) {
        if (problem3DeathFrameIndex < PROBLEM3_DEATH_FRAMES - 1) {
          problem3DeathFrameIndex = problem3DeathFrameIndex + 1;
          problem3DeathLastFrameTime = millis();
        } else {
          problem3DeathFinished = true;
        }
      }
    }

    const fixedX = width / 2;
    const fixedY = bottomY;
    const srcW = problem3DeathImg.width / PROBLEM3_DEATH_FRAMES;
    const srcH = problem3DeathImg.height;
    const sx = problem3DeathFrameIndex * srcW;

    // 計算顯示尺寸，使用死亡圖的高度
    const displayH = PROBLEM3_DEATH_H;
    const displayW = displayH * (srcW / srcH);

    push();
    translate(fixedX, fixedY);
    if (!problem3DeathFinished) {
      problem3DeathDirection = (bottomX < fixedX) ? -1 : 1;
    }
    scale(problem3DeathDirection, 1);
    image(problem3DeathImg, 0, 0, displayW, displayH, sx, 0, srcW, srcH);
    pop();
  }

  // 繪製問題1答對精靈（答對後）
  if (isProblem1Answered && problem1CorrectImg && bgImg !== gameOverBgImg) {
    // 更新答對精靈動畫幀
    if (millis() - problem1CorrectLastFrameTime > PROBLEM1_CORRECT_FRAME_DURATION) {
      if (!problem1DeathFinished) {
        if (problem1CorrectFrameIndex < 2) {
          problem1CorrectFrameIndex = problem1CorrectFrameIndex + 1;
          problem1CorrectLastFrameTime = millis();
        } else {
          // 已到最後一幀，標記為完成並停止自動更新
          problem1DeathFinished = true;
        }
      }
    }

    const fixedX = 100;
    const fixedY = bottomY;
    const srcW = problem1CorrectImg.width / 3;
    const srcH = problem1CorrectImg.height;
    const sx = problem1CorrectFrameIndex * srcW;
    
    // 計算顯示尺寸，保持寬高比
    const displayH = PROBLEM1_CORRECT_H;
    const displayW = displayH * (srcW / srcH);

    push();
    translate(fixedX, fixedY);
    // 死亡動畫播放期間面對角色，播放完畢後保持最後方向
    if (!problem1DeathFinished) {
      // 如果角色在左邊，面向左(-1)，否則面向右(1)
      problem1DeathDirection = (bottomX < fixedX) ? -1 : 1;
    }
    scale(problem1DeathDirection, 1);
    image(problem1CorrectImg, 0, 0, displayW, displayH, sx, 0, srcW, srcH);
    pop();
  }

  // 繪製問題UI
  if (questionActive && currentQuestion) {
    drawQuestionUI();
    // 確保隱藏輸入欄在問題啟動時持續獲得焦點
    const hiddenInput = document.getElementById('hiddenInput');
    if (hiddenInput && document.activeElement !== hiddenInput) {
      hiddenInput.focus();
    }
  }

  // 檢查是否所有題目都已答對且死亡動畫都已播放完畢，若是且尚未顯示慶祝，啟動慶祝
  if (!showCelebration && 
      isProblem1Answered && problem1DeathFinished &&
      isProblem2Answered && problem2DeathFinished &&
      isProblem3Answered && problem3DeathFinished) {
    startCelebration();
  }

  // 若所有題目死亡動畫已完成且啟動慶祝旗標，顯示慶祝文字
  if (showCelebration) {
    if (random(1) < 0.05) {
      fireworks.push(new Firework());
    }
    for (let i = fireworks.length - 1; i >= 0; i--) {
      fireworks[i].update();
      fireworks[i].show();
      if (fireworks[i].done()) {
        fireworks.splice(i, 1);
      }
    }

    push();
    textAlign(CENTER, CENTER);
    textSize(48);
    fill(255, 215, 0);
    stroke(40, 40, 40);
    strokeWeight(6);
    text('恭喜你完成了試煉', width / 2, height / 2);
    pop();
  }
  
}

// 繪製問題UI和輸入框
function drawQuestionUI() {
  const inputBoxH = 40; // 輸入框高度 (還原)
  const inputBoxW = 400; // 輸入框寬度 (還原)
  
  // 決定題目框的位置（在該問題的圖片精靈位置）
  let questionBoxX, questionBoxY;
  if (currentQuestion.source === 'problem2') {
    // 問題2在右側
    questionBoxX = width - PROBLEM2_X_OFFSET;
    questionBoxY = bottomY;
  } else if (currentQuestion.source === 'problem3') {
    // 問題3 在中央
    questionBoxX = width / 2;
    questionBoxY = bottomY;
  } else {
    // 問題1在左側
    questionBoxX = PROBLEM1_X;
    questionBoxY = bottomY;
  }
  
  // 回答框 (改回固定在畫面中央)
  const answerBoxX = width / 2;
  let answerBoxY = bottomY - 100;
  // 如果是問題3，將回答框移到角色下方，避免擋到題目
  if (currentQuestion && currentQuestion.source === 'problem3') {
    answerBoxY = bottomY + 60; // 向下偏移
  }
  // 確保回答框不會跑出畫面（上方或下方），保留 60px 邊界
  answerBoxY = constrain(answerBoxY, 60, height - 60);
  
  // 提示框：顯示在中央精靈（全部.png）上方
  const hintBoxX = width / 2;
  const hintBoxY = height / 2 - DISPLAY_H - 20;

  // 題目框（在該問題圖片精靈位置）
  if (!currentQuestion.hintDisplay) {
    fill(0, 0, 0, 200);
    stroke(255);
    strokeWeight(2);
    rect(questionBoxX - 130, questionBoxY - 100, 260, 50, 8); // 題目框縮小

    fill(255);
    textSize(16); // 題目字體縮小
    textAlign(CENTER, CENTER);
    // 使用文字框讓文字自動換行，避免超出範圍
    text(currentQuestion.text, questionBoxX - 130, questionBoxY - 100, 260, 50);
  }

  // 提示框（在上方圖片精靈）
  if (currentQuestion.hintDisplay) {
    fill(0, 0, 0, 200);
    stroke(255);
    strokeWeight(2);
    rect(hintBoxX - 210, hintBoxY - 50, 420, 50, 8);

    fill(255, 150, 0);
    textSize(16);
    textAlign(CENTER, CENTER);
    // 使用文字框讓文字自動換行
    text("提示: " + currentQuestion.hint, hintBoxX - 210, hintBoxY - 50, 420, 50);
  }

  // 回答框（在移動角色精靈上方）
  fill(255);
  stroke(100);
  strokeWeight(2);
  rect(answerBoxX - inputBoxW / 2, answerBoxY - 30, inputBoxW, inputBoxH, 4);

  // 輸入文字
  fill(0);
  textSize(16); // 輸入字體還原
  textAlign(LEFT, CENTER);
  text(userInput, answerBoxX - inputBoxW / 2 + 15, answerBoxY - 10);

  // 輸入游標閃爍
  if (Math.floor(millis() / 500) % 2 === 0) {
    stroke(0);
    strokeWeight(2);
    line(answerBoxX - inputBoxW / 2 + 15 + textWidth(userInput), answerBoxY - 30, answerBoxX - inputBoxW / 2 + 15 + textWidth(userInput), answerBoxY + 10);
  }

  // 提示文字（在回答框下方）
  fill(200, 100, 100);
  textSize(12);
  textAlign(CENTER, TOP);
  text(`按 ENTER 提交, BACKSPACE 刪除`, answerBoxX, answerBoxY + 20);
}

// 當使用者按下左方向鍵，觸發攻擊動畫（完整播放後自動回復）
function keyPressed() {
  // 如果問題正在進行中，只處理ENTER和BACKSPACE，其他交給隱藏輸入欄
  if (questionActive && currentQuestion) {
    if (keyCode === ENTER) {
      // 若正在組字中，忽略 Enter
      if (isComposing) { return false; }
      // 檢查答案
      checkAnswer();
      return false;
    } else if (keyCode === BACKSPACE) {
      // 若正在組字中，忽略 Backspace（IME 處理）
      if (isComposing) { return false; }
      // 刪除上一個字符
      userInput = userInput.slice(0, -1);
      const hiddenInput = document.getElementById('hiddenInput');
      if (hiddenInput) {
        hiddenInput.value = userInput;
      }
      return false;
    }
    // 不攔截其他鍵，讓隱藏輸入欄接收字符輸入
    return;
  }

  // 原本的攻擊邏輯
  if (keyCode === LEFT_ARROW) {
    // 只有在非攻擊時才觸發一次攻擊
    if (!isAttack && !isDead) {
      prevAnimKey = currentAnimKey;
      currentAnimKey = 'attack';
      isAttack = true;
      bottomFrameIndex = 0;
      bottomLastFrameTime = millis();
    }
  }
}

// 觸發角色死亡
function triggerDeath() {
  isDead = true;
  currentAnimKey = 'die';
  bottomFrameIndex = 0;
  bottomLastFrameTime = millis();
}

// 檢查答案
function checkAnswer() {
  const inputTrimmed = userInput.trim();
  
  if (currentQuestion && currentQuestion.source === 'problem2') {
    // 處理問題2的判斷（數字題）
    if (inputTrimmed === currentQuestion.answer) {
      // 問題2答對
      isProblem2Answered = true;
      questionActive = false;
      userInput = "";
      problem2DeathLastFrameTime = millis();
      problem2DeathFrameIndex = 0;
      problem2DeathFinished = false; // 開始播放死亡動畫（尚未完成）
      // 立即設定死亡方向，使死亡前即面向移動角色
      const fixedX = width - PROBLEM2_X_OFFSET;
      problem2DeathDirection = (bottomX < fixedX) ? 1 : -1;
    } else {
      // 答錯，顯示提示
      showHint();
      userInput = ""; // 清空輸入，讓玩家重新開始
    }
  } else if (currentQuestion && currentQuestion.source === 'problem3') {
    // 處理問題3的判斷（文字題）
      if (inputTrimmed === currentQuestion.answer) {
        // 問題3答對：觸發死亡動畫並標記為已答對
        isProblem3Answered = true;
        questionActive = false;
        userInput = "";
        problem3DeathLastFrameTime = millis();
        problem3DeathFrameIndex = 0;
        problem3DeathFinished = false;
    } else {
      // 答錯，顯示提示（在全部.png 上方）
      showHint();
      userInput = "";
    }
  } else {
    // 預設回退到問題1的行為（舊題庫）
    if (currentQuestion && inputTrimmed === currentQuestion.answer) {
      // 答對了
      isProblem1Answered = true;
      questionActive = false;
      userInput = "";
      problem1CorrectLastFrameTime = millis();
      problem1CorrectFrameIndex = 0;
      problem1DeathFinished = false; // 開始播放死亡動畫（尚未完成）
    } else {
      // 答錯，顯示提示
      showHint();
      userInput = ""; // 清空輸入，讓玩家重新開始
    }
  }
  
  // 清空隱藏輸入欄並失去焦點，讓 p5.js 恢復鍵盤控制
  const hiddenInput = document.getElementById('hiddenInput');
  if (hiddenInput) {
    hiddenInput.value = "";
    hiddenInput.blur(); // 失去焦點
  }
}

// 顯示提示
function showHint() {
  // 提示文字暫時替換為提示內容
  currentQuestion.hintDisplay = true;
  currentQuestion.hintStartTime = millis();
  // 3秒後回復原問題
  setTimeout(() => {
    if (currentQuestion) {
      currentQuestion.hintDisplay = false;
    }
  }, 3000);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 視窗改變時更新按鈕位置
  if (btnStart) btnStart.position(width / 2, height / 2);
  if (btnControls) btnControls.position(width / 2, height / 2 + 70);
  if (btnBack) btnBack.position(width / 2, height - 100);
}

// 更新介面顯示狀態
function updateUI() {
  if (gameState === 'START') {
    if (btnStart) btnStart.show();
    if (btnControls) btnControls.show();
    if (btnBack) btnBack.hide();
  } else if (gameState === 'CONTROLS') {
    if (btnStart) btnStart.hide();
    if (btnControls) btnControls.hide();
    if (btnBack) btnBack.show();
  } else {
    // PLAYING
    if (btnStart) btnStart.hide();
    if (btnControls) btnControls.hide();
    if (btnBack) btnBack.hide();
  }
}

// 啟動慶祝：顯示訊息、播放煙火音效、切換音樂
function startCelebration() {
  showCelebration = true;
  bgImg = celebrationBgImg;
  // 切換背景音樂
  if (bgMusic) {
    bgMusic.stop();
  }
  if (bgMusic2) {
    // 若需要 user gesture，嘗試啟動 audio context
    userStartAudio().then(() => {
      bgMusic2.setLoop(true);
      bgMusic2.loop();
    }).catch(() => {
      // 若被阻擋，仍嘗試播放（某些瀏覽器會失敗）
      try { bgMusic2.loop(); } catch(e){}
    });
  }

  // 播放合成煙火音效：多次短暫爆發
  playFireworks();
}

function playFireworks() {
  // 使用多個延遲來模擬數發煙火
  for (let i = 0; i < 6; i++) {
    const delay = i * 400 + Math.floor(random(-100, 200));
    setTimeout(() => {
      // 白噪音爆發
      const noise = new p5.Noise('white');
      const env = new p5.Envelope();
      env.setADSR(0.001, 0.05, 0.1, 0.3);
      env.setRange(0.9, 0);
      noise.disconnect();
      const noiseGain = new p5.Gain();
      noiseGain.disconnect();
      noise.connect(noiseGain);
      noiseGain.connect();
      // 控制音量並觸發
      env.play(noise);

      // 加一個短促上升的 oscillator 當作爆炸聲
      const osc = new p5.Oscillator('sine');
      const oscEnv = new p5.Envelope();
      oscEnv.setADSR(0.001, 0.08, 0.01, 0.2);
      oscEnv.setRange(0.8, 0);
      osc.freq( random(300, 1200) );
      osc.amp(0);
      osc.start();
      oscEnv.play(osc);
      // 停掉 oscillator
      setTimeout(() => { try{ osc.stop(); } catch(e){} }, 500);
      setTimeout(() => { try{ noise.stop(); } catch(e){} }, 500);
    }, delay);
  }
}

// --- 煙火類別 ---
class Firework {
  constructor() {
    this.hu = random(255);
    this.firework = new Particle(random(width), height, this.hu, true);
    this.exploded = false;
    this.particles = [];
  }

  done() {
    return (this.exploded && this.particles.length === 0);
  }

  update() {
    if (!this.exploded) {
      this.firework.applyForce(createVector(0, 0.2));
      this.firework.update();
      if (this.firework.vel.y >= 0) {
        this.exploded = true;
        this.explode();
      }
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].applyForce(createVector(0, 0.2));
      this.particles[i].update();
      if (this.particles[i].done()) {
        this.particles.splice(i, 1);
      }
    }
  }

  explode() {
    for (let i = 0; i < 100; i++) {
      const p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hu, false);
      this.particles.push(p);
    }
  }

  show() {
    if (!this.exploded) {
      this.firework.show();
    }
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].show();
    }
  }
}

class Particle {
  constructor(x, y, hu, firework) {
    this.pos = createVector(x, y);
    this.firework = firework;
    this.lifespan = 255;
    this.hu = hu;
    this.acc = createVector(0, 0);
    if (this.firework) {
      this.vel = createVector(0, random(-12, -8));
    } else {
      this.vel = p5.Vector.random2D();
      this.vel.mult(random(2, 10));
    }
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    if (!this.firework) {
      this.vel.mult(0.9);
      this.lifespan -= 4;
    }
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  done() {
    return this.lifespan < 0;
  }

  show() {
    colorMode(HSB);
    if (!this.firework) {
      strokeWeight(2);
      stroke(this.hu, 255, 255, this.lifespan);
    } else {
      strokeWeight(4);
      stroke(this.hu, 255, 255);
    }
    point(this.pos.x, this.pos.y);
    colorMode(RGB);
  }
}