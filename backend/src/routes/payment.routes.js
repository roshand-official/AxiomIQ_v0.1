const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'STAFF'), (req, res, next) => paymentController.getAll(req, res, next));
router.get('/:id', authorize('ADMIN', 'STAFF'), (req, res, next) => paymentController.getById(req, res, next));
router.post('/register', authorize('ADMIN', 'STAFF'), (req, res, next) => paymentController.register(req, res, next));

module.exports = router;
