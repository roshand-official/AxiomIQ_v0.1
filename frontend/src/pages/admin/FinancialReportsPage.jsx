// src/pages/admin/FinancialReportsPage.jsx
import { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Layers,
  FileText,
  CreditCard,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { deriveChartMetrics } from '../../utils/analyticsDerivations';
import { formatCurrency, formatDate, downloadCSV } from '../../utils/formatters';
import { KPICard, Tabs } from '../../components/common';
import { RevenueChart, PaymentChart } from '../../components/charts';

export default function FinancialReportsPage() {
  const {
    subscriptions,
    invoices,
    payments,
    plans,
    products,
    customers,
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState('summary');

  const { revenueChartData, paymentChartData, productPerformanceData } = useMemo(() => {
    return deriveChartMetrics({ invoices, payments, subscriptions, products });
  }, [invoices, payments, subscriptions, products]);
  const [dateRange, setDateRange] = useState('2026-FY');

  // Strict Accounting Aggregations
  // 1. Contracted Recurring Value (Normalized MRR * 12)
  const contractedARR = useMemo(() => {
    return subscriptions
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => {
        const isAnnual = s.planId === 'PLAN-002' || s.planId === 'PLAN-005';
        const mrr = isAnnual ? s.recurringAmount / 12 : s.recurringAmount;
        return sum + mrr * 12;
      }, 0);
  }, [subscriptions]);

  // 2. Invoiced Revenue
  const totalInvoiced = useMemo(() => {
    return invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  }, [invoices]);

  // 3. Collected Revenue
  const totalCollected = useMemo(() => {
    return payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  // 4. Outstanding Receivables
  const totalOutstanding = useMemo(() => {
    return invoices
      .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
      .reduce((sum, i) => sum + i.outstandingAmount, 0);
  }, [invoices]);

  // Revenue by Plan
  const planBreakdown = useMemo(() => {
    return plans.map((p) => {
      const subs = subscriptions.filter((s) => s.planId === p.id);
      const activeSubs = subs.filter((s) => s.status === 'active');
      const contractedVal = activeSubs.reduce((sum, s) => sum + s.recurringAmount, 0);

      return {
        id: p.id,
        name: p.name,
        cadence: p.billingFrequency,
        activeContracts: activeSubs.length,
        contractedValue: contractedVal,
      };
    });
  }, [plans, subscriptions]);

  // Aging Receivables Summary
  const agingReceivables = useMemo(() => {
    const overdue = invoices.filter((i) => i.outstandingAmount > 0);
    return overdue.map((inv) => {
      const cust = customers.find((c) => c.id === inv.customerId);
      const days = Math.floor((new Date() - new Date(inv.dueDate)) / 86400000);
      let bucket = 'Current (Not Due)';
      if (days > 90) bucket = '> 90 Days';
      else if (days > 60) bucket = '61-90 Days';
      else if (days > 30) bucket = '31-60 Days';
      else if (days > 0) bucket = '1-30 Days';

      return {
        ...inv,
        customerName: cust?.company || cust?.name,
        daysOverdue: Math.max(0, days),
        agingBucket: bucket,
      };
    });
  }, [invoices, customers]);

  const handleExportSummary = () => {
    const data = [
      { Metric: 'Contracted ARR', Value: contractedARR },
      { Metric: 'Total Invoiced Revenue', Value: totalInvoiced },
      { Metric: 'Total Cash Collected', Value: totalCollected },
      { Metric: 'Outstanding Receivables', Value: totalOutstanding },
    ];
    downloadCSV(data, 'AxiomIQ_Financial_Summary');
    toast.success('Financial report exported to CSV');
  };

  const handlePrint = () => {
    window.print();
  };

  const reportTabs = [
    { key: 'summary', label: 'Executive Revenue Summary', icon: BarChart3 },
    { key: 'products', label: 'Product Revenue Performance', icon: Layers },
    { key: 'plans', label: 'Plan & Cadence Performance', icon: TrendingUp },
    { key: 'aging', label: 'Aging Receivables & Overdue', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            Financial & Recurring Revenue Reports
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Audit contracted recurring commitments, invoiced tax billings, cash receipts, and aging balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            type="button"
            onClick={handleExportSummary}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Accounting Distinction Alert */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs flex items-start gap-3 text-navy">
        <div className="p-1 rounded bg-action text-white mt-0.5">
          <BarChart3 className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="font-bold">Accounting Note on Revenue Segregation:</span>
          <p className="text-text-secondary mt-0.5 leading-relaxed">
            AxiomIQ strictly separates <span className="font-semibold text-text-primary">Contracted Recurring Value</span> (forward commitments),{' '}
            <span className="font-semibold text-text-primary">Invoiced Revenue</span> (tax invoices issued per GST rules), and{' '}
            <span className="font-semibold text-text-primary">Collected Cash</span> (realized bank receipts). These metrics are non-interchangeable.
          </p>
        </div>
      </div>

      {/* 4 Foundation Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-l-action">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Contracted Run-Rate (ARR)
          </span>
          <p className="text-2xl font-bold text-navy mt-1">{formatCurrency(contractedARR)}</p>
          <p className="text-[11px] text-text-muted mt-1">Forward annualized commitment</p>
        </div>

        <div className="card p-5 border-l-4 border-l-navy">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Invoiced Revenue (Gross)
          </span>
          <p className="text-2xl font-bold text-navy mt-1">{formatCurrency(totalInvoiced)}</p>
          <p className="text-[11px] text-text-muted mt-1">Tax invoices generated</p>
        </div>

        <div className="card p-5 border-l-4 border-l-success">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Collected Cash (Receipts)
          </span>
          <p className="text-2xl font-bold text-success mt-1">{formatCurrency(totalCollected)}</p>
          <p className="text-[11px] text-text-muted mt-1">Verified settled funds</p>
        </div>

        <div className="card p-5 border-l-4 border-l-danger">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Outstanding Receivables
          </span>
          <p className="text-2xl font-bold text-danger mt-1">{formatCurrency(totalOutstanding)}</p>
          <p className="text-[11px] text-text-muted mt-1">Unpaid customer invoices</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={reportTabs} activeTab={activeReportTab} onChange={setActiveReportTab} />

      {/* Tab 1: Executive Revenue Summary */}
      {activeReportTab === 'summary' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold text-navy text-sm mb-1">
              Historical Invoiced vs Collected Trajectory
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Comparing monthly tax billings against cash receipts across 2026
            </p>
            <RevenueChart data={revenueChartData} height={320} />
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-navy text-sm mb-1">
              Collection Efficiency & Receivables Exposure
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Monthly breakdown of realized collections versus outstanding unpaid balances
            </p>
            <PaymentChart data={paymentChartData} height={300} />
          </div>
        </div>
      )}

      {/* Tab 2: Product Performance Report */}
      {activeReportTab === 'products' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-border bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-navy">
              Product Revenue Performance Breakdown
            </h3>
            <span className="text-xs text-text-secondary">
              Aggregated from live catalog subscriptions
            </span>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-text-secondary font-semibold uppercase">
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3 text-center">Active Seats / Subscriptions</th>
                <th className="px-4 py-3 text-right">Recognized Revenue</th>
                <th className="px-4 py-3 text-center">Growth (YoY)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {productPerformanceData.map((item) => (
                <tr key={item.productId} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-navy">
                    {item.name}
                    <span className="block text-[10px] text-text-muted font-mono">{item.productId}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-navy">
                    {item.subscriptions}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-navy">
                    {formatCurrency(item.revenue)}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">
                    <span
                      className={`px-2 py-0.5 rounded-full ${item.growth >= 0 ? 'bg-emerald-50 text-success' : 'bg-rose-50 text-danger'
                        }`}
                    >
                      {item.growth >= 0 ? `+${item.growth}%` : `${item.growth}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Plans Performance */}
      {activeReportTab === 'plans' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-border bg-gray-50">
            <h3 className="font-semibold text-sm text-navy">
              Billing Frequency & Cadence Performance
            </h3>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-text-secondary font-semibold uppercase">
                <th className="px-4 py-3">Plan Name</th>
                <th className="px-4 py-3">Recurrence Cadence</th>
                <th className="px-4 py-3 text-center">Active Contracts</th>
                <th className="px-4 py-3 text-right">Contracted Recurring Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {planBreakdown.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-navy">{p.name}</td>
                  <td className="px-4 py-3 uppercase text-text-secondary font-medium">{p.cadence}</td>
                  <td className="px-4 py-3 text-center font-bold text-navy">{p.activeContracts}</td>
                  <td className="px-4 py-3 text-right font-bold text-navy">
                    {formatCurrency(p.contractedValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Aging Receivables */}
      {activeReportTab === 'aging' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-border bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-navy">
              Aging Accounts Receivable Ledger
            </h3>
            <span className="text-xs text-danger font-semibold">
              Total Overdue: {formatCurrency(totalOutstanding)}
            </span>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-text-secondary font-semibold uppercase">
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3 text-center">Days Overdue</th>
                <th className="px-4 py-3">Aging Bucket</th>
                <th className="px-4 py-3 text-right">Outstanding Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {agingReceivables.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-secondary">
                    No outstanding overdue receivables.
                  </td>
                </tr>
              ) : (
                agingReceivables.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono font-medium text-navy">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{inv.customerName}</td>
                    <td className="px-4 py-3 text-text-secondary">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-3 text-center font-bold text-danger">{inv.daysOverdue}d</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-warning">
                        {inv.agingBucket}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-danger">
                      {formatCurrency(inv.outstandingAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
