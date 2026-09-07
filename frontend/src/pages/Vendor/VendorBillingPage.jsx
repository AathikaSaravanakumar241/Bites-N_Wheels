import VendorLayout from './VendorLayout.jsx'
import TruckBilling from './TruckBilling.jsx'

/* Thin wrapper: puts TruckBilling inside the shared vendor shell so the
   sidebar is present on every vendor page. TruckBilling.jsx renders its
   own page heading, so no title is passed here. Keeping this separate
   means TruckBilling.jsx itself stays untouched. */
export default function VendorBillingPage() {
  return (
    <VendorLayout>
      <TruckBilling />
    </VendorLayout>
  )
}
