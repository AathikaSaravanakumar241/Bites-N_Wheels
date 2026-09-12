import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import VendorLayout from './VendorLayout.jsx'
import { get, post, describeError } from '../../api.js'
import './VendorJourney.css'


const SETUP_URL = '/api/v1/truck/today-setup'

function nextHalfHour(offsetMinutes = 0) {
  const d = new Date(Date.now() + offsetMinutes * 60000)
  d.setMinutes(d.getMinutes() >= 30 ? 60 : 30, 0, 0)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function VendorJourney() {
  const [stations, setStations] = useState([])
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [pick, setPick] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    get('/api/v1/stations', false)
      .then((d) => setStations(Array.isArray(d) ? d : []))
      .catch((err) => setError(describeError(err, 'Could not load areas.')))
      .finally(() => setLoading(false))
  }, [])

  const available = useMemo(() => {
    const taken = new Set(stops.map((s) => s.stationId))
    const q = query.trim().toLowerCase()
    return stations
      .filter((s) => !taken.has(s.stationId))
      .filter((s) => (q ? s.name.toLowerCase().includes(q) : true))
  }, [stations, stops, query])

  function addStop() {
    const station = stations.find((s) => String(s.stationId) === String(pick))
    if (!station) return
    const last = stops[stops.length - 1]
    const arrival = last ? last.departureTime : nextHalfHour(30)
    setStops((cur) => [
      ...cur,
      {
        stationId: station.stationId,
        name: station.name,
        arrivalTime: arrival,
        departureTime: addMinutes(arrival, 90),
      },
    ])
    setPick('')
    setQuery('')
    setSaved('')
  }

  function addMinutes(hhmm, mins) {
    const [h, m] = String(hhmm).split(':').map(Number)
    const total = (h * 60 + m + mins) % (24 * 60)
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }

  function updateStop(index, field, value) {
    setStops((cur) => cur.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
    setSaved('')
  }

  function removeStop(index) {
    setStops((cur) => cur.filter((_, i) => i !== index))
    setSaved('')
  }

  function move(index, delta) {
    setStops((cur) => {
      const next = [...cur]
      const target = index + delta
      if (target < 0 || target >= next.length) return cur
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setSaved('')
  }  const problems = useMemo(() => {
    const list = []
    stops.forEach((s, i) => {
      if (s.departureTime <= s.arrivalTime) {
        list.push(`${s.name}: departure must be after arrival.`)
      }
      const prev = stops[i - 1]
      if (prev && s.arrivalTime < prev.departureTime) {
        list.push(`${s.name}: you are still at ${prev.name} until ${prev.departureTime}.`)
      }
    })
    return list
  }, [stops])

  async function saveJourney() {
    if (stops.length === 0 || problems.length > 0) return
    setSaving(true)
    setError('')
    setSaved('')
    try {
      const payload = stops.map((s) => ({
        stationId: s.stationId,
        arrivalTime: `${s.arrivalTime}:00`,
        departureTime: `${s.departureTime}:00`,
      }))
      const result = await post(SETUP_URL, payload)
      const n = Array.isArray(result) ? result.length : stops.length
      setSaved(`Journey saved — ${n} stop${n === 1 ? '' : 's'} published for today.`)
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        setError('You need to be logged in as a truck owner to publish a journey.')
      } else {
        setError(err.message || 'Could not save the journey.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <VendorLayout
      title="Today's journey"
      subtitle="Where you are going today, and when you get there"
      actions={
        <button
          type="button"
          className="vj-save"
          onClick={saveJourney}
          disabled={saving || stops.length === 0 || problems.length > 0}
        >
          {saving ? 'Publishing…' : 'Publish journey'}
        </button>
      }
    >
      {error && <div className="vj-alert is-error">{error}</div>}
      {saved && <div className="vj-alert is-ok">{saved}</div>}

      <div className="vj-grid">
        <section className="vj-panel">
          <h2 className="vj-panel-title">
            Stops
            <span className="vj-count">{stops.length}</span>
          </h2>
          <p className="vj-hint">
            Customers in these areas will see your food today. Publishing
            replaces your whole plan for today.
          </p>

          {stops.length === 0 ? (
            <p className="vj-empty">
              No stops yet. Add the first area you are heading to.
            </p>
          ) : (
            <ol className="vj-stops">
              {stops.map((stop, i) => (
                <li key={stop.stationId} className="vj-stop">
                  <span className="vj-seq">{i + 1}</span>

                  <div className="vj-stop-body">
                    <span className="vj-stop-name">{stop.name}</span>
                    <div className="vj-times">
                      <label>
                        <span>Arrive</span>
                        <input
                          type="time"
                          value={stop.arrivalTime}
                          onChange={(e) => updateStop(i, 'arrivalTime', e.target.value)}
                        />
                      </label>
                      <label>
                        <span>Leave</span>
                        <input
                          type="time"
                          value={stop.departureTime}
                          onChange={(e) => updateStop(i, 'departureTime', e.target.value)}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="vj-stop-actions">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === stops.length - 1} aria-label="Move down">↓</button>
                    <button type="button" className="vj-del" onClick={() => removeStop(i)} aria-label={`Remove ${stop.name}`}>✕</button>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {problems.length > 0 && (
            <ul className="vj-problems">
              {problems.map((p) => <li key={p}>{p}</li>)}
            </ul>
          )}
        </section>

        <aside className="vj-side">
          <section className="vj-panel">
            <h2 className="vj-panel-title">Add a stop</h2>

            {loading ? (
              <p className="vj-hint">Loading areas…</p>
            ) : (
              <>
                <label className="vj-field">
                  <span>Search areas</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tambaram, Velachery…"
                  />
                </label>

                <label className="vj-field">
                  <span>Area</span>
                  <select value={pick} onChange={(e) => setPick(e.target.value)} size={8}>
                    {available.length === 0 ? (
                      <option value="" disabled>No areas left</option>
                    ) : (
                      available.map((s) => (
                        <option key={s.stationId} value={s.stationId}>{s.name}</option>
                      ))
                    )}
                  </select>
                </label>

                <button type="button" className="vj-add" onClick={addStop} disabled={!pick}>
                  Add stop
                </button>
              </>
            )}
          </section>

          <section className="vj-panel">
            <h2 className="vj-panel-title">Before you publish</h2>
            <p className="vj-hint">
              Your menu decides what customers can order at these stops.
            </p>
            <Link to="/vendor/menu" className="vj-link">Check your menu →</Link>
          </section>
        </aside>
      </div>
    </VendorLayout>
  )
}
