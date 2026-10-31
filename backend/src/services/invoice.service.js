const invoiceRepository = require('../repositories/invoice.repository');
const activityRepository = require('../repositories/activity.repository');
const ApiError = require('../utils/apiError');
const { calculateDaysOverdue } = require('../utils/dateHelper');

class InvoiceService {
  async getAllInvoices(filters) {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const { invoices, total } = await invoiceRepository.findMany({
      search: filters.search,
      status: filters.status,
      customerId: filters.customerId,
      subscriptionId: filters.subscriptionId,
      isOverdue: filters.isOverdue === 'true',
      skip,
      take: limit,
    });

    // Compute dynamic days overdue for display
    const formatted = invoices.map((inv) => {
      const daysOverdue = inv.status !== 'PAID' && inv.dueDate < new Date()
        ? calculateDaysOverdue(inv.dueDate)
        : 0;
      return {
        ...inv,
        daysOverdue,
      };
    });

    return { invoices: formatted, total, page, limit };
  }

  async getInvoiceById(id) {
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      throw ApiError.notFound(`Invoice with ID '${id}' not found`);
    }

    const daysOverdue = invoice.status !== 'PAID' && invoice.dueDate < new Date()
      ? calculateDaysOverdue(invoice.dueDate)
      : 0;

    return {
      ...invoice,
      daysOverdue,
    };
  }

  async updateStatus(id, newStatus, actorId) {
    const invoice = await this.getInvoiceById(id);

    const allowed = ['DRAFT', 'CONFIRMED', 'CANCELLED'];
    if (!allowed.includes(newStatus)) {
      throw ApiError.badRequest(`Cannot manually set invoice status to '${newStatus}'.`);
    }

    const updated = await invoiceRepository.update(id, { status: newStatus });

    await activityRepository.log({
      userId: actorId,
      customerId: invoice.customerId,
      entityType: 'INVOICE',
      entityId: id,
      action: 'STATUS_CHANGE',
      description: `Invoice ${invoice.invoiceNumber} status changed to ${newStatus}`,
    });

    return updated;
  }
}

module.exports = new InvoiceService();
