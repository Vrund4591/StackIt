import { useState, useEffect } from 'react'

const SearchFilters = ({ questions, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    let filtered = [...questions]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(q => q.tags.includes(selectedTag))
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case 'votes':
        filtered.sort((a, b) => b.upvotes - a.upvotes)
        break
      case 'answers':
        filtered.sort((a, b) => b.answers - a.answers)
        break
    }

    onFilter(filtered)
  }, [searchTerm, selectedTag, sortBy, questions, onFilter])

  // Get unique tags from questions and ensure they are strings
  const allTags = [...new Set(
    questions.flatMap(q => 
      Array.isArray(q.tags) ? q.tags.filter(tag => typeof tag === 'string') : []
    )
  )]

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>
        
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="">All Tags</option>
          {allTags.map((tag, index) => (
            <option key={`${tag}-${index}`} value={tag}>{tag}</option>
          ))}
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="newest">Newest</option>
          <option value="votes">Most Votes</option>
          <option value="answers">Most Answers</option>
        </select>
      </div>
    </div>
  )
}

export default SearchFilters
