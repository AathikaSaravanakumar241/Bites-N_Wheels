import { useEffect, useState } from 'react'
import VendorLayout from './VendorLayout.jsx'
import { useVendorStatus } from './useVendorStatus.jsx'
import './VendorProfile.css'

const CUISINES = ['South Indian', 'North Indian', 'Chinese', 'Italian', 'Mexican']
const SPICE_LEVELS = ['Mild', 'Medium', 'Spicy']

export default function VendorProfile() {
  const { profile, setProfile, isOpen, loading } = useVendorStatus()

  const [form, setForm] = useState(profile)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')  useEffect(() => {
    if (loading) setForm(profile)
  }, [loading, profile])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setSaved(false)
  }

  function validate() {
    const next = {}
    if (!form.truckName.trim()) next.truckName = 'Customers need a name to search for'
    if (!form.tagline.trim()) next.tagline = 'The tagline is what customers search against'
    if (!/^\d{10}$/.test(String(form.phone).trim())) next.phone = 'Enter a 10-digit phone number'
    if (!form.parkedAt.trim()) next.parkedAt = 'Tell customers where to find you'
    if (form.opensAt >= form.closesAt) next.closesAt = 'Closing time must be after opening time'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setSaveError('')
    try {
      await setProfile(form)
      setSaved(true)
    } catch (err) {      setSaveError(err.message || 'Could not save your profile. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(profile)

  return (
    <VendorLayout
      title="Truck profile"
      subtitle="What customers see, and which filters you show up in"
    >
      <form className="vp" onSubmit={handleSubmit} noValidate>
        <div className="vp-left">
          {/* ---------------- IDENTITY ---------------- */}
          <section className="vp-panel">
            <h2 className="vp-panel-title">Identity</h2>

            <label className="vp-field">
              <span>Truck name</span>
              <input
                type="text"
                value={form.truckName}
                onChange={(e) => update('truckName', e.target.value)}
                aria-invalid={!!errors.truckName}
              />
              {errors.truckName && <small className="vp-error">{errors.truckName}</small>}
            </label>

            <label className="vp-field">
              <span>Tagline</span>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => update('tagline', e.target.value)}
                maxLength={60}
                aria-invalid={!!errors.tagline}
              />
              <small className="vp-hint">
                {form.tagline.length}/60 — customer search matches this text
              </small>
              {errors.tagline && <small className="vp-error">{errors.tagline}</small>}
            </label>

            <label className="vp-field">
              <span>Contact number</span>
              <input
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <small className="vp-error">{errors.phone}</small>}
            </label>
          </section>

          {/* ---------------- DISCOVERY ---------------- */}
          <section className="vp-panel">
            <h2 className="vp-panel-title">Discovery</h2>
            <p className="vp-note">
              These decide which customer filters you appear in. Pick what you
              actually serve — a wrong tag means orders you cannot fill.
            </p>

            <label className="vp-field">
              <span>Cuisine</span>
              <select value={form.cuisine} onChange={(e) => update('cuisine', e.target.value)}>
                {CUISINES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            <label className="vp-field">
              <span>Spice level</span>
              <select value={form.spice} onChange={(e) => update('spice', e.target.value)}>
                {SPICE_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label className="vp-check">
              <input
                type="checkbox"
                checked={form.vegOnly}
                onChange={(e) => update('vegOnly', e.target.checked)}
              />
              Pure veg truck
            </label>
          </section>

          {/* ---------------- LOCATION + HOURS ---------------- */}
          <section className="vp-panel">
            <h2 className="vp-panel-title">Location and hours</h2>

            <label className="vp-field">
              <span>Parked at today</span>
              <input
                type="text"
                value={form.parkedAt}
                onChange={(e) => update('parkedAt', e.target.value)}
                aria-invalid={!!errors.parkedAt}
              />
              {errors.parkedAt && <small className="vp-error">{errors.parkedAt}</small>}
            </label>

            <div className="vp-times">
              <label className="vp-field">
                <span>Opens at</span>
                <input
                  type="time"
                  value={form.opensAt}
                  onChange={(e) => update('opensAt', e.target.value)}
                />
              </label>

              <label className="vp-field">
                <span>Closes at</span>
                <input
                  type="time"
                  value={form.closesAt}
                  onChange={(e) => update('closesAt', e.target.value)}
                  aria-invalid={!!errors.closesAt}
                />
                {errors.closesAt && <small className="vp-error">{errors.closesAt}</small>}
              </label>
            </div>
          </section>
        </div>

        {/* ---------------- PREVIEW ---------------- */}
        <aside className="vp-side">
          <section className="vp-panel">
            <h2 className="vp-panel-title">How customers see you</h2>

            <article className="vp-preview">
              <div className="vp-preview-top">
                <h3>{form.truckName || 'Your truck name'}</h3>
                <span className="vp-rating">★ 4.6</span>
              </div>
              <p className="vp-preview-tagline">
                {form.tagline || 'Your tagline appears here'}
              </p>
              <div className="vp-preview-meta">
                <span>1.2 km</span><span>·</span>
                <span>18 min</span><span>·</span>
                <span>{form.vegOnly ? 'Veg' : 'Veg and non-veg'}</span>
              </div>
              <div className="vp-tags">
                <span className="vp-tag">{form.cuisine}</span>
                <span className="vp-tag">{form.spice}</span>
                {form.vegOnly && <span className="vp-tag">Pure veg</span>}
              </div>
            </article>

            {!isOpen && (
              <p className="vp-warn">
                You are closed, so this card is hidden from customers entirely.
              </p>
            )}

            <button type="submit" className="vp-save" disabled={!dirty || saving}>
              {saving ? 'Saving…' : dirty ? 'Save profile' : 'Saved'}
            </button>

            {saved && !dirty && !saveError && <p className="vp-saved">Profile updated.</p>}
            {saveError && <p className="vp-error">{saveError}</p>}
          </section>
        </aside>
      </form>
    </VendorLayout>
  )
}
