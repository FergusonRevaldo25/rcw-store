export interface CartItem {
  slug: string;
  quantity: number;
}

const CART_KEY = "rcw_store_cart";

function safeGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function loadCart(): CartItem[] {
  const raw = safeGet(CART_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addToCart(slug: string) {
  const cart = loadCart();
  const existing = cart.find((item) => item.slug === slug);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ slug, quantity: 1 });
  }
  safeSet(CART_KEY, JSON.stringify(cart));
  return cart;
}

export function removeFromCart(slug: string) {
  const cart = loadCart().filter((item) => item.slug !== slug);
  safeSet(CART_KEY, JSON.stringify(cart));
  return cart;
}

export function updateQuantity(slug: string, quantity: number) {
  const cart = loadCart();
  const item = cart.find((i) => i.slug === slug);
  if (item) {
    item.quantity = Math.max(1, quantity);
  }
  safeSet(CART_KEY, JSON.stringify(cart));
  return cart;
}

export function clearCart() {
  safeSet(CART_KEY, JSON.stringify([]));
}
