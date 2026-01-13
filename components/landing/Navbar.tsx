'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { TestTube2, Menu } from 'lucide-react'
import { useSession } from 'next-auth/react'

type SiteSettings = {
  logoUrl?: string | null
  logoTitle: string
}

export default function Navbar({ settings }: { settings?: SiteSettings }) {
  const { data: session } = useSession()

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100"
    >
      <div className="flex items-center gap-2">
        {settings?.logoUrl ? (
          <img src={settings.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
        ) : (
          <div className="p-2 bg-blue-600 rounded-lg">
            <TestTube2 className="w-6 h-6 text-white" />
          </div>
        )}
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          {settings?.logoTitle || 'LabTracker'}
        </span>
      </div>

      <div className="hidden sm:flex items-center gap-4">
        <Link 
          href="/track"
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          Track Result
        </Link>
        {session ? (
          <Link 
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/20"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link 
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/20"
            >
              Get Started
            </Link>
          </>
        )}
      </div>

      <div className="sm:hidden">
        <details className="relative">
          <summary className="list-none inline-flex items-center justify-center p-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50">
            <Menu className="h-5 w-5" />
          </summary>
          <div className="absolute right-0 mt-2 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-2">
              <Link 
                href="/track"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Track Result
              </Link>
              {session ? (
                <Link 
                  href="/dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </details>
      </div>
    </motion.nav>
  )
}
