import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCart } from './CartContext.jsx'
import { useArea } from './useArea.js'
import { fetchAreaCatalog, formatTime } from './areaCatalog.js'
import { IconShoppingBag, IconArrowLeft, IconClock, IconMinus, IconPlus } from '../../icons.jsx'
import './FoodTrucks.css'

export default function FoodTrucks() {
  const { foodName } = useParams()
  const navigate = useNavigate()
  const { area } = useArea()
  const { addItem, startNewCart, removeItem, qtyOf, count } = useCart()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const dish = decodeURIComponent(foodName ?? '')

  useEffect(() => {
    if (!area) return
    setLoading(true)
    fetchAreaCatalog(area.id)
      .then(({ items }) => setItems(items))
      .catch(() => setError('Could not load trucks for this dish.'))
      .finally(() => setLoading(false))
  }, [area])

  const options = useMemo(() => {
    const target = dish.toLowerCase()
    return items
      .filter((i) => i.name.toLowerCase() === target)
      .sort((a, b) => String(a.arrivalTime ?? '').localeCompare(String(b.arrivalTime ?? '')))
  }, [items, dish])

  function handleAdd(truckId, itemId) {
    const result = addItem(truckId, itemId)
    const apply = (r) => {
      if (r?.conflict) {
        const name = r.currentTruck?.name ?? 'another truck'
        if (window.confirm(
          `Your cart already has food from ${name}.\n\nOne order comes from one truck. Start a new cart?`,
        )) startNewCart(truckId, itemId)
      }
    }
    if (result && typeof result.then === 'function') result.then(apply).catch(() => {})
    else apply(result)
  }

  if (!area) {
    return (
      <div className="ft">
        <div className="ft-bar"><div className="ft-bar-inner">
          <Link to="/user" className="ft-back"><IconArrowLeft size={14} /> Home</Link>
        </div></div>
        <p className="ft-empty">Pick your area first.</p>
      </div>
    )
  }

  return (
    <div className="ft">
      <div className="ft-bar">
        <div className="ft-bar-inner">
          <Link to="/user" className="ft-back"><IconArrowLeft size={14} /> Back</Link>
          <div>
            <h1 className="ft-title">{dish}</h1>
            <p className="ft-sub">
              Trucks bringing this to <strong>{area.name}</strong> today
            </p>
          </div>
          {count > 0 && (
            <button type="button" className="ft-cart" onClick={() => navigate('/user/cart')}>
              <IconShoppingBag size={15} />
              {count} · View cart
            </button>
          )}
        </div>
      </div>

      <div className="ft-main">
        {error && <p className="ft-empty">{error}</p>}

        {loading ? (
          <div className="ft-list">
            {[...Array(3)].map((_, i) => <div key={i} className="ft-card-skeleton" />)}
          </div>
        ) : options.length === 0 ? (
          <p className="ft-empty">
            No truck is bringing {dish} to {area.name} today.
          </p>
        ) : (
          <>
            <p className="ft-count">
              {options.length} truck{options.length === 1 ? '' : 's'} · sorted by arrival time
            </p>

            <div className="ft-list">
              {options.map((opt) => {
                const qty = qtyOf(opt.id)
                return (
                  <article
                    key={`${opt.truckId}-${opt.id}`}
                    className={opt.state === 'left' ? 'ft-card is-left' : 'ft-card'}
                  >
                    <div className="ft-card-main">
                      <div className="ft-card-head">
                        <span className={opt.veg ? 'ft-veg' : 'ft-veg is-nonveg'} aria-hidden="true" />
                        <h2 className="ft-truck">{opt.truckName}</h2>
                        <span className={`ft-state is-${opt.state}`}>
                          {opt.state === 'here' ? 'Here now'
                            : opt.state === 'left' ? 'Already left'
                            : 'Arriving later'}
                        </span>
                      </div>

                      <p className="ft-tagline">{opt.truckTagline}</p>

                      <dl className="ft-facts">
                        <div>
                          <dt><IconClock size={11} /> Arrives</dt>
                          <dd>{formatTime(opt.arrivalTime) || '—'}</dd>
                        </div>
                        <div>
                          <dt><IconClock size={11} /> Leaves</dt>
                          <dd>{formatTime(opt.departureTime) || '—'}</dd>
                        </div>
                        <div>
                          <dt>Availability</dt>
                          <dd className={opt.available ? 'ft-ok' : 'ft-no'}>
                            {opt.available
                              ? (opt.stock > 0 ? `${opt.stock} left` : 'Available')
                              : 'Sold out'}
                          </dd>
                        </div>
                        <div>
                          <dt>Journey</dt>
                          <dd>{opt.scheduleStatus ?? '—'}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="ft-card-side">
                      <span className="ft-price">₹{opt.price}</span>

                      {!opt.available || opt.state === 'left' ? (
                        <span className="ft-disabled">
                          {opt.state === 'left' ? 'Left the area' : 'Sold out'}
                        </span>
                      ) : qty ? (
                        <div className="ft-stepper">
                          <button type="button" onClick={() => removeItem(opt.id)} aria-label="Remove one">
                            <IconMinus size={13} />
                          </button>
                          <span>{qty}</span>
                          <button type="button" onClick={() => handleAdd(opt.truckId, opt.id)} aria-label="Add one">
                            <IconPlus size={13} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="ft-add"
                          onClick={() => handleAdd(opt.truckId, opt.id)}
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
