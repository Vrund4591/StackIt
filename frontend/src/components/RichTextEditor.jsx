import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import Mention from '@tiptap/extension-mention'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import LinkModal from './LinkModal'

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
  FiEdit3,
  FiSmile,
  FiUpload
} from 'react-icons/fi'

const RichTextEditor = ({ 
  content, 
  onChange, 
  placeholder = "Write your content...",
  className = "",
  minHeight = "200px"
}) => {
  const { token } = useAuth()
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [error, setError] = useState('')

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
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none p-4 max-w-none`,
        style: `min-height: ${minHeight}; line-height: 1.6;`,
      },
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
  })

  const handleLinkSave = ({ url, text }) => {
    if (!editor) return
    
    if (text) {
      editor.chain().focus().insertContent(`<a href="${url}">${text}</a>`).run()
    } else {
      const { from, to } = editor.state.selection
      if (from === to) {
        editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run()
      } else {
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

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setImageUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const data = await response.json()
      
      if (editor) {
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run()
      }
    } catch (error) {
      console.error('Image upload error:', error)
      setError(error.message || 'Failed to upload image')
    } finally {
      setImageUploading(false)
      event.target.value = ''
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
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={imageUploading}
            />
            <ToolbarButton
              onClick={() => {}}
              isActive={false}
              icon={imageUploading ? FiUpload : FiImage}
              label={imageUploading ? "Uploading..." : "Upload Image"}
              disabled={imageUploading}
            />
          </div>
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
    <div className={className}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <Toolbar />
        <EditorContent 
          editor={editor} 
          className="max-h-[400px] overflow-y-auto bg-white prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0"
        />
      </div>
      
      <LinkModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onSave={handleLinkSave}
      />
    </div>
  )
}

export default RichTextEditor
