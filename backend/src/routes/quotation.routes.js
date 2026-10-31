const express = require('express');
const quotationController = require('../controllers/quotation.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'STAFF'), (req, res, next) => quotationController.getAll(req, res, next));
router.get('/:id', authorize('ADMIN', 'STAFF'), (req, res, next) => quotationController.getById(req, res, next));
router.post('/', authorize('ADMIN', 'STAFF'), (req, res, next) => quotationController.create(req, res, next));
router.post('/:id/convert', authorize('ADMIN', 'STAFF'), (req, res, next) => quotationController.convertToSubscription(req, res, next));

module.exports = router;
