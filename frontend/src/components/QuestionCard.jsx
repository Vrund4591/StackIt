import { Link } from 'react-router-dom'

const QuestionCard = ({ question }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Link 
            to={`/question/${question.id}`}
            className="text-xl font-semibold text-blue-600 hover:text-blue-800"
          >
            {question.title}
          </Link>
          <p className="text-gray-600 mt-2 line-clamp-2">
            {question.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
          </p>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="flex gap-2">
              {question.tags.map(tag => (
                <span 
                  key={tag.id}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                >
                  {tag.name}
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              by {question.author.username}
            </span>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>Asked by {question.author.username}</span>
            <span>{new Date(question.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="text-right text-sm text-gray-500 ml-4">
          <div>{question.voteCount} votes</div>
          <div>{question.answerCount} answers</div>
        </div>
      </div>
    </div>
  )
}

export default QuestionCard
