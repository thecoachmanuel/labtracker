'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createUser, deleteUser, updateUser } from '@/app/actions'
import { Trash2, Plus, User as UserIcon, Pencil, ChevronDown, ChevronRight, Filter, Users } from 'lucide-react'
import type { User, Unit } from '@prisma/client'
import Modal from '@/components/ui/Modal'

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().optional(),
  role: z.enum(['ADMIN', 'UNIT_ADMIN', 'SUPERVISOR', 'RECEPTION', 'LAB_SCIENTIST']),
  unit_id: z.string().optional()
})

type UserForm = z.infer<typeof userSchema>

type UserWithUnit = User & { unit: Unit | null }

export default function UserManager({ 
  users, 
  units,
  currentUserRole,
  currentUserUnitId
}: { 
  users: UserWithUnit[], 
  units: Unit[],
  currentUserRole?: string,
  currentUserUnitId?: string
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingUser, setEditingUser] = useState<UserWithUnit | null>(null)
  const [unitFilter, setUnitFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({})
  
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: 'LAB_SCIENTIST',
      unit_id: currentUserRole === 'UNIT_ADMIN' ? currentUserUnitId : ''
    }
  })

  const selectedRole = watch('role')

  // Reset form when opening create mode
  const handleCreateClick = () => {
    reset({
      name: '',
      email: '',
      password: '',
      role: 'LAB_SCIENTIST',
      unit_id: currentUserRole === 'UNIT_ADMIN' ? currentUserUnitId : ''
    })
    setIsCreating(true)
  }

  // Populate form when opening edit mode
  const handleEditClick = (user: UserWithUnit) => {
    setEditingUser(user)
    reset({
      name: user.name,
      email: user.email,
      password: '', // Don't populate password
      role: user.role as UserForm['role'],
      unit_id: user.unit_id || ''
    })
  }

  async function onSubmit(data: UserForm) {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          name: data.name,
          email: data.email,
          role: data.role,
          unit_id: data.unit_id || undefined,
          password: data.password || undefined
        })
        toast.success('User updated')
        setEditingUser(null)
      } else {
        if (!data.password) {
          toast.error('Password is required for new users')
          return
        }
        await createUser({
          ...data,
          password: data.password,
          unit_id: data.unit_id || undefined
        })
        toast.success('User created')
        setIsCreating(false)
      }
      reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure?')) return
    try {
      await deleteUser(id)
      toast.success('User deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user')
    }
  }

  const isUnitAdmin = currentUserRole === 'UNIT_ADMIN'

  // Filtering Logic
  const filteredUsers = users.filter(user => {
    if (unitFilter !== 'all') {
      if (unitFilter === 'no-unit') {
        if (user.unit_id) return false
      } else {
        if (user.unit_id !== unitFilter) return false
      }
    }
    if (roleFilter !== 'all' && user.role !== roleFilter) return false
    return true
  })

  // Grouping Logic: Unit -> Role -> Users
  const groupedUsers = filteredUsers.reduce((acc, user) => {
    const unitKey = user.unit_id || 'no-unit'
    if (!acc[unitKey]) acc[unitKey] = {}
    
    const roleKey = user.role
    if (!acc[unitKey][roleKey]) acc[unitKey][roleKey] = []
    
    acc[unitKey][roleKey].push(user)
    return acc
  }, {} as Record<string, Record<string, UserWithUnit[]>>)

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }))
  }

  // Sort unit keys: put 'no-unit' last, others alphabetical
  const sortedUnitKeys = Object.keys(groupedUsers).sort((a, b) => {
    if (a === 'no-unit') return 1
    if (b === 'no-unit') return -1
    const unitA = units.find(u => u.id === a)?.name || ''
    const unitB = units.find(u => u.id === b)?.name || ''
    return unitA.localeCompare(unitB)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {!isUnitAdmin && (
            <div className="relative">
              <Filter className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <select 
                value={unitFilter} 
                onChange={e => setUnitFilter(e.target.value)}
                className="pl-8 pr-4 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <option value="all">All Units</option>
                <option value="no-unit">No Unit (Global)</option>
                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          )}
          <div className="relative">
            <Users className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
              className="pl-8 pr-4 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="UNIT_ADMIN">Unit Admin</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="RECEPTION">Reception</option>
              <option value="LAB_SCIENTIST">Lab Scientist</option>
            </select>
          </div>
          <button
            onClick={handleCreateClick}
            className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 whitespace-nowrap ml-auto"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add User</span>
          </button>
        </div>
      </div>

      <Modal
        isOpen={isCreating || !!editingUser}
        onClose={() => {
          setIsCreating(false)
          setEditingUser(null)
        }}
        title={editingUser ? 'Edit User' : 'Create User'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              {...register('name')}
              className="w-full p-2 border rounded-md"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full p-2 border rounded-md"
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Password {editingUser && '(Leave blank to keep current)'}
            </label>
            <input
              {...register('password')}
              type="password"
              className="w-full p-2 border rounded-md"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select {...register('role')} className="w-full p-2 border rounded-md">
              {!isUnitAdmin && <option value="ADMIN">Admin</option>}
              {!isUnitAdmin && <option value="UNIT_ADMIN">Unit Admin</option>}
              <option value="SUPERVISOR">Supervisor</option>
              <option value="RECEPTION">Reception</option>
              <option value="LAB_SCIENTIST">Lab Scientist</option>
            </select>
          </div>

          {(selectedRole === 'LAB_SCIENTIST' || selectedRole === 'UNIT_ADMIN' || selectedRole === 'SUPERVISOR' || selectedRole === 'RECEPTION') && (
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select 
                {...register('unit_id')} 
                className="w-full p-2 border rounded-md"
                disabled={isUnitAdmin} // Unit Admin cannot change unit
              >
                <option value="">Select a unit...</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              {isUnitAdmin && <p className="text-xs text-gray-500 mt-1">Locked to your unit</p>}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false)
                setEditingUser(null)
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </Modal>

      <div className="space-y-4">
        {sortedUnitKeys.map(unitId => {
          const unitRoles = groupedUsers[unitId]
          const unitName = unitId === 'no-unit' 
            ? 'Global Users (No Unit Assigned)' 
            : units.find(u => u.id === unitId)?.name || 'Unknown Unit'
          const userCount = Object.values(unitRoles).reduce((acc: number, r: UserWithUnit[]) => acc + r.length, 0)
          const isExpanded = expandedUnits[unitId] ?? true // Default to expanded

          return (
            <div key={unitId} className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <button 
                onClick={() => toggleUnit(unitId)} 
                className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  <span className="font-semibold text-gray-900">{unitName}</span>
                  <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{userCount as React.ReactNode}</span>
                </div>
              </button>
              
              {isExpanded && (
                <div className="p-4 space-y-6">
                  {Object.entries(unitRoles).map(([role, roleUsers]: [string, UserWithUnit[]]) => (
                    <div key={role} className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 border-b pb-1">
                        {role.replace('_', ' ')}
                        <span className="text-gray-400 font-normal normal-case">({roleUsers.length})</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {roleUsers.map((user: UserWithUnit) => (
                          <div key={user.id} className="bg-gray-50 p-3 rounded-md border flex justify-between items-start hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3">
                              <div className="bg-blue-100 p-1.5 rounded-full mt-0.5">
                                <UserIcon className="text-blue-600" size={16} />
                              </div>
                              <div>
                                <h3 className="font-medium text-sm text-gray-900">{user.name}</h3>
                                <p className="text-xs text-gray-500 break-all">{user.email}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditClick(user)}
                                className="cursor-pointer text-gray-400 hover:text-blue-600 p-1"
                                title="Edit User"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="cursor-pointer text-gray-400 hover:text-red-600 p-1"
                                title="Delete User"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        
        {sortedUnitKeys.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or add a new user.</p>
          </div>
        )}
      </div>
    </div>
  )
}
