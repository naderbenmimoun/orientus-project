// Service API du chatbot Orientus
// Gère tous les appels vers le backend chatbot

import type { ChatbotResponse, WelcomeResponse, ChatMessage } from '../types/chatbot';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8084') + '/api/chatbot';

// Message de bienvenue par défaut si le backend ne répond pas
const DEFAULT_WELCOME: WelcomeResponse = {
  message: '👋 Bonjour ! Je suis l\'assistant Orientus. Posez-moi vos questions sur les programmes d\'études à l\'étranger.',
  suggestions: [
    'Je veux étudier en France',
    'Programmes Master en IT',
    'Budget < 5000€/an',
    'Quels pays sont disponibles ?',
  ],
};

/**
 * GET /api/chatbot/welcome — Message de bienvenue + suggestions
 */
export async function fetchWelcome(): Promise<WelcomeResponse> {
  try {
    const response = await fetch(`${API_URL}/welcome`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data: WelcomeResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur fetchWelcome:', error);
    return DEFAULT_WELCOME;
  }
}

/**
 * POST /api/chatbot/ask — Envoyer un message au chatbot
 * Supporte l'ancien format (question) ET le nouveau (message + history)
 */
export async function sendMessage(
  message: string,
  history?: ChatMessage[]
): Promise<ChatbotResponse> {
  // Construire le history au format { role, content } (max 10 derniers)
  const formattedHistory = history
    ? history.slice(-10).map((m) => ({ role: m.role, content: m.content }))
    : [];

  const response = await fetch(`${API_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, question: message, history: formattedHistory }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  // Gestion rétrocompatible : l'ancien format peut renvoyer "message" au lieu de "response"
  const chatbotResponse: ChatbotResponse = {
    messageId: data.messageId ?? undefined,
    response: data.response ?? data.message ?? '',
    results: data.results ?? [],
    stats: data.stats ?? null,
    needsClarification: data.needsClarification ?? false,
    inDomain: data.inDomain ?? true,
  };

  return chatbotResponse;
}

/**
 * POST /api/chatbot/feedback — Envoyer un feedback sur un message
 */
export async function sendFeedback(
  messageId: string,
  rating: number,
  comment?: string
): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, rating, comment }),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('Erreur sendFeedback:', error);
  }
}

/**
 * GET /api/chatbot/health — Vérifier l'état du chatbot
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
