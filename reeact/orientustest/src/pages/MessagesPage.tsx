import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { messageService } from '../services/messageService';
import { useWebSocket } from '../hooks/useWebSocket';
import type { ConversationDTO, MessageDTO } from '../models/Message';

// ─── Helpers ──────────────────────────────────────────────

function relativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'hier';
  if (diffD < 7) return `il y a ${diffD}j`;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

function dateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffD = Math.floor((today.getTime() - msgDay.getTime()) / 86400000);
  if (diffD === 0) return "Aujourd'hui";
  if (diffD === 1) return 'Hier';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function timeStr(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'En attente', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  ACTIVE: { label: 'Actif', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  REJECTED: { label: 'Refusé', color: 'text-red-400', bg: 'bg-red-500/20' },
  CLOSED: { label: 'Fermé', color: 'text-slate-400', bg: 'bg-slate-500/20' },
};

// ─── New Conversation Modal ───────────────────────────────

function NewConversationModal({
  onClose,
  onCreated,
  userId,
}: {
  onClose: () => void;
  onCreated: (c: ConversationDTO) => void;
  userId: number;
}) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setLoading(true);
    setError('');
    try {
      const conv = await messageService.createConversation(userId, {
        subject: subject.trim(),
        firstMessage: message.trim(),
      });
      onCreated(conv);
    } catch {
      setError('Erreur lors de la création. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">Nouvelle conversation</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <span className="text-violet-400 text-sm mt-0.5">ℹ️</span>
            <p className="text-sm text-violet-300">
              Vous pouvez envoyer 2 messages avant qu'un conseiller accepte votre demande.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Sujet</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={255}
              placeholder="Ex: Question sur les admissions..."
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-slate-500 mt-1">{subject.length}/255</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Décrivez votre demande..."
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              required
            />
            <p className="text-xs text-slate-500 mt-1">{message.length}/2000</p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !subject.trim() || !message.trim()}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Envoi...
                </span>
              ) : (
                'Envoyer'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────

const MessagesPage = () => {
  const { user } = useAuth();
  const userId = user?.id as number;

  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { subscribe, unsubscribe } = useWebSocket(userId);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  // ── Load conversations ──
  const loadConversations = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await messageService.getStudentConversations(userId);
      setConversations(data.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()));
    } catch {
      /* silent */
    } finally {
      setLoadingConvs(false);
    }
  }, [userId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Load messages when conversation selected ──
  useEffect(() => {
    if (!selectedId || !userId) return;
    let cancelled = false;
    setLoadingMsgs(true);
    messageService
      .getMessages(selectedId, userId)
      .then((data) => {
        if (!cancelled) setMessages(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingMsgs(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId, userId]);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── WebSocket: new messages on selected conversation ──
  useEffect(() => {
    if (!selectedId) return;
    const dest = `/topic/conversation/${selectedId}`;
    subscribe(dest, (body) => {
      const msg = body as MessageDTO;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // Update conversation list
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, lastMessageAt: msg.createdAt } : c))
          .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
      );
    });
    return () => unsubscribe(dest);
  }, [selectedId, subscribe, unsubscribe]);

  // ── WebSocket: conversation status updates ──
  useEffect(() => {
    if (!userId) return;
    const dest = `/topic/student/${userId}/conversation-update`;
    subscribe(dest, (body) => {
      const updated = body as ConversationDTO;
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === updated.id);
        if (exists) {
          return prev
            .map((c) => (c.id === updated.id ? updated : c))
            .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        }
        return [updated, ...prev];
      });
    });
    return () => unsubscribe(dest);
  }, [userId, subscribe, unsubscribe]);

  // ── Send message ──
  const handleSend = async () => {
    if (!newMsg.trim() || !selectedId || !userId || sendingMsg) return;
    setSendingMsg(true);
    try {
      const sent = await messageService.sendMessage(selectedId, userId, { content: newMsg.trim() });
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
      setNewMsg('');
      // update initialMessageCount
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId ? { ...c, initialMessageCount: c.initialMessageCount + 1, lastMessageAt: sent.createdAt } : c
        )
      );
    } catch {
      /* toast */
    } finally {
      setSendingMsg(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectConversation = (id: number) => {
    setSelectedId(id);
    setMobileView('chat');
  };

  const filtered = conversations.filter(
    (c) =>
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      (c.adminName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  // ── Can send? ──
  const canSend =
    selected &&
    (selected.status === 'ACTIVE' ||
      (selected.status === 'PENDING' && selected.initialMessageCount < 2));

  const inputDisabledReason = !selected
    ? ''
    : selected.status === 'REJECTED' || selected.status === 'CLOSED'
      ? 'Conversation fermée'
      : selected.status === 'PENDING' && selected.initialMessageCount >= 2
        ? "⏳ En attente d'un conseiller"
        : '';

  // ── Grouped messages by date ──
  const groupedMessages: { date: string; msgs: MessageDTO[] }[] = [];
  messages.forEach((m) => {
    const ds = dateSeparator(m.createdAt);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === ds) {
      last.msgs.push(m);
    } else {
      groupedMessages.push({ date: ds, msgs: [m] });
    }
  });

  // ── Render ──
  return (
    <div className="min-h-screen bg-slate-900 pt-28 md:pt-32 pb-8 px-4">
      <div className="container mx-auto max-w-6xl h-[calc(100vh-10rem)]">
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 h-full flex overflow-hidden shadow-2xl">
          {/* ──── LEFT: Conversation List ──── */}
          <div
            className={`w-full md:w-96 md:min-w-[22rem] border-r border-slate-700 flex flex-col ${
              mobileView === 'chat' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">Messages</h1>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nouveau
                </motion.button>
              </div>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="space-y-2 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse p-4 rounded-lg bg-slate-700/50">
                      <div className="h-4 bg-slate-600 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-slate-600 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
                  <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm">Aucune conversation</p>
                </div>
              ) : (
                filtered.map((conv) => {
                  const sc = statusConfig[conv.status];
                  return (
                    <motion.button
                      key={conv.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectConversation(conv.id)}
                      className={`w-full text-left p-4 border-b border-slate-700/50 transition-colors hover:bg-slate-700/30 ${
                        selectedId === conv.id ? 'bg-violet-600/10 border-l-2 border-l-violet-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                              {sc.label}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-white truncate">{conv.subject}</h3>
                          {conv.adminName && (
                            <p className="text-xs text-slate-400 mt-0.5">Conseiller : {conv.adminName}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-xs text-slate-500">{relativeDate(conv.lastMessageAt)}</span>
                          {conv.unreadCount > 0 && (
                            <span className="flex items-center justify-center w-5 h-5 bg-violet-500 text-white text-xs font-bold rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </div>

          {/* ──── RIGHT: Chat Area ──── */}
          <div
            className={`flex-1 flex flex-col ${
              mobileView === 'list' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {!selected ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                <svg className="w-24 h-24 mb-6 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-300 mb-1">Sélectionnez une conversation</h3>
                <p className="text-sm">Ou créez-en une nouvelle pour contacter un conseiller</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700 bg-slate-800/80">
                  {/* Back button (mobile) */}
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-1 text-slate-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-bold text-white truncate">{selected.subject}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig[selected.status].bg} ${statusConfig[selected.status].color}`}>
                        {statusConfig[selected.status].label}
                      </span>
                      {selected.adminName && (
                        <span className="text-xs text-slate-400">• {selected.adminName}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center h-full">
                      <svg className="animate-spin h-8 w-8 text-violet-400" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  ) : (
                    groupedMessages.map((group) => (
                      <div key={group.date}>
                        {/* Date separator */}
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 h-px bg-slate-700" />
                          <span className="text-xs text-slate-500 font-medium">{group.date}</span>
                          <div className="flex-1 h-px bg-slate-700" />
                        </div>
                        {group.msgs.map((msg) => {
                          if (msg.messageType === 'SYSTEM') {
                            return (
                              <div key={msg.id} className="flex justify-center my-2">
                                <span className="text-xs text-slate-500 italic bg-slate-800/50 px-3 py-1 rounded-full">
                                  {msg.content}
                                </span>
                              </div>
                            );
                          }
                          const isMine = msg.senderId === userId;
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                                  isMine
                                    ? 'bg-violet-600 text-white rounded-br-md'
                                    : 'bg-slate-700 text-slate-100 rounded-bl-md'
                                }`}
                              >
                                {!isMine && (
                                  <p className="text-xs font-semibold text-violet-400 mb-0.5">{msg.senderName}</p>
                                )}
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                <p className={`text-xs mt-1 ${isMine ? 'text-violet-200' : 'text-slate-500'} text-right`}>
                                  {timeStr(msg.createdAt)}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="border-t border-slate-700 p-3 bg-slate-800/80">
                  {inputDisabledReason ? (
                    <div className="flex items-center justify-center py-3 px-4 bg-slate-700/50 rounded-lg">
                      <p className="text-sm text-slate-400">{inputDisabledReason}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selected.status === 'PENDING' && selected.initialMessageCount < 2 && (
                        <p className="text-xs text-amber-400 px-1">
                          Message {selected.initialMessageCount + 1}/2 avant acceptation
                        </p>
                      )}
                      <div className="flex items-end gap-2">
                        <textarea
                          value={newMsg}
                          onChange={(e) => setNewMsg(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Écrivez votre message..."
                          rows={1}
                          className="flex-1 px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none max-h-32"
                          disabled={!canSend}
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSend}
                          disabled={!newMsg.trim() || !canSend || sendingMsg}
                          className="p-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
                        >
                          {sendingMsg ? (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* New conversation modal */}
      <AnimatePresence>
        {showModal && (
          <NewConversationModal
            onClose={() => setShowModal(false)}
            onCreated={(conv) => {
              setConversations((prev) => [conv, ...prev]);
              setSelectedId(conv.id);
              setShowModal(false);
              setMobileView('chat');
            }}
            userId={userId}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessagesPage;
