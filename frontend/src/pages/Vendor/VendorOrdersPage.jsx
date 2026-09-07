import VendorLayout from './VendorLayout.jsx'
import TruckOrders from './TruckOrders.jsx'

/* Thin wrapper: puts TruckOrders inside the shared vendor shell so the
   sidebar is present on every vendor page. TruckOrders.jsx renders its
   own page heading, so no title is passed here. Keeping this separate
   means TruckOrders.jsx itself stays untouched. */
export default function VendorOrdersPage() {
  return (
    <VendorLayout>
      <TruckOrders />
    </VendorLayout>
  )
}
