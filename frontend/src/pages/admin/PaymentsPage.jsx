// src/pages/admin/PaymentsPage.jsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Plus,
  Eye,
  Download,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate, downloadCSV } from '../../utils/formatters';
import { useTableState } from '../../hooks/useTableState';
import { DataTable } from '../../components/tables';
import { StatusBadge, Modal } from '../../components/common';

export default function PaymentsPage() {
  const {
    payments,
    customers,
    invoices,
    registerPayment,
  } = useApp();

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [note, setNote] = useState('');

  const paymentsWithDetails = useMemo(() => {
    return payments.map((p) => {
      const cust = customers.find((c) => c.id === p.customerId);
      const inv = invoices.find((i) => i.id === p.invoiceId);
      return {
        ...p,
        customerName: cust?.company || cust?.name || p.customerId,
        invoiceNumber: inv?.invoiceNumber || p.invoiceId,
      };
    });
  }, [payments, customers, invoices]);

  const table = useTableState(paymentsWithDetails, {
    searchFields: ['reference', 'customerName', 'invoiceNumber', 'method', 'referenceNumber'],
    initialSort: 'paymentDate',
    initialSortDir: 'desc',
  });

  // Filter invoices for chosen customer
  const availableInvoices = useMemo(() => {
    if (!customerId) return [];
    return invoices.filter(
      (i) => i.customerId === customerId && i.outstandingAmount > 0
    );
  }, [customerId, invoices]);

  const handleOpenRegister = () => {
    if (customers.length > 0) {
      setCustomerId(customers[0].id);
    }
    setInvoiceId('');
    setAmount('');
    setMethod('bank_transfer');
    setReferenceNumber(`TXN/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`);
    setNote('');
    setRegisterModalOpen(true);
  };

  const handleCustomerChange = (cId) => {
    setCustomerId(cId);
    const firstUnpaid = invoices.find((i) => i.customerId === cId && i.outstandingAmount > 0);
    if (firstUnpaid) {
      setInvoiceId(firstUnpaid.id);
      setAmount(firstUnpaid.outstandingAmount);
    } else {
      setInvoiceId('');
      setAmount('');
    }
  };

  const handleInvoiceChange = (invId) => {
    setInvoiceId(invId);
    const inv = invoices.find((i) => i.id === invId);
    if (inv) {
      setAmount(inv.outstandingAmount);
    }
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv && amt > inv.outstandingAmount) {
      toast.error('Payment cannot exceed outstanding invoice amount');
      return;
    }

    registerPayment({
      customerId,
      invoiceId,
      paymentDate: new Date().toISOString().split('T')[0],
      method,
      amount: amt,
      referenceNumber,
      note,
    });

    toast.success('Payment recorded successfully');
    setRegisterModalOpen(false);
  };

  const handleExport = () => {
    const data = paymentsWithDetails.map((p) => ({
      PaymentRef: p.reference,
      Customer: p.customerName,
      Invoice: p.invoiceNumber,
      Date: p.paymentDate,
      Method: p.method,
      Amount: p.amount,
      Status: p.status,
      TransactionNumber: p.referenceNumber,
    }));
    downloadCSV(data, 'AxiomIQ_Payments');
    toast.success('Payments exported to CSV');
  };

  const columns = [
    {
      key: 'reference',
      label: 'Payment Ref #',
      width: '160px',
      sortable: true,
      render: (val, row) => (
        <button
          type="button"
          onClick={() => {
            setSelectedPayment(row);
            setDetailModalOpen(true);
          }}
          className="font-mono text-xs font-semibold text-navy hover:text-action hover:underline text-left cursor-pointer"
        >
          {val}
        </button>
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
            Inv:{' '}
            <Link to={`/admin/invoices/${row.invoiceId}`} className="hover:underline font-mono">
              {row.invoiceNumber}
            </Link>
          </div>
        </div>
      ),
    },
    {
      key: 'paymentDate',
      label: 'Receipt Date',
      sortable: true,
      render: (val) => <span className="text-xs text-text-secondary">{formatDate(val)}</span>,
    },
    {
      key: 'method',
      label: 'Channel',
      render: (val, row) => (
        <div>
          <span className="uppercase text-xs font-semibold text-text-primary">
            {val.replace('_', ' ')}
          </span>
          {row.referenceNumber && (
            <p className="font-mono text-[10px] text-text-secondary truncate max-w-[120px]">
              {row.referenceNumber}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Collected Amount',
      align: 'right',
      sortable: true,
      render: (val, row) => (
        <span
          className={`font-bold ${row.status === 'failed' ? 'text-danger line-through' : 'text-success'
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
        <button
          type="button"
          onClick={() => {
            setSelectedPayment(row);
            setDetailModalOpen(true);
          }}
          className="p-1.5 rounded-lg text-text-secondary hover:text-action hover:bg-blue-50 transition-colors cursor-pointer"
          title="View Receipt"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            Payment Receipts & Reconciliations
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Audit settled incoming bank transfers, UPI collections, card charges, and failed transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenRegister}
          className="btn btn-primary btn-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Register Payment</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={table.paginatedData}
        searchable
        searchPlaceholder="Search payments by ref, client, UTR #..."
        searchValue={table.search}
        onSearchChange={table.setSearch}
        filters={[
          {
            key: 'method',
            label: 'Channel',
            options: [
              { value: 'bank_transfer', label: 'Bank Transfer' },
              { value: 'upi', label: 'UPI' },
              { value: 'card', label: 'Card' },
            ],
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'completed', label: 'Completed' },
              { value: 'failed', label: 'Failed' },
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
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Record Customer Payment"
        subtitle="Match funds to open subscription tax invoices in frontend state."
        size="md"
      >
        <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
          <div>
            <label className="label">Customer Account *</label>
            <select
              value={customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="select-field"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company || c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Open Invoice to Apply Payment *</label>
            <select
              value={invoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="select-field"
            >
              {availableInvoices.length === 0 ? (
                <option value="">No open invoices with balance due</option>
              ) : (
                availableInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} (Outstanding: {formatCurrency(inv.outstandingAmount)})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Settled Amount (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field font-bold text-navy text-sm"
              />
            </div>
            <div>
              <label className="label">Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="select-field"
              >
                <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Bank UTR / Transaction Reference #</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="input-field"
              placeholder="e.g. CMS/2026/08/9912"
            />
          </div>

          <div>
            <label className="label">Internal Notes</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-field resize-none"
              placeholder="Bank reconciliation notes..."
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={() => setRegisterModalOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!invoiceId}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Record & Settle</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Payment Detail Modal */}
      <Modal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Payment Receipt Details"
        subtitle={`Ref: ${selectedPayment?.reference}`}
        size="md"
      >
        {selectedPayment && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-gray-50 rounded-xl border border-border flex items-center justify-between">
              <div>
                <span className="text-text-secondary uppercase text-[10px] font-bold">
                  Receipt Total
                </span>
                <p className="text-2xl font-bold text-navy mt-0.5">
                  {formatCurrency(selectedPayment.amount)}
                </p>
              </div>
              <StatusBadge status={selectedPayment.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-text-secondary">Client:</span>
                <p className="font-semibold text-text-primary mt-0.5">
                  {selectedPayment.customerName}
                </p>
              </div>
              <div>
                <span className="text-text-secondary">Applied Invoice:</span>
                <p className="font-mono font-semibold text-action mt-0.5">
                  <Link to={`/admin/invoices/${selectedPayment.invoiceId}`} className="hover:underline">
                    {selectedPayment.invoiceNumber}
                  </Link>
                </p>
              </div>
              <div>
                <span className="text-text-secondary">Settlement Date:</span>
                <p className="font-medium text-text-primary mt-0.5">
                  {formatDate(selectedPayment.paymentDate)}
                </p>
              </div>
              <div>
                <span className="text-text-secondary">Payment Method:</span>
                <p className="font-semibold uppercase text-text-primary mt-0.5">
                  {selectedPayment.method.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <span className="text-text-secondary">Transaction UTR / Reference:</span>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 text-navy">
                {selectedPayment.referenceNumber || 'N/A'}
              </p>
            </div>

            {selectedPayment.note && (
              <div>
                <span className="text-text-secondary">Internal Note:</span>
                <p className="text-text-primary mt-0.5 italic">{selectedPayment.note}</p>
              </div>
            )}

            <div className="pt-4 flex justify-end border-t border-border">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
