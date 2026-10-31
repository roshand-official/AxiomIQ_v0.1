/**
 * Calculate next billing date based on frequency and interval
 * @param {Date|string} fromDate - Base date
 * @param {string} frequency - DAILY, WEEKLY, MONTHLY, YEARLY
 * @param {number} interval - Number of units (default: 1)
 * @returns {Date}
 */
const calculateNextBillingDate = (fromDate, frequency, interval = 1) => {
  const date = new Date(fromDate);
  const count = Math.max(1, parseInt(interval, 10) || 1);

  switch (frequency) {
    case 'DAILY':
      date.setDate(date.getDate() + count);
      break;
    case 'WEEKLY':
      date.setDate(date.getDate() + count * 7);
      break;
    case 'MONTHLY':
      date.setMonth(date.getMonth() + count);
      break;
    case 'YEARLY':
      date.setFullYear(date.getFullYear() + count);
      break;
    default:
      date.setMonth(date.getMonth() + count);
  }

  return date;
};

/**
 * Calculate days overdue between due date and target date (defaults to now)
 */
const calculateDaysOverdue = (dueDate, targetDate = new Date()) => {
  const due = new Date(dueDate);
  const now = new Date(targetDate);
  const diffTime = now.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

/**
 * Add days to date
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

module.exports = {
  calculateNextBillingDate,
  calculateDaysOverdue,
  addDays,
};
