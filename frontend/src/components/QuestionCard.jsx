import { Link } from 'react-router-dom'
import VoteButton from './VoteButton'

const QuestionCard = ({ question }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <VoteButton
          type="question"
          itemId={question.id}
          initialVoteCount={question.voteCount || 0}
          userVote={question.userVote}
        />
        
        <div className="flex-1">
          <Link 
            to={`/question/${question.id}`}
            className="text-xl font-semibold text-blue-600 hover:text-blue-800 block mb-2"
          >
            {question.title}
          </Link>
          
          <p className="text-gray-600 mb-4 line-clamp-2">
            {question.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
          </p>
          
          <div className="flex items-center gap-2 mb-3">
            {question.tags.map(tag => (
              <span 
                key={tag.id}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
              >
                {tag.name}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Asked by <strong>{question.author.username}</strong></span>
            <div className="flex items-center gap-4">
              <span className={`${question.answerCount > 0 ? 'text-green-600 font-medium' : ''}`}>
                {question.answerCount} answer{question.answerCount !== 1 ? 's' : ''}
              </span>
              {question.hasAcceptedAnswer && (
                <span className="text-green-600 font-medium">✓ Solved</span>
              )}
              <span>{new Date(question.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionCard
