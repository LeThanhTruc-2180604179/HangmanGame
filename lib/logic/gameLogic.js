let currentWord = "", currentHint = "";
let guessedLetters = [], wrongGuesses = 0, score = 0, highScore = 0;
let gameMode = "classic", gameTheme = "";
let timerInterval, timeLeft = 0;
let musicVolume = 0.4, soundFxVolume = 1;
let hasInteracted = false;
let currentSlide = 0;
const totalSlides = 4;
let isWinState = false; // Thêm biến trạng thái để kiểm tra người chơi thắng hay thua

const instructions = [
  "Bạn sẽ phải dự đoán các từ khóa theo các gợi ý với các chủ đề mà bạn đã chọn",
  "Nếu bạn chọn chữ cái sai trong từ sẽ hiện phím đỏ, phím xanh cho biết bạn đã đúng",
  "Bạn có 6 lần nhập và cần đoán chính xác cụm từ trước khi 'người treo cổ' được vẽ xong" ,
  "Người chơi treo cổ sẽ được vẽ khi bạn đoán sai, nếu được vẽ xong thì bạn đã thua cuộc"
];

const pages = {
  welcome: document.getElementById("welcomePage"),
  mode: document.getElementById("modePage"),
  game: document.getElementById("gamePage"),
  teamSetup: document.getElementById("teamSetupPage"),
  theme: document.getElementById("themePage")
};

const els = {
  instructionsSection: document.getElementById("instructionsSection"),
  welcomeContent: document.getElementById("welcomeContent"),
  wordDisplay: document.getElementById("wordDisplay"),
  keyboard: document.getElementById("keyboard"),
  gameStatus: document.getElementById("gameStatus"),
  scoreValue: document.getElementById("scoreValue"),
  highScoreValue: document.getElementById("highScoreValue"),
  livesValue: document.getElementById("livesValue"),
  gameTimer: document.getElementById("gameTimer"),
  hintText: document.getElementById("hintText"),
  resultModal: document.getElementById("resultModal"),
  resultEmoji: document.getElementById("resultEmoji"),
  resultTitle: document.getElementById("resultTitle"),
  resultMessage: document.getElementById("resultMessage"),
  correctWord: document.getElementById("correctWord"),
  hangmanParts: [
    document.getElementById("head"),
    document.getElementById("body"),
    document.getElementById("leftArm"),
    document.getElementById("rightArm"),
    document.getElementById("leftLeg"),
    document.getElementById("rightLeg")
  ],
  settingsBtn: document.getElementById("settingsBtn"),
  settingsMenu: document.getElementById("settingsMenu"),
  musicVolume: document.getElementById("musicVolume"),
  soundFxVolume: document.getElementById("soundFxVolume"),
  slider: document.querySelector("#instructionsSlider .slider"),
  prevSlideBtn: document.getElementById("prevSlideBtn"),
  nextSlideBtn: document.getElementById("nextSlideBtn"),
  currentInstruction: document.getElementById("currentInstruction"),
  playAgainButton: document.getElementById("playAgainButton") // Thêm nút play again
};

const sounds = {
  background: document.getElementById("backgroundMusic"),
  correct: document.getElementById("correctSound"),
  wrong: document.getElementById("wrongSound"),
  win: document.getElementById("winSound"),
  lose: document.getElementById("loseSound"),
  click: document.getElementById("clickSound"),
  hover: document.getElementById("hoverSound")
};


// Load High Score and Audio Settings
function loadHighScore() {
  highScore = localStorage.getItem('highScore') || 0;
  els.highScoreValue.textContent = highScore;
}

function loadAudioSettings() {
  musicVolume = localStorage.getItem('musicVolume') || 0.4;
  soundFxVolume = localStorage.getItem('soundFxVolume') || 1;
  els.musicVolume.value = musicVolume;
  els.soundFxVolume.value = soundFxVolume;
  sounds.background.volume = musicVolume;
  Object.values(sounds).forEach(sound => {
    if (sound !== sounds.background) sound.volume = soundFxVolume;
  });
}

function saveHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
    els.highScoreValue.textContent = highScore;
  }
}

// Play Background Music
function playBackgroundMusic() {
  if (sounds.background) {
    sounds.background.volume = musicVolume;
    sounds.background.play().catch(err => console.error("Lỗi phát nhạc nền:", err));
  }
}

// Interaction Listener
function setupInteractionListener() {
  const interactionEvents = ["click", "touchstart", "keydown"];
  interactionEvents.forEach(event => {
    document.addEventListener(event, () => {
      if (!hasInteracted) {
        hasInteracted = true;
        playBackgroundMusic();
      }
    }, { once: true });
  });
}

// Navigation Events
document.getElementById("startButton").addEventListener("click", () => {
  playClick();
  switchPage("mode");
});

document.getElementById("instructionsButton").onclick = () => {
  playClick();
  els.welcomeContent.style.display = "none";
  els.instructionsSection.style.display = "block";
  currentSlide = 0;
  updateSlider();
};

document.getElementById("backToWelcomeContentButton").onclick = () => {
  playClick();
  els.welcomeContent.style.display = "block";
  els.instructionsSection.style.display = "none";
};

document.getElementById("backToWelcomeButton").onclick = () => {
  playClick();
  switchPage("welcome");
  els.welcomeContent.style.display = "block";
  els.instructionsSection.style.display = "none";
};

document.getElementById("backToModeButton").onclick = () => {
  playClick();
  resetGameState();
  switchPage("mode");
};

document.getElementById("backFromTeamSetupButton").onclick = () => {
  playClick();
  switchPage("mode");
};

document.getElementById("backFromThemeButton").onclick = () => {
  playClick();
  switchPage("mode");
};

document.getElementById("backToHomeButton").onclick = () => {
  playClick();
  resetGameState();
  switchPage("welcome");
  els.welcomeContent.style.display = "block";
  els.instructionsSection.style.display = "none";
};

// Mode Selection
document.querySelectorAll("#modePage .mode-card").forEach(card => {
  card.addEventListener("click", () => {
    playClick();
    const mode = card.dataset.mode;
    gameMode = mode;
    if (mode === "classic" || mode === "timed") {
      startGame();
    } else if (mode === "themed") {
      switchPage("theme");
    } else if (mode === "team") {
      switchPage("teamSetup");
    }
  });
});

// Theme Selection
document.querySelectorAll("#themePage .mode-card").forEach(card => {
  card.addEventListener("click", () => {
    playClick();
    gameTheme = card.dataset.theme;
    startGame();
  });
});

// Team Setup
document.getElementById("startTeamGameButton").onclick = () => {
  playClick();
  const wordInput = document.getElementById("customWord").value.trim();
  if (!wordInput) {
    alert("Bạn cần nhập từ hoặc cụm từ!");
    return;
  }
  currentWord = wordInput.toUpperCase();
  currentHint = document.getElementById("customHint").value.trim() || "";
  startGame(true);
};

// New Game / Play Again
document.getElementById("newGameButton").onclick = () => {
  playClick();
  newRound();
};

// Cập nhật xử lý cho nút Play Again
document.getElementById("playAgainButton").onclick = () => {
  playClick();
  els.resultModal.style.display = "none";
  
  // Nếu người chơi thua, reset điểm về 0
  if (!isWinState) {
    score = 0;
    els.scoreValue.textContent = score;
  }
  // Nếu người chơi thắng, giữ nguyên điểm
  
  newRound();
};

// Audio Settings
els.settingsBtn.onclick = () => {
  els.settingsMenu.classList.toggle("show");
};

els.musicVolume.oninput = (e) => {
  musicVolume = e.target.value;
  sounds.background.volume = musicVolume;
  localStorage.setItem('musicVolume', musicVolume);
};

els.soundFxVolume.oninput = (e) => {
  soundFxVolume = e.target.value;
  localStorage.setItem('soundFxVolume', soundFxVolume);
  Object.values(sounds).forEach(sound => {
    if (sound !== sounds.background) sound.volume = soundFxVolume;
  });
};

// Instructions Slider
function updateSlider() {
  els.slider.style.transform = `translateX(-${currentSlide * 100}%)`;
  els.prevSlideBtn.style.display = currentSlide === 0 ? "none" : "block";
  els.nextSlideBtn.style.display = currentSlide === totalSlides - 1 ? "none" : "block";
  els.currentInstruction.textContent = instructions[currentSlide];
}

els.prevSlideBtn.onclick = () => {
  playClick();
  if (currentSlide > 0) {
    currentSlide--;
    updateSlider();
  }
};

els.nextSlideBtn.onclick = () => {
  playClick();
  if (currentSlide < totalSlides - 1) {
    currentSlide++;
    updateSlider();
  }
};

// Utility Functions
function switchPage(pageKey) {
  Object.values(pages).forEach(p => p.classList.remove("active-page"));
  pages[pageKey].classList.add("active-page");
}

function playSound(name) {
  const snd = sounds[name];
  if (snd) {
    snd.currentTime = 0;
    snd.volume = soundFxVolume;
    snd.play();
  }
}

const playClick = () => playSound("click");

// Keyboard Initialization
function initKeyboard() {
  els.keyboard.innerHTML = "";
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(ch => {
    const key = document.createElement("div");
    key.className = "key";
    key.textContent = ch;
    key.addEventListener("click", () => handleGuess(ch, key));
    els.keyboard.appendChild(key);
  });
}

function disableAllKeys() {
  document.querySelectorAll(".key").forEach(k => k.classList.add("disabled"));
}

// New Round
function newRound() {
  resetGameState();
  pickWord();
  updateWordDisplay();
  initKeyboard();
  updateLives();
  updateStatus("");
  if (gameMode === "timed") startTimer();
}

// Reset Game State
function resetGameState() {
  clearInterval(timerInterval);
  els.gameTimer.textContent = "00:00";
  timeLeft = 0;
  guessedLetters = [];
  wrongGuesses = 0;
  els.hangmanParts.forEach(p => p.style.display = "none");
  els.resultModal.style.display = "none";
}

// Pick Word
function pickWord() {
  if (gameMode === "team") return;   // custom word

  // Xác định “key” của pool hiện tại
  const key = (gameMode === "classic" || gameMode === "timed")
                ? "classic"
                : gameTheme;           // animals / food / …
  if (!pools[key].length) {
    // Hết từ → nạp lại & shuffle
    pools[key] = shuffle([...wordDatabase[key]]);
  }
  const { word, hint } = pools[key].pop();   // lấy phần tử cuối (đã shuffle)
  currentWord = word;
  currentHint = hint;
}


// Update Word Display
function updateWordDisplay() {
  els.hintText.textContent = currentHint || "Không có gợi ý";
  els.wordDisplay.innerHTML = "";
  currentWord.split("").forEach(ch => {
    const box = document.createElement("div");
    box.className = "letter-box";
    box.textContent = guessedLetters.includes(ch) || ch === " " ? ch : "";
    if (ch === " ") box.style.borderBottom = "none";
    els.wordDisplay.appendChild(box);
  });
}

// Handle Guess
function handleGuess(letter, keyEl) {
  if (guessedLetters.includes(letter) || keyEl.classList.contains("disabled")) return;
  guessedLetters.push(letter);
  keyEl.classList.add("disabled");
  if (currentWord.includes(letter)) {
    keyEl.classList.add("correct");
    playSound("correct");
    updateWordDisplay();
    checkWin();
  } else {
    keyEl.classList.add("wrong");
    playSound("wrong");
    revealHangmanPart();
    updateLives();
    checkLose();
  }
}

function revealHangmanPart() {
  if (wrongGuesses < els.hangmanParts.length) {
    els.hangmanParts[wrongGuesses].style.display = "block";
  }
  wrongGuesses++;
}

function updateLives() {
  els.livesValue.textContent = els.hangmanParts.length - wrongGuesses;
}

function updateStatus(msg) {
  els.gameStatus.textContent = msg;
}

// Check Win/Lose
function checkWin() {
  if (currentWord.split("").every(ch => ch === " " || guessedLetters.includes(ch))) {
    const points = gameMode === "classic" ? 1 : gameMode === "themed" ? 2 : gameMode === "timed" ? 3 : 1;
    score += points * (6 - wrongGuesses);
    els.scoreValue.textContent = score;
    saveHighScore();
    showResult(true);
  }
}

function checkLose() {
  if (wrongGuesses >= els.hangmanParts.length) {
    showResult(false);
  }
}

// Show Result
function showResult(isWin) {
  clearInterval(timerInterval);
  disableAllKeys();
  els.correctWord.textContent = currentWord;
  // Cập nhật biến trạng thái
  isWinState = isWin;
  
  // Đổi label cho nút Play Again
  els.playAgainButton.textContent = isWin ? "Chơi tiếp" : "Chơi lại";
  
  if (isWin) {
    els.resultEmoji.textContent = "🎉";
    els.resultTitle.textContent = "Chiến thắng!";
    els.resultMessage.textContent = "Bạn đã đoán đúng từ.";
    playSound("win");
    els.resultModal.style.display = "flex";
  } else {
    els.resultEmoji.textContent = "😢";
    els.resultTitle.textContent = "Thất bại!";
    els.resultMessage.textContent = "Bạn đã hết lượt đoán.";
    playSound("lose");
    setTimeout(() => {
      els.resultModal.style.display = "flex";
    }, 2000);
  }
}

// Start Game
function startGame(isCustom = false) {
  resetGameState();
  score = isCustom ? 0 : score;
  els.scoreValue.textContent = score;
  switchPage("game");
  newRound();
}

// Timed Mode Timer
function startTimer() {
  timeLeft = 60;
  els.gameTimer.textContent = "01:00";
  timerInterval = setInterval(() => {
    timeLeft--;
    const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const s = String(timeLeft % 60).padStart(2, "0");
    els.gameTimer.textContent = `${m}:${s}`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showResult(false);
    }
  }, 1000);
}

// Initialization
(function init() {
  switchPage("welcome");
  loadHighScore();
  loadAudioSettings();
  playBackgroundMusic();
  setupInteractionListener();
})();
// 1. Hàm mute/unmute toàn bộ sounds
function setAllSoundsMuted(muted) {
    Object.values(sounds).forEach(snd => {
      snd.muted = muted;
    });
  }
  
  // 2. Lắng nghe khi tab thay đổi trạng thái
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      // Tab đang ẩn: mute toàn bộ âm thanh
      setAllSoundsMuted(true);
    } else {
      // Tab đang active: bỏ mute và resume nhạc nền (nếu đã tương tác)
      setAllSoundsMuted(false);
      if (hasInteracted) {
        // Nếu muốn resume nhạc nền ngay khi quay lại
        sounds.background.play().catch(() => { /* ignore */ });
      }
    }
  });
  function attachHoverSound() {
    // thêm .mode-card vào selector
    document.querySelectorAll(".btn, .key, .mode-card").forEach(el => {
      el.addEventListener("mouseenter", () => {
        if (!el.classList.contains("disabled")) playHover();   // hoặc playCardHover()
      });
    });
  }
  
  // Gọi một lần sau khi trang welcome load
  attachHoverSound();
  function playHover() {
  const snd = sounds.hover;
  if (!snd) return;
  // reset & phát, nhưng giới hạn 1 lần / frame
  if (!snd._playing) {
    snd.currentTime = 0;
    snd.volume = soundFxVolume;
    snd.play();
    snd._playing = true;
    requestAnimationFrame(() => { snd._playing = false; });
  }
}
sounds.cardHover = document.getElementById("cardHoverSound");
function playCardHover() {
  const snd = sounds.cardHover || sounds.hover;     // fallback
  if (!snd) return;
  if (!snd._playing) {
    snd.currentTime = 0;
    snd.volume = soundFxVolume;
    snd.play();
    snd._playing = true;
    requestAnimationFrame(() => (snd._playing = false));
  }
}
const pools = {
  classic   : shuffle([...wordDatabase.classic]),
  animals   : shuffle([...wordDatabase.animals]),
  food      : shuffle([...wordDatabase.food]),
  countries : shuffle([...wordDatabase.countries]),
  sports    : shuffle([...wordDatabase.sports]),
};
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()* (i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}