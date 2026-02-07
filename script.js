const storyLines = [
  "散歩をしていると道端に神社が現れた！？",
  "参拝をしてみると母子手帳と一緒にゆっちんが空から落ちてきた!!",
  "三歳のゆっちんを保護して育てよう！",
  "お母さんに元の場所に戻してきなさいって言われちゃった...",
  "段ボールで育てるしかないみたい",
];

const storyContainer = document.getElementById("story");
const nextButton = document.getElementById("next-button");
let currentIndex = 0;
let isTyping = false;
let storyComplete = false;

const typeLine = (text, onComplete) => {
  const line = document.createElement("p");
  storyContainer.appendChild(line);

  let i = 0;
  const speedMs = 40;

  const timer = setInterval(() => {
    line.textContent += text[i];
    i += 1;

    if (i >= text.length) {
      clearInterval(timer);
      onComplete();
    }
  }, speedMs);
};

const appendNextLine = () => {
  if (isTyping) {
    return;
  }

  if (storyComplete) {
    window.location.href = "title.html";
    return;
  }

  isTyping = true;
  nextButton.disabled = true;

  typeLine(storyLines[currentIndex], () => {
    currentIndex += 1;
    isTyping = false;
    if (currentIndex >= storyLines.length) {
      storyComplete = true;
      nextButton.disabled = false;
      nextButton.textContent = "進む";
      return;
    }

    nextButton.disabled = false;
  });
};

nextButton.addEventListener("click", appendNextLine);
