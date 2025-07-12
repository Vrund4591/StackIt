import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RightSidebar = () => {
  const { user, token } = useAuth()
  const [trendingTags, setTrendingTags] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [topUsers, setTopUsers] = useState([])
  const [communityStats, setCommunityStats] = useState({})
  const [loading, setLoading] = useState(true)

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    fetchSidebarData()
  }, [])

  const fetchSidebarData = async () => {
    try {
      setLoading(true)
      
      // Fetch trending tags
      const tagsResponse = await fetch(`${API_URL}/api/tags?limit=8`)
      if (tagsResponse.ok) {
        const tags = await tagsResponse.json()
        setTrendingTags(tags)
      }

      // Fetch recent activity (latest questions)
      const activityResponse = await fetch(`${API_URL}/api/questions?limit=5&sort=newest`)
      if (activityResponse.ok) {
        const data = await activityResponse.json()
        setRecentActivity(data.questions || [])
      }

      // Fetch top users
      const usersResponse = await fetch(`${API_URL}/api/users/top?limit=5`)
      if (usersResponse.ok) {
        const users = await usersResponse.json()
        setTopUsers(users)
      }

      // Fetch community stats
      const statsResponse = await fetch(`${API_URL}/api/stats`)
      if (statsResponse.ok) {
        const stats = await statsResponse.json()
        setCommunityStats(stats)
      }

    } catch (error) {
      console.error('Error fetching sidebar data:', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="sticky top-20 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-3 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="sticky top-20 space-y-4 h-[calc(100vh-6rem)] overflow-y-auto">
      {/* Trending Tags */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">🔥 Trending Tags</h3>
          <Link to="/tags" className="text-blue-600 hover:text-blue-800 text-sm">
            View all
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTags.slice(0, 8).map((tag) => (
            <Link
              key={tag.id}
              to={`/?tag=${tag.name}`}
              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200 transition-colors"
            >
              {tag.name}
              {tag._count?.questions && (
                <span className="ml-1 text-blue-600">
                  {tag._count.questions}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">⚡ Recent Activity</h3>
          <Link to="/recent" className="text-blue-600 hover:text-blue-800 text-sm">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {recentActivity.map((question) => (
            <div key={question.id} className="border-b border-gray-100 last:border-b-0 pb-2 last:pb-0">
              <Link
                to={`/question/${question.id}`}
                className="block text-sm text-gray-900 hover:text-blue-600 font-medium line-clamp-2"
              >
                {question.title}
              </Link>
              <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                <Link 
                  to={`/user/${question.author.username}`}
                  className="hover:text-blue-600"
                >
                  {question.author.username}
                </Link>
                <span>{getRelativeTime(question.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Contributors */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">🏆 Top Contributors</h3>
          <Link to="/popular" className="text-blue-600 hover:text-blue-800 text-sm">
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {topUsers.map((user, index) => (
            <div key={user.id} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                {index + 1}
              </div>
              <Link
                to={`/user/${user.username}`}
                className="flex-1 flex items-center gap-2 hover:text-blue-600"
              >
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user.username}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.reputation || 0} rep
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-100">
        <h3 className="font-semibold text-gray-900 mb-3">📊 Community Stats</h3>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-white rounded-lg p-2">
            <div className="text-lg font-bold text-green-600">
              {loading ? '...' : (communityStats.totalQuestions || 0)}
            </div>
            <div className="text-xs text-gray-600">Questions</div>
          </div>
          <div className="bg-white rounded-lg p-2">
            <div className="text-lg font-bold text-blue-600">
              {loading ? '...' : (communityStats.totalUsers || 0)}
            </div>
            <div className="text-xs text-gray-600">Users</div>
          </div>
          <div className="bg-white rounded-lg p-2">
            <div className="text-lg font-bold text-purple-600">
              {loading ? '...' : (communityStats.totalAnswers || 0)}
            </div>
            <div className="text-xs text-gray-600">Answers</div>
          </div>
          <div className="bg-white rounded-lg p-2">
            <div className="text-lg font-bold text-orange-600">
              {loading ? '...' : `${Math.round(communityStats.solvedPercentage || 0)}%`}
            </div>
            <div className="text-xs text-gray-600">Solved</div>
          </div>
        </div>
      </div>

      {/* Help & Support */}
      {!user && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
          <h3 className="font-semibold text-gray-900 mb-2">👋 New to StackIt?</h3>
          <p className="text-sm text-gray-600 mb-3">
            Join our community to ask questions, share knowledge, and connect with developers worldwide.
          </p>
          <div className="space-y-2">
            <Link
              to="/register"
              className="block w-full text-center px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
            >
              Sign Up Free
            </Link>
            <Link
              to="/login"
              className="block w-full text-center px-3 py-2 border border-purple-300 text-purple-700 text-sm rounded-lg hover:bg-purple-50 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default RightSidebar
