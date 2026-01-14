import TrackResultForm from '@/components/TrackResultForm'
import { getSiteSettings } from '@/app/actions'

export const dynamic = 'force-dynamic'

export default async function TrackResultPage() {
  const settings = await getSiteSettings()
  return <TrackResultForm settings={settings} />
}
