import React, { useState } from 'react'
import TopBar from '../components/layout/TopBar'
import Sidebar from '../components/layout/Sidebar'
import MainPanel from '../components/layout/MainPanel'
import HistoryPanel from '../components/layout/HistoryPanel'
import Toast from '../features/ui/Toast'

const DashboardPage = () => {
  const [historyOpen, setHistoryOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-bg overflow-hidden">
      <TopBar
        onToggleHistory={() => setHistoryOpen(!historyOpen)}
        historyOpen={historyOpen}
      />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <MainPanel />
        {historyOpen && (
          <HistoryPanel onClose={() => setHistoryOpen(false)} />
        )}
      </div>
      <Toast />
    </div>
  )
}

export default DashboardPage