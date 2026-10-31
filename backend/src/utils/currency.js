const { Decimal } = require('@prisma/client/runtime/library');

/**
 * Format a number or Decimal to INR currency string: ₹12,345.00
 */
const formatINR = (value) => {
  const num = typeof value === 'object' && value !== null && 'toNumber' in value 
    ? value.toNumber() 
    : Number(value || 0);

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Safe conversion to Prisma Decimal with 2 decimal places
 */
const toDecimal = (val) => {
  if (val === null || val === undefined) return new Decimal('0.00');
  if (typeof val === 'object' && 'toNumber' in val) return val;
  const num = Number(val);
  return new Decimal(isNaN(num) ? '0.00' : num.toFixed(2));
};

/**
 * Calculate line item subtotal: Quantity * UnitPrice
 */
const calculateLineSubtotal = (quantity, unitPrice) => {
  const qty = Number(quantity || 0);
  const price = toDecimal(unitPrice);
  return toDecimal(price.mul(qty));
};

/**
 * Calculate tax amount: TaxableAmount * (TaxRate / 100)
 */
const calculateTax = (taxableAmount, taxRate = 18.0) => {
  const amount = toDecimal(taxableAmount);
  const rate = toDecimal(taxRate).div(100);
  return toDecimal(amount.mul(rate));
};

module.exports = {
  formatINR,
  toDecimal,
  calculateLineSubtotal,
  calculateTax,
};
