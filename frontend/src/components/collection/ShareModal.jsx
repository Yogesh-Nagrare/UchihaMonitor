import React, { useState } from 'react'
import {
  useShareCollectionMutation,
  useUnshareCollectionMutation,
} from '../../services/collectionApi'

const ShareModal = ({ collection, onClose }) => {
  const [share] = useShareCollectionMutation()
  const [unshare] = useUnshareCollectionMutation()
  const [shareData, setShareData] = useState(
    collection.isShared
      ? { shareToken: collection.shareToken, shareUrl: `${window.location.origin}/shared/${collection.shareToken}` }
      : null
  )
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

    const handleShare = async () => {
    setLoading(true)
    try {
        const res = await share(collection._id)
        // Use the shareUrl from backend response directly
        setShareData({
        shareToken: res.data.shareToken,
        shareUrl: res.data.shareUrl,  // ← backend returns this
        })
    } finally {
        setLoading(false)
    }
    }

  const handleUnshare = async () => {
    setLoading(true)
    try {
      await unshare(collection._id)
      setShareData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareData.shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1a1d2e] border border-slate-800 rounded-lg p-6 w-full max-w-md flex flex-col gap-4">

        <div className="flex items-center justify-between">
          <h2 className="text-slate-100 font-mono text-sm font-bold">
            Share — {collection.name}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-100">×</button>
        </div>

        {!shareData ? (
          <div className="flex flex-col gap-3">
            <p className="text-slate-500 text-xs font-mono">
              Generate a public link so anyone can view this collection and its requests — no login needed.
            </p>
            <button
              onClick={handleShare}
              disabled={loading}
              className="bg-indigo-600 text-white text-xs font-mono font-bold px-4 py-2 rounded hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Generating...' : 'Generate Share Link'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-emerald-400 text-xs font-mono">✅ Collection is publicly shared</p>

            {/* Share URL */}
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareData.shareUrl}
                className="flex-1 bg-slate-800/40 border border-slate-800 rounded px-3 py-2 text-slate-100 text-xs font-mono outline-none"
              />
              <button
                onClick={handleCopy}
                className="border border-slate-800 hover:border-indigo-500 text-slate-500 hover:text-indigo-400 text-xs font-mono px-3 py-2 rounded transition-colors whitespace-nowrap"
              >
                {copied ? '✅ Copied!' : 'Copy'}
              </button>
            </div>

            <button
              onClick={handleUnshare}
              disabled={loading}
              className="text-rose-400 text-xs font-mono hover:underline text-left disabled:opacity-50"
            >
              {loading ? 'Removing...' : 'Remove public link'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShareModal