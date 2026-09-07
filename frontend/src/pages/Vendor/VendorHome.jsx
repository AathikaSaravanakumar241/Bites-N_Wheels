import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import VendorLayout from './VendorLayout.jsx'
import { useVendorStatus } from './useVendorStatus.jsx'
import './VendorHome.css'

/* Relative path so Vite's dev proxy forwards to Spring on :8080 and
   the same build works in production. See vite.config.js. */
const ORDERS_URL = '/api/orders'

/** Backend statuses, in the order an order moves through them. */
const OPEN_STATUSES = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY']

/** Orders API shape is inconsistent about user - handle both. */
function customerName(user) {
  if (!user) return 'Guest'
  if (typeof user === 'string') return user
  return user.name || user.username || user.email || 'Guest'
}

function itemSummary(items) {
  if (!Array.isArray(items) || items.length === 0) return 'No items listed'
  return items
    .map((i) => {
      const name = i?.name || i?.itemName || i?.menuItem?.name || 'Item'
      const qty = i?.quantity ?? i?.qty ?? 1
      return `${qty}x ${name}`
    })
    .join(', ')
}

function isToday(value) {
  if (!value) return false
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return false
  const now = new Date()
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
}

export default function VendorHome() {
  const { profile, isOpen } = useVendorStatus()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getOrders = useCallback(() => {
    setLoading(true)
    setError('')

    fetch(ORDERS_URL)
      .then((response) => {
        if (!response.ok) {
          const err = new Error(`Request failed with ${response.status}`)
          err.status = response.status
          throw err
        }
        return response.json()
      })
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err)
        // 401/403 means the backend answered but Spring Security refused,
        // which is a very different fix from the server being down.
        if (err.status === 401 || err.status === 403) {
          setError(
            `Backend refused the request (${err.status}). /api/orders is behind Spring Security — ` +
              'it needs a logged-in vendor token, or the endpoint must be permitted.',
          )
        } else {
          setError('Unable to load orders. Check that the backend is running on port 8080.')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    getOrders()
  }, [getOrders])

  const stats = useMemo(() => {
    const by = (status) => orders.filter((o) => o.status === status).length
    const revenue = orders
      .filter((o) => o.status === 'COMPLETED' && isToday(o.createdAt))
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0)

    return {
      pending: by('PENDING'),
      preparing: by('PREPARING'),
      ready: by('READY'),
      revenue,
    }
  }, [orders])

  // Newest first, only orders still in play.
  const liveOrders = useMemo(
    () =>
      orders
        .filter((o) => OPEN_STATUSES.includes(o.status))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5),
    [orders],
  )

  return (
    <VendorLayout
      title="Dashboard"
      subtitle={`${profile.truckName} · parked at ${profile.parkedAt}`}
      actions={
        <button type="button" className="vh-refresh" onClick={getOrders} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      }
    >
      {error && <div className="vh-error">{error}</div>}

      {/* ---------------- STATS ---------------- */}
      <section className="vh-stats">
        <div className="vh-stat">
          <span className="vh-stat-label">Awaiting accept</span>
          <span className={stats.pending > 0 ? 'vh-stat-value is-alert' : 'vh-stat-value'}>
            {stats.pending}
          </span>
        </div>
        <div className="vh-stat">
          <span className="vh-stat-label">Preparing</span>
          <span className="vh-stat-value">{stats.preparing}</span>
        </div>
        <div className="vh-stat">
          <span className="vh-stat-label">Ready for pickup</span>
          <span className="vh-stat-value">{stats.ready}</span>
        </div>
        <div className="vh-stat">
          <span className="vh-stat-label">Completed today</span>
          <span className="vh-stat-value">₹{stats.revenue}</span>
        </div>
      </section>

      <div className="vh-grid">
        {/* ---------------- LIVE QUEUE ---------------- */}
        <section className="vh-panel">
          <div className="vh-panel-head">
            <h2 className="vh-panel-title">Live orders</h2>
            <Link to="/vendor/orders" className="vh-link">Manage all →</Link>
          </div>

          {loading ? (
            <p className="vh-muted">Loading orders…</p>
          ) : liveOrders.length === 0 ? (
            <p className="vh-empty">
              {error
                ? 'Orders could not be loaded.'
                : 'No open orders right now.'}
            </p>
          ) : (
            <ul className="vh-orders">
              {liveOrders.map((order) => (
                <li key={order.orderId} className="vh-order">
                  <div className="vh-order-main">
                    <span className="vh-order-id">#{order.orderId}</span>
                    <span className="vh-order-customer">{customerName(order.user)}</span>
                    <span className="vh-order-items">{itemSummary(order.items)}</span>
                  </div>
                  <div className="vh-order-side">
                    <span className={`vh-pill is-${String(order.status).toLowerCase()}`}>
                      {order.status}
                    </span>
                    <span className="vh-order-total">₹{order.totalAmount ?? 0}</span>
                    {order.scheduleType === 'SCHEDULED' && order.scheduledTime && (
                      <span className="vh-pre">Pre-order</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ---------------- SIDE ---------------- */}
        <aside className="vh-side">
          <section className="vh-panel">
            <h2 className="vh-panel-title">Today</h2>
            <dl className="vh-facts">
              <div>
                <dt>Status</dt>
                <dd className={isOpen ? 'vh-open' : 'vh-closed'}>
                  {isOpen ? 'Taking orders' : 'Closed'}
                </dd>
              </div>
              <div>
                <dt>Hours</dt>
                <dd>{profile.opensAt} – {profile.closesAt}</dd>
              </div>
              <div>
                <dt>Cuisine</dt>
                <dd>{profile.cuisine}</dd>
              </div>
              <div>
                <dt>Spice</dt>
                <dd>{profile.spice}</dd>
              </div>
            </dl>
            <Link to="/vendor/profile" className="vh-link">Edit profile →</Link>
          </section>

          <section className="vh-panel">
            <h2 className="vh-panel-title">Quick actions</h2>
            <div className="vh-quick">
              <Link to="/vendor/orders" className="vh-quick-btn">Order queue</Link>
              <Link to="/vendor/menu" className="vh-quick-btn">Edit menu</Link>
              <Link to="/vendor/billing" className="vh-quick-btn">Walk-in bill</Link>
            </div>
          </section>
        </aside>
      </div>
    </VendorLayout>
  )
}
