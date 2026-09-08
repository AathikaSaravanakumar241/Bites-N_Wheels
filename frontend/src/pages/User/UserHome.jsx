import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from './CartContext.jsx'
import { get } from '../../api.js'
import logo from '../../assets/logo.jpeg'
import './UserHome.css'

const PROMOS = [
  { id: 1, tag: 'New user',  title: '50% off your first order', text: 'Use code FIRST50 at any truck near you.' },
  { id: 2, tag: 'Today only', title: 'Free delivery till 9 PM',  text: 'On every pre-order placed before 6 PM today.' },
  { id: 3, tag: 'Late night', title: 'Late night cravings?',     text: '12 trucks are serving past midnight this week.' },
]

const CATEGORIES = [
  { id: 'pizza',    label: 'Pizza',     icon: '🍕' },
  { id: 'waffles',  label: 'Waffles',   icon: '🧇' },
  { id: 'burger',   label: 'Burger',    icon: '🍔' },
  { id: 'tacos',    label: 'Tacos',     icon: '🌮' },
  { id: 'biryani',  label: 'Biryani',   icon: '🍛' },
  { id: 'noodles',  label: 'Noodles',   icon: '🍜' },
  { id: 'rolls',    label: 'Rolls',     icon: '🌯' },
  { id: 'coffee',   label: 'Coffee',    icon: '☕' },
  { id: 'desserts', label: 'Desserts',  icon: '🍩' },
  { id: 'icecream', label: 'Ice Cream', icon: '🍦' },
]

const CUISINES     = ['South Indian', 'North Indian', 'Chinese', 'Italian', 'Mexican']
const SPICE_LEVELS = ['Mild', 'Medium', 'Spicy']

export default function UserHome() {
  const navigate = useNavigate()

  const [trucks, setTrucks]           = useState([])
  const [truckLoading, setTruckLoading] = useState(true)

  const [location, setLocation]       = useState('Chennai, Guindy')
  const [query, setQuery]             = useState('')
  const [truckScope, setTruckScope]   = useState('all')
  const [orderTime, setOrderTime]     = useState('now')
  const { count: cartCount }          = useCart()

  const [activeCuisines, setActiveCuisines] = useState([])
  const [activeSpice, setActiveSpice]       = useState(null)
  const [vegOnly, setVegOnly]               = useState(false)

  const [promoIndex, setPromoIndex] = useState(0)

  useEffect(() => {
    get('/api/v1/trucks', false)
      .then((data) => {
        setTrucks(Array.isArray(data) ? data.map((t) => ({
          id:         t.truckId,
          name:       t.name,
          tagline:    t.tagline ?? '',
          status:     t.status,
          rating:     4.5,
          distanceKm: 1.0,
          etaMin:     20,
          veg:        false,
        })) : [])
      })
      .catch(() => setTrucks([]))
      .finally(() => setTruckLoading(false))
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setPromoIndex((i) => (i + 1) % PROMOS.length), 4000)
    return () => clearInterval(timer)
  }, [])

  function toggleCuisine(cuisine) {
    setActiveCuisines((current) =>
      current.includes(cuisine) ? current.filter((c) => c !== cuisine) : [...current, cuisine]
    )
  }

  function clearFilters() {
    setActiveCuisines([])
    setActiveSpice(null)
    setVegOnly(false)
  }

  const visibleTrucks = useMemo(() => {
    return trucks.filter((truck) => {
      if (truck.status === 'INACTIVE') return false
      if (activeCuisines.length && !activeCuisines.includes(truck.cuisine)) return false
      if (activeSpice && truck.spice !== activeSpice) return false
      if (vegOnly && !truck.veg) return false
      if (query.trim()) {
        const haystack = `${truck.name} ${truck.tagline}`.toLowerCase()
        if (!haystack.includes(query.trim().toLowerCase())) return false
      }
      return true
    })
  }, [trucks, activeCuisines, activeSpice, vegOnly, query])

  const promo = PROMOS[promoIndex]
  const filterCount = activeCuisines.length + (activeSpice ? 1 : 0) + (vegOnly ? 1 : 0)

  return (
    <div className="uh">
      <header className="uh-header">
        <div className="uh-header-inner">
          <Link to="/user" className="uh-brand">
            <img src={logo} alt="" className="uh-logo" />
            <span className="uh-brand-name">Bites N Wheels</span>
          </Link>

          <button
            type="button"
            className="uh-location"
            onClick={() => {
              const next = window.prompt('Set your location', location)
              if (next) setLocation(next)
            }}
          >
            <span aria-hidden="true">📍</span>
            <span className="uh-location-text">{location}</span>
            <span className="uh-caret" aria-hidden="true">▾</span>
          </button>

          <div className="uh-search">
            <span className="uh-search-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search trucks or dishes"
              aria-label="Search trucks and dishes"
            />
          </div>

          <div className="uh-actions">
            <label className="uh-select">
              <span className="uh-select-label">When</span>
              <select
                value={orderTime}
                onChange={(e) => setOrderTime(e.target.value)}
                aria-label="When do you want the order"
              >
                <option value="now">Order now</option>
                <option value="30">Pre-order · in 30 min</option>
                <option value="60">Pre-order · in 1 hour</option>
                <option value="120">Pre-order · in 2 hours</option>
              </select>
            </label>

            <button
              type="button"
              className="uh-cart"
              onClick={() => navigate('/user/cart')}
            >
              <span aria-hidden="true">🛒</span>
              <span className="uh-cart-text">My items</span>
              {cartCount > 0 && <span className="uh-badge">{cartCount}</span>}
            </button>

            <button type="button" className="uh-profile" aria-label="Your profile">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <circle cx="12" cy="8" r="4" fill="currentColor" />
                <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"
                      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <section className="uh-promo" aria-live="polite">
        <div className="uh-promo-card">
          <span className="uh-promo-tag">{promo.tag}</span>
          <h2>{promo.title}</h2>
          <p>{promo.text}</p>
        </div>
        <div className="uh-promo-dots">
          {PROMOS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={i === promoIndex ? 'is-active' : ''}
              onClick={() => setPromoIndex(i)}
              aria-label={`Show offer ${i + 1}`}
            />
          ))}
        </div>
      </section>

      <div className="uh-main">
        <aside className="uh-filters">
          <div className="uh-filters-head">
            <h3>Filters</h3>
            {filterCount > 0 && (
              <button type="button" className="uh-clear" onClick={clearFilters}>
                Clear ({filterCount})
              </button>
            )}
          </div>

          <fieldset className="uh-group">
            <legend>Spice level</legend>
            {SPICE_LEVELS.map((level) => (
              <label key={level} className="uh-check">
                <input
                  type="radio"
                  name="spice"
                  checked={activeSpice === level}
                  onChange={() => setActiveSpice(level)}
                />
                {level}
              </label>
            ))}
          </fieldset>

          <fieldset className="uh-group">
            <legend>Preference</legend>
            <label className="uh-check">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
              />
              Veg only
            </label>
          </fieldset>
        </aside>

        <main className="uh-content">
          <section>
            <h2 className="uh-section-title">What are you craving?</h2>
            <div className="uh-categories">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className="uh-category"
                  onClick={() => navigate(`/user/category/${cat.id}`)}
                >
                  <span className="uh-category-icon" aria-hidden="true">{cat.icon}</span>
                  <span className="uh-category-label">{cat.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="uh-section-title">
              Trucks near you
              <span className="uh-count">{visibleTrucks.length}</span>
            </h2>

            {truckLoading ? (
              <p className="uh-empty">Loading trucks…</p>
            ) : visibleTrucks.length === 0 ? (
              <p className="uh-empty">No trucks match that filter.</p>
            ) : (
              <div className="uh-trucks">
                {visibleTrucks.map((truck) => (
                  <article key={truck.id} className="uh-truck">
                    <div className="uh-truck-top">
                      <h3>{truck.name}</h3>
                      <span className="uh-rating">★ {truck.rating}</span>
                    </div>
                    <p className="uh-tagline">{truck.tagline}</p>
                    <div className="uh-truck-meta">
                      <span>{truck.etaMin} min</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
