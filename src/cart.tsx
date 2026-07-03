import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type React from 'react';
import type { Product } from './data';

export type CartItem = Product & { quantity: number; size?: string };

type CartState = { items: CartItem[] };

type CartAction =
  | { type: 'add'; product: Product; size?: string }
  | { type: 'remove'; id: string }
  | { type: 'decrement'; id: string }
  | { type: 'clear' };

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, size?: string) => void;
  removeItem: (id: string) => void;
  decrementItem: (id: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'vogue_cart_v2';

function reducer(state: CartState, action: CartAction): CartState {
  if (action.type === 'clear') return { items: [] };
  if (action.type === 'remove') return { items: state.items.filter((item) => item.id !== action.id) };
  if (action.type === 'decrement') {
    return {
      items: state.items
        .map((item) => (item.id === action.id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    };
  }
  const existing = state.items.find((item) => item.id === action.product.id);
  if (existing) {
    return {
      items: state.items.map((item) =>
        item.id === action.product.id ? { ...item, quantity: item.quantity + 1, size: action.size ?? item.size } : item,
      ),
    };
  }
  return { items: [...state.items, { ...action.product, quantity: 1, size: action.size }] };
}

function readInitialCart(): CartState {
  if (typeof window === 'undefined') return { items: [] };
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { items: JSON.parse(stored) as CartItem[] } : { items: [] };
  } catch {
    return { items: [] };
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, readInitialCart);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

    return {
      items: state.items,
      addItem: (product, size) => dispatch({ type: 'add', product, size }),
      removeItem: (id) => dispatch({ type: 'remove', id }),
      decrementItem: (id) => dispatch({ type: 'decrement', id }),
      clearCart: () => dispatch({ type: 'clear' }),
      itemCount,
      subtotal,
    };
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used within CartProvider');
  return value;
}
