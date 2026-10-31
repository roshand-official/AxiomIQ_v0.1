// src/contexts/AppContext.jsx
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  mockCustomers, mockStaff, mockProducts, mockProductVariants,
  mockSubscriptionPlans, mockQuotations, mockSubscriptions,
  mockBillingCycles, mockBillingEvents, mockInvoices, mockPayments,
  mockDiscounts, mockRenewals, mockActivities, mockNotifications,
} from '../data/mockData';
import { generateId } from '../utils/formatters';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [customers, setCustomers] = useState(() => [...mockCustomers]);
  const [staff, setStaff] = useState(() => [...mockStaff]);
  const [products, setProducts] = useState(() => [...mockProducts]);
  const [productVariants, setProductVariants] = useState(() => [...mockProductVariants]);
  const [plans, setPlans] = useState(() => [...mockSubscriptionPlans]);
  const [quotations, setQuotations] = useState(() => [...mockQuotations]);
  const [subscriptions, setSubscriptions] = useState(() => [...mockSubscriptions]);
  const [billingCycles, setBillingCycles] = useState(() => [...mockBillingCycles]);
  const [billingEvents, setBillingEvents] = useState(() => [...mockBillingEvents]);
  const [invoices, setInvoices] = useState(() => [...mockInvoices]);
  const [payments, setPayments] = useState(() => [...mockPayments]);
  const [discounts, setDiscounts] = useState(() => [...mockDiscounts]);
  const [renewals, setRenewals] = useState(() => [...mockRenewals]);
  const [activities, setActivities] = useState(() => [...mockActivities]);
  const [notifications, setNotifications] = useState(() => [...mockNotifications]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ─── Generic CRUD helpers ──────────────────────────────────────────────
  const addItem = useCallback((setter, item) => {
    setter(prev => [item, ...prev]);
  }, []);

  const updateItem = useCallback((setter, id, updates) => {
    setter(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const removeItem = useCallback((setter, id) => {
    setter(prev => prev.filter(item => item.id !== id));
  }, []);

  // ─── Activity logger ──────────────────────────────────────────────────
  const logActivity = useCallback((type, entityType, entityId, customerId, userId, message) => {
    const activity = {
      id: generateId('ACT'),
      type,
      entityType,
      entityId,
      customerId,
      userId,
      message,
      timestamp: new Date().toISOString(),
    };
    setActivities(prev => [activity, ...prev]);
  }, []);

  // ─── Notification helper ──────────────────────────────────────────────
  const addNotification = useCallback((type, title, message, link = null, userId = null) => {
    const notif = {
      id: generateId('NOT'),
      userId,
      type,
      title,
      message,
      link,
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id) => {
    updateItem(setNotifications, id, { read: true });
  }, [updateItem]);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // ─── Customer operations ──────────────────────────────────────────────
  const addCustomer = useCallback((data) => {
    const customer = { ...data, id: generateId('CUST'), createdAt: new Date().toISOString() };
    addItem(setCustomers, customer);
    logActivity('customer_created', 'customer', customer.id, customer.id, null, `New customer ${customer.company || customer.name} added.`);
    return customer;
  }, [addItem, logActivity]);

  const updateCustomer = useCallback((id, data) => {
    updateItem(setCustomers, id, data);
  }, [updateItem]);

  const deleteCustomer = useCallback((id) => {
    removeItem(setCustomers, id);
  }, [removeItem]);

  // ─── Product operations ────────────────────────────────────────────────
  const addProduct = useCallback((data) => {
    const product = { ...data, id: generateId('PROD'), createdAt: new Date().toISOString() };
    addItem(setProducts, product);
    return product;
  }, [addItem]);

  const updateProduct = useCallback((id, data) => {
    updateItem(setProducts, id, data);
  }, [updateItem]);

  const deleteProduct = useCallback((id) => {
    updateItem(setProducts, id, { status: 'inactive' });
  }, [updateItem]);

  // ─── Variant operations ────────────────────────────────────────────────
  const addVariant = useCallback((data) => {
    const variant = { ...data, id: generateId('VAR') };
    addItem(setProductVariants, variant);
    return variant;
  }, [addItem]);

  const updateVariant = useCallback((id, data) => {
    updateItem(setProductVariants, id, data);
  }, [updateItem]);

  // ─── Plan operations ──────────────────────────────────────────────────
  const addPlan = useCallback((data) => {
    const plan = { ...data, id: generateId('PLAN'), createdAt: new Date().toISOString() };
    addItem(setPlans, plan);
    return plan;
  }, [addItem]);

  const updatePlan = useCallback((id, data) => {
    updateItem(setPlans, id, data);
  }, [updateItem]);

  // ─── Quotation operations ─────────────────────────────────────────────
  const addQuotation = useCallback((data) => {
    const quo = { ...data, id: generateId('QUO'), createdAt: new Date().toISOString() };
    addItem(setQuotations, quo);
    logActivity('quotation_created', 'quotation', quo.id, quo.customerId, null, `Quotation ${quo.id} created.`);
    return quo;
  }, [addItem, logActivity]);

  const updateQuotation = useCallback((id, data) => {
    updateItem(setQuotations, id, data);
  }, [updateItem]);

  const convertQuotationToSubscription = useCallback((quotationId) => {
    const quo = quotations.find(q => q.id === quotationId);
    if (!quo) return null;
    const sub = {
      id: generateId('SUB'),
      customerId: quo.customerId,
      planId: quo.planId,
      quotationId: quo.id,
      subscriptionNumber: `BL-SUB-${new Date().getFullYear()}-${generateId('').slice(-3)}`,
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: null,
      nextBillingDate: new Date().toISOString().split('T')[0],
      paymentTerms: 'Net 15',
      status: 'confirmed',
      recurringAmount: quo.totalAmount,
      createdAt: new Date().toISOString(),
      lines: quo.lines.map(l => ({ ...l, taxRate: quo.taxRate })),
    };
    addItem(setSubscriptions, sub);
    updateItem(setQuotations, quotationId, { status: 'converted', convertedToSubscription: sub.id });
    logActivity('subscription_created', 'subscription', sub.id, quo.customerId, null, `Subscription ${sub.subscriptionNumber} created from quotation ${quotationId}.`);
    return sub;
  }, [quotations, addItem, updateItem, logActivity]);

  // ─── Subscription operations ──────────────────────────────────────────
  const addSubscription = useCallback((data) => {
    const sub = { ...data, id: generateId('SUB'), createdAt: new Date().toISOString() };
    addItem(setSubscriptions, sub);
    logActivity('subscription_created', 'subscription', sub.id, sub.customerId, null, `Subscription ${sub.subscriptionNumber} created.`);
    return sub;
  }, [addItem, logActivity]);

  const updateSubscriptionStatus = useCallback((id, newStatus, userId) => {
    updateItem(setSubscriptions, id, { status: newStatus });
    const sub = subscriptions.find(s => s.id === id);
    logActivity(`subscription_${newStatus}`, 'subscription', id, sub?.customerId, userId, `Subscription ${sub?.subscriptionNumber || id} status changed to ${newStatus}.`);
  }, [updateItem, subscriptions, logActivity]);

  // ─── Invoice operations ────────────────────────────────────────────────
  const addInvoice = useCallback((data) => {
    const inv = { ...data, id: generateId('INV'), createdAt: new Date().toISOString() };
    addItem(setInvoices, inv);
    return inv;
  }, [addItem]);

  const updateInvoice = useCallback((id, data) => {
    updateItem(setInvoices, id, data);
  }, [updateItem]);

  // ─── Payment operations ────────────────────────────────────────────────
  const registerPayment = useCallback((data) => {
    const payment = {
      ...data,
      id: generateId('PAY'),
      reference: `BL-PAY-${new Date().getFullYear()}-${generateId('').slice(-3)}`,
      status: 'completed',
    };
    addItem(setPayments, payment);

    // Update invoice
    const invoice = invoices.find(i => i.id === data.invoiceId);
    if (invoice) {
      const newAmountPaid = invoice.amountPaid + data.amount;
      const newOutstanding = invoice.totalAmount - newAmountPaid;
      const newStatus = newOutstanding <= 0 ? 'paid' : 'partially_paid';
      updateItem(setInvoices, invoice.id, {
        amountPaid: newAmountPaid,
        outstandingAmount: Math.max(0, newOutstanding),
        status: newStatus,
      });
    }

    logActivity('payment_received', 'payment', payment.id, data.customerId, null,
      `Payment of ₹${data.amount.toLocaleString('en-IN')} received via ${data.method}.`);
    addNotification('success', 'Payment Received',
      `Payment of ₹${data.amount.toLocaleString('en-IN')} recorded successfully.`, '/admin/payments');

    return payment;
  }, [addItem, invoices, updateItem, logActivity, addNotification]);

  // ─── Discount operations ──────────────────────────────────────────────
  const addDiscount = useCallback((data) => {
    const disc = { ...data, id: generateId('DISC'), currentUsage: 0, createdAt: new Date().toISOString() };
    addItem(setDiscounts, disc);
    return disc;
  }, [addItem]);

  const updateDiscount = useCallback((id, data) => {
    updateItem(setDiscounts, id, data);
  }, [updateItem]);

  // ─── Staff operations ─────────────────────────────────────────────────
  const addStaffMember = useCallback((data) => {
    const member = { ...data, id: generateId('USR'), joinedAt: new Date().toISOString(), lastActivity: new Date().toISOString() };
    addItem(setStaff, member);
    return member;
  }, [addItem]);

  const updateStaffMember = useCallback((id, data) => {
    updateItem(setStaff, id, data);
  }, [updateItem]);

  // ─── Renewal operations ────────────────────────────────────────────────
  const requestRenewal = useCallback((subscriptionId, customerId, userId) => {
    const sub = subscriptions.find(s => s.id === subscriptionId);
    const renewal = {
      id: generateId('REN'),
      subscriptionId,
      customerId,
      renewalDate: sub?.expiryDate || new Date().toISOString().split('T')[0],
      amount: sub?.recurringAmount || 0,
      status: 'requested',
      requestedBy: userId,
      requestedAt: new Date().toISOString(),
      notes: 'Renewal requested by customer.',
    };
    addItem(setRenewals, renewal);
    logActivity('renewal_requested', 'renewal', renewal.id, customerId, userId, `Renewal requested for subscription ${sub?.subscriptionNumber || subscriptionId}.`);
    addNotification('info', 'Renewal Request', `Renewal requested for ${sub?.subscriptionNumber || subscriptionId}.`, `/admin/subscriptions/${subscriptionId}`);
    return renewal;
  }, [subscriptions, addItem, logActivity, addNotification]);

  // ─── Billing simulation ────────────────────────────────────────────────
  const executeBillingRun = useCallback((billingDate, eligibleSubIds) => {
    const results = { successful: [], failed: [], skipped: [] };
    const eligible = subscriptions.filter(s => eligibleSubIds.includes(s.id));

    eligible.forEach(sub => {
      if (sub.status !== 'active') {
        results.failed.push({ subscriptionId: sub.id, reason: `Subscription is ${sub.status}, not active.` });
        const be = {
          id: generateId('BE'),
          billingCycleId: null,
          subscriptionId: sub.id,
          type: 'billing_failed',
          message: `Billing failed: Subscription ${sub.subscriptionNumber} is ${sub.status}.`,
          timestamp: new Date().toISOString(),
        };
        addItem(setBillingEvents, be);
        return;
      }

      // Check for duplicate
      const existing = invoices.find(i => i.subscriptionId === sub.id &&
        i.invoiceDate === billingDate && i.status !== 'cancelled');
      if (existing) {
        results.skipped.push({ subscriptionId: sub.id, reason: 'Invoice already exists for this period.' });
        return;
      }

      const inv = {
        id: generateId('INV'),
        invoiceNumber: `BL-INV-${new Date().getFullYear()}-${generateId('').slice(-3)}`,
        customerId: sub.customerId,
        subscriptionId: sub.id,
        invoiceDate: billingDate,
        dueDate: new Date(new Date(billingDate).getTime() + 15 * 86400000).toISOString().split('T')[0],
        subtotal: sub.lines.reduce((sum, l) => sum + l.subtotal, 0),
        taxRate: 18,
        taxAmount: Math.round(sub.lines.reduce((sum, l) => sum + l.subtotal, 0) * 0.18),
        discountAmount: 0,
        totalAmount: sub.recurringAmount,
        amountPaid: 0,
        outstandingAmount: sub.recurringAmount,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        lines: sub.lines.map(l => ({
          productId: l.productId,
          description: `${l.productId} × ${l.quantity}`,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate: l.taxRate,
          subtotal: l.subtotal,
        })),
      };
      addItem(setInvoices, inv);

      const bc = {
        id: generateId('BC'),
        subscriptionId: sub.id,
        periodStart: billingDate,
        periodEnd: billingDate,
        billingDate,
        amount: sub.recurringAmount,
        status: 'invoiced',
        invoiceId: inv.id,
      };
      addItem(setBillingCycles, bc);

      const be = {
        id: generateId('BE'),
        billingCycleId: bc.id,
        subscriptionId: sub.id,
        type: 'billing_success',
        message: `Invoice ${inv.invoiceNumber} generated successfully.`,
        timestamp: new Date().toISOString(),
      };
      addItem(setBillingEvents, be);

      results.successful.push({ subscriptionId: sub.id, invoiceId: inv.id, amount: sub.recurringAmount });
    });

    logActivity('billing_executed', 'billing', null, null, null,
      `Billing run completed — ${results.successful.length} invoices generated, ${results.failed.length} failed.`);

    return results;
  }, [subscriptions, invoices, addItem, logActivity]);

  // ─── Derived data ─────────────────────────────────────────────────────
  const getCustomerById = useCallback((id) => customers.find(c => c.id === id), [customers]);
  const getProductById = useCallback((id) => products.find(p => p.id === id), [products]);
  const getPlanById = useCallback((id) => plans.find(p => p.id === id), [plans]);
  const getSubscriptionById = useCallback((id) => subscriptions.find(s => s.id === id), [subscriptions]);
  const getInvoiceById = useCallback((id) => invoices.find(i => i.id === id), [invoices]);

  const getCustomerSubscriptions = useCallback((customerId) =>
    subscriptions.filter(s => s.customerId === customerId), [subscriptions]);

  const getCustomerInvoices = useCallback((customerId) =>
    invoices.filter(i => i.customerId === customerId), [invoices]);

  const getCustomerPayments = useCallback((customerId) =>
    payments.filter(p => p.customerId === customerId), [payments]);

  const getSubscriptionInvoices = useCallback((subscriptionId) =>
    invoices.filter(i => i.subscriptionId === subscriptionId), [invoices]);

  const getInvoicePayments = useCallback((invoiceId) =>
    payments.filter(p => p.invoiceId === invoiceId), [payments]);

  const getProductVariants = useCallback((productId) =>
    productVariants.filter(v => v.productId === productId), [productVariants]);

  const value = useMemo(() => ({
    // Data
    customers, staff, products, productVariants, plans,
    quotations, subscriptions, billingCycles, billingEvents,
    invoices, payments, discounts, renewals, activities, notifications,
    sidebarCollapsed,

    // Setters
    setSidebarCollapsed,

    // Customer ops
    addCustomer, updateCustomer, deleteCustomer,
    // Product ops
    addProduct, updateProduct, deleteProduct,
    // Variant ops
    addVariant, updateVariant,
    // Plan ops
    addPlan, updatePlan,
    // Quotation ops
    addQuotation, updateQuotation, convertQuotationToSubscription,
    // Subscription ops
    addSubscription, updateSubscriptionStatus,
    // Invoice ops
    addInvoice, updateInvoice,
    // Payment ops
    registerPayment,
    // Discount ops
    addDiscount, updateDiscount,
    // Staff ops
    addStaffMember, updateStaffMember,
    // Renewal ops
    requestRenewal,
    // Billing
    executeBillingRun,
    // Notifications
    addNotification, markNotificationRead, markAllNotificationsRead,
    // Activity
    logActivity,

    // Lookups
    getCustomerById, getProductById, getPlanById, getSubscriptionById, getInvoiceById,
    getCustomerSubscriptions, getCustomerInvoices, getCustomerPayments,
    getSubscriptionInvoices, getInvoicePayments, getProductVariants,
  }), [
    customers, staff, products, productVariants, plans,
    quotations, subscriptions, billingCycles, billingEvents,
    invoices, payments, discounts, renewals, activities, notifications,
    sidebarCollapsed,
    addCustomer, updateCustomer, deleteCustomer,
    addProduct, updateProduct, deleteProduct,
    addVariant, updateVariant,
    addPlan, updatePlan,
    addQuotation, updateQuotation, convertQuotationToSubscription,
    addSubscription, updateSubscriptionStatus,
    addInvoice, updateInvoice,
    registerPayment,
    addDiscount, updateDiscount,
    addStaffMember, updateStaffMember,
    requestRenewal,
    executeBillingRun,
    addNotification, markNotificationRead, markAllNotificationsRead,
    logActivity,
    getCustomerById, getProductById, getPlanById, getSubscriptionById, getInvoiceById,
    getCustomerSubscriptions, getCustomerInvoices, getCustomerPayments,
    getSubscriptionInvoices, getInvoicePayments, getProductVariants,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
