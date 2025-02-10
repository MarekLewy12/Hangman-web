const difficultyButtons = document.querySelectorAll('.btn');
const startButton = document.querySelector('.start-button');
const mainMenu = document.querySelector('.main');
const gameContainer = document.querySelector('#game-container');

for (const button of difficultyButtons) {
  button.addEventListener('click', () => {
    for (const btn of difficultyButtons) {
      btn.classList.remove('selected');
    }
    button.classList.add('selected');
  });
}

let selectedWord = '';
let displayedWord = [];
let wrongLetters = [];
let errors = 0;
const maxErrors = 6;

// references
const wordContainer = document.getElementById('word-container');
const wrongLettersList = document.getElementById('wrong-letters-list');
const canvas = document.getElementById('hangman-canvas');
const ctx = canvas.getContext('2d');

// words to guess
const words = {
    easy: ['dog', 'cat', 'bird', 'fish', 'horse'],
    medium: ['elephant', 'giraffe', 'crocodile', 'kangaroo', 'penguin'],
    hard: ['hippopotamus', 'rhinoceros', 'chimpanzee', 'orangutan', 'alligator'],
}

// start game
startButton.addEventListener('click', startGame);

function startGame() {
  const selectedDifficultyButton = document.querySelector('.btn.selected');
    if (!selectedDifficultyButton) {
        alert('Proszę wybierz poziom trudności!');
        return;
    }

    generateKeyboard();

    const difficulty = selectedDifficultyButton.id;
    selectedWord = words[difficulty][Math.floor(Math.random() * words[difficulty].length)]; // get random word from selected difficulty

    displayedWord = selectedWord.split('').map(() => '_');
    wrongLetters = [];
    errors = 0;

    wordContainer.textContent = displayedWord.join(' ');
    wrongLettersList.textContent = '';

    mainMenu.classList.add('hidden');
    gameContainer.classList.remove('hidden');

    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

}

function generateKeyboard() {
  const keyboardContainer = document.getElementById('keyboard');

  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

  keyboardContainer.innerHTML = '';

  letters.forEach(letter => {
    const button = document.createElement('button');
    button.classList.add('key');
    button.textContent = letter.toUpperCase();
    button.setAttribute('data-letter', letter);
    button.addEventListener('click', () => handleLetterClick(letter));

    keyboardContainer.appendChild(button);
  })

}
