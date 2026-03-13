import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectActiveTab, updateActiveTab } from '../../features/request/requestSlice'
import {
  useGetCollectionsQuery,
  useCreateCollectionMutation,
} from '../../services/collectionApi'
import {
  useCreateRequestMutation,
  useUpdateRequestMutation,
} from '../../services/requestApi'
import { addToast } from '../../features/ui/uiSlice'

const SaveRequestModal = ({ onClose }) => {
  const dispatch = useDispatch()
  const tab = useSelector(selectActiveTab)

  const { data } = useGetCollectionsQuery()
  const collections = data?.collections || []

  const [createRequest] = useCreateRequestMutation()
  const [updateRequest] = useUpdateRequestMutation()
  const [createCollection] = useCreateCollectionMutation()

  const [name, setName] = useState(tab?.name || 'New Request')
  const [selectedCollectionId, setSelectedCollectionId] = useState('')
  const [newCollectionName, setNewCollectionName] = useState('')
  const [showNewCollection, setShowNewCollection] = useState(false)
  const [saving, setSaving] = useState(false)

  // Set default collection once collections load
  useEffect(() => {
    if (collections.length > 0 && !selectedCollectionId) {
      // If tab already belongs to a collection, preselect it
      if (tab?.collectionId) {
        setSelectedCollectionId(tab.collectionId)
      } else {
        setSelectedCollectionId(collections[0]._id)
      }
    }
  }, [collections])

  const handleSave = async () => {
    if (!name.trim()) {
      dispatch(addToast({ message: 'Request name is required', type: 'error' }))
      return
    }

    setSaving(true)
    try {
      let collectionId = selectedCollectionId

      // Create new collection if user typed a new name
      if (showNewCollection) {
        if (!newCollectionName.trim()) {
          dispatch(addToast({ message: 'Collection name is required', type: 'error' }))
          setSaving(false)
          return
        }
        const res = await createCollection({ name: newCollectionName.trim() })
        if (res.error) throw new Error('Failed to create collection')
        collectionId = res.data.collection._id
      }

      if (!collectionId) {
        dispatch(addToast({ message: 'Please select a collection', type: 'error' }))
        setSaving(false)
        return
      }

      const payload = {
        name: name.trim(),
        method: tab.method,
        url: tab.url,
        headers: tab.headers || [],
        params: tab.params || [],
        body: tab.body || { type: 'none', content: '' },
        description: tab.description || '',
        collectionId,   // ← this is the key field
      }

      let savedRequest

      if (tab.id) {
        // Update existing
        const res = await updateRequest({ id: tab.id, ...payload })
        savedRequest = res.data?.request
        dispatch(addToast({ message: 'Request updated!', type: 'success' }))
      } else {
        // Create new
        const res = await createRequest(payload)
        if (res.error) throw new Error(res.error.data?.message || 'Failed to save')
        savedRequest = res.data?.request
        dispatch(addToast({ message: 'Request saved!', type: 'success' }))
      }

      // Update the tab so it knows it's saved
      if (savedRequest) {
        dispatch(updateActiveTab({
          id: savedRequest._id,
          name: savedRequest.name,
          collectionId: savedRequest.collection,
        }))
      }

      onClose()
    } catch (err) {
      console.error('Save error:', err)
      dispatch(addToast({ message: err.message || 'Failed to save request', type: 'error' }))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-lg p-6 w-full max-w-sm flex flex-col gap-4">

        <div className="flex items-center justify-between">
          <h2 className="text-text font-mono text-sm font-bold">
            {tab?.id ? 'Update Request' : 'Save Request'}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-text">×</button>
        </div>

        {/* Request name */}
        <div className="flex flex-col gap-1">
          <label className="text-muted text-xs font-mono">Request name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="bg-surface2 border border-border rounded px-3 py-2 text-text text-xs font-mono outline-none focus:border-accent"
          />
        </div>

        {/* Collection picker */}
        {!showNewCollection ? (
          <div className="flex flex-col gap-1">
            <label className="text-muted text-xs font-mono">Save to collection</label>
            {collections.length > 0 ? (
              <select
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                className="bg-surface2 border border-border rounded px-3 py-2 text-text text-xs font-mono outline-none focus:border-accent cursor-pointer"
              >
                <option value="" disabled>Select a collection...</option>
                {collections.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-muted text-xs font-mono italic">No collections yet — create one below.</p>
            )}
            <button
              onClick={() => { setShowNewCollection(true); setSelectedCollectionId('') }}
              className="text-accent text-xs font-mono hover:underline text-left mt-1"
            >
              + Create new collection
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <label className="text-muted text-xs font-mono">New collection name</label>
            <input
              autoFocus
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="My Collection"
              className="bg-surface2 border border-border rounded px-3 py-2 text-text text-xs font-mono outline-none focus:border-accent"
            />
            {collections.length > 0 && (
              <button
                onClick={() => { setShowNewCollection(false); setSelectedCollectionId(collections[0]._id) }}
                className="text-muted text-xs font-mono hover:text-text text-left mt-1"
              >
                ← Pick existing collection
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 justify-end mt-1">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-mono text-muted hover:text-text border border-border rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || (!selectedCollectionId && !newCollectionName.trim())}
            className="px-4 py-1.5 text-xs font-mono bg-accent text-white rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? 'Saving...' : tab?.id ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SaveRequestModal