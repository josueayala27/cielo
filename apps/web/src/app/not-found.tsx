import { Compass } from 'lucide-react'
import Link from 'next/link'
import { Card, EmptyState, buttonRecipe } from '@/components/ui'

/** 404 for unknown routes. */
export default function NotFound() {
  return (
    <Card>
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you are looking for does not exist."
        actions={
          <Link href="/" className={buttonRecipe({ variant: 'primary' })}>
            Go to tickets
          </Link>
        }
      />
    </Card>
  )
}
