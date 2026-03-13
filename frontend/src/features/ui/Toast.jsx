import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeToast } from '../ui/uiSlice'

const ICONS = {
  success: '✅',
  error:   '❌',
  info:    'ℹ️',
  warning: '⚠️',
}

const Toast = () => {
  const toasts = useSelector((state) => state.ui.toasts)
  const dispatch = useDispatch()

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => dispatch(removeToast(toast.id))}
        />
      ))}
    </div>
  )
}

const ToastItem = ({ toast, onRemove }) => {
  useEffect(() => {
    const t = setTimeout(onRemove, toast.duration || 3000)
    return () => clearTimeout(t)
  }, [])

  const borderColors = {
    success: 'border-l-green',
    error:   'border-l-red',
    info:    'border-l-blue',
    warning: 'border-l-accent2',
  }

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 bg-surface border border-border border-l-4 ${borderColors[toast.type] || 'border-l-accent'} rounded-lg px-4 py-3 shadow-xl min-w-[280px] max-w-[360px] animate-slide-in`}
    >
      <span>{ICONS[toast.type]}</span>
      <div className="flex flex-col flex-1 min-w-0">
        {toast.title && (
          <span className="text-text text-xs font-mono font-bold">{toast.title}</span>
        )}
        <span className="text-muted text-xs font-mono truncate">{toast.message}</span>
      </div>
      <button
        onClick={onRemove}
        className="text-muted hover:text-text text-sm shrink-0"
      >×</button>
    </div>
  )
}

export default Toast