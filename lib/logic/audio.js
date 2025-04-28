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
  
  function playBackgroundMusic() {
    if (sounds.background) {
      sounds.background.volume = musicVolume;
      sounds.background.play().catch(err => console.error("Lỗi phát nhạc nền:", err));
    }
  }
  
  function playSound(name) {
    const snd = sounds[name];
    if (snd) {
      snd.currentTime = 0;
      snd.volume = soundFxVolume;
      snd.play().catch(err => console.error(`Lỗi phát âm thanh ${name}:`, err));
    }
  }
  
  const playClick = () => playSound("click");
  
  function setAllSoundsMuted(muted) {
    Object.values(sounds).forEach(snd => {
      snd.muted = muted;
    });
  }
  
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