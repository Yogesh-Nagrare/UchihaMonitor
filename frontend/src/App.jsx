import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser, clearUser } from './features/auth/authSlice'
import { useGetMeQuery } from './services/authApi'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardPage from './pages/DashboardPage'
import SharedCollectionPage from './pages/SharedCollectionPage'
import LandingPage from './pages/LandingPage'
// placeholder — we'll build this next
const App = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useGetMeQuery()

  useEffect(() => {
    if (isLoading) return
    if (data?.user) {
      dispatch(setUser(data.user))
    } else {
      dispatch(clearUser())
    }
  }, [data, isLoading, isError, dispatch])

  return (
    <Routes>
      <Route path="/" element={<LandingPage onGetStarted={() => navigate('/dashboard')} />}/>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/shared/:token" element={<SharedCollectionPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App;