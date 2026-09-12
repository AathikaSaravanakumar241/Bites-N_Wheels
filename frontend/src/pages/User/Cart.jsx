import { Link, useNavigate } from 'react-router-dom'
import { useCart } from './CartContext.jsx'
import { IconArrowLeft, IconX, IconMinus, IconPlus, IconShoppingBag, IconTruck } from '../../icons.jsx'
import './Cart.css'

const PACKING_FEE = 20

export default function Cart() {
  const navigate = useNavigate()
  const { truck, lines, count, subtotal, addItem, removeItem, removeLine, clearCart } = useCart()

  if (!truck || lines.length === 0) {
    return (
      <div className="ct">
        <div className="ct-bar">
          <div className="ct-bar-inner">
            <Link to="/user" className="ct-back"><IconArrowLeft size={14} /> Keep browsing</Link>
            <h1 className="ct-title">Your cart</h1>
          </div>
        </div>
        <div className="ct-empty-wrap">
          <div className="ct-empty-icon" aria-hidden="true">
            <IconShoppingBag size={48} />
          </div>
          <p className="ct-empty">
            Your cart is empty.
            <br />
            <Link to="/user" className="ct-link">Find a truck near you</Link>
          </p>
        </div>
      </div>
    )
  }

  const total = subtotal + PACKING_FEE

  return (
    <div className="ct">
      <div className="ct-bar">
        <div className="ct-bar-inner">
          <Link to="/user" className="ct-back"><IconArrowLeft size={14} /> Keep browsing</Link>
          <h1 className="ct-title">Your cart</h1>
          <span className="ct-sub">{count} item{count === 1 ? '' : 's'}</span>
        </div>
      </div>

      <div className="ct-main">
        <section className="ct-panel">
          <div className="ct-truck">
            <div className="ct-truck-info">
              <IconTruck size={16} />
              <div>
                <h2 className="ct-truck-name">{truck.name}</h2>
                <p className="ct-truck-tagline">{truck.tagline}</p>
              </div>
            </div>
            <span className="ct-eta">{truck.etaMin} min</span>
          </div>

          <p className="ct-rule">
            One order comes from one truck. To order from a different truck,
            place this order first or{' '}
            <button type="button" className="ct-link-btn" onClick={clearCart}>
              empty this cart
            </button>
            .
          </p>

          <ul className="ct-lines">
            {lines.map((line) => (
              <li key={line.id} className="ct-line">
                <span
                  className={line.veg ? 'ct-veg' : 'ct-veg is-nonveg'}
                  aria-hidden="true"
                />
                <div className="ct-line-body">
                  <span className="ct-line-name">{line.name}</span>
                  <span className="ct-line-price">₹{line.price} each</span>
                </div>

                <div className="ct-stepper">
                  <button type="button" onClick={() => removeItem(line.id)} aria-label={`Remove one ${line.name}`}>
                    <IconMinus size={13} />
                  </button>
                  <span>{line.qty}</span>
                  <button type="button" onClick={() => addItem(truck.id, line.id)} aria-label={`Add one ${line.name}`}>
                    <IconPlus size={13} />
                  </button>
                </div>

                <span className="ct-line-total">₹{line.price * line.qty}</span>

                <button
                  type="button"
                  className="ct-remove"
                  onClick={() => removeLine(line.id)}
                  aria-label={`Remove ${line.name} from cart`}
                >
                  <IconX size={13} />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <aside className="ct-panel ct-bill">
          <h2 className="ct-bill-title">Bill summary</h2>
          <div className="ct-row">
            <span>Item total</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="ct-row">
            <span>Packing charge</span>
            <span>₹{PACKING_FEE}</span>
          </div>
          <div className="ct-row ct-row-total">
            <span>To pay</span>
            <span>₹{total}</span>
          </div>

          <button
            type="button"
            className="ct-cta"
            onClick={() => navigate('/user/checkout')}
          >
            Proceed to checkout
          </button>

          <p className="ct-note">Cash on delivery available.</p>
        </aside>
      </div>
    </div>
  )
}
