const Card = require('../models/card');
const {
  OK,
  NO_DATA,
  INCORRECT_DATA,
  NOT_FOUND,
  GENERAL_ERROR,
} = require('./status-codes');

function getCards(req, res) {
  Card.find({})
    .then((cards) => res.status(OK).send(cards))
    .catch((err) => res.status(GENERAL_ERROR).send({ message: err.message }));
}

function createCard(req, res) {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(OK).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA).send({ message: 'Переданы некорректные данные' });
        return;
      }
      res.status(GENERAL_ERROR).send({ message: err.message });
    });
}

function deleteCard(req, res) {
  Card.findByIdAndRemove(req.params.cardId)
    .then(res.status(NO_DATA))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(NOT_FOUND).send({ message: 'Такой карточки нет' });
        return;
      }
      res.status(GENERAL_ERROR).send({ message: err.message });
    });
}

function likeCard(req, res) {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then(res.status(OK))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA).send({ message: 'Переданы некорректные данные' });
        return;
      }
      if (err.name === 'CastError') {
        res.status(NOT_FOUND).send({ message: 'Такой карточки нет' });
        return;
      }
      res.send({ message: err.message });
    });
}

function dislikeCard(req, res) {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then(res.status(OK))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA).send({ message: 'Переданы некорректные данные' });
        return;
      }
      if (err.name === 'CastError') {
        res.status(NOT_FOUND).send({ message: 'Такой карточки нет' });
        return;
      }
      res.send({ message: err.message });
    });
}

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
