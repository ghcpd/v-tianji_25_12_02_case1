import { formatCurrency, calculateTax, calculateDiscount, calculateShipping, applyBulkDiscount, calculateInstallmentPayment } from '../pricing';

describe('formatCurrency', () => {
  it('should format USD currency correctly', () => {
    expect(formatCurrency(100, 'USD')).toBe('$100.00');
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('should use USD as default currency', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });

  it('should format negative amounts', () => {
    expect(formatCurrency(-100, 'USD')).toBe('-$100.00');
  });

  it('should format decimal amounts', () => {
    expect(formatCurrency(10.99, 'USD')).toBe('$10.99');
  });

  it('should format EUR currency', () => {
    const result = formatCurrency(100, 'EUR');
    expect(result).toContain('100');
  });

  it('should format GBP currency', () => {
    const result = formatCurrency(100, 'GBP');
    expect(result).toContain('100');
  });

  it('should handle very large numbers', () => {
    const result = formatCurrency(999999999.99, 'USD');
    expect(result).toContain('999,999,999.99');
  });
});

describe('calculateTax', () => {
  it('should calculate tax correctly', () => {
    expect(calculateTax(100, 0.1)).toBe(10);
    expect(calculateTax(100, 0.15)).toBe(15);
  });

  it('should round to 2 decimal places', () => {
    expect(calculateTax(100, 0.123)).toBe(12.3);
    expect(calculateTax(99.99, 0.1)).toBe(10);
  });

  it('should handle zero tax rate', () => {
    expect(calculateTax(100, 0)).toBe(0);
  });

  it('should handle zero amount', () => {
    expect(calculateTax(0, 0.1)).toBe(0);
  });

  it('should calculate tax on decimal amounts', () => {
    expect(calculateTax(19.99, 0.1)).toBeCloseTo(2, 1);
  });

  it('should handle high tax rates', () => {
    expect(calculateTax(100, 0.5)).toBe(50);
  });

  it('should handle very small amounts', () => {
    const result = calculateTax(0.01, 0.1);
    expect(result).toBeLessThanOrEqual(0.01);
  });
});

describe('calculateDiscount', () => {
  it('should return discount for valid code', () => {
    const discount = calculateDiscount('SAVE10', 100);
    expect(discount).toEqual({
      code: 'SAVE10',
      type: 'percentage',
      value: 10,
    });
  });

  it('should return null for invalid code', () => {
    expect(calculateDiscount('INVALID', 100)).toBeNull();
  });

  it('should be case insensitive', () => {
    const discount1 = calculateDiscount('save10', 100);
    const discount2 = calculateDiscount('SAVE10', 100);
    expect(discount1).toEqual(discount2);
  });

  it('should return null if minimum purchase not met', () => {
    expect(calculateDiscount('SAVE20', 50)).toBeNull();
  });

  it('should return null if minimum purchase exactly not met', () => {
    expect(calculateDiscount('SAVE20', 99)).toBeNull();
  });

  it('should return discount if minimum purchase exactly met', () => {
    const discount = calculateDiscount('SAVE20', 100);
    expect(discount).not.toBeNull();
  });

  it('should handle percentage discount codes', () => {
    const discount = calculateDiscount('SAVE10', 150);
    expect(discount?.type).toBe('percentage');
  });

  it('should handle fixed discount codes', () => {
    const discount = calculateDiscount('FLAT50', 200);
    expect(discount?.type).toBe('fixed');
    expect(discount?.value).toBe(50);
  });

  it('should return discount with max discount limit', () => {
    const discount = calculateDiscount('VIP30', 500);
    expect(discount?.maxDiscount).toBe(150);
  });

  it('should handle multiple valid codes', () => {
    const codes = ['SAVE10', 'SAVE20', 'FLAT50', 'VIP30'];
    codes.forEach(code => {
      const discount = calculateDiscount(code, 500);
      expect(discount?.code).toBe(code);
    });
  });
});

describe('calculateShipping', () => {
  it('should calculate basic shipping cost', () => {
    const cost = calculateShipping(10, 100, false);
    expect(cost).toBeGreaterThan(0);
  });

  it('should increase cost with weight', () => {
    const light = calculateShipping(5, 100, false);
    const heavy = calculateShipping(15, 100, false);
    expect(heavy).toBeGreaterThan(light);
  });

  it('should increase cost with distance', () => {
    const near = calculateShipping(10, 50, false);
    const far = calculateShipping(10, 150, false);
    expect(far).toBeGreaterThan(near);
  });

  it('should double cost for express shipping', () => {
    const regular = calculateShipping(10, 100, false);
    const express = calculateShipping(10, 100, true);
    expect(express).toBe(regular * 2);
  });

  it('should handle zero weight', () => {
    const cost = calculateShipping(0, 100, false);
    expect(cost).toBeGreaterThan(0);
  });

  it('should handle zero distance', () => {
    const cost = calculateShipping(10, 0, false);
    expect(cost).toBeGreaterThan(0);
  });

  it('should return rounded value', () => {
    const cost = calculateShipping(10, 100, false);
    expect(cost * 100 % 1).toBe(0);
  });

  it('should handle very large values', () => {
    const cost = calculateShipping(1000, 10000, true);
    expect(cost).toBeGreaterThan(0);
  });
});

describe('applyBulkDiscount', () => {
  it('should apply 15% discount for 100+ items', () => {
    expect(applyBulkDiscount(100, 10)).toBe(8.5);
  });

  it('should apply 10% discount for 50+ items', () => {
    expect(applyBulkDiscount(50, 10)).toBe(9);
  });

  it('should apply 5% discount for 20+ items', () => {
    expect(applyBulkDiscount(20, 10)).toBe(9.5);
  });

  it('should apply no discount for less than 20 items', () => {
    expect(applyBulkDiscount(10, 10)).toBe(10);
    expect(applyBulkDiscount(1, 10)).toBe(10);
  });

  it('should apply 15% discount for 200+ items', () => {
    expect(applyBulkDiscount(200, 10)).toBe(8.5);
  });

  it('should apply discount on decimal prices', () => {
    expect(applyBulkDiscount(50, 9.99)).toBe(8.991);
  });

  it('should handle zero price', () => {
    expect(applyBulkDiscount(100, 0)).toBe(0);
  });

  it('should handle decimal quantities as boundary', () => {
    expect(applyBulkDiscount(19, 10)).toBe(10);
    expect(applyBulkDiscount(20, 10)).toBe(9.5);
    expect(applyBulkDiscount(49, 10)).toBe(9.5);
    expect(applyBulkDiscount(50, 10)).toBe(9);
    expect(applyBulkDiscount(99, 10)).toBe(9);
    expect(applyBulkDiscount(100, 10)).toBe(8.5);
  });
});

describe('calculateInstallmentPayment', () => {
  it('should calculate installment payment correctly', () => {
    const payment = calculateInstallmentPayment(1000, 12, 12);
    expect(payment).toBeGreaterThan(0);
    expect(typeof payment).toBe('number');
  });

  it('should handle zero interest rate', () => {
    const payment = calculateInstallmentPayment(1200, 0, 12);
    expect(payment).toBe(100);
  });

  it('should handle zero months edge case', () => {
    const payment = calculateInstallmentPayment(1000, 12, 0);
    expect(isFinite(payment)).toBe(false);
  });

  it('should increase payment with higher interest rate', () => {
    const low = calculateInstallmentPayment(1000, 5, 12);
    const high = calculateInstallmentPayment(1000, 15, 12);
    expect(high).toBeGreaterThan(low);
  });

  it('should decrease payment with more months', () => {
    const short = calculateInstallmentPayment(1000, 12, 6);
    const long = calculateInstallmentPayment(1000, 12, 24);
    expect(long).toBeLessThan(short);
  });

  it('should be rounded to 2 decimal places', () => {
    const payment = calculateInstallmentPayment(1000, 12, 12);
    expect(payment * 100 % 1).toBe(0);
  });

  it('should handle large principal amounts', () => {
    const payment = calculateInstallmentPayment(100000, 12, 60);
    expect(payment).toBeGreaterThan(0);
  });

  it('should handle small principal amounts', () => {
    const payment = calculateInstallmentPayment(10, 12, 12);
    expect(payment).toBeGreaterThan(0);
  });

  it('should handle high interest rates', () => {
    const payment = calculateInstallmentPayment(1000, 24, 24);
    expect(payment).toBeGreaterThan(1000 / 24);
  });

  it('should handle single month installment', () => {
    const payment = calculateInstallmentPayment(1000, 12, 1);
    expect(payment).toBeCloseTo(1010, 0);
  });

  it('should verify total payments cover principal and interest', () => {
    const principal = 1000;
    const payment = calculateInstallmentPayment(principal, 12, 12);
    const total = payment * 12;
    expect(total).toBeGreaterThan(principal);
  });
});
