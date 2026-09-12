import VendorLayout from './VendorLayout.jsx'
import TruckBilling from './TruckBilling.jsx'

export default function VendorBillingPage() {
  return (
    <VendorLayout
      title="Billing & POS"
      subtitle="Create offline walk-in orders, calculate items, and generate payment receipts"
    >
      <TruckBilling />
    </VendorLayout>
  )
}
