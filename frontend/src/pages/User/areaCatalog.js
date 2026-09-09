import { get } from '../../api.js'
import { slugify, iconFor } from './catalog.js'

/* ---------------------------------------------------------------
   AREA CATALOG

   One request per area: GET /api/v1/stations/{id}/trucks returns every
   truck scheduled at that area TODAY with the food it is carrying, so
   the customer home page is a single round trip.

   Everything the customer sees is scoped to the chosen area - that is
   the whole point of the flow. A truck that is not visiting your area
   today should never appear, no matter what it sells.
   --------------------------------------------------------------- */

/** "09:00:00" -> "9:00 AM". Backend sends LocalTime. */
export function formatTime(t) {
  if (!t) return ''
  const [h, m] = String(t).split(':')
  const hour = Number(h)
  if (Number.isNaN(hour)) return String(t)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}:${m ?? '00'} ${suffix}`
}

/** Has this truck already left the area? */
export function windowState(arrival, departure) {
  const now = new Date()
  const mins = now.getHours() * 60 + now.getMinutes()
  const toMins = (t) => {
    if (!t) return null
    const [h, m] = String(t).split(':').map(Number)
    return h * 60 + (m || 0)
  }
  const a = toMins(arrival)
  const d = toMins(departure)
  if (a === null) return 'unknown'
  if (d !== null && mins > d) return 'left'
  if (mins >= a) return 'here'
  return 'upcoming'
}

/**
 * Loads everything for one area.
 * Returns { trucks, items, categories } where every item carries the
 * truck and arrival details needed to render it.
 */
export async function fetchAreaCatalog(stationId) {
  const raw = await get(`/api/v1/stations/${stationId}/trucks`, false)
  const rows = Array.isArray(raw) ? raw : []

  const trucks = rows.map((r) => ({
    id: r.truckId,
    name: r.truckName,
    tagline: r.tagline ?? '',
    truckStatus: r.truckStatus,
    scheduleId: r.scheduleId,
    arrivalTime: r.arrivalTime,
    departureTime: r.departureTime,
    scheduleStatus: r.scheduleStatus,
    state: windowState(r.arrivalTime, r.departureTime),
    items: [],
  }))

  const items = []
  rows.forEach((r, idx) => {
    const truck = trucks[idx]
    const list = Array.isArray(r.items) ? r.items : []
    truck.items = list.map((i) => {
      const item = {
        id: i.itemId,
        name: i.name,
        desc: i.description ?? '',
        price: Number(i.price),
        veg: i.foodType === 'VEG',
        tag: i.categoryTag ?? '',
        category: slugify(i.categoryTag),
        available: i.available !== false,
        stock: i.stockQuantity ?? 0,
        truckId: truck.id,
        truckName: truck.name,
        truckTagline: truck.tagline,
        arrivalTime: truck.arrivalTime,
        departureTime: truck.departureTime,
        scheduleStatus: truck.scheduleStatus,
        state: truck.state,
      }
      items.push(item)
      return item
    })
  })

  // Categories that actually have food arriving in this area.
  const counts = new Map()
  items.forEach((i) => {
    if (!i.category) return
    const entry = counts.get(i.category) ?? { id: i.category, label: i.tag, count: 0 }
    entry.count += 1
    counts.set(i.category, entry)
  })
  const categories = [...counts.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .map((c) => ({ ...c, icon: iconFor(c.id) }))

  return { trucks, items, categories }
}

/**
 * The same dish is sold by several trucks, so the home page lists each
 * dish ONCE and records how many trucks bring it. Cheapest first.
 */
export function groupByDish(items) {
  const byName = new Map()
  items.forEach((i) => {
    const key = i.name.toLowerCase()
    const entry = byName.get(key) ?? {
      key,
      name: i.name,
      desc: i.desc,
      veg: i.veg,
      tag: i.tag,
      category: i.category,
      minPrice: i.price,
      truckCount: 0,
      earliest: i.arrivalTime,
    }
    entry.truckCount += 1
    entry.minPrice = Math.min(entry.minPrice, i.price)
    if (i.arrivalTime && (!entry.earliest || i.arrivalTime < entry.earliest)) {
      entry.earliest = i.arrivalTime
    }
    byName.set(key, entry)
  })
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))
}
