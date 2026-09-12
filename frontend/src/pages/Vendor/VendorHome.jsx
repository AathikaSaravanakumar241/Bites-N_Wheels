import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import VendorLayout from './VendorLayout.jsx'
import { useVendorStatus } from './useVendorStatus.jsx'
import './VendorHome.css'
import { get as apiGet, describeError } from '../../api.js'

const ORDERS_URL = '/api/v1/truck/orders'
const OPEN_STATUSES = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY']

function customerName(order) {
  return order?.customerName || 'Walk-in Customer'
}

function itemSummary(items) {
  if (!Array.isArray(items) || items.length === 0) return 'No items listed'
  return items
    .map((i) => {
      const name = i?.name || i?.itemName || i?.menuItem?.name || 'Item'
      const qty = i?.quantity ?? i?.qty ?? 1
      return `${qty}× ${name}`
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
  const [activeTab, setActiveTab] = useState('ALL')

  const getOrders = useCallback(() => {
    setLoading(true)
    setError('')
    apiGet(ORDERS_URL)
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => setError(describeError(err, 'Unable to load orders.')))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    getOrders()
  }, [getOrders])

  const stats = useMemo(() => {
    const by = (status) => orders.filter((o) => o.status === status).length
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED' && isToday(o.createdAt))
    const revenue = completedOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0)
    return {
      pending: by('PENDING'),
      preparing: by('PREPARING'),
      ready: by('READY'),
      completedCount: completedOrders.length,
      revenue,
    }
  }, [orders])

  const liveOrders = useMemo(
    () =>
      orders
        .filter((o) => OPEN_STATUSES.includes(o.status))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [orders],
  )

  const filteredOrders = useMemo(() => {
    if (activeTab === 'ALL') return liveOrders
    return liveOrders.filter((o) => o.status === activeTab)
  }, [liveOrders, activeTab])

  const truckSub = profile.parkedAt
    ? `${profile.truckName || 'Food Truck'} · ${profile.parkedAt}`
    : (profile.truckName || 'Food Truck')

  return (
    <VendorLayout
      title="Dashboard"
      subtitle={truckSub}
      actions={
        <button type="button" className="vh-refresh" onClick={getOrders} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      }
    >
      {error && <div className="vh-error">{error}</div>}

      {/* ─── SECTION 1: METRICS (MINIMALIST) ─── */}
      <section className="vh-section">
        <div className="vh-section-header">
          <h2 className="vh-section-title">Overview</h2>
          <span className="vh-section-meta">Today</span>
        </div>

        <div className="vh-stats-grid">
          <div className="vh-stat-card">
            <span className="vh-stat-label">Total Revenue</span>
            <span className="vh-stat-value">₹{stats.revenue.toLocaleString('en-IN')}</span>
          </div>

          <div className="vh-stat-card">
            <span className="vh-stat-label">Completed Orders</span>
            <span className="vh-stat-value">{stats.completedCount}</span>
          </div>

          <div className="vh-stat-card">
            <span className="vh-stat-label">Active Tickets</span>
            <span className="vh-stat-value">{liveOrders.length}</span>
          </div>

          <div className="vh-stat-card">
            <span className="vh-stat-label">Status</span>
            <span className="vh-stat-value vh-status-text">{isOpen ? 'Open' : 'Closed'}</span>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: LIVE ORDERS (MINIMALIST) ─── */}
      <section className="vh-section">
        <div className="vh-section-header">
          <div className="vh-section-title-wrap">
            <h2 className="vh-section-title">Live Orders</h2>
            <span className="vh-count-pill">{liveOrders.length}</span>
          </div>

          <div className="vh-pipeline-tabs">
            <button
              type="button"
              className={`vh-tab ${activeTab === 'ALL' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('ALL')}
            >
              All ({liveOrders.length})
            </button>
            <button
              type="button"
              className={`vh-tab ${activeTab === 'PENDING' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('PENDING')}
            >
              Awaiting ({stats.pending})
            </button>
            <button
              type="button"
              className={`vh-tab ${activeTab === 'PREPARING' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('PREPARING')}
            >
              Kitchen ({stats.preparing})
            </button>
            <button
              type="button"
              className={`vh-tab ${activeTab === 'READY' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('READY')}
            >
              Ready ({stats.ready})
            </button>
          </div>
        </div>

        <div className="vh-orders-container">
          {loading ? (
            <div className="vh-loading-wrap">
              <p className="vh-muted">Loading orders…</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="vh-empty-state">
              <h3 className="vh-empty-title">
                {activeTab === 'ALL' ? 'No active orders' : `No orders in ${activeTab.toLowerCase()}`}
              </h3>
              <p className="vh-empty-desc">New orders will appear here automatically.</p>
              <Link to="/vendor/orders" className="vh-empty-cta">
                View All Orders
              </Link>
            </div>
          ) : (
            <div className="vh-orders-grid">
              {filteredOrders.map((order) => (
                <div key={order.orderId} className="vh-order-card">
                  <div className="vh-order-card-head">
                    <span className="vh-order-id">#{order.orderId}</span>
                    <span className="vh-order-customer">{customerName(order)}</span>
                    <span className="vh-order-status">{order.status}</span>
                  </div>

                  <div className="vh-order-card-body">
                    <p className="vh-order-items-text">{itemSummary(order.items)}</p>
                  </div>

                  <div className="vh-order-card-foot">
                    <span className="vh-order-total">₹{order.totalAmount ?? 0}</span>
                    <Link to="/vendor/orders" className="vh-order-action-btn">
                      Manage →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── SECTION 3: TRUCK DETAILS ─── */}
      <section className="vh-section">
        <div className="vh-section-header">
          <h2 className="vh-section-title">Truck Details</h2>
          <Link to="/vendor/profile" className="vh-card-action-link">
            Edit Details →
          </Link>
        </div>

        <div className="vh-ops-card">
          <dl className="vh-facts">
            <div className="vh-fact-row">
              <dt>Status</dt>
              <dd>{isOpen ? 'Taking Orders' : 'Closed'}</dd>
            </div>
            <div className="vh-fact-row">
              <dt>Operating Hours</dt>
              <dd>{profile.opensAt || '10:00'} – {profile.closesAt || '22:00'}</dd>
            </div>
            <div className="vh-fact-row">
              <dt>Cuisine</dt>
              <dd>{profile.cuisine || 'Street Food'}</dd>
            </div>
            <div className="vh-fact-row">
              <dt>Spice Level</dt>
              <dd>{profile.spice || 'Medium'}</dd>
            </div>
          </dl>
        </div>
      </section>
    </VendorLayout>
  )
}
