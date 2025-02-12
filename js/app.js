const difficultyButtons = document.querySelectorAll('.btn');
const startButton = document.querySelector('.start-button');
const mainMenu = document.querySelector('.main');
const gameContainer = document.querySelector('#game-container');

let selectedWord = '';
let displayedWord = [];
let wrongLetters = [];
let errors = 0;
const maxErrors = 6;
let currentHint = '';
let currentDifficulty = '';

// Stats
let stats = {
  wins: 0,
  losses: 0,
  currentStreak: 0
};

// references
const wordContainer = document.getElementById('word-container');
const wrongLettersList = document.getElementById('wrong-letters-list');
const canvas = document.getElementById('hangman-canvas');
const ctx = canvas.getContext('2d');

// words to guess
const words = {
  easy: [
    { word: 'kot', hint: 'Domowy pupil, który mruczy' },
    { word: 'pies', hint: 'Najlepszy przyjaciel człowieka' },
    { word: 'dom', hint: 'Miejsce gdzie mieszkamy' },
    { word: 'sok', hint: 'Napój z owoców' },
    { word: 'rower', hint: 'Pojazd na dwóch kołach' },
    { word: 'mleko', hint: 'Biały napój od krowy' },
    { word: 'chleb', hint: 'Podstawowy wypiek z mąki' },
    { word: 'zupa', hint: 'Gorące danie w płynie' }
  ],
  medium: [
    { word: 'komputer', hint: 'Urządzenie elektroniczne do pracy i rozrywki' },
    { word: 'telefon', hint: 'Służy do komunikacji' },
    { word: 'telewizor', hint: 'Pokazuje programy i filmy' },
    { word: 'samochód', hint: 'Czterokołowy środek transportu' },
    { word: 'czekolada', hint: 'Słodki przysmak z kakao' },
    { word: 'internet', hint: 'Globalna sieć komputerowa' },
    { word: 'słońce', hint: 'Świeci na niebie w dzień' },
    { word: 'księżyc', hint: 'Świeci na niebie w nocy' }
  ],
  hard: [
    { word: 'województwo', hint: 'Jednostka podziału administracyjnego Polski' },
    { word: 'encyklopedia', hint: 'Książka zawierająca zbiór wiedzy' },
    { word: 'mikroskop', hint: 'Przyrząd do oglądania małych obiektów' },
    { word: 'temperatura', hint: 'Określa jak ciepło lub zimno jest na zewnątrz' },
    { word: 'klawiatura', hint: 'Służy do wpisywania tekstu' },
    { word: 'demokracja', hint: 'System rządów większości' },
    { word: 'technologia', hint: 'Nauka o metodach wytwarzania' },
    { word: 'fotografia', hint: 'Sztuka robienia zdjęć' }
  ]
};

// Keyboard handling
document.addEventListener('keydown', (event) => {
  if (gameContainer.classList.contains('hidden')) return;

  const letter = event.key.toLowerCase();
  if (/^[a-ząćęłńóśźż]$/.test(letter)) {
    handleLetterClick(letter);
  }
});

for (const button of difficultyButtons) {
  button.addEventListener('click', () => {
    for (const btn of difficultyButtons) {
      btn.classList.remove('selected');
    }
    button.classList.add('selected');
  });
}

const HANGMAN_PARTS = [
  // Podstawa
  () => {
    ctx.beginPath();
    ctx.moveTo(50, 250);
    ctx.lineTo(150, 250);
    ctx.moveTo(100, 250);
    ctx.lineTo(100, 50);
    ctx.lineTo(200, 50);
    ctx.lineTo(200, 80);
    ctx.stroke();
  },
  // Głowa
  () => {
    ctx.beginPath();
    ctx.arc(200, 100, 20, 0, Math.PI * 2);
    ctx.stroke();
  },
  // Tułów
  () => {
    ctx.beginPath();
    ctx.moveTo(200, 120);
    ctx.lineTo(200, 180);
    ctx.stroke();
  },
  // Lewa ręka
  () => {
    ctx.beginPath();
    ctx.moveTo(200, 140);
    ctx.lineTo(160, 160);
    ctx.stroke();
  },
  // Prawa ręka
  () => {
    ctx.beginPath();
    ctx.moveTo(200, 140);
    ctx.lineTo(240, 160);
    ctx.stroke();
  },
  // Lewa noga
  () => {
    ctx.beginPath();
    ctx.moveTo(200, 180);
    ctx.lineTo(170, 220);
    ctx.stroke();
  },
  // Prawa noga
  () => {
    ctx.beginPath();
    ctx.moveTo(200, 180);
    ctx.lineTo(230, 220);
    ctx.stroke();
  }
];

function initCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 3;
}

function drawHangman() {
  if (errors > 0 && errors <= HANGMAN_PARTS.length) {
    HANGMAN_PARTS[errors - 1]();
  }
}

function updateWordDisplay() {
  wordContainer.innerHTML = displayedWord
    .map(letter => `<span class="letter-space">${letter}</span>`)
    .join('');
}

function updateGameStats() {
  if (!currentDifficulty) {
    const selectedDifficultyButton = document.querySelector('.btn.selected');
    currentDifficulty = selectedDifficultyButton ? selectedDifficultyButton.id : 'brak';
  }

  const statsHTML = `
        <div class="difficulty">Poziom trudności: <span>${currentDifficulty}</span></div>
        <div class="attempts">Pozostało prób: <span>${maxErrors - errors}</span></div>
        <div class="streak">Seria zwycięstw: <span>${stats.currentStreak}</span></div>
        <div class="score">Wygrane: <span>${stats.wins}</span> | Przegrane: <span>${stats.losses}</span></div>
    `;

  let statsDiv = document.querySelector('.game-stats');
  if (!statsDiv) {
    statsDiv = document.createElement('div');
    statsDiv.classList.add('game-stats');
    document.querySelector('#game-container').insertBefore(statsDiv, document.querySelector('.game-wrapper'));
  }
  statsDiv.innerHTML = statsHTML;
}
function showModal(title, message, showReplayButton = true) {
  const modal = document.getElementById('game-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const modalButton = document.getElementById('modal-button');
  const modalClose = document.getElementById('modal-close');

  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modal.classList.remove('hidden');

  if (showReplayButton) {
    modalButton.style.display = 'inline-block';
    modalButton.onclick = () => {
      modal.classList.add('hidden');
      resetGame();
    };
  } else {
    modalButton.style.display = 'none';
    modalClose.onclick = () => {
      modal.classList.add('hidden');
    }
  }
}

function generateKeyboard() {
  const keyboardContainer = document.getElementById('keyboard');
  const letters = 'aąbcćdeęfghijklłmnńoóprsśtuwyzźż'.split('');

  keyboardContainer.innerHTML = '';

  letters.forEach(letter => {
    const button = document.createElement('button');
    button.classList.add('key');
    button.textContent = letter.toUpperCase();
    button.setAttribute('data-letter', letter);
    button.addEventListener('click', () => handleLetterClick(letter));
    keyboardContainer.appendChild(button);
  });
}

function handleLetterClick(letter) {
  const button = document.querySelector(`[data-letter="${letter}"]`);
  if (button && button.classList.contains('disabled')) return;

  if (button) {
    button.classList.add('disabled');
  }

  if (selectedWord.includes(letter)) {
    selectedWord.split('').forEach((char, index) => {
      if (char === letter) {
        displayedWord[index] = letter;
      }
    });

    updateWordDisplay();

    if (!displayedWord.includes('_')) {
      stats.wins++;
      stats.currentStreak++;
      showModal('Gratulacje!', `Odgadłeś słowo: ${selectedWord}`, true);
      wordContainer.classList.add('win-animation');
      setTimeout(() => wordContainer.classList.remove('win-animation'), 500);
    }
  } else {
    if (!wrongLetters.includes(letter)) {
      wrongLetters.push(letter);
      wrongLettersList.textContent = wrongLetters.join(', ');
      errors++;
      drawHangman();
      updateGameStats();

      if (errors >= maxErrors) {
        stats.losses++;
        stats.currentStreak = 0;
        showModal('Przegrana!', `Prawidłowe słowo to: ${selectedWord}`, false);
        wordContainer.classList.add('lose-animation');
        setTimeout(() => wordContainer.classList.remove('lose-animation'), 500);
      }
    }
  }
}

function resetGame() {
  generateKeyboard();

  const selectedDifficultyButton = document.querySelector('.btn.selected');
  const difficulty = selectedDifficultyButton ? selectedDifficultyButton.id : 'brak';
  currentDifficulty = difficulty;

  const randomWordObj = words[difficulty][Math.floor(Math.random() * words[difficulty].length)];
  selectedWord = randomWordObj.word.toLowerCase();
  currentHint = randomWordObj.hint;

  displayedWord = selectedWord.split('').map(() => '_');
  wrongLetters = [];
  errors = 0;

  updateWordDisplay();
  updateGameStats();
  wrongLettersList.textContent = '';

  initCanvas();
}

function startGame() {
  const selectedDifficultyButton = document.querySelector('.btn.selected');
  if (!selectedDifficultyButton) {
    alert('Proszę wybierz poziom trudności!');
    return;
  }

  const difficulty = selectedDifficultyButton.id;
  currentDifficulty = difficulty;

  generateKeyboard();
  const randomWordObj = words[difficulty][Math.floor(Math.random() * words[difficulty].length)];
  selectedWord = randomWordObj.word.toLowerCase();
  currentHint = randomWordObj.hint;

  displayedWord = selectedWord.split('').map(() => '_');
  wrongLetters = [];
  errors = 0;

  updateWordDisplay();
  updateGameStats();
  wrongLettersList.textContent = '';

  mainMenu.classList.add('hidden');
  gameContainer.classList.remove('hidden');

  initCanvas();
}

// start game
startButton.addEventListener('click', startGame);

// Modal HTML
const modalHTML = `
<div id="game-modal" class="modal hidden">
    <div class="modal-content">
        <h2 id="modal-title" class="modal-title"></h2>
        <p id="modal-message"></p>
        <button id="modal-button">Zagraj ponownie</button>
        <button id="modal-close">Zamknij</button>
    </div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', modalHTML);

// Modal styles
const modalStyles = `
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 30px;
    border-radius: 15px;
    text-align: center;
    max-width: 80%;
    animation: modalAppear 0.3s ease;
}

@keyframes modalAppear {
    from { transform: scale(0.7); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.modal.hidden {
    display: none;
}

#modal-button, #modal-close {
    background: #9796f0;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

#modal-button:hover, #modal-close:hover {
    background: #fbc7d4;
    transform: scale(1.05);
}
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);

// Add hint button
const hintButton = `<button id="hint-button" class="btn">Podpowiedź</button>`;
document.querySelector('#wrong-letters').insertAdjacentHTML('afterend', hintButton);

// Hint handling
document.getElementById('hint-button').onclick = () => {
  showModal('Podpowiedź', currentHint, false);
};
