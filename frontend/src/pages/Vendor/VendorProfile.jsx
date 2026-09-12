import { useEffect, useState } from 'react'
import VendorLayout from './VendorLayout.jsx'
import { useVendorStatus } from './useVendorStatus.jsx'
import './VendorProfile.css'

const CUISINES = [
  'South Indian',
  'North Indian',
  'Chinese',
  'Italian',
  'Mexican',
  'Street Food',
  'Beverages & Snacks',
]

const SPICE_LEVELS = [
  { label: 'Mild', desc: 'Gentle & low spice' },
  { label: 'Medium', desc: 'Balanced warmth' },
  { label: 'Spicy', desc: 'Authentic fire' },
]

function calculateDuration(opensAt, closesAt) {
  if (!opensAt || !closesAt) return ''
  const [h1, m1] = opensAt.split(':').map(Number)
  const [h2, m2] = closesAt.split(':').map(Number)
  let diff = (h2 * 60 + m2) - (h1 * 60 + m1)
  if (diff < 0) diff += 24 * 60
  const h = Math.floor(diff / 60)
  const m = diff % 60
  if (h === 0) return `${m}m window`
  return m === 0 ? `${h}h window` : `${h}h ${m}m window`
}

export default function VendorProfile() {
  const { profile, setProfile, isOpen, setIsOpen, loading } = useVendorStatus()
  const [form, setForm] = useState(profile)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!loading && profile) {
      setForm(profile)
    }
  }, [loading, profile])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setSaved(false)
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function validate() {
    const next = {}
    if (!form.truckName?.trim()) next.truckName = 'Enter your food truck name'
    if (!form.tagline?.trim()) next.tagline = 'Add a short tagline for customer discovery'
    if (!/^\d{10}$/.test(String(form.phone || '').trim())) {
      next.phone = 'Enter a valid 10-digit phone number'
    }
    if (!form.parkedAt?.trim()) next.parkedAt = 'Specify today’s parked location'
    if (form.opensAt && form.closesAt && form.opensAt >= form.closesAt) {
      next.closesAt = 'Closing time must be after opening time'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setSaveError('')
    try {
      await setProfile(form)
      setSaved(true)
    } catch (err) {
      setSaveError(err.message || 'Could not save your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(profile)
  const operatingWindow = calculateDuration(form.opensAt, form.closesAt)

  return (
    <VendorLayout
      title="Truck Profile"
      subtitle="Manage your food truck identity, customer search tags, and live operating hours"
      actions={
        <div className="vp-head-actions">
          {dirty && <span className="vp-dirty-pill">Unsaved changes</span>}
          <button
            type="button"
            className="vp-head-save-btn"
            onClick={handleSubmit}
            disabled={!dirty || saving}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      }
    >
      {saved && !dirty && !saveError && (
        <div className="vp-banner is-success">
          <span>Profile changes updated and live for customer search.</span>
        </div>
      )}

      {saveError && (
        <div className="vp-banner is-error">
          <span>{saveError}</span>
        </div>
      )}

      <form className="vp-grid" onSubmit={handleSubmit} noValidate>
        {/* ─── LEFT COLUMN: EDIT PANELS ─── */}
        <div className="vp-main-col">
          {/* PANEL 1: IDENTITY */}
          <section className="vp-card">
            <div className="vp-card-header">
              <div className="vp-card-title-row">
                <h2 className="vp-card-title">1. Truck Identity</h2>
                <span className="vp-card-badge">Public Info</span>
              </div>
              <p className="vp-card-desc">
                Your truck name and tagline are what customers search for on the platform.
              </p>
            </div>

            <div className="vp-fields-stack">
              <div className="vp-field">
                <label className="vp-label" htmlFor="truckName">
                  Truck Name <span className="vp-req">*</span>
                </label>
                <input
                  id="truckName"
                  type="text"
                  className={`vp-input ${errors.truckName ? 'is-invalid' : ''}`}
                  value={form.truckName || ''}
                  onChange={(e) => update('truckName', e.target.value)}
                  placeholder="e.g. Spice Route Express"
                />
                {errors.truckName && <span className="vp-error-text">{errors.truckName}</span>}
              </div>

              <div className="vp-field">
                <div className="vp-label-split">
                  <label className="vp-label" htmlFor="tagline">
                    Tagline & Specialties <span className="vp-req">*</span>
                  </label>
                  <span className="vp-counter">
                    {(form.tagline || '').length}/60
                  </span>
                </div>
                <input
                  id="tagline"
                  type="text"
                  maxLength={60}
                  className={`vp-input ${errors.tagline ? 'is-invalid' : ''}`}
                  value={form.tagline || ''}
                  onChange={(e) => update('tagline', e.target.value)}
                  placeholder="e.g. Authentic Wood-Fired Rolls & Street Bowls"
                />
                <span className="vp-helper-text">
                  Matches customer search keywords and appears directly on your listing card.
                </span>
                {errors.tagline && <span className="vp-error-text">{errors.tagline}</span>}
              </div>

              <div className="vp-field">
                <label className="vp-label" htmlFor="phone">
                  Contact Phone Number <span className="vp-req">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  className={`vp-input ${errors.phone ? 'is-invalid' : ''}`}
                  value={form.phone || ''}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="9876543210"
                />
                <span className="vp-helper-text">
                  Direct 10-digit line used for urgent order queries and verification.
                </span>
                {errors.phone && <span className="vp-error-text">{errors.phone}</span>}
              </div>
            </div>
          </section>

          {/* PANEL 2: DISCOVERY & CUISINES */}
          <section className="vp-card">
            <div className="vp-card-header">
              <div className="vp-card-title-row">
                <h2 className="vp-card-title">2. Discovery & Cuisines</h2>
                <span className="vp-card-badge">Filter Tags</span>
              </div>
              <p className="vp-card-desc">
                Select accurate tags so diners looking for your cuisine can easily discover you.
              </p>
            </div>

            <div className="vp-fields-stack">
              <div className="vp-field">
                <label className="vp-label">Primary Cuisine</label>
                <div className="vp-chips-wrap">
                  {CUISINES.map((c) => {
                    const isSelected = form.cuisine === c
                    return (
                      <button
                        key={c}
                        type="button"
                        className={`vp-chip-btn ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => update('cuisine', c)}
                      >
                        {c}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="vp-field">
                <label className="vp-label">Spice Profile</label>
                <div className="vp-spice-grid">
                  {SPICE_LEVELS.map((sp) => {
                    const isSelected = form.spice === sp.label
                    return (
                      <div
                        key={sp.label}
                        className={`vp-spice-card ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => update('spice', sp.label)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="vp-spice-top">
                          <span className="vp-spice-name">{sp.label}</span>
                        </div>
                        <span className="vp-spice-desc">{sp.desc}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="vp-field">
                <div
                  className={`vp-toggle-card ${form.vegOnly ? 'is-active' : ''}`}
                  onClick={() => update('vegOnly', !form.vegOnly)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="vp-toggle-text">
                    <span className="vp-toggle-title">100% Pure Vegetarian Food Truck</span>
                    <span className="vp-toggle-sub">
                      Labels your truck as pure vegetarian in customer search results
                    </span>
                  </div>
                  <div className={`vp-switch ${form.vegOnly ? 'is-on' : ''}`}>
                    <span className="vp-switch-knob" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PANEL 3: LOCATION & HOURS */}
          <section className="vp-card">
            <div className="vp-card-header">
              <div className="vp-card-title-row">
                <h2 className="vp-card-title">3. Operating Schedule & Location</h2>
                <span className="vp-card-badge">Daily Timings</span>
              </div>
              <p className="vp-card-desc">
                Keep your location and hours updated so customers know when and where to visit.
              </p>
            </div>

            <div className="vp-fields-stack">
              <div className="vp-field">
                <label className="vp-label" htmlFor="parkedAt">
                  Parked Station Today <span className="vp-req">*</span>
                </label>
                <input
                  id="parkedAt"
                  type="text"
                  className={`vp-input ${errors.parkedAt ? 'is-invalid' : ''}`}
                  value={form.parkedAt || ''}
                  onChange={(e) => update('parkedAt', e.target.value)}
                  placeholder="e.g. ITPL Main Gate, Whitefield"
                />
                <span className="vp-helper-text">
                  Displayed on customer tracking maps and search listings.
                </span>
                {errors.parkedAt && <span className="vp-error-text">{errors.parkedAt}</span>}
              </div>

              <div className="vp-hours-grid">
                <div className="vp-field">
                  <label className="vp-label" htmlFor="opensAt">
                    Opening Time
                  </label>
                  <input
                    id="opensAt"
                    type="time"
                    className="vp-input"
                    value={form.opensAt || '16:00'}
                    onChange={(e) => update('opensAt', e.target.value)}
                  />
                </div>

                <div className="vp-field">
                  <label className="vp-label" htmlFor="closesAt">
                    Closing Time
                  </label>
                  <input
                    id="closesAt"
                    type="time"
                    className={`vp-input ${errors.closesAt ? 'is-invalid' : ''}`}
                    value={form.closesAt || '23:00'}
                    onChange={(e) => update('closesAt', e.target.value)}
                  />
                  {errors.closesAt && <span className="vp-error-text">{errors.closesAt}</span>}
                </div>
              </div>

              {operatingWindow && (
                <div className="vp-window-info">
                  <span>Scheduled service: <strong>{operatingWindow}</strong> ({form.opensAt} – {form.closesAt})</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ─── RIGHT COLUMN: PREVIEW & LIVE CONTROLS ─── */}
        <aside className="vp-side-col">
          <div className="vp-sticky-wrap">
            <section className="vp-card vp-preview-card">
              <div className="vp-preview-card-head">
                <div className="vp-preview-badge">Live Preview</div>
                <span className="vp-preview-sub">How diners see your truck in search</span>
              </div>

              {/* LIVE CUSTOMER CARD */}
              <div className="vp-customer-card">
                <div className="vp-cust-top">
                  <div className="vp-cust-info">
                    <div className="vp-cust-name-row">
                      <h3 className="vp-cust-name">
                        {form.truckName || 'Your Truck Name'}
                      </h3>
                      <div className="vp-cust-rating">
                        <span>4.8</span>
                      </div>
                    </div>

                    <p className="vp-cust-tagline">
                      {form.tagline || 'Your tagline and signature dishes appear here'}
                    </p>
                  </div>
                </div>

                <div className="vp-cust-meta">
                  <span className="vp-cust-meta-item">
                    {form.parkedAt || 'Location not set'}
                  </span>
                  <span className="vp-meta-sep">/</span>
                  <span className="vp-cust-meta-item">
                    {form.opensAt} - {form.closesAt}
                  </span>
                </div>

                <div className="vp-cust-tags">
                  <span className="vp-tag is-cuisine">{form.cuisine || 'Street Food'}</span>
                  <span className="vp-tag is-spice">{form.spice || 'Medium'}</span>
                  {form.vegOnly && <span className="vp-tag is-veg">Pure Veg</span>}
                </div>

                <div className="vp-cust-footer">
                  <div className="vp-cust-status">
                    <span>{isOpen ? 'Taking Orders' : 'Temporarily Closed'}</span>
                  </div>
                  <span className="vp-cust-distance">1.2 km / 15m</span>
                </div>
              </div>

              {/* OPERATING STATUS TOGGLE */}
              <div className="vp-status-toggle-box">
                <div className="vp-status-toggle-info">
                  <span className="vp-status-toggle-title">
                    {isOpen ? 'Currently Accepting Orders' : 'Currently Closed'}
                  </span>
                  <span className="vp-status-toggle-desc">
                    {isOpen
                      ? 'Your truck is visible in search and accepting orders.'
                      : 'Orders are paused and your truck is hidden from customer listings.'}
                  </span>
                </div>
                <button
                  type="button"
                  className={`vp-quick-toggle-btn ${isOpen ? 'is-open' : 'is-closed'}`}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? 'Close Truck' : 'Open Truck'}
                </button>
              </div>
            </section>
          </div>
        </aside>
      </form>
    </VendorLayout>
  )
}
