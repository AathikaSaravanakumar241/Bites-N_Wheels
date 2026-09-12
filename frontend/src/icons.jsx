
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export const IconSearch = ({ size = 16 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
)

export const IconMapPin = ({ size = 16 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="M20 10c0 6-8 13-8 13S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
)

export const IconChevronDown = ({ size = 14 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24" strokeWidth={2.5}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export const IconChevronRight = ({ size = 16 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="m9 18 6-6-6-6" />
  </svg>
)

export const IconArrowLeft = ({ size = 16 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
  </svg>
)

export const IconShoppingBag = ({ size = 18 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <line x1="3" x2="21" y1="6" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

export const IconUser = ({ size = 18 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
  </svg>
)

export const IconX = ({ size = 14 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24" strokeWidth={2.5}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export const IconTruck = ({ size = 14 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
    <rect x="9" y="11" width="14" height="10" rx="2" />
    <circle cx="12" cy="21" r="1" fill="currentColor" stroke="none" />
    <circle cx="20" cy="21" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const IconClock = ({ size = 12 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
  </svg>
)

export const IconSparkle = ({ size = 14 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
  </svg>
)

export const IconCheck = ({ size = 20 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export const IconPackage = ({ size = 20 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
  </svg>
)

export const IconReceipt = ({ size = 18 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M14 8H8" /><path d="M16 12H8" /><path d="M13 16H8" />
  </svg>
)

export const IconLayoutDashboard = ({ size = 18 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
)

export const IconMap = ({ size = 18 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" x2="9" y1="3" y2="18" /><line x1="15" x2="15" y1="6" y2="21" />
  </svg>
)

export const IconUtensilsCrossed = ({ size = 18 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" />
    <path d="m15 15 3.7-3.7a2.1 2.1 0 0 1 2.9 0l.4.4a2.1 2.1 0 0 1 0 2.9L18 18" />
    <path d="m2 22 7.5-7.5" /><path d="M17 22 2 7l4-4 8.5 8.5" />
  </svg>
)

export const IconDollarSign = ({ size = 18 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

export const IconMinus = ({ size = 14 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24" strokeWidth={2.5}>
    <path d="M5 12h14" />
  </svg>
)

export const IconPlus = ({ size = 14 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24" strokeWidth={2.5}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconLoader = ({ size = 20 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

export const IconLogOut = ({ size = 16 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
  </svg>
)

export const IconListOrdered = ({ size = 16 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <line x1="10" x2="21" y1="6" y2="6" /><line x1="10" x2="21" y1="12" y2="12" />
    <line x1="10" x2="21" y1="18" y2="18" />
    <path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
  </svg>
)

export const IconShield = ({ size = 16 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

export const IconRefresh = ({ size = 16, spinning = false }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24" style={spinning ? { animation: 'spin 1s linear infinite' } : undefined}>
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </svg>
)

export const IconFlame = ({ size = 16 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
)

export const IconStore = ({ size = 16 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M22 7a2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1-2 2 2 2 0 0 1-2-2" />
  </svg>
)

export const IconStar = ({ size = 16 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

export const IconPhone = ({ size = 16 }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)
