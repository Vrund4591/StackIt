import { Link } from 'react-router-dom'
import VoteButton from './VoteButton'

const QuestionCard = ({ question }) => {
  // Create a truncated HTML preview
  const createPreview = (htmlContent, maxLength = 200) => {
    // First strip HTML to check length
    const textContent = htmlContent.replace(/<[^>]*>/g, '')
    if (textContent.length <= maxLength) {
      return htmlContent
    }
    
    // If too long, truncate the text and add ellipsis
    const truncatedText = textContent.substring(0, maxLength)
    const lastSpaceIndex = truncatedText.lastIndexOf(' ')
    const finalText = lastSpaceIndex > 0 ? truncatedText.substring(0, lastSpaceIndex) : truncatedText
    
    // Return as plain text with ellipsis since we truncated
    return finalText + '...'
  }

  const previewContent = createPreview(question.content)
  const isHtmlContent = previewContent === question.content

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      {/* Author info at top - Reddit style */}
      <div className="flex items-center gap-3 mb-4">
        <Link to={`/user/${question.author.username}`} className="flex items-center gap-3 hover:opacity-80">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            {question.author.avatar ? (
              <img 
                src={question.author.avatar} 
                alt={question.author.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-blue-600">
                {question.author.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="font-medium text-gray-900">{question.author.username}</span>
        </Link>
        
        {/* Move date, answers, and solved status to the right */}
        <div className="ml-auto flex items-center gap-3 text-sm">
          <span className="text-gray-500">{new Date(question.createdAt).toLocaleDateString()}</span>
          <span className="text-gray-500">•</span>
          <span className={`${question.answerCount > 0 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
            {question.answerCount} answer{question.answerCount !== 1 ? 's' : ''}
          </span>
          {question.hasAcceptedAnswer && (
            <>
              <span className="text-gray-500">•</span>
              <span className="text-green-600 font-medium">✓ Solved</span>
            </>
          )}
        </div>
      </div>

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
          
          {isHtmlContent ? (
            <div 
              className="text-gray-600 mb-4 prose prose-sm max-w-none line-clamp-3 
                         prose-p:my-1 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                         prose-strong:font-semibold prose-em:italic prose-ul:my-1 prose-ol:my-1 prose-li:my-0
                         prose-blockquote:border-l-2 prose-blockquote:border-gray-300 prose-blockquote:pl-2 prose-blockquote:italic
                         prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                         [&_*]:whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          ) : (
            <p className="text-gray-600 mb-4 line-clamp-3 whitespace-pre-wrap">
              {previewContent}
            </p>
          )}
          
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
        </div>
      </div>
    </div>
  )
}

export default QuestionCard
