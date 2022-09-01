const User = require('../models/user');
const {
  OK,
  INCORRECT_DATA,
  NOT_FOUND,
  GENERAL_ERROR,
} = require('./status-codes');

function getUsers(req, res) {
  User.find({})
    .then((users) => res.send(users))
    .catch(() => res.status(GENERAL_ERROR).send({ message: 'Error' }));
}

function getUser(req, res) {
  User.findById(req.params.userId)
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(NOT_FOUND).send({ message: 'Такого пользователя нет' });
        return;
      }
      res.status(GENERAL_ERROR).send({ message: err.message });
    });
}

function createUser(req, res) {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA).send({ message: 'Переданы некорректные данные' });
        return;
      }
      res.status(GENERAL_ERROR).send({ message: err.message });
    });
}

function patchUser(req, res) {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about })
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(NOT_FOUND).send({ message: 'Такого пользователя нет' });
        return;
      }
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA).send({ message: 'Переданы некорректные данные' });
        return;
      }
      res.status(GENERAL_ERROR).send({ message: err.message });
    });
}

function patchAvatar(req, res) {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(NOT_FOUND).send({ message: 'Такого пользователя нет' });
        return;
      }
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA).send({ message: 'Переданы некорректные данные' });
        return;
      }
      res.status(GENERAL_ERROR).send({ message: err.message });
    });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  patchUser,
  patchAvatar,
};
