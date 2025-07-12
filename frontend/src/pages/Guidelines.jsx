import LeftSidebar from '../components/LeftSidebar'
import RightSidebar from '../components/RightSidebar'

const Guidelines = () => {
  return (
    <div className="flex gap-6 max-w-7xl mx-auto">
      <div className="hidden lg:block w-64 flex-shrink-0">
        <LeftSidebar />
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-4xl font-heading font-bold text-primary mb-6">
            💡 Community Guidelines
          </h1>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Ask Good Questions</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Search first:</strong> Check if your question has already been asked</li>
                <li>• <strong>Be specific:</strong> Include relevant details and context</li>
                <li>• <strong>Show your work:</strong> Include code, error messages, or attempts you've made</li>
                <li>• <strong>Use clear titles:</strong> Summarize the problem in the title</li>
                <li>• <strong>Format properly:</strong> Use code blocks for code and proper formatting</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Write Good Answers</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Answer the question:</strong> Address what was actually asked</li>
                <li>• <strong>Explain your solution:</strong> Don't just provide code, explain why it works</li>
                <li>• <strong>Be accurate:</strong> Test your solution before posting</li>
                <li>• <strong>Stay relevant:</strong> Keep answers focused on the question</li>
                <li>• <strong>Be helpful:</strong> Provide additional resources or links when appropriate</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Community Standards</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-green-700 mb-2">✅ Do</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Be respectful and professional</li>
                    <li>• Help others learn and grow</li>
                    <li>• Vote on helpful content</li>
                    <li>• Accept answers that solve your problem</li>
                    <li>• Edit your posts to improve them</li>
                    <li>• Use appropriate tags</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-red-700 mb-2">❌ Don't</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Post duplicate questions</li>
                    <li>• Ask for homework solutions without effort</li>
                    <li>• Use offensive or inappropriate language</li>
                    <li>• Spam or self-promote excessively</li>
                    <li>• Post off-topic content</li>
                    <li>• Argue in comments - use chat instead</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Voting and Reputation</h2>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700">
                  Voting is how the community curates content. Upvote helpful, accurate, and well-written posts. 
                  Downvote posts that are incorrect, unclear, or not useful.
                </p>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Reputation</strong> is earned through community voting on your contributions</li>
                <li>• <strong>Upvotes</strong> on your questions and answers increase your reputation</li>
                <li>• <strong>Accepted answers</strong> earn additional reputation points</li>
                <li>• <strong>Higher reputation</strong> unlocks additional privileges in the community</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Formatting Tips</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 mb-3">Use these formatting options to make your posts more readable:</p>
                <ul className="space-y-1 text-sm text-gray-700 font-mono">
                  <li>• `inline code` for small code snippets</li>
                  <li>• ```language for code blocks</li>
                  <li>• **bold text** for emphasis</li>
                  <li>• *italic text* for subtle emphasis</li>
                  <li>• > for blockquotes</li>
                  <li>• - or * for lists</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Need Help?</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about these guidelines or need help with the platform, 
                please don't hesitate to reach out to our community moderators.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  <strong>Remember:</strong> Our community thrives when everyone contributes positively. 
                  Help us maintain a welcoming environment for developers of all skill levels.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="hidden xl:block w-80 flex-shrink-0">
        <RightSidebar />
      </div>
    </div>
  )
}

export default Guidelines
