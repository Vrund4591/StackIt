import './App.css'
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import PopularQuestions from './pages/PopularQuestions'
import RecentQuestions from './pages/RecentQuestions'
import UnansweredQuestions from './pages/UnansweredQuestions'
import TagsPage from './pages/TagsPage'
import SavedQuestions from './pages/SavedQuestions'
import Notifications from './pages/Notifications'
import Guidelines from './pages/Guidelines'
import Login from './pages/Login'
import Register from './pages/Register'
import AskQuestion from './pages/AskQuestion'
import QuestionDetail from './pages/QuestionDetail'
import UserProfile from './pages/UserProfile'
import AdminDashboard from './pages/AdminDashboard'
import { AuthProvider, useAuth } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-bg-secondary">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/popular" element={<PopularQuestions />} />
              <Route path="/recent" element={<RecentQuestions />} />
              <Route path="/unanswered" element={<UnansweredQuestions />} />
              <Route path="/tags" element={<TagsPage />} />
              <Route path="/saved" element={<ProtectedRoute><SavedQuestions /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/guidelines" element={<Guidelines />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/ask" element={<ProtectedRoute><AskQuestion /></ProtectedRoute>} />
              <Route path="/question/:id" element={<QuestionDetail />} />
              <Route path="/user/:username" element={<UserProfile />} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  return user && user.role === 'ADMIN' ? children : <Navigate to="/" />
}

export default App
