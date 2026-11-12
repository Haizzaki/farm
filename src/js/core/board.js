import Tile from './tiles.js';

class Board {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.grid = this.createGrid();
  }

  createGrid() {
    const grid = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => null)
    );
    this.initTiles(grid);
    return grid;
  }
  initTiles(grid) {
    const types = ['red', 'green', 'blue', 'yellow', 'purple'];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const randomType = types[Math.floor(Math.random() * types.length)];
        grid[row][col] = new Tile(randomType);
      }
    }
  }
  shuffleTiles() {
    const types = ['red', 'green', 'blue', 'yellow', 'purple'];
    let attempts = 0;
    const maxAttempts = 100;

    do {
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          const randomType = types[Math.floor(Math.random() * types.length)];
          this.grid[row][col] = new Tile(randomType);
        }
      }
      attempts++;
    } while (this.checkMatches(false) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      console.warn('Не удалось перемешать поле без совпадений');
    }
  }

  checkMatches(process = true) {
    const matches = [];

    // Проверка по горизонтали
    for (let row = 0; row < this.rows; row++) {
      let count = 1;
      for (let col = 1; col < this.cols; col++) {
        if (this.grid[row][col] && this.grid[row][col - 1] &&
            this.grid[row][col].type === this.grid[row][col - 1].type) {
          count++;
        } else {
          if (count >= 3) {
            matches.push({row, start: col - count, end: col - 1, direction: 'horizontal'});
          }
          count = 1;
        }
      }
      if (count >= 3) {
        matches.push({row, start: this.cols - count, end: this.cols - 1, direction: 'horizontal'});
      }
    }

    // Проверка по вертикали
    for (let col = 0; col < this.cols; col++) {
      let count = 1;
      for (let row = 1; row < this.rows; row++) {
        if (this.grid[row][col] && this.grid[row - 1][col] &&
            this.grid[row][col].type === this.grid[row - 1][col].type) {
          count++;
        } else {
          if (count >= 3) {
            matches.push({col, start: row - count, end: row - 1, direction: 'vertical'});
          }
          count = 1;
        }
      }
      if (count >= 3) {
        matches.push({col, start: this.rows - count, end: this.rows - 1, direction: 'vertical'});
      }
    }

    return matches.length > 0;
  }
}

export default Board;