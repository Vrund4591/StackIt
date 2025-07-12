import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const VoteButton = ({ type = 'question', itemId, initialVoteCount = 0, userVote = null, onVoteUpdate }) => {
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [currentVote, setCurrentVote] = useState(userVote)
  const [loading, setLoading] = useState(false)
  const { user, token } = useAuth()
  
  const API_URL = import.meta.env.VITE_API_URL

  const handleVote = async (voteType) => {
    if (!user) {
      alert('Please login to vote')
      return
    }

    if (loading) return

    setLoading(true)
    try {
      const endpoint = type === 'question' ? 'question' : 'answer'
      const response = await fetch(`${API_URL}/api/votes/${endpoint}/${itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: voteType })
      })

      if (!response.ok) {
        throw new Error('Vote failed')
      }

      const data = await response.json()
      
      // Update vote count based on action
      let newVoteCount = voteCount
      let newCurrentVote = currentVote

      if (currentVote === voteType) {
        // Remove vote
        newVoteCount = voteCount - (voteType === 'UP' ? 1 : -1)
        newCurrentVote = null
      } else if (currentVote && currentVote !== voteType) {
        // Change vote
        newVoteCount = voteCount + (voteType === 'UP' ? 2 : -2)
        newCurrentVote = voteType
      } else {
        // New vote
        newVoteCount = voteCount + (voteType === 'UP' ? 1 : -1)
        newCurrentVote = voteType
      }

      setVoteCount(newVoteCount)
      setCurrentVote(newCurrentVote)
      
      if (onVoteUpdate) {
        onVoteUpdate(newVoteCount, newCurrentVote)
      }
    } catch (error) {
      console.error('Vote error:', error)
      alert('Failed to vote. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-1">
      <button
        onClick={() => handleVote('UP')}
        disabled={loading}
        className={`p-2 rounded-lg border transition-colors ${
          currentVote === 'UP' 
            ? 'bg-green-100 border-green-500 text-green-700' 
            : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-green-50 hover:border-green-300'
        } disabled:opacity-50`}
      >
        ▲
      </button>
      
      <span className={`font-semibold ${
        voteCount > 0 ? 'text-green-600' : 
        voteCount < 0 ? 'text-red-600' : 'text-gray-600'
      }`}>
        {voteCount}
      </span>
      
      <button
        onClick={() => handleVote('DOWN')}
        disabled={loading}
        className={`p-2 rounded-lg border transition-colors ${
          currentVote === 'DOWN' 
            ? 'bg-red-100 border-red-500 text-red-700' 
            : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-300'
        } disabled:opacity-50`}
      >
        ▼
      </button>
    </div>
  )
}

export default VoteButton
