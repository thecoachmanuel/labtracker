import { getServerSession } from 'next-auth'
import { authOptions } from '../auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  switch (session.user.role) {
    case 'RECEPTION':
      redirect('/dashboard/reception')
    case 'LAB_SCIENTIST':
      redirect('/dashboard/scientist')
    case 'SUPERVISOR':
      redirect('/dashboard/supervisor')
    case 'ADMIN':
      redirect('/dashboard/admin')
    case 'UNIT_ADMIN':
      redirect('/dashboard/admin')
    default:
      return <div>Unknown role</div>
  }
}
