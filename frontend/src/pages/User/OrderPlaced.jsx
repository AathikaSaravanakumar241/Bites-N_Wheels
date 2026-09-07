import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCart } from './CartContext.jsx'
import './OrderPlaced.css'

export default function OrderPlaced() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { getOrder } = useCart()

  const order = getOrder(orderId)

  if (!order) {
    return (
      <div className="op">
        <div className="op-card">
          <h1 className="op-title">Order not found</h1>
          <p className="op-sub">We couldn't find order {orderId}.</p>
          <Link to="/user" className="op-secondary">Back to home</Link>
        </div>
      </div>
    )
  }

  const itemCount = order.lines.reduce((sum, l) => sum + l.qty, 0)

  return (
    <div className="op">
      <div className="op-card">
        <div className="op-tick" aria-hidden="true">
          <svg viewBox="0 0 52 52" width="60" height="60">
            <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="3" />
            <path d="M15 27l8 8 15-16" fill="none" stroke="currentColor"
                  strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="op-title">Order placed</h1>
        <p className="op-sub">
          {order.truckName} has your order. You'll get a call if anything changes.
        </p>

        <div className="op-id">
          <span>Order ID</span>
          <strong>{order.id}</strong>
        </div>

        <dl className="op-facts">
          <div>
            <dt>Truck</dt>
            <dd>{order.truckName}</dd>
          </div>
          <div>
            <dt>{order.schedule.type === 'later' ? 'Scheduled for' : 'Ready in'}</dt>
            <dd>{order.schedule.label}</dd>
          </div>
          <div>
            <dt>Items</dt>
            <dd>{itemCount}</dd>
          </div>
          <div>
            <dt>Payment</dt>
            <dd>{order.payment === 'cod' ? 'Cash on delivery' : 'Online'}</dd>
          </div>
          <div>
            <dt>To pay</dt>
            <dd className="op-total">₹{order.total}</dd>
          </div>
        </dl>

        {order.schedule.type === 'later' && (
          <p className="op-pre">
            This is a pre-order. The truck starts cooking closer to your slot,
            so it's fresh when you collect it.
          </p>
        )}

        <button
          type="button"
          className="op-cta"
          onClick={() => navigate(`/user/track/${order.id}`)}
        >
          Track order
        </button>

        <Link to="/user" className="op-secondary">Back to home</Link>
      </div>
    </div>
  )
}
