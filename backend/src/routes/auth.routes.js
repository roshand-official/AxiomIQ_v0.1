const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.requestPasswordReset(req, res, next));
router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));

module.exports = router;
