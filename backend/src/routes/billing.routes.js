const express = require('express');
const billingController = require('../controllers/billing.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

// Billing center operations
router.get('/preview', authorize('ADMIN', 'STAFF'), (req, res, next) => billingController.preview(req, res, next));
router.post('/execute', authorize('ADMIN'), (req, res, next) => billingController.execute(req, res, next));
router.get('/runs', authorize('ADMIN', 'STAFF'), (req, res, next) => billingController.getRuns(req, res, next));
router.get('/runs/:id', authorize('ADMIN', 'STAFF'), (req, res, next) => billingController.getRunById(req, res, next));

module.exports = router;
