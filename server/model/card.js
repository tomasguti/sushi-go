class Card {
  type;
  subtype;

  constructor(type, subtype) {
    this.type = type;
    if (subtype) {
      this.subtype = subtype;
    }
  }
}

module.exports = { Card };
