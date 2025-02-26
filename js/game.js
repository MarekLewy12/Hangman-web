const difficultyButtons = document.querySelectorAll('.difficulty-buttons .btn');
const startButton = document.querySelector('.start-button');
const mainMenu = document.querySelector('.main');
const gameContainer = document.querySelector('#game-container');

let selectedWord = '';
let displayedWord = [];
let wrongLetters = [];
let errors = 0;
let maxErrors = 0;
let currentHint = '';
let currentDifficulty = '';
let timerInterval = null;
let currentMode = 'classic';

function cleanupTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  const timerDisplay = document.getElementById('timer-display');
  if (timerDisplay) {
    timerDisplay.remove();
  }
}


// Stats
let stats = {
  wins: 0,
  losses: 0,
  currentStreak: 0
};

let wordContainer, wrongLettersList, canvas, ctx;

// references to game elements for easier access and error handling
const initGameReferences = () => {
  wordContainer = document.getElementById('word-container');
  wrongLettersList = document.getElementById('wrong-letters-list');
  canvas = document.getElementById('hangman-canvas');

  if (canvas) {
    ctx = canvas.getContext('2d');
  } else {
    console.error('Canvas element not found');
  }
}

// Game modes
const gameModes = {
  classic: {
    name: 'Klasyczny',
    maxErrors: 7,
    setup: () => {
      return {
        maxErrors: 7,
        showHints: true,
        wordDisplay: 'normal'
      };
    }
  },
  noMistake: {
    name: 'Bez błędów',
    maxErrors: 1,
    setup: () => {
      return {
        maxErrors: 1,
        showHints: true,
        wordDisplay: 'normal'
      };
    }
  },
  noHints: {
    name: 'Bez podpowiedzi',
    maxErrors: 7,
    setup: () => {
      return {
        maxErrors: 7,
        showHints: false,
        wordDisplay: 'reversed'
      };
    }
  },
  express: {
    name: 'Ekspres!',
    maxErrors: 7,
    setup: () => {
      return {
        maxErrors: 7,
        showHints: true,
        wordDisplay: 'normal',
        timeLimit: 30
      };
    }
  }
};


// words to guess
const words = {
  easy: [
    { word: 'samolot', hint: 'Środek transportu w powietrzu' },
    { word: 'rower', hint: 'Pojazd napędzany siłą nóg' },
    { word: 'kwiat', hint: 'Roślina ozdobna, która rozkwita wiosną' },
    { word: 'jabłko', hint: 'Zdrowy, soczysty owoc' },
    { word: 'kawa', hint: 'Napój pobudzający o poranku' },
    { word: 'krzesło', hint: 'Mebel do siedzenia' },
    { word: 'biurko', hint: 'Miejsce do pracy i nauki' },
    { word: 'buty', hint: 'Obuwie do chodzenia' }
  ],
  medium: [
    { word: 'biblioteka', hint: 'Miejsce pełne książek' },
    { word: 'komputer', hint: 'Urządzenie do pracy i rozrywki' },
    { word: 'muzeum', hint: 'Instytucja z eksponatami historycznymi i artystycznymi' },
    { word: 'teatr', hint: 'Miejsce wystaw teatralnych' },
    { word: 'smartfon', hint: 'Nowoczesny telefon z ekranem dotykowym' },
    { word: 'akwarystyka', hint: 'Hobby polegające na hodowli ryb' },
    { word: 'cinema', hint: 'Miejsce, gdzie ogląda się filmy' },
    { word: 'kulinaria', hint: 'Sztuka gotowania i przygotowywania potraw' }
  ],
  hard: [
    { word: 'kryptografia', hint: 'Sztuka szyfrowania informacji' },
    { word: 'neurologia', hint: 'Nauka o układzie nerwowym' },
    { word: 'antropologia', hint: 'Badanie człowieka i jego kultury' },
    { word: 'elektromagnetyzm', hint: 'Dziedzina fizyki dotycząca pól magnetycznych i elektrycznych' },
    { word: 'biotechnologia', hint: 'Wykorzystanie organizmów żywych w przemyśle' },
    { word: 'konsolidacja', hint: 'Proces łączenia lub umacniania czegoś' },
    { word: 'symbioza', hint: 'Współistnienie dwóch gatunków na wzajemną korzyść' },
    { word: 'polimeryzacja', hint: 'Proces tworzenia polimerów z monomerów' }
  ],
  extreme: [
    { word: 'antykoncepcja', hint: 'Metody zapobiegające ciąży' },
    { word: 'cywilizacja', hint: 'Społeczeństwo o wysokim stopniu rozwoju kultury i organizacji' },
    { word: 'rozczarowanie', hint: 'Uczucie zawodu po niespełnieniu oczekiwań' },
    { word: 'infrastruktura', hint: 'Podstawowe instalacje i usługi niezbędne do funkcjonowania społeczeństwa' },
    { word: 'metafizyka', hint: 'Dział filozofii zajmujący się naturą rzeczywistości' },
    { word: 'znieczulenie', hint: 'Powoduje utratę czucia bólu podczas operacji' },
    { word: 'fenomenologia', hint: 'Nurt filozoficzny badający zjawiska oraz sposób ich przejawiania się' },
    { word: 'interdyscyplinarny', hint: 'Łączący różne dziedziny nauki lub sztuki' },
    { word: 'egzystencjalizm', hint: 'Nurt filozoficzny skupiający się na indywidualnym istnieniu człowieka' },
    { word: 'teleportacja', hint: 'Przemieszczenie materii z jednego miejsca do drugiego bez pokonywania fizycznej przestrzeni' }
  ]
};

// Word categories
const wordCategories = {
  animals: {
    easy: [
      { word: 'kot', hint: 'Miauczący domowy pupil' },
      { word: 'pies', hint: 'Najlepszy przyjaciel człowieka' },
      { word: 'ryba', hint: 'Zwierzę żyjące w wodzie' },
      { word: 'koń', hint: 'Zwierzę do jazdy wierzchem' }
    ],
    medium: [
      { word: 'żyrafa', hint: 'Zwierzę z długą szyją' },
      { word: 'krokodyl', hint: 'Gad z ostrymi zębami żyjący w wodzie' },
      { word: 'pingwin', hint: 'Nielotny ptak z zimnych regionów' },
      { word: 'tygrys', hint: 'Duży kot w paski' }
    ],
    hard: [
      { word: 'narwal', hint: 'Arktyczny ssak morski z długim kłem' },
      { word: 'pancernik', hint: 'Ssak z pancerzem z Ameryki Południowej' },
      { word: 'orangutan', hint: 'Małpa człekokształtna z Borneo i Sumatry' },
      { word: 'koala', hint: 'Torbacz żywiący się liśćmi eukaliptusa' }
    ],
    extreme: [
      { word: 'dziobak', hint: 'Jajorodny ssak z Australii' },
      { word: 'aksolotl', hint: 'Płaz z Meksyku zachowujący cechy larwalne' },
      { word: 'mrówkojad', hint: 'Ssak z długim językiem żywiący się mrówkami' },
      { word: 'okapi', hint: 'Krewniak żyrafy z krótszą szyją' }
    ]
  },
  geography: {
    easy: [
      { word: 'polska', hint: 'Kraj nad Wisłą' },
      { word: 'morze', hint: 'Duży zbiornik słonej wody' },
      { word: 'góry', hint: 'Wyniesienia terenu o dużej wysokości' },
      { word: 'rzeka', hint: 'Naturalny ciek wodny' }
    ],
    medium: [
      { word: 'wulkan', hint: 'Góra z kraterem, z której wydobywa się lawa' },
      { word: 'pustynia', hint: 'Obszar o minimalnych opadach atmosferycznych' },
      { word: 'archipelag', hint: 'Grupa wysp blisko położonych' },
      { word: 'kontynent', hint: 'Jeden z wielkich obszarów lądowych na Ziemi' }
    ],
    hard: [
      { word: 'antarktyda', hint: 'Najzimniejszy kontynent na Ziemi' },
      { word: 'himalaje', hint: 'Najwyższe pasmo górskie świata' },
      { word: 'amazonia', hint: 'Największy las równikowy na świecie' },
      { word: 'madagaskar', hint: 'Czwarta największa wyspa świata' }
    ],
    extreme: [
      { word: 'kilimandżaro', hint: 'Najwyższy szczyt Afryki' },
      { word: 'mesopotamia', hint: 'Starożytna kraina między Tygrysem a Eufratem' },
      { word: 'popocatepetl', hint: 'Aktywny wulkan w Meksyku' },
      { word: 'svalbard', hint: 'Norweskie terytorium w Arktyce' }
    ]
  },
  food: {
    easy: [
      { word: 'chleb', hint: 'Podstawowy wypiek z mąki' },
      { word: 'jabłko', hint: 'Owoc, który podobno jadła Ewa' },
      { word: 'ser', hint: 'Produkt mleczny' },
      { word: 'pizza', hint: 'Włoski placek z dodatkami' }
    ],
    medium: [
      { word: 'spaghetti', hint: 'Włoski makaron podawany z sosem' },
      { word: 'croissant', hint: 'Francuskie pieczywo w kształcie rogalika' },
      { word: 'sushi', hint: 'Japońska potrawa z ryżem i rybą' },
      { word: 'pierogi', hint: 'Polskie danie z ciasta z nadzieniem' }
    ],
    hard: [
      { word: 'carpaccio', hint: 'Włoska przystawka z surowego mięsa' },
      { word: 'bouillabaisse', hint: 'Francuska zupa rybna' },
      { word: 'falafel', hint: 'Bliskowschodnie danie z ciecierzycy' },
      { word: 'tiramisu', hint: 'Włoski deser z mascarpone i kawą' }
    ],
    extreme: [
      { word: 'foie gras', hint: 'Francuski przysmak z wątroby kaczki lub gęsi' },
      { word: 'bouillabaisse', hint: 'Prowansalska zupa rybna' },
      { word: 'ratatouille', hint: 'Francuskie danie z duszonych warzyw' },
      { word: 'goulash', hint: 'Węgierskie danie z mięsem i papryką' }
    ]
  }
};

let usedWords = {
  easy: new Set(),
  medium: new Set(),
  hard: new Set(),
  extreme: new Set(),
  animals: {
    easy: new Set(),
    medium: new Set(),
    hard: new Set(),
    extreme: new Set()
  },
  geography: {
    easy: new Set(),
    medium: new Set(),
    hard: new Set(),
    extreme: new Set()
  },
  food: {
    easy: new Set(),
    medium: new Set(),
    hard: new Set(),
    extreme: new Set()
  }
};

function getRandomWord(difficulty) {
  const category = localStorage.getItem('category') || 'all';

  if (category === 'all') {
    const availableWords = words[difficulty].filter(wordObj => !usedWords[difficulty].has(wordObj.word));

    if (availableWords.length === 0) {
      usedWords[difficulty].clear();
      return words[difficulty][Math.floor(Math.random() * words[difficulty].length)];
    }

    // get random word
    const randomWordObj = availableWords[Math.floor(Math.random() * availableWords.length)];
    usedWords[difficulty].add(randomWordObj.word);
    return randomWordObj;
  } else {
    // get random word from selected category
    if (wordCategories[category] && wordCategories[category][difficulty]) {
      const availableWords = wordCategories[category][difficulty].filter(wordObj => !usedWords[category][difficulty].has(wordObj.word));

      if (availableWords.length === 0) {
        usedWords[category][difficulty].clear();
        return wordCategories[category][difficulty][Math.floor(Math.random() * wordCategories[category][difficulty].length)];
      }

      const randomWordObj = availableWords[Math.floor(Math.random() * availableWords.length)];
      usedWords[category][difficulty].add(randomWordObj.word);
      return randomWordObj;

    } else {
      console.warn(`Brak słów dla kategorii ${category} i poziomu trudności ${difficulty}, używam domyślnych słów`);
      return getRandomWord('easy');
    }
  }
}


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
    difficultyButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
  });
}

const modeButtons = document.querySelectorAll('.btn.mode');

modeButtons.forEach(button => {
  button.addEventListener('click', () => {
    modeButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    currentMode = button.id;
  });
});


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
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function drawHangman() {
  for (let i = 0; i < errors && i < HANGMAN_PARTS.length; i++) {
    HANGMAN_PARTS[i]();
  }
}

function updateWordDisplay() {
  wordContainer.innerHTML = displayedWord
    .map(letter => `<span class="letter-space">${letter}</span>`)
    .join('');
}

function updateGameStats() {
  if (!currentDifficulty) {
    const selectedDifficultyButton = document.querySelector('.difficulty-buttons .btn.selected');
    currentDifficulty = selectedDifficultyButton ? selectedDifficultyButton.id : 'brak';
  }

  const statsHTML = `
        <div class="difficulty">Poziom trudności: <span>${currentDifficulty}</span></div>
        <div class="gamemode">Tryb gry: <span>${gameModes[currentMode].name}</span></div>
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
  statsDiv.style.margin = '80px 1rem 1rem';


}
function showModal(title, message, showReplayButton = true) {
  const modal = document.getElementById('game-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const modalButton = document.getElementById('modal-button');
  const modalClose = document.getElementById('modal-close');
  const modalMenu = document.getElementById('modal-menu');

  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modal.classList.remove('hidden');

  if (title === 'Podpowiedź') {
    modalMenu.style.display = 'none';
  } else {
    modalMenu.style.display = 'inline-block';
    modalMenu.onclick = () => {
      modal.classList.add('hidden');
      mainMenu.classList.remove('hidden');
      gameContainer.classList.add('hidden');
    };
  }
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
      cleanupTimer();
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

      if (errors === maxErrors) {
        cleanupTimer();
        stats.losses++;
        stats.currentStreak = 0;
        showModal('Przegrana!', `Prawidłowe słowo to: ${selectedWord}`, true);
        wordContainer.classList.add('lose-animation');
        setTimeout(() => wordContainer.classList.remove('lose-animation'), 500);
      }
    }
  }
}

function resetGame() {
  cleanupTimer();
  generateKeyboard();

  const selectedDifficultyButton = document.querySelector('.difficulty-buttons .btn.selected');
  const difficulty = selectedDifficultyButton ? selectedDifficultyButton.id : 'brak';
  currentDifficulty = difficulty;

  const randomWordObj = getRandomWord(difficulty);
  selectedWord = randomWordObj.word.toLowerCase();
  currentHint = randomWordObj.hint;

  displayedWord = selectedWord.split('').map(() => '_');
  wrongLetters = [];
  errors = 0;

  updateWordDisplay();
  updateGameStats();
  wrongLettersList.textContent = '';

  initCanvas();

  // If in express mode, reinitialize the timer
  if (currentMode === 'express') {

    let timerDisplay = document.getElementById('timer-display');
    if (!timerDisplay) {
      timerDisplay = document.createElement('div');
      timerDisplay.id = 'timer-display';
      timerDisplay.style.fontSize = '1.5rem';
      timerDisplay.style.padding = '10px';
      timerDisplay.style.backgroundColor = '#fff'; // This will be overridden by dark mode styles if needed
      timerDisplay.style.border = '2px solid #9796f0';
      timerDisplay.style.borderRadius = '8px';
      timerDisplay.style.width = '200px';
      timerDisplay.style.margin = '10px auto';
      timerDisplay.style.textAlign = 'center';
      timerDisplay.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.2)';
      document.querySelector('#game-container').insertBefore(timerDisplay, document.querySelector('.game-wrapper'));
    }
    let timeLeft = 30; // reset time to 30 seconds
    timerDisplay.textContent = `Czas: ${timeLeft} s`;
    timerInterval = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = `Czas: ${timeLeft} s`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        stats.losses++;
        stats.currentStreak = 0;
        showModal('Przegrana!', `Czas minął! Prawidłowe słowo to: ${selectedWord}`, true);
      }
    }, 1000);
  }
}

function startGame() {

  initGameReferences();

  const difficulty = localStorage.getItem('difficulty') || 'easy';
  currentMode = localStorage.getItem('mode') || 'classic';
  const selectedCategory = localStorage.getItem('category') || 'all';

  const modeConfig = gameModes[currentMode].setup();

  const hintButton = document.getElementById('hint-button');
  if (!modeConfig.showHints) {
    hintButton.style.display = 'none';
  } else {
    hintButton.style.display = 'block';
  }

  maxErrors = modeConfig.maxErrors;
  currentDifficulty = difficulty;

  if (currentMode === 'express') {
    cleanupTimer();



    let timeLeft = modeConfig.timeLimit;
    let timerDisplay = document.getElementById('timer-display');
    if (!timerDisplay) {
      timerDisplay = document.createElement('div');
      timerDisplay.id = 'timer-display';
      timerDisplay.style.fontSize = '1.5rem';
      timerDisplay.style.padding = '10px';
      timerDisplay.style.backgroundColor = '#fff';
      timerDisplay.style.border = '2px solid #9796f0';
      timerDisplay.style.borderRadius = '8px';
      timerDisplay.style.width = '200px';
      timerDisplay.style.margin = '10px auto';
      timerDisplay.style.textAlign = 'center';
      timerDisplay.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.2)';
      document.querySelector('#game-container').insertBefore(timerDisplay, document.querySelector('.game-wrapper'));
    }
    timerDisplay.textContent = `Czas: ${timeLeft} s`;
    timerInterval = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = `Czas: ${timeLeft} s`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        stats.losses++;
        stats.currentStreak = 0;
        showModal('Przegrana!', `Czas minął! Prawidłowe słowo to: ${selectedWord}`, true);
      }
    }, 1000);
  } else {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) timerDisplay.remove();
  }

  generateKeyboard();
  const randomWordObj = getRandomWord(difficulty);
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
        <div class="modal-buttons">
            <button id="modal-button">Zagraj ponownie</button>
            <button id="modal-menu">Powrót do menu</button>
            <button id="modal-close">Zamknij</button>
        </div>
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
    width: 80%;
    max-width: 400px;
    margin: 0 auto;
    animation: modalAppear 0.3s ease;
}

@keyframes modalAppear {
    from { transform: scale(0.7); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.modal.hidden {
    display: none;
}

.modal-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

#modal-button, #modal-close, #modal-menu {
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
const hintButton = `<button id="hint-button" class="function-button">Podpowiedź</button>`;
const exitButton = `<button id="exit-button" class="function-button">Wyjdź</button>`;
document.querySelector('#wrong-letters').insertAdjacentHTML('afterend', exitButton);
document.querySelector('#wrong-letters').insertAdjacentHTML('afterend', hintButton);


// Hint handling
document.getElementById('hint-button').onclick = () => {
  showModal('Podpowiedź', currentHint, false);
};

document.getElementById('exit-button').onclick = () => {
  cleanupTimer();

  const modal = document.getElementById('game-modal');
  if (modal) {
    modal.classList.add('hidden');
  }

  const timerDisplay = document.getElementById('timer-display');
  if (timerDisplay) timerDisplay.remove();

  mainMenu.classList.remove('hidden');
  gameContainer.classList.add('hidden');
};

window.startGame = startGame; // export for menu
