const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers,
  getUser,
  patchUser,
  patchAvatar,
  getSelf,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getSelf);
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().hex().length(24),
  }),
}), getUser);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), patchUser);
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required()
      .regex(/^https?:\/\/(?:www\.)?[-a-zA-z0-9:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-z0-9()@:%_\\+.~#?&/=]*)$/),
  }),
}), patchAvatar);

module.exports = router;
