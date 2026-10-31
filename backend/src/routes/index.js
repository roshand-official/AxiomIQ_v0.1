const express = require('express');
const authRoutes = require('./auth.routes');
const customerRoutes = require('./customer.routes');
const productRoutes = require('./product.routes');
const planRoutes = require('./plan.routes');
const quotationRoutes = require('./quotation.routes');
const subscriptionRoutes = require('./subscription.routes');
const billingRoutes = require('./billing.routes');
const invoiceRoutes = require('./invoice.routes');
const paymentRoutes = require('./payment.routes');
const discountRoutes = require('./discount.routes');
const staffRoutes = require('./staff.routes');
const analyticsRoutes = require('./analytics.routes');
const portalRoutes = require('./portal.routes');

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'AxiomIQ Subscription Management API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mounted API sub-routers
router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/plans', planRoutes);
router.use('/quotations', quotationRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/billing', billingRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/discounts', discountRoutes);
router.use('/staff', staffRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/portal', portalRoutes);

module.exports = router;
