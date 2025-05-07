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
  
function initKeyboard() {
    els.keyboard.innerHTML = "";
    if (!currentWord) {
      console.error("currentWord is empty in initKeyboard. Cannot initialize keyboard.");
      return;
    }
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(ch => {
      const key = document.createElement("div");
      key.className = "key";
      key.textContent = ch;
      const isGuessed = guessedLetters.includes(ch);
      const classToAdd = isGuessed ? (currentWord.includes(ch) ? "correct" : "wrong") : "enabled";
      key.classList.add(classToAdd);
      if (isGuessed) key.classList.add("disabled");
      key.addEventListener("click", () => handleGuess(ch, key));
      els.keyboard.appendChild(key);
    });
    console.log("Keyboard initialized successfully.");
}
  
function disableAllKeys() {
    document.querySelectorAll(".key").forEach(k => k.classList.add("disabled"));
}
  
function updateHintButton() {
    const modeKey = gameMode === "classic" ? "classic" : gameMode === "timed" ? "timed" : "themed";
    els.hintButton.textContent = `Gợi ý từ khóa (${modeStates[modeKey].hintAttemptsTotal})`;
    if (modeStates[modeKey].hintAttemptsTotal <= 0) {
      els.hintButton.classList.add("disabled");
      els.hintButton.disabled = true;
    } else {
      els.hintButton.classList.remove("disabled");
      els.hintButton.disabled = false;
    }
}
  
function updateNewGameButton() {
    const modeKey = gameMode === "classic" ? "classic" : gameMode === "timed" ? "timed" : "themed";
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
  
function provideHint() {
    const modeKey = gameMode === "classic" ? "classic" : gameMode === "timed" ? "timed" : "themed";
    const unguessedLetters = currentWord.split("").filter(ch => ch !== " " && !guessedLetters.includes(ch));
    if (unguessedLetters.length === 0) {
      console.log("No unguessed letters to provide as hint.");
      return;
    }
  
    const randomIndex = Math.floor(Math.random() * unguessedLetters.length);
    const letterToReveal = unguessedLetters[randomIndex];
  
    if (!guessedLetters.includes(letterToReveal)) {
      guessedLetters.push(letterToReveal);
      modeStates[modeKey].guessedLetters = [...guessedLetters];
    }
  
    updateWordDisplay();
    initKeyboard();
    checkWin();
}
  
function newRound(isResuming = false) {
    const modeKey = gameMode === "classic" ? "classic" : gameMode === "timed" ? "timed" : "themed";
    
    clearInterval(timerInterval);
    els.gameTimer.textContent = "00:00";
    timeLeft = 0;
    
    if (!isResuming) {
        // Only reset hangman parts if starting a new round, not resuming
        els.hangmanParts.forEach(p => {
            p.style.display = "none";
            p.setAttribute('stroke', 'white');
            p.setAttribute('fill', p.id === 'head' ? '#fff' : 'none');
        });
        const personGroup = document.getElementById('personGroup');
        personGroup.classList.remove('dead');
        document.getElementById('faceSmile').style.display = 'block';
        document.getElementById('faceDead').style.display = 'none';
        personGroup.style.display = 'none';
    } else {
        // Restore hangman parts based on wrongGuesses when resuming
        for (let i = 0; i < wrongGuesses && i < els.hangmanParts.length; i++) {
            els.hangmanParts[i].style.display = "block";
        }
        if (wrongGuesses > 0) {
            document.getElementById('personGroup').style.display = 'block';
        }
    }

    if (els.resultModal) els.resultModal.style.display = "none";
    if (els.resumeModal) els.resumeModal.style.display = "none";
  
    if (gameMode !== "team") {
        if (!modeStates[modeKey].currentWord || modeStates[modeKey].hasLost) {
            pickWord();
            if (!currentWord) {
                console.error("pickWord failed to set currentWord.");
                alert("Đã hết từ để chơi ở chế độ này! Vui lòng chọn chế độ khác.");
                modeStates[modeKey].hasPlayed = false;
                modeStates[modeKey].newWordAttempts = 3;
                modeStates[modeKey].hintAttemptsTotal = 6;
                modeStates[modeKey].hasLost = false;
                modeStates[modeKey].currentWord = "";
                modeStates[modeKey].currentHint = "";
                modeStates[modeKey].guessedLetters = [];
                modeStates[modeKey].wrongGuesses = 0;
                resetGameState();
                switchPage("mode");
                return;
            }
            guessedLetters = [];
            wrongGuesses = 0;
            modeStates[modeKey].currentWord = currentWord;
            modeStates[modeKey].currentHint = currentHint;
            modeStates[modeKey].guessedLetters = [];
            modeStates[modeKey].wrongGuesses = 0;
            modeStates[modeKey].hasLost = false;
        } else {
            currentWord = modeStates[modeKey].currentWord;
            currentHint = modeStates[modeKey].currentHint;
            guessedLetters = [...modeStates[modeKey].guessedLetters];
            wrongGuesses = modeStates[modeKey].wrongGuesses;
        }
        console.log(`newRound: mode=${gameMode}, currentWord=${currentWord}, guessedLetters=${guessedLetters}, wrongGuesses=${wrongGuesses}`);
    } else {
        guessedLetters = [];
        wrongGuesses = 0;
    }
  
    updateWordDisplay();
    initKeyboard();
    updateLives();
    updateStatus("");
    if (gameMode === "timed" || (gameMode === "team" && timerDuration > 0)) startTimer();
  
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
        els.hintButton.style.display = "none";
    } else {
        els.scoreLabel.textContent = "Điểm: ";
        els.scoreValue.textContent = score || 0;
        els.highScoreLabel.textContent = "Điểm cao nhất: ";
        els.highScoreValue.textContent = highScores[modeKey] || 0;
        els.newGameButton.style.display = "block";
        els.hintButton.style.display = "block";
        updateNewGameButton();
        updateHintButton();
        console.log(`Updated newGameButton: text=${els.newGameButton.textContent}, disabled=${els.newGameButton.disabled}`);
    }
}
  
function resetGameState() {
    clearInterval(timerInterval);
    els.gameTimer.textContent = "00:00";
    timeLeft = 0;
    guessedLetters = [];
    wrongGuesses = 0;
    els.hangmanParts.forEach(p => {
        p.style.display = "none";
        p.setAttribute('stroke', 'white');
        p.setAttribute('fill', p.id === 'head' ? '#fff' : 'none');
    });
    const personGroup = document.getElementById('personGroup');
    personGroup.classList.remove('dead');
    document.getElementById('faceSmile').style.display = 'block';
    document.getElementById('faceDead').style.display = 'none';
    personGroup.style.display = 'none';
    if (els.resultModal) els.resultModal.style.display = "none";
    if (els.resumeModal) els.resumeModal.style.display = "none";
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
    if (!pools[key] || !pools[key].length) {
      pools[key] = shuffle([...(wordDatabase[key] || [])]);
    }
    if (!pools[key].length) {
      console.error("No words available in pool for key:", key);
      return false;
    }
    const { word, hint } = pools[key].pop();
    currentWord = word;
    currentHint = hint;
    console.log(`pickRandomWord: selected word=${currentWord}, hint=${currentHint}`);
    return true;
}
  
function pickWord() {
    const key = (gameMode === "classic" || gameMode === "timed") ? "classic" : gameTheme;
    if (!pools[key] || !pools[key].length) {
      if (!wordDatabase[key] || !wordDatabase[key].length) {
        console.error(`wordDatabase[${key}] is empty or undefined`);
        return false;
      }
      pools[key] = shuffle([...wordDatabase[key]]);
    }
    if (!pools[key].length) {
      console.error("No words available in pool for key:", key);
      return false;
    }
    const { word, hint } = pools[key].pop();
    currentWord = word;
    currentHint = hint;
    console.log(`pickWord: selected word=${currentWord}, hint=${currentHint}`);
    return true;
}
  
function updateWordDisplay() {
    els.hintText.textContent = currentHint || "Không có gợi ý";
    els.wordDisplay.innerHTML = "";
    if (!currentWord) {
      console.error("currentWord is empty in updateWordDisplay");
      return;
    }
    currentWord.split("").forEach(ch => {
      const box = document.createElement("div");
      box.className = "letter-box";
      box.textContent = guessedLetters.includes(ch) || ch === " " ? ch : "";
      if (ch === " ") box.style.borderBottom = "none";
      els.wordDisplay.appendChild(box);
    });
    console.log("Word display updated successfully.");
}
  
function handleGuess(letter, keyEl) {
    if (guessedLetters.includes(letter) || keyEl.classList.contains("disabled")) return;
    guessedLetters.push(letter);
    
    const modeKey = gameMode === "classic" ? "classic" : gameMode === "timed" ? "timed" : "themed";
    if (gameMode !== "team") {
      modeStates[modeKey].guessedLetters = [...guessedLetters];
    }
    
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
      const partEl = els.hangmanParts[wrongGuesses];
      showHangmanPart(partEl);
    }
    wrongGuesses++;
  
    const modeKey = gameMode === 'classic' ? 'classic' : gameMode === 'timed' ? 'timed' : 'themed';
    if (gameMode !== "team") {
      modeStates[modeKey].wrongGuesses = wrongGuesses;
    }
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
        modeStates[modeKey].currentWord = "";
        modeStates[modeKey].currentHint = "";
        modeStates[modeKey].guessedLetters = [];
        modeStates[modeKey].wrongGuesses = 0;
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
  
    if (gameMode !== "team" && modeStates[modeKey].hasPlayed && !modeStates[modeKey].hasLost && !isCustom) {
      els.resumeModal.style.display = "flex";
      els.resumeModalTitle.textContent = "Tiếp tục chơi?";
      els.resumeModalMessage.textContent = `Bạn đã có ${modeStates[modeKey].score} điểm ở chế độ này. Tiếp tục chơi để giữ điểm hoặc chơi mới để reset điểm.`;
  
      els.resumeGameButton.onclick = () => {
        playClick();
        els.resumeModal.style.display = "none";
        score = modeStates[modeKey].score;
        currentWord = modeStates[modeKey].currentWord || "";
        currentHint = modeStates[modeKey].currentHint || "";
        guessedLetters = [...modeStates[modeKey].guessedLetters];
        wrongGuesses = modeStates[modeKey].wrongGuesses;
        newWordAttempts = modeStates[modeKey].newWordAttempts;
        newRound(true); // Pass isResuming=true to restore hangman parts
        switchPage("game");
      };
  
      els.newGameButtonModal.onclick = () => {
        playClick();
        els.resumeModal.style.display = "none";
        score = 0;
        modeStates[modeKey].score = 0;
        modeStates[modeKey].hasPlayed = false;
        modeStates[modeKey].newWordAttempts = 3;
        modeStates[modeKey].hintAttemptsTotal = 6;
        modeStates[modeKey].hasLost = false;
        modeStates[modeKey].currentWord = "";
        modeStates[modeKey].currentHint = "";
        modeStates[modeKey].guessedLetters = [];
        modeStates[modeKey].wrongGuesses = 0;
        newWordAttempts = 3;
        newRound();
        switchPage("game");
      };
    } else {
      if (gameMode !== "team") {
        score = 0;
        modeStates[modeKey].score = 0;
        modeStates[modeKey].hasPlayed = false;
        modeStates[modeKey].newWordAttempts = 3;
        modeStates[modeKey].hintAttemptsTotal = 6;
        modeStates[modeKey].hasLost = false;
        modeStates[modeKey].currentWord = "";
        modeStates[modeKey].currentHint = "";
        modeStates[modeKey].guessedLetters = [];
        modeStates[modeKey].wrongGuesses = 0;
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
  
function updateSlider() {
    els.slider.style.transform = `translateX(-${currentSlide * 25}%)`;
    els.prevSlideBtn.style.display = currentSlide === 0 ? "none" : "block";
    els.nextSlideBtn.style.display = currentSlide === totalSlides - 1 ? "none" : "block";
    els.currentInstruction.textContent = instructions[currentSlide] || "";
}
  
function markDead() {
    const person = document.getElementById('personGroup');
    person.classList.add('dead');
    document.getElementById('faceSmile').style.display = 'none';
    document.getElementById('faceDead').style.display = 'block';
}
  
function showHangmanPart(partEl) {
    partEl.style.display = 'block';
    if (partEl.id === 'head') {
      document.getElementById('personGroup').style.display = 'block';
    }
    if (partEl.id === 'rightLeg') {
      markDead();
    }
}