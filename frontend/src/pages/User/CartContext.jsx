import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { TRUCKS } from '../../data/trucks.jsx'

/* ---------------------------------------------------------------
   CART + ORDERS

   ONE ORDER = ONE TRUCK. Each truck cooks and hands over its own
   food from its own location, so a cart is always tied to a single
   truckId. Adding an item from a different truck is a conflict the
   UI must resolve by asking the customer.

   State is mirrored into localStorage so a refresh doesn't lose the
   cart. Swap both storage helpers for API calls when the backend
   has /api/cart and /api/orders.
   --------------------------------------------------------------- */

const CART_KEY = 'bnw_cart'
const ORDERS_KEY = 'bnw_orders'

const EMPTY_CART = { truckId: null, items: {} }

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback // private mode, cleared storage, blocked cookies
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable - the app still works, it just won't persist */
  }
}

const CartContext = createContext(null)

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside <CartProvider>')
  return value
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => load(CART_KEY, EMPTY_CART))
  const [orders, setOrders] = useState(() => load(ORDERS_KEY, []))

  useEffect(() => save(CART_KEY, cart), [cart])
  useEffect(() => save(ORDERS_KEY, orders), [orders])

  const truck = useMemo(
    () => TRUCKS.find((t) => t.id === cart.truckId) || null,
    [cart.truckId],
  )

  // Resolve stored ids into full item objects for rendering.
  const lines = useMemo(() => {
    if (!truck) return []
    return Object.entries(cart.items)
      .map(([itemId, qty]) => {
        const item = truck.items.find((i) => String(i.id) === String(itemId))
        return item ? { ...item, qty } : null
      })
      .filter(Boolean)
  }, [truck, cart.items])

  const count = lines.reduce((sum, l) => sum + l.qty, 0)
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0)

  /**
   * Add one unit of an item.
   * Returns { conflict: true, currentTruck } when the item belongs to a
   * different truck than the current cart - the caller decides whether
   * to discard the old cart via startNewCart().
   */
  const addItem = useCallback(
    (truckId, itemId) => {
      let result = { conflict: false }
      setCart((c) => {
        if (c.truckId !== null && c.truckId !== truckId && Object.keys(c.items).length > 0) {
          result = {
            conflict: true,
            currentTruck: TRUCKS.find((t) => t.id === c.truckId) || null,
          }
          return c
        }
        return {
          truckId,
          items: { ...c.items, [itemId]: (c.items[itemId] || 0) + 1 },
        }
      })
      return result
    },
    [],
  )

  /** Throw away the current cart and start fresh with this item. */
  const startNewCart = useCallback((truckId, itemId) => {
    setCart({ truckId, items: { [itemId]: 1 } })
  }, [])

  const removeItem = useCallback((itemId) => {
    setCart((c) => {
      const items = { ...c.items }
      if (items[itemId] > 1) items[itemId] -= 1
      else delete items[itemId]
      return Object.keys(items).length === 0 ? EMPTY_CART : { ...c, items }
    })
  }, [])

  const removeLine = useCallback((itemId) => {
    setCart((c) => {
      const items = { ...c.items }
      delete items[itemId]
      return Object.keys(items).length === 0 ? EMPTY_CART : { ...c, items }
    })
  }, [])

  const clearCart = useCallback(() => setCart(EMPTY_CART), [])

  const qtyOf = useCallback((itemId) => cart.items[itemId] || 0, [cart.items])

  /** Freeze the cart into an order and empty it. Returns the new order id. */
  const placeOrder = useCallback(
    ({ customer, schedule, payment, note }) => {
      const id = `BW-${Math.floor(1000 + Math.random() * 9000)}`
      const packing = lines.length ? 20 : 0
      const order = {
        id,
        truckId: truck?.id ?? null,
        truckName: truck?.name ?? '',
        truckTagline: truck?.tagline ?? '',
        etaMin: truck?.etaMin ?? 0,
        lines: lines.map(({ id: itemId, name, price, qty, veg }) => ({
          id: itemId, name, price, qty, veg,
        })),
        subtotal,
        packing,
        total: subtotal + packing,
        customer,
        schedule,
        payment,
        note,
        placedAt: new Date().toISOString(),
        status: 'placed',
      }
      setOrders((list) => [order, ...list])
      setCart(EMPTY_CART)
      return id
    },
    [lines, subtotal, truck],
  )

  const getOrder = useCallback((id) => orders.find((o) => o.id === id) || null, [orders])

  const updateOrderStatus = useCallback((id, status) => {
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)))
  }, [])

  const value = {
    cart, truck, lines, count, subtotal,
    addItem, startNewCart, removeItem, removeLine, clearCart, qtyOf,
    orders, placeOrder, getOrder, updateOrderStatus,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
