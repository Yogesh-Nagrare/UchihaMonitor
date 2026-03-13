import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  useGetCollectionsQuery,
  useCreateCollectionMutation,
  useDeleteCollectionMutation,
  useUpdateCollectionMutation,
  useShareCollectionMutation,
  useUnshareCollectionMutation,
} from '../../services/collectionApi'
import {
  useGetRequestsByCollectionQuery,
  useDeleteRequestMutation,
  useUpdateRequestMutation,
} from '../../services/requestApi'
import {
  toggleExpanded,
  selectExpandedCollections,
} from '../../features/collection/collectionSlice'
import {
  openRequestInTab,
  addTab,
  updateActiveTab,
} from '../../features/request/requestSlice'
import { addToast } from '../../features/ui/uiSlice'
import ShareModal from '../collection/ShareModal'
import ImportExportModal from '../collection/ImportExportModal'

const METHOD_STYLES = {
  GET:    'bg-emerald-500/10 text-emerald-400',
  POST:   'bg-indigo-500/10 text-indigo-400',
  PUT:    'bg-amber-500/10 text-amber-400',
  PATCH:  'bg-violet-500/10 text-violet-400',
  DELETE: 'bg-rose-500/10 text-rose-400',
}

// ── Request Item ──────────────────────────────────────────────────────────────
const RequestItem = ({ request, collectionId, searchQuery }) => {
  const dispatch = useDispatch()
  const [showMenu, setShowMenu] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(request.name)
  const menuRef = useRef(null)

  const [deleteRequest] = useDeleteRequestMutation()
  const [updateRequest] = useUpdateRequestMutation()

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <span className="bg-indigo-500/30 text-indigo-300">{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    )
  }

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    if (showMenu) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  const handleRename = async () => {
    if (!newName.trim() || newName === request.name) {
      setIsRenaming(false)
      return
    }
    try {
      await updateRequest({
        id: request._id,
        name: newName.trim(),
        method: request.method,
        url: request.url,
        headers: request.headers,
        params: request.params,
        body: request.body,
        collectionId,
      })
      dispatch(addToast({ message: 'Request renamed', type: 'success' }))
    } catch {
      dispatch(addToast({ message: 'Failed to rename', type: 'error' }))
    }
    setIsRenaming(false)
  }

  const handleDelete = async () => {
    setShowMenu(false)
    try {
      await deleteRequest(request._id)
      dispatch(addToast({ message: 'Request deleted', type: 'success' }))
    } catch {
      dispatch(addToast({ message: 'Failed to delete', type: 'error' }))
    }
  }

  if (isRenaming) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 ml-1">
        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${METHOD_STYLES[request.method] || 'text-slate-500'}`}>
          {request.method}
        </span>
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename()
            if (e.key === 'Escape') { setNewName(request.name); setIsRenaming(false) }
          }}
          onBlur={handleRename}
          className="flex-1 bg-slate-800/40 border border-indigo-500/50 rounded px-2 py-0.5 text-slate-100 text-xs font-mono outline-none"
        />
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800/40 rounded cursor-pointer group/req relative"
      onClick={() => dispatch(openRequestInTab(request))}
    >
      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${METHOD_STYLES[request.method] || 'text-slate-500'}`}>
        {request.method}
      </span>
      <span className="text-slate-200 text-xs font-mono truncate flex-1">
        {highlightMatch(request.name, searchQuery)}
      </span>

      <div ref={menuRef} className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
          className="opacity-0 group-hover/req:opacity-100 text-slate-500 hover:text-slate-200 p-0.5 rounded transition-opacity shrink-0"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>

        {showMenu && (
          <div
            className="absolute right-0 top-5 bg-[#1a1d2e] border border-slate-700 rounded shadow-2xl z-50 min-w-[130px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full text-left px-3 py-1.5 text-xs font-mono text-slate-200 hover:bg-slate-800 transition-colors"
              onClick={() => { setIsRenaming(true); setShowMenu(false) }}
            >
              ✏️ Rename
            </button>
            <button
              className="w-full text-left px-3 py-1.5 text-xs font-mono text-slate-200 hover:bg-slate-800 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                dispatch(openRequestInTab(request))
                setShowMenu(false)
              }}
            >
              📂 Open
            </button>
            <div className="border-t border-slate-800" />
            <button
              className="w-full text-left px-3 py-1.5 text-xs font-mono text-rose-400 hover:bg-slate-800 transition-colors"
              onClick={handleDelete}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Collection Item ───────────────────────────────────────────────────────────
const CollectionItem = ({ collection, searchQuery }) => {
  const dispatch = useDispatch()
  const expanded = useSelector(selectExpandedCollections)
  const isExpanded = expanded.includes(collection._id)
  const [showMenu, setShowMenu] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(collection.name)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showImportExport, setShowImportExport] = useState(null)
  const menuRef = useRef(null)

  const [deleteCollection] = useDeleteCollectionMutation()
  const [updateCollection] = useUpdateCollectionMutation()

  const forceExpand = searchQuery.trim().length > 0

  const { data } = useGetRequestsByCollectionQuery(collection._id, {
    skip: !isExpanded && !forceExpand,
  })
  const allRequests = data?.requests || []

  const requests = searchQuery.trim()
    ? allRequests.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.method.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allRequests

  if (searchQuery.trim() && requests.length === 0) return null

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    if (showMenu) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  const handleRename = async () => {
    if (!newName.trim() || newName === collection.name) {
      setIsRenaming(false)
      return
    }
    await updateCollection({ id: collection._id, name: newName.trim() })
    dispatch(addToast({ message: 'Collection renamed', type: 'success' }))
    setIsRenaming(false)
  }

  const handleNewRequest = () => {
    setShowMenu(false)
    dispatch(addTab())
    dispatch(updateActiveTab({
      collectionId: collection._id,
      name: 'New Request',
    }))
    if (!isExpanded) dispatch(toggleExpanded(collection._id))
  }

  const handleDelete = async () => {
    setShowMenu(false)
    await deleteCollection(collection._id)
    dispatch(addToast({ message: 'Collection deleted', type: 'success' }))
  }

  return (
    <div>
      {/* Collection header */}
      {isRenaming ? (
        <div
          className="flex items-center gap-2 px-3 py-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') { setNewName(collection.name); setIsRenaming(false) }
            }}
            onBlur={handleRename}
            className="flex-1 bg-slate-800/40 border border-indigo-500 rounded px-2 py-0.5 text-slate-100 text-xs font-mono outline-none"
          />
        </div>
      ) : (
        <div
          className="flex items-center gap-1 px-3 py-1.5 hover:bg-slate-800/40 cursor-pointer group relative"
          onClick={() => dispatch(toggleExpanded(collection._id))}
        >
          {/* Chevron */}
          <svg
            className={`w-3 h-3 text-slate-500 transition-transform shrink-0 ${isExpanded || forceExpand ? 'rotate-90' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          {/* Folder icon */}
          <svg className="w-4 h-4 text-amber-500 shrink-0 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>

          {/* Name */}
          <span className="text-slate-200 text-xs font-mono truncate flex-1 ml-1">{collection.name}</span>

          {/* Shared indicator */}
          {collection.isShared && (
            <span className="text-cyan-400 text-xs shrink-0" title="Shared">🔗</span>
          )}

          {/* Quick add — visible on hover */}
          <button
            onClick={(e) => { e.stopPropagation(); handleNewRequest() }}
            title="New request"
            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-indigo-400 p-0.5 rounded transition-opacity shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* ── Three dot menu ── */}
          <div
            ref={menuRef}
            className="relative"
            onClick={(e) => e.stopPropagation()}  // ← prevent expand toggle
          >
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu((prev) => !prev) }}
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-100 p-0.5 rounded transition-opacity shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-6 bg-[#1a1d2e] border border-slate-700 rounded shadow-2xl z-50 min-w-[155px]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* New Request */}
                <button
                  className="w-full text-left px-3 py-1.5 text-xs font-mono text-indigo-400 hover:bg-slate-800 transition-colors flex items-center gap-2 border-b border-slate-800"
                  onClick={handleNewRequest}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Request
                </button>

                {/* Rename */}
                <button
                  className="w-full text-left px-3 py-1.5 text-xs font-mono text-slate-200 hover:bg-slate-800 transition-colors"
                  onClick={() => { setIsRenaming(true); setShowMenu(false) }}
                >
                  ✏️ Rename
                </button>

                {/* Share */}
                <button
                  className="w-full text-left px-3 py-1.5 text-xs font-mono text-slate-200 hover:bg-slate-800 transition-colors"
                  onClick={() => { setShowShareModal(true); setShowMenu(false) }}
                >
                  🔗 {collection.isShared ? 'Manage Share' : 'Share'}
                </button>

                {/* Export */}
                <button
                  className="w-full text-left px-3 py-1.5 text-xs font-mono text-slate-200 hover:bg-slate-800 transition-colors"
                  onClick={() => { setShowImportExport('export'); setShowMenu(false) }}
                >
                  📤 Export
                </button>

                <div className="border-t border-slate-800" />

                {/* Delete */}
                <button
                  className="w-full text-left px-3 py-1.5 text-xs font-mono text-rose-400 hover:bg-slate-800 transition-colors"
                  onClick={handleDelete}
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Requests list */}
      {(isExpanded || forceExpand) && (
        <div className="ml-5 border-l border-slate-800 pl-2 my-0.5">
          {requests.length === 0 ? (
            <p className="text-slate-500 text-xs px-2 py-1.5 italic font-mono">
              {searchQuery ? 'No matches' : 'No requests — click + to add'}
            </p>
          ) : (
            requests.map((req) => (
              <RequestItem
                key={req._id}
                request={req}
                collectionId={collection._id}
                searchQuery={searchQuery}
              />
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {showShareModal && (
        <ShareModal
          collection={collection}
          onClose={() => setShowShareModal(false)}
        />
      )}
      {showImportExport && (
        <ImportExportModal
          collection={collection}
          mode={showImportExport}
          onClose={() => setShowImportExport(null)}
        />
      )}
    </div>
  )
}

// ── New Collection Modal ──────────────────────────────────────────────────────
const NewCollectionModal = ({ onClose }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [createCollection, { isLoading }] = useCreateCollectionMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await createCollection({ name, description })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1a1d2e] border border-slate-800 rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-slate-100 font-mono text-sm font-bold mb-4">New Collection</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            autoFocus
            type="text"
            placeholder="Collection name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-800/40 border border-slate-700 rounded px-3 py-2 text-slate-100 text-xs font-mono outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-slate-800/40 border border-slate-700 rounded px-3 py-2 text-slate-100 text-xs font-mono outline-none focus:border-indigo-500"
          />
          <div className="flex gap-2 justify-end mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-mono text-slate-500 hover:text-slate-100 border border-slate-800 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-3 py-1.5 text-xs font-mono bg-indigo-600 text-white rounded hover:bg-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────
const Sidebar = () => {
  const dispatch = useDispatch()
  const [showNewModal, setShowNewModal] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef(null)

  const { data, isLoading } = useGetCollectionsQuery()
  const collections = data?.collections || []

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus()
    }
  }, [showSearch])

  const handleSearchKey = (e) => {
    if (e.key === 'Escape') {
      setSearchQuery('')
      setShowSearch(false)
    }
  }

  return (
    <div className="w-64 bg-[#1a1d2e] border-r border-slate-800 flex flex-col shrink-0 h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 shrink-0 min-h-[38px]">
        {showSearch ? (
          <div className="flex items-center gap-2 flex-1">
            <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="Search requests..."
              className="flex-1 bg-transparent text-slate-100 text-xs font-mono outline-none placeholder-slate-600 min-w-0"
            />
            <button
              onClick={() => { setSearchQuery(''); setShowSearch(false) }}
              className="text-slate-500 hover:text-slate-100 text-sm shrink-0"
            >×</button>
          </div>
        ) : (
          <>
            <span className="text-slate-500 text-xs font-mono uppercase tracking-widest">Collections</span>
            <div className="flex items-center gap-0.5">

              {/* Search */}
              <button
                onClick={() => setShowSearch(true)}
                title="Search"
                className="text-slate-500 hover:text-slate-100 p-1 rounded hover:bg-slate-800/40 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* New tab / request */}
              <button
                onClick={() => dispatch(addTab())}
                title="New Request"
                className="text-slate-500 hover:text-slate-100 p-1 rounded hover:bg-slate-800/40 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>

              {/* New collection */}
              <button
                onClick={() => setShowNewModal(true)}
                title="New Collection"
                className="text-slate-500 hover:text-slate-100 p-1 rounded hover:bg-slate-800/40 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
              </button>

              {/* Import */}
              <button
                onClick={() => setShowImport(true)}
                title="Import Collection"
                className="text-slate-500 hover:text-slate-100 p-1 rounded hover:bg-slate-800/40 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Search active banner */}
      {searchQuery.trim() && (
        <div className="px-3 py-1.5 border-b border-slate-800 bg-slate-800/40">
          <span className="text-slate-500 text-xs font-mono">
            Searching: <span className="text-indigo-400">"{searchQuery}"</span>
          </span>
        </div>
      )}

      {/* Collections list */}
      <div className="flex-1 overflow-y-auto py-1 px-1">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-4 h-4 border-2 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-8 px-4">
            <svg className="w-8 h-8 text-slate-800 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            <p className="text-slate-500 text-xs font-mono">No collections yet</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="mt-2 text-indigo-400 text-xs font-mono hover:underline"
            >
              + Create one
            </button>
          </div>
        ) : (
          collections.map((col) => (
            <CollectionItem
              key={col._id}
              collection={col}
              searchQuery={searchQuery}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {showNewModal && (
        <NewCollectionModal onClose={() => setShowNewModal(false)} />
      )}
      {showImport && (
        <ImportExportModal
          mode="import"
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  )
}

export default Sidebar