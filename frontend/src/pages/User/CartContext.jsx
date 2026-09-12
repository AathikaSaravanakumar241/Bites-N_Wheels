import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { get, post, patch, del, getToken } from '../../api.js'
const CartContext = createContext(null)
export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside <CartProvider>')
  return value
}
function normalizeCart(data, fallbackTruckId = null) {
  const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
  const truckId = data?.truckId ?? items[0]?.truckId ?? fallbackTruckId ?? null
  return { truckId, items }
}
export function CartProvider({ children }) {
  const [cart, setCart]     = useState({ truckId: null, items: [] })
  const [orders, setOrders] = useState([])
  useEffect(() => {
    if (!getToken()) return          
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
    const orderId = data.orderId    setOrders((list) => [
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
