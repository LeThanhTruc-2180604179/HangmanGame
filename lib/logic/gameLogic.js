let currentWord = "", currentHint = "";
let guessedLetters = [], wrongGuesses = 0, score = 0;
let highScores = {
  classic: 0,
  timed: 0,
  themed: 0
};
let gameMode = "classic", gameTheme = "";
let timerInterval, timeLeft = 0;
let musicVolume = 0.4, soundFxVolume = 1;
let hasInteracted = false;
let currentSlide = 0;
const totalSlides = 4;
let isWinState = false;
let newWordAttempts = 3;

// Team Mode Variables
let teams = [];
let teamScores = {};
let currentTeamIndex = 0;
let guessingTeamIndex = 1;
let currentRound = 1;
let totalRounds = 6;
let timerDuration = 0;
let playStyle = "custom";

// Lưu trạng thái điểm số, số lần thêm từ mới và trạng thái thua cho từng mode
let modeStates = {
  classic: { score: 0, hasPlayed: false, newWordAttempts: 3, hasLost: false },
  themed: { score: 0, hasPlayed: false, newWordAttempts: 3, hasLost: false },
  timed: { score: 0, hasPlayed: false, newWordAttempts: 3, hasLost: false }
};

const instructions = [
  "Bạn sẽ phải dự đoán các từ khóa theo các gợi ý với các chủ đề mà bạn đã chọn",
  "Nếu bạn chọn chữ cái sai trong từ sẽ hiện phím đỏ, phím xanh cho biết bạn đã đúng",
  "Bạn có 6 lần nhập và cần đoán chính xác cụm từ trước khi 'người treo cổ' được vẽ xong",
  "Người chơi treo cổ sẽ được vẽ khi bạn đoán sai, nếu được vẽ xong thì bạn đã thua cuộc"
];

const pages = {
  welcome: document.getElementById("welcomePage"),
  mode: document.getElementById("modePage"),
  game: document.getElementById("gamePage"),
  teamSetup: document.getElementById("teamSetupPage"),
  teamWordInput: document.getElementById("teamWordInputPage"),
  teamResult: document.getElementById("teamResultPage"),
  theme: document.getElementById("themePage")
};

const els = {
  instructionsSection: document.getElementById("instructionsSection"),
  settingsSection: document.getElementById("settingsSection"),
  scoreSection: document.getElementById("scoreSection"),
  welcomeContent: document.getElementById("welcomeContent"),
  wordDisplay: document.getElementById("wordDisplay"),
  keyboard: document.getElementById("keyboard"),
  gameStatus: document.getElementById("gameStatus"),
  scoreLabel: document.getElementById("scoreLabel"),
  scoreValue: document.getElementById("scoreValue"),
  highScoreLabel: document.getElementById("highScoreLabel"),
  highScoreValue: document.getElementById("highScoreValue"),
  livesValue: document.getElementById("livesValue"),
  gameTimer: document.getElementById("gameTimer"),
  hintText: document.getElementById("hintText"),
  resultModal: document.getElementById("resultModal"),
  resultEmoji: document.getElementById("resultEmoji"),
  resultTitle: document.getElementById("resultTitle"),
  resultMessage: document.getElementById("resultMessage"),
  correctWord: document.getElementById("correctWord"),
  welcomeHighScore: document.getElementById("welcomeHighScore"),
  playButton: document.getElementById("playButton"),
  hangmanParts: [
    document.getElementById("head"),
    document.getElementById("body"),
    document.getElementById("leftArm"),
    document.getElementById("rightArm"),
    document.getElementById("leftLeg"),
    document.getElementById("rightLeg")
  ],
  musicVolume: document.getElementById("musicVolume"),
  soundFxVolume: document.getElementById("soundFxVolume"),
  slider: document.querySelector("#instructionsSlider .slider"),
  prevSlideBtn: document.getElementById("prevSlideBtn"),
  nextSlideBtn: document.getElementById("nextSlideBtn"),
  currentInstruction: document.getElementById("currentInstruction"),
  playAgainButton: document.getElementById("playAgainButton"),
  highScoreClassic: document.getElementById("highScoreClassic"),
  highScoreThemed: document.getElementById("highScoreThemed"),
  highScoreTimed: document.getElementById("highScoreTimed"),
  modeHighScoreClassic: document.getElementById("modeHighScoreClassic"),
  modeHighScoreThemed: document.getElementById("modeHighScoreThemed"),
  modeHighScoreTimed: document.getElementById("modeHighScoreTimed"),
  roundCount: document.getElementById("roundCount"),
  playStyle: document.getElementById("playStyle"),
  timerDuration: document.getElementById("timerDuration"),
  teamWordInputTitle: document.getElementById("teamWordInputTitle"),
  teamScores: document.getElementById("teamScores"),
  teamCustomWord: document.getElementById("teamCustomWord"),
  teamCustomHint: document.getElementById("teamCustomHint"),
  finalTeamScores: document.getElementById("finalTeamScores"),
  winnerAnnouncement: document.getElementById("winnerAnnouncement"),
  newGameButton: document.getElementById("newGameButton"),
  resumeModal: document.getElementById("resumeModal"),
  resumeModalTitle: document.getElementById("resumeModalTitle"),
  resumeModalMessage: document.getElementById("resumeModalMessage"),
  resumeGameButton: document.getElementById("resumeGameButton"),
  newGameButtonModal: document.getElementById("newGameButtonModal")
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

// Load High Scores and Audio Settings
function loadHighScores() {
  highScores.classic = parseInt(localStorage.getItem('highScore_classic')) || 0;
  highScores.timed = parseInt(localStorage.getItem('highScore_timed')) || 0;
  highScores.themed = parseInt(localStorage.getItem('highScore_themed')) || 0;

  els.highScoreClassic.textContent = highScores.classic;
  els.highScoreThemed.textContent = highScores.themed;
  els.highScoreTimed.textContent = highScores.timed;

  els.modeHighScoreClassic.textContent = highScores.classic;
  els.modeHighScoreThemed.textContent = highScores.themed;
  els.modeHighScoreTimed.textContent = highScores.timed;

  const maxHighScore = Math.max(highScores.classic, highScores.timed, highScores.themed);
  els.welcomeHighScore.textContent = maxHighScore;
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
  if (gameMode === "team") return;

  const modeKey = gameMode === "classic" ? "classic" : gameMode === "timed" ? "timed" : "themed";
  if (score > highScores[modeKey]) {
    highScores[modeKey] = score;
    localStorage.setItem(`highScore_${modeKey}`, highScores[modeKey]);
    els.highScoreValue.textContent = highScores[modeKey];
    els[`highScore${modeKey.charAt(0).toUpperCase() + modeKey.slice(1)}`].textContent = highScores[modeKey];
    els[`modeHighScore${modeKey.charAt(0).toUpperCase() + modeKey.slice(1)}`].textContent = highScores[modeKey];
    const maxHighScore = Math.max(highScores.classic, highScores.timed, highScores.themed);
    els.welcomeHighScore.textContent = maxHighScore;
  }

  modeStates[modeKey].score = score;
  modeStates[modeKey].hasPlayed = true;
}

function playBackgroundMusic() {
  if (sounds.background) {
    sounds.background.volume = musicVolume;
    sounds.background.play().catch(err => console.error("Lỗi phát nhạc nền:", err));
  }
}

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
els.playButton.addEventListener("click", () => {
  playClick();
  switchPage("mode");
});

document.getElementById("instructionsButton").onclick = () => {
  playClick();
  els.welcomeContent.style.display = "none";
  els.instructionsSection.style.display = "block";
  els.scoreSection.style.display = "none";
};

document.getElementById("settingsButton").onclick = () => {
  playClick();
  els.welcomeContent.style.display = "none";
  els.settingsSection.style.display = "block";
  els.scoreSection.style.display = "none";
};

document.getElementById("scoreButton").onclick = () => {
  playClick();
  els.welcomeContent.style.display = "none";
  els.scoreSection.style.display = "block";
  els.instructionsSection.style.display = "none";
  els.settingsSection.style.display = "none";
};

document.getElementById("backToWelcomeContentButton").onclick = () => {
  playClick();
  els.welcomeContent.style.display = "block";
  els.instructionsSection.style.display = "none";
};

document.getElementById("backFromSettingsButton").onclick = () => {
  playClick();
  switchPage("welcome");
  els.welcomeContent.style.display = "block";
  els.settingsSection.style.display = "none";
  els.instructionsSection.style.display = "none";
  els.scoreSection.style.display = "none";
};

document.getElementById("backFromScoreButton").onclick = () => {
  playClick();
  els.welcomeContent.style.display = "block";
  els.scoreSection.style.display = "none";
  els.instructionsSection.style.display = "none";
  els.settingsSection.style.display = "none";
};

document.getElementById("backToWelcomeButton").onclick = () => {
  playClick();
  resetGameState();
  switchPage("welcome");
  els.welcomeContent.style.display = "block";
  els.instructionsSection.style.display = "none";
  els.settingsSection.style.display = "none";
  els.scoreSection.style.display = "none";
};

document.getElementById("backToModeButton").onclick = () => {
  playClick();
  resetGameState();
  if (gameMode === "team") {
    resetTeamState();
  }
  switchPage("mode");
};

document.getElementById("backFromTeamSetupButton").onclick = () => {
  playClick();
  resetTeamState();
  switchPage("mode");
};

document.getElementById("backFromTeamWordInputButton").onclick = () => {
  playClick();
  switchPage("teamSetup");
};

document.getElementById("backFromThemeButton").onclick = () => {
  playClick();
  switchPage("mode");
};

document.getElementById("backToHomeButton").onclick = () => {
  playClick();
  if (gameMode !== "team") {
    const modeKey = gameMode === "classic" ? "classic" : gameMode === "timed" ? "timed" : "themed";
    modeStates[modeKey].score = score;
    modeStates[modeKey].hasPlayed = true;
    modeStates[modeKey].newWordAttempts = newWordAttempts;
  } else {
    resetTeamState();
  }
  resetGameState();
  switchPage("welcome");
  els.welcomeContent.style.display = "block";
  els.instructionsSection.style.display = "none";
  els.settingsSection.style.display = "none";
  els.scoreSection.style.display = "none";
};

document.getElementById("backToHomeFromTeamResultButton").onclick = () => {
  playClick();
  resetGameState();
  resetTeamState();
  switchPage("welcome");
  els.welcomeContent.style.display = "block";
  els.instructionsSection.style.display = "none";
  els.settingsSection.style.display = "none";
  els.scoreSection.style.display = "none";
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
document.getElementById("startTeamGameSetupButton").onclick = () => {
  playClick();
  resetTeamState();
  const teamInputs = document.querySelectorAll("#teamSetupPage input[type='text']");
  teamInputs.forEach(input => {
    const teamName = input.value.trim() || `Đội ${parseInt(input.dataset.teamIndex) + 1}`;
    teams.push(teamName);
    teamScores[teamName] = 0;
  });
  totalRounds = parseInt(els.roundCount.value) || 6;
  playStyle = els.playStyle.value || "custom";
  timerDuration = parseInt(els.timerDuration.value) || 0;
  currentRound = 1;
  currentTeamIndex = 0;
  guessingTeamIndex = 1;
  if (playStyle === "custom") {
    showTeamWordInput();
  } else {
    pickRandomWord();
    startGame(true);
  }
};

function showTeamWordInput() {
  els.teamWordInputTitle.textContent = `${teams[currentTeamIndex]} nhập từ cho ${teams[guessingTeamIndex]}`;
  updateTeamScoresDisplay();
  els.teamCustomWord.value = "";
  els.teamCustomHint.value = "";
  switchPage("teamWordInput");
}

function updateTeamScoresDisplay() {
  els.teamScores.innerHTML = "";
  if (teams.length < 2 || !teamScores) {
    els.teamScores.textContent = "Chưa có dữ liệu điểm số";
    return;
  }
  teams.forEach(team => {
    const scoreDiv = document.createElement("div");
    scoreDiv.className = "team-score";
    scoreDiv.textContent = `${team}: ${teamScores[team] || 0}`;
    els.teamScores.appendChild(scoreDiv);
  });
}

document.getElementById("submitTeamWordButton").onclick = () => {
  playClick();
  const wordInput = els.teamCustomWord.value.trim();
  if (!wordInput) {
    alert("Bạn cần nhập từ hoặc cụm từ!");
    return;
  }
  currentWord = wordInput.toUpperCase();
  currentHint = els.teamCustomHint.value.trim() || "";
  startGame(true);
};

// New Game / Play Again
document.getElementById("newGameButton").onclick = () => {
  const modeKey = gameMode === "classic" ? "classic" : gameMode === "timed" ? "timed" : "themed";
  if (modeStates[modeKey].newWordAttempts <= 0) {
    return;
  }

  playClick();
  modeStates[modeKey].newWordAttempts--;
  newRound();
};

document.getElementById("playAgainButton").onclick = () => {
  playClick();
  els.resultModal.style.display = "none";

  if (gameMode === "team") {
    if (currentRound <= totalRounds) {
      if (playStyle === "custom") {
        showTeamWordInput();
      } else {
        pickRandomWord();
        startGame(true);
      }
    } else {
      showTeamResult();
      return;
    }
  }

  if (!isWinState && gameMode !== "team") {
    score = 0;
    els.scoreValue.textContent = score;
  }

  newRound();
};

// Audio Settings
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
  els.slider.style.transform = `translateX(-${currentSlide * 25}%)`;
  els.prevSlideBtn.style.display = currentSlide === 0 ? "none" : "block";
  els.nextSlideBtn.style.display = currentSlide === totalSlides - 1 ? "none" : "block";
  els.currentInstruction.textContent = instructions[currentSlide] || "";
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

function newRound() {
  resetGameState();
  if (gameMode !== "team") {
    pickWord();
  }
  updateWordDisplay();
  initKeyboard();
  updateLives();
  updateStatus("");
  if (gameMode === "timed" || (gameMode === "team" && timerDuration > 0)) startTimer();

  const modeKey = gameMode === "classic" ? "classic" : gameMode === "timed" ? "timed" : "themed";
  
  if (gameMode === "team") {
    if (teams.length < 2) {
      els.scoreLabel.textContent = "Tỉ số: ";
      els.scoreValue.textContent = "Chưa có dữ liệu";
      els.highScoreLabel.textContent = "Lượt chơi: ";
      els.highScoreValue.textContent = "Chưa có dữ liệu";
    } else {
      els.scoreLabel.textContent = "Tỉ số: ";
      els.scoreValue.textContent = `${teams[0]} ${teamScores[teams[0]] || 0} - ${teams[1]} ${teamScores[teams[1]] || 0}`;
      els.highScoreLabel.textContent = "Lượt chơi: ";
      els.highScoreValue.textContent = teams[guessingTeamIndex] || "Chưa xác định";
    }
    els.newGameButton.style.display = "none";
  } else {
    els.scoreLabel.textContent = "Điểm: ";
    els.scoreValue.textContent = score || 0;
    els.highScoreLabel.textContent = "Điểm cao nhất: ";
    els.highScoreValue.textContent = highScores[modeKey] || 0;
    els.newGameButton.style.display = "block";
    newWordAttempts = modeStates[modeKey].newWordAttempts;
    els.newGameButton.textContent = `Thêm từ mới (${newWordAttempts})`;
    if (newWordAttempts <= 0) {
      els.newGameButton.classList.add("disabled");
      els.newGameButton.disabled = true;
    } else {
      els.newGameButton.classList.remove("disabled");
      els.newGameButton.disabled = false;
    }
  }
}

function resetGameState() {
  clearInterval(timerInterval);
  els.gameTimer.textContent = "00:00";
  timeLeft = 0;
  guessedLetters = [];
  wrongGuesses = 0;
  els.hangmanParts.forEach(p => p.style.display = "none");
  els.resultModal.style.display = "none";
  els.resumeModal.style.display = "none";
}

function resetTeamState() {
  teams = [];
  teamScores = {};
  currentTeamIndex = 0;
  guessingTeamIndex = 1;
  currentRound = 1;
  totalRounds = 6;
  timerDuration = 0;
  playStyle = "custom";
}

function pickRandomWord() {
  const key = "classic";
  if (!pools[key].length) {
    pools[key] = shuffle([...wordDatabase[key]]);
  }
  const { word, hint } = pools[key].pop();
  currentWord = word;
  currentHint = hint;
}

function pickWord() {
  const key = (gameMode === "classic" || gameMode === "timed") ? "classic" : gameTheme;
  if (!pools[key].length) {
    pools[key] = shuffle([...wordDatabase[key]]);
  }
  const { word, hint } = pools[key].pop();
  currentWord = word;
  currentHint = hint;
}

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

function checkWin() {
  if (currentWord.split("").every(ch => ch === " " || guessedLetters.includes(ch))) {
    if (gameMode !== "team") {
      const points = gameMode === "classic" ? 1 : gameMode === "timed" ? 3 : 2;
      score += points * (6 - wrongGuesses);
      els.scoreValue.textContent = score;
      saveHighScore();
    }
    showResult(true);
  }
}

function checkLose() {
  if (wrongGuesses >= els.hangmanParts.length) {
    showResult(false);
  }
}

function showResult(isWin) {
  clearInterval(timerInterval);
  disableAllKeys();
  els.correctWord.textContent = currentWord;
  isWinState = isWin;

  if (gameMode === "team") {
    if (isWin) {
      teamScores[teams[guessingTeamIndex]] = (teamScores[teams[guessingTeamIndex]] || 0) + 2;
    }
    updateTeamScoresDisplay();
    if (teams.length >= 2) {
      els.scoreValue.textContent = `${teams[0]} ${teamScores[teams[0]] || 0} - ${teams[1]} ${teamScores[teams[1]] || 0}`;
    } else {
      els.scoreValue.textContent = "Chưa có dữ liệu";
    }

    currentRound++;
    if (currentRound > totalRounds) {
      els.playAgainButton.textContent = "Xem kết quả";
    } else {
      const temp = currentTeamIndex;
      currentTeamIndex = guessingTeamIndex;
      guessingTeamIndex = temp;
      if (guessingTeamIndex >= teams.length) guessingTeamIndex = 0;
      if (currentTeamIndex >= teams.length) currentTeamIndex = 0;
      els.playAgainButton.textContent = "Tiếp tục vòng tiếp theo";
    }
  } else {
    els.playAgainButton.textContent = isWin ? "Chơi tiếp" : "Chơi lại";
  }

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
    if (gameMode !== "team") {
      const modeKey = gameMode === "classic" ? "classic" : gameMode === "timed" ? "timed" : "themed";
      modeStates[modeKey].hasLost = true;
      modeStates[modeKey].score = 0;
      modeStates[modeKey].hasPlayed = false;
      score = 0;
      els.scoreValue.textContent = score;
    }
    setTimeout(() => {
      els.resultModal.style.display = "flex";
    }, 2000);
  }
}

function showTeamResult() {
  els.finalTeamScores.innerHTML = "";
  teams.forEach(team => {
    const scoreDiv = document.createElement("div");
    scoreDiv.className = "team-score";
    scoreDiv.textContent = `${team}: ${teamScores[team] || 0}`;
    els.finalTeamScores.appendChild(scoreDiv);
  });

  let winner = teams[0];
  let highestScore = teamScores[winner] || 0;
  let isTie = false;
  teams.forEach(team => {
    const teamScore = teamScores[team] || 0;
    if (teamScore > highestScore) {
      winner = team;
      highestScore = teamScore;
      isTie = false;
    } else if (teamScore === highestScore && team !== winner) {
      isTie = true;
    }
  });

  if (isTie) {
    els.winnerAnnouncement.textContent = "Hòa! Không có đội nào thắng.";
  } else {
    els.winnerAnnouncement.textContent = `${winner} chiến thắng với ${highestScore} điểm!`;
  }

  switchPage("teamResult");
}

function startGame(isCustom = false) {
  const modeKey = gameMode === "classic" ? "classic" : gameMode === "timed" ? "timed" : "themed";

  if (gameMode !== "team" && modeStates[modeKey].hasPlayed && !isCustom) {
    els.resumeModal.style.display = "flex";
    els.resumeModalTitle.textContent = "Tiếp tục chơi?";
    els.resumeModalMessage.textContent = `Bạn đã có ${modeStates[modeKey].score} điểm ở chế độ này. Tiếp tục chơi để giữ điểm hoặc chơi mới để reset điểm.`;

    els.resumeGameButton.onclick = () => {
      playClick();
      els.resumeModal.style.display = "none";
      if (modeStates[modeKey].hasLost) {
        score = 0;
        modeStates[modeKey].score = 0;
        modeStates[modeKey].hasLost = false;
      } else {
        score = modeStates[modeKey].score;
      }
      newWordAttempts = modeStates[modeKey].newWordAttempts;
      resetGameState();
      newRound();
      switchPage("game");
    };

    els.newGameButtonModal.onclick = () => {
      playClick();
      els.resumeModal.style.display = "none";
      score = 0;
      modeStates[modeKey].score = 0;
      modeStates[modeKey].hasPlayed = false;
      modeStates[modeKey].newWordAttempts = 3;
      modeStates[modeKey].hasLost = false;
      newWordAttempts = 3;
      resetGameState();
      newRound();
      switchPage("game");
    };
  } else {
    resetGameState();
    if (gameMode !== "team") {
      score = isCustom ? 0 : score;
      modeStates[modeKey].newWordAttempts = 3;
      modeStates[modeKey].hasLost = false;
      newWordAttempts = 3;

      els.scoreLabel.textContent = "Điểm: ";
      els.scoreValue.textContent = score || 0;
      els.highScoreLabel.textContent = "Điểm cao nhất: ";
      els.highScoreValue.textContent = highScores[modeKey] || 0;
    } else {
      score = 0;
      updateTeamScoresDisplay();
      if (teams.length >= 2) {
        els.scoreLabel.textContent = "Tỉ số: ";
        els.scoreValue.textContent = `${teams[0]} ${teamScores[teams[0]] || 0} - ${teams[1]} ${teamScores[teams[1]] || 0}`;
        els.highScoreLabel.textContent = "Lượt chơi: ";
        els.highScoreValue.textContent = teams[guessingTeamIndex] || "Chưa xác định";
      } else {
        els.scoreLabel.textContent = "Tỉ số: ";
        els.scoreValue.textContent = "Chưa có dữ liệu";
        els.highScoreLabel.textContent = "Lượt chơi: ";
        els.highScoreValue.textContent = "Chưa có dữ liệu";
      }
    }

    newRound();
    switchPage("game");
  }
}

function startTimer() {
  timeLeft = gameMode === "timed" ? 60 : timerDuration;
  const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const s = String(timeLeft % 60).padStart(2, "0");
  els.gameTimer.textContent = `${m}:${s}`;
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

(function init() {
  switchPage("welcome");
  loadHighScores();
  loadAudioSettings();
  playBackgroundMusic();
  setupInteractionListener();
})();

function setAllSoundsMuted(muted) {
  Object.values(sounds).forEach(snd => {
    snd.muted = muted;
  });
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    setAllSoundsMuted(true);
  } else {
    setAllSoundsMuted(false);
    if (hasInteracted) {
      sounds.background.play().catch(() => {});
    }
  }
});

function attachHoverSound() {
  document.querySelectorAll(".card-btn, .key, .mode-card, .play-button").forEach(el => {
    el.addEventListener("mouseenter", () => {
      if (!el.classList.contains("disabled")) playHover();
    });
  });
}

attachHoverSound();

function playHover() {
  const snd = sounds.hover;
  if (!snd) return;
  if (!snd._playing) {
    snd.currentTime = 0;
    snd.volume = soundFxVolume;
    snd.play();
    snd._playing = true;
    requestAnimationFrame(() => { snd._playing = false; });
  }
}

const pools = {
  classic: shuffle([...wordDatabase.classic]),
  animals: shuffle([...wordDatabase.animals]),
  food: shuffle([...wordDatabase.food]),
  countries: shuffle([...wordDatabase.countries]),
  sports: shuffle([...wordDatabase.sports]),
};

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}