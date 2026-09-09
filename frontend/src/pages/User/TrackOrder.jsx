import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { get } from '../../api.js'
import './TrackOrder.css'

const STEPS = [
  { id: 'PENDING',    label: 'Order placed',   desc: 'We sent your order to the truck.' },
  { id: 'ACCEPTED',   label: 'Accepted',        desc: 'The truck confirmed your order.' },
  { id: 'PREPARING',  label: 'Being prepared',  desc: 'Your food is being cooked fresh.' },
  { id: 'READY',      label: 'Ready',           desc: 'Packed and waiting for you.' },
  { id: 'COMPLETED',  label: 'Handed over',     desc: 'Enjoy your food.' },
]

const POLL_MS = 5000

export default function TrackOrder() {
  const { orderId } = useParams()
  const [order, setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    let active = true

    function fetchOrder() {
      get(`/api/v1/orders/${orderId}`)
        .then((data) => {
          if (!active) return
          setOrder(data)
          setError('')
        })
        .catch((err) => {
          if (!active) return
          setError(err.message || 'Could not load order.')
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }

    fetchOrder()

    const interval = setInterval(() => {
      if (order?.status === 'COMPLETED') return
      fetchOrder()
    }, POLL_MS)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [orderId, order?.status])

  if (loading) {
    return (
      <div className="tk">
        <div className="tk-bar">
          <div className="tk-bar-inner">
            <Link to="/user" className="tk-back">← Home</Link>
            <h1 className="tk-title">Track order</h1>
          </div>
        </div>
        <div className="tk-main"><p className="tk-empty">Loading order…</p></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="tk">
        <div className="tk-bar">
          <div className="tk-bar-inner">
            <Link to="/user" className="tk-back">← Home</Link>
            <h1 className="tk-title">Track order</h1>
          </div>
        </div>
        <div className="tk-main">
          <p className="tk-empty">{error || `We couldn't find order ${orderId}.`}</p>
        </div>
      </div>
    )
  }

  const currentIndex = STEPS.findIndex((s) => s.id === order.status)
  const isDone = order.status === 'COMPLETED'
  const itemCount = Array.isArray(order.items) ? order.items.reduce((s, i) => s + (i.quantity ?? 1), 0) : 0

  return (
    <div className="tk">
      <div className="tk-bar">
        <div className="tk-bar-inner">
          <Link to="/user" className="tk-back">← Home</Link>
          <h1 className="tk-title">Track order</h1>
          <span className="tk-orderid">#{order.orderId}</span>
        </div>
      </div>

      <div className="tk-main">
        <div className="tk-left">
          <section className="tk-panel tk-hero">
            <span className={isDone ? 'tk-pulse is-done' : 'tk-pulse'} aria-hidden="true" />
            <div>
              <h2 className="tk-hero-title">
                {STEPS[currentIndex]?.label ?? 'Order placed'}
              </h2>
              <p className="tk-hero-sub">
                {isDone ? 'This order is complete.' : 'Your order is being processed.'}
              </p>
            </div>
          </section>

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

          <section className="tk-panel tk-truck">
            <div>
              <h2 className="tk-panel-title">{order.truckName}</h2>
            </div>
          </section>
        </div>

        <aside className="tk-panel tk-summary">
          <h2 className="tk-panel-title">
            Order summary
            <span className="tk-count">{itemCount}</span>
          </h2>

          <ul className="tk-lines">
            {Array.isArray(order.items) && order.items.map((item, idx) => (
              <li key={idx}>
                <span className="tk-qty">{item.quantity}×</span>
                <span className="tk-line-name">{item.name}</span>
                <span className="tk-line-total">₹{Number(item.priceAtOrder) * item.quantity}</span>
              </li>
            ))}
          </ul>

          <div className="tk-row tk-row-total">
            <span>Total</span>
            <span>₹{Number(order.totalAmount)}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}
