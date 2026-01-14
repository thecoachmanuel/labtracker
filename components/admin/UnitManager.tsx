'use client'

import { useState } from 'react'
import { Unit } from '@prisma/client'
import { createUnit, deleteUnit, updateUnit } from '@/app/actions'
import { toast } from 'sonner'
import { Trash2, Plus, Loader2, Pencil } from 'lucide-react'
import Modal from '@/components/ui/Modal'

export default function UnitManager({ units }: { units: Unit[] }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [editName, setEditName] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await createUnit(name)
      setName('')
      toast.success('Unit created')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create unit')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUnit || !editName.trim()) return

    setLoading(true)
    try {
      await updateUnit(editingUnit.id, editName)
      setEditingUnit(null)
      toast.success('Unit updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update unit')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await deleteUnit(id)
      toast.success('Unit deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete unit')
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New Unit Name"
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />}
          Add Unit
        </button>
      </form>

      <Modal
        isOpen={!!editingUnit}
        onClose={() => setEditingUnit(null)}
        title="Edit Unit"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Unit Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingUnit(null)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Update Unit'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {units.map((unit) => (
            <li key={unit.id} className="px-4 py-4 flex items-center justify-between sm:px-6">
              <span className="text-sm font-medium text-gray-900">{unit.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingUnit(unit)
                    setEditName(unit.name)
                  }}
                  className="cursor-pointer text-gray-500 hover:text-blue-600 p-2"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(unit.id)}
                  className="cursor-pointer text-red-600 hover:text-red-900 p-2"
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
