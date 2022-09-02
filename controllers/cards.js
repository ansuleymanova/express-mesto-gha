const Card = require('../models/card');
const {
  OK,
  NO_CONTENT,
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  FORBIDDEN,
} = require('../utils/status-codes');

function getCards(req, res) {
  Card.find({})
    .then((cards) => res.status(OK).send(cards))
    .catch((err) => res.status(INTERNAL_SERVER_ERROR).send({ message: err.message }));
}

function createCard(req, res) {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(OK).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
        return;
      }
      res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
}

function deleteCard(req, res) {
  const card = Card.findById(req.params.cardId);
  if (req.user._id !== card.owner._id) {
    res.status(FORBIDDEN).send({ message: 'Нельзя удалить чужую карточку' });
    return;
  }
  Card.findByIdAndRemove(req.params.cardId)
    .then(res.status(NO_CONTENT))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(NOT_FOUND).send({ message: 'Такой карточки нет' });
        return;
      }
      res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
}

function likeCard(req, res) {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => res.status(OK).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
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
    .then((card) => res.status(OK).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
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
