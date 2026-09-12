import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { get as apiGet } from '../../api.js'
import { useCart } from './CartContext.jsx'
import './OrderPlaced.css'
export default function OrderPlaced() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { getOrder } = useCart()
  const local = getOrder(orderId)
  const [fetched, setFetched] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    apiGet(`/api/v1/orders/${orderId}`)
      .then((data) => { if (!cancelled) setFetched(data) })
      .catch(() => {  })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [orderId])
  const order = fetched ?? local
  if (loading && !order) {
    return (
      <div className="op">
        <div className="op-card">
          <p className="op-sub">Loading your order…</p>
        </div>
      </div>
    )
  }
  if (!order) {
    return (
      <div className="op">
        <div className="op-card">
          <h1 className="op-title">Order not found</h1>
          <p className="op-sub">We couldn't find order {orderId}.</p>
          <Link to="/user" className="op-secondary">Back to home</Link>
        </div>
      </div>
    )
  }
  const lines = Array.isArray(order.items)
    ? order.items.map((i) => ({ name: i.name, qty: i.quantity, price: i.priceAtOrder }))
    : Array.isArray(order.lines) ? order.lines : []
  const schedule = order.schedule ?? local?.schedule ?? { type: 'now', label: '' }
  const itemCount = lines.reduce((sum, l) => sum + (l.qty ?? 0), 0)
  const truckName = order.truckName ?? local?.truckName ?? 'Your truck'
  const total = order.totalAmount ?? order.total ?? 0
  return (
    <div className="op">
      <div className="op-card">
        <div className="op-tick" aria-hidden="true">
          <svg viewBox="0 0 52 52" width="60" height="60">
            <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="3" />
            <path d="M15 27l8 8 15-16" fill="none" stroke="currentColor"
                  strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="op-title">Order placed</h1>
        <p className="op-sub">
          {truckName} has your order. You'll get a call if anything changes.
        </p>
        <div className="op-id">
          <span>Order ID</span>
          <strong>{order.orderId ?? order.id}</strong>
        </div>
        <dl className="op-facts">
          <div>
            <dt>Truck</dt>
            <dd>{truckName}</dd>
          </div>
          <div>
            <dt>{schedule.type === 'later' ? 'Scheduled for' : 'Ready in'}</dt>
            <dd>{schedule.label}</dd>
          </div>
          <div>
            <dt>Items</dt>
            <dd>{itemCount}</dd>
          </div>
          <div>
            <dt>Payment</dt>
            <dd>{order.payment === 'cod' ? 'Cash on delivery' : 'Online'}</dd>
          </div>
          <div>
            <dt>To pay</dt>
            <dd className="op-total">₹{total}</dd>
          </div>
        </dl>
        {schedule.type === 'later' && (
          <p className="op-pre">
            This is a pre-order. The truck starts cooking closer to your slot,
            so it's fresh when you collect it.
          </p>
        )}
        <button
          type="button"
          className="op-cta"
          onClick={() => navigate(`/user/track/${order.orderId ?? order.id}`)}
        >
          Track order
        </button>
        <Link to="/user" className="op-secondary">Back to home</Link>
      </div>
    </div>
  )
}
