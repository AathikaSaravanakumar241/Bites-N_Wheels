import { NavLink } from 'react-router-dom'
import { useVendorStatus } from './useVendorStatus.jsx'
import {
  IconLayoutDashboard,
  IconMap,
  IconReceipt,
  IconUtensilsCrossed,
  IconDollarSign,
  IconTruck,
} from '../../icons.jsx'
import './VendorLayout.css'

const NAV = [
  { to: '/vendor',         label: 'Dashboard', Icon: IconLayoutDashboard, end: true },
  { to: '/vendor/journey', label: 'Journey',   Icon: IconMap },
  { to: '/vendor/orders',  label: 'Orders',    Icon: IconReceipt },
  { to: '/vendor/menu',    label: 'Menu',      Icon: IconUtensilsCrossed },
  { to: '/vendor/billing', label: 'Billing',   Icon: IconDollarSign },
  { to: '/vendor/profile', label: 'Profile',   Icon: IconTruck },
]

export default function VendorLayout({ title, subtitle, actions, children }) {
  const { profile, isOpen, setIsOpen } = useVendorStatus()
  const truckInitial = profile?.truckName ? profile.truckName.trim().charAt(0).toUpperCase() : 'T'

  return (
    <div className="vl">
      <aside className="vl-side">
        <div className="vl-truck-profile">
          <div className="vl-truck-avatar-box" aria-hidden="true">
            {truckInitial}
          </div>
          <div className="vl-truck-meta">
            <div className="vl-truck-row">
              <span className="vl-truck-name" title={profile.truckName || 'Food Truck'}>
                {profile.truckName || 'Food Truck'}
              </span>
              <span
                className={`vl-status-indicator ${isOpen ? 'is-open' : 'is-closed'}`}
                title={isOpen ? 'Taking Orders' : 'Closed'}
              />
            </div>
            <div className="vl-truck-details">
              <span>{isOpen ? 'Taking Orders' : 'Closed'}</span>
              {profile.parkedAt && (
                <>
                  <span>·</span>
                  <span>{profile.parkedAt}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <nav className="vl-nav">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? 'vl-link is-active' : 'vl-link')}
            >
              <span className="vl-link-icon" aria-hidden="true">
                <Icon size={18} />
              </span>
              <span className="vl-link-text">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="vl-side-bottom">
          <button
            type="button"
            className="vl-toggle-minimal"
            onClick={() => {
              Promise.resolve(setIsOpen(!isOpen)).catch(() => {})
            }}
            aria-pressed={isOpen}
          >
            {isOpen ? 'Stop taking orders' : 'Start taking orders'}
          </button>
        </div>
      </aside>

      <div className="vl-body">
        {(title || actions) && (
          <header className="vl-head">
            <div className="vl-head-left">
              {title && <h1 className="vl-title">{title}</h1>}
              {subtitle && <p className="vl-subtitle">{subtitle}</p>}
            </div>
            {actions && <div className="vl-actions">{actions}</div>}
          </header>
        )}

        {!isOpen && (
          <div className="vl-banner">
            <span>
              You are currently marked <strong>offline</strong>. Customers cannot place new orders until you go online.
            </span>
          </div>
        )}

        <div className="vl-content">{children}</div>
      </div>
    </div>
  )
}
