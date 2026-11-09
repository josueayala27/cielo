'use client'

import { TriangleAlert } from 'lucide-react'
import { Button, Card, EmptyState } from '@/components/ui'

/** Last-resort boundary for unexpected render errors. */
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <Card>
      <EmptyState
        tone="danger"
        icon={TriangleAlert}
        title="Something went wrong"
        description="An unexpected error occurred while showing this page."
        actions={<Button onClick={reset}>Try again</Button>}
      />
    </Card>
  )
}
