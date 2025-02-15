document.addEventListener('DOMContentLoaded', () => {
  const modeToggle = document.getElementById('mode-toggle');
  const modeIcon = document.getElementById('mode-icon');

  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    modeIcon.src = 'img/sun_icon.png';
  }

  modeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('dark-mode')) {
      document.body.classList.remove('dark-mode');
      modeIcon.src = 'img/moon_icon.png';
      localStorage.setItem('darkMode', null);
    } else {
      document.body.classList.add('dark-mode');
      modeIcon.src = 'img/sun_icon.png';
      localStorage.setItem('darkMode', 'enabled');
    }
  });
});
