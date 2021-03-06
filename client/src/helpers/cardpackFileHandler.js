module.exports.parse = (string) => {
  let cards = [];
  let cardStrings = string.split(/\r\n\r\n/);
  cardStrings.forEach((row, i) => {
    let cardParts = row.split(/\r\n/);
    let cardText = cardParts[0];
    cardText = cardText ? cardText.trim() : null;
    let cardType = cardParts[1];
    cardType = cardType ? cardType.trim() : null;
    if (cardType === 'black') {
      if (!(cardParts.length === 2 || cardParts.length === 3)) {
        throw new Error('Expected either two or three parameters on line ' + (i + 1) + ' but got ' + cardParts.length);
      }
    } else if (cardParts.length !== 2) {
      throw new Error('Expected two parameters on line ' + (i + 1) + ' but got ' + cardParts.length);
    }
    let card = {text: cardText, type: cardType};
    if (card.type === 'black') {
      let answerFields = cardParts[2] || '1';
      answerFields = answerFields.trim();
      answerFields = parseInt(answerFields);
      card.answerFields = answerFields;
    } else {
      card.answerFields = null;
    }
    if (!(card.type === 'black' || card.type === 'white')) {
      throw new Error('Line ' + (i + 1) + ': card type must be either black or white, not ' + card.type);
    }
    cards.push(card);
  });
  return cards;
};

module.exports.stringify = (cards) => {
  if (!cards || cards.constructor !== Array) {
    throw new Error('Cards must be an array');
  }
  let cardString = '';
  cards.forEach((card, i) => {
    if (!card.text) {
      throw new Error('Card is missing \'text\' property');
    }
    if (!card.type) {
      throw new Error('Card is missing \'type\' property');
    }
    cardString += card.text + '\r\n' + card.type + (card.answerFields ? '\r\n' + card.answerFields : '');
    if (i + 1 < cards.length) {
      cardString += '\r\n\r\n';
    }
  });
  return cardString;
};