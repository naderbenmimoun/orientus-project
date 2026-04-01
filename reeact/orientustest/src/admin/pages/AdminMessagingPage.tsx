import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { messageService } from '../../services/messageService';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { ConversationDTO, MessageDTO } from '../../models/Message';

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

type Tab = 'pending' | 'mine' | 'all';

const AdminMessagingPage = () => {
  const { admin, isOwner } = useAdminAuth();
  const adminId = admin?.id as number;

  const [tab, setTab] = useState<Tab>('pending');
  const [pending, setPending] = useState<ConversationDTO[]>([]);
  const [mine, setMine] = useState<ConversationDTO[]>([]);
  const [all, setAll] = useState<ConversationDTO[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { subscribe, unsubscribe } = useWebSocket(adminId);

  const currentList = tab === 'pending' ? pending : tab === 'mine' ? mine : all;
  const selected = currentList.find((c) => c.id === selectedId) ?? null;

  // ── Load conversations ──
  const loadAll = useCallback(async () => {
    if (!adminId) return;
    try {
      const [p, m] = await Promise.all([
        messageService.getPendingConversations(),
        messageService.getAdminConversations(adminId),
      ]);
      setPending(p.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setMine(m.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()));
      if (isOwner) {
        const a = await messageService.getAllConversations();
        setAll(a.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()));
      }
    } catch {
      /* silent */
    } finally {
      setLoadingConvs(false);
    }
  }, [adminId, isOwner]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Load messages ──
  useEffect(() => {
    if (!selectedId || !adminId) return;
    let cancelled = false;
    setLoadingMsgs(true);
    messageService
      .getMessages(selectedId, adminId)
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
  }, [selectedId, adminId]);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── WebSocket: messages on selected conversation ──
  useEffect(() => {
    if (!selectedId) return;
    const dest = `/topic/conversation/${selectedId}`;
    subscribe(dest, (body) => {
      const msg = body as MessageDTO;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    return () => unsubscribe(dest);
  }, [selectedId, subscribe, unsubscribe]);

  // ── WebSocket: new conversations ──
  useEffect(() => {
    const dest = '/topic/admin/new-conversation';
    subscribe(dest, (body) => {
      const conv = body as ConversationDTO;
      setPending((prev) => {
        if (prev.some((c) => c.id === conv.id)) return prev;
        return [conv, ...prev];
      });
      if (isOwner) {
        setAll((prev) => {
          if (prev.some((c) => c.id === conv.id)) return prev;
          return [conv, ...prev];
        });
      }
    });
    return () => unsubscribe(dest);
  }, [subscribe, unsubscribe, isOwner]);

  // ── Actions ──
  const handleAccept = async () => {
    if (!selected || !adminId) return;
    setActionLoading(true);
    try {
      const updated = await messageService.acceptConversation(selected.id, adminId);
      setPending((prev) => prev.filter((c) => c.id !== selected.id));
      setMine((prev) => [updated, ...prev]);
      if (isOwner) setAll((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setTab('mine');
      setSelectedId(updated.id);
    } catch { /* silent */ } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected || !adminId) return;
    setActionLoading(true);
    try {
      const updated = await messageService.rejectConversation(selected.id, adminId);
      setPending((prev) => prev.filter((c) => c.id !== selected.id));
      if (isOwner) setAll((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setSelectedId(null);
    } catch { /* silent */ } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!selected || !adminId) return;
    setActionLoading(true);
    try {
      const updated = await messageService.closeConversation(selected.id, adminId);
      setMine((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      if (isOwner) setAll((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch { /* silent */ } finally {
      setActionLoading(false);
    }
  };

  // ── Send ──
  const handleSend = async () => {
    if (!newMsg.trim() || !selectedId || !adminId || sendingMsg) return;
    setSendingMsg(true);
    try {
      const sent = await messageService.sendMessage(selectedId, adminId, { content: newMsg.trim() });
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
      setNewMsg('');
    } catch { /* silent */ } finally {
      setSendingMsg(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = selected && selected.status === 'ACTIVE' && selected.adminId === adminId;

  // ── Grouped messages ──
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

  const tabs: { key: Tab; label: string; count: number; ownerOnly?: boolean }[] = [
    { key: 'pending', label: "File d'attente", count: pending.length },
    { key: 'mine', label: 'Mes conversations', count: mine.length },
    { key: 'all', label: 'Toutes', count: all.length, ownerOnly: true },
  ];

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex-1 bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 flex overflow-hidden shadow-2xl">
        {/* ──── LEFT: Sidebar ──── */}
        <div
          className={`w-full md:w-96 md:min-w-[22rem] border-r border-slate-700 flex flex-col ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Tabs */}
          <div className="flex border-b border-slate-700">
            {tabs.map((t) => {
              if (t.ownerOnly && !isOwner) return null;
              return (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setSelectedId(null); }}
                  className={`flex-1 py-3 px-2 text-sm font-medium transition-colors relative ${
                    tab === t.key
                      ? 'text-violet-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                  {t.count > 0 && (
                    <span className={`ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-bold rounded-full ${
                      tab === t.key ? 'bg-violet-500 text-white' : 'bg-slate-600 text-slate-300'
                    }`}>
                      {t.count}
                    </span>
                  )}
                  {tab === t.key && (
                    <motion.div
                      layoutId="admin-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500"
                    />
                  )}
                </button>
              );
            })}
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
            ) : currentList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
                <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-sm">Aucune conversation</p>
              </div>
            ) : (
              currentList.map((conv) => {
                const sc = statusConfig[conv.status];
                return (
                  <motion.button
                    key={conv.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedId(conv.id); setMobileView('chat'); }}
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
                        <p className="text-xs text-slate-400 mt-0.5">
                          {conv.studentName}
                          {conv.adminName && ` • ${conv.adminName}`}
                        </p>
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

        {/* ──── RIGHT: Chat ──── */}
        <div
          className={`flex-1 flex flex-col ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <svg className="w-24 h-24 mb-6 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-300 mb-1">Sélectionnez une conversation</h3>
              <p className="text-sm">Choisissez une conversation pour voir les messages</p>
            </div>
          ) : (
            <>
              {/* Header with actions */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700 bg-slate-800/80">
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
                    <span className="text-xs text-slate-400">• {selected.studentName}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  {selected.status === 'PENDING' && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAccept}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Accepter
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleReject}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Rejeter
                      </motion.button>
                    </>
                  )}
                  {selected.status === 'ACTIVE' && selected.adminId === adminId && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClose}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Fermer
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Messages */}
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
                        const isMine = msg.senderId === adminId;
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

              {/* Input */}
              <div className="border-t border-slate-700 p-3 bg-slate-800/80">
                {canSend ? (
                  <div className="flex items-end gap-2">
                    <textarea
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Écrivez votre réponse..."
                      rows={1}
                      className="flex-1 px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none max-h-32"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={!newMsg.trim() || sendingMsg}
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
                ) : (
                  <div className="flex items-center justify-center py-3 px-4 bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-400">
                      {selected.status === 'PENDING'
                        ? 'Acceptez la conversation pour répondre'
                        : selected.status === 'CLOSED' || selected.status === 'REJECTED'
                          ? 'Conversation fermée'
                          : 'Lecture seule'}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessagingPage;
