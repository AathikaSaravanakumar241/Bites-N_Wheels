import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCart } from './CartContext.jsx'
import { useArea } from './useArea.js'
import { iconFor } from './catalog.js'
import { fetchAreaCatalog, formatTime, groupByDish } from './areaCatalog.js'
import './Category.css'

export default function CategoryPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const { area } = useArea()
  const { count } = useCart()

  const [trucks, setTrucks] = useState([])
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedTruckId, setSelectedTruckId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!area) { setLoading(false); return }
    setLoading(true)
    fetchAreaCatalog(area.id)
      .then(({ trucks, items, categories }) => {
        setTrucks(trucks); setItems(items); setCategories(categories)
      })
      .catch(() => { setTrucks([]); setItems([]); setCategories([]) })
      .finally(() => setLoading(false))
  }, [area])

  const category = categories.find((c) => c.id === categoryId)
    ?? { id: categoryId, label: categoryId, icon: iconFor(categoryId) }  const trucksWithCategory = useMemo(() => {
    return trucks
      .filter((t) => t.items.some((i) => i.category === categoryId && i.available))
      .map((t) => ({
        ...t,
        matchCount: t.items.filter((i) => i.category === categoryId && i.available).length,
      }))
      .sort((a, b) => String(a.arrivalTime ?? '').localeCompare(String(b.arrivalTime ?? '')))
  }, [trucks, categoryId])

  const selectedTruck = trucksWithCategory.find((t) => t.id === selectedTruckId) || null

  const dishes = useMemo(() => {
    const pool = selectedTruck
      ? selectedTruck.items
      : items.filter((i) => trucksWithCategory.some((t) => t.id === i.truckId))
    return groupByDish(pool.filter((i) => i.category === categoryId && i.available))
  }, [selectedTruck, items, trucksWithCategory, categoryId])

  const otherDishes = useMemo(() => {
    if (!selectedTruck) return []
    return groupByDish(
      selectedTruck.items.filter((i) => i.category !== categoryId && i.available),
    )
  }, [selectedTruck, categoryId])

  if (!area) {
    return (
      <div className="cp">
        <div className="cp-bar"><div className="cp-bar-inner">
          <Link to="/user" className="cp-back">← Home</Link>
        </div></div>
        <p className="cp-empty">Pick your area first.</p>
      </div>
    )
  }

  function DishCard({ dish }) {
    return (
      <button
        type="button"
        className="cp-dish cp-dish-btn"
        onClick={() => navigate(`/user/food/${encodeURIComponent(dish.name)}`)}
      >
        <span className="cp-dish-head">
          <span className={dish.veg ? 'cp-veg' : 'cp-veg is-nonveg'} aria-hidden="true" />
          <span className="cp-dish-name">{dish.name}</span>
        </span>
        <span className="cp-dish-desc">{dish.desc}</span>
        <span className="cp-dish-foot">
          <span className="cp-price">from ₹{dish.minPrice}</span>
          <span className="cp-dish-trucks">
            {dish.truckCount} truck{dish.truckCount === 1 ? '' : 's'}
          </span>
        </span>
      </button>
    )
  }

  return (
    <div className="cp">
      <div className="cp-bar">
        <div className="cp-bar-inner">
          <Link to="/user" className="cp-back">← All categories</Link>
          <h1 className="cp-title">
            <span aria-hidden="true">{category.icon}</span>
            {category.label}
          </h1>
          <span className="cp-sub">
            in {area.name} · {trucksWithCategory.length} truck
            {trucksWithCategory.length === 1 ? '' : 's'}
          </span>
          {count > 0 && (
            <button type="button" className="cp-cart" onClick={() => navigate('/user/cart')}>
              🛒 {count} · View cart
            </button>
          )}
        </div>
      </div>

      <div className="cp-main">
        <aside className="cp-trucks">
          <h2 className="cp-side-title">Arriving in {area.name}</h2>

          <button
            type="button"
            className={selectedTruckId === null ? 'cp-truck is-active' : 'cp-truck'}
            onClick={() => setSelectedTruckId(null)}
          >
            <span className="cp-truck-name">All trucks</span>
            <span className="cp-truck-tagline">
              Every {category.label.toLowerCase()} coming here today
            </span>
          </button>

          {loading ? (
            <p className="cp-side-note">Loading trucks…</p>
          ) : trucksWithCategory.length === 0 ? (
            <p className="cp-side-note">No truck brings this here today.</p>
          ) : (
            trucksWithCategory.map((truck, index) => (
              <button
                key={truck.scheduleId ?? truck.id}
                type="button"
                className={selectedTruckId === truck.id ? 'cp-truck is-active' : 'cp-truck'}
                onClick={() => setSelectedTruckId(selectedTruckId === truck.id ? null : truck.id)}
              >
                <span className="cp-truck-head">
                  <span className="cp-truck-name">{truck.name}</span>
                  {index === 0 && <span className="cp-fastest">First</span>}
                </span>
                <span className="cp-truck-tagline">{truck.tagline}</span>
                <span className="cp-truck-meta">
                  <span className="cp-eta">{formatTime(truck.arrivalTime)}</span>
                  <span>– {formatTime(truck.departureTime)}</span>
                  <span>· {truck.matchCount} option{truck.matchCount === 1 ? '' : 's'}</span>
                </span>
              </button>
            ))
          )}
        </aside>

        <main className="cp-content">
          <h2 className="cp-section-title">
            {selectedTruck
              ? `${category.label} at ${selectedTruck.name}`
              : `${category.label} in ${area.name}`}
            <span className="cp-count">{dishes.length}</span>
          </h2>

          {selectedTruck && (
            <p className="cp-note">
              Arrives {formatTime(selectedTruck.arrivalTime)}, leaves{' '}
              {formatTime(selectedTruck.departureTime)}.{' '}
              <button type="button" className="cp-link" onClick={() => setSelectedTruckId(null)}>
                Show every truck
              </button>
            </p>
          )}

          {loading ? (
            <p className="cp-empty">Loading…</p>
          ) : dishes.length === 0 ? (
            <p className="cp-empty">
              No {category.label.toLowerCase()} coming to {area.name} today.
            </p>
          ) : (
            <div className="cp-dishes">
              {dishes.map((dish) => <DishCard key={dish.key} dish={dish} />)}
            </div>
          )}

          {selectedTruck && otherDishes.length > 0 && (
            <section className="cp-more">
              <h2 className="cp-section-title">
                Also from {selectedTruck.name}
                <span className="cp-count">{otherDishes.length}</span>
              </h2>
              <div className="cp-dishes">
                {otherDishes.map((dish) => <DishCard key={dish.key} dish={dish} />)}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
