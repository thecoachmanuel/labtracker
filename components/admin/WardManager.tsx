'use client'

import { useState } from 'react'
import { Ward } from '@prisma/client'
import { createWard, deleteWard, updateWard } from '@/app/actions'
import { toast } from 'sonner'
import { Trash2, Plus, Loader2, Pencil, X } from 'lucide-react'

export default function WardManager({ wards }: { wards: Ward[] }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingWard, setEditingWard] = useState<Ward | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      if (editingWard) {
        await updateWard(editingWard.id, name)
        toast.success('Ward updated')
        setEditingWard(null)
      } else {
        await createWard(name)
        toast.success('Ward created')
      }
      setName('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save ward')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (ward: Ward) => {
    setEditingWard(ward)
    setName(ward.name)
  }

  const handleCancelEdit = () => {
    setEditingWard(null)
    setName('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await deleteWard(id)
      toast.success('Ward deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete ward')
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={editingWard ? "Edit Ward Name" : "New Ward Name"}
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : editingWard ? (
            <>Update Ward</>
          ) : (
            <><Plus className="h-4 w-4 mr-2" /> Add Ward</>
          )}
        </button>
        {editingWard && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="cursor-pointer inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {wards.map((ward) => (
            <li key={ward.id} className="px-4 py-4 flex items-center justify-between sm:px-6">
              <span className="text-sm font-medium text-gray-900">{ward.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(ward)}
                  className="cursor-pointer text-indigo-600 hover:text-indigo-900"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(ward.id)}
                  className="cursor-pointer text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
