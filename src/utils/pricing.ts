import { DiscountCode } from '@/types';

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const calculateTax = (amount: number, rate: number): number => {
  return Math.round(amount * rate * 100) / 100;
};

export const calculateDiscount = (code: string, subtotal: number): DiscountCode | null => {
  const discountCodes: Record<string, DiscountCode> = {
    'SAVE10': {
      code: 'SAVE10',
      type: 'percentage',
      value: 10,
    },
    'SAVE20': {
      code: 'SAVE20',
      type: 'percentage',
      value: 20,
      minPurchase: 100,
    },
    'FLAT50': {
      code: 'FLAT50',
      type: 'fixed',
      value: 50,
      minPurchase: 200,
    },
    'VIP30': {
      code: 'VIP30',
      type: 'percentage',
      value: 30,
      minPurchase: 500,
      maxDiscount: 150,
    },
  };

  const discount = discountCodes[code.toUpperCase()];
  
  if (!discount) return null;
  
  if (discount.minPurchase && subtotal < discount.minPurchase) {
    return null;
  }

  return discount;
};

export const calculateShipping = (
  weight: number,
  distance: number,
  express: boolean = false
): number => {
  const baseRate = 5;
  const weightRate = 0.5;
  const distanceRate = 0.01;
  const expressMultiplier = 2;

  let cost = baseRate + (weight * weightRate) + (distance * distanceRate);
  
  if (express) {
    cost *= expressMultiplier;
  }

  return Math.round(cost * 100) / 100;
};

export const applyBulkDiscount = (quantity: number, unitPrice: number): number => {
  if (quantity >= 100) {
    return unitPrice * 0.85;
  } else if (quantity >= 50) {
    return unitPrice * 0.90;
  } else if (quantity >= 20) {
    return unitPrice * 0.95;
  }
  return unitPrice;
};

export const calculateInstallmentPayment = (
  principal: number,
  annualRate: number,
  months: number
): number => {
  if (months === 0 || annualRate === 0) {
    return principal / months;
  }

  const monthlyRate = annualRate / 12 / 100;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return Math.round(payment * 100) / 100;
};
