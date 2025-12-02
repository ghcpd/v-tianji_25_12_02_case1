import React from 'react';
import { render, screen, act, fireEvent, waitFor, within } from '@testing-library/react';
import { ShoppingCart } from '../ShoppingCart';
import { Product } from '@/types';

const mockProducts: Product[] = [
  { id: '1', name: 'Product 1', price: 10, category: 'A', stock: 100 },
  { id: '2', name: 'Product 2', price: 20, category: 'B', stock: 50 },
];

describe('ShoppingCart', () => {
  const alerts: string[] = [];
  const originalAlert = window.alert;

  beforeAll(() => {
    jest.useFakeTimers();
    window.alert = (msg?: any) => {
      alerts.push(String(msg));
    };
  });

  afterEach(() => {
    alerts.length = 0;
    jest.clearAllMocks();
  });

  afterAll(() => {
    window.alert = originalAlert;
    jest.useRealTimers();
  });

  it('renders empty cart state', () => {
    render(<ShoppingCart products={mockProducts} />);
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/0 items/i)).toBeInTheDocument();
  });

  it('adds items and increments quantity', async () => {
    let api: any;
    render(<ShoppingCart products={mockProducts} exposeApi={(a) => (api = a)} />);

    act(() => {
      api.addToCart(mockProducts[0], 2);
    });

    expect(await screen.findByText(/2 items/i)).toBeInTheDocument();
    let cartItem = screen.getAllByTestId('cart-item')[0];
    expect(within(cartItem).getByText('$20.00')).toBeInTheDocument();

    act(() => {
      api.addToCart(mockProducts[0], 1);
    });

    expect(await screen.findByText(/3 items/i)).toBeInTheDocument();
    cartItem = screen.getAllByTestId('cart-item')[0];
    expect(within(cartItem).getByText('$30.00')).toBeInTheDocument();
    expect(screen.getAllByText('$30.00').length).toBeGreaterThan(0);
  });

  it('updates quantity and removes when zero or less', async () => {
    let api: any;
    render(
      <ShoppingCart
        products={mockProducts}
        initialItems={[{ productId: '1', name: 'Product 1', price: 10, quantity: 2 }]}
        exposeApi={(a) => (api = a)}
      />
    );

    expect(await screen.findByText(/2 items/i)).toBeInTheDocument();

    act(() => api.updateQuantity('1', 5));
    expect(await screen.findByText(/5 items/i)).toBeInTheDocument();

    // decrement via UI button
    fireEvent.click(screen.getByLabelText('Decrease quantity'));
    expect(await screen.findByText(/4 items/i)).toBeInTheDocument();

    act(() => api.updateQuantity('1', 0));
    await waitFor(() => expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument());
  });

  it('removes items explicitly', async () => {
    render(
      <ShoppingCart
        products={mockProducts}
        initialItems={[{ productId: '1', name: 'Product 1', price: 10, quantity: 1 }]}
      />
    );

    expect(await screen.findByText(/1 items/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Remove item'));
    await waitFor(() => expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument());
  });

  it('applies and removes discount codes', async () => {
    let api: any;
    render(
      <ShoppingCart
        products={mockProducts}
        initialItems={[{ productId: '1', name: 'Product 1', price: 100, quantity: 1 }]}
        exposeApi={(a) => (api = a)}
      />
    );

    act(() => api.setDiscountCode('SAVE10'));
    fireEvent.click(screen.getByText(/Apply/i));

    expect(await screen.findByText(/Discount \(SAVE10\)/i)).toBeInTheDocument();
    expect(screen.getByText(/-\$10.00/)).toBeInTheDocument();

    // remove discount
    const discountRemoveBtn = screen.getAllByText(/Remove/i).find((btn) => !(btn as HTMLElement).hasAttribute('aria-label'));
    if (!discountRemoveBtn) throw new Error('Discount remove button not found');
    fireEvent.click(discountRemoveBtn);
    await waitFor(() => expect(screen.queryByText(/Discount \(SAVE10\)/i)).not.toBeInTheDocument());
  });

  it('alerts on invalid discount code', async () => {
    render(
      <ShoppingCart
        products={mockProducts}
        initialItems={[{ productId: '1', name: 'Product 1', price: 100, quantity: 1 }]}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/Discount code/i), { target: { value: 'BAD' } });
    fireEvent.click(screen.getByText(/Apply/i));

    await waitFor(() => expect(alerts).toContain('Invalid discount code'));
  });

  it('computes tax and total correctly', async () => {
    render(
      <ShoppingCart
        products={mockProducts}
        initialItems={[{ productId: '1', name: 'Product 1', price: 50, quantity: 2 }]}
        taxRate={0.2}
      />
    );

    const subtotalRow = screen.getByText(/Subtotal:/).closest('.summary-row') as HTMLElement;
    const taxRow = screen.getByText(/Tax \(20\.0%\)/).closest('.summary-row') as HTMLElement;
    const totalRow = screen.getByText(/Total:/).closest('.summary-row') as HTMLElement;
    expect(subtotalRow).toBeInTheDocument();
    expect(within(subtotalRow).getByText('$100.00')).toBeInTheDocument();
    expect(within(taxRow).getByText('$20.00')).toBeInTheDocument();
    expect(within(totalRow).getByText('$120.00')).toBeInTheDocument();
  });

  it('supports alternate currencies', async () => {
    render(
      <ShoppingCart
        products={mockProducts}
        initialItems={[{ productId: '2', name: 'Product 2', price: 20, quantity: 1 }]}
        currency="EUR"
      />
    );

    expect(screen.getAllByText(/€20\.00/).length).toBeGreaterThan(0);
  });

  it('handles checkout flows (empty, invalid, valid)', async () => {
    // empty
    let emptyApi: any;
    const { unmount: unmountEmpty } = render(<ShoppingCart products={mockProducts} exposeApi={(a) => (emptyApi = a)} />);
    act(() => emptyApi.handleCheckout());
    await waitFor(() => expect(alerts).toContain('Cart is empty'));
    unmountEmpty();
    alerts.length = 0;

    // invalid total (<0.01)
    const lowPriceProduct: Product = { id: '3', name: 'Tiny', price: 0, category: 'C', stock: 1 };
    let api: any;
    const { unmount: unmountLow } = render(<ShoppingCart products={[lowPriceProduct]} exposeApi={(a) => (api = a)} />);
    act(() => api.addToCart(lowPriceProduct, 1));
    fireEvent.click(screen.getByText(/Proceed to Checkout/i));
    await waitFor(() => expect(alerts).toContain('Invalid total amount'));
    unmountLow();
    alerts.length = 0;

    // valid checkout
    const onCheckout = jest.fn();
    const { getByText } = render(
      <ShoppingCart
        products={mockProducts}
        initialItems={[{ productId: '1', name: 'Product 1', price: 10, quantity: 1 }]}
        onCheckout={onCheckout}
      />
    );

    fireEvent.click(getByText(/Proceed to Checkout/i));
    await waitFor(() => expect(onCheckout).toHaveBeenCalledWith(expect.any(Array), expect.any(Number)));
    expect(screen.getByTestId('checkout-modal')).toBeInTheDocument();
  });

  it('clears cart and discount state', async () => {
    let api: any;
    render(
      <ShoppingCart
        products={mockProducts}
        initialItems={[{ productId: '1', name: 'Product 1', price: 10, quantity: 1 }]}
        exposeApi={(a) => (api = a)}
      />
    );

    act(() => api.setDiscountCode('SAVE10'));
    fireEvent.click(screen.getByText(/Apply/i));
    await screen.findByText(/Discount \(SAVE10\)/i);

    fireEvent.click(screen.getByText(/Clear Cart/i));

    await waitFor(() => expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument());

    // re-add item to inspect discount input state
    act(() => api.addToCart(mockProducts[0], 1));
    await screen.findByText(/1 items/i);
    expect((screen.getByPlaceholderText(/Discount code/i) as HTMLInputElement).value).toBe('');
  });
});
