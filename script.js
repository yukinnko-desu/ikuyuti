// 画面管理システム
const screenManager = {
  currentScreen: 'title',
  
  showScreen(screenName) {
    // すべての画面を非表示
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    
    // 指定された画面を表示
    const screenElement = document.getElementById(`${screenName}-screen`);
    if (screenElement) {
      screenElement.classList.add('active');
      this.currentScreen = screenName;
    }
  }
};

// ボタンイベントリスナー
document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('start-button');
  const playButton = document.getElementById('play-button');
  const nextButton = document.getElementById('next-button');
  const storyText = document.getElementById('story');
  
  // ストーリーテキスト
  const storyLines = [
    '散歩を​していると​道端に​神社が​現れた！？​',
    '参拝を​してみると​母子手帳と​一緒に​ゆっちんが​空か​落ちてきた​‼',
    '三歳の​ゆっちんを​保護して​育て​よう！​',
    'お母さんに​元の​場所に​戻してきなさいっ言われちゃった​...',
    '段ボールで​育てるしかないみたい'
  ];
  
  let currentStoryIndex = 0;
  
  // 進むボタン（ストーリー画面）
  if (nextButton && storyText) {
    nextButton.addEventListener('click', () => {
      if (currentStoryIndex < storyLines.length) {
        const paragraph = document.createElement('p');
        paragraph.textContent = storyLines[currentStoryIndex];
        paragraph.style.marginBottom = '20px';
        storyText.appendChild(paragraph);
        currentStoryIndex++;
      } else {
        // すべてのストーリーが終わった場合
        window.location.href = 'title.html';
      }
    });
    
    // 初期表示はなし
    currentStoryIndex = 0;
  }
  
  // 進むボタン → ゲーム説明画面
  if (startButton) {
    startButton.addEventListener('click', () => {
      currentStoryIndex = 0;
      if (storyLines.length > 0) {
        storyText.textContent = storyLines[0];
        currentStoryIndex = 1;
      }
    });
  }
  
  // ゲーム開始ボタン → ゲーム画面へ
  if (playButton) {
    playButton.addEventListener('click', () => {
      screenManager.showScreen('game');
    });
  }

  // 連打ゲーム機能（main.htmlのみ）
  const yearsImage = document.getElementById('years-image');
  const tapCountDisplay = document.getElementById('tap-count');
  const dialogueBox = document.getElementById('dialogue-box');
  const dialogueText = document.getElementById('dialogue-text');

  if (yearsImage) {
    let tapCount = 0;
    let dialogueTimeout;

    const dialogues = [
      '愛が​溢れてますね',
      '​照れました',
      'へ​へっ',
      'ヘェ⤴',
      'もっと​褒めても​いいんですよ？​',
      '世界が​憎い',
      '​私は​愚かです',
      '​ここは​段ボールですか？​',
      '​ちょっと​待ってください​',
      'わたしは​ゆっちんよぉーん'
    ];

    yearsImage.addEventListener('click', () => {
      // カウントを増加
      tapCount++;
      if (tapCountDisplay) {
        tapCountDisplay.textContent = tapCount;
      }

      // 200回に達したら結果画面へ遷移
      if (tapCount === 200) {
        window.location.href = 'kekka.html';
        return;
      }

      // セリフをランダムに表示
      if (dialogueText && dialogueBox) {
        const randomDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
        dialogueText.textContent = randomDialogue;
        dialogueBox.classList.add('show');

        // 既存のタイムアウトをクリア
        if (dialogueTimeout) {
          clearTimeout(dialogueTimeout);
        }

        // 2秒後にセリフを消す
        dialogueTimeout = setTimeout(() => {
          dialogueBox.classList.remove('show');
        }, 2000);
      }
    });

    // yearsImageにスタイルを追加（クリック時のアニメーション対応）
    yearsImage.style.cursor = 'pointer';
    yearsImage.style.userSelect = 'none';
    yearsImage.style.transition = 'transform 0.1s';
  }
});
