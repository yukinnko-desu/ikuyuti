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
        "お母さんに​元の​場所に​戻してきなさいって言われちゃった​...",
        "段ボールで​育てるしかないみたい",
      ];

  let currentStoryIndex = 0;
  const heheSound = isRasuto ? new Audio("sounds/hehe_T01.wav") : null;
  if (heheSound) {
    heheSound.volume = 1.0;
  }

  // 進むボタン（ストーリー画面）
  if (nextButton && storyText) {
    nextButton.addEventListener("click", () => {
      if (currentStoryIndex < storyLines.length) {
        const currentLine = storyLines[currentStoryIndex];
        const paragraph = document.createElement("p");
        paragraph.textContent = currentLine;
        paragraph.style.marginBottom = "28px";
        storyText.appendChild(paragraph);
        if (heheSound && currentLine.includes("へへ")) {
          heheSound.currentTime = 0;
          heheSound.play().catch((error) => {
            console.log("音声の再生に失敗:", error);
          });
        }
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

  let exitSequenceTimeout;
  let exitSecondTimeout;

  let tapCount = 0;
  let firstTapAt = null;
  let evolutionScreenShown = false;

  const isUramain = window.location.pathname.endsWith("uramain.html");
  const isMain = window.location.pathname.endsWith("main.html") && !isUramain;
  const boxSound = isMain || isUramain ? new Audio("sounds/box.mp3") : null;

  // event.htmlから戻ってきた場合の処理
  if (isMain) {
    const tapCountBackup = localStorage.getItem("yuttinTapCountBackup");
    if (tapCountBackup) {
      tapCount = parseInt(tapCountBackup, 10);
      localStorage.removeItem("yuttinTapCountBackup");
      if (tapCountDisplay) {
        tapCountDisplay.textContent = String(tapCount);
      }

      // firstTapAtの復元
      const firstTapAtBackup = localStorage.getItem("yuttinFirstTapAtBackup");
      if (firstTapAtBackup) {
        firstTapAt = parseInt(firstTapAtBackup, 10);
        localStorage.removeItem("yuttinFirstTapAtBackup");
      }
    }
  }

  // 画面読み込み時にtapCountを表示に反映
  if (tapCountDisplay) {
    tapCountDisplay.textContent = tapCount;
  }

  const persistResult = () => {
    const now = Date.now();
    const durationSec =
      firstTapAt && tapCount > 0 ? (now - firstTapAt) / 1000 : 0;
    const speed = durationSec > 0 ? tapCount / durationSec : 0;

    localStorage.setItem("yuttinTapCount", String(tapCount));
    localStorage.setItem("yuttinTapSpeed", speed.toFixed(2));
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

  const scheduleExitSecondModal = () => {
    if (exitSequenceTimeout) {
      clearTimeout(exitSequenceTimeout);
    }
    exitSequenceTimeout = setTimeout(() => {
      closeExitResultModal();
      if (exitSecondModal) {
        exitSecondModal.removeAttribute("hidden");
        if (boxSound) {
          boxSound.currentTime = 0;
          boxSound.play().catch((error) => {
            console.log("音声の再生に失敗:", error);
          });
        }
      } else {
        window.location.href = "kekka.html";
      }
    }, 2500);
  };

  const startExitSequence = () => {
    persistResult();
    if (exitResultModal) {
      exitResultModal.removeAttribute("hidden");
      scheduleExitSecondModal();
      return;
    }
    if (exitSecondModal) {
      exitSecondModal.removeAttribute("hidden");
      if (boxSound) {
        boxSound.currentTime = 0;
        boxSound.play().catch((error) => {
          console.log("音声の再生に失敗:", error);
        });
      }
      return;
    }
    window.location.href = "kekka.html";
  };

  if (yearsImage && window.location.pathname.endsWith("uramain.html")) {
    const savedPhoto = localStorage.getItem("yuttinResultPhoto");
    if (savedPhoto) {
      yearsImage.src = savedPhoto;
    }
  }

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

      // tenshi_se.mp3を再生
      const tenshiSound = new Audio("sounds/tenshi_se.mp3");
      tenshiSound.play().catch((error) => {
        console.log("音声の再生に失敗:", error);
      });

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

    // 画像をクリック可能にする
    yearsImage.style.cursor = "pointer";
    yearsImage.style.userSelect = "none";

    yearsImage.addEventListener("click", () => {
      if (evolutionScreenShown) {
        return;
      }
      // uramainで100回に達している場合はクリックを無効化
      if (isUramain && tapCount >= 100) {
        return;
      }
      // カウントを増加
      tapCount++;
      // main.htmlでのみ速度計測のためfirstTapAtを記録
      if (isMain && !firstTapAt) {
        firstTapAt = Date.now();
      }
      if (tapCountDisplay) {
        tapCountDisplay.textContent = tapCount;
      }

      // main.htmlで50回または150回の時にイベント画面へ
      if (isMain && (tapCount === 50 || tapCount === 150)) {
        localStorage.setItem("yuttinEventTapCount", String(tapCount));
        localStorage.setItem("yuttinTapCountBackup", String(tapCount));
        if (firstTapAt) {
          localStorage.setItem("yuttinFirstTapAtBackup", String(firstTapAt));
        }
        window.location.href = "event.html";
        return;
      }

      if (isUramain && tapCount === 100 && !evolutionShown) {
        evolutionShown = true;
        if (dialogueText && dialogueBox) {
          dialogueText.textContent = "ゆっちんが急に震えだした";
          if (boxSound) {
            boxSound.currentTime = 0;
            boxSound.play().catch((error) => {
              console.log("音声の再生に失敗:", error);
            });
          }
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
        startExitSequence();
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
  }

  if (backHomeButton && exitModal) {
    const closeExitModal = () => {
      exitModal.setAttribute("hidden", "");
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
          startExitSequence();
          return;
        }
        closeExitModal();
      });
    });

    if (exitResultModal) {
      exitResultModal.addEventListener("click", () => {
        if (exitSequenceTimeout) {
          clearTimeout(exitSequenceTimeout);
        }
        closeExitResultModal();
        if (exitSecondModal) {
          exitSecondModal.removeAttribute("hidden");
          if (boxSound) {
            boxSound.currentTime = 0;
            boxSound.play().catch((error) => {
              console.log("音声の再生に失敗:", error);
            });
          }
        } else {
          window.location.href = "kekka.html";
        }
      });
    }

    if (exitSecondModal) {
      const scheduleExitSecondRedirect = () => {
        if (exitSecondTimeout) {
          clearTimeout(exitSecondTimeout);
        }
        exitSecondTimeout = setTimeout(() => {
          closeExitSecondModal();
          window.location.href = "kekka.html";
        }, 2500);
      };

      exitSecondModal.addEventListener("click", (event) => {
        if (event.target === exitSecondModal) {
          if (exitSecondTimeout) {
            clearTimeout(exitSecondTimeout);
          }
          closeExitSecondModal();
          window.location.href = "kekka.html";
        }
      });

      exitSecondModal.addEventListener("transitionend", (event) => {
        if (
          event.target === exitSecondModal &&
          !exitSecondModal.hasAttribute("hidden")
        ) {
          scheduleExitSecondRedirect();
        }
      });

      const observer = new MutationObserver(() => {
        if (exitSecondModal.hasAttribute("hidden")) {
          if (exitSecondTimeout) {
            clearTimeout(exitSecondTimeout);
          }
        } else {
          scheduleExitSecondRedirect();
        }
      });
      observer.observe(exitSecondModal, {
        attributes: true,
        attributeFilter: ["hidden"],
      });
    }
  }
});
