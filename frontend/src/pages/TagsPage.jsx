import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LeftSidebar from '../components/LeftSidebar'
import RightSidebar from '../components/RightSidebar'

const TagsPage = () => {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('popular')

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    fetchTags()
  }, [sortBy])

  const fetchTags = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/tags?sort=${sortBy}`)
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }
      const data = await response.json()
      setTags(data)
    } catch (error) {
      console.error('Error fetching tags:', error)
      setError('Failed to load tags. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getTagColor = (count) => {
    if (count >= 100) return 'bg-red-100 text-red-800 border-red-200'
    if (count >= 50) return 'bg-orange-100 text-orange-800 border-orange-200'
    if (count >= 20) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (count >= 10) return 'bg-green-100 text-green-800 border-green-200'
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }

  return (
    <div className="flex gap-6 max-w-7xl mx-auto">
      <div className="hidden lg:block w-64 flex-shrink-0">
        <LeftSidebar />
      </div>

      <div className="flex-1 min-w-0">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">
            🏷️ Browse Tags
          </h1>
          <p className="text-gray-600">
            A tag is a keyword or label that categorizes your question with other, similar questions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="popular">Popular</option>
            <option value="name">Name</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              onClick={fetchTags}
              className="ml-2 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {filteredTags.length} tags found
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTags.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No tags found matching your search.</p>
                </div>
              ) : (
                filteredTags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/?tag=${tag.name}`}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTagColor(tag._count?.questions || 0)}`}>
                        {tag.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {tag._count?.questions || 0}
                      </span>
                    </div>
                    {tag.description && (
                      <p className="text-sm text-gray-600 line-clamp-3 group-hover:text-gray-800">
                        {tag.description}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      {tag._count?.questions || 0} {tag._count?.questions === 1 ? 'question' : 'questions'}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <div className="hidden xl:block w-80 flex-shrink-0">
        <RightSidebar />
      </div>
    </div>
  )
}

export default TagsPage
