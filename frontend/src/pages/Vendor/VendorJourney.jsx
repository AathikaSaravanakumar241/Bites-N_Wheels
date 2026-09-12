import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import VendorLayout from './VendorLayout.jsx'
import { get, post, describeError } from '../../api.js'
import { IconMap } from '../../icons.jsx'
import './VendorJourney.css'

const SETUP_URL = '/api/v1/truck/today-setup'

function nextHalfHour(offsetMinutes = 0) {
  const d = new Date(Date.now() + offsetMinutes * 60000)
  d.setMinutes(d.getMinutes() >= 30 ? 60 : 30, 0, 0)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function addMinutes(hhmm, mins) {
  const [h, m] = String(hhmm).split(':').map(Number)
  const total = (h * 60 + m + mins) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function durationText(arr, dep) {
  if (!arr || !dep) return ''
  const [h1, m1] = arr.split(':').map(Number)
  const [h2, m2] = dep.split(':').map(Number)
  let diff = (h2 * 60 + m2) - (h1 * 60 + m1)
  if (diff < 0) diff += 24 * 60
  const hrs = Math.floor(diff / 60)
  const mins = diff % 60
  if (hrs === 0) return `${mins}m`
  if (mins === 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}

export default function VendorJourney() {
  const [stations, setStations] = useState([])
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [query, setQuery] = useState('')
  
  // Single location selected at a time
  const [selectedStationId, setSelectedStationId] = useState(null)
  const [newArrival, setNewArrival] = useState(nextHalfHour(30))
  const [newDeparture, setNewDeparture] = useState(addMinutes(nextHalfHour(30), 90))

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

  const selectedStation = useMemo(() => {
    return stations.find((s) => s.stationId === selectedStationId) || null
  }, [stations, selectedStationId])

  function handleSelectStation(station) {
    if (selectedStationId === station.stationId) {
      setSelectedStationId(null)
    } else {
      setSelectedStationId(station.stationId)
      const lastStop = stops[stops.length - 1]
      const arrival = lastStop ? lastStop.departureTime : nextHalfHour(30)
      setNewArrival(arrival)
      setNewDeparture(addMinutes(arrival, 90))
    }
  }

  function handleAddSelectedStop() {
    if (!selectedStation) return

    setStops((cur) => [
      ...cur,
      {
        stationId: selectedStation.stationId,
        name: selectedStation.name,
        arrivalTime: newArrival,
        departureTime: newDeparture,
      },
    ])

    setSelectedStationId(null)
    setSaved('')
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
  }

  const problems = useMemo(() => {
    const list = []
    stops.forEach((s, i) => {
      if (s.departureTime <= s.arrivalTime) {
        list.push(`${s.name}: Departure time must be after arrival time.`)
      }
      const prev = stops[i - 1]
      if (prev && s.arrivalTime < prev.departureTime) {
        list.push(`${s.name}: Arrives before leaving ${prev.name} (${prev.departureTime}).`)
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
      setSaved(`Journey published successfully — ${n} stop${n === 1 ? '' : 's'} active for today.`)
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
      title="Journey Planner"
      subtitle="Select your locations and configure your route schedule for today"
      actions={
        <button
          type="button"
          className="vj-save-btn"
          onClick={saveJourney}
          disabled={saving || stops.length === 0 || problems.length > 0}
        >
          {saving ? 'Publishing…' : 'Publish Route'}
        </button>
      }
    >
      {error && <div className="vj-alert is-error">{error}</div>}
      {saved && <div className="vj-alert is-ok">{saved}</div>}

      <div className="vj-layout-grid">
        {/* ─── SECTION 1: SELECT LOCATION (FIRST SECTION) ─── */}
        <section className="vj-section-panel">
          <div className="vj-panel-header">
            <h2 className="vj-panel-title">1. Select Location</h2>
            <span className="vj-panel-sub">Choose one location at a time to add to your route</span>
          </div>

          <div className="vj-search-wrap">
            <input
              type="search"
              className="vj-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by area name…"
            />
          </div>

          <div className="vj-locations-list">
            {loading ? (
              <p className="vj-muted-msg">Loading available areas…</p>
            ) : available.length === 0 ? (
              <p className="vj-muted-msg">
                {query ? 'No matching locations found.' : 'All locations are already added to your route.'}
              </p>
            ) : (
              available.map((station) => {
                const isSelected = selectedStationId === station.stationId
                return (
                  <div
                    key={station.stationId}
                    className={`vj-location-item ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleSelectStation(station)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="vj-location-main">
                      <span className="vj-location-icon" aria-hidden="true">
                        <IconMap size={18} />
                      </span>
                      <div className="vj-location-text">
                        <span className="vj-location-name">{station.name}</span>
                        <span className="vj-location-status">
                          {isSelected ? 'Selected' : 'Click to select'}
                        </span>
                      </div>
                    </div>

                    <span className={`vj-select-radio ${isSelected ? 'is-checked' : ''}`} />
                  </div>
                )
              })
            )}
          </div>

          {/* Schedule picker for the selected location */}
          {selectedStation && (
            <div className="vj-schedule-drawer">
              <div className="vj-drawer-header">
                <span className="vj-drawer-title">Schedule for {selectedStation.name}</span>
              </div>

              <div className="vj-drawer-times">
                <div className="vj-time-block">
                  <label className="vj-time-label">Arrival</label>
                  <input
                    type="time"
                    className="vj-time-input"
                    value={newArrival}
                    onChange={(e) => setNewArrival(e.target.value)}
                  />
                </div>

                <span className="vj-drawer-arrow">→</span>

                <div className="vj-time-block">
                  <label className="vj-time-label">Departure</label>
                  <input
                    type="time"
                    className="vj-time-input"
                    value={newDeparture}
                    onChange={(e) => setNewDeparture(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="button"
                className="vj-add-stop-btn"
                onClick={handleAddSelectedStop}
              >
                Add {selectedStation.name} to Route
              </button>
            </div>
          )}
        </section>

        {/* ─── SECTION 2: ROUTE SCHEDULE (SECOND SECTION) ─── */}
        <section className="vj-section-panel">
          <div className="vj-panel-header">
            <div className="vj-panel-title-wrap">
              <h2 className="vj-panel-title">2. Route Schedule</h2>
              <span className="vj-count-badge">{stops.length} Stops</span>
            </div>
            <span className="vj-panel-sub">Review order, timing, and sequence of stops</span>
          </div>

          {stops.length === 0 ? (
            <div className="vj-empty-box">
              <h3 className="vj-empty-title">No stops scheduled yet</h3>
              <p className="vj-empty-desc">
                Select a location from Section 1 on the left to schedule your first stop.
              </p>
            </div>
          ) : (
            <div className="vj-stops-list">
              {stops.map((stop, i) => (
                <div key={stop.stationId} className="vj-stop-card">
                  <div className="vj-stop-num">#{i + 1}</div>

                  <div className="vj-stop-main">
                    <div className="vj-stop-header-row">
                      <span className="vj-stop-title">{stop.name}</span>
                      <span className="vj-stop-dur-pill">
                        {durationText(stop.arrivalTime, stop.departureTime)}
                      </span>
                    </div>

                    <div className="vj-time-row">
                      <div className="vj-time-block">
                        <label className="vj-time-label">Arrival</label>
                        <input
                          type="time"
                          className="vj-time-input"
                          value={stop.arrivalTime}
                          onChange={(e) => updateStop(i, 'arrivalTime', e.target.value)}
                        />
                      </div>

                      <span className="vj-time-arrow" aria-hidden="true">→</span>

                      <div className="vj-time-block">
                        <label className="vj-time-label">Departure</label>
                        <input
                          type="time"
                          className="vj-time-input"
                          value={stop.departureTime}
                          onChange={(e) => updateStop(i, 'departureTime', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="vj-stop-reorder">
                    <button
                      type="button"
                      className="vj-move-btn"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="vj-move-btn"
                      onClick={() => move(i, 1)}
                      disabled={i === stops.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="vj-del-btn"
                      onClick={() => removeStop(i)}
                      title={`Remove ${stop.name}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {problems.length > 0 && (
            <div className="vj-problems-card">
              <span className="vj-problem-title">Schedule conflicts detected:</span>
              <ul className="vj-problems-list">
                {problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="vj-menu-tip">
            <span className="vj-tip-text">Confirm your menu items before publishing your route today.</span>
            <Link to="/vendor/menu" className="vj-tip-link">
              Check menu items →
            </Link>
          </div>
        </section>
      </div>
    </VendorLayout>
  )
}
