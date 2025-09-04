'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Activity, 
  Pill, 
  Brain,
  Trash2,
  Edit,
  Eye,
  Plus,
  Download,
  FileText,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/helpers'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface HealthRecord {
  _id: string
  transcript: string
  symptoms: Array<{
    name: string
    severity: number
    duration: string
    notes: string
  }>
  medications: Array<{
    name: string
    dosage: string
    frequency: string
    notes: string
  }>
  aiAnalysis: {
    summary: string
    recommendations: string[]
    urgencyLevel: 'low' | 'medium' | 'high' | 'urgent'
    confidence: number
    processedAt: string
  }
  createdAt: string
  updatedAt: string
}

export default function RecordsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecords()
    }
  }, [isAuthenticated])

  // Filter and sort records based on search term, urgency filter, and sort preference
  useEffect(() => {
    let filtered = records

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.transcript.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.symptoms.some(symptom => 
          symptom.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        record.medications.some(med => 
          med.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply urgency filter
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(record => 
        record.aiAnalysis.urgencyLevel === urgencyFilter
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'urgency':
          const urgencyOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          return urgencyOrder[b.aiAnalysis.urgencyLevel] - urgencyOrder[a.aiAnalysis.urgencyLevel]
        case 'confidence':
          return b.aiAnalysis.confidence - a.aiAnalysis.confidence
        default:
          return 0
      }
    })

    setFilteredRecords(filtered)
  }, [records, searchTerm, urgencyFilter, sortBy])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      // Request all records by setting a very high limit
      const response = await fetch(`https://web-production-508d.up.railway.app/api/health?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch records')
      }
      
      const data = await response.json()
      setRecords(data.data.records || [])
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records')
    } finally {
      setLoading(false)
    }
  }



  const deleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return
    
    try {
      const response = await fetch(`https://web-production-508d.up.railway.app/api/health/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete record')
      }
      
      setRecords(records.filter(record => record._id !== recordId))
      if (selectedRecord?._id === recordId) {
        setSelectedRecord(null)
        setShowModal(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record')
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 dark:bg-amber-900/20 rounded-3xl p-8 border border-amber-200 dark:border-amber-800/50"
            >
              <AlertTriangle className="w-16 h-16 text-amber-400 dark:text-amber-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-amber-700 dark:text-amber-300 mb-4">Login Required</h1>
              <p className="text-amber-600 dark:text-amber-400 mb-6">
                Please log in to view your health records.
              </p>
              <a
                href="/login"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-300"
              >
                Go to Login
              </a>
            </motion.div>
          </div>
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
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Health Records</h1>
              <p className="text-slate-600 dark:text-slate-400">View and manage your voice health recordings</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Records */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{records.length}</p>
                <p className="text-slate-600 dark:text-slate-400">Total Records</p>
                {filteredRecords.length !== records.length && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">{filteredRecords.length} filtered</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Symptoms Tracked */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {filteredRecords.reduce((acc, record) => acc + record.symptoms.length, 0)}
                </p>
                <p className="text-slate-600 dark:text-slate-400">Symptoms Tracked</p>
                {filteredRecords.length !== records.length && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    of {records.reduce((acc, record) => acc + record.symptoms.length, 0)} total
                  </p>
                )}
              </div>
            </div>
          </div>
          

          
          {/* High Priority */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-indigo-500" />
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {filteredRecords.filter(r => r.aiAnalysis.urgencyLevel === 'high' || r.aiAnalysis.urgencyLevel === 'urgent').length}
                </p>
                <p className="text-slate-600 dark:text-slate-400">High Priority</p>
                {filteredRecords.length !== records.length && (
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">
                    of {records.filter(r => r.aiAnalysis.urgencyLevel === 'high' || r.aiAnalysis.urgencyLevel === 'urgent').length} total
                  </p>
                )}
              </div>
            </div>
          </div>

        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Search Records
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search by transcript, symptoms, or medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Urgency Filter */}
            <div className="lg:w-48">
              <label htmlFor="urgency" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Urgency Level
              </label>
              <select
                id="urgency"
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
              >
                <option value="all">All Levels</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            {/* Sort By */}
            <div className="lg:w-48">
              <label htmlFor="sort" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Sort By
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="urgency">Urgency Level</option>
                <option value="confidence">AI Confidence</option>
              </select>
            </div>
          </div>
          
          {/* Results count and clear filters */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <div>
                Showing {filteredRecords.length} of {records.length} records
                {searchTerm && ` matching "${searchTerm}"`}
                {urgencyFilter !== 'all' && ` with ${urgencyFilter} urgency`}
              </div>
              {lastUpdated && (
                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
            {(searchTerm || urgencyFilter !== 'all' || sortBy !== 'newest') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setUrgencyFilter('all')
                  setSortBy('newest')
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </motion.div>

        {/* Records List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-slate-600 dark:text-slate-400 mt-4">Loading your health records...</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">This may take a moment if you have many records</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={fetchRecords}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-12 text-center">
              {records.length === 0 ? (
                <>
                  <Brain className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">No Records Yet</h3>
                  <p className="text-slate-500 dark:text-slate-500 mb-6">
                    Start by recording your voice to create your first health record.
                  </p>
                  <a
                    href="/voice-recorder"
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    Record Voice
                  </a>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">No Records Found</h3>
                  <p className="text-slate-500 dark:text-slate-500 mb-6">
                    No records match your current search criteria. Try adjusting your filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setUrgencyFilter('all')
                      setSortBy('newest')
                    }}
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-300"
                  >
                    Clear All
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredRecords.map((record, index) => (
                <motion.div
                  key={record._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-sm font-medium border",
                          getUrgencyColor(record.aiAnalysis.urgencyLevel)
                        )}>
                          {record.aiAnalysis.urgencyLevel.toUpperCase()}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {formatDate(record.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-slate-800 dark:text-slate-100 mb-3 line-clamp-2">
                        {record.transcript}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        {record.symptoms.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            {record.symptoms.length} symptoms
                          </span>
                        )}
                        {record.medications.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Pill className="w-4 h-4" />
                            {record.medications.length} medications
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Brain className="w-4 h-4" />
                          {Math.round(record.aiAnalysis.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedRecord(record)
                          setShowModal(true)
                        }}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteRecord(record._id)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Record Detail Modal */}
        {showModal && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Record Details</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Transcript */}
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">What you said:</h3>
                    <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                      {selectedRecord.transcript}
                    </p>
                  </div>
                  
                  {/* Symptoms */}
                  {selectedRecord.symptoms.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Symptoms:</h3>
                      <div className="space-y-2">
                        {selectedRecord.symptoms.map((symptom, index) => (
                          <div key={index} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-slate-800 dark:text-slate-100">{symptom.name}</span>
                              <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                                Severity: {symptom.severity}/10
                              </span>
                            </div>
                            {symptom.duration && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Duration: {symptom.duration}</p>
                            )}
                            {symptom.notes && (
                              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">{symptom.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Medications */}
                  {selectedRecord.medications.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Medications:</h3>
                      <div className="space-y-2">
                        {selectedRecord.medications.map((med, index) => (
                          <div key={index} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-slate-800 dark:text-slate-100">{med.name}</span>
                              {med.dosage && (
                                <span className="text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">
                                  {med.dosage}
                                </span>
                              )}
                            </div>
                            {med.frequency && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Frequency: {med.frequency}</p>
                            )}
                            {med.notes && (
                              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">{med.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* AI Analysis */}
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">AI Analysis:</h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <p className="text-slate-800 dark:text-slate-200 mb-3">{selectedRecord.aiAnalysis.summary}</p>
                      
                      {selectedRecord.aiAnalysis.recommendations.length > 0 && (
                        <div className="mb-3">
                          <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Recommendations:</h4>
                          <ul className="space-y-1">
                            {selectedRecord.aiAnalysis.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                <span className="text-blue-500 dark:text-blue-400">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className={cn(
                          "px-2 py-1 rounded-full font-medium",
                          getUrgencyColor(selectedRecord.aiAnalysis.urgencyLevel)
                        )}>
                          {selectedRecord.aiAnalysis.urgencyLevel.toUpperCase()}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          Confidence: {Math.round(selectedRecord.aiAnalysis.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Timestamps */}
                  <div className="text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-4">
                    <p>Created: {formatDate(selectedRecord.createdAt)}</p>
                    {selectedRecord.updatedAt !== selectedRecord.createdAt && (
                      <p>Updated: {formatDate(selectedRecord.updatedAt)}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
