import VoteButton from './VoteButton'
import { useAuth } from '../context/AuthContext'

const AnswerCard = ({ answer, questionAuthorId, onAcceptAnswer }) => {
  const { user } = useAuth()
  const isQuestionAuthor = user && user.id === questionAuthorId

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${answer.isAccepted ? 'border-l-4 border-green-500' : ''}`}>
      <div className="flex gap-4">
        <VoteButton
          type="answer"
          itemId={answer.id}
          initialVoteCount={answer.voteCount || 0}
          userVote={answer.userVote}
        />
        
        <div className="flex-1">
          {answer.isAccepted && (
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-3">
              ✓ Accepted Answer
            </div>
          )}
          
          <div className="prose max-w-none mb-4">
            <p className="text-gray-800 whitespace-pre-wrap">{answer.content}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Answered by <strong>{answer.author.username}</strong></span>
              <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
            </div>
            
            {isQuestionAuthor && !answer.isAccepted && (
              <button
                onClick={() => onAcceptAnswer(answer.id)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Accept Answer
              </button>
            )}
          </div>
          
          {answer.comments && answer.comments.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Comments:</h4>
              {answer.comments.map(comment => (
                <div key={comment.id} className="text-sm text-gray-600 mb-2">
                  <strong>{comment.user.username}:</strong> {comment.content}
                  <span className="text-gray-400 ml-2">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnswerCard
