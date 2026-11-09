import { Suspense } from 'react'
import { TicketsDashboard } from '@/features/tickets/views/TicketsDashboard'

/** `/`: dashboard and ticket list. Suspense is required by `useSearchParams`. */
export default function HomePage() {
  return (
    <Suspense>
      <TicketsDashboard />
    </Suspense>
  )
}
