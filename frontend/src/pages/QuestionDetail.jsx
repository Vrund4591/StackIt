import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import VoteButton from '../components/VoteButton'
import AnswerCard from '../components/AnswerCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import MentionInput from '../components/MentionInput'

const QuestionDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    fetchQuestion()
  }, [id])

  const fetchQuestion = async () => {
    try {
      setLoading(true)
      setError('')
      
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_URL}/api/questions/${id}`, {
        headers
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Question not found')
        }
        throw new Error('Failed to load question')
      }

      const data = await response.json()
      setQuestion(data)
    } catch (error) {
      console.error('Error fetching question:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async (e) => {
    e.preventDefault()
    
    if (!user) {
      navigate('/login')
      return
    }

    if (answer.trim().length < 30) {
      setError('Answer must be at least 30 characters long')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: answer,
          questionId: id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to post answer')
      }

      setAnswer('')
      fetchQuestion() // Refresh to show new answer
      setError('')
    } catch (error) {
      console.error('Error posting answer:', error)
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAcceptAnswer = async (answerId) => {
    try {
      const response = await fetch(`${API_URL}/api/answers/${answerId}/accept`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to accept answer')
      }

      fetchQuestion() // Refresh to show accepted answer
    } catch (error) {
      console.error('Error accepting answer:', error)
      alert('Failed to accept answer')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton type="question" />
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <LoadingSkeleton key={i} type="answer" />
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

  if (!question) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Question */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4">
          <VoteButton
            type="question"
            itemId={question.id}
            initialVoteCount={question.voteCount || 0}
            userVote={question.userVote}
          />
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">{question.title}</h1>
            
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
              <span>
                Asked by{' '}
                <Link 
                  to={`/user/${question.author.username}`}
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  {question.author.username}
                </Link>
              </span>
              <span>{new Date(question.createdAt).toLocaleDateString()}</span>
              <span>{question.answers?.length || 0} answers</span>
            </div>
            
            <div className="mb-4">
              {question.tags.map(tag => (
                <span key={tag.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">
                  {tag.name}
                </span>
              ))}
            </div>
            
            <div className="prose max-w-none">
              <div 
                className="text-gray-800 prose prose-sm max-w-none
                           prose-p:my-2 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                           prose-strong:font-semibold prose-em:italic prose-ul:my-2 prose-ol:my-2 prose-li:my-1
                           prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4 prose-blockquote:text-gray-700
                           prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                           prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:font-mono prose-pre:text-sm prose-pre:my-4 prose-pre:overflow-x-auto
                           prose-headings:mt-4 prose-headings:mb-2
                           [&_mark]:bg-yellow-200 [&_mark]:px-1 [&_mark]:rounded
                           [&_s]:line-through [&_u]:underline
                           prose-ul:list-disc prose-ul:ml-6 prose-ol:list-decimal prose-ol:ml-6"
                dangerouslySetInnerHTML={{ __html: question.content.replace(/@(\w+)/g, '<span class="bg-blue-100 text-blue-800 px-1 rounded font-medium">@$1</span>') }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      {question.answers && question.answers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
          </h2>
          
          {question.answers.map(answer => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              questionAuthorId={question.author.id}
              onAcceptAnswer={handleAcceptAnswer}
            />
          ))}
        </div>
      )}

      {/* Answer Form */}
      {user ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Your Answer</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmitAnswer}>
            <MentionInput
              value={answer}
              onChange={setAnswer}
              className="w-full p-3 border rounded-lg h-32 mb-4"
              placeholder="Write your answer... (minimum 30 characters) Use @username to mention someone"
              disabled={submitting}
            />
            <div className="text-sm text-gray-500 mb-4">
              {answer.length}/30 characters minimum
            </div>
            <button 
              type="submit" 
              disabled={submitting || answer.length < 30}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-blue-400"
            >
              {submitting ? 'Posting...' : 'Post Answer'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">Please log in to post an answer</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Login
          </button>
        </div>
      )}
    </div>
  )
}

export default QuestionDetail
