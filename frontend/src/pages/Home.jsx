import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import QuestionCard from '../components/QuestionCard'
import SearchFilters from '../components/SearchFilters'

const Home = () => {
  const [questions, setQuestions] = useState([])
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    tag: '',
    page: 1
  })

  // Get API URL from environment variable with fallback
  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    fetchQuestions()
  }, [filters])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.tag) params.append('tag', filters.tag)
      params.append('page', filters.page.toString())
      
      const apiUrl = `${API_URL}/api/questions?${params}`
      
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Backend returns { questions: [...], pagination: {...} }
      const questionsList = data.questions || []
      setQuestions(questionsList)
      setFilteredQuestions(questionsList)
    } catch (error) {
      console.error('Error fetching questions:', error)
      // Set empty array as fallback
      setQuestions([])
      setFilteredQuestions([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-heading font-bold text-primary">
          Recent Questions
        </h1>
        <Link to="/ask" className="btn-primary">
          Ask Question
        </Link>
      </div>

      <SearchFilters 
        questions={questions}
        onFilter={setFilteredQuestions}
        filters={filters} 
        onFiltersChange={setFilters} 
      />

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No questions found. Be the first to ask!</p>
            </div>
          ) : (
            filteredQuestions.map(question => (
              <QuestionCard key={question.id} question={question} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Home