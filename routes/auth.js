const express = require('express');
const {
  validateOnRegisterUser,
  validateOnLoginUser,
  validateOnChangeUserPassword
} = require('../models/User');
const { register, login, changePassword, me } = require('../controllers/auth');
const validateRequestBody = require('../middlewares/validateRequestBody');
const authenticate = require('../middlewares/authenticate');
const router = express.Router();

router.post('/register', validateRequestBody(validateOnRegisterUser), register);
router.post('/login', validateRequestBody(validateOnLoginUser), login);
router.post(
  '/change-password',
  authenticate,
  validateRequestBody(validateOnChangeUserPassword),
  changePassword
);
router.get('/me', authenticate, me);

module.exports = router;
