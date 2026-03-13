import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectTabs,
  selectActiveTabId,
  addTab,
  closeTab,
  closeAllExcept,
  setActiveTab,
  selectActiveTab,
} from '../../features/request/requestSlice'
import RequestBuilder from '../../features/request/RequestBuilder'
import ResponseViewer from '../../features/request/ResponseViewer'

const METHOD_COLORS = {
  GET:    'text-emerald-400',
  POST:   'text-indigo-400',
  PUT:    'text-amber-400',
  PATCH:  'text-violet-400',
  DELETE: 'text-rose-400',
}

const ResponseHeaders = ({ headers }) => {
  if (!headers || Object.keys(headers).length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-slate-500 text-xs font-mono">No response headers yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-2 gap-4 px-2 pb-2 border-b border-slate-800">
        <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Header</span>
        <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Value</span>
      </div>
      {Object.entries(headers).map(([key, value]) => (
        <div key={key} className="grid grid-cols-2 gap-4 px-2 py-1.5 hover:bg-slate-800/50 rounded transition-colors">
          <span className="text-amber-400/90 text-xs font-mono truncate">{key}</span>
          <span className="text-slate-300 text-xs font-mono break-all">{value}</span>
        </div>
      ))}
    </div>
  )
}

const MainPanel = () => {
  const dispatch = useDispatch()
  const tabs = useSelector(selectTabs)
  const activeTabId = useSelector(selectActiveTabId)
  const activeTab = useSelector(selectActiveTab)

  // Resizable split — top panel height as percentage
  const [topHeight, setTopHeight] = useState(55)
  const isDragging = React.useRef(false)
  const [responseTab, setResponseTab] = useState('body')

  const handleDragStart = (e) => {
    isDragging.current = true
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'

    const container = e.currentTarget.closest('[data-split]')

    const onMove = (moveEvent) => {
      if (!isDragging.current) return
      const rect = container.getBoundingClientRect()
      const offsetY = moveEvent.clientY - rect.top
      const pct = (offsetY / rect.height) * 100
      // Clamp between 25% and 75%
      setTopHeight(Math.min(75, Math.max(25, pct)))
    }

    const onUp = () => {
      isDragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0f111a] overflow-hidden">

      {/* ── Tab bar ── */}
      <div className="flex items-center bg-[#1a1d2e] border-b border-slate-800 overflow-x-auto shrink-0 min-h-[38px]">
        {tabs.map((tab) => (
          <div
            key={tab.tabId}
            onClick={() => dispatch(setActiveTab(tab.tabId))}
            className={`flex items-center gap-2 px-3 py-2 border-r border-slate-800 cursor-pointer text-xs font-mono shrink-0 group transition-colors max-w-[180px] border-t-2
              ${activeTabId === tab.tabId
                ? 'bg-[#0f111a] text-slate-100 border-t-indigo-500'
                : 'text-slate-500 hover:bg-slate-800/40 border-t-transparent'
              }`}
          >
            <span className={`font-bold text-xs shrink-0 ${METHOD_COLORS[tab.method] || 'text-slate-500'}`}>
              {tab.method}
            </span>
            <span className="truncate max-w-[100px]">{tab.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); dispatch(closeTab(tab.tabId)) }}
              className="opacity-0 group-hover:opacity-100 hover:text-rose-500 shrink-0 transition-opacity ml-1 text-sm"
            >×</button>
          </div>
        ))}

        {/* New tab */}
        <button
          onClick={() => dispatch(addTab())}
          className="px-3 py-2 text-slate-500 hover:text-indigo-400 text-lg shrink-0 hover:bg-slate-800/40 transition-colors border-r border-slate-800"
          title="New tab"
        >+</button>

        {/* Close others */}
        {tabs.length > 1 && (
          <button
            onClick={() => dispatch(closeAllExcept(activeTabId))}
            className="px-3 py-2 text-slate-500 hover:text-rose-400 text-xs font-mono shrink-0 hover:bg-slate-800/40 transition-colors ml-auto border-l border-slate-800"
            title="Close all other tabs"
          >
            ✕ others
          </button>
        )}
      </div>

      {/* ── Split panel ── */}
      <div className="flex-1 flex flex-col min-h-0" data-split="true">

        {/* TOP — Request builder */}
        <div
          className="overflow-hidden flex flex-col shrink-0"
          style={{ height: `${topHeight}%` }}
        >
          <RequestBuilder />
        </div>

        {/* ── Drag handle ── */}
        <div
          onMouseDown={handleDragStart}
          className="h-1 bg-slate-800 hover:bg-indigo-500 cursor-row-resize shrink-0 transition-colors group relative flex items-center justify-center"
          title="Drag to resize"
        >
          {/* Drag dots indicator */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1 h-1 rounded-full bg-indigo-200" />
            <div className="w-1 h-1 rounded-full bg-indigo-200" />
            <div className="w-1 h-1 rounded-full bg-indigo-200" />
          </div>
        </div>

        {/* BOTTOM — Response */}
        <div className="flex flex-col min-h-0 overflow-hidden" style={{ height: `${100 - topHeight}%` }}>

          {/* Response header bar */}
          <div className="flex items-center gap-3 px-4 py-2 bg-[#1a1d2e] border-b border-slate-800 shrink-0">
            <span className="text-slate-500 text-xs font-mono uppercase tracking-widest">Response</span>

            {activeTab?.response && (
              <>
                <span className={`text-xs font-mono font-bold ${
                  activeTab.response.status < 300 ? 'text-emerald-400' :
                  activeTab.response.status < 400 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {activeTab.response.status} {activeTab.response.statusText}
                </span>
                <span className="text-xs font-mono text-indigo-300">{activeTab.response.duration}ms</span>
                <span className="text-xs font-mono text-cyan-400">
                  {activeTab.response.size > 1024
                    ? `${(activeTab.response.size / 1024).toFixed(1)} KB`
                    : `${activeTab.response.size} B`}
                </span>
              </>
            )}

            {activeTab?.isLoading && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-slate-500 text-xs font-mono">Sending...</span>
              </div>
            )}

            {/* Response sub-tabs */}
            <div className="ml-auto flex items-center gap-1">
              {['body', 'headers'].map((t) => (
                <button
                  key={t}
                  onClick={() => setResponseTab(t)}
                  className={`text-xs font-mono px-3 py-1 rounded transition-colors capitalize
                    ${responseTab === t
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-500 hover:text-slate-200'
                    }`}
                >
                  {t}
                  {t === 'headers' && activeTab?.response?.headers && (
                    <span className="ml-1 text-[10px] opacity-70">
                      ({Object.keys(activeTab.response.headers).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Response content */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {responseTab === 'body' && (
              <ResponseViewer
                response={activeTab?.response}
                isLoading={activeTab?.isLoading}
              />
            )}
            {responseTab === 'headers' && (
              <ResponseHeaders headers={activeTab?.response?.headers} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainPanel