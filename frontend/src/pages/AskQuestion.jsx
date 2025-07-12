import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import Mention from '@tiptap/extension-mention'
import LinkModal from '../components/LinkModal'

// Import icons
import { 
  FiBold, 
  FiItalic, 
  FiUnderline, 
  FiMinus,
  FiCode, 
  FiFileText, 
  FiList, 
  FiHash,
  FiMessageSquare,
  FiLink,
  FiImage,
  FiType,
  FiEdit3,
  FiSmile
} from 'react-icons/fi'

const AskQuestion = () => {
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [mentionSuggestions, setMentionSuggestions] = useState([])
  const navigate = useNavigate()
  const { user, token } = useAuth()

  // Get API URL from environment variable with fallback
  const API_URL = import.meta.env.VITE_API_URL

  // Common emojis for quick access
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
    '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
    '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤏', '💪',
    '🙏', '✍️', '💡', '🔥', '💯', '✅', '❌', '⭐', '🎉', '🎊'
  ]

  // Search users for mentions
  const searchUsers = async (query) => {
    if (query.length < 2) return []
    
    try {
      const response = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      if (response.ok) {
        const users = await response.json()
        return users.slice(0, 5)
      }
    } catch (error) {
      console.error('Error searching users:', error)
    }
    return []
  }

  // Tiptap editor configuration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc ml-6 my-2',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal ml-6 my-2',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'mb-1',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-gray-100 p-4 rounded-lg font-mono text-sm my-4 overflow-x-auto',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'bg-gray-100 px-2 py-1 rounded text-sm font-mono',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700',
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: 'mb-3',
          },
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800 cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Color,
      TextStyle,
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-200 px-1 rounded',
        },
      }),
      Underline,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention bg-blue-100 text-blue-800 px-1 rounded font-medium',
        },
        suggestion: {
          items: async ({ query }) => {
            return await searchUsers(query)
          },
          render: () => {
            let component
            let popup

            return {
              onStart: (props) => {
                component = document.createElement('div')
                component.className = 'mention-suggestions bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50'
                
                popup = document.createElement('div')
                popup.className = 'fixed z-50'
                popup.appendChild(component)
                document.body.appendChild(popup)

                this.updateProps(props)
              },

              onUpdate: (props) => {
                this.updateProps(props)
              },

              onKeyDown: (props) => {
                if (props.event.key === 'Escape') {
                  popup.remove()
                  return true
                }
                return false
              },

              onExit: () => {
                if (popup) {
                  popup.remove()
                }
              },

              updateProps: (props) => {
                const { items, command } = props
                
                if (items.length === 0) {
                  component.innerHTML = '<div class="px-4 py-2 text-gray-500 text-sm">No users found</div>'
                  return
                }

                component.innerHTML = items
                  .map((item, index) => 
                    `<div class="mention-item px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2 ${index === 0 ? 'bg-gray-50' : ''}" data-index="${index}">
                      <div class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <span class="text-xs font-medium">${item.username.charAt(0).toUpperCase()}</span>
                      </div>
                      <span class="text-sm">@${item.username}</span>
                    </div>`
                  )
                  .join('')

                // Add click handlers
                component.querySelectorAll('.mention-item').forEach((item, index) => {
                  item.addEventListener('click', () => {
                    command({ id: items[index].id, label: items[index].username })
                  })
                })

                // Position the popup
                const rect = props.decorationNode?.getBoundingClientRect()
                if (rect) {
                  popup.style.left = `${rect.left}px`
                  popup.style.top = `${rect.bottom + 8}px`
                }
              }
            }
          }
        }
      })
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[200px] p-4 max-w-none',
      },
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
  })

  // Redirect if not authenticated
  if (!user) {
    navigate('/login')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Basic client-side validation
    if (title.length < 5) {
      setError('Title must be at least 5 characters long')
      setLoading(false)
      return
    }
    
    // Get HTML content from Tiptap editor
    const description = editor?.getHTML() || ''
    
    // Strip HTML tags for length validation
    const plainTextDescription = description.replace(/<[^>]*>/g, '').trim()
    if (plainTextDescription.length < 10) {
      setError('Description must be at least 10 characters long')
      setLoading(false)
      return
    }
    
    try {
      const questionData = {
        title,
        description, // Keep HTML formatting
        tags: tags.split(',').map(t => t.trim()).filter(t => t)
      }
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${API_URL}/api/questions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(questionData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.details) {
          // Handle validation errors
          const validationErrors = errorData.details.map(err => err.msg).join(', ')
          throw new Error(`Validation error: ${validationErrors}`)
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Question posted successfully:', data)
      navigate('/')
    } catch (error) {
      console.error('Error posting question:', error)
      setError(error.message || 'Failed to post question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLinkSave = ({ url, text }) => {
    if (!editor) return
    
    if (text) {
      // If text is provided, create a link with custom text
      editor.chain().focus().insertContent(`<a href="${url}">${text}</a>`).run()
    } else {
      // If no text, check if there's a selection
      const { from, to } = editor.state.selection
      if (from === to) {
        // No selection, insert the URL as both href and text
        editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run()
      } else {
        // Text is selected, just add the link
        editor.chain().focus().setLink({ href: url }).run()
      }
    }
  }

  const handleEmojiSelect = (emoji) => {
    if (editor) {
      editor.chain().focus().insertContent(emoji).run()
      setShowEmojiPicker(false)
    }
  }

  const ToolbarButton = ({ onClick, isActive, icon: Icon, label, disabled = false }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        if (!disabled && editor) {
          onClick()
        }
      }}
      disabled={disabled || !editor}
      className={`p-2 rounded-md transition-colors duration-200 flex items-center justify-center min-w-[36px] h-9 ${
        isActive 
          ? 'bg-blue-500 text-white shadow-sm' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
      } ${disabled || !editor ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm cursor-pointer'}`}
      title={label}
    >
      <Icon size={16} />
    </button>
  )

  // Toolbar component for Tiptap
  const Toolbar = () => {
    if (!editor) return null

    return (
      <div className="border-b border-gray-300 p-3 flex flex-wrap gap-2 bg-gray-50 rounded-t-lg">
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon={FiBold}
            label="Bold (Ctrl+B)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon={FiItalic}
            label="Italic (Ctrl+I)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            icon={FiUnderline}
            label="Underline"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            icon={FiMinus}
            label="Strikethrough"
          />
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            icon={FiCode}
            label="Inline Code"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            icon={FiFileText}
            label="Code Block"
          />
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon={FiList}
            label="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon={FiHash}
            label="Numbered List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            icon={FiMessageSquare}
            label="Quote"
          />
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => setLinkModalOpen(true)}
            isActive={editor.isActive('link')}
            icon={FiLink}
            label="Add Link"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            icon={FiEdit3}
            label="Highlight"
          />
          <div className="relative">
            <ToolbarButton
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              isActive={showEmojiPicker}
              icon={FiSmile}
              label="Add Emoji"
            />
            {showEmojiPicker && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 w-80">
                <div className="text-xs text-gray-600 mb-2">Click an emoji to insert it</div>
                <div className="grid grid-cols-10 gap-1 max-h-40 overflow-y-auto">
                  {commonEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        handleEmojiSelect(emoji)
                      }}
                      className="text-lg hover:bg-gray-100 rounded p-1 transition-colors"
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Ask a Question</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title (minimum 5 characters)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What's your programming question?"
            required
            minLength={5}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Description (minimum 10 characters)</label>
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <Toolbar />
            <EditorContent 
              editor={editor} 
              className="min-h-[200px] max-h-[400px] overflow-y-auto bg-white prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0"
              style={{
                lineHeight: '1.6'
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Select text and use the toolbar to format. Press Ctrl+B for bold, Ctrl+I for italic. Use lists for better organization. Click the smile icon to add emojis! 😊 Type @ to mention users.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="javascript, react, css (comma separated)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Add up to 5 tags to describe what your question is about.
          </p>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:bg-blue-400 hover:bg-blue-700 transition-colors duration-200 font-medium"
        >
          {loading ? 'Posting...' : 'Post Question'}
        </button>
      </form>

      <LinkModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onSave={handleLinkSave}
      />
    </div>
  )
}

export default AskQuestion