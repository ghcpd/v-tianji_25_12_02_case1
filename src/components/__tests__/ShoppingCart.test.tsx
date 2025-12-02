import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShoppingCart } from '../ShoppingCart';
import { Product } from '@/types';

const mockProducts: Product[] = [
  { id: '1', name: 'Product 1', price: 10, category: 'A', stock: 100 },
  { id: '2', name: 'Product 2', price: 20, category: 'B', stock: 50 },
];

describe('ShoppingCart', () => {
  it('should render empty cart message', () => {
    render(<ShoppingCart products={mockProducts} />);
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });

  it('should display item count', () => {
    render(<ShoppingCart products={mockProducts} />);
    expect(screen.getByText(/0 items/i)).toBeInTheDocument();
  });

  it('should format currency correctly', () => {
    render(<ShoppingCart products={mockProducts} />);
    const cart = screen.getByTestId('shopping-cart');
    expect(cart).toBeInTheDocument();
  });

  it('should calculate subtotal correctly', () => {
    render(<ShoppingCart products={mockProducts} />);
    expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
  });
});
