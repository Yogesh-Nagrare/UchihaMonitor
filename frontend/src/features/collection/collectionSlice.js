import { createSlice } from '@reduxjs/toolkit'

const collectionSlice = createSlice({
  name: 'collection',
  initialState: {
    activeCollectionId: null,
    expandedCollections: [],   // array of ids that are open in sidebar
  },
  reducers: {
    setActiveCollection: (state, action) => {
      state.activeCollectionId = action.payload
    },
    toggleExpanded: (state, action) => {
      const id = action.payload
      const idx = state.expandedCollections.indexOf(id)
      if (idx === -1) {
        state.expandedCollections.push(id)
      } else {
        state.expandedCollections.splice(idx, 1)
      }
    },
  },
})

export const { setActiveCollection, toggleExpanded } = collectionSlice.actions
export default collectionSlice.reducer

export const selectActiveCollectionId = (state) => state.collection.activeCollectionId
export const selectExpandedCollections = (state) => state.collection.expandedCollections