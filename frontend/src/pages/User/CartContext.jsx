import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { get, post, patch, del, getToken } from '../../api.js'

const CartContext = createContext(null)

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside <CartProvider>')
  return value
}

/* The two cart endpoints disagree in shape, and neither matches what this
   context assumed:

     GET  /api/v1/cart        -> { items: CartItem[], total }
     POST /api/v1/cart/items  -> CartItem[]            (a bare array)

   and a CartItem is { foodId, truckId, name, quantity, price }. There is no
   top-level truckId - it sits on each line. Reading `data.truckId` therefore
   always produced null, `truck` stayed null, and the cart page said "there's
   nothing to check out" even with items in it. The line id is `foodId`, not
   `itemId`. Normalising both shapes here keeps that in one place. */
function normalizeCart(data, fallbackTruckId = null) {
  const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
  const truckId = data?.truckId ?? items[0]?.truckId ?? fallbackTruckId ?? null
  return { truckId, items }
}

export function CartProvider({ children }) {
  const [cart, setCart]     = useState({ truckId: null, items: [] })
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (!getToken()) return          // not logged in — skip to avoid 403
    get('/api/v1/cart')
      .then((data) => setCart(normalizeCart(data)))
      .catch(() => {})
  }, [])

  const lines = useMemo(() => {
    if (!Array.isArray(cart.items)) return []
    return cart.items.map((i) => ({
      id:    i.foodId ?? i.itemId ?? i.id,
      name:  i.name  ?? i.itemName ?? 'Item',
      price: Number(i.price ?? i.priceAtOrder ?? 0),
      qty:   i.quantity ?? i.qty ?? 1,
      veg:   i.veg ?? false,
    }))
  }, [cart.items])

  const truck = useMemo(() => {
    if (!cart.truckId) return null
    return { id: cart.truckId, name: cart.truckName ?? '', etaMin: cart.etaMin ?? 0 }
  }, [cart.truckId, cart.truckName, cart.etaMin])

  const count    = lines.reduce((s, l) => s + l.qty, 0)
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)

  const addItem = useCallback(async (truckId, itemId) => {
    if (cart.truckId !== null && cart.truckId !== truckId && lines.length > 0) {
      return { conflict: true, currentTruck: truck }
    }
    try {
      const updated = await post('/api/v1/cart/items', { foodId: itemId, quantity: 1 })
      setCart(normalizeCart(updated, truckId))
    } catch (err) {
      console.error('addItem failed', err)
    }
    return { conflict: false }
  }, [cart.truckId, lines.length, truck])

  const startNewCart = useCallback(async (truckId, itemId) => {
    try {
      const updated = await post('/api/v1/cart/items', { foodId: itemId, quantity: 1 })
      setCart(normalizeCart(updated, truckId))
    } catch (err) {
      console.error('startNewCart failed', err)
    }
  }, [])

  const removeItem = useCallback(async (itemId) => {
    const line = lines.find((l) => l.id === itemId)
    if (!line) return
    try {
      let updated
      if (line.qty > 1) {
        updated = await patch(`/api/v1/cart/items/${itemId}`, { quantity: line.qty - 1 })
      } else {
        updated = await del(`/api/v1/cart/items/${itemId}`)
      }
      setCart((c) => normalizeCart(updated ?? [], c.truckId))
    } catch (err) {
      console.error('removeItem failed', err)
    }
  }, [lines])

  const removeLine = useCallback(async (itemId) => {
    try {
      const updated = await del(`/api/v1/cart/items/${itemId}`)
      setCart((c) => normalizeCart(updated ?? [], c.truckId))
    } catch (err) {
      console.error('removeLine failed', err)
    }
  }, [])

  const clearCart = useCallback(() => {
    setCart({ truckId: null, items: [] })
  }, [])

  const qtyOf = useCallback((itemId) => {
    const line = lines.find((l) => l.id === itemId)
    return line ? line.qty : 0
  }, [lines])

  const placeOrder = useCallback(async ({ schedule, payment, note }) => {
    const data = await post('/api/v1/orders', {
      truckId:     cart.truckId,
      scheduleType: schedule?.type ?? 'now',
      scheduledAt:  schedule?.at   ?? null,
      paymentMethod: payment,
      note,
    })
    const orderId = data.orderId
    // OrderPlaced reads order.schedule.type/.label and order.truckName. The API
    // response carries neither, so without keeping them here the confirmation
    // page throws on an undefined `schedule` and renders a blank screen.
    setOrders((list) => [
      {
        ...data,
        lines,
        schedule: schedule ?? { type: 'now', at: null, label: '' },
        truckName: data.truckName ?? cart.truckName ?? 'Your truck',
      },
      ...list,
    ])
    clearCart()
    return orderId
  }, [cart.truckId, cart.truckName, lines, clearCart])

  const getOrder = useCallback((id) => {
    return orders.find((o) => String(o.orderId) === String(id) || String(o.id) === String(id)) || null
  }, [orders])

  const updateOrderStatus = useCallback((id, status) => {
    setOrders((list) =>
      list.map((o) => (String(o.orderId) === String(id) || String(o.id) === String(id)) ? { ...o, status } : o)
    )
  }, [])

  const value = {
    cart, truck, lines, count, subtotal,
    addItem, startNewCart, removeItem, removeLine, clearCart, qtyOf,
    orders, placeOrder, getOrder, updateOrderStatus,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
