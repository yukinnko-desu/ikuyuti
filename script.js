// 画面管理システム
const screenManager = {
  currentScreen: "title",

  showScreen(screenName) {
    // すべての画面を非表示
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active");
    });

    // 指定された画面を表示
    const screenElement = document.getElementById(`${screenName}-screen`);
    if (screenElement) {
      screenElement.classList.add("active");
      this.currentScreen = screenName;
    }
  },
};

// ボタンイベントリスナー
document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-button");
  const playButton = document.getElementById("play-button");
  const nextButton = document.getElementById("next-button");
  const storyText = document.getElementById("story");

  const isRasuto = window.location.pathname.endsWith("rasuto.html");

  // ストーリーテキスト
  const storyLines = isRasuto
    ? [
        "エンジェルゆっちんがこちらを見つめていた",
        "何か話したがっているようだ",
        "「へへっ」",
        "そういって満面の笑みで空に飛び立っていった",
      ]
    : [
        "散歩を​していると​道端に​神社が​現れた！？​",
        "参拝を​してみると​母子手帳と​一緒に​ゆっちんが​空か​落ちてきた​‼",
        "三歳の​ゆっちんを​保護して​育て​よう！​",
        "お母さんに​元の​場所に​戻してきなさいっ言われちゃった​...",
        "段ボールで​育てるしかないみたい",
      ];

  let currentStoryIndex = 0;

  // 進むボタン（ストーリー画面）
  if (nextButton && storyText) {
    nextButton.addEventListener("click", () => {
      if (currentStoryIndex < storyLines.length) {
        const paragraph = document.createElement("p");
        paragraph.textContent = storyLines[currentStoryIndex];
        paragraph.style.marginBottom = "28px";
        storyText.appendChild(paragraph);
        currentStoryIndex++;

        if (isRasuto && currentStoryIndex === storyLines.length) {
          nextButton.textContent = "タイトルへ戻る";
        }
      } else {
        // すべてのストーリーが終わった場合
        window.location.href = "title.html";
      }
    });

    // 初期表示はなし
    currentStoryIndex = 0;
  }

  // 進むボタン → ゲーム説明画面
  if (startButton) {
    startButton.addEventListener("click", () => {
      currentStoryIndex = 0;
      if (storyLines.length > 0) {
        storyText.textContent = storyLines[0];
        currentStoryIndex = 1;
      }
    });
  }

  // ゲーム開始ボタン → ゲーム画面へ
  if (playButton) {
    playButton.addEventListener("click", () => {
      screenManager.showScreen("game");
    });
  }

  // 連打ゲーム機能（main.htmlのみ）
  const yearsImage = document.getElementById("years-image");
  const tapCountDisplay = document.getElementById("tap-count");
  const dialogueBox = document.getElementById("dialogue-box");
  const dialogueText = document.getElementById("dialogue-text");
  const backHomeButton = document.querySelector(".back-home-button");
  const exitModal = document.getElementById("exit-modal");
  const exitResultModal = document.getElementById("exit-result-modal");
  const exitSecondModal = document.getElementById("exit-second-modal");
  const evolutionScreen = document.getElementById("evolution-screen");
  const evolutionTapCount = document.getElementById("evolution-tap-count");
  const gameScreen = document.getElementById("game-screen");

  let tapCount = 0;
  let firstTapAt = null;
  let evolutionScreenShown = false;

  const persistResult = () => {
    const now = Date.now();
    const durationSec =
      firstTapAt && tapCount > 0 ? (now - firstTapAt) / 1000 : 0;
    const speed = durationSec > 0 ? tapCount / durationSec : 0;

    localStorage.setItem("yuttinTapCount", String(tapCount));
    localStorage.setItem("yuttinTapSpeed", speed.toFixed(2));
  };

  if (yearsImage && window.location.pathname.endsWith("uramain.html")) {
    const savedPhoto = localStorage.getItem("yuttinResultPhoto");
    if (savedPhoto) {
      yearsImage.src = savedPhoto;
    }
  }

  const isUramain = window.location.pathname.endsWith("uramain.html");

  if (yearsImage) {
    let dialogueTimeout;
    let evolutionShown = false;

    const showEvolutionScreen = () => {
      if (!evolutionScreen || evolutionScreenShown) {
        return;
      }
      evolutionScreenShown = true;
      if (gameScreen) {
        gameScreen.classList.remove("active");
      }
      evolutionScreen.classList.add("active");
      if (evolutionTapCount) {
        evolutionTapCount.textContent = String(tapCount);
      }

      if (isUramain) {
        setTimeout(() => {
          window.location.href = "rasuto.html";
        }, 3500);
      }
    };

    const dialogues = [
      "愛が​溢れてますね",
      "​照れました",
      "へ​へっ",
      "ヘェ⤴",
      "もっと​褒めても​いいんですよ？​",
      "世界が​憎い",
      "​私は​愚かです",
      "​ここは​段ボールですか？​",
      "​ちょっと​待ってください​",
      "わたしは​ゆっちんよぉーん",
    ];

    yearsImage.addEventListener("click", () => {
      if (evolutionScreenShown) {
        return;
      }
      // カウントを増加
      tapCount++;
      if (!firstTapAt) {
        firstTapAt = Date.now();
      }
      if (tapCountDisplay) {
        tapCountDisplay.textContent = tapCount;
      }

      if (isUramain && tapCount === 100 && !evolutionShown) {
        evolutionShown = true;
        if (dialogueText && dialogueBox) {
          dialogueText.textContent = "ゆっちんが急に震えだした";
          dialogueBox.classList.add("dialogue-box--event");
          dialogueBox.classList.add("show");

          if (dialogueTimeout) {
            clearTimeout(dialogueTimeout);
          }

          dialogueTimeout = setTimeout(() => {
            dialogueText.textContent = "ゆっちんが進化した！！";
            dialogueBox.classList.add("show");
            dialogueTimeout = setTimeout(() => {
              dialogueBox.classList.remove("show");
              dialogueBox.classList.remove("dialogue-box--event");
              showEvolutionScreen();
            }, 2000);
          }, 2500);
        }
        return;
      }

      // 200回に達したら結果画面へ遷移
      if (tapCount === 200) {
        persistResult();
        window.location.href = "kekka.html";
        return;
      }

      // セリフをランダムに表示
      if (dialogueText && dialogueBox) {
        const randomDialogue =
          dialogues[Math.floor(Math.random() * dialogues.length)];
        dialogueText.textContent = randomDialogue;
        dialogueBox.classList.remove("dialogue-box--event");
        dialogueBox.classList.add("show");

        // 既存のタイムアウトをクリア
        if (dialogueTimeout) {
          clearTimeout(dialogueTimeout);
        }

        // 2秒後にセリフを消す
        dialogueTimeout = setTimeout(() => {
          dialogueBox.classList.remove("show");
        }, 2000);
      }
    });

    // yearsImageにスタイルを追加（クリック時のアニメーション対応）
    yearsImage.style.cursor = "pointer";
    yearsImage.style.userSelect = "none";
    yearsImage.style.transition = "transform 0.1s";
  }

  if (backHomeButton && exitModal) {
    const closeExitModal = () => {
      exitModal.setAttribute("hidden", "");
    };

    const closeExitResultModal = () => {
      if (exitResultModal) {
        exitResultModal.setAttribute("hidden", "");
      }
    };

    const closeExitSecondModal = () => {
      if (exitSecondModal) {
        exitSecondModal.setAttribute("hidden", "");
      }
    };

    backHomeButton.addEventListener("click", () => {
      exitModal.removeAttribute("hidden");
    });

    exitModal.addEventListener("click", (event) => {
      if (event.target === exitModal) {
        closeExitModal();
      }
    });

    exitModal.querySelectorAll("[data-exit]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.getAttribute("data-exit");
        if (action === "yes") {
          closeExitModal();
          if (window.location.pathname.endsWith("uramain.html")) {
            window.location.href = "title.html";
            return;
          }
          persistResult();
          if (exitResultModal) {
            exitResultModal.removeAttribute("hidden");
          }
          return;
        }
        closeExitModal();
      });
    });

    if (exitResultModal) {
      exitResultModal.addEventListener("click", () => {
        closeExitResultModal();
        if (exitSecondModal) {
          exitSecondModal.removeAttribute("hidden");
        } else {
          window.location.href = "kekka.html";
        }
      });
    }

    if (exitSecondModal) {
      exitSecondModal.addEventListener("click", (event) => {
        if (event.target === exitSecondModal) {
          closeExitSecondModal();
          window.location.href = "kekka.html";
        }
      });
    }
  }
});
