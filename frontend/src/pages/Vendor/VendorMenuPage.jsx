import VendorLayout from './VendorLayout.jsx'
import TruckMenu from './TruckMenu.jsx'

/* Thin wrapper: puts TruckMenu inside the shared vendor shell so the
   sidebar is present on every vendor page. TruckMenu.jsx renders its
   own page heading, so no title is passed here. Keeping this separate
   means TruckMenu.jsx itself stays untouched. */
export default function VendorMenuPage() {
  return (
    <VendorLayout>
      <TruckMenu />
    </VendorLayout>
  )
}
