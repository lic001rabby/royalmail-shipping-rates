class Item {
  constructor() {
    this.description = null;
    this.width = null;
    this.length = null;
    this.depth = null;
    this.weight = null;
    this.volume = null;
    this.keep_flat = null;
    this.price = null;
  }

  getPrice() {
    return this.price;
  }

  setPrice(price) {
    this.price = price;
    return this;
  }

  getDescription() {
    return this.description;
  }

  getWidth() {
    return this.width;
  }

  getLength() {
    return this.length;
  }

  getDepth() {
    return this.depth;
  }

  getWeight() {
    return this.weight;
  }

  getVolume() {
    return this.volume;
  }

  getKeepFlat() {
    return this.keep_flat;
  }

  setDescription(description) {
    this.description = description;
    return this;
  }

  setWidth(width) {
    this.width = width;
    return this;
  }

  setLength(length) {
    this.length = length;
    return this;
  }

  setDepth(depth) {
    this.depth = depth;
    return this;
  }

  setWeight(weight) {
    this.weight = weight;
    return this;
  }

  setVolume(volume) {
    this.volume = volume;
    return this;
  }

  setKeepFlat(keep_flat) {
    this.keep_flat = keep_flat;
    return this;
  }
}

module.exports = Item;
