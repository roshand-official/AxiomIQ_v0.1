const express = require('express');
const planController = require('../controllers/plan.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res, next) => planController.getAll(req, res, next));
router.get('/:id', (req, res, next) => planController.getById(req, res, next));
router.post('/', authorize('ADMIN'), (req, res, next) => planController.create(req, res, next));
router.put('/:id', authorize('ADMIN'), (req, res, next) => planController.update(req, res, next));

module.exports = router;
