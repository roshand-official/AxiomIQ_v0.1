-- ==============================================================================
-- AxoimIQQI SUBSCRIPTION MANAGEMENT SYSTEM - DATABASE VERIFICATION SCRIPT
-- ==============================================================================

\echo '----------------------------------------------------------------------'
\echo '1. TABLE COUNT VERIFICATION (Expected: 34 public user tables)'
\echo '----------------------------------------------------------------------'
SELECT count(*) AS total_tables_in_public_schema
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

\echo '----------------------------------------------------------------------'
\echo '2. LIST OF ALL 34 TABLES & THEIR ESTIMATED / EXACT ROW COUNTS'
\echo '----------------------------------------------------------------------'
SELECT 
    table_name,
    (xpath('/row/cnt/text()', xml_count))[1]::text::int AS row_count
FROM (
    SELECT 
        table_name, 
        query_to_xml(format('SELECT count(*) AS cnt FROM %I', table_name), false, true, '') AS xml_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
) sub
ORDER BY table_name;

\echo '----------------------------------------------------------------------'
\echo '3. FOREIGN KEY RELATIONSHIPS AUDIT'
\echo '----------------------------------------------------------------------'
SELECT 
    tc.table_name AS from_table, 
    kcu.column_name AS from_column, 
    ccu.table_name AS to_table,
    ccu.column_name AS to_column,
    rc.delete_rule AS on_delete
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

\echo '----------------------------------------------------------------------'
\echo '4. FINANCIAL CALCULATION INTEGRITY AUDIT'
\echo '----------------------------------------------------------------------'
SELECT 
    i.invoice_number,
    c.company_name,
    i.subtotal,
    i.discount_amount,
    i.tax_amount,
    i.total_amount,
    (i.subtotal + i.tax_amount - i.discount_amount) AS calculated_expected_total,
    i.paid_amount,
    i.balance_amount,
    COALESCE(SUM(pa.allocated_amount), 0) AS actual_payment_allocations,
    CASE 
        WHEN ABS(i.total_amount - (i.subtotal + i.tax_amount - i.discount_amount)) < 0.01 
        THEN 'PASSED' ELSE 'FAILED' 
    END AS total_calculation_status,
    CASE 
        WHEN ABS(i.paid_amount - COALESCE(SUM(pa.allocated_amount), 0)) < 0.01 
        THEN 'PASSED' ELSE 'FAILED' 
    END AS allocation_balance_status
FROM invoices i
JOIN customers c ON i.customer_id = c.id
LEFT JOIN payment_allocations pa ON pa.invoice_id = i.id
GROUP BY i.id, i.invoice_number, c.company_name, i.subtotal, i.discount_amount, i.tax_amount, i.total_amount, i.paid_amount, i.balance_amount;

\echo '----------------------------------------------------------------------'
\echo '5. SUBSCRIPTION REVENUE METRICS AUDIT (MRR & ARR Calculations)'
\echo '----------------------------------------------------------------------'
SELECT 
    s.subscription_number,
    c.company_name,
    p.plan_name,
    s.status,
    s.billing_interval,
    s.recurring_total,
    s.mrr,
    s.arr,
    CASE 
        WHEN ABS(s.arr - (s.mrr * 12)) < 0.01 THEN 'ARR = MRR * 12 VALIDATED'
        ELSE 'ARR MISMATCH'
    END AS arr_formula_status
FROM subscriptions s
JOIN customers c ON s.customer_id = c.id
JOIN subscription_plans p ON s.plan_id = p.id;

\echo '----------------------------------------------------------------------'
\echo '6. ACTIVE ROLES & PERMISSIONS CHECK'
\echo '----------------------------------------------------------------------'
SELECT 
    r.name AS role_name,
    r.display_name,
    count(rp.permission_id) AS permissions_assigned
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name, r.display_name
ORDER BY r.name;
