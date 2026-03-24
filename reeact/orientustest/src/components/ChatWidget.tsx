// ChatWidget — Composant principal du chatbot Orientus (refactoré)
// Orchestre tous les sous-composants : bulles, suggestions, feedback, résultats, etc.

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage } from '../types/chatbot';
import { fetchWelcome, sendMessage } from '../services/chatbotService';
import ChatFloatingButton from './ChatFloatingButton';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';
import SuggestionChips from './SuggestionChips';
import '../styles/chatWidget.css';

// Suggestions contextuelles affichées lors d'une clarification
const CLARIFICATION_SUGGESTIONS = [
  'Bachelor en France',
  'Master en Latvia',
  'Budget < 3000€/an',
  'Programmes en IT',
];

const ChatWidget = () => {
  // État principal
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Suggestions (issues du welcome ou de la clarification)
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Dernier message user (pour le bouton réessayer)
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  // Indique si le dernier message bot est une erreur (pour afficher retry)
  const [showRetry, setShowRetry] = useState(false);

  // Animation de fermeture
  const [isClosing, setIsClosing] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Charger le message de bienvenue au premier rendu
  useEffect(() => {
    const loadWelcome = async () => {
      const data = await fetchWelcome();
      const welcomeMsg: ChatMessage = {
        role: 'assistant',
        content: data.message,
      };
      setMessages([welcomeMsg]);
      setSuggestions(data.suggestions);
      setShowSuggestions(true);
    };
    loadWelcome();
  }, []);

  // Auto-scroll vers le bas à chaque changement de messages ou de loading
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Focus sur l'input quand le chat s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Envoyer un message au chatbot
  const handleSend = useCallback(async (text?: string) => {
    const messageText = (text ?? inputValue).trim();
    if (!messageText || isLoading) return;

    // Masquer les suggestions du welcome après le premier envoi
    setShowSuggestions(false);
    setShowRetry(false);
    setInputValue('');
    setLastUserMessage(messageText);

    // Ajouter le message user
    const userMsg: ChatMessage = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Construire le historique (messages actuels + le nouveau message user)
      const currentMessages = [...messages, userMsg];
      const response = await sendMessage(messageText, currentMessages);

      // Construire le message bot
      const botMsg: ChatMessage = {
        role: 'assistant',
        content: response.response,
        messageId: response.messageId,
        results: response.inDomain !== false ? response.results : [],
        stats: response.inDomain !== false ? response.stats : null,
        needsClarification: response.needsClarification ?? false,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Si clarification nécessaire, afficher des suggestions contextuelles
      if (response.needsClarification) {
        setSuggestions(CLARIFICATION_SUGGESTIONS);
        setShowSuggestions(true);
      }

      // Notification non lue si le chat est fermé
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch {
      // Message d'erreur user-friendly
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: '❌ Désolé, une erreur est survenue. Veuillez réessayer.',
      };
      setMessages((prev) => [...prev, errorMsg]);
      setShowRetry(true);
    } finally {
      setIsLoading(false);
      // Remettre le focus sur l'input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputValue, isLoading, messages, isOpen]);

  // Gérer l'envoi par Entrée (Shift+Entrée = nouvelle ligne)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Marquer un message comme ayant reçu un feedback
  const handleFeedbackGiven = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.messageId === messageId ? { ...m, feedbackGiven: true } : m))
    );
  }, []);

  // Ouvrir/fermer le chat avec animation
  const toggleChat = () => {
    if (isOpen) {
      // Animation de fermeture
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 200);
    } else {
      setIsOpen(true);
      setHasUnread(false);
    }
  };

  // Clic sur une suggestion
  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  // Bouton réessayer
  const handleRetry = () => {
    if (lastUserMessage) {
      setShowRetry(false);
      handleSend(lastUserMessage);
    }
  };

  return (
    <>
      {/* Bouton flottant — toujours visible */}
      {!isOpen && (
        <ChatFloatingButton
          isOpen={isOpen}
          hasUnread={hasUnread}
          onClick={toggleChat}
        />
      )}

      {/* Fenêtre de chat */}
      {(isOpen || isClosing) && (
        <div className={`chat-window ${isClosing ? 'closing' : ''}`}>
          {/* Header */}
          <div className="chat-header">
            <div>
              <div className="chat-header-title">💬 Orientus</div>
              <div className="chat-header-status">
                <span className="online-dot" />
                En ligne
              </div>
            </div>
            <button
              className="chat-close-btn"
              onClick={toggleChat}
              aria-label="Fermer le chat"
              type="button"
            >
              ✕
            </button>
          </div>

          {/* Body — zone des messages */}
          <div className="chat-body" role="log" aria-live="polite">
            {messages.map((msg, index) => {
              const isLastBotError =
                showRetry &&
                msg.role === 'assistant' &&
                index === messages.length - 1 &&
                msg.content.startsWith('❌');

              return (
                <ChatBubble
                  key={`${msg.role}-${index}`}
                  message={msg}
                  onFeedbackGiven={handleFeedbackGiven}
                >
                  {/* Suggestions après le welcome (index 0) ou après clarification */}
                  {msg.role === 'assistant' && showSuggestions && (
                    // Afficher sous le premier message bot, ou sous un message de clarification
                    (index === 0 || msg.needsClarification) && (
                      <SuggestionChips
                        suggestions={suggestions}
                        onSelect={handleSuggestionClick}
                      />
                    )
                  )}

                  {/* Bouton réessayer sur le dernier message d'erreur */}
                  {isLastBotError && (
                    <button
                      className="retry-btn"
                      onClick={handleRetry}
                      aria-label="Réessayer le dernier message"
                      type="button"
                    >
                      🔄 Réessayer
                    </button>
                  )}
                </ChatBubble>
              );
            })}

            {/* Indicateur de chargement */}
            {isLoading && <TypingIndicator />}

            {/* Ancre pour l'auto-scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer — saisie + envoi */}
          <div className="chat-footer">
            <textarea
              ref={inputRef}
              className="chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question..."
              disabled={isLoading}
              rows={1}
              aria-label="Saisir un message"
            />
            <button
              className="chat-send-btn"
              onClick={() => handleSend()}
              disabled={isLoading || !inputValue.trim()}
              aria-label="Envoyer le message"
              type="button"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
