import React from 'react';

export default function SuggestionList({ 
  activeSuggestionIndex, 
  filteredSuggestions, 
  suggestionPosition,
  onSuggestionClick 
}) {
  if (activeSuggestionIndex === null || filteredSuggestions.length === 0) {
    return null;
  }

  return (
    <div 
      className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
      style={{
        top: suggestionPosition.top,
        left: suggestionPosition.left,
        width: suggestionPosition.width
      }}
    >
      <ul>
        {filteredSuggestions.map((s, sIndex) => (
          <li
            key={sIndex}
            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
            onMouseDown={(e) => onSuggestionClick(activeSuggestionIndex, s.value, e)}
          >
            <strong className="text-blue-600">{s.label}:</strong> {s.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
