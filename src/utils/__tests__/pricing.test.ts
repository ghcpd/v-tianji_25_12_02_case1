import {
  formatCurrency,
  calculateTax,
  calculateDiscount,
  calculateShipping,
  applyBulkDiscount,
  calculateInstallmentPayment,
} from '../pricing';

describe('formatCurrency', () => {
  it('should format USD currency correctly', () => {
    expect(formatCurrency(100, 'USD')).toBe('$100.00');
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('should use USD as default currency', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('should format EUR currency correctly', () => {
    expect(formatCurrency(100, 'EUR')).toMatch(/€100\.00|100,00\s*€/);
  });

  it('should format GBP currency correctly', () => {
    expect(formatCurrency(100, 'GBP')).toMatch(/£100\.00/);
  });

  it('should handle zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });

  it('should handle negative amounts', () => {
    expect(formatCurrency(-50, 'USD')).toBe('-$50.00');
  });

  it('should handle decimal amounts', () => {
    expect(formatCurrency(99.99, 'USD')).toBe('$99.99');
    expect(formatCurrency(0.01, 'USD')).toBe('$0.01');
  });

  it('should handle large amounts', () => {
    expect(formatCurrency(1000000, 'USD')).toBe('$1,000,000.00');
  });
});

describe('calculateTax', () => {
  it('should calculate tax correctly', () => {
    expect(calculateTax(100, 0.1)).toBe(10);
    expect(calculateTax(100, 0.15)).toBe(15);
  });

  it('should round to 2 decimal places', () => {
    expect(calculateTax(100, 0.123)).toBe(12.3);
  });

  it('should handle zero amount', () => {
    expect(calculateTax(0, 0.1)).toBe(0);
  });

  it('should handle zero rate', () => {
    expect(calculateTax(100, 0)).toBe(0);
  });

  it('should handle decimal amounts', () => {
    expect(calculateTax(99.99, 0.1)).toBe(10);
  });

  it('should handle different tax rates', () => {
    expect(calculateTax(100, 0.05)).toBe(5);
    expect(calculateTax(100, 0.20)).toBe(20);
    expect(calculateTax(100, 0.25)).toBe(25);
  });

  it('should handle rounding edge cases', () => {
    expect(calculateTax(100, 0.066)).toBe(6.6);
    expect(calculateTax(100, 0.0666)).toBe(6.66);
  });
});

describe('calculateDiscount', () => {
  it('should return discount for valid code SAVE10', () => {
    const discount = calculateDiscount('SAVE10', 100);
    expect(discount).toEqual({
      code: 'SAVE10',
      type: 'percentage',
      value: 10,
    });
  });

  it('should return discount for valid code SAVE20', () => {
    const discount = calculateDiscount('SAVE20', 100);
    expect(discount).toEqual({
      code: 'SAVE20',
      type: 'percentage',
      value: 20,
      minPurchase: 100,
    });
  });

  it('should return discount for valid code FLAT50', () => {
    const discount = calculateDiscount('FLAT50', 200);
    expect(discount).toEqual({
      code: 'FLAT50',
      type: 'fixed',
      value: 50,
      minPurchase: 200,
    });
  });

  it('should return discount for valid code VIP30', () => {
    const discount = calculateDiscount('VIP30', 500);
    expect(discount).toEqual({
      code: 'VIP30',
      type: 'percentage',
      value: 30,
      minPurchase: 500,
      maxDiscount: 150,
    });
  });

  it('should return null for invalid code', () => {
    expect(calculateDiscount('INVALID', 100)).toBeNull();
  });

  it('should return null if minimum purchase not met for SAVE20', () => {
    expect(calculateDiscount('SAVE20', 50)).toBeNull();
    expect(calculateDiscount('SAVE20', 99.99)).toBeNull();
  });

  it('should return null if minimum purchase not met for FLAT50', () => {
    expect(calculateDiscount('FLAT50', 150)).toBeNull();
  });

  it('should return null if minimum purchase not met for VIP30', () => {
    expect(calculateDiscount('VIP30', 400)).toBeNull();
  });

  it('should be case insensitive', () => {
    expect(calculateDiscount('save10', 100)).toEqual({
      code: 'SAVE10',
      type: 'percentage',
      value: 10,
    });
    expect(calculateDiscount('SaVe10', 100)).toEqual({
      code: 'SAVE10',
      type: 'percentage',
      value: 10,
    });
  });

  it('should return SAVE10 for any amount', () => {
    expect(calculateDiscount('SAVE10', 1)).not.toBeNull();
    expect(calculateDiscount('SAVE10', 10000)).not.toBeNull();
  });

  it('should handle exact minimum purchase', () => {
    expect(calculateDiscount('SAVE20', 100)).not.toBeNull();
    expect(calculateDiscount('FLAT50', 200)).not.toBeNull();
    expect(calculateDiscount('VIP30', 500)).not.toBeNull();
  });
});

describe('calculateShipping', () => {
  it('should calculate basic shipping cost', () => {
    const cost = calculateShipping(10, 100, false);
    expect(cost).toBeGreaterThan(0);
    expect(cost).toBe(11); // 5 + (10 * 0.5) + (100 * 0.01)
  });

  it('should double cost for express shipping', () => {
    const regular = calculateShipping(10, 100, false);
    const express = calculateShipping(10, 100, true);
    expect(express).toBe(regular * 2);
  });

  it('should handle zero weight', () => {
    const cost = calculateShipping(0, 100, false);
    expect(cost).toBe(6); // 5 + 0 + (100 * 0.01)
  });

  it('should handle zero distance', () => {
    const cost = calculateShipping(10, 0, false);
    expect(cost).toBe(10); // 5 + (10 * 0.5) + 0
  });

  it('should handle zero weight and distance', () => {
    const cost = calculateShipping(0, 0, false);
    expect(cost).toBe(5); // base rate only
  });

  it('should calculate correctly for various weights', () => {
    expect(calculateShipping(5, 100, false)).toBe(8.5);
    expect(calculateShipping(20, 100, false)).toBe(16);
  });

  it('should calculate correctly for various distances', () => {
    expect(calculateShipping(10, 50, false)).toBe(10.5);
    expect(calculateShipping(10, 200, false)).toBe(12);
  });

  it('should round to 2 decimal places', () => {
    const cost = calculateShipping(3, 150, false);
    expect(cost).toBe(8);
  });

  it('should handle express shipping with various inputs', () => {
    expect(calculateShipping(5, 50, true)).toBe(16); // (5 + 2.5 + 0.5) * 2
    expect(calculateShipping(0, 0, true)).toBe(10); // 5 * 2
  });
});

describe('applyBulkDiscount', () => {
  it('should apply 15% discount for 100+ items', () => {
    expect(applyBulkDiscount(100, 10)).toBe(8.5);
    expect(applyBulkDiscount(150, 10)).toBe(8.5);
    expect(applyBulkDiscount(1000, 10)).toBe(8.5);
  });

  it('should apply 10% discount for 50-99 items', () => {
    expect(applyBulkDiscount(50, 10)).toBe(9);
    expect(applyBulkDiscount(75, 10)).toBe(9);
    expect(applyBulkDiscount(99, 10)).toBe(9);
  });

  it('should apply 5% discount for 20-49 items', () => {
    expect(applyBulkDiscount(20, 10)).toBe(9.5);
    expect(applyBulkDiscount(30, 10)).toBe(9.5);
    expect(applyBulkDiscount(49, 10)).toBe(9.5);
  });

  it('should apply no discount for less than 20 items', () => {
    expect(applyBulkDiscount(1, 10)).toBe(10);
    expect(applyBulkDiscount(10, 10)).toBe(10);
    expect(applyBulkDiscount(19, 10)).toBe(10);
  });

  it('should work with different unit prices', () => {
    expect(applyBulkDiscount(100, 20)).toBe(17);
    expect(applyBulkDiscount(50, 5)).toBe(4.5);
    expect(applyBulkDiscount(20, 100)).toBe(95);
  });

  it('should handle decimal prices', () => {
    expect(applyBulkDiscount(100, 9.99)).toBe(8.4915);
    expect(applyBulkDiscount(50, 19.99)).toBe(17.991);
  });

  it('should handle quantity at boundary', () => {
    expect(applyBulkDiscount(20, 10)).toBe(9.5);
    expect(applyBulkDiscount(50, 10)).toBe(9);
    expect(applyBulkDiscount(100, 10)).toBe(8.5);
  });
});

describe('calculateInstallmentPayment', () => {
  it('should calculate installment payment correctly', () => {
    const payment = calculateInstallmentPayment(1000, 12, 12);
    expect(payment).toBeGreaterThan(0);
    expect(payment).toBeCloseTo(88.85, 1);
  });

  it('should handle zero interest rate', () => {
    const payment = calculateInstallmentPayment(1000, 0, 10);
    expect(payment).toBe(100); // 1000 / 10
  });

  it('should handle single payment', () => {
    const payment = calculateInstallmentPayment(1000, 12, 1);
    expect(payment).toBeGreaterThan(1000);
  });

  it('should handle different principal amounts', () => {
    const payment1 = calculateInstallmentPayment(5000, 12, 24);
    const payment2 = calculateInstallmentPayment(10000, 12, 24);
    expect(payment2).toBeGreaterThan(payment1);
    expect(payment2).toBeCloseTo(payment1 * 2, 0);
  });

  it('should handle different interest rates', () => {
    const payment1 = calculateInstallmentPayment(1000, 5, 12);
    const payment2 = calculateInstallmentPayment(1000, 15, 12);
    expect(payment2).toBeGreaterThan(payment1);
  });

  it('should handle different loan terms', () => {
    const payment1 = calculateInstallmentPayment(1000, 12, 6);
    const payment2 = calculateInstallmentPayment(1000, 12, 24);
    expect(payment1).toBeGreaterThan(payment2);
  });

  it('should round to 2 decimal places', () => {
    const payment = calculateInstallmentPayment(1234.56, 8.5, 18);
    expect(payment).toBe(Math.round(payment * 100) / 100);
  });

  it('should handle large principal amounts', () => {
    const payment = calculateInstallmentPayment(100000, 6, 360);
    expect(payment).toBeGreaterThan(0);
    expect(payment).toBeCloseTo(599.55, 1);
  });

  it('should handle short-term loans', () => {
    const payment = calculateInstallmentPayment(1000, 12, 3);
    expect(payment).toBeGreaterThan(333);
  });

  it('should handle typical car loan', () => {
    const payment = calculateInstallmentPayment(25000, 5, 60);
    expect(payment).toBeCloseTo(471.78, 1);
  });

  it('should handle typical mortgage', () => {
    const payment = calculateInstallmentPayment(200000, 4, 360);
    expect(payment).toBeCloseTo(954.83, 1);
  });
});
