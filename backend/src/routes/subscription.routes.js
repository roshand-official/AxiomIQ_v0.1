const express = require('express');
const subscriptionController = require('../controllers/subscription.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'STAFF'), (req, res, next) => subscriptionController.getAll(req, res, next));
router.get('/:id', authorize('ADMIN', 'STAFF'), (req, res, next) => subscriptionController.getById(req, res, next));
router.post('/', authorize('ADMIN', 'STAFF'), (req, res, next) => subscriptionController.create(req, res, next));
router.patch('/:id/status', authorize('ADMIN', 'STAFF'), (req, res, next) => subscriptionController.updateStatus(req, res, next));
router.post('/:id/renew', authorize('ADMIN', 'STAFF'), (req, res, next) => subscriptionController.renew(req, res, next));

module.exports = router;
