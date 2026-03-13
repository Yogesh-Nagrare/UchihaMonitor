import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  useGetHistoryQuery,
  useDeleteHistoryEntryMutation,
  useClearHistoryMutation,
} from '../../services/historyApi'
import { openRequestInTab } from '../../features/request/requestSlice'
import { toast } from '../../features/ui/uiSlice'

const METHOD_STYLES = {
  GET:    'bg-emerald-500/10 text-emerald-400',
  POST:   'bg-indigo-500/10 text-indigo-400',
  PUT:    'bg-amber-500/10 text-amber-400',
  PATCH:  'bg-violet-500/10 text-violet-400',
  DELETE: 'bg-rose-500/10 text-rose-400',
}

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const HistoryPanel = ({ onClose }) => {
  const dispatch = useDispatch()
  const [search, setSearch] = useState('')
  const [filterMethod, setFilterMethod] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  const { data, isLoading, refetch } = useGetHistoryQuery({
    search,
    method: filterMethod,
    limit: 100,
  })

  const [deleteEntry] = useDeleteHistoryEntryMutation()
  const [clearHistory] = useClearHistoryMutation()

  const history = data?.history || []

  const handleReopen = (entry) => {
    dispatch(openRequestInTab({
      _id: null,
      name: entry.url,
      method: entry.method,
      url: entry.url,
      headers: Object.entries(entry.headers || {}).map(([key, value]) => ({ key, value, enabled: true })),
      params: Object.entries(entry.params || {}).map(([key, value]) => ({ key, value, enabled: true })),
      body: { type: entry.body ? 'raw' : 'none', content: entry.body || '' },
      collection: null,
    }))
    onClose()
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    await deleteEntry(id)
    dispatch(toast('Entry deleted', 'success'))
  }

  const handleClear = async () => {
    await clearHistory()
    setConfirmClear(false)
    dispatch(toast('History cleared', 'success'))
  }

  const formatTime = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return 'Today'
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  // Group by date
  const grouped = history.reduce((acc, entry) => {
    const label = formatDate(entry.createdAt)
    if (!acc[label]) acc[label] = []
    acc[label].push(entry)
    return acc
  }, {})

  const statusColor = (status) => {
    if (!status) return 'text-slate-500'
    if (status < 300) return 'text-emerald-400'
    if (status < 400) return 'text-amber-400'
    return 'text-rose-400'
  }

  return (
    <div className="w-80 bg-[#1a1d2e] border-l border-slate-800 flex flex-col h-full shrink-0">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
        <span className="text-slate-100 text-xs font-mono font-bold uppercase tracking-widest">History</span>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={() => setConfirmClear(true)}
              className="text-xs font-mono text-slate-500 hover:text-rose-400 transition-colors"
            >
              Clear
            </button>
          )}
          <button onClick={onClose} className="text-slate-500 hover:text-slate-100 transition-colors text-base">×</button>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800 shrink-0">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search URL..."
          className="flex-1 bg-slate-800/40 border border-slate-700/50 rounded px-2 py-1 text-slate-100 text-xs font-mono outline-none focus:border-indigo-500"
        />
        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
          className="bg-slate-800/40 border border-slate-700/50 rounded px-2 py-1 text-slate-500 text-xs font-mono outline-none cursor-pointer"
        >
          <option value="">All</option>
          {METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-4 h-4 border-2 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <svg className="w-8 h-8 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-500 text-xs font-mono">No history yet</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, entries]) => (
            <div key={date}>
              {/* Date group label */}
              <div className="px-4 py-1.5 sticky top-0 bg-[#1a1d2e] z-10">
                <span className="text-slate-500 text-xs font-mono uppercase tracking-widest">{date}</span>
              </div>

              {entries.map((entry) => (
                <div
                  key={entry._id}
                  onClick={() => handleReopen(entry)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800/40 cursor-pointer group border-b border-slate-800/50 transition-colors"
                >
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${METHOD_STYLES[entry.method] || 'text-slate-500'}`}>
                    {entry.method}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-slate-100 text-xs font-mono truncate">{entry.url}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-mono ${statusColor(entry.response?.status)}`}>
                        {entry.response?.status || '—'}
                      </span>
                      {entry.duration && (
                        <span className="text-slate-500 text-[10px] font-mono">{entry.duration}ms</span>
                      )}
                      <span className="text-slate-500 text-[10px] font-mono">{formatTime(entry.createdAt)}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(entry._id, e)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-500 text-sm transition-opacity shrink-0"
                  >×</button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Confirm clear dialog */}
      {confirmClear && (
        <div className="border-t border-slate-800 p-4 bg-slate-900/50 shrink-0">
          <p className="text-slate-100 text-xs font-mono mb-3">Clear all history? This can't be undone.</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmClear(false)}
              className="flex-1 border border-slate-800 rounded py-1.5 text-xs font-mono text-slate-500 hover:text-slate-100 transition-colors">
              Cancel
            </button>
            <button onClick={handleClear}
              className="flex-1 bg-rose-500/20 border border-rose-500/40 rounded py-1.5 text-xs font-mono text-rose-400 hover:bg-rose-500/30 transition-colors">
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryPanel