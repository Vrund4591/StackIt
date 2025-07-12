import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const QuestionDetail = () => {
  const { id } = useParams()
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')

  useEffect(() => {
    // Mock data for now
    setQuestion({
      id: parseInt(id),
      title: "How to use React hooks?",
      content: "I'm having trouble understanding React hooks...",
      author: "john_doe",
      tags: ["react", "javascript"],
      upvotes: 5,
      answers: [],
      createdAt: new Date().toISOString()
    })
  }, [id])

  const handleSubmitAnswer = (e) => {
    e.preventDefault()
    // TODO: Submit answer to backend
    console.log({ questionId: id, answer })
    setAnswer('')
  }

  if (!question) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4">{question.title}</h1>
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <span>Asked by {question.author}</span>
          <span>{new Date(question.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="mb-4">
          {question.tags.map(tag => (
            <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-gray-800">{question.content}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Your Answer</h2>
        <form onSubmit={handleSubmitAnswer}>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 border rounded-lg h-32 mb-4"
            placeholder="Write your answer..."
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Post Answer
          </button>
        </form>
      </div>
    </div>
  )
}

export default QuestionDetail
