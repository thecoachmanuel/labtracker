'use client'

import { useState, useEffect } from 'react'
import { getSiteSettings, updateSiteSettings, uploadLogo } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Upload } from 'lucide-react'

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const router = useRouter()

  useEffect(() => {
    getSiteSettings().then(data => {
      setSettings(data)
      setLoading(false)
    })
  }, [])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let logoUrl = settings.logoUrl

      if (logoFile) {
        const formData = new FormData()
        formData.append('file', logoFile)
        formData.append('mimeType', logoFile.type || 'image/png')
        logoUrl = await uploadLogo(formData)
      }

      await updateSiteSettings({
        ...settings,
        logoUrl
      })
      
      toast.success('Settings updated successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to update settings')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        
        {/* Branding */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Branding</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Logo Image</label>
            <div className="mt-2 flex items-center space-x-4">
              {settings.logoUrl && (
                <div className="h-16 w-16 relative border rounded bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img src={settings.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              <div className="flex-1">
                 <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">Upload a local image file. It will be saved to the server.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Logo Title / Brand Name</label>
            <input
              type="text"
              value={settings.logoTitle}
              onChange={e => setSettings({...settings, logoTitle: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold border-b pb-2">Homepage Hero Section</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Hero Title</label>
            <input
              type="text"
              value={settings.heroTitle}
              onChange={e => setSettings({...settings, heroTitle: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Hero Subtitle</label>
            <textarea
              value={settings.heroSubtitle}
              onChange={e => setSettings({...settings, heroSubtitle: e.target.value})}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Button Text</label>
            <input
              type="text"
              value={settings.heroButtonText}
              onChange={e => setSettings({...settings, heroButtonText: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Saving...
              </>
            ) : 'Save Settings'}
          </button>
        </div>

      </form>
    </div>
  )
}
