import React, { useState } from 'react'

const statusColor = (status) => {
  if (!status) return 'text-muted'
  if (status < 300) return 'text-green'
  if (status < 400) return 'text-accent2'
  return 'text-red'
}

const syntaxHighlight = (json) => {
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'color:#ffb703'       // number — accent2
      if (/^"/.test(match)) {
        cls = /:$/.test(match)
          ? 'color:#118ab2'           // key — blue
          : 'color:#06d6a0'           // string — green
      } else if (/true|false/.test(match)) {
        cls = 'color:#9b5de5'         // bool — purple
      } else if (/null/.test(match)) {
        cls = 'color:#ef476f'         // null — red
      }
      return `<span style="${cls}">${match}</span>`
    }
  )
}

const ResponseViewer = ({ response, isLoading }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(response?.data || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full gap-3">
        <div className="w-5 h-5 border-2 border-border border-t-accent rounded-full animate-spin" />
        <span className="text-muted text-xs font-mono">Sending request...</span>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
        <svg className="w-12 h-12 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <p className="text-muted text-sm font-mono">
          Hit <span className="text-text font-bold">Send</span> to get a response
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Status + copy row */}
      <div className="flex items-center gap-4 flex-wrap shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-muted text-xs font-mono">Status</span>
          <span className={`text-xs font-mono font-bold ${statusColor(response.status)}`}>
            {response.status} {response.statusText}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted text-xs font-mono">Time</span>
          <span className="text-xs font-mono text-accent2">{response.duration}ms</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted text-xs font-mono">Size</span>
          <span className="text-xs font-mono text-blue">
            {response.size > 1024
              ? `${(response.size / 1024).toFixed(1)} KB`
              : `${response.size} B`}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="ml-auto text-xs font-mono text-muted hover:text-text border border-border rounded px-2 py-0.5 transition-colors"
        >
          {copied ? '✅ Copied' : 'Copy'}
        </button>
      </div>

      {/* Response body */}
      {response.isJson ? (
        <pre
          className="flex-1 bg-surface border border-border rounded-lg p-4 text-xs font-mono overflow-auto leading-relaxed whitespace-pre-wrap break-all"
          dangerouslySetInnerHTML={{
            __html: syntaxHighlight(response.data)
          }}
        />
      ) : (
        <pre className="flex-1 bg-surface border border-border rounded-lg p-4 text-xs font-mono text-text overflow-auto leading-relaxed whitespace-pre-wrap break-all">
          {response.data || '(empty response)'}
        </pre>
      )}
    </div>
  )
}

export default ResponseViewer