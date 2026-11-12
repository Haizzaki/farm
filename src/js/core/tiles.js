class Tile {
  constructor(type) {
    this.type = type;
    this.selected = false;
    this.element = document.createElement('div');
    this.element.className = 'game-tile';
  }

  toggleSelect() {
    this.selected = !this.selected;
    if (this.selected) {
      this.element.classList.add('selected');
    } else {
      this.element.classList.remove('selected');
    }
  }
}

export default Tile;