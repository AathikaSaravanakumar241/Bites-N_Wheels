import VendorLayout from './VendorLayout.jsx'
import TruckMenu from './TruckMenu.jsx'

export default function VendorMenuPage() {
  return (
    <VendorLayout
      title="Menu Management"
      subtitle="Organize categories, create food items, and manage live stock availability"
    >
      <TruckMenu />
    </VendorLayout>
  )
}
