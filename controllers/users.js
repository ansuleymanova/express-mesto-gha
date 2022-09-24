const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const UnauthorizedError = require('../errors/unauthorized-err');
const {
  OK,
} = require('../utils/status-codes');

function getUsers(req, res, next) {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
}

function getSelf(req, res, next) {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Такого пользователя нет');
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const newErr = new BadRequestError('Переданы некорректные данные');
        next(newErr);
      }
      next(err);
    });
}

function getUser(req, res, next) {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Такого пользователя нет');
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const newErr = new BadRequestError('Переданы некорректные данные');
        next(newErr);
      }
      next(err);
    });
}

function createUser(req, res, next) {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name, about, avatar, email, password: hash,
      })
        .then((user) => res.status(OK).send(user))
        .catch((err) => {
          if (err.code === 11000) {
            const newErr = new Error('Пользователь с такой почтой уже зарегистрирован');
            newErr.statusCode = 409;
            next(newErr);
          }
          if (err.name === 'ValidationError') {
            const newErr = new BadRequestError('Переданы некорректные данные');
            next(newErr);
          }
          next(err);
        });
    });
}

function patchUser(req, res, next) {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Такого пользователя нет');
      }
      res.status(OK).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        const newErr = new BadRequestError('Переданы некорректные данные');
        next(newErr);
      }
      next(err);
    });
}

function patchAvatar(req, res, next) {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Такого пользователя нет');
      }
      res.status(OK).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        const newErr = new BadRequestError('Переданы некорректные данные');
        next(newErr);
      }
      next(err);
    });
}

function login(req, res, next) {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password').then((user) => {
    if (!user) {
      throw new UnauthorizedError('Неверная почта или пароль');
    }
    bcrypt.compare(password, user.password).then((matched) => {
      if (!matched) {
        throw new UnauthorizedError('Неверная почта или пароль');
      }
      const token = jwt.sign(
        { _id: user._id },
        'extra-strong-password',
        { expiresIn: '7d' },
      );
      res.send({ token });
    });
  }).catch((err) => {
    if (err.name === 'CastError' || err.name === 'ValidationError') {
      const newErr = new BadRequestError('Переданы некорректные данные');
      next(newErr);
    }
    next(err);
  });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  patchUser,
  patchAvatar,
  login,
  getSelf,
};
