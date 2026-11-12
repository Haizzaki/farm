// Конфигурация уровней
const levels = [];

for (let i = 1; i <= 100; i++) {
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
    reward: Math.floor(Math.random() * (100 - 30 + 1)) + 30,
    rewardImage: `assets/rewards/level_${i}.png`
  });
}

export default levels;