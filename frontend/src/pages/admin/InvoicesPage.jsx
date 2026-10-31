// src/pages/admin/InvoicesPage.jsx
import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileStack,
  Eye,
  CreditCard,
  Download,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate, downloadCSV } from '../../utils/formatters';
import { useTableState } from '../../hooks/useTableState';
import { DataTable } from '../../components/tables';
import { StatusBadge, Modal } from '../../components/common';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { invoices, customers, subscriptions, registerPayment } = useApp();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const invoicesWithDetails = useMemo(() => {
    return invoices.map((inv) => {
      const cust = customers.find((c) => c.id === inv.customerId);
      const sub = subscriptions.find((s) => s.id === inv.subscriptionId);
      return {
        ...inv,
        customerName: cust?.company || cust?.name || inv.customerId,
        subscriptionNumber: sub?.subscriptionNumber || inv.subscriptionId,
      };
    });
  }, [invoices, customers, subscriptions]);

  const table = useTableState(invoicesWithDetails, {
    searchFields: ['invoiceNumber', 'customerName', 'subscriptionNumber', 'status'],
    initialSort: 'invoiceDate',
    initialSortDir: 'desc',
  });

  const handleOpenPayment = (inv) => {
    setSelectedInvoice(inv);
    setPaymentAmount(inv.outstandingAmount);
    setPaymentRef(`TXN/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`);
    setPaymentMethod('bank_transfer');
    setPaymentNote('');
    setPaymentModalOpen(true);
  };

  const handleRegisterPayment = (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const amt = Number(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    if (amt > selectedInvoice.outstandingAmount) {
      toast.error('Payment amount cannot exceed the outstanding invoice balance');
      return;
    }

    registerPayment({
      customerId: selectedInvoice.customerId,
      invoiceId: selectedInvoice.id,
      paymentDate: new Date().toISOString().split('T')[0],
      method: paymentMethod,
      amount: amt,
      referenceNumber: paymentRef,
      note: paymentNote,
    });

    toast.success(`Payment of ${formatCurrency(amt)} recorded for invoice ${selectedInvoice.invoiceNumber}`);
    setPaymentModalOpen(false);
  };

  const handleExport = () => {
    const data = invoicesWithDetails.map((inv) => ({
      InvoiceNumber: inv.invoiceNumber,
      Customer: inv.customerName,
      Subscription: inv.subscriptionNumber,
      Date: inv.invoiceDate,
      DueDate: inv.dueDate,
      TotalAmount: inv.totalAmount,
      AmountPaid: inv.amountPaid,
      Outstanding: inv.outstandingAmount,
      Status: inv.status,
    }));
    downloadCSV(data, 'Brightloop_Invoices');
    toast.success('Invoices exported to CSV');
  };

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      width: '150px',
      sortable: true,
      render: (val, row) => (
        <Link
          to={`/admin/invoices/${row.id}`}
          className="font-mono text-xs font-semibold text-navy hover:text-action hover:underline"
        >
          {val}
        </Link>
      ),
    },
    {
      key: 'customerName',
      label: 'Client Account',
      sortable: true,
      render: (_, row) => (
        <div>
          <Link
            to={`/admin/customers/${row.customerId}`}
            className="font-medium text-navy hover:text-action hover:underline"
          >
            {row.customerName}
          </Link>
          <div className="text-[11px] text-text-secondary mt-0.5">
            Sub:{' '}
            <Link to={`/admin/subscriptions/${row.subscriptionId}`} className="hover:underline font-mono">
              {row.subscriptionNumber}
            </Link>
          </div>
        </div>
      ),
    },
    {
      key: 'invoiceDate',
      label: 'Invoice Date',
      sortable: true,
      render: (val) => <span className="text-xs text-text-secondary">{formatDate(val)}</span>,
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (val, row) => {
        const isOverdue = row.outstandingAmount > 0 && new Date(val) < new Date();
        return (
          <span
            className={`text-xs font-medium ${
              isOverdue ? 'text-danger font-bold' : 'text-text-primary'
            }`}
          >
            {formatDate(val)}
          </span>
        );
      },
    },
    {
      key: 'totalAmount',
      label: 'Total Invoiced',
      align: 'right',
      sortable: true,
      render: (val) => <span className="font-bold text-navy">{formatCurrency(val)}</span>,
    },
    {
      key: 'amountPaid',
      label: 'Amount Paid',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span className={`text-xs ${val > 0 ? 'text-success font-medium' : 'text-text-muted'}`}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'outstandingAmount',
      label: 'Outstanding',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span
          className={`font-bold ${
            val > 0 ? 'text-danger' : 'text-text-muted'
          }`}
        >
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/admin/invoices/${row.id}`}
            className="p-1.5 rounded-lg text-text-secondary hover:text-action hover:bg-blue-50 transition-colors"
            title="View Invoice"
          >
            <Eye className="w-4 h-4" />
          </Link>

          {row.outstandingAmount > 0 && (
            <button
              type="button"
              onClick={() => handleOpenPayment(row)}
              className="btn btn-secondary btn-sm py-1 px-2 text-[11px] text-action border-action/30 hover:bg-blue-50 flex items-center gap-1"
              title="Register Payment"
            >
              <CreditCard className="w-3 h-3" />
              <span>Collect</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            Tax Invoices & Accounts Receivable
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Track generated subscription invoices, outstanding customer balances, and payment collections.
          </p>
        </div>

        <Link
          to="/admin/billing"
          className="btn btn-primary btn-sm flex items-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          <span>Billing Center</span>
        </Link>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={table.paginatedData}
        searchable
        searchPlaceholder="Search by invoice #, customer name, subscription..."
        searchValue={table.search}
        onSearchChange={table.setSearch}
        filters={[
          {
            key: 'status',
            label: 'Invoice Status',
            options: [
              { value: 'paid', label: 'Paid' },
              { value: 'partially_paid', label: 'Partially Paid' },
              { value: 'confirmed', label: 'Confirmed / Pending' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'draft', label: 'Draft' },
            ],
          },
        ]}
        filterValues={table.filters}
        onFilterChange={table.handleFilter}
        sortColumn={table.sortColumn}
        sortDirection={table.sortDirection}
        onSort={table.handleSort}
        pagination
        page={table.page}
        pageSize={table.pageSize}
        totalCount={table.totalCount}
        onPageChange={table.handlePageChange}
        onPageSizeChange={table.handlePageSizeChange}
        exportable
        onExport={handleExport}
      />

      {/* Register Payment Modal */}
      <Modal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Register Customer Payment"
        subtitle={`Invoice: ${selectedInvoice?.invoiceNumber} • Outstanding: ${formatCurrency(
          selectedInvoice?.outstandingAmount || 0
        )}`}
        size="md"
      >
        <form onSubmit={handleRegisterPayment} className="space-y-4 text-xs">
          <div>
            <label className="label">Payment Amount (₹) *</label>
            <input
              type="number"
              required
              min="1"
              max={selectedInvoice?.outstandingAmount}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="input-field text-base font-bold text-navy"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="select-field"
              >
                <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="upi">UPI / Instant Pay</option>
                <option value="card">Credit / Debit Card</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Transaction Reference #</label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                className="input-field"
                placeholder="UTR / Bank Ref Number"
              />
            </div>
          </div>

          <div>
            <label className="label">Internal Payment Notes</label>
            <textarea
              rows={2}
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              className="input-field resize-none"
              placeholder="e.g. Cleared via HDFC Corporate current account..."
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={() => setPaymentModalOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
