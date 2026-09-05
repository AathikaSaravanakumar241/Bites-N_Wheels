import { useMemo, useState } from 'react'
import logo from '../../assets/logo.jpeg'
import './VendorHome.css'

/* ---------------------------------------------------------------
   MOCK DATA - replace each with a fetch to /api/... later.
   --------------------------------------------------------------- */

const INITIAL_ORDERS = [
  { id: 'BW-1041', customer: 'Anitha R', items: ['2x Chicken Roll', '1x Cold Coffee'], total: 320, placedAt: '7:42 PM', type: 'preorder', pickupAt: '8:15 PM', status: 'new' },
  { id: 'BW-1040', customer: 'Vikram S', items: ['1x Paneer Tikka Roll'],              total: 180, placedAt: '7:38 PM', type: 'now',      pickupAt: null,     status: 'new' },
  { id: 'BW-1039', customer: 'Meera K',  items: ['3x Veg Momos', '2x Masala Chai'],    total: 260, placedAt: '7:31 PM', type: 'now',      pickupAt: null,     status: 'preparing' },
  { id: 'BW-1038', customer: 'Rahul D',  items: ['1x Chicken Biryani'],                total: 240, placedAt: '7:24 PM', type: 'preorder', pickupAt: '7:55 PM', status: 'preparing' },
  { id: 'BW-1037', customer: 'Priya N',  items: ['2x Waffle Stack'],                   total: 300, placedAt: '7:15 PM', type: 'now',      pickupAt: null,     status: 'ready' },
]

const INITIAL_MENU = [
  { id: 1, name: 'Chicken Roll',      price: 140, available: true },
  { id: 2, name: 'Paneer Tikka Roll', price: 180, available: true },
  { id: 3, name: 'Veg Momos',         price: 90,  available: true },
  { id: 4, name: 'Chicken Biryani',   price: 240, available: false },
  { id: 5, name: 'Cold Coffee',       price: 80,  available: true },
  { id: 6, name: 'Waffle Stack',      price: 150, available: true },
]

const CUISINES = ['South Indian', 'North Indian', 'Chinese', 'Italian', 'Mexican']
const SPICE_LEVELS = ['Mild', 'Medium', 'Spicy']

const TABS = [
  { id: 'new',       label: 'New' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'ready',     label: 'Ready' },
]

export default function VendorHome() {
  const [isOpen, setIsOpen] = useState(true)
  const [parkedAt, setParkedAt] = useState('IIT Madras Gate, Guindy')
  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const [menu, setMenu] = useState(INITIAL_MENU)
  const [tab, setTab] = useState('new')

  // These four fields are what the customer-side filters match on.
  const [tagline, setTagline] = useState('Street-style rolls and momos, made to order')
  const [cuisine, setCuisine] = useState('North Indian')
  const [spice, setSpice] = useState('Medium')
  const [vegOnly, setVegOnly] = useState(false)

  function advance(orderId, nextStatus) {
    setOrders((current) =>
      nextStatus === 'done'
        ? current.filter((o) => o.id !== orderId)
        : current.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
    )
  }

  function rejectOrder(orderId) {
    setOrders((current) => current.filter((o) => o.id !== orderId))
  }

  function toggleItem(itemId) {
    setMenu((current) =>
      current.map((m) => (m.id === itemId ? { ...m, available: !m.available } : m)),
    )
  }

  const counts = useMemo(
    () => ({
      new: orders.filter((o) => o.status === 'new').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      ready: orders.filter((o) => o.status === 'ready').length,
    }),
    [orders],
  )

  const revenue = useMemo(
    () => orders.reduce((sum, o) => sum + o.total, 0),
    [orders],
  )

  const visibleOrders = orders.filter((o) => o.status === tab)
  const soldOut = menu.filter((m) => !m.available).length

  return (
    <div className="vh">
      {/* ---------------- HEADER ---------------- */}
      <header className="vh-header">
        <div className="vh-header-inner">
          <div className="vh-brand">
            <img src={logo} alt="" className="vh-logo" />
            <div>
              <div className="vh-brand-name">
                Bites N Wheels <span className="vh-role">Vendor</span>
              </div>
              <div className="vh-truck-name">Roll Rickshaw</div>
            </div>
          </div>

          <button
            type="button"
            className="vh-parked"
            onClick={() => {
              const next = window.prompt('Where is your truck parked today?', parkedAt)
              if (next) setParkedAt(next)
            }}
          >
            <span aria-hidden="true">📍</span>
            <span className="vh-parked-text">{parkedAt}</span>
            <span className="vh-caret" aria-hidden="true">▾</span>
          </button>

          <div className="vh-actions">
            <button
              type="button"
              className={isOpen ? 'vh-status is-open' : 'vh-status'}
              onClick={() => setIsOpen((v) => !v)}
              aria-pressed={isOpen}
            >
              <span className="vh-dot" aria-hidden="true" />
              {isOpen ? 'Open for orders' : 'Closed'}
            </button>

            <button type="button" className="vh-icon-btn" aria-label="Notifications">
              <span aria-hidden="true">🔔</span>
              {counts.new > 0 && <span className="vh-badge">{counts.new}</span>}
            </button>

            <button type="button" className="vh-profile" aria-label="Your profile">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <circle cx="12" cy="8" r="4" fill="currentColor" />
                <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"
                      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {!isOpen && (
        <div className="vh-banner">
          You are marked <strong>closed</strong> - customers cannot see your truck
          or place orders right now.
        </div>
      )}

      {/* ---------------- STATS ---------------- */}
      <section className="vh-stats">
        <div className="vh-stat">
          <span className="vh-stat-label">Active orders</span>
          <span className="vh-stat-value">{orders.length}</span>
        </div>
        <div className="vh-stat">
          <span className="vh-stat-label">Today's revenue</span>
          <span className="vh-stat-value">₹{revenue}</span>
        </div>
        <div className="vh-stat">
          <span className="vh-stat-label">Awaiting accept</span>
          <span className="vh-stat-value">{counts.new}</span>
        </div>
        <div className="vh-stat">
          <span className="vh-stat-label">Items sold out</span>
          <span className="vh-stat-value">{soldOut}</span>
        </div>
      </section>

      <div className="vh-main">
        {/* ---------------- ORDER QUEUE ---------------- */}
        <section className="vh-panel">
          <h2 className="vh-panel-title">Order queue</h2>

          <div className="vh-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={tab === t.id ? 'vh-tab is-active' : 'vh-tab'}
                onClick={() => setTab(t.id)}
              >
                {t.label}
                <span className="vh-tab-count">{counts[t.id]}</span>
              </button>
            ))}
          </div>

          {visibleOrders.length === 0 ? (
            <p className="vh-empty">Nothing in this queue right now.</p>
          ) : (
            <div className="vh-orders">
              {visibleOrders.map((order) => (
                <article key={order.id} className="vh-order">
                  <div className="vh-order-top">
                    <div>
                      <span className="vh-order-id">{order.id}</span>
                      <span className="vh-order-customer">{order.customer}</span>
                    </div>
                    {order.type === 'preorder' ? (
                      <span className="vh-chip vh-chip-pre">Pre-order · {order.pickupAt}</span>
                    ) : (
                      <span className="vh-chip">Now · {order.placedAt}</span>
                    )}
                  </div>

                  <ul className="vh-order-items">
                    {order.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  <div className="vh-order-bottom">
                    <span className="vh-order-total">₹{order.total}</span>
                    <div className="vh-order-actions">
                      {order.status === 'new' && (
                        <>
                          <button
                            type="button"
                            className="vh-btn-ghost"
                            onClick={() => rejectOrder(order.id)}
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            className="vh-btn"
                            onClick={() => advance(order.id, 'preparing')}
                          >
                            Accept
                          </button>
                        </>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          type="button"
                          className="vh-btn"
                          onClick={() => advance(order.id, 'ready')}
                        >
                          Mark ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          type="button"
                          className="vh-btn"
                          onClick={() => advance(order.id, 'done')}
                        >
                          Handed over
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ---------------- SIDEBAR ---------------- */}
        <aside className="vh-side">
          <section className="vh-panel">
            <h2 className="vh-panel-title">Truck profile</h2>
            <p className="vh-hint">
              These fields decide which customer filters your truck shows up in.
            </p>

            <label className="vh-field">
              <span>Tagline</span>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                maxLength={60}
              />
              <small>{tagline.length}/60</small>
            </label>

            <label className="vh-field">
              <span>Cuisine</span>
              <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                {CUISINES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label className="vh-field">
              <span>Spice level</span>
              <select value={spice} onChange={(e) => setSpice(e.target.value)}>
                {SPICE_LEVELS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>

            <label className="vh-check">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
              />
              Pure veg truck
            </label>

            <button type="button" className="vh-btn vh-btn-block">
              Save profile
            </button>
          </section>

          <section className="vh-panel">
            <h2 className="vh-panel-title">
              Menu
              <span className="vh-count">{menu.length}</span>
            </h2>
            <p className="vh-hint">Turn an item off the moment you run out.</p>

            <ul className="vh-menu">
              {menu.map((item) => (
                <li key={item.id} className={item.available ? '' : 'is-off'}>
                  <div>
                    <span className="vh-menu-name">{item.name}</span>
                    <span className="vh-menu-price">₹{item.price}</span>
                  </div>
                  <label className="vh-switch">
                    <input
                      type="checkbox"
                      checked={item.available}
                      onChange={() => toggleItem(item.id)}
                      aria-label={`${item.name} available`}
                    />
                    <span aria-hidden="true" />
                  </label>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}