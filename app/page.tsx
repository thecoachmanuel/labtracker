import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import AppWalkthrough from '@/components/landing/AppWalkthrough'
import Features from '@/components/landing/Features'
import Footer from '@/components/landing/Footer'
import { getSiteSettings } from '@/app/actions'

export default async function Home() {
  const settings = await getSiteSettings()

  return (
    <main className="min-h-screen bg-white">
      <Navbar settings={settings} />
      <Hero settings={settings} />
      <AppWalkthrough />
      <Features />
      <Footer />
    </main>
  )
}
