import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import QuestionCard from '../components/QuestionCard'
import SearchFilters from '../components/SearchFilters'
import LoadingSkeleton from '../components/LoadingSkeleton'
import LeftSidebar from '../components/LeftSidebar'
import RightSidebar from '../components/RightSidebar'

const UnansweredQuestions = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    tag: '',
    sort: 'newest',
    page: 1
  })

  const observer = useRef()
  const API_URL = import.meta.env.VITE_API_URL

  const fetchQuestions = useCallback(async (page = 1, reset = false) => {
    try {
      if (page === 1) {
        setLoading(true)
        setError('')
      } else {
        setLoadingMore(true)
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        answered: 'false',
        ...(filters.sort && { sort: filters.sort }),
        ...(filters.search && { search: filters.search }),
        ...(filters.tag && { tag: filters.tag }),
        ...(page === 1 && { includeTotal: 'true' })
      })
      
      const response = await fetch(`${API_URL}/api/questions?${params}`)
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }
      
      const data = await response.json()
      const newQuestions = data.questions || []
      
      if (reset || page === 1) {
        setQuestions(newQuestions)
      } else {
        setQuestions(prev => [...prev, ...newQuestions])
      }
      
      setHasMore(data.pagination.hasNext)
      setFilters(prev => ({ ...prev, page }))
      
    } catch (error) {
      console.error('Error fetching questions:', error)
      setError('Failed to load questions. Please try again.')
      if (page === 1) {
        setQuestions([])
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [API_URL, filters.search, filters.tag, filters.sort])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchQuestions(1, true)
    }, filters.search ? 500 : 0)

    return () => clearTimeout(timeoutId)
  }, [filters.search, filters.tag, filters.sort])

  const lastQuestionElementRef = useCallback(node => {
    if (loading || loadingMore) return
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchQuestions(filters.page + 1)
      }
    })
    
    if (node) observer.current.observe(node)
  }, [loading, loadingMore, hasMore, filters.page, fetchQuestions])

  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  return (
    <div className="flex gap-6 max-w-7xl mx-auto">
      <div className="hidden lg:block w-64 flex-shrink-0">
        <LeftSidebar />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-primary">
            ❓ Unanswered Questions
          </h1>
          <Link to="/ask" className="btn-primary">
            Ask Question
          </Link>
        </div>

        <SearchFilters 
          filters={filters} 
          onFiltersChange={handleFiltersChange}
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              onClick={() => fetchQuestions(1, true)}
              className="ml-2 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <LoadingSkeleton key={i} type="question" />
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Great! All questions have been answered.
                  </p>
                  <Link to="/ask" className="text-blue-600 hover:underline">
                    Ask the first unanswered question
                  </Link>
                </div>
              ) : (
                questions.map((question, index) => (
                  <div 
                    key={question.id}
                    ref={index === questions.length - 1 ? lastQuestionElementRef : null}
                  >
                    <QuestionCard question={question} />
                  </div>
                ))
              )}
            </div>

            {loadingMore && (
              <div className="space-y-4 mt-4">
                {[...Array(3)].map((_, i) => (
                  <LoadingSkeleton key={i} type="question" />
                ))}
              </div>
            )}

            {!hasMore && questions.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">You've reached the end!</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="hidden xl:block w-80 flex-shrink-0">
        <RightSidebar />
      </div>
    </div>
  )
}

export default UnansweredQuestions
