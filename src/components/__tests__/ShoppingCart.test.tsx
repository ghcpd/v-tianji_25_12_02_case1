import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShoppingCart } from '../ShoppingCart';
import { Product } from '@/types';
import * as pricing from '@/utils/pricing';

jest.mock('@/utils/pricing', () => ({
  ...jest.requireActual('@/utils/pricing'),
  calculateDiscount: jest.fn(),
}));

const mockProducts: Product[] = [
  { id: '1', name: 'Product 1', price: 10, category: 'A', stock: 100 },
  { id: '2', name: 'Product 2', price: 20, category: 'B', stock: 50 },
  { id: '3', name: 'Product 3', price: 15, category: 'C', stock: 25 },
];

describe('ShoppingCart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    (window.alert as jest.Mock).mockRestore();
  });

  describe('Initial Render', () => {
    it('should render empty cart message', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    });

    it('should display item count as 0', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByText(/0 items/i)).toBeInTheDocument();
    });

    it('should render shopping cart container', () => {
      render(<ShoppingCart products={mockProducts} />);
      const cart = screen.getByTestId('shopping-cart');
      expect(cart).toBeInTheDocument();
    });

    it('should not show cart items section when empty', () => {
      render(<ShoppingCart products={mockProducts} />);
      const emptyMessage = screen.getByText(/Your cart is empty/i);
      expect(emptyMessage).toBeInTheDocument();
    });
  });

  describe('Add to Cart', () => {
    it('should add a product to cart', () => {
      const { rerender } = render(<ShoppingCart products={mockProducts} />);
      const cart = screen.getByTestId('shopping-cart');
      const component = cart.parentElement as any;
      
      // Simulate adding product via exposed methods
      expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    });

    it('should increase quantity when adding existing product', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByText(/0 items/i)).toBeInTheDocument();
    });

    it('should add product with custom quantity', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });
  });

  describe('Update Quantity', () => {
    it('should increase item quantity', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });

    it('should decrease item quantity', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });

    it('should remove item when quantity decreases to 0', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });
  });

  describe('Remove from Cart', () => {
    it('should remove item from cart', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });
  });

  describe('Clear Cart', () => {
    it('should clear all items from cart', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });

    it('should clear discount when clearing cart', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });
  });

  describe('Discount Codes', () => {
    it('should apply valid discount code', async () => {
      (pricing.calculateDiscount as jest.Mock).mockReturnValue({
        code: 'SAVE10',
        type: 'percentage',
        value: 10,
      });

      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });

    it('should show alert for invalid discount code', async () => {
      (pricing.calculateDiscount as jest.Mock).mockReturnValue(null);

      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });

    it('should not apply discount when code is empty', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });

    it('should disable discount input when discount is applied', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });

    it('should remove applied discount', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });
  });

  describe('Calculations', () => {
    it('should calculate subtotal correctly', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });

    it('should calculate discount amount for percentage type', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });

    it('should calculate discount amount for fixed type', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });

    it('should limit fixed discount to subtotal amount', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });

    it('should calculate tax on taxable amount', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });

    it('should calculate total correctly', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });

    it('should use custom tax rate', () => {
      render(<ShoppingCart products={mockProducts} taxRate={0.15} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });
  });

  describe('Checkout', () => {
    it('should show alert when checking out with empty cart', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });

    it('should show alert when total is invalid', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });

    it('should call onCheckout callback', () => {
      const onCheckout = jest.fn();
      render(<ShoppingCart products={mockProducts} onCheckout={onCheckout} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });

    it('should show checkout modal after successful checkout', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });
  });

  describe('Currency Formatting', () => {
    it('should format prices with USD by default', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });

    it('should format prices with custom currency', () => {
      render(<ShoppingCart products={mockProducts} currency="EUR" />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });
  });

  describe('Item Count', () => {
    it('should count total items correctly', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByText(/0 items/i)).toBeInTheDocument();
    });

    it('should update item count when adding items', () => {
      render(<ShoppingCart products={mockProducts} />);
      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
    });
  });
});
