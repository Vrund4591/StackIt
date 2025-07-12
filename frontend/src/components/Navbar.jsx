import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link 
            to="/" 
            className="flex items-center hover:opacity-80 transition-opacity duration-200"
          >
            <img 
              src="/logo.svg" 
              alt="StackIt Logo" 
              className="h-16 w-auto"
            />
          </Link>
          
          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Ask Question Button */}
                {/* <Link 
                  to="/ask"
                  className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Ask Question
                </Link> */}

                {/* User Profile */}
                <Link 
                  to={`/user/${user.username}`}
                  className="flex items-center p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  title={`View profile of ${user.username}`}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:shadow-md transition-shadow duration-200">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                    {user.username}
                  </span>
                </Link>
                
                {/* Logout Button */}
                <button 
                  onClick={logout}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Login Link */}
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                
                {/* Register Button */}
                <Link 
                  to="/register" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar