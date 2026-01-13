import TrackResultForm from '@/components/TrackResultForm'
import { getSiteSettings } from '@/app/actions'

export default async function TrackResultPage() {
  const settings = await getSiteSettings()
  return <TrackResultForm settings={settings} />
}