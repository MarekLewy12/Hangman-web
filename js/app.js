const difficultyButtons = document.querySelectorAll('.btn');

for (const button of difficultyButtons) {
  button.addEventListener('click', () => {
    for (const btn of difficultyButtons) {
      btn.classList.remove('selected');
    }
    button.classList.add('selected');
  });
}
