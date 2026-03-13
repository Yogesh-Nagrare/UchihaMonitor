import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from '../features/auth/authSlice'
import { useGetCollectionsQuery } from '../services/collectionApi'
import { useGetEnvironmentsQuery } from '../services/environmentApi'
import { useGetHistoryQuery } from '../services/historyApi'

const ProfilePage = ({ onClose }) => {
  const user = useSelector(selectUser)
  const [copied, setCopied] = useState(false)

  const { data: colData } = useGetCollectionsQuery()
  const { data: envData } = useGetEnvironmentsQuery()
  const { data: histData } = useGetHistoryQuery({ limit: 1 })

  const collections = colData?.collections || []
  const environments = envData?.environments || []
  const totalHistory = histData?.total || 0
  const totalRequests = collections.reduce((acc, c) => acc, 0)
  const sharedCollections = collections.filter(c => c.isShared).length
  const activeEnv = environments.find(e => e.isActive)

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(user?.emailId || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const joinedDate = user?._id
    ? new Date(parseInt(user._id.substring(0, 8), 16) * 1000).toLocaleDateString('en-US', {
        month: 'long', year: 'numeric'
      })
    : '—'

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg flex flex-col overflow-hidden shadow-2xl">

        {/* Header banner */}
        <div className="relative h-24 bg-gradient-to-r from-accent/20 via-purple/20 to-blue/20 shrink-0">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-surface/80 text-muted hover:text-text transition-colors text-sm"
          >×</button>

          {/* Avatar */}
          <div className="absolute -bottom-8 left-6">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt="avatar"
                className="w-16 h-16 rounded-full border-4 border-surface shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border-4 border-surface bg-accent flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user?.firstName?.[0] || 'U'}
              </div>
            )}
          </div>

          {/* Role badge */}
          <div className="absolute top-3 left-6">
            <span className={`text-xs font-mono px-2 py-0.5 rounded border
              ${user?.role === 'admin'
                ? 'border-accent/40 text-accent bg-accent/10'
                : 'border-green/40 text-green bg-green/10'
              }`}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="pt-10 px-6 pb-6 flex flex-col gap-5">

          {/* Name + email */}
          <div>
            <h2 className="text-text font-mono text-lg font-bold">
              {user?.firstName} {user?.lastName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted text-xs font-mono">{user?.emailId}</span>
              <button
                onClick={handleCopyEmail}
                className="text-xs font-mono text-muted hover:text-accent transition-colors"
              >
                {copied ? '✅' : '📋'}
              </button>
            </div>
            <p className="text-muted text-xs font-mono mt-1">
              Joined {joinedDate}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Collections"
              value={collections.length}
              icon="📁"
              color="text-accent2"
            />
            <StatCard
              label="Shared"
              value={sharedCollections}
              icon="🔗"
              color="text-blue"
            />
            <StatCard
              label="Environments"
              value={environments.length}
              icon="🌍"
              color="text-purple"
            />
            <StatCard
              label="Requests Fired"
              value={totalHistory}
              icon="🚀"
              color="text-green"
            />
          </div>

          {/* Active environment */}
          <div className="bg-surface2 border border-border rounded-lg px-4 py-3 flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full shrink-0 ${activeEnv ? 'bg-green' : 'bg-border'}`} />
            <div className="flex flex-col">
              <span className="text-muted text-xs font-mono uppercase tracking-wider">Active Environment</span>
              <span className="text-text text-xs font-mono mt-0.5">
                {activeEnv ? activeEnv.name : 'None selected'}
              </span>
            </div>
            {activeEnv && (
              <span className="ml-auto text-muted text-xs font-mono">
                {activeEnv.variables?.filter(v => v.enabled).length} var{activeEnv.variables?.filter(v => v.enabled).length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Auth provider */}
          <div className="flex items-center gap-3 bg-surface2 border border-border rounded-lg px-4 py-3">
            {/* Google icon */}
            <svg width="16" height="16" viewBox="0 0 48 48" className="shrink-0">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <div>
              <span className="text-muted text-xs font-mono uppercase tracking-wider">Signed in with</span>
              <p className="text-text text-xs font-mono">Google OAuth</p>
            </div>
            <span className="ml-auto text-green text-xs font-mono">✓ Verified</span>
          </div>

        </div>
      </div>
    </div>
  )
}

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-surface2 border border-border rounded-lg px-4 py-3 flex items-center gap-3">
    <span className="text-xl">{icon}</span>
    <div>
      <p className={`font-mono font-bold text-lg leading-none ${color}`}>{value}</p>
      <p className="text-muted text-xs font-mono mt-0.5">{label}</p>
    </div>
  </div>
)

export default ProfilePage