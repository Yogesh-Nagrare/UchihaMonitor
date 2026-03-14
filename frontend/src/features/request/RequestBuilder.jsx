import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectActiveTab,
  updateActiveTab,
  setTabResponse,
  setTabLoading,
} from '../../features/request/requestSlice'
import { useGetEnvironmentsQuery } from '../../services/environmentApi'
import { useLogHistoryMutation } from '../../services/historyApi'
import { addToast } from '../../features/ui/uiSlice'
import RequestTabs from './RequestTabs'
import SaveRequestModal from './SaveRequestModal'

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const METHOD_COLORS = {
  GET:    'text-green',
  POST:   'text-accent',
  PUT:    'text-accent2',
  PATCH:  'text-purple',
  DELETE: 'text-red',
}

// ── Use backend URL from env (works in both dev and production) ───────────────
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const RequestBuilder = () => {
  const dispatch = useDispatch()
  const tab = useSelector(selectActiveTab)
  const [showSave, setShowSave] = useState(false)
  const [logHistory] = useLogHistoryMutation()

  const { data: envData } = useGetEnvironmentsQuery()
  const environments = envData?.environments || []
  const activeEnv = environments.find((e) => e.isActive)

  const resolveUrl = (url) => {
    if (!activeEnv?.variables) return url
    let resolved = url
    activeEnv.variables
      .filter((v) => v.enabled && v.key)
      .forEach((v) => {
        resolved = resolved.replaceAll(`{{${v.key}}}`, v.value)
      })
    return resolved
  }

  if (!tab) return null

  const handleSend = async () => {
    if (!tab.url.trim()) return

    dispatch(setTabLoading({ tabId: tab.tabId, isLoading: true }))
    dispatch(setTabResponse({ tabId: tab.tabId, response: null }))

    const startTime = Date.now()

    try {
      // ── Build headers ─────────────────────────────────────────
      const headers = {}
      tab.headers
        .filter((h) => h.enabled && h.key.trim())
        .forEach((h) => { headers[h.key] = h.value })

      // ── Build params ──────────────────────────────────────────
      const enabledParams = tab.params.filter((p) => p.enabled && p.key.trim())

      // ── Resolve final URL ─────────────────────────────────────
      const base = (tab.baseUrl || '').replace(/\/$/, '')
      const path = tab.url.trim()
      let url = resolveUrl(path.startsWith('http') ? path : base ? base + path : path)

      if (enabledParams.length > 0) {
        const qs = enabledParams
          .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
          .join('&')
        url += (url.includes('?') ? '&' : '?') + qs
      }

      // ── Build body ────────────────────────────────────────────
      let body = undefined
      if (!['GET', 'HEAD'].includes(tab.method) && tab.body?.type !== 'none') {
        body = tab.body.content
        if (tab.body.type === 'json') {
          headers['Content-Type'] = 'application/json'
        }
      }

      // ── Smart routing ─────────────────────────────────────────
      // localhost/127.0.0.1 → direct fetch
      // everything else     → backend proxy (avoids CORS)
      const isExternal =
        url.startsWith('http') &&
        !url.includes('localhost') &&
        !url.includes('127.0.0.1')

      let res

      if (isExternal) {
        // Parse body safely before sending to proxy
        let parsedBody = undefined
        if (body !== undefined) {
          try { parsedBody = JSON.parse(body) }
          catch { parsedBody = body }
        }

        // ← Use API_URL so this works on Vercel too (not just localhost)
        res = await fetch(`${API_URL}/proxy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            url,
            method: tab.method,
            headers,
            body: parsedBody,
          }),
        })
      } else {
        // Direct fetch for localhost APIs (dev only)
        res = await fetch(url, {
          method: tab.method,
          headers,
          body,
          credentials: 'include',
        })
      }

      // ── Parse response ────────────────────────────────────────
      const duration = Date.now() - startTime
      const contentType = res.headers.get('content-type') || ''
      const rawText = await res.text()

      let data = rawText
      let isJson = false

      if (contentType.includes('application/json') || contentType.includes('graphql')) {
        try {
          data = JSON.stringify(JSON.parse(rawText), null, 2)
          isJson = true
        } catch { data = rawText }
      }

      // Auto-detect JSON even without correct content-type
      if (!isJson && (rawText.trim().startsWith('{') || rawText.trim().startsWith('['))) {
        try {
          data = JSON.stringify(JSON.parse(rawText), null, 2)
          isJson = true
        } catch { /* not JSON, keep as text */ }
      }

      // ── Capture response headers ──────────────────────────────
      const responseHeaders = {}
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      // ── Update tab ────────────────────────────────────────────
      dispatch(setTabResponse({
        tabId: tab.tabId,
        response: {
          status: res.status,
          statusText: res.statusText,
          duration,
          data,
          isJson,
          size: new Blob([rawText]).size,
          headers: responseHeaders,
        },
      }))

      // ── Log to history ────────────────────────────────────────
      try {
        await logHistory({
          method: tab.method,
          url,
          headers,
          params: Object.fromEntries(enabledParams.map((p) => [p.key, p.value])),
          body: body || '',
          response: {
            status: res.status,
            statusText: res.statusText,
            data: rawText.slice(0, 5000),
          },
          duration,
        })
      } catch (e) {
        console.warn('History log failed:', e)
      }

      // ── Toast ─────────────────────────────────────────────────
      dispatch(addToast({
        message: `${res.status} ${res.statusText}`,
        type: res.ok ? 'success' : 'error',
        duration: 2500,
      }))

    } catch (err) {
      dispatch(setTabResponse({
        tabId: tab.tabId,
        response: {
          status: 0,
          statusText: 'Network Error',
          duration: Date.now() - startTime,
          data: err.message,
          isJson: false,
          size: 0,
        },
      }))
      dispatch(addToast({
        title: 'Network Error',
        message: err.message,
        type: 'error',
      }))
    } finally {
      dispatch(setTabLoading({ tabId: tab.tabId, isLoading: false }))
    }
  }

  return (
    <div className="flex flex-col h-full">

      {/* BASE URL row */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2 shrink-0">
        <span className="text-muted text-xs font-mono whitespace-nowrap uppercase tracking-wider">
          Base URL
        </span>
        <input
          type="text"
          value={tab.baseUrl ?? ''}
          onChange={(e) => dispatch(updateActiveTab({ baseUrl: e.target.value }))}
          placeholder="https://api.example.com  or  http://localhost:3000"
          className="flex-1 bg-transparent border border-border rounded px-3 py-1.5 text-text text-xs font-mono outline-none focus:border-accent transition-colors"
        />
        {/* Routing indicator */}
        {tab.baseUrl && (
          <span className={`text-xs font-mono px-2 py-0.5 rounded border shrink-0 ${
            tab.baseUrl.includes('localhost') || tab.baseUrl.includes('127.0.0.1')
              ? 'text-green border-green/30 bg-green/5'
              : 'text-blue border-blue/30 bg-blue/5'
          }`}>
            {tab.baseUrl.includes('localhost') || tab.baseUrl.includes('127.0.0.1')
              ? 'DIRECT'
              : 'PROXIED'
            }
          </span>
        )}
      </div>

      {/* Method + URL + Save + Send */}
      <div className="flex items-center gap-2 px-4 pb-3 border-b border-border shrink-0">
        <select
          value={tab.method}
          onChange={(e) => dispatch(updateActiveTab({ method: e.target.value }))}
          className={`bg-surface border border-border rounded px-3 py-2 text-sm font-mono font-bold outline-none cursor-pointer min-w-[80px] shrink-0 ${METHOD_COLORS[tab.method]}`}
        >
          {METHODS.map((m) => (
            <option key={m} value={m} className="text-text bg-surface">{m}</option>
          ))}
        </select>

        <input
          type="text"
          value={tab.url}
          onChange={(e) => dispatch(updateActiveTab({ url: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="/endpoint  or  https://full-url.com/path"
          className="flex-1 min-w-0 bg-transparent border border-border rounded px-4 py-2 text-text text-sm font-mono outline-none focus:border-accent transition-colors"
        />

        <button
          onClick={() => setShowSave(true)}
          disabled={!tab.url.trim()}
          className="border border-border hover:border-accent text-muted hover:text-accent text-xs font-mono px-4 py-2 rounded transition-colors disabled:opacity-40 shrink-0"
        >
          {tab.id ? 'Update' : 'Save'}
        </button>

        <button
          onClick={handleSend}
          disabled={tab.isLoading || !tab.url.trim()}
          className="bg-accent hover:opacity-90 disabled:opacity-40 text-white text-sm font-mono font-bold px-6 py-2 rounded transition-opacity flex items-center gap-2 shrink-0"
        >
          {tab.isLoading
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : 'Send'
          }
        </button>
      </div>

      {/* Tabs */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <RequestTabs tab={tab} />
      </div>

      {showSave && <SaveRequestModal onClose={() => setShowSave(false)} />}
    </div>
  )
}

export default RequestBuilder