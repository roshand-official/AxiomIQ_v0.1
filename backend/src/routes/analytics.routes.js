const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', authorize('ADMIN', 'STAFF'), (req, res, next) => analyticsController.getDashboardKpis(req, res, next));
router.get('/revenue-trends', authorize('ADMIN', 'STAFF'), (req, res, next) => analyticsController.getRevenueTrends(req, res, next));
router.get('/revenue-risk', authorize('ADMIN', 'STAFF'), (req, res, next) => analyticsController.getRevenueRisk(req, res, next));

module.exports = router;
