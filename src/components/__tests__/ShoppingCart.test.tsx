import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { ShoppingCart } from '../ShoppingCart';
import { Product } from '@/types';

const mockProducts: Product[] = [
  { id: '1', name: 'Product 1', price: 10, category: 'A', stock: 100 },
  { id: '2', name: 'Product 2', price: 20, category: 'B', stock: 50 },
  { id: '3', name: 'Freebie', price: 0, category: 'C', stock: 1 },
];

describe('ShoppingCart', () => {
  const originalAlert = global.alert;

  beforeEach(() => {
    global.alert = jest.fn();
  });

  afterEach(() => {
    global.alert = originalAlert;
  });
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

  it('should add items to cart and display quantities and totals', async () => {
    render(<ShoppingCart products={mockProducts} />);
    await userEvent.click(screen.getByTestId('add-to-cart-1'));
    expect(screen.getAllByTestId('cart-item')).toHaveLength(1);
    const item = screen.getByTestId('cart-item');
    expect(within(item).getByText('Product 1')).toBeInTheDocument();
    expect(within(item).getAllByText('$10.00').length).toBeGreaterThanOrEqual(1); // item price/total

    // Increase quantity
    await userEvent.click(screen.getByLabelText('Increase quantity'));
    expect(within(item).getByText('2')).toBeInTheDocument();
    expect(within(item).getByText('$20.00')).toBeInTheDocument(); // item total

    // Decrease quantity
    await userEvent.click(screen.getByLabelText('Decrease quantity'));
    expect(within(item).getByText('1')).toBeInTheDocument();
  });

  it('should remove item when quantity goes to zero', async () => {
    render(<ShoppingCart products={mockProducts} />);
    await userEvent.click(screen.getByTestId('add-to-cart-1'));
    await userEvent.click(screen.getByLabelText('Decrease quantity'));
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });

  it('should remove item using remove button', async () => {
    render(<ShoppingCart products={mockProducts} />);
    await userEvent.click(screen.getByTestId('add-to-cart-1'));
    await userEvent.click(screen.getByLabelText('Remove item'));
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });

  it('should apply valid discount code and compute totals', async () => {
    render(<ShoppingCart products={mockProducts} taxRate={0.1} />);
    await userEvent.click(screen.getByTestId('add-to-cart-1'));

    await userEvent.type(screen.getByTestId('discount-input'), 'SAVE10');
    await userEvent.click(screen.getByTestId('apply-discount'));

    await waitFor(() => {
      expect(screen.getByText(/Discount \(SAVE10\)/i)).toBeInTheDocument();
    });

    // Subtotal 10, discount 1, taxable 9, tax 0.9, total 9.9
    const summary = screen.getByTestId('cart-summary');
    expect(within(summary).getByText('$10.00')).toBeInTheDocument();
    expect(within(summary).getByText('-$1.00')).toBeInTheDocument();
    expect(within(summary).getByText('$0.90')).toBeInTheDocument();
    expect(within(summary).getByText('$9.90')).toBeInTheDocument();
  });

  it('should show alert for invalid discount code', async () => {
    render(<ShoppingCart products={mockProducts} />);
    await userEvent.click(screen.getByTestId('add-to-cart-1'));
    await userEvent.type(screen.getByTestId('discount-input'), 'INVALID');
    await userEvent.click(screen.getByTestId('apply-discount'));
    expect(global.alert).toHaveBeenCalledWith('Invalid discount code');
  });

  it('should clear cart and reset discount', async () => {
    render(<ShoppingCart products={mockProducts} />);
    await userEvent.click(screen.getByTestId('add-to-cart-1'));
    await userEvent.type(screen.getByTestId('discount-input'), 'SAVE10');
    await userEvent.click(screen.getByTestId('apply-discount'));
    await waitFor(() => expect(screen.getByTestId('remove-discount')).toBeInTheDocument());

    await userEvent.click(screen.getByText(/Clear Cart/i));
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    expect(screen.queryByTestId('discount-input')).not.toBeInTheDocument();
  });

  it('should call onCheckout and show modal', async () => {
    const onCheckout = jest.fn();
    render(<ShoppingCart products={mockProducts} onCheckout={onCheckout} />);
    await userEvent.click(screen.getByTestId('add-to-cart-1'));
    await userEvent.click(screen.getByText(/Proceed to Checkout/i));
    expect(onCheckout).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('checkout-modal')).toBeInTheDocument();
  });

  it('should alert when total is invalid (<0.01)', async () => {
    render(<ShoppingCart products={mockProducts} />);
    await userEvent.click(screen.getByTestId('add-to-cart-3'));
    await userEvent.click(screen.getByText(/Proceed to Checkout/i));
    expect(global.alert).toHaveBeenCalledWith('Invalid total amount');
  });
});
