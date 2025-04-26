export const sounds = {
    background: document.getElementById("backgroundMusic"),
    correct: document.getElementById("correctSound"),
    wrong: document.getElementById("wrongSound"), 
    win: document.getElementById("winSound"),
    lose: document.getElementById("loseSound"),
    click: document.getElementById("clickSound"),
    hover: document.getElementById("hoverSound")
};

let musicVolume = 0.4;
let soundFxVolume = 1;
let hasInteracted = false;

export function loadAudioSettings() {
    musicVolume = localStorage.getItem('musicVolume') || 0.4;
    soundFxVolume = localStorage.getItem('soundFxVolume') || 1;
    sounds.background.volume = musicVolume;
    Object.values(sounds).forEach(sound => {
        if (sound !== sounds.background) sound.volume = soundFxVolume;
    });
    return { musicVolume, soundFxVolume };
}

export function playBackgroundMusic() {
    if (sounds.background) {
        sounds.background.volume = musicVolume;
        sounds.background.play().catch(err => console.error("Lỗi phát nhạc nền:", err));
    }
}

export function playSound(name) {
    const snd = sounds[name];
    if (snd) {
        snd.currentTime = 0;
        snd.volume = soundFxVolume;
        snd.play().catch(err => console.error(`Lỗi phát âm thanh ${name}:`, err));
    }
}

export function playHover() {
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

export function setAllSoundsMuted(muted) {
    Object.values(sounds).forEach(snd => {
        snd.muted = muted;
    });
}

export function updateMusicVolume(value) {
    musicVolume = value;
    sounds.background.volume = musicVolume;
    localStorage.setItem('musicVolume', musicVolume);
}

export function updateSoundFxVolume(value) {
    soundFxVolume = value;
    localStorage.setItem('soundFxVolume', soundFxVolume);
    Object.values(sounds).forEach(sound => {
        if (sound !== sounds.background) sound.volume = soundFxVolume;
    });
}

export function attachHoverSound() {
    document.querySelectorAll(".card-btn, .key, .mode-card, .play-button").forEach(el => {
        el.addEventListener("mouseenter", () => {
            if (!el.classList.contains("disabled")) playHover();
        });
    });
}