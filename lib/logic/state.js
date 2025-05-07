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

let teams = [];
let teamScores = {};
let currentTeamIndex = 0;
let guessingTeamIndex = 1;
let currentRound = 1;
let totalRounds = 6;
let timerDuration = 0;
let playStyle = "custom";

let modeStates = {
  classic: { 
    score: 0, 
    hasPlayed: false, 
    newWordAttempts: 3, 
    hintAttemptsTotal: 6,
    hasLost: false, 
    currentWord: "", 
    currentHint: "", 
    guessedLetters: [], 
    wrongGuesses: 0 
  },
  themed: { 
    score: 0, 
    hasPlayed: false, 
    newWordAttempts: 3, 
    hintAttemptsTotal: 6,
    hasLost: false, 
    currentWord: "", 
    currentHint: "", 
    guessedLetters: [], 
    wrongGuesses: 0 
  },
  timed: { 
    score: 0, 
    hasPlayed: false, 
    newWordAttempts: 3, 
    hintAttemptsTotal: 6,
    hasLost: false, 
    currentWord: "", 
    currentHint: "", 
    guessedLetters: [], 
    wrongGuesses: 0 
  }
};

const instructions = [
  "Bạn sẽ phải dự đoán các từ khóa theo các gợi ý với các chủ đề mà bạn đã chọn",
  "Nếu bạn chọn chữ cái sai trong từ sẽ hiện phím đỏ, phím xanh cho biết bạn đã đúng",
  "Bạn có 6 lần nhập và cần đoán chính xác cụm từ trước khi 'người treo cổ' được vẽ xong",
  "Người chơi treo cổ sẽ được vẽ khi bạn đoán sai, nếu được vẽ xong thì bạn đã thua cuộc"
];

const pools = {
  classic: shuffle([...(wordDatabase.classic || [])]),
  animals: shuffle([...(wordDatabase.animals || [])]),
  food: shuffle([...(wordDatabase.food || [])]),
  countries: shuffle([...(wordDatabase.countries || [])]),
  sports: shuffle([...(wordDatabase.sports || [])]),
};


