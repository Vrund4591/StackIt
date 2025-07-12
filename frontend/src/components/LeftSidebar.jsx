import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LeftSidebar = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigationItems = [
    {
      name: 'Home',
      path: '/',
      icon: '🏠',
      description: 'Your personalized feed'
    },
    {
      name: 'Popular',
      path: '/popular',
      icon: '🔥',
      description: 'Most voted questions'
    },
    {
      name: 'Recent',
      path: '/recent',
      icon: '🕒',
      description: 'Latest questions'
    },
    {
      name: 'Unanswered',
      path: '/unanswered',
      icon: '❓',
      description: 'Questions awaiting answers'
    },
    {
      name: 'Tags',
      path: '/tags',
      icon: '🏷️',
      description: 'Browse by topic'
    }
  ]

  const userItems = user ? [
    {
      name: 'My Questions',
      path: `/user/${user.username}`,
      icon: '📝',
      description: 'Questions you\'ve asked'
    },
    {
      name: 'My Answers',
      path: `/user/${user.username}?tab=answers`,
      icon: '💬',
      description: 'Your answers'
    },
    // {
    //   name: 'Saved',
    //   path: '/saved',
    //   icon: '⭐',
    //   description: 'Bookmarked questions'
    // },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: '🔔',
      description: 'Your activity feed'
    }
  ] : []

  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/' && !location.search
    }
    if (path.includes('?')) {
      return location.pathname + location.search === path
    }
    return location.pathname === path
  }

  const NavItem = ({ item, isActive }) => (
    <Link
      to={item.path}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
        isActive 
          ? 'bg-blue-100 text-blue-700 font-medium' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      title={item.description}
    >
      <span className="text-lg">{item.icon}</span>
      <span className="text-sm">{item.name}</span>
    </Link>
  )

  return (
    <div className="sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <nav className="space-y-1">
          <div className="pb-2 mb-2 border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
              Browse
            </h3>
          </div>
          
          {navigationItems.map((item) => (
            <NavItem 
              key={item.name} 
              item={item} 
              isActive={isActiveLink(item.path)} 
            />
          ))}
        </nav>
      </div>

      {user && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="pb-2 mb-2 border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
              Personal
            </h3>
          </div>
          
          <nav className="space-y-1">
            {userItems.map((item) => (
              <NavItem 
                key={item.name} 
                item={item} 
                isActive={isActiveLink(item.path)} 
              />
            ))}
          </nav>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <div className="pb-2 mb-2 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
            Quick Actions
          </h3>
        </div>
        
        <div className="space-y-2">
          <Link
            to="/ask"
            className="flex items-center gap-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="text-lg">✍️</span>
            <span className="text-sm font-medium">Ask Question</span>
          </Link>
          
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <span className="text-lg">⚙️</span>
              <span className="text-sm font-medium">Admin Panel</span>
            </Link>
          )}
        </div>
      </div>

      {/* Community Guidelines */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mt-4 border border-blue-100">
        <h4 className="font-medium text-gray-900 mb-2">💡 Community Guidelines</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Be respectful and constructive</li>
          <li>• Search before asking</li>
          <li>• Provide clear, detailed questions</li>
          <li>• Accept helpful answers</li>
        </ul>
        <Link 
          to="/guidelines" 
          className="text-blue-600 hover:text-blue-800 text-xs underline mt-2 inline-block"
        >
          Read full guidelines →
        </Link>
      </div>
    </div>
  )
}

export default LeftSidebar
