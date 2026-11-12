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
}

export default Board;