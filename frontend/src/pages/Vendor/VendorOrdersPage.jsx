import VendorLayout from './VendorLayout.jsx'
import TruckOrders from './TruckOrders.jsx'

export default function VendorOrdersPage() {
  return (
    <VendorLayout
      title="Live Orders"
      subtitle="Accept, prepare, and track real-time customer orders for your truck"
    >
      <TruckOrders />
    </VendorLayout>
  )
}
