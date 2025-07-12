import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const SystemSettings = () => {
  const { token } = useAuth()
  const [settings, setSettings] = useState({
    siteName: 'StackIt',
    siteDescription: 'A Q&A platform for developers',
    allowRegistration: true,
    requireEmailVerification: false,
    moderationEnabled: true,
    maxQuestionLength: 5000,
    maxAnswerLength: 3000,
    minAnswerLength: 30
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        alert('Settings saved successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">System Settings</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div>
          <h3 className="text-lg font-medium mb-4">General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Description
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg h-20"
              />
            </div>
          </div>
        </div>

        {/* User Settings */}
        <div>
          <h3 className="text-lg font-medium mb-4">User Management</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
                className="mr-2"
              />
              Allow new user registration
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.requireEmailVerification}
                onChange={(e) => handleInputChange('requireEmailVerification', e.target.checked)}
                className="mr-2"
              />
              Require email verification for new users
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.moderationEnabled}
                onChange={(e) => handleInputChange('moderationEnabled', e.target.checked)}
                className="mr-2"
              />
              Enable content moderation
            </label>
          </div>
        </div>

        {/* Content Limits */}
        <div>
          <h3 className="text-lg font-medium mb-4">Content Limits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Question Length
              </label>
              <input
                type="number"
                value={settings.maxQuestionLength}
                onChange={(e) => handleInputChange('maxQuestionLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Answer Length
              </label>
              <input
                type="number"
                value={settings.maxAnswerLength}
                onChange={(e) => handleInputChange('maxAnswerLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Answer Length
              </label>
              <input
                type="number"
                value={settings.minAnswerLength}
                onChange={(e) => handleInputChange('minAnswerLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* System Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">System Information</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Version:</span> 1.0.0
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {new Date().toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Database:</span> PostgreSQL
              </div>
              <div>
                <span className="font-medium">Server Status:</span> 
                <span className="text-green-600 ml-1">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemSettings
