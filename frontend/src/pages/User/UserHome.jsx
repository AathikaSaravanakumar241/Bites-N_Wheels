import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from './CartContext.jsx'
import { useArea } from './useArea.js'
import AreaPicker from './AreaPicker.jsx'
import { fetchAreaCatalog, formatTime, groupByDish } from './areaCatalog.js'
import logo from '../../assets/logo.jpeg'
import './UserHome.css'

const PROMOS = [
  { id: 1, tag: 'New user',   title: '50% off your first order', text: 'Use code FIRST50 at any truck near you.' },
  { id: 2, tag: 'Today only', title: 'Free delivery till 9 PM',  text: 'On every pre-order placed before 6 PM today.' },
  { id: 3, tag: 'Late night', title: 'Late night cravings?',     text: '12 trucks are serving past midnight this week.' },
]

export default function UserHome() {
  const navigate = useNavigate()
  const { area } = useArea()
  const { count: cartCount } = useCart()

  const [pickerOpen, setPickerOpen] = useState(false)
  const [trucks, setTrucks] = useState([])
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [query, setQuery] = useState('')
  const [activeCategories, setActiveCategories] = useState([])
  const [vegOnly, setVegOnly] = useState(false)
  const [promoIndex, setPromoIndex] = useState(0)  useEffect(() => {
    if (!area) return
    setLoading(true)
    setError('')
    fetchAreaCatalog(area.id)
      .then(({ trucks, items, categories }) => {
        setTrucks(trucks)
        setItems(items)
        setCategories(categories)
      })
      .catch(() => {
        setTrucks([]); setItems([]); setCategories([])
        setError('Could not load food for this area.')
      })
      .finally(() => setLoading(false))
  }, [area])

  useEffect(() => {
    const timer = setInterval(() => setPromoIndex((i) => (i + 1) % PROMOS.length), 4000)
    return () => clearInterval(timer)
  }, [])

  function toggleCategory(id) {
    setActiveCategories((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
  }

  function clearFilters() {
    setActiveCategories([])
    setVegOnly(false)
  }  const dishes = useMemo(() => {
    const filtered = items.filter((i) => {
      if (!i.available) return false
      if (activeCategories.length && !activeCategories.includes(i.category)) return false
      if (vegOnly && !i.veg) return false
      if (query.trim()) {
        const q = query.trim().toLowerCase()
        if (!`${i.name} ${i.tag} ${i.truckName}`.toLowerCase().includes(q)) return false
      }
      return true
    })
    return groupByDish(filtered)
  }, [items, activeCategories, vegOnly, query])

  const promo = PROMOS[promoIndex]
  const filterCount = activeCategories.length + (vegOnly ? 1 : 0)  if (!area) return <AreaPicker />

  return (
    <div className="uh">
      {pickerOpen && <AreaPicker onClose={() => setPickerOpen(false)} />}

      <header className="uh-header">
        <div className="uh-header-inner">
          <Link to="/user" className="uh-brand">
            <img src={logo} alt="" className="uh-logo" />
            <span className="uh-brand-name">Bites N Wheels</span>
          </Link>

          <button type="button" className="uh-location" onClick={() => setPickerOpen(true)}>
            <span aria-hidden="true">📍</span>
            <span className="uh-location-text">{area.name}</span>
            <span className="uh-caret" aria-hidden="true">▾</span>
          </button>

          <div className="uh-search">
            <span className="uh-search-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search food coming to ${area.name}`}
              aria-label="Search food"
            />
          </div>

          <div className="uh-actions">
            <button type="button" className="uh-cart" onClick={() => navigate('/user/cart')}>
              <span aria-hidden="true">🛒</span>
              <span className="uh-cart-text">My items</span>
              {cartCount > 0 && <span className="uh-badge">{cartCount}</span>}
            </button>

            <button
              type="button"
              className="uh-profile"
              aria-label="Your profile"
              onClick={() => navigate('/user/profile')}
            >
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
            <legend>Category</legend>
            {categories.length === 0 ? (
              <p className="uh-check uh-dim">{loading ? 'Loading…' : 'Nothing arriving yet'}</p>
            ) : (
              categories.map((cat) => (
                <label key={cat.id} className="uh-check">
                  <input
                    type="checkbox"
                    checked={activeCategories.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  {cat.label}
                </label>
              ))
            )}
          </fieldset>

          <fieldset className="uh-group">
            <legend>Preference</legend>
            <label className="uh-check">
              <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} />
              Veg only
            </label>
          </fieldset>

          <div className="uh-trucks-today">
            <h3 className="uh-side-h">Trucks in {area.name}</h3>
            {trucks.length === 0 ? (
              <p className="uh-dim">None scheduled today.</p>
            ) : (
              trucks.map((t) => (
                <div key={t.scheduleId ?? t.id} className="uh-mini-truck">
                  <span className="uh-mini-name">{t.name}</span>
                  <span className="uh-mini-time">
                    {formatTime(t.arrivalTime)} – {formatTime(t.departureTime)}
                  </span>
                  <span className={`uh-state is-${t.state}`}>
                    {t.state === 'here' ? 'Here now' : t.state === 'left' ? 'Left' : 'Arriving'}
                  </span>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="uh-content">
          <section>
            <h2 className="uh-section-title">What are you craving?</h2>
            {categories.length === 0 ? (
              <p className="uh-empty">
                {loading ? 'Loading…' : `No trucks are scheduled in ${area.name} today.`}
              </p>
            ) : (
              <div className="uh-categories">
                {categories.map((cat) => (
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
            )}
          </section>

          <section>
            <h2 className="uh-section-title">
              Coming to {area.name} today
              <span className="uh-count">{dishes.length}</span>
            </h2>

            {error && <p className="uh-empty">{error}</p>}

            {loading ? (
              <p className="uh-empty">Loading food…</p>
            ) : dishes.length === 0 ? (
              <p className="uh-empty">
                {items.length === 0
                  ? `No trucks are visiting ${area.name} today. Try another area.`
                  : 'Nothing matches those filters.'}
              </p>
            ) : (
              <div className="uh-dishes">
                {dishes.map((dish) => (
                  <button
                    key={dish.key}
                    type="button"
                    className="uh-dish"
                    onClick={() => navigate(`/user/food/${encodeURIComponent(dish.name)}`)}
                  >
                    <span className="uh-dish-head">
                      <span className={dish.veg ? 'uh-veg' : 'uh-veg is-nonveg'} aria-hidden="true" />
                      <span className="uh-dish-name">{dish.name}</span>
                    </span>
                    <span className="uh-dish-desc">{dish.desc}</span>
                    <span className="uh-dish-foot">
                      <span className="uh-dish-price">from ₹{dish.minPrice}</span>
                      <span className="uh-dish-trucks">
                        {dish.truckCount} truck{dish.truckCount === 1 ? '' : 's'}
                      </span>
                    </span>
                    <span className="uh-dish-eta">First arrival {formatTime(dish.earliest)}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
