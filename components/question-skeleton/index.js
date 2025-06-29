import React from 'react';

const QuestionSkeleton = ({ index, loadingIndex, total, t }) => {
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200 relative overflow-hidden">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/20 to-transparent animate-pulse"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
        <div className="flex space-x-2">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Prompt field */}
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Difficulty and Type fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Generate button area */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-10 bg-blue-200 rounded w-32 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
      </div>

      {/* Loading indicator */}
      <div className="text-center py-8">
        <div className="inline-flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span className="text-sm text-gray-500">
            {total ? `Waiting in queue (${loadingIndex + 1} of ${total})` : 'Generating question...'}
          </span>
        </div>
      </div>


    </div>
  );
};

export default QuestionSkeleton; 