const Card = require('../models/card');
const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');
const {
  OK,
} = require('../utils/status-codes');

function getCards(req, res, next) {
  Card.find({})
    .then((cards) => res.status(OK).send(cards))
    .catch(next);
}

function createCard(req, res, next) {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(OK).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const newErr = new BadRequestError('Переданы некорректные данные');
        next(newErr);
      }
      next(err);
    });
}

function deleteCard(req, res, next) {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Такого пользователя нет');
      }
      if (req.user._id !== card.owner.toString()) {
        throw new ForbiddenError('Удалить чужую карточку нельзя');
      }
      card.remove();
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const newErr = new BadRequestError('Переданы некорректные данные');
        next(newErr);
      }
      next(err);
    });
}

function likeCard(req, res, next) {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Такого пользователя нет');
      }
      res.status(OK).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const newErr = new BadRequestError('Переданы некорректные данные');
        next(newErr);
      }
      next(err);
    });
}

function dislikeCard(req, res, next) {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Такого пользователя нет');
      }
      res.status(OK).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const newErr = new BadRequestError('Переданы некорректные данные');
        next(newErr);
      }
      next(err);
    });
}

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
