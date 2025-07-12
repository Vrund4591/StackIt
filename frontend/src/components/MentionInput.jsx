import { useState, useRef, useEffect } from 'react';

const MentionInput = ({ value, onChange, placeholder, className, disabled }) => {
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ start: 0, end: 0 });
  const textareaRef = useRef(null);

  useEffect(() => {
    if (mentionSearch.length >= 2) {
      searchUsers(mentionSearch);
    } else {
      setMentionSuggestions([]);
      setShowSuggestions(false);
    }
  }, [mentionSearch]);

  // Get API URL from environment variable
  const API_URL = import.meta.env.VITE_API_URL

  const searchUsers = async (query) => {
    try {
      const response = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const users = await response.json();
        setMentionSuggestions(users.slice(0, 5)); // Limit to 5 suggestions
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    onChange(newValue);
    
    // Check for @ mentions
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const mentionText = mentionMatch[1];
      const mentionStart = cursorPosition - mentionText.length - 1;
      
      setMentionSearch(mentionText);
      setMentionPosition({ start: mentionStart, end: cursorPosition });
    } else {
      setMentionSearch('');
      setShowSuggestions(false);
    }
  };

  const handleMentionSelect = (username) => {
    const beforeMention = value.substring(0, mentionPosition.start);
    const afterMention = value.substring(mentionPosition.end);
    const newValue = `${beforeMention}@${username} ${afterMention}`;
    
    onChange(newValue);
    setShowSuggestions(false);
    setMentionSearch('');
    
    // Focus back to textarea
    if (textareaRef.current) {
      const newCursorPosition = mentionPosition.start + username.length + 2;
      setTimeout(() => {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    }
  };

  const handleKeyDown = (e) => {
    if (showSuggestions && mentionSuggestions.length > 0) {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        setMentionSearch('');
      }
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
      
      {showSuggestions && mentionSuggestions.length > 0 && (
        <div className="absolute z-10 w-64 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {mentionSuggestions.map((user) => (
            <button
              key={user.id}
              onClick={() => handleMentionSelect(user.username)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
            >
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm">@{user.username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentionInput;
