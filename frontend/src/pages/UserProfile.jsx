import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import QuestionCard from '../components/QuestionCard'
import LoadingSkeleton from '../components/LoadingSkeleton'

const UserProfile = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user: currentUser, token } = useAuth()
  const [user, setUser] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingQuestionId, setDeletingQuestionId] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    fetchUserProfile()
  }, [username])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError('')

      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Fetch user profile
      const userResponse = await fetch(`${API_URL}/api/users/${username}`, {
        headers
      })

      if (!userResponse.ok) {
        if (userResponse.status === 404) {
          throw new Error('User not found')
        }
        throw new Error('Failed to load user profile')
      }

      const userData = await userResponse.json()
      setUser(userData)

      // Fetch user's questions
      const questionsResponse = await fetch(`${API_URL}/api/questions?author=${username}&limit=50`, {
        headers
      })

      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        setQuestions(questionsData.questions || [])
      }

    } catch (error) {
      console.error('Error fetching user profile:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return
    }

    setDeletingQuestionId(questionId)

    try {
      const response = await fetch(`${API_URL}/api/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete question')
      }

      // Remove question from local state
      setQuestions(prev => prev.filter(q => q.id !== questionId))
      
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Failed to delete question: ' + error.message)
    } finally {
      setDeletingQuestionId(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton type="profile" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <LoadingSkeleton key={i} type="question" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Go back to home
          </button>
        </div>
      </div>
    )
  }

  if (!user) return null

  const isOwner = currentUser && currentUser.id === user.id

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* User Profile Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.username}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {user.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
            
            <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
              <span>Reputation: <strong>{user.reputation || 0}</strong></span>
              <span>Member since: <strong>{new Date(user.createdAt).toLocaleDateString()}</strong></span>
              <span>Questions: <strong>{questions.length}</strong></span>
            </div>
            
            {user.bio && (
              <p className="text-gray-700 mb-4">{user.bio}</p>
            )}
            
            <div className="flex gap-4 text-sm text-gray-600">
              {user.location && (
                <span>📍 {user.location}</span>
              )}
              {user.website && (
                <a 
                  href={user.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  🌐 Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User's Questions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {isOwner ? 'Your' : `${user.username}'s`} Questions ({questions.length})
          </h2>
          {isOwner && (
            <Link to="/ask" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              Ask New Question
            </Link>
          )}
        </div>

        {questions.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">
              {isOwner ? 
                "You haven't asked any questions yet." : 
                `${user.username} hasn't asked any questions yet.`
              }
            </p>
            {isOwner && (
              <Link 
                to="/ask"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Ask Your First Question
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map(question => (
              <div key={question.id} className="bg-white rounded-lg shadow">
                <QuestionCard question={question} />
                {isOwner && (
                  <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        disabled={deletingQuestionId === question.id}
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {deletingQuestionId === question.id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Delete Question
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile
