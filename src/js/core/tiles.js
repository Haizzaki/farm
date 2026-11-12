class Tile {
  constructor(type) {
    this.type = type;
    this.selected = false;
  }

  toggleSelect() {
    this.selected = !this.selected;
  }
}

export default Tile;