import { formatCurrency, calculateTax, calculateDiscount, calculateShipping, applyBulkDiscount } from '../pricing';

describe('formatCurrency', () => {
  it('should format USD currency correctly', () => {
    expect(formatCurrency(100, 'USD')).toBe('$100.00');
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('should use USD as default currency', () => {
    expect(formatCurrency(100)).toBe('$100.00');
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

  it('should return null if minimum purchase not met', () => {
    expect(calculateDiscount('SAVE20', 50)).toBeNull();
  });
});

describe('calculateShipping', () => {
  it('should calculate basic shipping cost', () => {
    const cost = calculateShipping(10, 100, false);
    expect(cost).toBeGreaterThan(0);
  });

  it('should double cost for express shipping', () => {
    const regular = calculateShipping(10, 100, false);
    const express = calculateShipping(10, 100, true);
    expect(express).toBeGreaterThan(regular);
  });
});

describe('applyBulkDiscount', () => {
  it('should apply 15% discount for 100+ items', () => {
    expect(applyBulkDiscount(100, 10)).toBe(8.5);
  });

  it('should apply 10% discount for 50+ items', () => {
    expect(applyBulkDiscount(50, 10)).toBe(9);
  });

  it('should apply no discount for less than 20 items', () => {
    expect(applyBulkDiscount(10, 10)).toBe(10);
  });
});
