const expect = require('chai').use(require('chai-as-promised')).expect;
const {Cardpack, Card, connection} = require('../../database');
const mockDB = require('./mockDB.json');
const mockDBHelpers = require('./mockDBHelpers');

describe('Card', () => {
  beforeEach(() => {
    return connection.clear()
      .then(() => {
        return mockDBHelpers.createUsers();
      });
  });

  it('Should exist', () => {
    expect(Card.model).to.exist;
  });
  describe('create()', () => {
    it('Should create a black card', () => {
      let user = mockDB.users[0];
      return Cardpack.create(user.email, 'cardpack_name')
        .then((cardpack) => {
          return Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: 'black'})
            .then((card) => {
              cardId = card.id;
              expect(card).to.exist;
              expect(card.createdAt).to.exist;
              expect(card.updatedAt).to.exist;
              expect(card.cardpackId).to.not.exist;
              expect(card.cardpack).to.exist;
              expect(card.cardpack.id).to.equal(cardpack.id);
              expect(card.text).to.equal('test card');
              expect(card.type).to.equal('black');
              expect(card.answerFields).to.equal(1);
            });
        });
    });
    it('Should create a white card', () => {
      let user = mockDB.users[0];
      return Cardpack.create(user.email, 'cardpack_name')
        .then((cardpack) => {
          return Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: 'white'})
            .then((card) => {
              cardId = card.id;
              expect(card).to.exist;
              expect(card.createdAt).to.exist;
              expect(card.updatedAt).to.exist;
              expect(card.cardpackId).to.not.exist;
              expect(card.cardpack).to.exist;
              expect(card.cardpack.id).to.equal(cardpack.id);
              expect(card.text).to.equal('test card');
              expect(card.type).to.equal('white');
              expect(card.answerFields).to.not.exist;
            });
        });
    });
    it('Should always set card answerFields to null for white cards, even if a value for it is provided', () => {
      let user = mockDB.users[0];
      return Cardpack.create(user.email, 'cardpack_name')
        .then((cardpack) => {
          return Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: 'white', answerFields: 3})
            .then((card) => {
              expect(card.answerFields).to.not.exist;
            });
        });
    });
    it('Should set card answerFields to input value if a value for it is provided', () => {
      let user = mockDB.users[0];
      return Cardpack.create(user.email, 'cardpack_name')
        .then((cardpack) => {
          return Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: 'black', answerFields: 3})
            .then((card) => {
              expect(card.answerFields).to.equal(3);
            });
        });
    });
    it('Should throw error when setting answerFields to a value greater than three', () => {
      let user = mockDB.users[0];
      return Cardpack.create(user.email, 'cardpack_name')
        .then((cardpack) => {
          return expect(Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: 'black', answerFields: 4})).to.be.rejectedWith('Expected answerFields to be 1, 2, or 3 but it received');
        });
    });
    it('Should throw error when setting answerFields to a value less than one', () => {
      let user = mockDB.users[0];
      return Cardpack.create(user.email, 'cardpack_name')
        .then((cardpack) => {
          return expect(Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: 'black', answerFields: 0})).to.be.rejectedWith('Expected answerFields to be 1, 2, or 3 but it received');
        });
    });
    it('Should set card answerFields to one if no value is provided', () => {
      let user = mockDB.users[0];
      return Cardpack.create(user.email, 'cardpack_name')
        .then((cardpack) => {
          return Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: 'black'})
            .then((card) => {
              expect(card.answerFields).to.equal(1);
            });
        });
    });
    it('Should not create a card if the card type is invalid', () => {
      let user = mockDB.users[0];
      let fakeCardType = 'fakeType';
      return Cardpack.create(user.email, 'cardpack_name')
        .then((cardpack) => {
          return expect(Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: fakeCardType})).to.be.rejectedWith('Expected card type to be white or black, but instead received ' + fakeCardType);
        });
    });
    it('Should not create a card if the card text is blank', () => {
      let user = mockDB.users[0];
      return Cardpack.create(user.email, 'cardpack_name')
        .then((cardpack) => {
          return expect(Card.create({userId: user.id, cardpackId: cardpack.id, text: '', type: 'white'})).to.be.rejectedWith('Expected card text to be a non-empty string, but instead received '); // Received nothing because we used an empty string
        });
    });
    it('Should not create a card if the cardpack ID doesn\'t map to an existing cardpack', () => {
      let user = mockDB.users[0];
      return Cardpack.create(user.email, 'cardpack_name')
        .then((cardpack) => {
          return expect(Card.create({userId: user.id, cardpackId: -1, text: 'card_name', type: 'white'})).to.be.rejectedWith('Cardpack does not exist');
        });
    });
    it('Should not create a card if the card creator is not the cardpack owner', () => {
      let user = mockDB.users[0];
      let otherUser = mockDB.users[1];
      let cardpack = mockDB.cardpacks[0];
      return Cardpack.create(user.email, cardpack.name)
        .then(() => {
          return expect(Card.create({userId: otherUser.id, cardpackId: cardpack.id, text: 'test', type: 'white'})).to.be.rejectedWith('Cannot create cards in a cardpack that you do not own');
        });
    });
    it('Should not throw an error when creating a white card that has answerFields set to null instead of undefined', () => {
      let user = mockDB.users[0];
      let otherUser = mockDB.users[1];
      let cardpack = mockDB.cardpacks[0];
      return Cardpack.create(user.email, cardpack.name)
        .then(() => {
          return Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test', type: 'white', answerFields: null});
        });
    });
  });

  describe('update()', () => {
    let user = mockDB.users[0];
    let cardpack = mockDB.cardpacks[0];
    beforeEach(() => {
      return Cardpack.create(user.email, cardpack.name);
    });
    it('Should modify an existing card', () => {
      return Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: 'white'})
        .then((card) => {
          let cardName = 'updated card name';
          return Card.update(user.email, cardId, cardName)
            .then((card) => {
              expect(card).to.exist;
              expect(card.createdAt).to.exist;
              expect(card.updatedAt).to.exist;
              expect(card.id).to.equal(cardId);
              expect(card.text).to.equal(cardName);
            });
        });
    });
    it('Should contain answerFields property for black cards', () => {
      return Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: 'black'})
        .then((card) => {
          let cardName = 'updated card name';
          return Card.update(user.email, cardId, cardName)
            .then((card) => {
              expect(card.answerFields).to.equal(1);
            });
        });
    });
    it('Should not contain answerFields property for white cards', () => {
      return Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: 'white'})
        .then((card) => {
          let cardName = 'updated card name';
          return Card.update(user.email, cardId, cardName)
            .then((card) => {
              expect(card.answerFields).to.not.exist;
            });
        });
    });
    it('Should reject when modifying a card that is not owned by the user modifying the card', () => {
      let user = mockDB.users[0];
      return Cardpack.create(user.email, 'cardpack_name')
        .then((cardpack) => {
          return Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: 'black'})
            .then((card) => {
              let fakeEmail = 'thisisafake@email.com';
              return expect(Card.update(fakeEmail, card.id, 'updated card name')).to.be.rejectedWith('User does not exist');
            });
        });
    });
    it('Should reject when modifying a card using an email that is not tied to a user', () => {
      let user = mockDB.users[0];
      let otherUser = mockDB.users[1];
      return Cardpack.create(user.email, 'cardpack_name')
        .then((cardpack) => {
          return Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: 'black'})
            .then((card) => {
              return expect(Card.update(otherUser.email, card.id, 'updated card name')).to.be.rejectedWith('User does not own the cardpack that this card belongs to');
            });
        });
    });
    it('Should reject when passing in a card ID that does not map to an existing card', () => {
      let user = mockDB.users[0];
      let otherUser = mockDB.users[1];
      let cardpack = mockDB.cardpacks[0];
      return Cardpack.create(user.email, cardpack.name)
        .then(() => {
          return expect(Card.update(user.email, 123456789, 'updated card name')).to.be.rejectedWith('Card ID does not map to an existing card');
        });
    });
    it('Should reject when changing card text to a blank string', () => {
      let user = mockDB.users[0];
      let cardpack = mockDB.cardpacks[0];
      return Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: 'white'})
        .then((card) => {
          return expect(Card.update(user.email, cardId, '')).to.be.rejectedWith('Card should be a non-empty string');
        });
    });
  });

  describe('getById', () => {
    it('Should get by ID for a valid card', () => {
      let user = mockDB.users[0];
      return Cardpack.create(user.email, 'cardpack_name')
        .then((cardpack) => {
          return Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: 'black'})
            .then((card) => {
              return Card.getById(card.id)
                .then(() => {
                  expect(card).to.exist;
                  expect(card.createdAt).to.exist;
                  expect(card.updatedAt).to.exist;
                  expect(card.cardpackId).to.not.exist;
                  expect(card.cardpack).to.exist;
                  expect(card.cardpack.id).to.equal(cardpack.id);
                  expect(card.text).to.equal('test card');
                  expect(card.type).to.equal('black');
                });
            });
        });
    });
    it('Should reject when getting a card using an invalid ID', () => {
      let cardId = 1;
      return expect(Card.getById(cardId)).to.be.rejectedWith('Card ID does not map to an existing card');
    });
    it('Should have answerFields property for black cards', () => {
      let user = mockDB.users[0];
      return Cardpack.create(user.email, 'cardpack_name')
        .then((cardpack) => {
          return Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: 'black'})
            .then((card) => {
              return Card.getById(card.id)
                .then(() => {
                  expect(card.answerFields).to.equal(1);
                });
            });
        });
    });
    it('Should not have answerFields property for white cards', () => {
      let user = mockDB.users[0];
      return Cardpack.create(user.email, 'cardpack_name')
        .then((cardpack) => {
          return Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: 'white'})
            .then((card) => {
              return Card.getById(card.id)
                .then(() => {
                  expect(card.answerFields).to.not.exist;
                });
            });
        });
    });
  });

  describe('delete()', () => {
    let user = mockDB.users[0];
    let otherUser = mockDB.users[1];
    let cardpack = mockDB.cardpacks[0];
    beforeEach(() => {
      return Cardpack.create(user.email, cardpack.name);
    });
    it('Should reject when deleting a card you do not own', () => {
      return Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: 'white'})
        .then(() => {
          return expect(Card.delete(otherUser.email, cardId)).to.be.rejectedWith('User does not own this card');
        });
    });
    it('Should reject when deleting a card that does not exist', () => {
      let user = mockDB.users[0];
      return expect(Card.delete(user.email, 123456789)).to.be.rejectedWith('Card ID does not map to an existing card');
    });
    it('Should delete a card when all parameters are valid', () => {
      let user = mockDB.users[0];
      let cardpack = mockDB.cardpacks[0];
      return Card.create({userId: user.id, cardpackId: cardpack.id, text: 'test card', type: 'white'})
        .then(() => {
          return Card.delete(user.email, cardId);
        })
        .then((deletedCard) => {
          expect(deletedCard).to.exist;
        });
    });
  });
});

// TODO - Add this test to cardpack tests
// TODO - Add tests for Card.getByCardpackId
// describe('Functions', () => {
  
//   it('Should get cards for a cardpack', () => {
//     let ownerEmail = mockDB.users[0].email;
//     let cardpackName = mockDB.cardpacks[0].name;
//     return Cardpack.create(ownerEmail, cardpackName)
//     ;
//     return Card.getByCardpackId(cardpackId)
//       .then((cards) => {
//         expect(cards.length).to.equal(2);
//       });
//   });
// });