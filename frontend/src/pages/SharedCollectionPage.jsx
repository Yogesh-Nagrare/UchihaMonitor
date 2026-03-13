import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const METHOD_STYLES = {
  GET:    'bg-green/10 text-green',
  POST:   'bg-accent/10 text-accent',
  PUT:    'bg-accent2/10 text-accent2',
  PATCH:  'bg-purple/10 text-purple',
  DELETE: 'bg-red/10 text-red',
}

const SharedCollectionPage = () => {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)

useEffect(() => {
  const fetchShared = async () => {
    try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

      // Call backend directly — no credentials, no cookie sent
        // In useEffect:
        const res = await fetch(`${API_URL}/collection/shared/${token}`, {
        credentials: 'omit',
        })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      setData(json)
      if (json.requests?.length > 0) setSelectedRequest(json.requests[0])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  fetchShared()
}, [token])
  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
      <div className="text-4xl">🔒</div>
      <p className="text-text font-mono text-sm">Collection not found or no longer shared.</p>
      <a href="/" className="text-accent text-xs font-mono hover:underline">← Go to Mini Postman</a>
    </div>
  )

  const { collection, requests } = data

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* TopBar */}
      <div className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
        <div style={{ fontFamily: 'Syne, sans-serif' }} className="font-extrabold text-xl">
          <span className="text-accent">mini</span>
          <span className="text-text">postman</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted">Shared by</span>
          <span className="text-xs font-mono text-text">
            {collection.owner?.firstName || collection.owner?.emailId}
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded border border-green/30 text-green bg-green/5">
            READ ONLY
          </span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">

        {/* Left — requests list */}
        <div className="w-72 bg-surface border-r border-border flex flex-col shrink-0">

          {/* Collection header */}
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-accent2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              <span className="text-text font-mono text-sm font-bold">{collection.name}</span>
            </div>
            {collection.description && (
              <p className="text-muted text-xs font-mono mt-1">{collection.description}</p>
            )}
            <p className="text-muted text-xs font-mono mt-2">
              {requests.length} request{requests.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Requests */}
          <div className="flex-1 overflow-y-auto py-2">
            {requests.length === 0 ? (
              <p className="text-muted text-xs font-mono px-4 py-4 italic">No requests in this collection.</p>
            ) : (
              requests.map((req) => (
                <div
                  key={req._id}
                  onClick={() => setSelectedRequest(req)}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-l-2 transition-colors
                    ${selectedRequest?._id === req._id
                      ? 'bg-surface2 border-l-accent'
                      : 'border-l-transparent hover:bg-surface2'
                    }`}
                >
                  <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${METHOD_STYLES[req.method] || 'text-muted'}`}>
                    {req.method}
                  </span>
                  <span className="text-text text-xs font-mono truncate">{req.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right — request detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedRequest ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted text-sm font-mono">Select a request to view details</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 max-w-3xl">

              {/* Request name + method + url */}
              <div>
                <h1 className="text-text font-mono text-lg font-bold mb-3">{selectedRequest.name}</h1>
                <div className="flex items-center gap-3 bg-surface border border-border rounded-lg px-4 py-3">
                  <span className={`text-sm font-mono font-bold px-2 py-1 rounded ${METHOD_STYLES[selectedRequest.method]}`}>
                    {selectedRequest.method}
                  </span>
                  <span className="text-text text-sm font-mono">{selectedRequest.url}</span>
                </div>
              </div>

              {/* Headers */}
              {selectedRequest.headers?.filter(h => h.key).length > 0 && (
                <Section title="Headers">
                  <KVTable rows={selectedRequest.headers.filter(h => h.key)} />
                </Section>
              )}

              {/* Params */}
              {selectedRequest.params?.filter(p => p.key).length > 0 && (
                <Section title="Query Params">
                  <KVTable rows={selectedRequest.params.filter(p => p.key)} />
                </Section>
              )}

              {/* Body */}
              {selectedRequest.body?.type !== 'none' && selectedRequest.body?.content && (
                <Section title={`Body — ${selectedRequest.body.type}`}>
                  <pre className="bg-surface border border-border rounded-lg p-4 text-xs font-mono text-text overflow-auto whitespace-pre-wrap">
                    {selectedRequest.body.content}
                  </pre>
                </Section>
              )}

              {/* No details */}
              {!selectedRequest.headers?.filter(h => h.key).length &&
               !selectedRequest.params?.filter(p => p.key).length &&
               selectedRequest.body?.type === 'none' && (
                <p className="text-muted text-xs font-mono italic">No headers, params, or body configured.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const Section = ({ title, children }) => (
  <div>
    <h3 className="text-muted text-xs font-mono uppercase tracking-widest mb-2">{title}</h3>
    {children}
  </div>
)

const KVTable = ({ rows }) => (
  <div className="bg-surface border border-border rounded-lg overflow-hidden">
    <div className="grid grid-cols-2 border-b border-border px-4 py-2">
      <span className="text-muted text-xs font-mono uppercase tracking-wider">Key</span>
      <span className="text-muted text-xs font-mono uppercase tracking-wider">Value</span>
    </div>
    {rows.map((row, i) => (
      <div key={i} className="grid grid-cols-2 px-4 py-2 border-b border-border last:border-0">
        <span className="text-accent2 text-xs font-mono">{row.key}</span>
        <span className="text-text text-xs font-mono">{row.value}</span>
      </div>
    ))}
  </div>
)

export default SharedCollectionPage