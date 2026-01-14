import { getServerSession } from 'next-auth'
import { authOptions } from '../auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '../../components/SignOutButton'
import { getSiteSettings } from '@/app/actions'
import { TestTube2, Menu, Search } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const settings = await getSiteSettings()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-2">
                {settings?.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                ) : (
                  <div className="p-1.5 bg-indigo-600 rounded-lg">
                    <TestTube2 className="w-5 h-5 text-white" />
                  </div>
                )}
                <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                  {settings?.logoTitle || 'Lab Tracker'}
                </Link>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <Link
                href="/track"
                className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border border-transparent cursor-pointer"
              >
                <Search className="h-4 w-4 mr-1" />
                Track Result
              </Link>
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">{session.user.name}</span>
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                  {session.user.role}
                </span>
              </div>
              <SignOutButton />
            </div>

            <div className="sm:hidden flex items-center">
              <details className="relative">
                <summary className="list-none inline-flex items-center justify-center p-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50">
                  <Menu className="h-5 w-5" />
                </summary>
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-2 px-4 text-sm text-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{session.user.name}</span>
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                        {session.user.role}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <Link
                        href="/track"
                        className="block w-full text-left cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Track Result
                      </Link>
                      <SignOutButton />
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
