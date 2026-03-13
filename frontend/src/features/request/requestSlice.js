import { createSlice } from '@reduxjs/toolkit'

const defaultTab = () => ({
  id: null,
  name: 'New Request',
  method: 'GET',
  url: '',
  baseUrl: 'http://localhost:3000',
  headers: [],
  params: [],
  body: { type: 'none', content: '' },
  collectionId: null,
  response: null,
  isLoading: false,
  tabId: `tab-${Date.now()}`,
  description: '',
})

const loadState = () => {
  try {
    const saved = localStorage.getItem('mp_tabs')
    if (!saved) return null
    const parsed = JSON.parse(saved)
    if (!parsed.tabs || parsed.tabs.length === 0) return null

    parsed.tabs = parsed.tabs
      .slice(-8) // max 8 tabs
      .map((t) => ({ ...t, response: null, isLoading: false }))

    const activeExists = parsed.tabs.find(t => t.tabId === parsed.activeTabId)
    if (!activeExists) parsed.activeTabId = parsed.tabs[0].tabId

    return parsed
  } catch {
    return null
  }
}

export const saveState = (state) => {
  try {
    const toSave = {
      activeTabId: state.activeTabId,
      tabs: state.tabs.slice(-8).map((t) => ({
        ...t,
        response: null,
        isLoading: false,
      })),
    }
    localStorage.setItem('mp_tabs', JSON.stringify(toSave))
  } catch (e) {
    console.warn('Failed to save tabs:', e)
  }
}

const saved = loadState()

const firstTab = defaultTab()

const initialState = saved || {
  tabs: [firstTab],
  activeTabId: firstTab.tabId,
}

const requestSlice = createSlice({
  name: 'request',
  initialState,
  reducers: {
    addTab: (state) => {
      const tab = defaultTab()
      state.tabs.push(tab)
      state.activeTabId = tab.tabId
    },
    closeTab: (state, action) => {
      const tabId = action.payload
      state.tabs = state.tabs.filter((t) => t.tabId !== tabId)
      if (state.activeTabId === tabId) {
        state.activeTabId = state.tabs[state.tabs.length - 1]?.tabId || null
      }
      if (state.tabs.length === 0) {
        const tab = defaultTab()
        state.tabs.push(tab)
        state.activeTabId = tab.tabId
      }
    },
    closeAllExcept: (state, action) => {
      const keepTabId = action.payload
      const keepTab = state.tabs.find(t => t.tabId === keepTabId)
      const tab = keepTab || defaultTab()
      state.tabs = [tab]
      state.activeTabId = tab.tabId
    },
    setActiveTab: (state, action) => {
      state.activeTabId = action.payload
    },
    updateActiveTab: (state, action) => {
      const idx = state.tabs.findIndex((t) => t.tabId === state.activeTabId)
      if (idx !== -1) {
        state.tabs[idx] = { ...state.tabs[idx], ...action.payload }
      }
    },
    openRequestInTab: (state, action) => {
      const request = action.payload
      const existing = state.tabs.find((t) => t.id === request._id)
      if (existing) {
        state.activeTabId = existing.tabId
        return
      }
      const newTab = {
        ...defaultTab(),
        id: request._id,
        name: request.name,
        method: request.method,
        url: request.url,
        baseUrl: request.baseUrl || 'http://localhost:3000',
        headers: request.headers || [],
        params: request.params || [],
        body: request.body || { type: 'none', content: '' },
        collectionId: request.collection,
      }
      state.tabs.push(newTab)
      state.activeTabId = newTab.tabId
    },
    setTabResponse: (state, action) => {
      const { tabId, response } = action.payload
      const tab = state.tabs.find((t) => t.tabId === tabId)
      if (tab) tab.response = response
    },
    setTabLoading: (state, action) => {
      const { tabId, isLoading } = action.payload
      const tab = state.tabs.find((t) => t.tabId === tabId)
      if (tab) tab.isLoading = isLoading
    },
  },
})

export const {
  addTab, closeTab, closeAllExcept,
  setActiveTab, updateActiveTab,
  openRequestInTab, setTabResponse, setTabLoading,
} = requestSlice.actions
export default requestSlice.reducer

export const selectTabs = (state) => state.request.tabs
export const selectActiveTabId = (state) => state.request.activeTabId
export const selectActiveTab = (state) => {
  const { tabs, activeTabId } = state.request
  return tabs.find((t) => t.tabId === activeTabId) || null
}