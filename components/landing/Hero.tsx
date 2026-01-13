'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Microscope, TestTube2, Dna, FlaskConical, Activity, Stethoscope } from 'lucide-react'
import { useSession } from 'next-auth/react'

type SiteSettings = {
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
}

const FloatingElement = ({ children, className, delay = 0, duration = 6 }: { children: React.ReactNode, className?: string, delay?: number, duration?: number }) => (
  <motion.div
    className={`absolute ${className} pointer-events-none opacity-20 text-blue-600`}
    initial={{ y: 0, rotate: 0 }}
    animate={{
      y: [0, -30, 0],
      rotate: [0, 10, -10, 0],
      scale: [1, 1.1, 1]
    }}
    transition={{
      duration: duration,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      delay: delay,
    }}
  >
    {children}
  </motion.div>
)

export default function Hero({ settings }: { settings?: SiteSettings }) {
  const { data: session } = useSession()
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-gray-50">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl mix-blend-multiply animate-blob" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000" />
        
        {/* Floating Lab Elements */}
        <FloatingElement className="top-20 left-[10%]" delay={0} duration={7}>
          <Microscope size={64} />
        </FloatingElement>
        <FloatingElement className="top-40 right-[15%]" delay={1} duration={8}>
          <TestTube2 size={56} />
        </FloatingElement>
        <FloatingElement className="bottom-32 left-[15%]" delay={2} duration={6}>
          <Dna size={72} />
        </FloatingElement>
        <FloatingElement className="top-1/3 right-[5%]" delay={1.5} duration={9}>
          <FlaskConical size={48} />
        </FloatingElement>
        <FloatingElement className="bottom-20 right-[20%]" delay={0.5} duration={7.5}>
          <Activity size={64} />
        </FloatingElement>
        <FloatingElement className="top-1/4 left-[5%]" delay={2.5} duration={8.5}>
          <Stethoscope size={52} />
        </FloatingElement>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-sm font-medium text-blue-700 bg-blue-100 rounded-full"
          >
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-blue-400"></span>
              <span className="relative inline-flex w-2 h-2 rounded-full bg-blue-500"></span>
            </span>
            New: Enhanced Real-time Tracking
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="mb-6 text-5xl font-bold tracking-tight text-gray-900 md:text-7xl"
          >
            {settings?.heroTitle ? (
              settings.heroTitle
            ) : (
              <>
                Precision Sample Tracking <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 animate-gradient-x bg-300%">
                  For Modern Labs
                </span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="mb-10 text-xl text-gray-600 md:text-2xl max-w-2xl mx-auto"
          >
            {settings?.heroSubtitle || 'Streamline your laboratory workflow with our secure, real-time sample management system. From reception to results, stay in control.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Link
                href={session ? '/dashboard' : '/login'}
                className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-full overflow-hidden transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30"
              >
                <span className="relative flex items-center gap-2">
                  {session ? 'Go to Dashboard' : (settings?.heroButtonText || 'Start Tracking Now')}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
            
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <Link
                href="#features"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-gray-700 bg-white border border-gray-200 rounded-full transition-all hover:bg-gray-50 hover:border-gray-300"
              >
                View Features
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-gray-500"
          >
            {['HIPAA Compliant', 'Real-time Updates', 'Secure Encryption', '24/7 Availability'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
