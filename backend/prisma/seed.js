const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting AxoimIQQI Database Seeding...');

  // Clean existing records in reverse dependency order
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.renewalRequest.deleteMany();
  await prisma.billingEvent.deleteMany();
  await prisma.billingRun.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.subscriptionItem.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 1. Create Users
  console.log('👤 Seeding Users & Staff Profiles...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@AxoimIQqi.io',
      passwordHash,
      role: 'ADMIN',
      firstName: 'Vikram',
      lastName: 'Aditya',
      phone: '+91 98765 43210',
    },
  });

  const staffUser1 = await prisma.user.create({
    data: {
      email: 'rahul.verma@AxoimIQqi.io',
      passwordHash,
      role: 'STAFF',
      firstName: 'Rahul',
      lastName: 'Verma',
      phone: '+91 98111 22334',
    },
  });

  const staffUser2 = await prisma.user.create({
    data: {
      email: 'priya.sharma@AxoimIQqi.io',
      passwordHash,
      role: 'STAFF',
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+91 98222 33445',
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: 'rajesh@apexsolutions.in',
      passwordHash,
      role: 'CUSTOMER',
      firstName: 'Rajesh',
      lastName: 'Nambiar',
      phone: '+91 98450 12345',
    },
  });

  const staff1 = await prisma.staff.create({
    data: {
      userId: staffUser1.id,
      employeeCode: 'EMP-2026-101',
      designation: 'Senior Accounts Specialist',
      department: 'Operations & Billing',
    },
  });

  const staff2 = await prisma.staff.create({
    data: {
      userId: staffUser2.id,
      employeeCode: 'EMP-2026-102',
      designation: 'Client Success Lead',
      department: 'Customer Success',
    },
  });

  // 2. Create Customers
  console.log('🏢 Seeding Indian Corporate Customers...');
  const custApex = await prisma.customer.create({
    data: {
      customerCode: 'CUST-2026-1001',
      userId: customerUser.id,
      name: 'Rajesh Nambiar',
      company: 'Apex Solutions Pvt Ltd',
      email: 'rajesh@apexsolutions.in',
      phone: '+91 98450 12345',
      addressLine1: 'TechZone 4, Outer Ring Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560103',
      type: 'ENTERPRISE',
      status: 'ACTIVE',
      totalInvoiced: 42480.00,
      amountPaid: 42480.00,
      outstandingBalance: 0.00,
      assignedStaffId: staff1.id,
    },
  });

  const custZest = await prisma.customer.create({
    data: {
      customerCode: 'CUST-2026-1002',
      name: 'Ananya Deshmukh',
      company: 'Zest Cloud Technologies',
      email: 'ananya@zestcloud.com',
      phone: '+91 98230 55667',
      addressLine1: 'Magarpatta Cybercity, Tower 7',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '411028',
      type: 'SMB',
      status: 'ACTIVE',
      totalInvoiced: 35400.00,
      amountPaid: 20000.00,
      outstandingBalance: 15400.00,
      assignedStaffId: staff1.id,
    },
  });

  const custBharat = await prisma.customer.create({
    data: {
      customerCode: 'CUST-2026-1003',
      name: 'Suresh Patel',
      company: 'Bharat Retail Logistics Ltd',
      email: 'suresh@bharatlogistics.in',
      phone: '+91 99090 88776',
      addressLine1: 'Bhiwandi Warehousing Hub, Sector 3',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400001',
      type: 'ENTERPRISE',
      status: 'ACTIVE',
      totalInvoiced: 58998.00,
      amountPaid: 35000.00,
      outstandingBalance: 23998.00,
      assignedStaffId: staff2.id,
    },
  });

  const custSurya = await prisma.customer.create({
    data: {
      customerCode: 'CUST-2026-1004',
      name: 'Kavita Rao',
      company: 'Surya Analytics Labs',
      email: 'kavita@suryalabs.co',
      phone: '+91 94400 33221',
      addressLine1: 'HITEC City, Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      postalCode: '500081',
      type: 'SMB',
      status: 'ACTIVE',
      totalInvoiced: 18880.00,
      amountPaid: 10000.00,
      outstandingBalance: 8880.00,
      assignedStaffId: staff2.id,
    },
  });

  // 3. Create Products & Variants
  console.log('📦 Seeding Products & Variants (including Odoo Brand edition)...');
  const prodBusinessSuite = await prisma.product.create({
    data: {
      internalRef: 'PROD-BS-01',
      name: 'AxoimIQQI Business Suite Pro',
      type: 'SOFTWARE_SUBSCRIPTION',
      salesPrice: 12000.00,
      costPrice: 4500.00,
      description: 'Unified recurring billing, subscription orchestration, and contract management engine.',
      isSubscriptionAvailable: true,
      variants: {
        create: [
          {
            name: 'Standard Cloud Edition',
            attribute: 'Brand',
            additionalPrice: 0.00,
            salesPrice: 12000.00,
          },
          {
            name: 'Odoo Brand Edition',
            attribute: 'Brand',
            additionalPrice: 560.00, // Per problem spec (page 3)
            salesPrice: 12560.00,
          },
          {
            name: 'Enterprise Dedicated Single-Tenant',
            attribute: 'Tier',
            additionalPrice: 4500.00,
            salesPrice: 16500.00,
          },
        ],
      },
    },
    include: { variants: true },
  });

  const prodAnalyticsAddon = await prisma.product.create({
    data: {
      internalRef: 'PROD-AN-02',
      name: 'Advanced Cohort & Revenue Analytics Add-on',
      type: 'ADD_ON',
      salesPrice: 3500.00,
      costPrice: 800.00,
      description: 'LTV, ARR cohort waterfall charts, automated churn indicators, and custom CSV exports.',
      isSubscriptionAvailable: true,
    },
  });

  const prodPrioritySLA = await prisma.product.create({
    data: {
      internalRef: 'PROD-SLA-03',
      name: '24x7 Dedicated SLA Support Package',
      type: 'ADD_ON',
      salesPrice: 5000.00,
      costPrice: 1200.00,
      description: 'Guaranteed 15-minute response SLA with dedicated technical account manager.',
      isSubscriptionAvailable: true,
    },
  });

  const prodMigration = await prisma.product.create({
    data: {
      internalRef: 'PROD-MIG-04',
      name: 'Enterprise Cloud Onboarding & Data Migration',
      type: 'ONE_TIME',
      salesPrice: 25000.00,
      costPrice: 8000.00,
      description: 'Full white-glove ETL ingestion from spreadsheets or legacy CRM into AxoimIQQI.',
      isSubscriptionAvailable: false,
    },
  });

  // 4. Create Subscription Plans
  console.log('📅 Seeding Subscription Plans...');
  const planMonthly = await prisma.subscriptionPlan.create({
    data: {
      code: 'PLAN-M-PRO',
      name: 'Professional Monthly Plan',
      description: 'Monthly recurring billing with 30-day payment cycle.',
      frequency: 'MONTHLY',
      interval: 1,
      minimumQuantity: 1,
      canCloseEarly: true,
      canPause: true,
      canRenew: true,
      basePrice: 12000.00,
    },
  });

  const planAnnual = await prisma.subscriptionPlan.create({
    data: {
      code: 'PLAN-Y-ENT',
      name: 'Enterprise Annual Contract',
      description: 'Annual billing arrangement with discounted recurring rates.',
      frequency: 'YEARLY',
      interval: 1,
      minimumQuantity: 1,
      canCloseEarly: true,
      canPause: true,
      canRenew: true,
      basePrice: 120000.00,
    },
  });

  const planWeekly = await prisma.subscriptionPlan.create({
    data: {
      code: 'PLAN-W-DEV',
      name: 'Developer Weekly Sprint',
      description: 'High-frequency weekly billing for rapid project teams.',
      frequency: 'WEEKLY',
      interval: 1,
      minimumQuantity: 1,
      canCloseEarly: true,
      canPause: false,
      canRenew: true,
      basePrice: 3200.00,
    },
  });

  // 5. Create Discounts
  console.log('🏷️ Seeding Discounts...');
  const disc20 = await prisma.discount.create({
    data: {
      code: 'GROWTH20',
      name: 'Growth Stage 20% Discount',
      type: 'PERCENTAGE',
      value: 20.00,
      minPurchase: 10000.00,
      minQuantity: 1,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      maxUsage: 100,
      currentUsage: 14,
      scope: 'WHOLE_SUBSCRIPTION',
    },
  });

  const discFlat = await prisma.discount.create({
    data: {
      code: 'FLAT1500',
      name: 'Startup Onboarding Flat ₹1,500 Off',
      type: 'FIXED_AMOUNT',
      value: 1500.00,
      minPurchase: 8000.00,
      minQuantity: 1,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      maxUsage: 50,
      currentUsage: 8,
      scope: 'WHOLE_SUBSCRIPTION',
    },
  });

  // 6. Create Subscriptions
  console.log('🔄 Seeding Subscriptions & Items...');
  const odooVariant = prodBusinessSuite.variants.find((v) => v.name === 'Odoo Brand Edition');

  const subApex = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-1001',
      customerId: custApex.id,
      planId: planMonthly.id,
      status: 'ACTIVE',
      startDate: new Date('2026-01-01'),
      expiryDate: new Date('2026-12-31'),
      nextBillingDate: new Date('2026-11-01'),
      lastBilledDate: new Date('2026-10-01'),
      paymentTerms: 'NET_30',
      recurringAmount: 18950.80, // Total with taxes
      autoRenew: true,
      items: {
        create: [
          {
            productId: prodBusinessSuite.id,
            variantId: odooVariant ? odooVariant.id : null,
            quantity: 1,
            unitPrice: 12560.00,
            taxRate: 18.00,
            taxAmount: 2260.80,
            subtotal: 12560.00,
          },
          {
            productId: prodAnalyticsAddon.id,
            quantity: 1,
            unitPrice: 3500.00,
            taxRate: 18.00,
            taxAmount: 630.00,
            subtotal: 3500.00,
          },
        ],
      },
    },
  });

  const subBharat = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-1002',
      customerId: custBharat.id,
      planId: planMonthly.id,
      status: 'ACTIVE',
      startDate: new Date('2026-03-01'),
      expiryDate: new Date('2027-02-28'),
      nextBillingDate: new Date('2026-11-05'),
      lastBilledDate: new Date('2026-10-05'),
      paymentTerms: 'NET_30',
      recurringAmount: 20650.00,
      autoRenew: true,
      items: {
        create: [
          {
            productId: prodBusinessSuite.id,
            quantity: 1,
            unitPrice: 12000.00,
            taxRate: 18.00,
            taxAmount: 2160.00,
            subtotal: 12000.00,
          },
          {
            productId: prodPrioritySLA.id,
            quantity: 1,
            unitPrice: 5000.00,
            taxRate: 18.00,
            taxAmount: 900.00,
            subtotal: 5000.00,
          },
        ],
      },
    },
  });

  const subSurya = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-1003',
      customerId: custSurya.id,
      planId: planMonthly.id,
      status: 'PAUSED',
      pauseReason: 'Seasonal enterprise pause requested by client',
      startDate: new Date('2026-02-15'),
      expiryDate: new Date('2027-02-14'),
      nextBillingDate: new Date('2026-11-15'),
      paymentTerms: 'NET_30',
      recurringAmount: 14160.00,
      autoRenew: false,
      items: {
        create: [
          {
            productId: prodBusinessSuite.id,
            quantity: 1,
            unitPrice: 12000.00,
            taxRate: 18.00,
            taxAmount: 2160.00,
            subtotal: 12000.00,
          },
        ],
      },
    },
  });

  // 7. Create Invoices & Payments
  console.log('🧾 Seeding Invoices & Payment Records...');
  const inv1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-001',
      customerId: custApex.id,
      subscriptionId: subApex.id,
      status: 'PAID',
      invoiceDate: new Date('2026-10-01'),
      dueDate: new Date('2026-10-31'),
      subtotal: 16060.00,
      taxRate: 18.00,
      taxAmount: 2890.80,
      discountAmount: 0.00,
      totalAmount: 18950.80,
      amountPaid: 18950.80,
      amountOutstanding: 0.00,
      items: {
        create: [
          {
            productId: prodBusinessSuite.id,
            description: 'AxoimIQQI Business Suite Pro (Odoo Brand Edition)',
            quantity: 1,
            unitPrice: 12560.00,
            taxRate: 18.00,
            taxAmount: 2260.80,
            subtotal: 12560.00,
          },
          {
            productId: prodAnalyticsAddon.id,
            description: 'Advanced Cohort & Revenue Analytics Add-on',
            quantity: 1,
            unitPrice: 3500.00,
            taxRate: 18.00,
            taxAmount: 630.00,
            subtotal: 3500.00,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2026-101',
      customerId: custApex.id,
      invoiceId: inv1.id,
      amount: 18950.80,
      paymentMethod: 'BANK_TRANSFER',
      paymentDate: new Date('2026-10-15'),
      referenceNumber: 'HDFC-NEFT-998822',
      status: 'SUCCESS',
      notes: 'Cleared via HDFC Corporate NetBanking',
      processedById: adminUser.id,
    },
  });

  const inv2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-002',
      customerId: custBharat.id,
      subscriptionId: subBharat.id,
      status: 'PARTIALLY_PAID',
      invoiceDate: new Date('2026-10-05'),
      dueDate: new Date('2026-11-04'),
      subtotal: 17000.00,
      taxRate: 18.00,
      taxAmount: 3060.00,
      discountAmount: 0.00,
      totalAmount: 20060.00,
      amountPaid: 10000.00,
      amountOutstanding: 10060.00,
      items: {
        create: [
          {
            productId: prodBusinessSuite.id,
            description: 'AxoimIQQI Business Suite Pro',
            quantity: 1,
            unitPrice: 12000.00,
            taxRate: 18.00,
            taxAmount: 2160.00,
            subtotal: 12000.00,
          },
          {
            productId: prodPrioritySLA.id,
            description: '24x7 Dedicated SLA Support Package',
            quantity: 1,
            unitPrice: 5000.00,
            taxRate: 18.00,
            taxAmount: 900.00,
            subtotal: 5000.00,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2026-102',
      customerId: custBharat.id,
      invoiceId: inv2.id,
      amount: 10000.00,
      paymentMethod: 'UPI',
      paymentDate: new Date('2026-10-20'),
      referenceNumber: 'UPI/AXIS/20261020001',
      status: 'SUCCESS',
      notes: 'First tranche paid via UPI',
      processedById: staffUser1.id,
    },
  });

  const inv3 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-003',
      customerId: custSurya.id,
      subscriptionId: subSurya.id,
      status: 'OVERDUE',
      invoiceDate: new Date('2026-09-15'),
      dueDate: new Date('2026-10-15'), // Overdue!
      subtotal: 12000.00,
      taxRate: 18.00,
      taxAmount: 2160.00,
      discountAmount: 0.00,
      totalAmount: 14160.00,
      amountPaid: 0.00,
      amountOutstanding: 14160.00,
      items: {
        create: [
          {
            productId: prodBusinessSuite.id,
            description: 'AxoimIQQI Business Suite Pro',
            quantity: 1,
            unitPrice: 12000.00,
            taxRate: 18.00,
            taxAmount: 2160.00,
            subtotal: 12000.00,
          },
        ],
      },
    },
  });

  // 8. Create Billing Run History
  console.log('⚡ Seeding Automated Billing History...');
  const billingRun = await prisma.billingRun.create({
    data: {
      runNumber: 'BR-202610-001',
      executionDate: new Date('2026-10-01'),
      billingDate: new Date('2026-10-01'),
      totalProcessed: 4,
      successCount: 3,
      failedCount: 0,
      skippedCount: 1,
      totalInvoiced: 53170.80,
      durationMs: 1420,
      status: 'COMPLETED',
      triggeredById: adminUser.id,
      events: {
        create: [
          {
            subscriptionId: subApex.id,
            customerId: custApex.id,
            invoiceId: inv1.id,
            status: 'SUCCESS',
            amount: 18950.80,
          },
          {
            subscriptionId: subBharat.id,
            customerId: custBharat.id,
            invoiceId: inv2.id,
            status: 'SUCCESS',
            amount: 20060.00,
          },
        ],
      },
    },
  });

  console.log('✅ AxoimIQQI Database Seeding Finished Successfully!');
  console.log('🔑 Credentials Seeded:');
  console.log('   - Admin:    admin@AxoimIQqi.io       | Password@123');
  console.log('   - Staff:    rahul.verma@AxoimIQqi.io | Password@123');
  console.log('   - Customer: rajesh@apexsolutions.in   | Password@123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
