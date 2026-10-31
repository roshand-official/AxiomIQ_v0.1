const express = require('express');
const invoiceController = require('../controllers/invoice.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'STAFF'), (req, res, next) => invoiceController.getAll(req, res, next));
router.get('/:id', authorize('ADMIN', 'STAFF'), (req, res, next) => invoiceController.getById(req, res, next));
router.patch('/:id/status', authorize('ADMIN', 'STAFF'), (req, res, next) => invoiceController.updateStatus(req, res, next));

module.exports = router;
