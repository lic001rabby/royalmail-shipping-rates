class RoyalMailBox {
  constructor() {
    this.reference = null;
    this.outer_width = null;
    this.outer_length = null;
    this.outer_depth = null;
    this.empty_weight = null;
    this.inner_width = null;
    this.inner_length = null;
    this.inner_depth = null;
    this.max_weight = null;
  }

  getReference() {
    return this.reference;
  }

  getOuterWidth() {
    return this.outer_width;
  }

  getOuterLength() {
    return this.outer_length;
  }

  getOuterDepth() {
    return this.outer_depth;
  }

  getEmptyWeight() {
    return this.empty_weight;
  }

  getInnerWidth() {
    return this.inner_width;
  }

  getInnerLength() {
    return this.inner_length;
  }

  getInnerDepth() {
    return this.inner_depth;
  }

  getInnerVolume() {
    return this.getInnerLength() * this.getInnerWidth() * this.getInnerDepth();
  }

  getMaxWeight() {
    return this.max_weight;
  }

  setReference(reference) {
    this.reference = reference;
    return this;
  }

  setOuterWidth(outer_width) {
    this.outer_width = outer_width;
    return this;
  }

  setOuterLength(outer_length) {
    this.outer_length = outer_length;
    return this;
  }

  setOuterDepth(outer_depth) {
    this.outer_depth = outer_depth;
    return this;
  }

  setEmptyWeight(empty_weight) {
    this.empty_weight = empty_weight;
    return this;
  }

  setInnerWidth(inner_width) {
    this.inner_width = inner_width;
    return this;
  }

  setInnerLength(inner_length) {
    this.inner_length = inner_length;
    return this;
  }

  setInnerDepth(inner_depth) {
    this.inner_depth = inner_depth;
    return this;
  }

  setMaxWeight(max_weight) {
    this.max_weight = max_weight;
    return this;
  }
}

module.exports = RoyalMailBox;