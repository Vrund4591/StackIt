import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const Analytics = () => {
  const { token } = useAuth()
  const [analytics, setAnalytics] = useState({
    userGrowth: [],
    questionStats: [],
    topUsers: [],
    topTags: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/admin/analytics?days=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Analytics Dashboard</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Top Contributors</h3>
          <div className="space-y-3">
            {analytics.topUsers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.reputation} reputation</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{user._count?.questions || 0} questions</p>
                  <p>{user._count?.answers || 0} answers</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tags */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Popular Tags</h3>
          <div className="space-y-3">
            {analytics.topTags.map((tag, index) => (
              <div key={tag.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {tag.name}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {tag._count?.questions || 0} questions
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {analytics.questionStats.reduce((sum, stat) => sum + stat.count, 0)}
            </p>
            <p className="text-sm text-gray-600">Questions Asked</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {analytics.userGrowth.reduce((sum, stat) => sum + stat.count, 0)}
            </p>
            <p className="text-sm text-gray-600">New Users</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {Math.round(analytics.questionStats.reduce((sum, stat) => sum + stat.count, 0) / parseInt(timeRange) * 10) / 10}
            </p>
            <p className="text-sm text-gray-600">Avg Questions/Day</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
