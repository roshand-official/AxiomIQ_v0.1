const express = require('express');
const customerController = require('../controllers/customer.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

// Admin and Staff can manage customers
router.get('/', authorize('ADMIN', 'STAFF'), (req, res, next) => customerController.getAll(req, res, next));
router.get('/:id', authorize('ADMIN', 'STAFF'), (req, res, next) => customerController.getById(req, res, next));
router.post('/', authorize('ADMIN', 'STAFF'), (req, res, next) => customerController.create(req, res, next));
router.put('/:id', authorize('ADMIN', 'STAFF'), (req, res, next) => customerController.update(req, res, next));
router.delete('/:id', authorize('ADMIN'), (req, res, next) => customerController.delete(req, res, next));

module.exports = router;
