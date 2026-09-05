/* ---------------------------------------------------------------
   Single source of truth for mock trucks + their menus.
   UserHome and CategoryPage both read from here, so there is only
   one copy to delete when the real /api/trucks endpoint lands.
   --------------------------------------------------------------- */

export const CATEGORIES = [
  { id: 'pizza',    label: 'Pizza',     icon: '🍕' },
  { id: 'waffles',  label: 'Waffles',   icon: '🧇' },
  { id: 'burger',   label: 'Burger',    icon: '🍔' },
  { id: 'tacos',    label: 'Tacos',     icon: '🌮' },
  { id: 'biryani',  label: 'Biryani',   icon: '🍛' },
  { id: 'noodles',  label: 'Noodles',   icon: '🍜' },
  { id: 'rolls',    label: 'Rolls',     icon: '🌯' },
  { id: 'coffee',   label: 'Coffee',    icon: '☕' },
  { id: 'desserts', label: 'Desserts',  icon: '🍩' },
  { id: 'icecream', label: 'Ice Cream', icon: '🍦' },
]

export const CUISINES = ['South Indian', 'North Indian', 'Chinese', 'Italian', 'Mexican']
export const SPICE_LEVELS = ['Mild', 'Medium', 'Spicy']

export const TRUCKS = [
  {
    id: 1,
    name: 'Smoke & Slice',
    tagline: 'Wood-fired pizza from a converted van',
    cuisine: 'Italian', spice: 'Mild', veg: false,
    rating: 4.5, distanceKm: 2.1, etaMin: 25, isOpen: true,
    items: [
      { id: 101, name: 'Margherita',          price: 220, category: 'pizza',    veg: true,  desc: 'San Marzano, fior di latte, basil' },
      { id: 102, name: 'Spicy Chicken Pep',   price: 320, category: 'pizza',    veg: false, desc: 'Chicken pepperoni, chilli flakes' },
      { id: 103, name: 'Four Cheese',         price: 340, category: 'pizza',    veg: true,  desc: 'Mozzarella, cheddar, parmesan, blue' },
      { id: 104, name: 'Garlic Bread Sticks', price: 120, category: 'desserts', veg: true,  desc: 'Wood-fired, herb butter' },
      { id: 105, name: 'Cold Coffee',         price: 90,  category: 'coffee',   veg: true,  desc: 'Double shot, lightly sweet' },
    ],
  },
  {
    id: 2,
    name: 'Crust & Cruise',
    tagline: 'Thin-crust pizza, ready in ten',
    cuisine: 'Italian', spice: 'Medium', veg: false,
    rating: 4.2, distanceKm: 0.6, etaMin: 10, isOpen: true,
    items: [
      { id: 201, name: 'Classic Margherita',  price: 180, category: 'pizza',    veg: true,  desc: 'Thin crust, extra basil' },
      { id: 202, name: 'Paneer Tikka Pizza',  price: 260, category: 'pizza',    veg: true,  desc: 'Tandoori paneer, onion, capsicum' },
      { id: 203, name: 'Chicken Tikka Pizza', price: 290, category: 'pizza',    veg: false, desc: 'Malai chicken, mint drizzle' },
      { id: 204, name: 'Peri Peri Fries',     price: 110, category: 'burger',   veg: true,  desc: 'Crispy, tossed in peri peri' },
      { id: 205, name: 'Choco Lava Cup',      price: 130, category: 'desserts', veg: true,  desc: 'Warm centre, served in a cup' },
    ],
  },
  {
    id: 3,
    name: 'Napoli Nomad',
    tagline: 'Neapolitan dough, 48-hour proof',
    cuisine: 'Italian', spice: 'Mild', veg: true,
    rating: 4.8, distanceKm: 3.2, etaMin: 32, isOpen: true,
    items: [
      { id: 301, name: 'Marinara',        price: 200, category: 'pizza',    veg: true, desc: 'No cheese, oregano and garlic' },
      { id: 302, name: 'Diavola Veg',     price: 280, category: 'pizza',    veg: true, desc: 'Soy chorizo, chilli honey' },
      { id: 303, name: 'Tiramisu Cup',    price: 160, category: 'desserts', veg: true, desc: 'Mascarpone, espresso soak' },
      { id: 304, name: 'Espresso',        price: 70,  category: 'coffee',   veg: true, desc: 'Single origin' },
    ],
  },
  {
    id: 4,
    name: 'The Waffle Wagon',
    tagline: 'Belgian waffles and cold brew',
    cuisine: 'Italian', spice: 'Mild', veg: true,
    rating: 4.7, distanceKm: 1.2, etaMin: 20, isOpen: true,
    items: [
      { id: 401, name: 'Classic Waffle',   price: 150, category: 'waffles',  veg: true, desc: 'Maple syrup, butter' },
      { id: 402, name: 'Nutella Waffle',   price: 190, category: 'waffles',  veg: true, desc: 'Hazelnut spread, banana' },
      { id: 403, name: 'Cold Brew',        price: 120, category: 'coffee',   veg: true, desc: '18-hour steep' },
      { id: 404, name: 'Vanilla Scoop',    price: 90,  category: 'icecream', veg: true, desc: 'Madagascar vanilla' },
    ],
  },
  {
    id: 5,
    name: 'Wheels & Wok',
    tagline: 'Street-style Chinese, wok-tossed to order',
    cuisine: 'Chinese', spice: 'Spicy', veg: false,
    rating: 4.4, distanceKm: 0.8, etaMin: 15, isOpen: true,
    items: [
      { id: 501, name: 'Hakka Noodles',    price: 160, category: 'noodles', veg: true,  desc: 'Wok-tossed, burnt garlic' },
      { id: 502, name: 'Chicken Schezwan', price: 220, category: 'noodles', veg: false, desc: 'House schezwan, extra hot' },
      { id: 503, name: 'Veg Momos',        price: 90,  category: 'rolls',   veg: true,  desc: 'Steamed, chilli chutney' },
    ],
  },
  {
    id: 6,
    name: 'Biryani Boulevard',
    tagline: 'Dum biryani, slow-cooked every evening',
    cuisine: 'North Indian', spice: 'Spicy', veg: false,
    rating: 4.8, distanceKm: 1.6, etaMin: 22, isOpen: true,
    items: [
      { id: 601, name: 'Chicken Dum Biryani', price: 240, category: 'biryani', veg: false, desc: 'Sealed pot, boneless' },
      { id: 602, name: 'Veg Dum Biryani',     price: 190, category: 'biryani', veg: true,  desc: 'Seasonal veg, fried onion' },
      { id: 603, name: 'Masala Chai',         price: 40,  category: 'coffee',  veg: true,  desc: 'Cardamom, ginger' },
    ],
  },
]