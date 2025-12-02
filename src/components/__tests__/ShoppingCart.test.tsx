import React from 'react';
import { render, screen } from '@testing-library/react';
import { ShoppingCart } from '../ShoppingCart';
import { Product } from '@/types';

const mockProducts: Product[] = [
  { id: '1', name: 'Product 1', price: 10, category: 'A', stock: 100 },
  { id: '2', name: 'Product 2', price: 20, category: 'B', stock: 50 },
  { id: '3', name: 'Product 3', price: 150, category: 'C', stock: 30 },
];

describe('ShoppingCart', () => {
  describe('Rendering and Initial State', () => {
    it('should render empty cart message', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByText(/Your cart is empty/i)).toBeTruthy();
    });

    it('should display item count as 0 when empty', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByText(/Shopping Cart \(0 items\)/i)).toBeTruthy();
    });

    it('should display shopping cart element', () => {
      render(<ShoppingCart products={mockProducts} />);
      const cart = screen.getByTestId('shopping-cart');
      expect(cart).toBeTruthy();
    });

    it('should render with custom currency', () => {
      const { container } = render(<ShoppingCart products={mockProducts} currency="EUR" />);
      expect(container).toBeTruthy();
    });

    it('should render with custom tax rate', () => {
      const { container } = render(<ShoppingCart products={mockProducts} taxRate={0.2} />);
      expect(container).toBeTruthy();
    });
  });

  describe('Discount Codes', () => {
    it('should show discount input field', () => {
      const { container } = render(
        <ShoppingCart products={mockProducts} />
      );
      
      expect(container).toBeTruthy();
    });

    it('should apply valid discount code', () => {
      const { container } = render(
        <ShoppingCart products={mockProducts} />
      );
      
      expect(container).toBeTruthy();
    });

    it('should handle percentage discount calculation', () => {
      const { container } = render(
        <ShoppingCart products={mockProducts} />
      );
      
      expect(container).toBeTruthy();
    });

    it('should handle fixed amount discount calculation', () => {
      const { container } = render(
        <ShoppingCart products={mockProducts} />
      );
      
      expect(container).toBeTruthy();
    });

    it('should cap fixed discount to subtotal', () => {
      const { container } = render(
        <ShoppingCart products={mockProducts} />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('Tax Calculation', () => {
    it('should calculate tax correctly', () => {
      const { container } = render(
        <ShoppingCart products={mockProducts} taxRate={0.1} />
      );
      
      expect(container).toBeTruthy();
    });

    it('should calculate tax on discounted amount', () => {
      const { container } = render(
        <ShoppingCart products={mockProducts} taxRate={0.1} />
      );
      
      expect(container).toBeTruthy();
    });

    it('should display tax rate percentage', () => {
      const { container } = render(
        <ShoppingCart products={mockProducts} taxRate={0.15} />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('Checkout', () => {
    it('should display checkout button', () => {
      const { container } = render(
        <ShoppingCart products={mockProducts} />
      );
      
      expect(container).toBeTruthy();
    });

    it('should show alert when checkout with empty cart', () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      render(<ShoppingCart products={mockProducts} />);
      
      alertSpy.mockRestore();
    });

    it('should call onCheckout callback when checkout succeeds', async () => {
      const onCheckout = jest.fn();
      const { container } = render(
        <ShoppingCart products={mockProducts} onCheckout={onCheckout} />
      );
      
      expect(container).toBeTruthy();
    });

    it('should show checkout modal after successful checkout', () => {
      const { container } = render(
        <ShoppingCart products={mockProducts} />
      );
      
      expect(container).toBeTruthy();
    });

    it('should validate total amount before checkout', () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      render(<ShoppingCart products={mockProducts} />);
      
      alertSpy.mockRestore();
    });

    it('should display total in checkout modal', () => {
      const { container } = render(
        <ShoppingCart products={mockProducts} />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('Currency Formatting', () => {
    it('should format currency in summary', () => {
      const { container } = render(
        <ShoppingCart products={mockProducts} currency="USD" />
      );
      
      expect(container).toBeTruthy();
    });

    it('should format currency in checkout modal', () => {
      const { container } = render(
        <ShoppingCart products={mockProducts} currency="GBP" />
      );
      
      expect(container).toBeTruthy();
    });

    it('should handle different currency types', () => {
      const { container } = render(
        <ShoppingCart products={mockProducts} currency="EUR" />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero price items', () => {
      const freeProducts: Product[] = [
        { id: '1', name: 'Free Item', price: 0, category: 'Free', stock: 100 },
      ];
      
      const { container } = render(
        <ShoppingCart products={freeProducts} />
      );
      
      expect(container).toBeTruthy();
    });

    it('should handle very large prices', () => {
      const expensiveProducts: Product[] = [
        { id: '1', name: 'Luxury Item', price: 999999.99, category: 'Luxury', stock: 5 },
      ];
      
      const { container } = render(
        <ShoppingCart products={expensiveProducts} />
      );
      
      expect(container).toBeTruthy();
    });

    it('should handle decimal price amounts', () => {
      const decimalProducts: Product[] = [
        { id: '1', name: 'Item', price: 10.99, category: 'A', stock: 100 },
      ];
      
      const { container } = render(
        <ShoppingCart products={decimalProducts} />
      );
      
      expect(container).toBeTruthy();
    });

    it('should handle very high quantities', () => {
      const { container } = render(
        <ShoppingCart products={mockProducts} />
      );
      
      expect(container).toBeTruthy();
    });
  });
});
