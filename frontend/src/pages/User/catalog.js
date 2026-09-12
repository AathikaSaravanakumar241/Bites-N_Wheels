import { get } from '../../api.js'


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
      status: t.status,      rating: 4.5,
      distanceKm: 1.0,
      etaMin: 20,
    }))  const byName = new Map(trucks.map((t) => [t.name, t]))
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
  })  const itemsByTruck = new Map()
  items.forEach((i) => {
    if (!itemsByTruck.has(i.truckId)) itemsByTruck.set(i.truckId, [])
    itemsByTruck.get(i.truckId).push(i)
  })
  trucks.forEach((t) => {
    t.items = itemsByTruck.get(t.id) ?? []
  })  const counts = new Map()
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

