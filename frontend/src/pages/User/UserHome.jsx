import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from './CartContext.jsx'
import { useArea } from './useArea.js'
import AreaPicker from './AreaPicker.jsx'
import { fetchAreaCatalog, formatTime, groupByDish } from './areaCatalog.js'
import logo from '../../assets/logo.jpeg'
import './UserHome.css'

const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 10c0 6-8 13-8 13S4 16 4 10a8 8 0 1 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const IconChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6"/>
  </svg>
)

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
)

const IconShoppingBag = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
    <line x1="3" x2="21" y1="6" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/>
  </svg>
)

const IconTruck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
    <rect x="9" y="11" width="14" height="10" rx="2"/>
    <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
  </svg>
)

const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
  </svg>
)

const IconTag = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42Z"/>
    <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
)

const IconSparkle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
  </svg>
)

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
  const [promoIndex, setPromoIndex] = useState(0)

  useEffect(() => {
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
  }

  const dishes = useMemo(() => {
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
  const filterCount = activeCategories.length + (vegOnly ? 1 : 0)

  if (!area) return <AreaPicker />

  return (
    <div className="uh">
      {pickerOpen && <AreaPicker onClose={() => setPickerOpen(false)} />}

      {}
      <header className="uh-header">
        <div className="uh-header-inner">
          <Link to="/user" className="uh-brand">
            <img src={logo} alt="" className="uh-logo" />
            <span className="uh-brand-name">Bites N Wheels</span>
          </Link>

          <button type="button" className="uh-location" onClick={() => setPickerOpen(true)}>
            <IconMapPin />
            <span className="uh-location-text">{area.name}</span>
            <IconChevronDown />
          </button>

          <div className="uh-search">
            <IconSearch />
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
              <IconShoppingBag />
              <span className="uh-cart-text">My items</span>
              {cartCount > 0 && <span className="uh-badge">{cartCount}</span>}
            </button>

            <button
              type="button"
              className="uh-profile"
              aria-label="Your profile"
              onClick={() => navigate('/user/profile')}
            >
              <IconUser />
            </button>
          </div>
        </div>
      </header>

      {}
      <section className="uh-promo" aria-live="polite">
        <div className="uh-promo-card">
          <div className="uh-promo-content">
            <span className="uh-promo-tag">
              <IconSparkle />
              {promo.tag}
            </span>
            <h2>{promo.title}</h2>
            <p>{promo.text}</p>
          </div>
          <div className="uh-promo-visual" aria-hidden="true" />
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

      {}
      <div className="uh-main">
        {}
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
            <h3 className="uh-side-h">
              <IconTruck />
              Trucks in {area.name}
            </h3>
            {trucks.length === 0 ? (
              <p className="uh-dim">None scheduled today.</p>
            ) : (
              trucks.map((t) => (
                <div key={t.scheduleId ?? t.id} className="uh-mini-truck">
                  <span className="uh-mini-name">{t.name}</span>
                  <span className="uh-mini-time">
                    <IconClock />
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

        {}
        <main className="uh-content">
          {}
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
                    className={`uh-category${activeCategories.includes(cat.id) ? ' is-active' : ''}`}
                    onClick={() => navigate(`/user/category/${cat.id}`)}
                  >
                    <span className="uh-category-icon" aria-hidden="true">{cat.icon}</span>
                    <span className="uh-category-label">{cat.label}</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {}
          <section>
            <h2 className="uh-section-title">
              Coming to {area.name} today
              <span className="uh-count">{dishes.length}</span>
            </h2>

            {error && <p className="uh-empty">{error}</p>}

            {loading ? (
              <div className="uh-dishes">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="uh-dish-skeleton" />
                ))}
              </div>
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
                        <IconTruck />
                        {dish.truckCount} truck{dish.truckCount === 1 ? '' : 's'}
                      </span>
                    </span>
                    <span className="uh-dish-eta">
                      <IconClock />
                      First arrival {formatTime(dish.earliest)}
                    </span>
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
