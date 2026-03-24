// SuggestionChips — Boutons de suggestions cliquables

import React from 'react';

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ suggestions, onSelect }) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="suggestions-container">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          className="suggestion-chip"
          onClick={() => onSelect(suggestion)}
          aria-label={`Suggestion : ${suggestion}`}
          type="button"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default React.memo(SuggestionChips);
