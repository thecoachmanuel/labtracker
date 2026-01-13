import SignUpForm from '@/components/SignUpForm'
import { getUnits, getSiteSettings } from '@/app/actions'

export const dynamic = 'force-dynamic'

export default async function SignUp() {
  const units = await getUnits()
  const settings = await getSiteSettings()

  return <SignUpForm units={units} settings={settings} />
}
