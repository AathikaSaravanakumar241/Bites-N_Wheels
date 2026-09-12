import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from './CartContext.jsx'
import { getSession } from '../../session.js'
import './Checkout.css'

const PACKING_FEE = 20

function buildSlots() {
  const start = new Date(Date.now() + 45 * 60000)
  start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15, 0, 0)
  return Array.from({ length: 12 }, (_, i) => {
    const t = new Date(start.getTime() + i * 15 * 60000)
    return {
      value: t.toISOString(),
      label: t.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    }
  })
}

export default function Checkout() {
  const navigate = useNavigate()
  const { truck, lines, subtotal, placeOrder } = useCart()

  const slots = useMemo(buildSlots, [])

  const [name, setName]       = useState(getSession('bnw_name'))  const [phone, setPhone]     = useState(getSession('bnw_phone'))
  const [address, setAddress] = useState(localStorage.getItem('bnw_last_address') ?? '')

  const [when, setWhen]       = useState('now')
  const [slot, setSlot]       = useState(slots[0]?.value ?? '')
  const [payment, setPayment] = useState('cod')
  const [note, setNote]       = useState('')
  const [errors, setErrors]   = useState({})  const clearError = (field) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  const [placing, setPlacing] = useState(false)
  const [apiError, setApiError] = useState('')

  if (!truck || lines.length === 0) {
    return (
      <div className="co">
        <div className="co-bar">
          <div className="co-bar-inner">
            <Link to="/user" className="co-back">← Back</Link>
            <h1 className="co-title">Checkout</h1>
          </div>
        </div>
        <div className="co-empty-wrap">
          <p className="co-empty">
            There's nothing to check out.
            <br />
            <Link to="/user" className="co-link">Find a truck near you</Link>
          </p>
        </div>
      </div>
    )
  }

  const total = subtotal + PACKING_FEE

  function validate() {
    const next = {}
    if (!name.trim())                              next.name    = 'Enter the name for this order'
    if (!/^\d{10}$/.test(phone.trim()))            next.phone   = 'Enter a 10-digit phone number'
    if (!address.trim())                           next.address = 'Enter where we should deliver'
    if (when === 'later' && !slot)                 next.slot    = 'Pick a pickup time'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handlePlaceOrder(e) {
    e.preventDefault()
    if (!validate()) return
    setPlacing(true)
    setApiError('')
    try {
      const orderId = await placeOrder({
        schedule:
          when === 'later'
            ? { type: 'later', at: slot, label: slots.find((s) => s.value === slot)?.label ?? '' }
            : { type: 'now',   at: null, label: `${truck.etaMin} min` },
        payment,
        note: note.trim(),
      })
      try { localStorage.setItem('bnw_last_address', address.trim()) } catch { /* storage blocked */ }
      navigate(`/user/order/${orderId}`)
    } catch (err) {
      setApiError(err.message || 'Failed to place order. Please try again.')
      setPlacing(false)
    }
  }

  return (
    <div className="co">
      <div className="co-bar">
        <div className="co-bar-inner">
          <Link to="/user/cart" className="co-back">← Back to cart</Link>
          <h1 className="co-title">Checkout</h1>
        </div>
      </div>

      <form className="co-main" onSubmit={handlePlaceOrder} noValidate>
        <div className="co-left">
          <section className="co-panel">
            <h2 className="co-panel-title">Your details</h2>

            {apiError && (
              <p style={{ color: 'red', fontSize: 14, marginBottom: 12 }}>{apiError}</p>
            )}

            <label className="co-field">
              <span>Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); clearError('name') }}
                aria-invalid={!!errors.name}
              />
              {errors.name && <small className="co-error">{errors.name}</small>}
            </label>

            <label className="co-field">
              <span>Phone</span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); clearError('phone') }}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <small className="co-error">{errors.phone}</small>}
            </label>

            <label className="co-field">
              <span>Delivery address</span>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => { setAddress(e.target.value); clearError('address') }}
                aria-invalid={!!errors.address}
              />
              {errors.address && <small className="co-error">{errors.address}</small>}
            </label>
          </section>

          <section className="co-panel">
            <h2 className="co-panel-title">When do you want it?</h2>

            <label className={when === 'now' ? 'co-option is-active' : 'co-option'}>
              <input type="radio" name="when" checked={when === 'now'} onChange={() => setWhen('now')} />
              <span className="co-option-body">
                <span className="co-option-title">As soon as possible</span>
                <span className="co-option-sub">Ready in about {truck.etaMin} minutes</span>
              </span>
            </label>

            <label className={when === 'later' ? 'co-option is-active' : 'co-option'}>
              <input type="radio" name="when" checked={when === 'later'} onChange={() => setWhen('later')} />
              <span className="co-option-body">
                <span className="co-option-title">Schedule for later</span>
                <span className="co-option-sub">Pre-order and pick a time that suits you</span>
              </span>
            </label>

            {when === 'later' && (
              <div className="co-slots">
                {slots.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={slot === s.value ? 'co-slot is-active' : 'co-slot'}
                    onClick={() => setSlot(s.value)}
                  >
                    {s.label}
                  </button>
                ))}
                {errors.slot && <small className="co-error">{errors.slot}</small>}
              </div>
            )}
          </section>

          <section className="co-panel">
            <h2 className="co-panel-title">Payment</h2>

            <label className={payment === 'cod' ? 'co-option is-active' : 'co-option'}>
              <input type="radio" name="payment" checked={payment === 'cod'} onChange={() => setPayment('cod')} />
              <span className="co-option-body">
                <span className="co-option-title">Cash on delivery</span>
                <span className="co-option-sub">Pay the truck when you collect</span>
              </span>
            </label>

            <label className="co-option is-disabled">
              <input type="radio" name="payment" disabled />
              <span className="co-option-body">
                <span className="co-option-title">UPI / Card</span>
                <span className="co-option-sub">Coming soon</span>
              </span>
            </label>

            <label className="co-field co-field-note">
              <span>Note for the truck (optional)</span>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Less spicy, no onion..."
                maxLength={80}
              />
            </label>
          </section>
        </div>

        <aside className="co-panel co-summary">
          <h2 className="co-panel-title">Order summary</h2>

          <div className="co-truck">
            <span className="co-truck-name">{truck.name}</span>
            <span className="co-truck-tagline">{truck.tagline}</span>
          </div>

          <ul className="co-lines">
            {lines.map((line) => (
              <li key={line.id}>
                <span className="co-qty">{line.qty}×</span>
                <span className="co-line-name">{line.name}</span>
                <span className="co-line-total">₹{line.price * line.qty}</span>
              </li>
            ))}
          </ul>

          <div className="co-row">
            <span>Item total</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="co-row">
            <span>Packing charge</span>
            <span>₹{PACKING_FEE}</span>
          </div>
          <div className="co-row co-row-total">
            <span>To pay</span>
            <span>₹{total}</span>
          </div>

          <p className="co-when">
            {when === 'later'
              ? `Scheduled for ${slots.find((s) => s.value === slot)?.label ?? '—'}`
              : `Ready in about ${truck.etaMin} min`}
            {' · '}
            {payment === 'cod' ? 'Cash on delivery' : 'Online'}
          </p>

          <button type="submit" className="co-cta" disabled={placing}>
            {placing ? 'Placing order…' : `Place order · ₹${total}`}
          </button>
        </aside>
      </form>
    </div>
  )
}
