// ChatFloatingButton — Bouton flottant 💬 pour ouvrir/fermer le chat

import React from 'react';

interface ChatFloatingButtonProps {
  isOpen: boolean;
  hasUnread: boolean;
  onClick: () => void;
}

const ChatFloatingButton: React.FC<ChatFloatingButtonProps> = ({ isOpen, hasUnread, onClick }) => {
  return (
    <button
      className="chat-floating-btn"
      onClick={onClick}
      aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
      type="button"
    >
      {isOpen ? '✕' : '💬'}
      {/* Badge de notification si nouveau message non lu */}
      {!isOpen && hasUnread && <span className="notification-badge" />}
    </button>
  );
};

export default React.memo(ChatFloatingButton);
