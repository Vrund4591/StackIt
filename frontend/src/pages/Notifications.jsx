import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LeftSidebar from '../components/LeftSidebar'
import RightSidebar from '../components/RightSidebar'

const Notifications = () => {
  const { user, token } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    if (user && token) {
      fetchNotifications()
    }
  }, [user, token])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setError('Failed to load notifications. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  if (!user) {
    return (
      <div className="flex gap-6 max-w-7xl mx-auto">
        <div className="hidden lg:block w-64 flex-shrink-0">
          <LeftSidebar />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view notifications</h1>
            <Link to="/login" className="btn-primary">
              Log In
            </Link>
          </div>
        </div>

        <div className="hidden xl:block w-80 flex-shrink-0">
          <RightSidebar />
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-6 max-w-7xl mx-auto">
      <div className="hidden lg:block w-64 flex-shrink-0">
        <LeftSidebar />
      </div>

      <div className="flex-1 min-w-0">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-primary">
            🔔 Notifications
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              onClick={fetchNotifications}
              className="ml-2 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg p-4 border transition-colors ${
                    notification.read ? 'border-gray-200' : 'border-blue-200 bg-blue-50'
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg">
                      {notification.type === 'answer' && '💬'}
                      {notification.type === 'comment' && '💭'}
                      {notification.type === 'vote' && '👍'}
                      {notification.type === 'accept' && '✅'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {getRelativeTime(notification.createdAt)}
                        </span>
                        {!notification.read && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="hidden xl:block w-80 flex-shrink-0">
        <RightSidebar />
      </div>
    </div>
  )
}

export default Notifications
