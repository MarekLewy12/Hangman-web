document.addEventListener('DOMContentLoaded', () => {
  const musicToggle = document.getElementById('music-toggle');
  const musicIcon = document.getElementById('music-icon');

  let bgMusic = new Audio();
  bgMusic.src = 'sounds/relaxing_lofi.mp3';
  bgMusic.loop = true;
  bgMusic.volume = 0.3;

  let isMusicPlaying = false;

  const savedMusicState = localStorage.getItem('musicPlaying');

  if (savedMusicState === 'true') {
    const playPromise = bgMusic.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        isMusicPlaying = true;
        musicToggle.classList.add('playing');
        musicIcon.src = 'img/music_icon.png';
      }).catch(error => {
        console.log('Could not play music:', error);
        isMusicPlaying = false;
        localStorage.setItem('musicPlaying', 'false');
      });
    }
  }

  musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
      bgMusic.pause();
      musicToggle.classList.remove('playing');
      musicIcon.src = 'img/music_off_icon.png';
      localStorage.setItem('musicPlaying', 'false');
    } else {
      bgMusic.play().catch(error => {
        console.error("Could not play music:", error);
      });
      musicToggle.classList.add('playing');
      musicIcon.src = 'img/music_icon.png';
      localStorage.setItem('musicPlaying', 'true');
    }
    isMusicPlaying = !isMusicPlaying;
  });
});
