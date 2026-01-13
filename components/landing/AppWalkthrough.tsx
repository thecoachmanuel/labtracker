'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Beaker, CheckCircle, Clock, Search, User } from 'lucide-react'

const features = [
  {
    id: 'dashboard',
    title: 'Real-time Dashboard',
    description: 'Monitor lab performance and sample status at a glance.',
    icon: Activity,
    color: 'bg-blue-500',
  },
  {
    id: 'tracking',
    title: 'Sample Tracking',
    description: 'Track every step of the sample journey from reception to results.',
    icon: Beaker,
    color: 'bg-purple-500',
  },
  {
    id: 'status',
    title: 'Live Updates',
    description: 'Instant status updates for all stakeholders.',
    icon: Clock,
    color: 'bg-green-500',
  },
]

export default function AppWalkthrough() {
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl mb-4">
            Experience the Workflow
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how our platform simplifies complex laboratory operations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Feature List */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(index)}
                className={`w-full text-left p-6 rounded-2xl transition-all duration-300 ${
                  activeFeature === index
                    ? 'bg-gray-50 shadow-lg ring-1 ring-gray-200 scale-102'
                    : 'hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl ${feature.color} text-white shadow-md`}
                  >
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-semibold mb-2 ${
                        activeFeature === index ? 'text-gray-900' : 'text-gray-600'
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
                {activeFeature === index && (
                  <motion.div
                    layoutId="active-indicator"
                    className="h-1 bg-blue-600 mt-6 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 4, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Animated Mockup */}
          <div className="relative h-[500px] w-full bg-gray-900 rounded-3xl p-4 shadow-2xl border-4 border-gray-800 overflow-hidden">
            {/* Browser/App Header Mock */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gray-800 flex items-center px-4 gap-2 z-10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 mx-4 bg-gray-700 h-6 rounded-md flex items-center justify-center text-xs text-gray-400">
                labtracker.app/dashboard
              </div>
            </div>

            <div className="mt-12 h-full p-4 bg-gray-50 rounded-t-xl overflow-hidden relative">
              <AnimatePresence mode="wait">
                {activeFeature === 0 && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="h-8 w-8 bg-gray-200 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl shadow-sm space-y-2">
                        <div className="h-4 w-20 bg-blue-100 rounded" />
                        <div className="h-8 w-12 bg-blue-500 rounded" />
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm space-y-2">
                        <div className="h-4 w-20 bg-purple-100 rounded" />
                        <div className="h-8 w-12 bg-purple-500 rounded" />
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm h-48 space-y-3">
                      <div className="h-4 w-40 bg-gray-100 rounded" />
                      <div className="flex items-end gap-2 h-32 pt-4">
                        {[40, 70, 50, 90, 60, 80].map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="flex-1 bg-blue-500/20 rounded-t-sm hover:bg-blue-500/40 transition-colors"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeFeature === 1 && (
                  <motion.div
                    key="tracking"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4"
                  >
                    <div className="bg-white p-2 rounded-lg shadow-sm flex items-center gap-2 mb-4">
                      <Search className="w-4 h-4 text-gray-400" />
                      <div className="h-4 w-32 bg-gray-100 rounded" />
                    </div>
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between border-l-4 border-blue-500"
                      >
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-200 rounded" />
                          <div className="h-3 w-20 bg-gray-100 rounded" />
                        </div>
                        <div className="h-8 w-20 bg-blue-50 rounded-full flex items-center justify-center">
                          <span className="h-2 w-2 bg-blue-500 rounded-full" />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {activeFeature === 2 && (
                  <motion.div
                    key="status"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    className="h-full flex flex-col justify-center items-center space-y-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                      className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </motion.div>
                    <div className="text-center space-y-2">
                      <div className="h-6 w-48 bg-gray-200 rounded mx-auto" />
                      <div className="h-4 w-32 bg-gray-100 rounded mx-auto" />
                    </div>
                    <div className="w-full bg-white p-4 rounded-xl shadow-sm space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-full bg-gray-100 rounded" />
                          <div className="h-3 w-2/3 bg-gray-100 rounded" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
