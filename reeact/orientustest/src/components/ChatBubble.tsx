// ChatBubble — Bulle de message (user ou assistant)
// Affiche le texte, les résultats, et les boutons de feedback

import React from 'react';
import type { ChatMessage } from '../types/chatbot';
import ProgramResults from './ProgramResults';
import FeedbackButtons from './FeedbackButtons';

interface ChatBubbleProps {
  message: ChatMessage;
  onFeedbackGiven: (messageId: string) => void;
  /** Contenu à injecter sous la bulle (suggestions, bouton retry, etc.) */
  children?: React.ReactNode;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onFeedbackGiven, children }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`chat-message ${message.role}`}>
      {/* Bulle principale */}
      <div className="chat-bubble">
        {message.content}
        {/* Icône de clarification */}
        {message.needsClarification && <span className="clarification-icon">❓</span>}
      </div>

      {/* Résultats programmes (seulement pour les messages bot) */}
      {!isUser && message.results && message.results.length > 0 && (
        <ProgramResults results={message.results} stats={message.stats} />
      )}

      {/* Feedback (seulement pour les messages bot ayant un messageId) */}
      {!isUser && message.messageId && (
        <FeedbackButtons
          messageId={message.messageId}
          feedbackGiven={!!message.feedbackGiven}
          onFeedbackGiven={() => onFeedbackGiven(message.messageId!)}
        />
      )}

      {/* Contenu additionnel (suggestions, retry, etc.) */}
      {children}
    </div>
  );
};

export default React.memo(ChatBubble);
