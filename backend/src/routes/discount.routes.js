const express = require('express');
const discountController = require('../controllers/discount.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'STAFF'), (req, res, next) => discountController.getAll(req, res, next));
router.get('/:id', authorize('ADMIN', 'STAFF'), (req, res, next) => discountController.getById(req, res, next));
router.post('/', authorize('ADMIN'), (req, res, next) => discountController.create(req, res, next));
router.post('/validate', authorize('ADMIN', 'STAFF'), (req, res, next) => discountController.validateCode(req, res, next));

module.exports = router;
