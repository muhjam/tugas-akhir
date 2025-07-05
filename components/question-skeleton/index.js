import React from 'react';
import { useTranslation } from 'next-i18next';

const QuestionSkeleton = ({ index, loadingIndex, total }) => {
  const { t } = useTranslation('common');
  
  // Calculate the question number (1-based) 
  const questionNumber = loadingIndex + 1;
  
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200 relative overflow-hidden">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/20 to-transparent animate-pulse"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
          <span className="text-sm font-medium text-gray-500">#{questionNumber}</span>
        </div>
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
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm font-medium text-blue-700">
            {t('streaming.generatingQuestion')} #{questionNumber}...
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuestionSkeleton; 