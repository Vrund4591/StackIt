import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

const ContentModeration = () => {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState('questions')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    fetchContent()
  }, [activeTab])

  const fetchContent = async () => {
    try {
      setLoading(true)
      
      if (activeTab === 'questions') {
        const response = await fetch(`${API_URL}/api/admin/questions?page=1&limit=20`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setQuestions(data.questions)
        }
      } else if (activeTab === 'answers') {
        const response = await fetch(`${API_URL}/api/admin/answers?page=1&limit=20`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setAnswers(data.answers)
        }
      } else if (activeTab === 'reports') {
        const response = await fetch(`${API_URL}/api/admin/reports`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setReports(data.reports)
        }
      }
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      const response = await fetch(`${API_URL}/api/admin/questions/${questionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setQuestions(prev => prev.filter(q => q.id !== questionId))
      }
    } catch (error) {
      console.error('Error deleting question:', error)
    }
  }

  const handleDeleteAnswer = async (answerId) => {
    if (!confirm('Are you sure you want to delete this answer?')) return

    try {
      const response = await fetch(`${API_URL}/api/admin/answers/${answerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setAnswers(prev => prev.filter(a => a.id !== answerId))
      }
    } catch (error) {
      console.error('Error deleting answer:', error)
    }
  }

  const tabs = [
    { id: 'questions', label: 'Questions', count: questions.length },
    { id: 'answers', label: 'Answers', count: answers.length },
    { id: 'reports', label: 'Reports', count: reports.length }
  ]

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            {activeTab === 'questions' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recent Questions</h3>
                {questions.map((question) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link 
                          to={`/question/${question.id}`}
                          className="text-lg font-medium text-blue-600 hover:text-blue-800"
                        >
                          {question.title}
                        </Link>
                        <p className="text-gray-600 mt-2 line-clamp-3">
                          {question.content.substring(0, 200)}...
                        </p>
                        <div className="flex items-center mt-3 text-sm text-gray-500">
                          <span>By {question.author.username}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>{question.views} views</span>
                        </div>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'answers' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recent Answers</h3>
                {answers.map((answer) => (
                  <div key={answer.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link 
                          to={`/question/${answer.questionId}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Answer to: {answer.question?.title}
                        </Link>
                        <p className="text-gray-600 mt-2">
                          {answer.content.substring(0, 200)}...
                        </p>
                        <div className="flex items-center mt-3 text-sm text-gray-500">
                          <span>By {answer.author.username}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                          {answer.isAccepted && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="text-green-600">Accepted</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <button
                          onClick={() => handleDeleteAnswer(answer.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Content Reports</h3>
                <div className="text-gray-500 text-center py-8">
                  No reports available. Reporting system can be implemented here.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ContentModeration
