const db = require('../connection');
const Sequelize = require('sequelize');
const User = require('./user');

const CardpackModel = db.define('cardpacks', {
  id: {
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  },
  name: {
    type: Sequelize.STRING,
    notEmpty: true,
    allowNull: false
  }
});

let Cardpack = {model: CardpackModel};

// Returns a promise that will resolve with the cardpack data
//
// Exceptions:
// 1. userEmail does not map to an existing user
// 2. cardpackName is null/undefined/emptystring/notastring
Cardpack.create = (userEmail, cardpackName) => {
  if (!cardpackName || cardpackName.constructor !== String) {
    return new Promise((resolve, reject) => {
      reject('Cardpack name is invalid - name must be a non-empty string');
    });
  }

  return User.getByEmail(userEmail)
  .then((user) => {
    return Cardpack.model.create({
      name: cardpackName,
      ownerId: user.id
    })
    .then((cardpackImmutable) => {
      let cardpack = JSON.parse(JSON.stringify(cardpackImmutable)); // TODO - Fix this
      delete cardpack.ownerId;
      cardpack.owner = user;
      return cardpack;
    });
  });
};

// Returns a promise that will resolve with an array
// containing all cardpacks that the user owns or is
// subscribed to
//
// Exceptions:
// 1. userEmail does not map to an existing user
Cardpack.getByUserEmail = (userEmail) => {
  return User.getByEmail(userEmail)
  .then((user) => {
    return Cardpack.model.findAll({
      where: {
        ownerId: user.id
      },
      include: [{
        model: User.model,
        as: 'owner'
      }],
      attributes: {
        exclude: ['ownerId']
      }
    });
  });
};

Cardpack.getById = (cardpackId) => {
  return Cardpack.model.findOne({
    where: {
      id: cardpackId
    },
    include: [{
      model: User.model,
      as: 'owner'
    }],
    attributes: {
      exclude: ['ownerId']
    }
  })
  .then((cardpack) => {
    if (!cardpack) {
      throw new Error('Cardpack ID does not map to an existing cardpack');
    }
    return cardpack;
  });
};

// Returns a promise that will resolve with no
// data once the cardpack and all associated cards
// have been removed from the database
//
// Exceptions:
// 1. userEmail does not map to an existing user
// 1. cardpackId does not map to an existing cardpack
Cardpack.delete = (userEmail, cardpackId) => {
  return User.getByEmail(userEmail)
  .then((owner) => {
    return Cardpack.model.findOne({
      where: {
        id: cardpackId
      }
    })
    .then((cardpack) => {
      if (!cardpack) {
        return new Promise((resolve, reject) => {
          reject('Cardpack does not exist');
        });
      }
      if (cardpack.ownerId !== owner.id) {
        return new Promise((resolve, reject) => {
          reject(`Cannot delete someone else's cardpack`);
        });
      }

      return Cardpack.model.findAll({
        where: {id: cardpackId}
      })
      .then((cards) => {
        let cardDestructionPromises = [];
        cards.forEach((card) => {
          cardDestructionPromises.push(
            card.destroy()
          );
        });
        return Promise.all(cardDestructionPromises);
      })
      .then(() => {
        return cardpack.destroy()
      })
      .then(() => {
        return true;
      });
    });
  });
};

module.exports = Cardpack;