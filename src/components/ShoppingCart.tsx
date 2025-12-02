import React, { useState, useMemo, useCallback } from 'react';
import { Product, CartItem, DiscountCode } from '@/types';
import { calculateDiscount, calculateTax, formatCurrency } from '@/utils/pricing';

interface ShoppingCartProps {
  products: Product[];
  onCheckout?: (items: CartItem[], total: number) => void;
  taxRate?: number;
  currency?: string;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  products,
  onCheckout,
  taxRate = 0.1,
  currency = 'USD',
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.productId === product.id);
      
      if (existingItem) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
      }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setAppliedDiscount(null);
    setDiscountCode('');
  }, []);

  const applyDiscountCode = useCallback(async () => {
    if (!discountCode.trim()) return;

    const discount = calculateDiscount(discountCode, subtotal);
    
    if (discount) {
      setAppliedDiscount(discount);
    } else {
      setAppliedDiscount(null);
      alert('Invalid discount code');
    }
  }, [discountCode]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    
    if (appliedDiscount.type === 'percentage') {
      return subtotal * (appliedDiscount.value / 100);
    }
    return Math.min(appliedDiscount.value, subtotal);
  }, [appliedDiscount, subtotal]);

  const taxableAmount = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const taxAmount = useMemo(() => {
    return calculateTax(taxableAmount, taxRate);
  }, [taxableAmount, taxRate]);

  const total = useMemo(() => {
    return taxableAmount + taxAmount;
  }, [taxableAmount, taxAmount]);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Cart is empty');
      return;
    }

    if (total < 0.01) {
      alert('Invalid total amount');
      return;
    }

    onCheckout?.(cartItems, total);
    setShowCheckout(true);
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <div className="shopping-cart" data-testid="shopping-cart">
      <h2>Shopping Cart ({getItemCount()} items)</h2>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.productId} className="cart-item" data-testid="cart-item">
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p className="item-price">{formatCurrency(item.price, currency)}</p>
                </div>
                
                <div className="item-controls">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="remove-btn"
                    aria-label="Remove item"
                  >
                    Remove
                  </button>
                </div>

                <div className="item-total">
                  {formatCurrency(item.price * item.quantity, currency)}
                </div>
              </div>
            ))}
          </div>

          <div className="discount-section">
            <input
              type="text"
              placeholder="Discount code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              disabled={!!appliedDiscount}
            />
            <button
              onClick={applyDiscountCode}
              disabled={!!appliedDiscount || !discountCode.trim()}
            >
              Apply
            </button>
            {appliedDiscount && (
              <button onClick={() => {
                setAppliedDiscount(null);
                setDiscountCode('');
              }}>
                Remove
              </button>
            )}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            
            {appliedDiscount && (
              <div className="summary-row discount">
                <span>Discount ({appliedDiscount.code}):</span>
                <span>-{formatCurrency(discountAmount, currency)}</span>
              </div>
            )}
            
            <div className="summary-row">
              <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
              <span>{formatCurrency(taxAmount, currency)}</span>
            </div>
            
            <div className="summary-row total">
              <span>Total:</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>

          <div className="cart-actions">
            <button onClick={clearCart} className="clear-btn">
              Clear Cart
            </button>
            <button onClick={handleCheckout} className="checkout-btn">
              Proceed to Checkout
            </button>
          </div>
        </>
      )}

      {showCheckout && (
        <div className="checkout-modal" data-testid="checkout-modal">
          <h3>Order Confirmed</h3>
          <p>Total: {formatCurrency(total, currency)}</p>
        </div>
      )}
    </div>
  );
};
