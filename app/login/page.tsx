import LoginForm from '@/components/LoginForm'
import { getSiteSettings } from '@/app/actions'

export default async function LoginPage() {
  const settings = await getSiteSettings()
  return <LoginForm settings={settings} />
}