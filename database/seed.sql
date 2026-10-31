-- ==============================================================================
-- ANOIMQI SUBSCRIPTION MANAGEMENT SYSTEM - REALISTIC SEED DATASET
-- Database Name: anoimqi_db
-- ==============================================================================

-- 1. Roles
INSERT INTO roles (id, name, display_name, description, is_system_role) VALUES
('11111111-1111-1111-1111-111111111101', 'ROLE_ADMIN', 'Administrator', 'Full system access and financial controls', TRUE),
('11111111-1111-1111-1111-111111111102', 'ROLE_STAFF', 'Staff Operator', 'Operational access to customers, subscriptions, and billing', TRUE),
('11111111-1111-1111-1111-111111111103', 'ROLE_CUSTOMER', 'Customer', 'Self-service customer portal access', TRUE)
ON CONFLICT (name) DO NOTHING;

-- 2. Permissions
INSERT INTO permissions (id, code, module, action, description) VALUES
('22222222-2222-2222-2222-222222222201', 'AUTH_ALL', 'AUTH', 'ALL', 'Manage all authentication rules'),
('22222222-2222-2222-2222-222222222202', 'CUSTOMER_READ', 'CUSTOMER', 'READ', 'View customer details'),
('22222222-2222-2222-2222-222222222203', 'CUSTOMER_WRITE', 'CUSTOMER', 'WRITE', 'Create and modify customers'),
('22222222-2222-2222-2222-222222222204', 'PRODUCT_MANAGE', 'PRODUCT', 'ALL', 'Create and modify products and variants'),
('22222222-2222-2222-2222-222222222205', 'PLAN_MANAGE', 'PLAN', 'ALL', 'Manage subscription plans'),
('22222222-2222-2222-2222-222222222206', 'QUOTATION_MANAGE', 'QUOTATION', 'ALL', 'Create and process quotations'),
('22222222-2222-2222-2222-222222222207', 'SUBSCRIPTION_MANAGE', 'SUBSCRIPTION', 'ALL', 'Manage lifecycle of subscriptions'),
('22222222-2222-2222-2222-222222222208', 'BILLING_EXECUTE', 'BILLING', 'EXECUTE', 'Trigger and review billing runs'),
('22222222-2222-2222-2222-222222222209', 'INVOICE_MANAGE', 'INVOICE', 'ALL', 'Issue, review, and void invoices'),
('22222222-2222-2222-2222-222222222210', 'PAYMENT_RECORD', 'PAYMENT', 'WRITE', 'Record and allocate payments'),
('22222222-2222-2222-2222-222222222211', 'FINANCIAL_REPORTS', 'REPORTS', 'READ', 'Access ARR, MRR, risk and financial dashboards'),
('22222222-2222-2222-2222-222222222212', 'PORTAL_ACCESS', 'PORTAL', 'READ', 'Customer portal self-service')
ON CONFLICT (code) DO NOTHING;

-- 3. Role Permissions mapping
INSERT INTO role_permissions (role_id, permission_id)
SELECT '11111111-1111-1111-1111-111111111101', id FROM permissions
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT '11111111-1111-1111-1111-111111111102', id FROM permissions 
WHERE code IN ('CUSTOMER_READ', 'CUSTOMER_WRITE', 'QUOTATION_MANAGE', 'SUBSCRIPTION_MANAGE', 'INVOICE_MANAGE', 'PAYMENT_RECORD')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT '11111111-1111-1111-1111-111111111103', id FROM permissions 
WHERE code IN ('PORTAL_ACCESS')
ON CONFLICT DO NOTHING;

-- 4. Users (Passwords: Admin@123, Staff@123, Customer@123)
INSERT INTO users (id, email, password_hash, first_name, last_name, phone_number, is_active, is_email_verified) VALUES
('33333333-3333-3333-3333-333333333301', 'admin@anoimqi.io', '$2a$10$w3v6R49YqK7YyW8s7tQy..O/Fshg52pLpU3c1r0hR8jE397B5k1sS', 'Aditya', 'Verma', '+91 9876543210', TRUE, TRUE),
('33333333-3333-3333-3333-333333333302', 'sarah.ops@anoimqi.io', '$2a$10$w3v6R49YqK7YyW8s7tQy..O/Fshg52pLpU3c1r0hR8jE397B5k1sS', 'Sarah', 'Jenkins', '+91 9876543211', TRUE, TRUE),
('33333333-3333-3333-3333-333333333303', 'david.finance@anoimqi.io', '$2a$10$w3v6R49YqK7YyW8s7tQy..O/Fshg52pLpU3c1r0hR8jE397B5k1sS', 'David', 'Kumar', '+91 9876543212', TRUE, TRUE),
('33333333-3333-3333-3333-333333333304', 'tech@acmecorp.com', '$2a$10$w3v6R49YqK7YyW8s7tQy..O/Fshg52pLpU3c1r0hR8jE397B5k1sS', 'Rajesh', 'Sharma', '+91 9811122233', TRUE, TRUE),
('33333333-3333-3333-3333-333333333305', 'billing@globexinc.com', '$2a$10$w3v6R49YqK7YyW8s7tQy..O/Fshg52pLpU3c1r0hR8jE397B5k1sS', 'Priya', 'Nair', '+91 9822233344', TRUE, TRUE),
('33333333-3333-3333-3333-333333333306', 'founder@apexlogic.io', '$2a$10$w3v6R49YqK7YyW8s7tQy..O/Fshg52pLpU3c1r0hR8jE397B5k1sS', 'Karan', 'Mehta', '+91 9833344455', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- 5. User Roles mapping
INSERT INTO user_roles (user_id, role_id) VALUES
('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101'),
('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111102'),
('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111102'),
('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111103'),
('33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111103'),
('33333333-3333-3333-3333-333333333306', '11111111-1111-1111-1111-111111111103')
ON CONFLICT DO NOTHING;

-- 6. Staff Profiles
INSERT INTO staff_profiles (id, user_id, employee_id, department, designation, assigned_territory) VALUES
('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333302', 'EMP-1001', 'Operations', 'Senior Operations Manager', 'APAC - India North'),
('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333303', 'EMP-1002', 'Finance', 'Lead Billing Specialist', 'APAC - India South')
ON CONFLICT (employee_id) DO NOTHING;

-- 7. Customers
INSERT INTO customers (id, customer_code, company_name, legal_name, tax_identifier, contact_person, email, phone, website, customer_type, status, currency, credit_limit, payment_terms_days, created_by) VALUES
('55555555-5555-5555-5555-555555555501', 'CUST-1001', 'Acme Corporation Pvt Ltd', 'Acme Corporation Private Limited', '29ABCDE1234F1Z5', 'Rajesh Sharma', 'tech@acmecorp.com', '+91 9811122233', 'https://acmecorp.com', 'ENTERPRISE', 'ACTIVE', 'INR', 250000.00, 30, '33333333-3333-3333-3333-333333333301'),
('55555555-5555-5555-5555-555555555502', 'CUST-1002', 'Globex Industries', 'Globex Manufacturing India Ltd', '27BBBBB5678G2Z3', 'Priya Nair', 'billing@globexinc.com', '+91 9822233344', 'https://globexindustries.in', 'B2B', 'ACTIVE', 'INR', 100000.00, 15, '33333333-3333-3333-3333-333333333301'),
('55555555-5555-5555-5555-555555555503', 'CUST-1003', 'Apex Logic Systems', 'Apex Logic Systems LLP', '36CCCCC9012H3Z1', 'Karan Mehta', 'founder@apexlogic.io', '+91 9833344455', 'https://apexlogic.io', 'SME', 'ACTIVE', 'INR', 50000.00, 15, '33333333-3333-3333-3333-333333333301')
ON CONFLICT (customer_code) DO NOTHING;

-- 8. Customer Profiles
INSERT INTO customer_profiles (id, user_id, customer_id, portal_access_status, default_payment_method) VALUES
('66666666-6666-6666-6666-666666666601', '33333333-3333-3333-3333-333333333304', '55555555-5555-5555-5555-555555555501', 'ACTIVE', 'CREDIT_CARD'),
('66666666-6666-6666-6666-666666666602', '33333333-3333-3333-3333-333333333305', '55555555-5555-5555-5555-555555555502', 'ACTIVE', 'UPI'),
('66666666-6666-6666-6666-666666666603', '33333333-3333-3333-3333-333333333306', '55555555-5555-5555-5555-555555555503', 'ACTIVE', 'BANK_TRANSFER')
ON CONFLICT (user_id) DO NOTHING;

-- 9. Customer Addresses
INSERT INTO customer_addresses (id, customer_id, address_type, attention, street_line1, street_line2, city, state, postal_code, country, is_default) VALUES
('77777777-7777-7777-7777-777777777701', '55555555-5555-5555-5555-555555555501', 'BILLING', 'Accounts Payable', 'Level 5, Embassy TechVillage', 'Outer Ring Road, Bellandur', 'Bengaluru', 'Karnataka', '560103', 'India', TRUE),
('77777777-7777-7777-7777-777777777702', '55555555-5555-5555-5555-555555555501', 'SHIPPING', 'IT Operations', 'Ground Floor, Building 2B', 'Outer Ring Road, Bellandur', 'Bengaluru', 'Karnataka', '560103', 'India', FALSE),
('77777777-7777-7777-7777-777777777703', '55555555-5555-5555-5555-555555555502', 'BILLING', 'Finance Dept', 'Plot 42, MIDC Industrial Area', 'Andheri East', 'Mumbai', 'Maharashtra', '400093', 'India', TRUE),
('77777777-7777-7777-7777-777777777704', '55555555-5555-5555-5555-555555555503', 'BILLING', 'Karan Mehta', 'Unit 301, Cyber Towers', 'HITEC City, Madhapur', 'Hyderabad', 'Telangana', '500081', 'India', TRUE)
ON CONFLICT DO NOTHING;

-- 10. Products
INSERT INTO products (id, product_code, name, description, category, product_type, unit_of_measure, is_taxable, is_active) VALUES
('88888888-8888-8888-8888-888888888801', 'PROD-CLOUD-CORE', 'AnoimQI Cloud Platform', 'Complete recurring SaaS platform for billing automation', 'Software', 'RECURRING', 'Seat', TRUE, TRUE),
('88888888-8888-8888-8888-888888888802', 'PROD-CSM-SUPPORT', 'Dedicated Success Management', '24/7 dedicated customer success architect with 1-hr SLA', 'Support', 'RECURRING', 'Account', TRUE, TRUE),
('88888888-8888-8888-8888-888888888803', 'PROD-ONBOARD-MIGRATE', 'Enterprise Onboarding & Migration', 'Turnkey ERP & CRM data migration into AnoimQI', 'Service', 'ONE_TIME', 'Project', TRUE, TRUE)
ON CONFLICT (product_code) DO NOTHING;

-- 11. Product Variants
INSERT INTO product_variants (id, product_id, sku, variant_name, description, unit_price, cost_price, currency, is_active) VALUES
('99999999-9999-9999-9999-999999999901', '88888888-8888-8888-8888-888888888801', 'SKU-CORE-STARTER', 'Starter Tier Seat', 'Up to 5 active users with automated invoices', 2499.00, 450.00, 'INR', TRUE),
('99999999-9999-9999-9999-999999999902', '88888888-8888-8888-8888-888888888801', 'SKU-CORE-PRO', 'Business Pro Seat', 'Up to 25 users with MRR risk analytics', 6999.00, 1200.00, 'INR', TRUE),
('99999999-9999-9999-9999-999999999903', '88888888-8888-8888-8888-888888888801', 'SKU-CORE-ENT', 'Enterprise Unlimited', 'Unlimited users, multi-currency, dedicated tenant', 19999.00, 3500.00, 'INR', TRUE),
('99999999-9999-9999-9999-999999999904', '88888888-8888-8888-8888-888888888802', 'SKU-CSM-DEDICATED', 'Dedicated CSM Support', 'Monthly dedicated architect support tier', 12000.00, 4000.00, 'INR', TRUE),
('99999999-9999-9999-9999-999999999905', '88888888-8888-8888-8888-888888888803', 'SKU-MIGRATE-STD', 'Standard Enterprise Migration', 'Up to 100k legacy records cleaned and loaded', 45000.00, 15000.00, 'INR', TRUE)
ON CONFLICT (sku) DO NOTHING;

-- 12. Subscription Plans
INSERT INTO subscription_plans (id, plan_code, plan_name, description, billing_interval, interval_count, base_price, currency, trial_period_days, setup_fee, is_public, status, min_commitment_months) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'PLAN-STARTER-M', 'Starter Growth Monthly', 'Ideal for growing startups needing automated billing', 'MONTHLY', 1, 2499.00, 'INR', 14, 0.00, TRUE, 'ACTIVE', 1),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'PLAN-PRO-M', 'Business Pro Monthly', 'Full revenue lifecycle, automated dunning and analytics', 'MONTHLY', 1, 6999.00, 'INR', 0, 2000.00, TRUE, 'ACTIVE', 3),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'PLAN-ENTERPRISE-Y', 'Enterprise Scale Annual', 'Custom workflows, high volume billing, audit reports', 'YEARLY', 1, 199999.00, 'INR', 0, 10000.00, TRUE, 'ACTIVE', 12)
ON CONFLICT (plan_code) DO NOTHING;

-- 13. Plan Products
INSERT INTO plan_products (id, plan_id, product_id, variant_id, included_quantity, is_optional, extra_unit_price) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '88888888-8888-8888-8888-888888888801', '99999999-9999-9999-9999-999999999901', 1, FALSE, 2499.00),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '88888888-8888-8888-8888-888888888801', '99999999-9999-9999-9999-999999999902', 1, FALSE, 6999.00),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '88888888-8888-8888-8888-888888888801', '99999999-9999-9999-9999-999999999903', 1, FALSE, 19999.00),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '88888888-8888-8888-8888-888888888802', '99999999-9999-9999-9999-999999999904', 1, TRUE, 12000.00)
ON CONFLICT DO NOTHING;

-- 14. Plan Features
INSERT INTO plan_features (id, plan_id, feature_name, feature_code, feature_value, is_highlighted, display_order) VALUES
('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Automated Invoicing', 'FEAT_INVOICE_AUTO', 'Included', TRUE, 1),
('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Supported Customers', 'FEAT_CUST_LIMIT', 'Up to 100', FALSE, 2),
('cccccccc-cccc-cccc-cccc-ccccccccccc3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Dunning Management', 'FEAT_DUNNING_AUTO', 'Advanced', TRUE, 1),
('cccccccc-cccc-cccc-cccc-ccccccccccc4', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Supported Customers', 'FEAT_CUST_LIMIT', 'Up to 1,000', FALSE, 2),
('cccccccc-cccc-cccc-cccc-ccccccccccc5', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Dedicated CSM & SLA', 'FEAT_DEDICATED_CSM', '1-Hour SLA', TRUE, 1),
('cccccccc-cccc-cccc-cccc-ccccccccccc6', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Custom Integration Webhooks', 'FEAT_WEBHOOKS', 'Unlimited', TRUE, 2)
ON CONFLICT DO NOTHING;

-- 15. Tax Rates
INSERT INTO tax_rates (id, tax_code, tax_name, rate_percentage, country, state, is_compound, is_active) VALUES
('dddddddd-dddd-dddd-dddd-ddddddddddd1', 'GST_18', 'Goods and Services Tax (GST 18%)', 18.00, 'India', NULL, FALSE, TRUE),
('dddddddd-dddd-dddd-dddd-ddddddddddd2', 'GST_12', 'Goods and Services Tax (GST 12%)', 12.00, 'India', NULL, FALSE, TRUE),
('dddddddd-dddd-dddd-dddd-ddddddddddd3', 'GST_5', 'Goods and Services Tax (GST 5%)', 5.00, 'India', NULL, FALSE, TRUE)
ON CONFLICT (tax_code) DO NOTHING;

-- 16. Discounts
INSERT INTO discounts (id, discount_code, name, description, discount_type, discount_value, currency, min_order_amount, start_date, is_active) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'FESTIVE15', 'Festive Season Special', '15% discount on all subscriptions', 'PERCENTAGE', 15.00, 'INR', 5000.00, CURRENT_DATE - INTERVAL '30 days', TRUE),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'WELCOME1000', 'New Customer Onboarding Credit', 'Fixed ₹1,000 off first invoice', 'FIXED_AMOUNT', 1000.00, 'INR', 2000.00, CURRENT_DATE - INTERVAL '60 days', TRUE)
ON CONFLICT (discount_code) DO NOTHING;

-- 17. Quotations
INSERT INTO quotations (id, quotation_number, customer_id, plan_id, status, issue_date, valid_until, subtotal, discount_amount, tax_amount, total_amount, currency, created_by_staff_id) VALUES
('ffffffff-ffff-ffff-ffff-fffffffffff1', 'QT-2026-00101', '55555555-5555-5555-5555-555555555501', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'CONVERTED', CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '15 days', 6999.00, 0.00, 1259.82, 8258.82, 'INR', '44444444-4444-4444-4444-444444444401'),
('ffffffff-ffff-ffff-ffff-fffffffffff2', 'QT-2026-00102', '55555555-5555-5555-5555-555555555502', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'ACCEPTED', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 2499.00, 0.00, 449.82, 2948.82, 'INR', '44444444-4444-4444-4444-444444444401'),
('ffffffff-ffff-ffff-ffff-fffffffffff3', 'QT-2026-00103', '55555555-5555-5555-5555-555555555503', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'SENT', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '28 days', 199999.00, 20000.00, 32399.82, 212398.82, 'INR', '44444444-4444-4444-4444-444444444402')
ON CONFLICT (quotation_number) DO NOTHING;

-- Quotation Items
INSERT INTO quotation_items (id, quotation_id, product_id, variant_id, description, quantity, unit_price, line_discount, line_tax, line_total) VALUES
('10101010-1010-1010-1010-101010101001', 'ffffffff-ffff-ffff-ffff-fffffffffff1', '88888888-8888-8888-8888-888888888801', '99999999-9999-9999-9999-999999999902', 'Business Pro Seat', 1, 6999.00, 0.00, 1259.82, 8258.82),
('10101010-1010-1010-1010-101010101002', 'ffffffff-ffff-ffff-ffff-fffffffffff2', '88888888-8888-8888-8888-888888888801', '99999999-9999-9999-9999-999999999901', 'Starter Tier Seat', 1, 2499.00, 0.00, 449.82, 2948.82),
('10101010-1010-1010-1010-101010101003', 'ffffffff-ffff-ffff-ffff-fffffffffff3', '88888888-8888-8888-8888-888888888801', '99999999-9999-9999-9999-999999999903', 'Enterprise Unlimited', 1, 199999.00, 20000.00, 32399.82, 212398.82)
ON CONFLICT DO NOTHING;

-- Quotation History
INSERT INTO quotation_status_history (id, quotation_id, from_status, to_status, remarks, changed_by) VALUES
('20202020-2020-2020-2020-202020202001', 'ffffffff-ffff-ffff-ffff-fffffffffff1', 'DRAFT', 'SENT', 'Sent to customer for approval', '33333333-3333-3333-3333-333333333302'),
('20202020-2020-2020-2020-202020202002', 'ffffffff-ffff-ffff-ffff-fffffffffff1', 'SENT', 'CONVERTED', 'Approved by customer and converted to subscription', '33333333-3333-3333-3333-333333333302')
ON CONFLICT DO NOTHING;

-- 18. Subscriptions
INSERT INTO subscriptions (id, subscription_number, customer_id, plan_id, quotation_id, status, start_date, current_cycle_start, current_cycle_end, billing_interval, interval_count, base_amount, discount_amount, tax_amount, recurring_total, mrr, arr, auto_renew) VALUES
('30303030-3030-3030-3030-303030303001', 'SUB-2026-00101', '55555555-5555-5555-5555-555555555501', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'ffffffff-ffff-ffff-ffff-fffffffffff1', 'ACTIVE', CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 'MONTHLY', 1, 6999.00, 0.00, 1259.82, 8258.82, 6999.00, 83988.00, TRUE),
('30303030-3030-3030-3030-303030303002', 'SUB-2026-00102', '55555555-5555-5555-5555-555555555502', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'ffffffff-ffff-ffff-ffff-fffffffffff2', 'ACTIVE', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', 'MONTHLY', 1, 2499.00, 0.00, 449.82, 2948.82, 2499.00, 29988.00, TRUE),
('30303030-3030-3030-3030-303030303003', 'SUB-2026-00103', '55555555-5555-5555-5555-555555555503', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', NULL, 'PAUSED', CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '275 days', 'YEARLY', 1, 199999.00, 0.00, 35999.82, 235998.82, 16666.58, 199999.00, FALSE)
ON CONFLICT (subscription_number) DO NOTHING;

-- Subscription Items
INSERT INTO subscription_items (id, subscription_id, product_id, variant_id, quantity, unit_price, line_discount, line_tax, line_total, is_recurring) VALUES
('40404040-4040-4040-4040-404040404001', '30303030-3030-3030-3030-303030303001', '88888888-8888-8888-8888-888888888801', '99999999-9999-9999-9999-999999999902', 1, 6999.00, 0.00, 1259.82, 8258.82, TRUE),
('40404040-4040-4040-4040-404040404002', '30303030-3030-3030-3030-303030303002', '88888888-8888-8888-8888-888888888801', '99999999-9999-9999-9999-999999999901', 1, 2499.00, 0.00, 449.82, 2948.82, TRUE),
('40404040-4040-4040-4040-404040404003', '30303030-3030-3030-3030-303030303003', '88888888-8888-8888-8888-888888888801', '99999999-9999-9999-9999-999999999903', 1, 199999.00, 0.00, 35999.82, 235998.82, TRUE)
ON CONFLICT DO NOTHING;

-- Subscription Status History
INSERT INTO subscription_status_history (id, subscription_id, from_status, to_status, reason, changed_by) VALUES
('50505050-5050-5050-5050-505050505001', '30303030-3030-3030-3030-303030303001', 'DRAFT', 'ACTIVE', 'Initial contract activation', '33333333-3333-3333-3333-333333333301'),
('50505050-5050-5050-5050-505050505002', '30303030-3030-3030-3030-303030303003', 'ACTIVE', 'PAUSED', 'Temporary customer hold requested', '33333333-3333-3333-3333-333333333302')
ON CONFLICT DO NOTHING;

-- Renewal Requests
INSERT INTO renewal_requests (id, request_number, subscription_id, customer_id, request_type, status, reason, customer_notes) VALUES
('60606060-6060-6060-6060-606060606001', 'REQ-2026-0001', '30303030-3030-3030-3030-303030303001', '55555555-5555-5555-5555-555555555501', 'RENEWAL', 'PENDING', 'Annual renewal contract confirmation', 'Requesting multi-year rate lock')
ON CONFLICT (request_number) DO NOTHING;

-- 19. Billing Runs, Events & Cycles
INSERT INTO billing_runs (id, run_number, run_date, billing_date, target_cycle_end, total_subscriptions_evaluated, successful_invoices_count, failed_invoices_count, total_amount_billed, status, initiated_by) VALUES
('70707070-7070-7070-7070-707070707001', 'RUN-202610-001', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE, 2, 2, 0, 11207.64, 'COMPLETED', '33333333-3333-3333-3333-333333333301')
ON CONFLICT (run_number) DO NOTHING;

INSERT INTO billing_cycles (id, subscription_id, cycle_number, cycle_start, cycle_end, due_date, status) VALUES
('80808080-8080-8080-8080-808080808001', '30303030-3030-3030-3030-303030303001', 1, CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '25 days', 'PAID'),
('80808080-8080-8080-8080-808080808002', '30303030-3030-3030-3030-303030303001', 2, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '5 days', 'INVOICED'),
('80808080-8080-8080-8080-808080808003', '30303030-3030-3030-3030-303030303002', 1, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE, 'INVOICED')
ON CONFLICT DO NOTHING;

-- 20. Invoices & Invoice Items
INSERT INTO invoices (id, invoice_number, subscription_id, customer_id, billing_run_id, quotation_id, invoice_type, status, issue_date, due_date, paid_at, subtotal, discount_amount, tax_amount, total_amount, paid_amount, balance_amount, currency) VALUES
('90909090-9090-9090-9090-909090909001', 'INV-2026-00101', '30303030-3030-3030-3030-303030303001', '55555555-5555-5555-5555-555555555501', '70707070-7070-7070-7070-707070707001', 'ffffffff-ffff-ffff-ffff-fffffffffff1', 'SUBSCRIPTION', 'PAID', CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '26 days', 6999.00, 0.00, 1259.82, 8258.82, 8258.82, 0.00, 'INR'),
('90909090-9090-9090-9090-909090909002', 'INV-2026-00102', '30303030-3030-3030-3030-303030303001', '55555555-5555-5555-5555-555555555501', '70707070-7070-7070-7070-707070707001', NULL, 'SUBSCRIPTION', 'ISSUED', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '5 days', NULL, 6999.00, 0.00, 1259.82, 8258.82, 0.00, 8258.82, 'INR'),
('90909090-9090-9090-9090-909090909003', 'INV-2026-00103', '30303030-3030-3030-3030-303030303002', '55555555-5555-5555-5555-555555555502', '70707070-7070-7070-7070-707070707001', NULL, 'SUBSCRIPTION', 'PARTIALLY_PAID', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE, NULL, 2499.00, 0.00, 449.82, 2948.82, 1500.00, 1448.82, 'INR')
ON CONFLICT (invoice_number) DO NOTHING;

UPDATE billing_cycles SET invoice_id = '90909090-9090-9090-9090-909090909001' WHERE id = '80808080-8080-8080-8080-808080808001';
UPDATE billing_cycles SET invoice_id = '90909090-9090-9090-9090-909090909002' WHERE id = '80808080-8080-8080-8080-808080808002';
UPDATE billing_cycles SET invoice_id = '90909090-9090-9090-9090-909090909003' WHERE id = '80808080-8080-8080-8080-808080808003';

INSERT INTO invoice_items (id, invoice_id, subscription_item_id, product_id, variant_id, description, quantity, unit_price, line_discount, line_tax, line_total) VALUES
('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a001', '90909090-9090-9090-9090-909090909001', '40404040-4040-4040-4040-404040404001', '88888888-8888-8888-8888-888888888801', '99999999-9999-9999-9999-999999999902', 'Business Pro Seat (Cycle 1)', 1, 6999.00, 0.00, 1259.82, 8258.82),
('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a002', '90909090-9090-9090-9090-909090909002', '40404040-4040-4040-4040-404040404001', '88888888-8888-8888-8888-888888888801', '99999999-9999-9999-9999-999999999902', 'Business Pro Seat (Cycle 2)', 1, 6999.00, 0.00, 1259.82, 8258.82),
('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a003', '90909090-9090-9090-9090-909090909003', '40404040-4040-4040-4040-404040404002', '88888888-8888-8888-8888-888888888801', '99999999-9999-9999-9999-999999999901', 'Starter Tier Seat (Cycle 1)', 1, 2499.00, 0.00, 449.82, 2948.82)
ON CONFLICT DO NOTHING;

INSERT INTO billing_events (id, billing_run_id, subscription_id, invoice_id, event_type, status, amount, idempotency_key) VALUES
('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b001', '70707070-7070-7070-7070-707070707001', '30303030-3030-3030-3030-303030303001', '90909090-9090-9090-9090-909090909002', 'INVOICE_GENERATED', 'SUCCESS', 8258.82, 'IDEMP-RUN001-SUB001-C2'),
('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b002', '70707070-7070-7070-7070-707070707001', '30303030-3030-3030-3030-303030303002', '90909090-9090-9090-9090-909090909003', 'INVOICE_GENERATED', 'SUCCESS', 2948.82, 'IDEMP-RUN001-SUB002-C1')
ON CONFLICT (idempotency_key) DO NOTHING;

-- 21. Payments & Payment Allocations
INSERT INTO payments (id, payment_number, customer_id, payment_method, payment_status, amount, currency, transaction_reference, gateway_name) VALUES
('c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c001', 'PAY-2026-00101', '55555555-5555-5555-5555-555555555501', 'CREDIT_CARD', 'COMPLETED', 8258.82, 'INR', 'TXN-RZP-987654321', 'Razorpay'),
('c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c002', 'PAY-2026-00102', '55555555-5555-5555-5555-555555555502', 'UPI', 'COMPLETED', 1500.00, 'INR', 'UPI-REF-112233445', 'Razorpay')
ON CONFLICT (payment_number) DO NOTHING;

INSERT INTO payment_allocations (id, payment_id, invoice_id, allocated_amount, notes) VALUES
('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d001', 'c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c001', '90909090-9090-9090-9090-909090909001', 8258.82, 'Full payment via corporate credit card'),
('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d002', 'c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c002', '90909090-9090-9090-9090-909090909003', 1500.00, 'Partial payment via UPI')
ON CONFLICT DO NOTHING;

-- 22. Discount Applications
INSERT INTO discount_applications (id, discount_id, customer_id, quotation_id, applied_amount) VALUES
('e0e0e0e0-e0e0-e0e0-e0e0-e0e0e0e0e001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', '55555555-5555-5555-5555-555555555503', 'ffffffff-ffff-ffff-ffff-fffffffffff3', 20000.00)
ON CONFLICT DO NOTHING;

-- 23. Notifications
INSERT INTO notifications (id, user_id, title, message, notification_type, severity, is_read) VALUES
('f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f001', '33333333-3333-3333-3333-333333333301', 'Billing Run Completed', 'Billing run RUN-202610-001 completed successfully with 2 invoices generated totaling ₹11,207.64.', 'BILLING', 'SUCCESS', TRUE),
('f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f002', '33333333-3333-3333-3333-333333333304', 'Invoice Generated', 'Invoice INV-2026-00102 for ₹8,258.82 has been issued and is due on ' || (CURRENT_DATE + INTERVAL '5 days')::text, 'BILLING', 'INFO', FALSE),
('f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f003', '33333333-3333-3333-3333-333333333302', 'Renewal Request Received', 'Customer Acme Corporation submitted a renewal request REQ-2026-0001 for contract review.', 'SUBSCRIPTION', 'INFO', FALSE)
ON CONFLICT DO NOTHING;

-- 24. Activity Logs
INSERT INTO activity_logs (id, user_id, entity_type, entity_id, action, ip_address, details) VALUES
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a101', '33333333-3333-3333-3333-333333333301', 'BILLING_RUN', '70707070-7070-7070-7070-707070707001', 'BILLING_RUN', '127.0.0.1', '{"run_number": "RUN-202610-001", "total_billed": 11207.64}'::jsonb),
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a102', '33333333-3333-3333-3333-333333333302', 'QUOTATION', 'ffffffff-ffff-ffff-ffff-fffffffffff1', 'STATUS_CHANGE', '127.0.0.1', '{"from": "SENT", "to": "CONVERTED"}'::jsonb),
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a103', '33333333-3333-3333-3333-333333333301', 'PAYMENT', 'c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c001', 'PAYMENT_PROCESSED', '127.0.0.1', '{"amount": 8258.82, "invoice": "INV-2026-00101"}'::jsonb)
ON CONFLICT DO NOTHING;

-- 25. System Settings
INSERT INTO system_settings (id, setting_key, setting_value, setting_group, data_type, description, is_public) VALUES
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b101', 'system.currency.default', 'INR', 'FINANCE', 'STRING', 'Default operating currency for AnoimQI invoices and payments', TRUE),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b102', 'system.tax.default_code', 'GST_18', 'FINANCE', 'STRING', 'Default statutory tax rate applied to subscription products', TRUE),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b103', 'billing.grace_period_days', '7', 'BILLING', 'NUMBER', 'Grace period before subscription enters overdue suspension', FALSE),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b104', 'billing.retry.max_attempts', '3', 'BILLING', 'NUMBER', 'Maximum automated payment retry attempts for failed dunning', FALSE),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b105', 'company.legal_name', 'AnoimQI Technologies India Pvt Ltd', 'GENERAL', 'STRING', 'Legal registered entity name for invoice headers', TRUE),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b106', 'company.tax_id', '29AAACB9999P1ZQ', 'GENERAL', 'STRING', 'Company GSTIN/Tax ID printed on customer tax invoices', TRUE)
ON CONFLICT (setting_key) DO NOTHING;
