import { useEffect, useMemo, useState } from 'react'
import { fetchStations, useArea } from './useArea.js'
import { describeError } from '../../api.js'
import { IconSearch, IconMapPin, IconX, IconCheck } from '../../icons.jsx'
import './AreaPicker.css'

export default function AreaPicker({ onClose }) {
  const { area, setArea } = useArea()
  const [stations, setStations] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStations()
      .then(setStations)
      .catch((err) => setError(describeError(err, 'Could not load areas.')))
      .finally(() => setLoading(false))
  }, [])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return stations
    return stations.filter((s) => s.name.toLowerCase().includes(q))
  }, [stations, query])

  function choose(station) {
    setArea({ id: station.stationId, name: station.name })
    onClose?.()
  }

  return (
    <div className="ap">
      <div className="ap-panel">
        <div className="ap-head">
          <div>
            <h1 className="ap-title">Where are you?</h1>
            <p className="ap-sub">
              We only show food from trucks visiting your area today.
            </p>
          </div>
          {area && (
            <button type="button" className="ap-close" onClick={onClose} aria-label="Close">
              <IconX size={16} />
            </button>
          )}
        </div>

        <div className="ap-search">
          <IconSearch size={15} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your area…"
            aria-label="Search areas"
            autoFocus
          />
        </div>

        {error && <p className="ap-error">{error}</p>}

        {loading ? (
          <div className="ap-skeletons">
            {[...Array(5)].map((_, i) => <div key={i} className="ap-skeleton" />)}
          </div>
        ) : shown.length === 0 ? (
          <p className="ap-muted">No area matches "{query}".</p>
        ) : (
          <ul className="ap-list">
            {shown.map((s) => (
              <li key={s.stationId}>
                <button
                  type="button"
                  className={area?.id === s.stationId ? 'ap-item is-active' : 'ap-item'}
                  onClick={() => choose(s)}
                >
                  <IconMapPin size={14} />
                  <span className="ap-item-name">{s.name}</span>
                  {area?.id === s.stationId && (
                    <span className="ap-current">
                      <IconCheck size={12} /> Current
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
