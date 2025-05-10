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
    if (gameMode !== "team") {
      const modeKey = gameMode === "classic" ? "classic" : gameMode === "timed" ? "timed" : "themed";
      modeStates[modeKey].currentWord = currentWord;
      modeStates[modeKey].currentHint = currentHint;
      modeStates[modeKey].guessedLetters = [...guessedLetters];
      modeStates[modeKey].wrongGuesses = wrongGuesses;
      modeStates[modeKey].score = score;
      modeStates[modeKey].hasPlayed = true;
      modeStates[modeKey].newWordAttempts = newWordAttempts;
    } else {
      resetTeamState();
    }
    resetGameState();
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
      // Đặt lại toàn bộ trạng thái cho chế độ chơi hiện tại
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
  
  document.querySelectorAll("#themePage .mode-card").forEach(card => {
    card.addEventListener("click", () => {
      playClick();
      gameTheme = card.dataset.theme;
      startGame();
    });
  });
  
  document.getElementById("startTeamGameSetupButton").onclick = () => {
    playClick();
    resetTeamState();
    const teamInputs = document.querySelectorAll("#teamSetupPage input[type='text']");
    teamInputs.forEach(input => {
      const teamLetters = ['A', 'B'];
    const teamName = input.value.trim() ||`${teamLetters[parseInt(input.dataset.teamIndex)]}`;
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
  
  document.getElementById("hintButton").onclick = () => {
    const modeKey = gameMode === "classic" ? "classic" : gameMode === "timed" ? "timed" : "themed";
    if (modeStates[modeKey].hintAttemptsTotal <= 0) {
      console.log("No more hint attempts available.");
      return;
    }
  
    playClick();
    provideHint();
    modeStates[modeKey].hintAttemptsTotal--;
    updateHintButton();
  };
  
  document.getElementById("newGameButton").onclick = () => {
    const modeKey = gameMode === "classic" ? "classic" : gameMode === "timed" ? "timed" : "themed";
    if (modeStates[modeKey].newWordAttempts <= 0) {
      console.log("No more new word attempts available.");
      return;
    }
  
    playClick();
    modeStates[modeKey].newWordAttempts--;
    console.log(`New word requested. Remaining attempts: ${modeStates[modeKey].newWordAttempts}`);
    newWordAttempts = modeStates[modeKey].newWordAttempts;
    
    modeStates[modeKey].currentWord = "";
    modeStates[modeKey].currentHint = "";
    modeStates[modeKey].guessedLetters = [];
    modeStates[modeKey].wrongGuesses = 0;
    modeStates[modeKey].hasLost = false;
    
    newRound();
  };
  
  document.getElementById("playAgainButton").onclick = () => {
    playClick();
    console.log("Play again clicked. Hiding result modal.");
    if (els.resultModal) {
      els.resultModal.style.display = "none";
    } else {
      console.error("resultModal element not found.");
    }
  
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
      console.log("Reset score to 0 since the player lost.");
    }
  
    const modeKey = gameMode === "classic" ? "classic" : gameMode === "timed" ? "timed" : "themed";
    modeStates[modeKey].currentWord = "";
    modeStates[modeKey].currentHint = "";
    modeStates[modeKey].guessedLetters = [];
    modeStates[modeKey].wrongGuesses = 0;
    modeStates[modeKey].hasLost = false;
  
    newRound();
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