// TypingIndicator — Animation de chargement (3 points qui rebondissent)

import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="typing-indicator" role="status" aria-label="Orientus réfléchit">
      <div className="typing-dots">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <span className="typing-text">Orientus réfléchit...</span>
    </div>
  );
};

export default React.memo(TypingIndicator);
