import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AskQuestion = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user, token } = useAuth()

  // Get API URL from environment variable with fallback
  const API_URL = import.meta.env.VITE_API_URL

  // Redirect if not authenticated
  if (!user) {
    navigate('/login')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Basic client-side validation
    if (title.length < 5) {
      setError('Title must be at least 5 characters long')
      setLoading(false)
      return
    }
    
    if (description.length < 10) {
      setError('Description must be at least 10 characters long')
      setLoading(false)
      return
    }
    
    try {
      const questionData = {
        title,
        description,
        tags: tags.split(',').map(t => t.trim()).filter(t => t)
      }
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${API_URL}/api/questions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(questionData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.details) {
          // Handle validation errors
          const validationErrors = errorData.details.map(err => err.msg).join(', ')
          throw new Error(`Validation error: ${validationErrors}`)
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Question posted successfully:', data)
      navigate('/')
    } catch (error) {
      console.error('Error posting question:', error)
      setError(error.message || 'Failed to post question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Ask a Question</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title (minimum 5 characters)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="What's your programming question?"
            required
            minLength={5}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Description (minimum 10 characters)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border rounded-lg h-64"
            placeholder="Describe your problem in detail..."
            required
            minLength={10}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="javascript, react, css (comma separated)"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:bg-blue-400"
        >
          {loading ? 'Posting...' : 'Post Question'}
        </button>
      </form>
    </div>
  )
}

export default AskQuestion