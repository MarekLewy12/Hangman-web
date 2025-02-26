document.addEventListener('DOMContentLoaded', () => {
  // Tabs
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  // Settings
  const currentDifficulty = document.getElementById('current-difficulty');
  const currentMode = document.getElementById('current-mode');
  const currentCategory = document.getElementById('current-category');

  // Buttons for changing settings
  const difficultyButtons = document.querySelectorAll('.difficulty-buttons .btn'); // difficulty
  const modeButtons = document.querySelectorAll('.game-modes .btn'); // mode
  const categoryButtons = document.querySelectorAll('.categories .btn'); // category

  // object to help with finding correct button and setting
  const settingButtons = {
    difficulty: {
      buttons: difficultyButtons,
      setting_to_change: currentDifficulty,
      default: 'Łatwy'
    },
    mode: {
      buttons: modeButtons,
      setting_to_change: currentMode,
      default: 'Klasyczny'
    },
    category: {
      buttons: categoryButtons,
      setting_to_change: currentCategory,
      default: 'Wszystkie'
    }
  };

  // Changing settings based on the clicked button
  const changeSetting = (setting) => {

    const buttons = settingButtons[setting].buttons;

    for (const button of buttons) {
      button.addEventListener('click', () => {
        for (const btn of buttons) {
          btn.classList.remove('selected'); // delete 'selected' class from all buttons
        }

        // add 'selected' class to the clicked button
        button.classList.add('selected');

        // update the specific setting
        const new_setting = button.querySelector('.btn-text')?.textContent || settingButtons[setting].default;
        settingButtons[setting].setting_to_change.textContent = new_setting;

        // save the setting in localStorage for later use
        localStorage.setItem(`${setting}`, button.id);
      });
    }
  }

  // Tabs switching
  const switchTab = (tabId) => {
    // reset all tabs
    for (const button of tabButtons) {
      button.classList.remove('active');
    }
    for (const content of tabContents) {
      content.classList.remove('active');
    }

    // activate the selected tab
    const activeButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
    const activeContent = document.getElementById(`${tabId}-tab`);

    activeButton?.classList.add('active');
    activeContent?.classList.add('active');
  }

  // Event listeners for tabs
  for (const button of tabButtons) {
    button.addEventListener('click', () => {
      const {tab} = button.dataset;
      switchTab(tab); // switch to the selected tab
    });
  }

  // Changing difficulty
  changeSetting('difficulty');

  // Changing mode
  changeSetting('mode');

  // Changing category
  changeSetting('category');

  // Starting game
  const startButton = document.querySelector('.start-button');

  startButton?.addEventListener('click', () => {
    const selectedDifficulty = document.querySelector('.difficulty-buttons .btn.selected');
    if (!selectedDifficulty) {
      alert('Wybierz poziom trudności!');
      return;
    }

    const mainMenu = document.querySelector('.main');
    const gameContainer = document.getElementById('game-container');

    if (mainMenu && gameContainer) {
      mainMenu.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      mainMenu.style.opacity = '0';
      mainMenu.style.transform = 'translateY(-20px)';

      gameContainer.classList.remove('hidden');
      gameContainer.style.opacity = '0';
      gameContainer.style.transform = 'translateY(20px)';
      gameContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });

        mainMenu.classList.add('hidden');
        gameContainer.style.opacity = '1';
        gameContainer.style.transform = 'translateY(0)';
        gameContainer.classList.remove('hidden');

        // run the game
        if (window.startGame) {
          window.startGame();
        }
      }, 200);
    } else {
      console.error('Could not find the main menu or game container');
    }
  });

  const loadSavedSettings = () => {
    const savedDifficulty = localStorage.getItem('difficulty');
    const savedMode = localStorage.getItem('mode');
    const savedCategory = localStorage.getItem('category');

    // Ustaw poziom trudności
    if (savedDifficulty) {
      const difficultyButton = document.getElementById(savedDifficulty);
      if (difficultyButton) {
        // Najpierw usuń klasę selected ze wszystkich przycisków
        for (const btn of difficultyButtons) {
          btn.classList.remove('selected');
        }
        // Dodaj klasę selected do zapisanego przycisku
        difficultyButton.classList.add('selected');
        // Zaktualizuj tekst wyświetlający poziom trudności
        const difficultyText = difficultyButton.querySelector('.btn-text')?.textContent || 'Łatwy';
        currentDifficulty.textContent = difficultyText;
      }
    }

    // Ustaw tryb gry
    if (savedMode) {
      const modeButton = document.getElementById(savedMode);
      if (modeButton) {
        // Najpierw usuń klasę selected ze wszystkich przycisków
        for (const btn of modeButtons) {
          btn.classList.remove('selected');
        }
        // Dodaj klasę selected do zapisanego przycisku
        modeButton.classList.add('selected');
        // Zaktualizuj tekst wyświetlający tryb gry
        const modeText = modeButton.querySelector('.btn-text')?.textContent || 'Klasyczny';
        currentMode.textContent = modeText;
      }
    }

    // Ustaw kategorię
    if (savedCategory) {
      const categoryButton = document.getElementById(savedCategory);
      if (categoryButton) {
        // Najpierw usuń klasę selected ze wszystkich przycisków
        for (const btn of categoryButtons) {
          btn.classList.remove('selected');
        }
        // Dodaj klasę selected do zapisanego przycisku
        categoryButton.classList.add('selected');
        // Zaktualizuj tekst wyświetlający kategorię
        const categoryText = categoryButton.querySelector('.btn-text')?.textContent || 'Wszystkie';
        currentCategory.textContent = categoryText;
      }
    }
  };

// Wywołaj funkcję wczytywania ustawień
  loadSavedSettings();




});
