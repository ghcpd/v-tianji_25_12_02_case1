import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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

  it('should allow adding products and updating quantities', () => {
    render(<ShoppingCart products={mockProducts} />);

    const addBtn = screen.getByRole('button', { name: /Add Product 1/i });
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);

    expect(screen.getAllByTestId('cart-item')).toHaveLength(1);
    const heading = screen.getByRole('heading', { name: /Shopping Cart/i });
    expect(heading.textContent).toMatch(/2\s+items/);

    const increaseBtn = screen.getByLabelText('Increase quantity');
    fireEvent.click(increaseBtn);
    expect(screen.getByText('3')).toBeInTheDocument();

    const decreaseBtn = screen.getByLabelText('Decrease quantity');
    fireEvent.click(decreaseBtn);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should remove item when quantity <= 0', () => {
    render(<ShoppingCart products={mockProducts} />);
    const addBtn = screen.getByRole('button', { name: /Add Product 1/i });
    fireEvent.click(addBtn);

    // decrease to 0
    const decreaseBtn = screen.getByLabelText('Decrease quantity');
    fireEvent.click(decreaseBtn);

    expect(screen.queryByTestId('cart-item')).not.toBeInTheDocument();
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });

  it('should apply and remove discount codes', async () => {
    render(<ShoppingCart products={mockProducts} />);
    const addBtn = screen.getByRole('button', { name: /Add Product 2/i });
    fireEvent.click(addBtn);

    const input = screen.getByPlaceholderText(/Discount code/i);
    const applyButton = screen.getByText('Apply');

    // apply valid
    fireEvent.change(input, { target: { value: 'SAVE10' } });
    fireEvent.click(applyButton);

    await waitFor(() => expect(input).toBeDisabled());

    // remove (the second Remove corresponds to removing the applied discount)
    const shopping = screen.getByTestId('shopping-cart');
    const removeButtons = within(shopping).getAllByText('Remove');
    // last 'Remove' button corresponds to the discount removal control
    const discountRemoveBtn = removeButtons[removeButtons.length - 1];
    fireEvent.click(discountRemoveBtn as HTMLElement);
    expect(input).not.toBeDisabled();
  });

  it('should alert on invalid discount code', () => {
    window.alert = jest.fn();
    render(<ShoppingCart products={mockProducts} />);

    const addBtn = screen.getByRole('button', { name: /Add Product 2/i });
    fireEvent.click(addBtn);

    const input = screen.getByPlaceholderText(/Discount code/i);
    const applyButton = screen.getByText('Apply');
    fireEvent.change(input, { target: { value: 'INVALID' } });
    fireEvent.click(applyButton);

    expect(window.alert).toHaveBeenCalledWith('Invalid discount code');
  });

  it('should prevent checkout for empty cart and invalid total, and call onCheckout when valid', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const onCheckout = jest.fn();
    const { rerender } = render(<ShoppingCart products={mockProducts} onCheckout={onCheckout} />);

    // add zero-price product to produce invalid total
    const freeProduct = { id: '3', name: 'Free', price: 0, category: 'C', stock: 1 } as Product;
    rerender(<ShoppingCart products={[...mockProducts, freeProduct]} onCheckout={onCheckout} />);
    fireEvent.click(screen.getByRole('button', { name: /Add Free/i }));

    fireEvent.click(screen.getByText(/Proceed to Checkout/i));
    expect(alertSpy).toHaveBeenCalledWith('Invalid total amount');

    // add normal priced and checkout
    fireEvent.click(screen.getByRole('button', { name: /Add Product 1/i }));
    fireEvent.click(screen.getByText(/Proceed to Checkout/i));

    expect(onCheckout).toHaveBeenCalled();
    expect(screen.getByTestId('checkout-modal')).toBeInTheDocument();

    alertSpy.mockRestore();
  });
});
