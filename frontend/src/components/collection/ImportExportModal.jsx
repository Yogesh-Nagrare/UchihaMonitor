import React, { useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import {
  useImportCollectionMutation,
} from '../../services/collectionApi'
import { addToast } from '../../features/ui/uiSlice'

const ImportExportModal = ({ collection, mode = 'import', onClose }) => {
  const dispatch = useDispatch()
  const [importCollection] = useImportCollectionMutation()
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  // ── EXPORT ────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const res = await fetch(`/collection/${collection._id}/export`, {
        credentials: 'include',
      })
      const json = await res.json()
      const blob = new Blob([JSON.stringify(json, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${collection.name.replace(/\s+/g, '_')}_collection.json`
      a.click()
      URL.revokeObjectURL(url)
      dispatch(addToast({ message: 'Collection exported!', type: 'success' }))
      onClose()
    } catch (err) {
      dispatch(addToast({ message: 'Export failed', type: 'error' }))
    }
  }

  // ── IMPORT ────────────────────────────────────────────────────
  const parseFile = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result)
        setPreview(json)
        setError(null)
      } catch {
        setError('Invalid JSON file')
        setPreview(null)
      }
    }
    reader.readAsText(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/json' || file?.name.endsWith('.json')) {
      parseFile(file)
    } else {
      setError('Please drop a JSON file')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) parseFile(file)
  }

  const handleImport = async () => {
    if (!preview) return
    setLoading(true)
    try {
      const res = await importCollection(preview)
      if (res.error) throw new Error(res.error.data?.message || 'Import failed')
      dispatch(addToast({
        message: res.data.message,
        type: 'success',
      }))
      onClose()
    } catch (err) {
      dispatch(addToast({ message: err.message, type: 'error' }))
    } finally {
      setLoading(false)
    }
  }

  // ── Count requests in preview ─────────────────────────────────
  const previewCount = preview?.requests?.length ||
    preview?.item?.length || 0

  const previewName = preview?.info?.name ||
    preview?.collection?.name || 'Unknown'

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1d2e] border border-slate-800 rounded-xl w-full max-w-md flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-slate-100 font-mono text-sm font-bold">
            {mode === 'export' ? '📤 Export Collection' : '📥 Import Collection'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-100 text-lg">×</button>
        </div>

        <div className="p-5 flex flex-col gap-4">

          {/* EXPORT MODE */}
          {mode === 'export' && (
            <>
              <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-4 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <div>
                    <p className="text-slate-100 text-sm font-mono font-bold">{collection.name}</p>
                    <p className="text-slate-500 text-xs font-mono">{collection.description || 'No description'}</p>
                  </div>
                </div>
              </div>

              <p className="text-slate-500 text-xs font-mono">
                Exports as JSON. Compatible with Mini Postman import and partially with Postman.
              </p>

              <button
                onClick={handleExport}
                className="bg-indigo-600 text-white text-xs font-mono font-bold py-2.5 rounded-lg hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download JSON
              </button>
            </>
          )}

          {/* IMPORT MODE */}
          {mode === 'import' && (
            <>
              {/* Drop zone */}
              {!preview && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors
                    ${dragging
                      ? 'border-indigo-500 bg-indigo-500/5'
                      : 'border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/40'
                    }`}
                >
                  <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="text-center">
                    <p className="text-slate-100 text-xs font-mono">Drop JSON file here</p>
                    <p className="text-slate-500 text-xs font-mono mt-1">or click to browse</p>
                  </div>
                  <p className="text-slate-500 text-[10px] font-mono">
                    Supports UchihaMonitor + Postman v2.1 format
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg px-4 py-3">
                  <p className="text-rose-400 text-xs font-mono">{error}</p>
                </div>
              )}

              {/* Preview */}
              {preview && (
                <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-100 text-xs font-mono font-bold">Preview</p>
                    <button
                      onClick={() => { setPreview(null); setError(null) }}
                      className="text-slate-500 hover:text-slate-200 text-xs font-mono"
                    >
                      ✕ Clear
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs font-mono">Collection</span>
                      <span className="text-slate-100 text-xs font-mono font-bold">{previewName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs font-mono">Requests</span>
                      <span className="text-emerald-400 text-xs font-mono font-bold">{previewCount} found</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs font-mono">Format</span>
                      <span className="text-cyan-400 text-xs font-mono">
                        {preview.info?.source === 'UchihaMonitor' ? 'Mini Postman' : 'Postman v2.1'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Import button */}
              {preview && (
                <button
                  onClick={handleImport}
                  disabled={loading || !preview}
                  className="bg-indigo-600 text-white text-xs font-mono font-bold py-2.5 rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                      Import {previewCount} Requests
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImportExportModal