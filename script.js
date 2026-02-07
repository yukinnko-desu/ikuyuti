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
  
  // 進むボタン → ゲーム説明画面
  if (startButton) {
    startButton.addEventListener('click', () => {
      screenManager.showScreen('explanation');
    });
  }
  
  // ゲーム開始ボタン → ゲーム画面へ
  if (playButton) {
    playButton.addEventListener('click', () => {
      screenManager.showScreen('game');
    });
  }
});