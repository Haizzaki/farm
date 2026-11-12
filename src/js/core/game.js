import Board from './board.js';
import Tile from './tiles.js';
import levels from '../config/levels.js';

const SCORES = {
  3: 100,
  4: 200,
  5: 500
};

class Game {
  constructor() {
    this.board = new Board(8, 8);
    this.selectedTile = null;
    this.score = 0;
    this.coins = 0;
    this.currentLevel = 1;
    this.isPaused = false;
    this.initTilesWithoutMatches();
    this.loadProgress();
    this.render();
    this.setupEventListeners();
  }

  loadProgress() {
    const savedData = localStorage.getItem('match3-progress');
    if (savedData) {
      try {
        const {level, coins} = JSON.parse(savedData);
        this.currentLevel = level;
        this.coins = coins;
      } catch (e) {
        console.error('Ошибка загрузки прогресса:', e);
      }
    }
  }

  saveProgress() {
    const data = JSON.stringify({
      level: this.currentLevel,
      coins: this.coins
    });
    localStorage.setItem('match3-progress', data);
  }

  initTilesWithoutMatches() {
    let attempts = 0;
    const maxAttempts = 100;

    do {
      this.initTiles();
      attempts++;
    } while (this.checkMatches(false) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      console.warn('Не удалось создать поле без совпадений');
    }
  }

  initTiles() {
    const types = ['red', 'green', 'blue', 'yellow', 'purple'];
    
    for (let row = 0; row < this.board.rows; row++) {
      for (let col = 0; col < this.board.cols; col++) {
        const randomType = types[Math.floor(Math.random() * types.length)];
        this.board.grid[row][col] = new Tile(randomType);
      }
    }
  }

  setupEventListeners() {
    const container = document.getElementById('game');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const cell = e.target.closest('.game-cell');
      if (!cell) return;

      const row = parseInt(cell.dataset.row, 10);
      const col = parseInt(cell.dataset.col, 10);
      if (Number.isNaN(row) || Number.isNaN(col)) return;
      this.handleTileClick(row, col);
    });
  }

  handleTileClick(row, col) {
    if (this.isPaused) return;
    console.log(`Клик по ячейке: ${row},${col}`);
    const tile = this.board.grid[row][col];
    if (!tile) return;

    if (this.selectedTile) {
      const prevTile = this.board.grid[this.selectedTile.row][this.selectedTile.col];
      prevTile.toggleSelect();
      this.swapTiles(this.selectedTile, {row, col});
      this.selectedTile = null;
    } else {
      this.selectedTile = {row, col};
      tile.toggleSelect();
    }
    this.render();
  }

  swapTiles(pos1, pos2) {
    // Менять можно только соседние по стороне фишки
    const dr = Math.abs(pos1.row - pos2.row);
    const dc = Math.abs(pos1.col - pos2.col);
    if (!((dr === 1 && dc === 0) || (dr === 0 && dc === 1))) return;

    const tile1 = this.board.grid[pos1.row][pos1.col];
    const tile2 = this.board.grid[pos2.row][pos2.col];
    tile1.toggleSelect();
    tile2.toggleSelect();

    const temp = this.board.grid[pos1.row][pos1.col];
    this.board.grid[pos1.row][pos1.col] = this.board.grid[pos2.row][pos2.col];
    this.board.grid[pos2.row][pos2.col] = temp;

    if (!this.checkMatches()) {
      // Если нет совпадений, возвращаем фишки на место
      const temp = this.board.grid[pos1.row][pos1.col];
      this.board.grid[pos1.row][pos1.col] = this.board.grid[pos2.row][pos2.col];
      this.board.grid[pos2.row][pos2.col] = temp;
    }
  }

  checkMatches(process = true) {
    const matches = [];

    // Проверка по горизонтали
    for (let row = 0; row < this.board.rows; row++) {
      let count = 1;
      for (let col = 1; col < this.board.cols; col++) {
        if (this.board.grid[row][col] && this.board.grid[row][col - 1] &&
            this.board.grid[row][col].type === this.board.grid[row][col - 1].type) {
          count++;
        } else {
          if (count >= 3) {
            matches.push({row, start: col - count, end: col - 1, direction: 'horizontal'});
          }
          count = 1;
        }
      }
      if (count >= 3) {
        matches.push({row, start: this.board.cols - count, end: this.board.cols - 1, direction: 'horizontal'});
      }
    }

    // Проверка по вертикали
    for (let col = 0; col < this.board.cols; col++) {
      let count = 1;
      for (let row = 1; row < this.board.rows; row++) {
        if (this.board.grid[row][col] && this.board.grid[row - 1][col] &&
            this.board.grid[row][col].type === this.board.grid[row - 1][col].type) {
          count++;
        } else {
          if (count >= 3) {
            matches.push({col, start: row - count, end: row - 1, direction: 'vertical'});
          }
          count = 1;
        }
      }
      if (count >= 3) {
        matches.push({col, start: this.board.rows - count, end: this.board.rows - 1, direction: 'vertical'});
      }
    }

    if (matches.length > 0) {
      if (process) {
        this.processMatches(matches);
        // Каскад: после падения фишек проверяем новые совпадения
        this.checkMatches(true);
      }
      return true;
    }
    return false;
  }

  processMatches(matches) {
    console.log(`Найдено совпадений: ${matches.length}`);
    matches.forEach(match => {
      console.log(`Совпадение: ${match.direction} ${match.start}-${match.end}`);
      const {direction, start, end} = match;
      const length = end - start + 1;
      this.score += SCORES[length] || 0;

      if (direction === 'horizontal') {
        const row = match.row;
        for (let col = start; col <= end; col++) {
          this.board.grid[row][col] = null;
        }
      } else {
        const col = match.col;
        for (let row = start; row <= end; row++) {
          this.board.grid[row][col] = null;
        }
      }
    });

    this.fillEmptyTiles();
    this.checkLevelCompletion();
    this.render();
  }

  fillEmptyTiles() {
    for (let col = 0; col < this.board.cols; col++) {
      let emptyRow = this.board.rows - 1;
      for (let row = this.board.rows - 1; row >= 0; row--) {
        if (this.board.grid[row][col]) {
          if (row !== emptyRow) {
            this.board.grid[emptyRow][col] = this.board.grid[row][col];
            this.board.grid[row][col] = null;
          }
          emptyRow--;
        }
      }

      // Генерация новых фишек
      for (let row = emptyRow; row >= 0; row--) {
        const types = ['red', 'green', 'blue', 'yellow', 'purple'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        this.board.grid[row][col] = new Tile(randomType);
      }
    }
  }

  render() {
    const container = document.getElementById('game');
    if (!container) return;
    
    container.innerHTML = '';

    // Обновление HUD
    const hud = document.getElementById('hud');
    if (hud) {
      document.getElementById('current-level').textContent = this.currentLevel;
      document.getElementById('current-score').textContent = this.score;
      document.getElementById('target-score').textContent = `/${levels[this.currentLevel - 1].targetScore}`;
      document.getElementById('coins').textContent = this.coins;

      const progressFill = document.querySelector('.progress-fill');
      if (progressFill) {
        const target = levels[this.currentLevel - 1].targetScore;
        const width = Math.min((this.score / target) * 100, 100);
        progressFill.style.width = `${width}%`;
      }
    }

    // Настройка бустеров
    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) {
      hintBtn.disabled = this.coins < 30;
      hintBtn.onclick = () => {
        if (this.coins >= 30) {
          this.coins -= 30;
          this.saveProgress();
          this.showHint();
          this.render();
        }
      };
    }

    const shuffleBtn = document.getElementById('shuffle-btn');
    if (shuffleBtn) {
      shuffleBtn.disabled = this.coins < 50;
      shuffleBtn.onclick = () => {
        if (this.coins >= 50) {
          this.coins -= 50;
          this.saveProgress();
          this.board.shuffleTiles();
          this.render();
        }
      };
    }
    
    const grid = document.createElement('div');
    grid.className = 'game-grid';
    
    for (let row = 0; row < this.board.rows; row++) {
      const rowEl = document.createElement('div');
      rowEl.className = 'game-grid-row';
      rowEl.dataset.row = row;

      for (let col = 0; col < this.board.cols; col++) {
        const cell = document.createElement('div');
        cell.className = 'game-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;

        const tile = this.board.grid[row][col];
        if (tile) {
          const tileEl = document.createElement('div');
          tileEl.className = `game-tile tile-${tile.type}`;
          if (tile.selected) tileEl.classList.add('selected');
          cell.appendChild(tileEl);
        }

        rowEl.appendChild(cell);
      }

      grid.appendChild(rowEl);
    }
    
    container.appendChild(grid);
  }

  checkLevelCompletion() {
    const currentLevelData = levels[this.currentLevel - 1];
    if (this.score >= currentLevelData.targetScore && !this.isPaused) {
      this.isPaused = true;
      this.coins += currentLevelData.reward;
      this.saveProgress();
      this.showVictoryScreen();
    }
  }

  showHint() {
    // Создаем глубокую копию доски
    const boardCopy = JSON.parse(JSON.stringify(this.board));
    
    // Находим первый возможный ход
    let hintPositions = null;
    outer: for (let row = 0; row < boardCopy.rows; row++) {
      for (let col = 0; col < boardCopy.cols; col++) {
        const neighbors = [
          {row: row - 1, col},
          {row: row + 1, col},
          {row, col: col - 1},
          {row, col: col + 1}
        ];

        for (const neighbor of neighbors) {
          if (neighbor.row >= 0 && neighbor.row < boardCopy.rows &&
              neighbor.col >= 0 && neighbor.col < boardCopy.cols) {
            const temp = boardCopy.grid[row][col];
            boardCopy.grid[row][col] = boardCopy.grid[neighbor.row][neighbor.col];
            boardCopy.grid[neighbor.row][neighbor.col] = temp;

            if (this.checkMatchesOnCopy(boardCopy)) {
              hintPositions = [
                {row, col},
                {row: neighbor.row, col: neighbor.col}
              ];
              break outer;
            }

            // Возвращаем фишки на место в копии
            const temp2 = boardCopy.grid[row][col];
            boardCopy.grid[row][col] = boardCopy.grid[neighbor.row][neighbor.col];
            boardCopy.grid[neighbor.row][neighbor.col] = temp2;
          }
        }
      }
    }

    if (hintPositions) {
      // Подсвечиваем фишки
      const [pos1, pos2] = hintPositions;
      this.board.grid[pos1.row][pos1.col].toggleSelect();
      this.board.grid[pos2.row][pos2.col].toggleSelect();
      this.render();

      // Через 3 секунды убираем подсветку
      setTimeout(() => {
        this.board.grid[pos1.row][pos1.col].toggleSelect();
        this.board.grid[pos2.row][pos2.col].toggleSelect();
        this.render();
      }, 3000);
    }
  }

checkMatchesOnCopy(boardCopy) {
  const matches = [];

  // Горизонтальные совпадения
  for (let row = 0; row < boardCopy.rows; row++) {
    let count = 1;
    for (let col = 1; col < boardCopy.cols; col++) {
      if (boardCopy.grid[row][col] && boardCopy.grid[row][col - 1] &&
          boardCopy.grid[row][col].type === boardCopy.grid[row][col - 1].type) {
        count++;
      } else {
        if (count >= 3) {
          matches.push({row, start: col - count, end: col - 1, direction: 'horizontal'});
        }
        count = 1;
      }
    }
    if (count >= 3) {
      matches.push({row, start: boardCopy.cols - count, end: boardCopy.cols - 1, direction: 'horizontal'});
    }
  }

  // Вертикальные совпадения
  for (let col = 0; col < boardCopy.cols; col++) {
    let count = 1;
    for (let row = 1; row < boardCopy.rows; row++) {
      if (boardCopy.grid[row][col] && boardCopy.grid[row - 1][col] &&
          boardCopy.grid[row][col].type === boardCopy.grid[row - 1][col].type) {
        count++;
      } else {
        if (count >= 3) {
          matches.push({col, start: row - count, end: row - 1, direction: 'vertical'});
        }
        count = 1;
      }
    }
    if (count >= 3) {
      matches.push({col, start: boardCopy.rows - count, end: boardCopy.rows - 1, direction: 'vertical'});
    }
  }

  return matches.length > 0;
}

showVictoryScreen() {
   // Ставим игру на паузу
   this.isPaused = true;
   
   const overlay = document.getElementById('victory-overlay');
   overlay.classList.remove('hidden');
   overlay.style.display = 'flex';
   overlay.style.zIndex = '1000';

   const rewardImage = document.getElementById('victory-reward');
   rewardImage.src = levels[this.currentLevel - 1].rewardImage;
   rewardImage.onerror = () => {
     rewardImage.src = '';
     rewardImage.className = 'reward-frame';
     rewardImage.innerHTML = `🏆<div class="reward-title">Уровень ${levels[this.currentLevel - 1].level}</div>`;
   };

   const coins = document.getElementById('victory-coins');
   coins.textContent = `+${levels[this.currentLevel - 1].reward} монет`;

   document.getElementById('next-level-btn').onclick = () => {
     overlay.classList.add('hidden');
     this.isPaused = false;
     this.currentLevel++;
     if (this.currentLevel > levels.length) {
       this.currentLevel = 1;
     }
     this.score = 0;
     this.initTilesWithoutMatches();
     this.render();
   };
 }

  showGallery() {
    // Ставим игру на паузу
    this.isPaused = true;
    
    const overlay = document.getElementById('gallery-overlay');
    overlay.classList.remove('hidden');
    overlay.style.display = 'flex';
    const galleryOverlay = document.getElementById('gallery-overlay');
    const galleryGrid = galleryOverlay.querySelector('.gallery-grid');
    galleryGrid.innerHTML = '';

    const progress = JSON.parse(localStorage.getItem('match3-progress') || '{}');
    const levelsCompleted = progress.level || 1;

    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      const reward = document.createElement('div');
      reward.className = 'gallery-reward';

      if (i < levelsCompleted) {
        const img = document.createElement('img');
        img.src = level.rewardImage;
        img.alt = `Награда уровня ${i + 1}`;
        img.onerror = () => {
          img.src = '';
          img.className = 'gallery-placeholder';
          img.textContent = `Уровень ${i + 1}`;
        };
        reward.appendChild(img);
      } else {
        reward.className += ' locked';
        reward.innerHTML = '🔒';
      }

      galleryGrid.appendChild(reward);
    }

    galleryOverlay.classList.remove('hidden');

    document.getElementById('close-gallery-btn').onclick = () => {
      galleryOverlay.classList.add('hidden');
    };
  }
}

export default Game;
