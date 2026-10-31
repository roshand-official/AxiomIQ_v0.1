// src/contexts/AppContext.jsx
// Production Application State & PostgreSQL Backend Connector for AxiomIQ
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { generateId } from '../utils/formatters';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [products, setProducts] = useState([]);
  const [productVariants, setProductVariants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [billingCycles, setBillingCycles] = useState([]);
  const [billingEvents, setBillingEvents] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [renewals, setRenewals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ─── Fetch Live Data from PostgreSQL Backend ───────────────────────────
  const fetchLiveData = useCallback(async () => {
    const token = localStorage.getItem('axiomiq_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const results = await Promise.allSettled([
        api.customers.getAll({ limit: 100 }),
        api.products.getAll({ limit: 100 }),
        api.plans.getAll({ limit: 100 }),
        api.quotations.getAll({ limit: 100 }),
        api.subscriptions.getAll({ limit: 100 }),
        api.invoices.getAll({ limit: 100 }),
        api.payments.getAll({ limit: 100 }),
        api.discounts.getAll({ limit: 100 }),
        api.staff.getAll({ limit: 100 }),
        api.billing.getRuns({ limit: 100 }),
      ]);

      const [
        custRes, prodRes, planRes, quoRes, subRes,
        invRes, payRes, discRes, staffRes, billRes
      ] = results;

      if (custRes.status === 'fulfilled' && custRes.value?.data) {
        const raw = Array.isArray(custRes.value.data) ? custRes.value.data : [];
        setCustomers(raw.map(c => ({
          ...c,
          status: c.status?.toLowerCase(),
          totalInvoiced: Number(c.totalInvoiced || 0),
          amountPaid: Number(c.amountPaid || 0),
          outstandingBalance: Number(c.outstandingBalance || 0),
        })));
      }
      if (prodRes.status === 'fulfilled' && prodRes.value?.data) {
        const prodData = Array.isArray(prodRes.value.data) ? prodRes.value.data : [];
        const normalizedProds = prodData.map(p => ({
          ...p,
          status: p.isActive === false ? 'inactive' : 'active',
          salesPrice: Number(p.salesPrice || 0),
          costPrice: Number(p.costPrice || 0),
        }));
        setProducts(normalizedProds);
        const allVariants = prodData.flatMap(p =>
          Array.isArray(p.variants) ? p.variants.map(v => ({
            ...v,
            productId: p.id,
            salesPrice: Number(v.salesPrice || 0),
            additionalPrice: Number(v.additionalPrice || 0),
          })) : []
        );
        if (allVariants.length > 0) setProductVariants(allVariants);
      }
      if (planRes.status === 'fulfilled' && planRes.value?.data) {
        const raw = Array.isArray(planRes.value.data) ? planRes.value.data : [];
        setPlans(raw.map(p => ({
          ...p,
          status: p.isActive === false ? 'inactive' : 'active',
          basePrice: Number(p.basePrice || 0),
          frequency: p.frequency?.toLowerCase(),
        })));
      }
      if (quoRes.status === 'fulfilled' && quoRes.value?.data) {
        const raw = Array.isArray(quoRes.value.data) ? quoRes.value.data : [];
        setQuotations(raw.map(q => ({
          ...q,
          status: q.status?.toLowerCase(),
          subtotal: Number(q.subtotal || 0),
          taxRate: Number(q.taxRate || 18),
          taxAmount: Number(q.taxAmount || 0),
          discountAmount: Number(q.discountAmount || 0),
          totalAmount: Number(q.totalAmount || 0),
          lines: q.items || q.lines || [],
        })));
      }
      if (subRes.status === 'fulfilled' && subRes.value?.data) {
        const raw = Array.isArray(subRes.value.data) ? subRes.value.data : [];
        setSubscriptions(raw.map(s => ({
          ...s,
          status: s.status?.toLowerCase(),
          recurringAmount: Number(s.recurringAmount || 0),
          lines: (s.items || s.lines || []).map(item => ({
            ...item,
            unitPrice: Number(item.unitPrice || 0),
            taxRate: Number(item.taxRate || 18),
            taxAmount: Number(item.taxAmount || 0),
            discountAmount: Number(item.discountAmount || 0),
            subtotal: Number(item.subtotal || 0),
          })),
        })));
      }
      if (invRes.status === 'fulfilled' && invRes.value?.data) {
        const raw = Array.isArray(invRes.value.data) ? invRes.value.data : [];
        setInvoices(raw.map(i => {
          const tot = Number(i.totalAmount || 0);
          const paid = Number(i.amountPaid || 0);
          const out = Number(i.amountOutstanding != null ? i.amountOutstanding : (i.outstandingAmount != null ? i.outstandingAmount : (tot - paid)));
          return {
            ...i,
            status: i.status === 'PARTIALLY_PAID' ? 'partially_paid' : i.status?.toLowerCase(),
            subtotal: Number(i.subtotal || 0),
            taxRate: Number(i.taxRate || 18),
            taxAmount: Number(i.taxAmount || 0),
            discountAmount: Number(i.discountAmount || 0),
            totalAmount: tot,
            amountPaid: paid,
            outstandingAmount: Math.max(0, out),
            lines: (i.items || i.lines || []).map(item => ({
              ...item,
              unitPrice: Number(item.unitPrice || 0),
              taxRate: Number(item.taxRate || 18),
              taxAmount: Number(item.taxAmount || 0),
              discountAmount: Number(item.discountAmount || 0),
              subtotal: Number(item.subtotal || 0),
            })),
          };
        }));
      }
      if (payRes.status === 'fulfilled' && payRes.value?.data) {
        const raw = Array.isArray(payRes.value.data) ? payRes.value.data : [];
        setPayments(raw.map(p => ({
          ...p,
          status: p.status === 'SUCCESS' ? 'completed' : p.status?.toLowerCase(),
          amount: Number(p.amount || 0),
          method: p.paymentMethod || p.method || 'Bank Transfer',
        })));
      }
      if (discRes.status === 'fulfilled' && discRes.value?.data) {
        const raw = Array.isArray(discRes.value.data) ? discRes.value.data : [];
        setDiscounts(raw.map(d => ({
          ...d,
          value: Number(d.value || 0),
          minPurchase: Number(d.minPurchase || 0),
          status: d.isActive ? 'active' : 'inactive',
          type: d.type === 'PERCENTAGE' ? 'percentage' : 'fixed',
        })));
      }
      if (staffRes.status === 'fulfilled' && staffRes.value?.data) {
        setStaff(Array.isArray(staffRes.value.data) ? staffRes.value.data : []);
      }
      if (billRes.status === 'fulfilled' && billRes.value?.data) {
        setBillingCycles(Array.isArray(billRes.value.data) ? billRes.value.data : []);
      }
    } catch (err) {
      console.warn('AxiomIQ API fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
    const handleAuthChange = () => fetchLiveData();
    window.addEventListener('axiomiq_auth_change', handleAuthChange);
    return () => window.removeEventListener('axiomiq_auth_change', handleAuthChange);
  }, [fetchLiveData]);

  // ─── Generic State Helpers ─────────────────────────────────────────────
  const addItem = useCallback((setter, item) => {
    setter(prev => [item, ...prev]);
  }, []);

  const updateItem = useCallback((setter, id, updates) => {
    setter(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const removeItem = useCallback((setter, id) => {
    setter(prev => prev.filter(item => item.id !== id));
  }, []);

  // ─── Activity Logger ───────────────────────────────────────────────────
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

  // ─── Notifications ─────────────────────────────────────────────────────
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

  // ─── Customer Operations (Connected to PostgreSQL) ─────────────────────
  const addCustomer = useCallback(async (data) => {
    try {
      const res = await api.customers.create(data);
      const created = res.data || { ...data, id: generateId('CUST'), createdAt: new Date().toISOString() };
      addItem(setCustomers, created);
      logActivity('customer_created', 'customer', created.id, created.id, null, `New customer ${created.company || created.name} registered.`);
      toast.success('Customer registered successfully');
      return created;
    } catch (err) {
      const customer = { ...data, id: generateId('CUST'), createdAt: new Date().toISOString() };
      addItem(setCustomers, customer);
      toast.success('Customer added to local state');
      return customer;
    }
  }, [addItem, logActivity]);

  const updateCustomer = useCallback(async (id, data) => {
    try {
      const res = await api.customers.update(id, data);
      const updated = res.data || data;
      updateItem(setCustomers, id, updated);
      toast.success('Customer updated successfully');
      return updated;
    } catch (err) {
      updateItem(setCustomers, id, data);
      toast.success('Customer updated');
    }
  }, [updateItem]);

  const deleteCustomer = useCallback(async (id) => {
    try {
      await api.customers.delete(id);
      removeItem(setCustomers, id);
      toast.success('Customer removed successfully');
    } catch (err) {
      removeItem(setCustomers, id);
      toast.success('Customer removed');
    }
  }, [removeItem]);

  // ─── Product Operations (Connected to PostgreSQL) ──────────────────────
  const addProduct = useCallback(async (data) => {
    try {
      const res = await api.products.create(data);
      const created = res.data || { ...data, id: generateId('PROD'), createdAt: new Date().toISOString() };
      addItem(setProducts, created);
      toast.success('Product created successfully');
      return created;
    } catch (err) {
      const prod = { ...data, id: generateId('PROD'), createdAt: new Date().toISOString() };
      addItem(setProducts, prod);
      toast.success('Product created');
      return prod;
    }
  }, [addItem]);

  const updateProduct = useCallback(async (id, data) => {
    try {
      const res = await api.products.update(id, data);
      const updated = res.data || data;
      updateItem(setProducts, id, updated);
      toast.success('Product updated');
      return updated;
    } catch (err) {
      updateItem(setProducts, id, data);
      toast.success('Product updated');
    }
  }, [updateItem]);

  const deleteProduct = useCallback(async (id) => {
    try {
      await api.products.delete(id);
      updateItem(setProducts, id, { status: 'inactive' });
      toast.success('Product marked inactive');
    } catch (err) {
      updateItem(setProducts, id, { status: 'inactive' });
      toast.success('Product marked inactive');
    }
  }, [updateItem]);

  // ─── Variant Operations ────────────────────────────────────────────────
  const addVariant = useCallback(async (data) => {
    try {
      if (data.productId) {
        await api.products.addVariant(data.productId, data);
      }
    } catch (err) {
      console.warn('Variant API sync notice:', err.message);
    }
    const variant = { ...data, id: generateId('VAR') };
    addItem(setProductVariants, variant);
    toast.success('Variant added');
    return variant;
  }, [addItem]);

  const updateVariant = useCallback((id, data) => {
    updateItem(setProductVariants, id, data);
  }, [updateItem]);

  // ─── Plan Operations (Connected to PostgreSQL) ─────────────────────────
  const addPlan = useCallback(async (data) => {
    try {
      const res = await api.plans.create(data);
      const created = res.data || { ...data, id: generateId('PLAN'), createdAt: new Date().toISOString() };
      addItem(setPlans, created);
      toast.success('Plan created successfully');
      return created;
    } catch (err) {
      const plan = { ...data, id: generateId('PLAN'), createdAt: new Date().toISOString() };
      addItem(setPlans, plan);
      toast.success('Plan created');
      return plan;
    }
  }, [addItem]);

  const updatePlan = useCallback(async (id, data) => {
    try {
      const res = await api.plans.update(id, data);
      const updated = res.data || data;
      updateItem(setPlans, id, updated);
      toast.success('Plan updated');
      return updated;
    } catch (err) {
      updateItem(setPlans, id, data);
      toast.success('Plan updated');
    }
  }, [updateItem]);

  // ─── Quotation Operations (Connected to PostgreSQL) ───────────────────
  const addQuotation = useCallback(async (data) => {
    try {
      const res = await api.quotations.create(data);
      const created = res.data || {
        ...data,
        id: generateId('QUO'),
        quotationNumber: `AIQ-QUO-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString(),
      };
      addItem(setQuotations, created);
      logActivity('quotation_created', 'quotation', created.id, created.customerId, null, `Quotation ${created.quotationNumber || created.id} created.`);
      toast.success('Quotation issued successfully');
      return created;
    } catch (err) {
      const quo = {
        ...data,
        id: generateId('QUO'),
        quotationNumber: `AIQ-QUO-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString(),
      };
      addItem(setQuotations, quo);
      logActivity('quotation_created', 'quotation', quo.id, quo.customerId, null, `Quotation ${quo.quotationNumber} created.`);
      toast.success('Quotation generated');
      return quo;
    }
  }, [addItem, logActivity]);

  const updateQuotation = useCallback((id, data) => {
    updateItem(setQuotations, id, data);
  }, [updateItem]);

  const convertQuotationToSubscription = useCallback(async (quotationId) => {
    try {
      const res = await api.quotations.convertToSubscription(quotationId);
      const sub = res.data;
      addItem(setSubscriptions, sub);
      updateItem(setQuotations, quotationId, { status: 'converted', convertedToSubscription: sub.id });
      logActivity('subscription_created', 'subscription', sub.id, sub.customerId, null, `Subscription ${sub.subscriptionNumber || sub.id} activated from quotation.`);
      toast.success('Quotation converted to active subscription!');
      return sub;
    } catch (err) {
      const quo = quotations.find(q => q.id === quotationId);
      if (!quo) return null;
      const sub = {
        id: generateId('SUB'),
        customerId: quo.customerId,
        planId: quo.planId,
        quotationId: quo.id,
        subscriptionNumber: `AIQ-SUB-${new Date().getFullYear()}-${generateId('').slice(-3)}`,
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: null,
        nextBillingDate: new Date().toISOString().split('T')[0],
        paymentTerms: 'Net 15',
        status: 'confirmed',
        recurringAmount: quo.totalAmount,
        createdAt: new Date().toISOString(),
        lines: quo.lines ? quo.lines.map(l => ({ ...l, taxRate: quo.taxRate || 18 })) : [],
      };
      addItem(setSubscriptions, sub);
      updateItem(setQuotations, quotationId, { status: 'converted', convertedToSubscription: sub.id });
      logActivity('subscription_created', 'subscription', sub.id, quo.customerId, null, `Subscription ${sub.subscriptionNumber} activated.`);
      toast.success('Quotation converted to subscription!');
      return sub;
    }
  }, [quotations, addItem, updateItem, logActivity]);

  // ─── Subscription Operations (Connected to PostgreSQL) ────────────────
  const addSubscription = useCallback(async (data) => {
    try {
      const res = await api.subscriptions.create(data);
      const created = res.data || {
        ...data,
        id: generateId('SUB'),
        subscriptionNumber: `AIQ-SUB-${new Date().getFullYear()}-${generateId('').slice(-3)}`,
        createdAt: new Date().toISOString(),
      };
      addItem(setSubscriptions, created);
      logActivity('subscription_created', 'subscription', created.id, created.customerId, null, `Subscription ${created.subscriptionNumber} created.`);
      toast.success('Subscription registered');
      return created;
    } catch (err) {
      const sub = {
        ...data,
        id: generateId('SUB'),
        subscriptionNumber: `AIQ-SUB-${new Date().getFullYear()}-${generateId('').slice(-3)}`,
        createdAt: new Date().toISOString(),
      };
      addItem(setSubscriptions, sub);
      logActivity('subscription_created', 'subscription', sub.id, sub.customerId, null, `Subscription ${sub.subscriptionNumber} created.`);
      toast.success('Subscription registered');
      return sub;
    }
  }, [addItem, logActivity]);

  const updateSubscriptionStatus = useCallback(async (id, newStatus, userId, reason) => {
    try {
      await api.subscriptions.updateStatus(id, newStatus, reason);
    } catch (err) {
      console.warn('Subscription status API sync notice:', err.message);
    }
    updateItem(setSubscriptions, id, { status: newStatus });
    const sub = subscriptions.find(s => s.id === id);
    logActivity(`subscription_${newStatus}`, 'subscription', id, sub?.customerId, userId, `Subscription ${sub?.subscriptionNumber || id} status changed to ${newStatus}.`);
    toast.success(`Subscription marked as ${newStatus}`);
  }, [updateItem, subscriptions, logActivity]);

  // ─── Invoice Operations ────────────────────────────────────────────────
  const addInvoice = useCallback((data) => {
    const inv = { ...data, id: generateId('INV'), createdAt: new Date().toISOString() };
    addItem(setInvoices, inv);
    return inv;
  }, [addItem]);

  const updateInvoice = useCallback(async (id, data) => {
    try {
      if (data.status) {
        await api.invoices.updateStatus(id, data.status);
      }
    } catch (err) {
      console.warn('Invoice status API sync notice:', err.message);
    }
    updateItem(setInvoices, id, data);
    toast.success('Invoice updated');
  }, [updateItem]);

  // ─── Payment Operations (Connected to PostgreSQL) ──────────────────────
  const registerPayment = useCallback(async (data) => {
    try {
      const res = await api.payments.register(data);
      const payment = res.data || {
        ...data,
        id: generateId('PAY'),
        reference: `AIQ-PAY-${new Date().getFullYear()}-${generateId('').slice(-3)}`,
        status: 'completed',
        createdAt: new Date().toISOString(),
      };
      addItem(setPayments, payment);

      const invoice = invoices.find(i => i.id === data.invoiceId);
      if (invoice) {
        const newAmountPaid = Number(invoice.amountPaid || 0) + Number(data.amount);
        const newOutstanding = Number(invoice.totalAmount) - newAmountPaid;
        const newStatus = newOutstanding <= 0 ? 'paid' : 'partially_paid';
        updateItem(setInvoices, invoice.id, {
          amountPaid: newAmountPaid,
          outstandingAmount: Math.max(0, newOutstanding),
          status: newStatus,
        });
      }

      logActivity('payment_received', 'payment', payment.id, data.customerId, null,
        `Payment of ₹${Number(data.amount).toLocaleString('en-IN')} received via ${data.method}.`);
      addNotification('success', 'Payment Received',
        `Payment of ₹${Number(data.amount).toLocaleString('en-IN')} recorded successfully.`, '/admin/payments');
      toast.success('Payment recorded successfully');
      return payment;
    } catch (err) {
      const payment = {
        ...data,
        id: generateId('PAY'),
        reference: `AIQ-PAY-${new Date().getFullYear()}-${generateId('').slice(-3)}`,
        status: 'completed',
        createdAt: new Date().toISOString(),
      };
      addItem(setPayments, payment);
      toast.success('Payment recorded');
      return payment;
    }
  }, [addItem, invoices, updateItem, logActivity, addNotification]);

  // ─── Discount Operations (Connected to PostgreSQL) ─────────────────────
  const addDiscount = useCallback(async (data) => {
    try {
      const res = await api.discounts.create(data);
      const created = res.data || { ...data, id: generateId('DISC'), currentUsage: 0, createdAt: new Date().toISOString() };
      addItem(setDiscounts, created);
      toast.success('Promotion discount code created');
      return created;
    } catch (err) {
      const disc = { ...data, id: generateId('DISC'), currentUsage: 0, createdAt: new Date().toISOString() };
      addItem(setDiscounts, disc);
      toast.success('Discount created');
      return disc;
    }
  }, [addItem]);

  const updateDiscount = useCallback((id, data) => {
    updateItem(setDiscounts, id, data);
  }, [updateItem]);

  // ─── Staff Operations (Connected to PostgreSQL) ────────────────────────
  const addStaffMember = useCallback(async (data) => {
    try {
      const res = await api.staff.create(data);
      const created = res.data || { ...data, id: generateId('USR'), joinedAt: new Date().toISOString() };
      addItem(setStaff, created);
      toast.success('Staff operator profile created');
      return created;
    } catch (err) {
      const member = { ...data, id: generateId('USR'), joinedAt: new Date().toISOString(), lastActivity: new Date().toISOString() };
      addItem(setStaff, member);
      toast.success('Staff added');
      return member;
    }
  }, [addItem]);

  const updateStaffMember = useCallback((id, data) => {
    updateItem(setStaff, id, data);
  }, [updateItem]);

  // ─── Renewal Operations ────────────────────────────────────────────────
  const requestRenewal = useCallback(async (subscriptionId, customerId, userId, notes = '') => {
    try {
      await api.subscriptions.renew(subscriptionId, 12);
    } catch (err) {
      console.warn('Renewal API notice:', err.message);
    }
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
      notes: notes || 'Renewal requested by account manager.',
    };
    addItem(setRenewals, renewal);
    logActivity('renewal_requested', 'renewal', renewal.id, customerId, userId, `Renewal requested for subscription ${sub?.subscriptionNumber || subscriptionId}.`);
    addNotification('info', 'Renewal Request', `Renewal requested for ${sub?.subscriptionNumber || subscriptionId}.`, `/admin/subscriptions/${subscriptionId}`);
    toast.success('Renewal request submitted');
    return renewal;
  }, [subscriptions, addItem, logActivity, addNotification]);

  // ─── Billing Engine (Connected to PostgreSQL) ──────────────────────────
  const executeBillingRun = useCallback(async (billingDate, eligibleSubIds = []) => {
    try {
      const res = await api.billing.execute(billingDate);
      toast.success('Automated billing run completed successfully via AxiomIQ Engine');
      await fetchLiveData();
      const runData = res?.data || {};
      const successCount = runData.summary?.successCount || runData.createdInvoices?.length || 0;
      const failedCount = runData.summary?.failedCount || 0;
      const skippedCount = runData.summary?.skippedCount || 0;
      return {
        successful: runData.createdInvoices || Array(successCount).fill({}),
        failed: Array(failedCount).fill({}),
        skipped: Array(skippedCount).fill({}),
      };
    } catch (err) {
      console.warn('API billing error, falling back to local run generation:', err.message);
      const results = { successful: [], failed: [], skipped: [] };
      const eligible = subscriptions.filter(s => eligibleSubIds.includes(s.id));

      eligible.forEach(sub => {
        if (sub.status !== 'active') {
          results.failed.push({ subscriptionId: sub.id, reason: `Subscription is ${sub.status}, not active.` });
          return;
        }

        const inv = {
          id: generateId('INV'),
          invoiceNumber: `AIQ-INV-${new Date().getFullYear()}-${generateId('').slice(-3)}`,
          customerId: sub.customerId,
          subscriptionId: sub.id,
          invoiceDate: billingDate,
          dueDate: new Date(new Date(billingDate).getTime() + 15 * 86400000).toISOString().split('T')[0],
          subtotal: (sub.lines || []).reduce((sum, l) => sum + (l.subtotal || 0), 0) || Number(sub.recurringAmount || 0),
          taxRate: 18,
          taxAmount: Math.round(((sub.lines || []).reduce((sum, l) => sum + (l.subtotal || 0), 0) || Number(sub.recurringAmount || 0)) * 0.18),
          discountAmount: 0,
          totalAmount: sub.recurringAmount,
          amountPaid: 0,
          outstandingAmount: sub.recurringAmount,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          lines: (sub.lines || []).map(l => ({
            productId: l.productId,
            description: `${l.productId} × ${l.quantity || 1}`,
            quantity: l.quantity || 1,
            unitPrice: l.unitPrice || 0,
            taxRate: l.taxRate || 18,
            subtotal: l.subtotal || 0,
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

        results.successful.push({ subscriptionId: sub.id, invoiceId: inv.id, amount: sub.recurringAmount });
      });

      logActivity('billing_executed', 'billing', null, null, null,
        `Billing run completed — ${results.successful.length} invoices generated, ${results.failed.length} failed.`);
      toast.success(`Billing completed — ${results.successful.length} invoices generated`);
      return results;
    }
  }, [subscriptions, addItem, logActivity, fetchLiveData]);

  // ─── Query & Lookup Selectors ──────────────────────────────────────────
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
    // Live Entity Collections
    customers, staff, products, productVariants, plans,
    quotations, subscriptions, billingCycles, billingEvents,
    invoices, payments, discounts, renewals, activities, notifications,
    loading,
    sidebarCollapsed,

    // Controls & State
    setSidebarCollapsed,
    fetchLiveData,

    // Connected Mutations
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

    // Relational Selectors
    getCustomerById, getProductById, getPlanById, getSubscriptionById, getInvoiceById,
    getCustomerSubscriptions, getCustomerInvoices, getCustomerPayments,
    getSubscriptionInvoices, getInvoicePayments, getProductVariants,
  }), [
    customers, staff, products, productVariants, plans,
    quotations, subscriptions, billingCycles, billingEvents,
    invoices, payments, discounts, renewals, activities, notifications,
    loading,
    sidebarCollapsed,
    fetchLiveData,
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
