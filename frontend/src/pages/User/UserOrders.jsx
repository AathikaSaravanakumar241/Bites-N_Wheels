import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { get as apiGet } from '../../api.js'
import { IconArrowLeft, IconTruck, IconLoader, IconChevronRight } from '../../icons.jsx'
import './UserOrders.css'

const LIVE = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY']

const STATUS_LABEL = {
  PENDING:   'Waiting for the truck',
  ACCEPTED:  'Accepted',
  PREPARING: 'Being prepared',
  READY:     'Ready for pickup',
  COMPLETED: 'Completed',
  REJECTED:  'Rejected',
  CANCELLED: 'Cancelled',
}

function formatWhen(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  })
}

export default function UserOrders() {
  const navigate = useNavigate()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    apiGet('/api/v1/orders')
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || 'Could not load your orders.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="uo">
      <div className="uo-bar">
        <div className="uo-bar-inner">
          <Link to="/user" className="uo-back"><IconArrowLeft size={14} /> Keep browsing</Link>
          <h1 className="uo-title">Your orders</h1>
        </div>
      </div>

      <main className="uo-main">
        {loading && (
          <div className="uo-loading">
            <IconLoader size={24} />
            <p>Loading your orders…</p>
          </div>
        )}

        {!loading && error && <p className="uo-error">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="uo-empty-wrap">
            <div className="uo-empty-icon"><IconTruck size={48} /></div>
            <p className="uo-empty">You have not ordered anything yet.</p>
            <Link to="/user" className="uo-cta">Find a truck near you</Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <ul className="uo-list">
            {orders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : []
              const count = items.reduce((sum, i) => sum + (i.quantity ?? 0), 0)
              const live  = LIVE.includes(order.status)

              return (
                <li key={order.orderId} className="uo-card">
                  <div className="uo-card-head">
                    <div>
                      <p className="uo-truck">
                        <IconTruck size={13} />
                        {order.truckName ?? 'Your truck'}
                      </p>
                      <p className="uo-when">{formatWhen(order.createdAt)}</p>
                    </div>
                    <span
                      className={live ? 'uo-status is-live' : 'uo-status'}
                      data-status={order.status}
                    >
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </div>

                  <ul className="uo-items">
                    {items.map((item, index) => (
                      <li key={index} className="uo-item">
                        <span className="uo-item-qty">{item.quantity}×</span>
                        <span className="uo-item-name">{item.name}</span>
                        <span className="uo-item-price">₹{item.priceAtOrder}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="uo-card-foot">
                    <span className="uo-meta">
                      Order #{order.orderId} · {count} item{count === 1 ? '' : 's'}
                    </span>
                    <span className="uo-total">₹{order.totalAmount}</span>
                  </div>

                  {live && (
                    <button
                      type="button"
                      className="uo-track"
                      onClick={() => navigate(`/user/track/${order.orderId}`)}
                    >
                      Track this order
                      <IconChevronRight size={14} />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
