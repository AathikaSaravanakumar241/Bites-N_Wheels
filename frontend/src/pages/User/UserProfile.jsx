import { Link, useNavigate } from 'react-router-dom'
import { clearToken } from '../../api.js'
import { getSession } from '../../session.js'
import './UserProfile.css'


const read = getSession

export default function UserProfile() {
  const navigate = useNavigate()

  const name = read('bnw_name')
  const email = read('bnw_email')
  const phone = read('bnw_phone')

  function handleLogout() {    clearToken()
    navigate('/login')
  }

  return (
    <div className="up">
      <div className="up-bar">
        <div className="up-bar-inner">
          <Link to="/user" className="up-back">← Keep browsing</Link>
          <h1 className="up-title">Your account</h1>
        </div>
      </div>

      <main className="up-main">
        <section className="up-card">
          <div className="up-avatar" aria-hidden="true">
            {(name || '?').trim().charAt(0).toUpperCase()}
          </div>
          <p className="up-name">{name || 'Signed in'}</p>
          {email && <p className="up-sub">{email}</p>}
        </section>

        <section className="up-card">
          <h2 className="up-heading">Details</h2>
          <dl className="up-facts">
            <div>
              <dt>Name</dt>
              <dd>{name || '—'}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{email || '—'}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{phone || '—'}</dd>
            </div>
          </dl>
        </section>

        <nav className="up-links">
          <Link to="/user/orders" className="up-link">
            <span>Your orders</span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link to="/user/cart" className="up-link">
            <span>Your cart</span>
            <span aria-hidden="true">→</span>
          </Link>
        </nav>

        <button type="button" className="up-logout" onClick={handleLogout}>
          Log out
        </button>
      </main>
    </div>
  )
}
