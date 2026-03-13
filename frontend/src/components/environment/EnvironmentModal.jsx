import React, { useState } from 'react'
import {
  useGetEnvironmentsQuery,
  useCreateEnvironmentMutation,
  useUpdateEnvironmentMutation,
  useDeleteEnvironmentMutation,
  useActivateEnvironmentMutation,
} from '../../services/environmentApi'

const emptyVar = () => ({ key: '', value: '', enabled: true })

const EnvironmentModal = ({ onClose }) => {
  const { data } = useGetEnvironmentsQuery()
  const environments = data?.environments || []

  const [createEnvironment] = useCreateEnvironmentMutation()
  const [updateEnvironment] = useUpdateEnvironmentMutation()
  const [deleteEnvironment] = useDeleteEnvironmentMutation()
  const [activateEnvironment] = useActivateEnvironmentMutation()

  const [selected, setSelected] = useState(environments[0] || null)
  const [editName, setEditName] = useState(selected?.name || '')
  const [editVars, setEditVars] = useState(selected?.variables || [])
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)

  const selectEnv = (env) => {
    setSelected(env)
    setEditName(env.name)
    setEditVars(env.variables || [])
    setIsNew(false)
  }

  const startNew = () => {
    setSelected(null)
    setEditName('')
    setEditVars([emptyVar()])
    setIsNew(true)
  }

  const updateVar = (i, field, value) => {
    setEditVars(editVars.map((v, idx) => idx === i ? { ...v, [field]: value } : v))
  }

  const handleSave = async () => {
    if (!editName.trim()) return
    setSaving(true)
    try {
      if (isNew) {
        const res = await createEnvironment({ name: editName, variables: editVars })
        setIsNew(false)
        setSelected(res.data.environment)
      } else {
        await updateEnvironment({ id: selected._id, name: editName, variables: editVars })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1a1d2e] border border-slate-800 rounded-lg w-full max-w-2xl flex overflow-hidden" style={{ height: '480px' }}>

        {/* Left — env list */}
        <div className="w-48 border-r border-slate-800 flex flex-col bg-slate-900/50">
          <div className="p-3 border-b border-slate-800">
            <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Environments</span>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {environments.map((env) => (
              <button
                key={env._id}
                onClick={() => selectEnv(env)}
                className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center gap-2 transition-colors
                  ${selected?._id === env._id ? 'bg-slate-800 text-slate-100' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-100'}`}
              >
                {env.isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                <span className="truncate">{env.name}</span>
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-slate-800">
            <button
              onClick={startNew}
              className="w-full text-xs font-mono text-indigo-400 hover:bg-slate-800 rounded px-2 py-1.5 transition-colors text-left"
            >
              + New Environment
            </button>
          </div>
        </div>

        {/* Right — editor */}
        <div className="flex-1 flex flex-col">
          {selected || isNew ? (
            <>
              <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Environment name"
                  className="flex-1 bg-slate-800/40 border border-slate-700 rounded px-3 py-1.5 text-slate-100 text-xs font-mono outline-none focus:border-indigo-500"
                />
                {selected && !selected.isActive && (
                  <button
                    onClick={() => activateEnvironment(selected._id)}
                    className="text-xs font-mono text-emerald-400 border border-emerald-400/30 rounded px-2 py-1 hover:bg-emerald-400/10 transition-colors"
                  >
                    Set Active
                  </button>
                )}
                {selected?.isActive && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                  </span>
                )}
              </div>

              {/* Variables table */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-[1fr_1fr_24px] gap-2 mb-2">
                  <span className="text-slate-500 text-xs font-mono uppercase">Key</span>
                  <span className="text-slate-500 text-xs font-mono uppercase">Value</span>
                  <span />
                </div>
                {editVars.map((v, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_24px] gap-2 mb-2">
                    <input
                      value={v.key}
                      onChange={(e) => updateVar(i, 'key', e.target.value)}
                      placeholder="KEY"
                      className="bg-slate-800/40 border border-slate-700 rounded px-2 py-1 text-amber-400 text-xs font-mono outline-none focus:border-indigo-500"
                    />
                    <input
                      value={v.value}
                      onChange={(e) => updateVar(i, 'value', e.target.value)}
                      placeholder="value"
                      className="bg-slate-800/40 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs font-mono outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => setEditVars(editVars.filter((_, idx) => idx !== i))}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                    >×</button>
                  </div>
                ))}
                <button
                  onClick={() => setEditVars([...editVars, emptyVar()])}
                  className="text-xs font-mono text-slate-500 hover:text-indigo-400 transition-colors mt-1"
                >
                  + Add variable
                </button>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-slate-800 flex items-center justify-between">
                {selected && (
                  <button
                    onClick={async () => {
                      await deleteEnvironment(selected._id)
                      setSelected(null)
                    }}
                    className="text-xs font-mono text-rose-400 hover:underline"
                  >
                    Delete
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button onClick={onClose} className="px-3 py-1.5 text-xs font-mono text-slate-500 hover:text-slate-100 border border-slate-800 rounded">
                    Close
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-3 py-1.5 text-xs font-mono bg-indigo-600 text-white rounded hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-500 text-xs font-mono">Select or create an environment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnvironmentModal