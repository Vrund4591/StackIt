const LoadingSkeleton = ({ type = 'question' }) => {
  if (type === 'question') {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="flex gap-4">
          <div className="flex flex-col items-center space-y-1">
            <div className="w-10 h-8 bg-gray-200 rounded"></div>
            <div className="w-8 h-6 bg-gray-200 rounded"></div>
            <div className="w-10 h-8 bg-gray-200 rounded"></div>
          </div>
          
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            
            <div className="flex gap-2 mb-3">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'answer') {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="flex gap-4">
          <div className="flex flex-col items-center space-y-1">
            <div className="w-10 h-8 bg-gray-200 rounded"></div>
            <div className="w-8 h-6 bg-gray-200 rounded"></div>
            <div className="w-10 h-8 bg-gray-200 rounded"></div>
          </div>
          
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;
