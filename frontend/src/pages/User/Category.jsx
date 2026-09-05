import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CATEGORIES, TRUCKS } from '../../data/trucks.jsx'
import './Category.css'

export default function CategoryPage() {
  const { categoryId } = useParams()
  const [selectedTruckId, setSelectedTruckId] = useState(null)
  const [cart, setCart] = useState({}) // { [itemId]: quantity }

  const category = CATEGORIES.find((c) => c.id === categoryId)

  // Trucks that actually serve this category, fastest arrival first.
  const trucks = useMemo(() => {
    return TRUCKS.filter((t) => t.isOpen && t.items.some((i) => i.category === categoryId))
      .map((t) => ({
        ...t,
        matchCount: t.items.filter((i) => i.category === categoryId).length,
      }))
      .sort((a, b) => a.etaMin - b.etaMin)
  }, [categoryId])

  const selectedTruck = trucks.find((t) => t.id === selectedTruckId) || null

  // Dishes in this category - from one truck if chosen, else from all.
  const dishes = useMemo(() => {
    const source = selectedTruck ? [selectedTruck] : trucks
    return source.flatMap((truck) =>
      truck.items
        .filter((i) => i.category === categoryId)
        .map((i) => ({ ...i, truckName: truck.name, truckId: truck.id, etaMin: truck.etaMin })),
    )
  }, [selectedTruck, trucks, categoryId])

  // Everything else the chosen truck sells - the bottom section.
  const otherItems = selectedTruck
    ? selectedTruck.items.filter((i) => i.category !== categoryId)
    : []

  function addItem(itemId) {
    setCart((c) => ({ ...c, [itemId]: (c[itemId] || 0) + 1 }))
  }

  function removeItem(itemId) {
    setCart((c) => {
      const next = { ...c }
      if (next[itemId] > 1) next[itemId] -= 1
      else delete next[itemId]
      return next
    })
  }

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)

  if (!category) {
    return (
      <div className="cp">
        <div className="cp-bar">
          <Link to="/user" className="cp-back">← Back</Link>
        </div>
        <p className="cp-empty">That category doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="cp">
      {/* ---------------- TOP BAR ---------------- */}
      <div className="cp-bar">
        <div className="cp-bar-inner">
          <Link to="/user" className="cp-back">← All categories</Link>
          <h1 className="cp-title">
            <span aria-hidden="true">{category.icon}</span>
            {category.label}
          </h1>
          <span className="cp-sub">
            {trucks.length} truck{trucks.length === 1 ? '' : 's'} serving now
          </span>
          {cartCount > 0 && (
            <button type="button" className="cp-cart">
              🛒 {cartCount} item{cartCount === 1 ? '' : 's'}
            </button>
          )}
        </div>
      </div>

      <div className="cp-main">
        {/* ---------------- LEFT: TRUCKS BY ETA ---------------- */}
        <aside className="cp-trucks">
          <h2 className="cp-side-title">Fastest to reach you</h2>

          <button
            type="button"
            className={selectedTruckId === null ? 'cp-truck is-active' : 'cp-truck'}
            onClick={() => setSelectedTruckId(null)}
          >
            <span className="cp-truck-name">All trucks</span>
            <span className="cp-truck-tagline">
              Show every {category.label.toLowerCase()} nearby
            </span>
          </button>

          {trucks.map((truck, index) => (
            <button
              key={truck.id}
              type="button"
              className={selectedTruckId === truck.id ? 'cp-truck is-active' : 'cp-truck'}
              onClick={() =>
                setSelectedTruckId(selectedTruckId === truck.id ? null : truck.id)
              }
            >
              <span className="cp-truck-head">
                <span className="cp-truck-name">{truck.name}</span>
                {index === 0 && <span className="cp-fastest">Fastest</span>}
              </span>
              <span className="cp-truck-tagline">{truck.tagline}</span>
              <span className="cp-truck-meta">
                <span className="cp-eta">{truck.etaMin} min</span>
                <span>· {truck.distanceKm} km</span>
                <span>· ★ {truck.rating}</span>
                <span>· {truck.matchCount} option{truck.matchCount === 1 ? '' : 's'}</span>
              </span>
            </button>
          ))}
        </aside>

        {/* ---------------- RIGHT: DISHES ---------------- */}
        <main className="cp-content">
          <h2 className="cp-section-title">
            {selectedTruck
              ? `${category.label} at ${selectedTruck.name}`
              : `All ${category.label.toLowerCase()} near you`}
            <span className="cp-count">{dishes.length}</span>
          </h2>

          {selectedTruck && (
            <p className="cp-note">
              Showing only what {selectedTruck.name} makes.{' '}
              <button type="button" className="cp-link" onClick={() => setSelectedTruckId(null)}>
                Show every truck
              </button>
            </p>
          )}

          {dishes.length === 0 ? (
            <p className="cp-empty">No {category.label.toLowerCase()} available right now.</p>
          ) : (
            <div className="cp-dishes">
              {dishes.map((dish) => (
                <article key={dish.id} className="cp-dish">
                  <div className="cp-dish-head">
                    <span className={dish.veg ? 'cp-veg' : 'cp-veg is-nonveg'} aria-hidden="true" />
                    <h3>{dish.name}</h3>
                  </div>
                  <p className="cp-dish-desc">{dish.desc}</p>
                  {!selectedTruck && (
                    <p className="cp-dish-truck">
                      {dish.truckName} · {dish.etaMin} min
                    </p>
                  )}
                  <div className="cp-dish-foot">
                    <span className="cp-price">₹{dish.price}</span>
                    {cart[dish.id] ? (
                      <div className="cp-stepper">
                        <button type="button" onClick={() => removeItem(dish.id)} aria-label="Remove one">−</button>
                        <span>{cart[dish.id]}</span>
                        <button type="button" onClick={() => addItem(dish.id)} aria-label="Add one">+</button>
                      </div>
                    ) : (
                      <button type="button" className="cp-add" onClick={() => addItem(dish.id)}>
                        Add
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* ---------------- BOTTOM: REST OF THE TRUCK'S MENU ---------------- */}
          {selectedTruck && otherItems.length > 0 && (
            <section className="cp-more">
              <h2 className="cp-section-title">
                Also from {selectedTruck.name}
                <span className="cp-count">{otherItems.length}</span>
              </h2>
              <div className="cp-dishes">
                {otherItems.map((item) => (
                  <article key={item.id} className="cp-dish">
                    <div className="cp-dish-head">
                      <span className={item.veg ? 'cp-veg' : 'cp-veg is-nonveg'} aria-hidden="true" />
                      <h3>{item.name}</h3>
                    </div>
                    <p className="cp-dish-desc">{item.desc}</p>
                    <p className="cp-dish-truck">
                      {CATEGORIES.find((c) => c.id === item.category)?.label}
                    </p>
                    <div className="cp-dish-foot">
                      <span className="cp-price">₹{item.price}</span>
                      {cart[item.id] ? (
                        <div className="cp-stepper">
                          <button type="button" onClick={() => removeItem(item.id)} aria-label="Remove one">−</button>
                          <span>{cart[item.id]}</span>
                          <button type="button" onClick={() => addItem(item.id)} aria-label="Add one">+</button>
                        </div>
                      ) : (
                        <button type="button" className="cp-add" onClick={() => addItem(item.id)}>
                          Add
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}