import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateActiveTab } from '../../features/request/requestSlice'

const formatJson = (str) => {
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return null
  }
}
const KVEditor = ({ rows, onChange, placeholder = 'key' }) => {
  const addRow = () => onChange([...rows, { key: '', value: '', enabled: true }])
  const removeRow = (i) => onChange(rows.filter((_, idx) => idx !== i))
  const updateRow = (i, field, value) => {
    onChange(rows.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Header */}
      <div className="grid grid-cols-[16px_1fr_1fr_24px] gap-2 px-1 mb-1">
        <span />
        <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Key</span>
        <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Value</span>
        <span />
      </div>

      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[16px_1fr_1fr_24px] gap-2 items-center">
          <input
            type="checkbox"
            checked={row.enabled}
            onChange={(e) => updateRow(i, 'enabled', e.target.checked)}
            className="accent-indigo-500"
          />
          <input
            value={row.key}
            onChange={(e) => updateRow(i, 'key', e.target.value)}
            placeholder={placeholder}
            className="bg-slate-800/40 border border-slate-800 rounded px-2 py-1 text-amber-400 text-xs font-mono outline-none focus:border-indigo-500"
          />
          <input
            value={row.value}
            onChange={(e) => updateRow(i, 'value', e.target.value)}
            placeholder="value"
            className="bg-slate-800/40 border border-slate-800 rounded px-2 py-1 text-slate-100 text-xs font-mono outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => removeRow(i)}
            className="text-slate-500 hover:text-rose-400 text-sm transition-colors"
          >×</button>
        </div>
      ))}

      <button
        onClick={addRow}
        className="mt-2 text-xs font-mono text-slate-500 hover:text-indigo-400 transition-colors text-left"
      >
        + Add row
      </button>
    </div>
  )
}

const BODY_TYPES = ['none', 'json', 'raw', 'x-www-form-urlencoded']

const RequestTabs = ({ tab }) => {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('params')

  // Tabs — NO response tab (response is now in bottom panel)
  const tabs = [
    { id: 'params',  label: 'Params',  count: tab.params?.filter(p => p.enabled && p.key).length || 0 },
    { id: 'headers', label: 'Headers', count: tab.headers?.filter(h => h.enabled && h.key).length || 0 },
    { id: 'body',    label: 'Body' },
    { id: 'description', label: 'Description' },
  ]

  return (
    <div className="flex flex-col h-full">

      {/* Tab bar */}
      <div className="flex border-b border-slate-800 bg-[#1a1d2e] shrink-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-xs font-mono flex items-center gap-1.5 border-b-2 transition-colors
              ${activeTab === t.id
                ? 'border-indigo-500 text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-200'
              }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-1 rounded leading-none py-0.5">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#0f111a]">

        {activeTab === 'params' && (
          <KVEditor
            rows={tab.params || []}
            onChange={(rows) => dispatch(updateActiveTab({ params: rows }))}
            placeholder="parameter"
          />
        )}

        {activeTab === 'headers' && (
          <KVEditor
            rows={tab.headers || []}
            onChange={(rows) => dispatch(updateActiveTab({ headers: rows }))}
            placeholder="header"
          />
        )}
        {/* // Add description tab content: */}
        {activeTab === 'description' && (
          <div className="flex flex-col gap-2">
            <p className="text-slate-500 text-xs font-mono">
              Add notes or documentation for this request.
            </p>
            <textarea
              value={tab.description || ''}
              onChange={(e) => dispatch(updateActiveTab({ description: e.target.value }))}
              placeholder="Describe what this request does..."
              rows={12}
              className="w-full bg-slate-800/40 border border-slate-800 rounded px-3 py-2 text-slate-100 text-xs font-mono outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
            {tab.description && (
              <p className="text-slate-500 text-[10px] font-mono text-right">
                {tab.description.length} chars
              </p>
            )}
          </div>
        )}

        {activeTab === 'body' && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-4 flex-wrap">
              {BODY_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="bodyType"
                    value={type}
                    checked={tab.body?.type === type}
                    onChange={() => dispatch(updateActiveTab({
                      body: { ...tab.body, type }
                    }))}
                    className="accent-indigo-500"
                  />
                  <span className="text-xs font-mono text-slate-500">{type}</span>
                </label>
              ))}
            </div>

            {/* // Inside body tab, replace textarea section: */}
            {tab.body?.type !== 'none' && (
              <div className="flex flex-col gap-2">
                {/* Format button — only show for json type */}
                {tab.body?.type === 'json' && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs font-mono">Body content</span>
                    <button
                      onClick={() => {
                        const formatted = formatJson(tab.body?.content || '')
                        if (formatted) {
                          dispatch(updateActiveTab({ body: { ...tab.body, content: formatted } }))
                        }
                      }}
                      className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 rounded px-2 py-0.5 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 6h16M4 12h8m-8 6h16" />
                      </svg>
                      Format JSON
                    </button>
                  </div>
                )}
                <textarea
                  value={tab.body?.content || ''}
                  onChange={(e) => dispatch(updateActiveTab({
                    body: { ...tab.body, content: e.target.value }
                  }))}
                  placeholder={tab.body?.type === 'json'
                    ? '{\n  "key": "value"\n}'
                    : 'Request body...'
                  }
                  rows={10}
                  className="w-full bg-slate-800/40 border border-slate-800 rounded px-3 py-2 text-slate-100 text-xs font-mono outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default RequestTabs