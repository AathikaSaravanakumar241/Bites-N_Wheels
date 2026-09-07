import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from './CartContext.jsx'
import './TrackOrder.css'

const STEPS = [
  { id: 'placed',    label: 'Order placed',      desc: 'We sent your order to the truck.' },
  { id: 'accepted',  label: 'Accepted',          desc: 'The truck confirmed your order.' },
  { id: 'preparing', label: 'Being prepared',    desc: 'Your food is being cooked fresh.' },
  { id: 'ready',     label: 'Ready',             desc: 'Packed and waiting for you.' },
  { id: 'collected', label: 'Handed over',       desc: 'Enjoy your food.' },
]

export default function TrackOrder() {
  const { orderId } = useParams()
  const { getOrder, updateOrderStatus } = useCart()

  const order = getOrder(orderId)
  const currentIndex = order ? STEPS.findIndex((s) => s.id === order.status) : -1

  /* DEMO ONLY - advances the status every 8 seconds so the timeline can be
     shown working without a backend. Delete this whole effect once the
     vendor dashboard drives status through /api/orders/{id}/status. */
  useEffect(() => {
    if (!order || currentIndex < 0 || currentIndex >= STEPS.length - 1) return
    const timer = setTimeout(
      () => updateOrderStatus(order.id, STEPS[currentIndex + 1].id),
      8000,
    )
    return () => clearTimeout(timer)
  }, [order, currentIndex, updateOrderStatus])

  if (!order) {
    return (
      <div className="tk">
        <div className="tk-bar">
          <div className="tk-bar-inner">
            <Link to="/user" className="tk-back">← Home</Link>
            <h1 className="tk-title">Track order</h1>
          </div>
        </div>
        <div className="tk-main">
          <p className="tk-empty">We couldn't find order {orderId}.</p>
        </div>
      </div>
    )
  }

  const isDone = order.status === 'collected'
  const itemCount = order.lines.reduce((sum, l) => sum + l.qty, 0)

  return (
    <div className="tk">
      <div className="tk-bar">
        <div className="tk-bar-inner">
          <Link to="/user" className="tk-back">← Home</Link>
          <h1 className="tk-title">Track order</h1>
          <span className="tk-orderid">{order.id}</span>
        </div>
      </div>

      <div className="tk-main">
        <div className="tk-left">
          {/* ---------------- STATUS HEADLINE ---------------- */}
          <section className="tk-panel tk-hero">
            <span className={isDone ? 'tk-pulse is-done' : 'tk-pulse'} aria-hidden="true" />
            <div>
              <h2 className="tk-hero-title">
                {STEPS[currentIndex]?.label ?? 'Order placed'}
              </h2>
              <p className="tk-hero-sub">
                {isDone
                  ? 'This order is complete.'
                  : order.schedule.type === 'later'
                    ? `Scheduled for ${order.schedule.label}`
                    : `Ready in about ${order.schedule.label}`}
              </p>
            </div>
          </section>

          {/* ---------------- TIMELINE ---------------- */}
          <section className="tk-panel">
            <h2 className="tk-panel-title">Progress</h2>
            <ol className="tk-steps">
              {STEPS.map((step, i) => {
                const state =
                  i < currentIndex ? 'is-done' : i === currentIndex ? 'is-current' : 'is-todo'
                return (
                  <li key={step.id} className={`tk-step ${state}`}>
                    <span className="tk-dot" aria-hidden="true" />
                    <div className="tk-step-body">
                      <span className="tk-step-label">{step.label}</span>
                      <span className="tk-step-desc">{step.desc}</span>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>

          {/* ---------------- TRUCK ---------------- */}
          <section className="tk-panel tk-truck">
            <div>
              <h2 className="tk-panel-title">{order.truckName}</h2>
              <p className="tk-truck-tagline">{order.truckTagline}</p>
            </div>
            <a href="tel:+919000000000" className="tk-call">Call truck</a>
          </section>
        </div>

        {/* ---------------- SUMMARY ---------------- */}
        <aside className="tk-panel tk-summary">
          <h2 className="tk-panel-title">
            Order summary
            <span className="tk-count">{itemCount}</span>
          </h2>

          <ul className="tk-lines">
            {order.lines.map((line) => (
              <li key={line.id}>
                <span className="tk-qty">{line.qty}×</span>
                <span className="tk-line-name">{line.name}</span>
                <span className="tk-line-total">₹{line.price * line.qty}</span>
              </li>
            ))}
          </ul>

          <div className="tk-row">
            <span>Item total</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="tk-row">
            <span>Packing charge</span>
            <span>₹{order.packing}</span>
          </div>
          <div className="tk-row tk-row-total">
            <span>{order.payment === 'cod' ? 'Pay on delivery' : 'Paid'}</span>
            <span>₹{order.total}</span>
          </div>

          {order.note && (
            <p className="tk-note"><strong>Your note:</strong> {order.note}</p>
          )}

          <div className="tk-address">
            <span className="tk-address-label">Delivering to</span>
            <span>{order.customer.name} · {order.customer.phone}</span>
            <span className="tk-address-text">{order.customer.address}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}
