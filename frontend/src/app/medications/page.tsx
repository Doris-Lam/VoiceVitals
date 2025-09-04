'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Medication, MedicationFormData } from '@/types'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { Pill, Plus, Edit, Trash2, Calendar, Clock, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function MedicationsPage() {
  const { user, token } = useAuth()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showActiveOnly, setShowActiveOnly] = useState(false)

  const API_BASE = 'https://web-production-508d.up.railway.app'

  const fetchMedications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/api/medications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMedications(data.data.medications)
      } else {
        throw new Error('Failed to fetch medications')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch medications')
    } finally {
      setLoading(false)
    }
  }, [token, API_BASE])

  useEffect(() => {
    if (token) {
      fetchMedications()
    }
  }, [token, fetchMedications])

  const handleSubmit = async (formData: MedicationFormData) => {
    try {
      const url = editingMedication 
        ? `${API_BASE}/api/medications/${editingMedication._id}`
        : `${API_BASE}/api/medications`
      
      const method = editingMedication ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchMedications()
        setShowForm(false)
        setEditingMedication(null)
        setError(null)
      } else {
        const data = await response.json()
        throw new Error(data.message || 'Failed to save medication')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save medication')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medication?')) return

    try {
      const response = await fetch(`${API_BASE}/api/medications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        await fetchMedications()
        setError(null)
      } else {
        throw new Error('Failed to delete medication')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete medication')
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/medications/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        await fetchMedications()
        setError(null)
      } else {
        throw new Error('Failed to toggle medication status')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle medication status')
    }
  }

  const filteredMedications = medications.filter(medication => {
    const matchesSearch = medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         medication.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         medication.prescribedBy?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || medication.category === selectedCategory
    const matchesActive = !showActiveOnly || medication.isActive

    return matchesSearch && matchesCategory && matchesActive
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Please log in to view your medications</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Back to Dashboard Navigation */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Medications</h1>
              <p className="text-slate-600 dark:text-slate-400">Manage your medications and reminders</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingMedication(null)
              setShowForm(true)
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Add Medication
          </button>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search medications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="prescription">Prescription</option>
              <option value="over-the-counter">Over the Counter</option>
              <option value="supplement">Supplement</option>
              <option value="other">Other</option>
            </select>

            {/* Active Only Toggle */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Active Only</span>
            </label>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Medications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading medications...</p>
          </div>
        ) : filteredMedications.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-300 dark:text-gray-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No medications found</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {searchQuery || selectedCategory !== 'all' || showActiveOnly
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first medication'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMedications.map((medication) => (
              <MedicationCard
                key={medication._id}
                medication={medication}
                onEdit={() => {
                  setEditingMedication(medication)
                  setShowForm(true)
                }}
                onDelete={() => handleDelete(medication._id)}
                onToggleStatus={() => handleToggleStatus(medication._id)}
              />
            ))}
          </div>
        )}

        {/* Medication Form Modal */}
        {showForm && (
          <MedicationForm
            medication={editingMedication}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false)
              setEditingMedication(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

// Medication Card Component
function MedicationCard({ 
  medication, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: { 
  medication: Medication
  onEdit: () => void
  onDelete: () => void
  onToggleStatus: () => void
}) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'prescription': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      case 'over-the-counter': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'supplement': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
      case 'other': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 ${
      medication.isActive ? 'border-l-green-500' : 'border-l-gray-400 dark:border-l-gray-600'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{medication.name}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(medication.category)}`}>
            {medication.category.replace('-', ' ')}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleStatus}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title={medication.isActive ? 'Deactivate' : 'Activate'}
          >
            {medication.isActive ? (
              <EyeIcon className="h-4 w-4 text-green-600" />
            ) : (
              <EyeSlashIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            )}
          </button>
          <button
            onClick={onEdit}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Edit"
          >
            <PencilIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Dosage:</span>
          <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{medication.dosage}</span>
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Frequency:</span>
          <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{medication.frequency}</span>
        </div>

        {medication.instructions && (
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Instructions:</span>
            <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{medication.instructions}</span>
          </div>
        )}

        {medication.prescribedBy && (
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Prescribed by:</span>
            <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{medication.prescribedBy}</span>
          </div>
        )}

        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Started:</span>
          <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{formatDate(medication.startDate)}</span>
        </div>

        {medication.endDate && (
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Ends:</span>
            <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{formatDate(medication.endDate)}</span>
          </div>
        )}

        {medication.notes && (
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes:</span>
            <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{medication.notes}</span>
          </div>
        )}

        {medication.refillReminder && medication.refillDate && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-yellow-800">
                Refill due: {formatDate(medication.refillDate)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Medication Form Component
function MedicationForm({ 
  medication, 
  onSubmit, 
  onCancel 
}: { 
  medication: Medication | null
  onSubmit: (data: MedicationFormData) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<MedicationFormData>({
    name: medication?.name || '',
    dosage: medication?.dosage || '',
    frequency: medication?.frequency || '',
    instructions: medication?.instructions || '',
    startDate: medication?.startDate ? new Date(medication.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: medication?.endDate ? new Date(medication.endDate).toISOString().split('T')[0] : '',
    category: medication?.category || 'prescription',
    sideEffects: medication?.sideEffects || [],
    notes: medication?.notes || '',
    prescribedBy: medication?.prescribedBy || '',
    pharmacy: medication?.pharmacy || '',
    refillReminder: medication?.refillReminder || false,
    refillDate: medication?.refillDate ? new Date(medication.refillDate).toISOString().split('T')[0] : ''
  })

  const [sideEffectInput, setSideEffectInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addSideEffect = () => {
    if (sideEffectInput.trim() && !formData.sideEffects?.includes(sideEffectInput.trim())) {
      setFormData(prev => ({
        ...prev,
        sideEffects: [...(prev.sideEffects || []), sideEffectInput.trim()]
      }))
      setSideEffectInput('')
    }
  }

  const removeSideEffect = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sideEffects: prev.sideEffects?.filter((_, i) => i !== index) || []
    }))
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-xl rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            {medication ? 'Edit Medication' : 'Add New Medication'}
          </h3>
          <p className="text-gray-600 dark:text-slate-400">Fill in the details below to {medication ? 'update' : 'add'} your medication</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Medication Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                placeholder="Enter medication name"
              />
            </div>

            {/* Dosage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Dosage *
              </label>
              <input
                type="text"
                required
                value={formData.dosage}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="e.g., 10mg, 1 tablet"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Frequency *
              </label>
              <input
                type="text"
                required
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                placeholder="e.g., Twice daily, Every 8 hours"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'prescription' | 'over-the-counter' | 'supplement' | 'other' }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="prescription">Prescription</option>
                <option value="over-the-counter">Over the Counter</option>
                <option value="supplement">Supplement</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Instructions */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Instructions
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                rows={3}
                placeholder="Special instructions for taking this medication"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            {/* Prescribed By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Prescribed By
              </label>
              <input
                type="text"
                value={formData.prescribedBy}
                onChange={(e) => setFormData(prev => ({ ...prev, prescribedBy: e.target.value }))}
                placeholder="Doctor's name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            {/* Pharmacy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Pharmacy
              </label>
              <input
                type="text"
                value={formData.pharmacy}
                onChange={(e) => setFormData(prev => ({ ...prev, pharmacy: e.target.value }))}
                placeholder="Pharmacy name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Additional notes about this medication"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Refill Reminder Section */}
          <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                id="refillReminder"
                checked={formData.refillReminder}
                onChange={(e) => setFormData(prev => ({ ...prev, refillReminder: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="refillReminder" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Set refill reminder
              </label>
            </div>
            
            {formData.refillReminder && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Refill Date
                </label>
                <input
                  type="date"
                  value={formData.refillDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, refillDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Side Effects Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
              Side Effects
            </label>
            <div className="flex space-x-3 mb-3">
              <input
                type="text"
                value={sideEffectInput}
                onChange={(e) => setSideEffectInput(e.target.value)}
                placeholder="Add a side effect"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
              <button
                type="button"
                onClick={addSideEffect}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add
              </button>
            </div>
            {formData.sideEffects && formData.sideEffects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.sideEffects.map((effect, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800"
                  >
                    {effect}
                    <button
                      type="button"
                      onClick={() => removeSideEffect(index)}
                      className="ml-2 text-red-600 hover:text-red-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {medication ? 'Update' : 'Add'} Medication
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
