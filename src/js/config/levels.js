// Конфигурация уровней
const seasons = [
  {
    name: 'Огород',
    emojis: ['🍅', '🌽', '🥕', '🥦', '🍆', '🥔'],
    bg: 'assets/backgrounds/bg_1.png'
  },
  {
    name: 'Фрукты',
    emojis: ['🍎', '🍌', '🍊', '🍐', '🍇', '🍓'],
    bg: 'assets/backgrounds/bg_2.png'
  },
  {
    name: 'Сладости',
    emojis: ['🍩', '🍰', '🍭', '🍪', '🍫', '🧁'],
    bg: 'assets/backgrounds/bg_3.png'
  },
  {
    name: 'Одежда',
    emojis: ['👕', '👖', '👗', '👟', '🧢', '🧥'],
    bg: 'assets/backgrounds/bg_4.png'
  },
  {
    name: 'Машинки',
    emojis: ['🚗', '🚕', '🚒', '🚓', '🚜', '🏎️'],
    bg: 'assets/backgrounds/bg_5.png'
  },
  {
    name: 'Млекопитающие',
    emojis: ['🐶', '🐱', '🦊', '🐼', '🦁', '🐨'],
    bg: 'assets/backgrounds/bg_6.png'
  },
  {
    name: 'Шахматы',
    emojis: ['♔', '♕', '♖', '♗', '♘', '♙'],
    bg: 'assets/backgrounds/bg_7.png'
  },
  {
    name: 'Греческая мифология',
    emojis: ['⚡', '🔱', '🦉', '🏛️', '🏺', '🔥'],
    bg: 'assets/backgrounds/bg_8.png'
  },
  {
    name: 'Скандинавская мифология',
    emojis: ['🔨', '🪓', '🐺', '🛡️', '⛵', '❄️'],
    bg: 'assets/backgrounds/bg_9.png'
  },
  {
    name: 'Легендарный микс',
    emojis: ['🐻', '🐸', '🐋', '💥', '💨', '🎯'],
    bg: 'assets/backgrounds/bg_10.png'
  }
];

const levels = [];

for (let i = 1; i <= 100; i++) {
  const seasonIndex = Math.floor((i - 1) / 10);
  const season = seasons[seasonIndex];
  
  let colors;
  if (i <= 5) {
    colors = 4;
  } else if (i <= 15) {
    colors = 5;
  } else {
    colors = 6;
  }

  levels.push({
    level: i,
    targetScore: 1000 + 350 * (i - 1),
    colors: colors,
    reward: 15,
    rewardImage: `assets/rewards/level_${i}.png`,
    season: season
  });
}

export default levels;