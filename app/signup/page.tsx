import SignUpForm from '@/components/SignUpForm'
import { getUnits, getSiteSettings } from '@/app/actions'

export default async function SignUp() {
  const units = await getUnits()
  const settings = await getSiteSettings()

  return <SignUpForm units={units} settings={settings} />
}
