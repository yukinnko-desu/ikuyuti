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

  const explosionSound = !isRasuto
    ? new Audio("sounds/Explosion01-2(Long).mp3")
    : null;
  if (explosionSound) {
    explosionSound.volume = 0.5;
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
        // 非 rasuto モードで、2 番目のストーリー（空から落ちてくる）の時に SE を再生
        if (explosionSound && !isRasuto && currentStoryIndex === 1) {
          explosionSound.currentTime = 0;
          explosionSound.play().catch((error) => {
            console.log("SE の再生に失敗:", error);
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
  const heheToggle = document.getElementById("hehe-toggle");

  let exitSequenceTimeout;
  let exitSecondTimeout;

  let tapCount = 0;
  let firstTapAt = null;
  let evolutionScreenShown = false;

  const isUramain = window.location.pathname.endsWith("uramain.html");
  const isMain = window.location.pathname.endsWith("main.html") && !isUramain;
  const boxSound = isMain || isUramain ? new Audio("sounds/box.mp3") : null;
  const heheClickSound =
    isMain || isUramain ? new Audio("sounds/hehe_T01.wav") : null;
  if (heheClickSound) {
    heheClickSound.volume = 1.0;
  }

  let isHeheEnabled = false;
  const updateHeheToggle = () => {
    if (!heheToggle) {
      return;
    }
    heheToggle.setAttribute("aria-pressed", String(isHeheEnabled));
    heheToggle.textContent = isHeheEnabled
      ? "へへモード: ON"
      : "へへモード: OFF";
  };

  if (heheToggle) {
    heheToggle.addEventListener("click", () => {
      isHeheEnabled = !isHeheEnabled;
      updateHeheToggle();
    });
    updateHeheToggle();
  }

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

        // event.html中に経過した時間を計測から除外
        const eventEnterTime = localStorage.getItem("yuttinEventEnterTime");
        if (eventEnterTime) {
          const eventDuration = Date.now() - parseInt(eventEnterTime, 10);
          firstTapAt += eventDuration; // event.html中の時間を計測から除外（加算で後ろにシフト）
          localStorage.removeItem("yuttinEventEnterTime");
        }
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
      if (heheClickSound && isHeheEnabled) {
        heheClickSound.currentTime = 0;
        heheClickSound.play().catch((error) => {
          console.log("音声の再生に失敗:", error);
        });
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
          // event.htmlに入った時刻を記録
          localStorage.setItem("yuttinEventEnterTime", String(Date.now()));
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

      // 200回に達したら、より派手で面白い爆発エフェクトを出す
      if (tapCount === 200) {
        yearsImage.style.pointerEvents = "none";

        // 音声を用意（短い爆発 + 余韻の重ね）
        let explosionShort, explosionBoom;
        try {
          explosionShort = new Audio("sounds/Explosion03-2(Short).mp3");
          explosionShort.volume = 1.0;
        } catch (e) {
          console.log("短い爆発SEが読み込めません:", e);
        }
        try {
          explosionBoom = new Audio("sounds/Explosion_Boom_Long.mp3");
          explosionBoom.volume = 0.9;
        } catch (e) {
          // ファイルが無ければ無視
        }

        // スタイル（粒子・煙・デブリ・フラッシュ・爆風）を追加
        const efStyle = document.createElement('style');
        efStyle.textContent = `
          @keyframes particleFly { 0% { transform: translateY(0) scale(1); opacity:1 } 100% { transform: translateY(-260px) translateX(var(--tx,0)) scale(0.5); opacity:0 } }
          @keyframes debrisFall { 0% { transform: translateY(0) rotate(0deg); opacity:1 } 100% { transform: translateY(320px) rotate(720deg); opacity:0 } }
          @keyframes smokeRise { 0% { transform: translateY(0) scale(0.7); opacity:0.6 } 100% { transform: translateY(-200px) scale(1.8); opacity:0 } }
          @keyframes flashPulse { 0%{ opacity: 1 } 40%{ opacity:0.85 } 100%{ opacity:0 } }
          @keyframes shockWave { 0%{ transform: scale(0.2); opacity:0.9 } 60%{ transform: scale(1.1); opacity:0.6 } 100%{ transform: scale(1.6); opacity:0 } }
          @keyframes screenShake { 0%{ transform: translateX(0)} 20%{ transform: translateX(-12px)} 40%{ transform: translateX(10px)} 60%{ transform: translateX(-6px)} 80%{ transform: translateX(4px)} 100%{ transform: translateX(0)} }

          .expl-root{ position: fixed; left:50%; top:45%; transform: translate(-50%,-50%); width: 620px; height: 620px; pointer-events:none; z-index:9999; }
          .expl-flash{ position: fixed; left:0; top:0; right:0; bottom:0; background: radial-gradient(circle at 50% 40%, #fff 0%, #ffdba6 25%, rgba(255,100,10,0.12) 50%, rgba(0,0,0,0) 70%); opacity:0; z-index:9998; animation: flashPulse 520ms ease-out forwards; }
          .expl-shock{ position:absolute; left:50%; top:50%; width:120px; height:120px; border-radius:50%; background: radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,200,150,0.6), rgba(255,120,60,0.2)); transform: translate(-50%,-50%); filter: blur(12px); animation: shockWave 700ms ease-out forwards; z-index:9999 }
          .expl-particle{ position:absolute; bottom:50%; left:50%; width:12px; height:12px; border-radius:50%; will-change: transform, opacity; }
          .expl-debris{ position:absolute; bottom:48%; left:50%; width:10px; height:10px; background:#5c3d22; will-change:transform,opacity; }
          .expl-smoke{ position:absolute; bottom:40%; left:50%; width:360px; height:200px; border-radius:50%; background: radial-gradient(circle at 30% 30%, rgba(200,200,200,0.95), rgba(160,160,160,0.7) 30%, rgba(120,120,120,0.5) 60%, rgba(0,0,0,0) 100%); filter: blur(14px); opacity:0.6; transform:translateX(-50%); }
          .body-shake{ animation: screenShake 700ms ease-in-out; }
        `;
        document.head.appendChild(efStyle);

        // ルート
        const root = document.createElement('div');
        root.className = 'expl-root';

        // フラッシュ全画面
        const flash = document.createElement('div');
        flash.className = 'expl-flash';
        document.body.appendChild(flash);

        // デブリ
        const dCount = 18;
        for (let i=0;i<dCount;i++){
          const d = document.createElement('div');
          d.className = 'expl-debris';
          const w = 6 + Math.random()*22;
          d.style.width = w+'px';
          d.style.height = (4 + Math.random()*12)+'px';
          d.style.left = (48 + (Math.random()-0.5)*28) + '%';
          d.style.bottom = '48%';
          d.style.background = `rgba(${80+Math.floor(Math.random()*80)}, ${40+Math.floor(Math.random()*60)}, ${20+Math.floor(Math.random()*40)}, 1)`;
          d.style.animation = `debrisFall ${900 + Math.floor(Math.random()*1200)}ms cubic-bezier(.2,.8,.3,1) forwards`;
          d.style.transform = `rotate(${Math.floor(Math.random()*720)}deg)`;
          root.appendChild(d);
        }

        // 煙
        for (let i=0;i<3;i++){
          const s = document.createElement('div');
          s.className = 'expl-smoke';
          s.style.left = (50 + (i-1)*18) + '%';
          s.style.opacity = (0.45 + Math.random()*0.35).toString();
          s.style.animation = `smokeRise ${1200 + i*300}ms ease-out forwards`;
          root.appendChild(s);
        }

        document.body.appendChild(root);

        // 画面揺れ
        document.body.classList.add('body-shake');

        // 再生: 短い衝撃音 → 余韻のブーム
        if (explosionShort) {
          try { explosionShort.currentTime = 0; explosionShort.play().catch(()=>{}); } catch(e){}
        }
        if (explosionBoom) {
          setTimeout(()=>{ try{ explosionBoom.currentTime=0; explosionBoom.play().catch(()=>{}); }catch(e){} }, 120);
        }

        // エフェクト完了後にテキスト表示（少し長めにして派手さを見せる）
        setTimeout(()=>{
          // クリーンアップ
          if (root && root.parentNode) root.parentNode.removeChild(root);
          if (flash && flash.parentNode) flash.parentNode.removeChild(flash);
          if (efStyle && efStyle.parentNode) efStyle.parentNode.removeChild(efStyle);
          document.body.classList.remove('body-shake');

          // モーダル表示（画像のスタイルに合わせる）
          const explosionOverlay = document.createElement('div');
          explosionOverlay.style.position = 'fixed';
          explosionOverlay.style.left = '50%';
          explosionOverlay.style.top = '50%';
          explosionOverlay.style.transform = 'translate(-50%, -50%)';
          explosionOverlay.style.backgroundColor = 'white';
          explosionOverlay.style.border = '3px solid #111';
          explosionOverlay.style.borderRadius = '10px';
          explosionOverlay.style.padding = '20px 32px';
          explosionOverlay.style.boxShadow = '0 6px 12px rgba(0,0,0,0.25)';
          explosionOverlay.style.zIndex = '10000';
          explosionOverlay.style.width = 'min(980px, 90vw)';
          explosionOverlay.style.textAlign = 'center';
          explosionOverlay.style.fontSize = '24px';
          explosionOverlay.style.fontWeight = '600';
          explosionOverlay.style.color = '#111';
          explosionOverlay.style.lineHeight = '1.6';
          explosionOverlay.textContent = 'あなたはなですぎました。';
          document.body.appendChild(explosionOverlay);

          setTimeout(()=>{
            explosionOverlay.textContent = '見てください。ゆっちんが照れて爆発しました。';
            setTimeout(()=>{
              if (explosionOverlay && explosionOverlay.parentNode) explosionOverlay.parentNode.removeChild(explosionOverlay);
              startExitSequence();
            }, 2000);
          }, 3000);

        }, 1400);

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
