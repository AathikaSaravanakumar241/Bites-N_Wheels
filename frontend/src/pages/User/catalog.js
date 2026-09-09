import { get } from '../../api.js'

/* ---------------------------------------------------------------
   CATALOG

   Single loader for trucks + menu items, shared by UserHome and
   CategoryPage so the two can never disagree.

   Why this exists: the category tiles used to be a hardcoded list
   (pizza, waffles, tacos, noodles...) compared against the DB's
   category_tag column. Only 3 of 10 ever matched - "Burgers" vs
   "burger", "Rolls and Wraps" vs "rolls", and four real cuisines
   (South Indian, North Indian, Chinese, Street Food) had no tile at
   all. Categories are now DERIVED from the data, so a tag added in
   Supabase shows up automatically and a tile can never point at
   something that does not exist.

   Also replaces ~53 per-truck menu requests with one search call.
   --------------------------------------------------------------- */

/** "Rolls and Wraps" -> "rolls-and-wraps" (used as the URL segment). */
export function slugify(tag) {
  return String(tag ?? '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const ICONS = {
  'pizza':           '🍕',
  'biryani':         '🍛',
  'burgers':         '🍔',
  'burger':          '🍔',
  'desserts':        '🍩',
  'beverages':       '☕',
  'chinese':         '🍜',
  'south-indian':    '🥘',
  'north-indian':    '🍲',
  'street-food':     '🌮',
  'rolls-and-wraps': '🌯',
  'rolls':           '🌯',
  'noodles':         '🍜',
  'waffles':         '🧇',
  'ice-cream':       '🍦',
  'tacos':           '🌮',
}

export function iconFor(slug) {
  return ICONS[slug] ?? '🍽️'
}

/**
 * Loads everything the customer pages need in two requests.
 * Returns { trucks, items, categories } - all already normalised.
 */
export async function fetchCatalog() {
  const [trucksRaw, grouped] = await Promise.all([
    get('/api/v1/trucks', false),
    get('/api/v1/foods/search?q=', false),
  ])

  const trucks = (Array.isArray(trucksRaw) ? trucksRaw : [])
    .filter((t) => t.status !== 'INACTIVE')
    .map((t) => ({
      id: t.truckId,
      name: t.name,
      tagline: t.tagline ?? '',
      status: t.status,
      // Not in the DB yet - see note at the bottom of this file.
      rating: 4.5,
      distanceKm: 1.0,
      etaMin: 20,
    }))

  // The search endpoint groups items by truck NAME, so join on that.
  const byName = new Map(trucks.map((t) => [t.name, t]))
  const items = []

  Object.entries(grouped ?? {}).forEach(([truckName, list]) => {
    const truck = byName.get(truckName)
    if (!truck || !Array.isArray(list)) return

    list.forEach((i) => {
      if (i.available === false) return
      items.push({
        id: i.itemId,
        name: i.name,
        desc: i.description ?? '',
        price: Number(i.price),
        veg: i.foodType === 'VEG',
        tag: i.categoryTag ?? '',
        category: slugify(i.categoryTag),
        truckId: truck.id,
        truckName: truck.name,
        etaMin: truck.etaMin,
      })
    })
  })

  // Attach each truck's own items so pages can filter per truck.
  const itemsByTruck = new Map()
  items.forEach((i) => {
    if (!itemsByTruck.has(i.truckId)) itemsByTruck.set(i.truckId, [])
    itemsByTruck.get(i.truckId).push(i)
  })
  trucks.forEach((t) => {
    t.items = itemsByTruck.get(t.id) ?? []
  })

  // Categories that actually have food behind them, most items first.
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

/* NOTE for the team: rating, distanceKm and etaMin are placeholders.
   The truck table has no rating column, and distance/ETA need the
   station coordinates from /api/v1/trucks/{id}/stations/today plus the
   customer's location. Until then every truck shows 4.5 / 20 min, so
   "Fastest to reach you" is not really sorting by anything. */
