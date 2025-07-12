import { useState, useEffect } from 'react'

const SearchFilters = ({ filters, onFiltersChange }) => {
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [availableTags, setAvailableTags] = useState([])
  const [loadingTags, setLoadingTags] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL

  // Fetch available tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoadingTags(true)
        const response = await fetch(`${API_URL}/api/tags`)
        if (response.ok) {
          const tags = await response.json()
          setAvailableTags(tags.slice(0, 20)) // Limit to top 20 tags
        }
      } catch (error) {
        console.error('Error fetching tags:', error)
      } finally {
        setLoadingTags(false)
      }
    }

    fetchTags()
  }, [API_URL])

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({ search: searchInput })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchInput, onFiltersChange])

  const handleTagChange = (tag) => {
    onFiltersChange({ tag })
  }

  const handleSortChange = (sort) => {
    onFiltersChange({ sort })
  }

  const clearFilters = () => {
    setSearchInput('')
    onFiltersChange({ search: '', tag: '', sort: 'newest' })
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full p-3 border rounded-lg pl-10"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        <select
          value={filters.tag || ''}
          onChange={(e) => handleTagChange(e.target.value)}
          className="p-3 border rounded-lg min-w-32"
          disabled={loadingTags}
        >
          <option value="">All Tags</option>
          {availableTags.map((tag) => (
            <option key={tag.id} value={tag.name}>
              {tag.name} ({tag._count?.questions || 0})
            </option>
          ))}
        </select>
        
        <select
          value={filters.sort || 'newest'}
          onChange={(e) => handleSortChange(e.target.value)}
          className="p-3 border rounded-lg min-w-32"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="votes">Most Votes</option>
          <option value="answers">Most Answers</option>
        </select>

        {(filters.search || filters.tag || filters.sort !== 'newest') && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchFilters
