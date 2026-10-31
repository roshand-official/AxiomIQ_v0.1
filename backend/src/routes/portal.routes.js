const express = require('express');
const portalController = require('../controllers/portal.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);
// Accessible by Customers (or Admins testing portal)
router.use(authorize('CUSTOMER', 'ADMIN'));

router.get('/dashboard', (req, res, next) => portalController.getDashboard(req, res, next));
router.get('/subscriptions', (req, res, next) => portalController.getSubscriptions(req, res, next));
router.get('/invoices', (req, res, next) => portalController.getInvoices(req, res, next));
router.get('/payments', (req, res, next) => portalController.getPayments(req, res, next));
router.post('/renewals', (req, res, next) => portalController.requestRenewal(req, res, next));

module.exports = router;
