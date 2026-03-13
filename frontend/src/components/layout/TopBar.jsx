import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLogoutMutation } from '../../services/authApi'
import { clearUser, selectUser } from '../../features/auth/authSlice'
import {
  useGetEnvironmentsQuery,
  useActivateEnvironmentMutation,
} from '../../services/environmentApi'
import EnvironmentModal from '../environment/EnvironmentModal'
import ProfilePage from '../../pages/ProfilePage'

const TopBar = ({ onToggleHistory, historyOpen }) => {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const [logout] = useLogoutMutation()
  const [showMenu, setShowMenu] = useState(false)
  const [showEnvModal, setShowEnvModal] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const { data: envData } = useGetEnvironmentsQuery()
  const [activateEnvironment] = useActivateEnvironmentMutation()
  const environments = envData?.environments || []
  const activeEnv = environments.find((e) => e.isActive)

  const handleLogout = async () => {
    await logout()
    dispatch(clearUser())
  }

  const handleEnvChange = async (e) => {
    const val = e.target.value
    if (val === '__manage__') { setShowEnvModal(true); return }
    if (val) await activateEnvironment(val)
  }

  return (
    <>
      <div className="h-12 bg-[#1a1d2e] border-b border-slate-800 flex items-center justify-between px-4 shrink-0">

        {/* Logo */}
        <div style={{ fontFamily: 'Syne, sans-serif' }} className="font-extrabold text-lg tracking-tight">
          <span className="text-indigo-400">mini</span>
          <span className="text-slate-100">postman</span>
        </div>

        {/* Center — History + Environment */}
        <div className="flex items-center gap-2">

          {/* History toggle */}
          <button
            onClick={onToggleHistory}
            title="Request History"
            className={`p-1.5 rounded transition-colors ${
              historyOpen
                ? 'text-indigo-400 bg-slate-800/60'
                : 'text-slate-500 hover:text-slate-100 hover:bg-slate-800/40'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-slate-800" />

          {/* Globe icon */}
          <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
          </svg>

          {/* Environment selector */}
          <select
            value={activeEnv?._id || ''}
            onChange={handleEnvChange}
            className="bg-slate-800/40 border border-slate-700/50 rounded px-2 py-1 text-slate-100 text-xs font-mono outline-none cursor-pointer max-w-[200px]"
          >
            <option value="">No Environment</option>
            {environments.map((env) => (
              <option key={env._id} value={env._id}>{env.name}</option>
            ))}
            <option value="__manage__">⚙ Manage Environments</option>
          </select>
        </div>

        {/* Right — User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 hover:bg-slate-800/60 rounded-lg px-2 py-1.5 transition-colors"
          >
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt="avatar"
                className="w-7 h-7 rounded-full border border-slate-700"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.firstName?.[0] || 'U'}
              </div>
            )}
            <span className="text-slate-100 text-xs font-mono">{user?.firstName}</span>
            <svg
              className={`w-3 h-3 text-slate-500 transition-transform ${showMenu ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {showMenu && (
            <>
              {/* Backdrop to close */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-10 bg-[#1a1d2e] border border-slate-700 rounded-lg shadow-2xl z-50 min-w-[200px] overflow-hidden">

                {/* User info header */}
                <div className="px-4 py-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt="avatar" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                        {user?.firstName?.[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-slate-100 text-xs font-mono font-bold truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-slate-500 text-xs font-mono truncate">{user?.emailId}</p>
                    </div>
                  </div>
                  <span className={`mt-2 inline-block text-[10px] font-mono px-2 py-0.5 rounded border
                    ${user?.role === 'admin'
                      ? 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10'
                      : 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                    }`}>
                    {user?.role?.toUpperCase()}
                  </span>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => { setShowProfile(true); setShowMenu(false) }}
                    className="w-full text-left px-4 py-2 text-slate-200 text-xs font-mono hover:bg-slate-800 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    View Profile
                  </button>

                  <button
                    onClick={() => { setShowEnvModal(true); setShowMenu(false) }}
                    className="w-full text-left px-4 py-2 text-slate-200 text-xs font-mono hover:bg-slate-800 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064" />
                    </svg>
                    Manage Environments
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-slate-800 py-1">
                  <button
                    onClick={() => { handleLogout(); setShowMenu(false) }}
                    className="w-full text-left px-4 py-2 text-rose-400 text-xs font-mono hover:bg-slate-800 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEnvModal && <EnvironmentModal onClose={() => setShowEnvModal(false)} />}
      {showProfile && <ProfilePage onClose={() => setShowProfile(false)} />}
    </>
  )
}

export default TopBar