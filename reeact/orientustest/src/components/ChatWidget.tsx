import { useState, useEffect, useRef } from 'react';
import { chatbotService, type ProgramResult } from '../services/chatbotService';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  results?: ProgramResult[];
  timestamp: Date;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  type: 'bot',
  text: `Bonjour ! 👋 Je suis votre assistant virtuel Orientus.

Je vous aide à trouver le programme universitaire idéal parmi nos 35 établissements partenaires dans 9 pays.

Exemples de questions :
• "Je veux étudier en France"
• "Master en informatique en Espagne"
• "Bachelor avec un budget de 5000€"

Comment puis-je vous aider aujourd'hui ?`,
  timestamp: new Date(),
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus sur l'input quand le chat s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    
    // Validation
    if (!trimmedInput) return;
    if (trimmedInput.length > 500) {
      alert('La question ne peut pas dépasser 500 caractères.');
      return;
    }

    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: trimmedInput,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Appeler l'API
      const response = await chatbotService.ask(trimmedInput);

      // Ajouter la réponse du bot
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        text: response.message,
        results: response.inDomain && response.results.length > 0 ? response.results : undefined,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Message d'erreur
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'bot',
        text: '❌ Désolé, une erreur s\'est produite. Veuillez réessayer.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Bouton flottant moderne */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 bg-gradient-to-tr from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white rounded-2xl shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-blue-600/50 z-50 group overflow-hidden"
          style={{ width: '64px', height: '64px' }}
          aria-label="Ouvrir le chat"
        >
          {/* Effet de brillance animé */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative flex items-center justify-center h-full">
            <svg
              className="w-7 h-7 transition-transform group-hover:scale-110 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          
          {/* Badge de notification */}
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-cyan-500 items-center justify-center text-xs font-bold text-white">1</span>
          </span>
        </button>
      )}

      {/* Fenêtre de chat moderne */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-[420px] h-[680px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col z-50 border border-gray-200/50 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header avec gradient et glassmorphism */}
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-6 overflow-hidden">
            {/* Effet de fond animé */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Assistant Orientus</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></span>
                    <p className="text-xs text-white/90 font-medium">En ligne</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 backdrop-blur rounded-xl p-2 transition-all duration-200 hover:rotate-90"
                aria-label="Fermer le chat"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area avec meilleur style */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div key={message.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Message bubble */}
                <div
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  } mb-2`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-md ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-line">{message.text}</p>
                  </div>
                </div>

                {/* Program cards avec design moderne */}
                {message.results && message.results.length > 0 && (
                  <div className="mt-4 space-y-3 pl-2">
                    {message.results.map((program, index) => (
                      <div
                        key={program.id}
                        className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 group"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* En-tête de la carte */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">🎓</span>
                              <h4 className="font-bold text-gray-900 text-base leading-tight">
                                {program.university}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="font-medium">{program.city}, {program.country}</span>
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 px-3 py-1.5 rounded-full">
                            <span className="text-xs font-bold text-blue-700">{program.level}</span>
                          </div>
                        </div>

                        {/* Programme */}
                        <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl">
                          <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <span className="text-lg">📚</span>
                            {program.program}
                          </p>
                        </div>

                        {/* Grille d'informations */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center">
                              <span className="text-base">💰</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Frais</p>
                              <p className="font-semibold text-gray-900 text-xs">{program.tuition}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center">
                              <span className="text-base">📅</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Rentrée</p>
                              <p className="font-semibold text-gray-900 text-xs">{program.intake}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex items-center justify-center">
                              <span className="text-base">⏱️</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Durée</p>
                              <p className="font-semibold text-gray-900 text-xs">{program.duration}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg flex items-center justify-center">
                              <span className="text-base">🌐</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Langue</p>
                              <p className="font-semibold text-gray-900 text-xs">{program.language}</p>
                            </div>
                          </div>
                        </div>

                        {/* Bouton CTA moderne */}
                        <a
                          href={program.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white text-sm font-semibold py-3 px-4 rounded-xl transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.02]"
                        >
                          <span>Voir les détails</span>
                          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loader élégant */}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-5 py-4 shadow-md">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-cyan-500 to-blue-700 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area moderne */}
          <div className="border-t border-gray-200 p-5 bg-white">
            <div className="flex gap-3 mb-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question..."
                  maxLength={500}
                  disabled={isLoading}
                  className="w-full pl-5 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all text-sm placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-2xl px-5 py-3.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                aria-label="Envoyer"
              >
                <svg
                  className="w-5 h-5 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {inputValue.length}/500 caractères
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs">Entrée</kbd>
                <span>pour envoyer</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes slide-in-from-bottom-5 {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-in {
          animation: slide-in-from-bottom-5 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ChatWidget;
