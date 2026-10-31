const express = require('express');
const staffController = require('../controllers/staff.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

// Staff management is administrator-only
router.get('/', authorize('ADMIN'), (req, res, next) => staffController.getAll(req, res, next));
router.get('/:id', authorize('ADMIN'), (req, res, next) => staffController.getById(req, res, next));
router.post('/', authorize('ADMIN'), (req, res, next) => staffController.create(req, res, next));
router.post('/:id/assign-customers', authorize('ADMIN'), (req, res, next) => staffController.assignCustomers(req, res, next));

module.exports = router;
