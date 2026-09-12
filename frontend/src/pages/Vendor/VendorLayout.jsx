import { NavLink } from 'react-router-dom'
import { useVendorStatus } from './useVendorStatus.jsx'
import './VendorLayout.css'


const NAV = [
  { to: '/vendor',         label: 'Dashboard', icon: '▤', end: true },
  { to: '/vendor/journey', label: 'Journey',   icon: '🗺' },
  { to: '/vendor/orders',  label: 'Orders',    icon: '🧾' },
  { to: '/vendor/menu',    label: 'Menu',      icon: '🍽' },
  { to: '/vendor/billing', label: 'Billing',   icon: '💵' },
  { to: '/vendor/profile', label: 'Profile',   icon: '🚚' },
]

export default function VendorLayout({ title, subtitle, actions, children }) {
  const { profile, isOpen, setIsOpen } = useVendorStatus()

  return (
    <div className="vl">
      <aside className="vl-side">
        <div className="vl-brand">
          <span className="vl-brand-name">Bites N Wheels</span>
          <span className="vl-brand-role">Vendor</span>
        </div>

        <div className="vl-truck">
          <span className="vl-truck-name">{profile.truckName}</span>
          <span className={isOpen ? 'vl-state is-open' : 'vl-state'}>
            <span className="vl-dot" aria-hidden="true" />
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>

        <nav className="vl-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'vl-link is-active' : 'vl-link')}
            >
              <span className="vl-link-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className={isOpen ? 'vl-toggle is-open' : 'vl-toggle'}
          onClick={() => {            Promise.resolve(setIsOpen(!isOpen)).catch(() => {})
          }}
          aria-pressed={isOpen}
        >
          {isOpen ? 'Stop taking orders' : 'Start taking orders'}
        </button>
      </aside>

      <div className="vl-body">
        {/* Pages that already render their own heading pass no title. */}
        {(title || actions) && (
          <header className="vl-head">
            <div>
              {title && <h1 className="vl-title">{title}</h1>}
              {subtitle && <p className="vl-subtitle">{subtitle}</p>}
            </div>
            {actions && <div className="vl-actions">{actions}</div>}
          </header>
        )}

        {!isOpen && (
          <div className="vl-banner">
            You are marked <strong>closed</strong> — customers cannot see your
            truck or place new orders.
          </div>
        )}

        <div className="vl-content">{children}</div>
      </div>
    </div>
  )
}
