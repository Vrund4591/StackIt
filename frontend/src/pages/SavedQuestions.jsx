import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import QuestionCard from '../components/QuestionCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import LeftSidebar from '../components/LeftSidebar'
import RightSidebar from '../components/RightSidebar'

const SavedQuestions = () => {
  const { user, token } = useAuth()
  const [savedQuestions, setSavedQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    if (user && token) {
      fetchSavedQuestions()
    }
  }, [user, token])

  const fetchSavedQuestions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/users/saved`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      setSavedQuestions(data.questions || [])
    } catch (error) {
      console.error('Error fetching saved questions:', error)
      setError('Failed to load saved questions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex gap-6 max-w-7xl mx-auto">
        <div className="hidden lg:block w-64 flex-shrink-0">
          <LeftSidebar />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view saved questions</h1>
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-primary">
            ⭐ Saved Questions
          </h1>
          <Link to="/ask" className="btn-primary">
            Ask Question
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              onClick={fetchSavedQuestions}
              className="ml-2 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <LoadingSkeleton key={i} type="question" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {savedQuestions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  You haven't saved any questions yet.
                </p>
                <Link to="/" className="text-blue-600 hover:underline">
                  Browse questions to save
                </Link>
              </div>
            ) : (
              savedQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} />
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

export default SavedQuestions
