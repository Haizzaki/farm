import Board from './board.js';
import Tile from './tiles.js';

class Game {
  constructor() {
    this.board = new Board(8, 8);
    this.initTiles();
    this.render();
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

  render() {
    const container = document.getElementById('game');
    if (!container) return;
    
    container.innerHTML = '';
    
    const grid = document.createElement('div');
    grid.className = 'game-grid';
    
    for (let row = 0; row < this.board.rows; row++) {
      const rowEl = document.createElement('div');
      rowEl.className = 'game-grid-row';
      
      for (let col = 0; col < this.board.cols; col++) {
        const cell = document.createElement('div');
        cell.className = 'game-cell';
        
        const tile = this.board.grid[row][col];
        if (tile) {
          const tileEl = document.createElement('div');
          tileEl.className = `game-tile tile-${tile.type}`;
          cell.appendChild(tileEl);
        }
        
        rowEl.appendChild(cell);
      }
      
      grid.appendChild(rowEl);
    }
    
    container.appendChild(grid);
  }
}

export default Game;
