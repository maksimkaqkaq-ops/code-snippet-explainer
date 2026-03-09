import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Plus, Send, MessagesSquare, Trash2, Code2, Loader2, Zap, X } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/NotificationContext';

const C = { blue: '#287999', green: '#ACB9A5', bud: '#EDEFDF', sun: '#F0C968', bg: '#323B44' };

/* ─── New Session Modal ───────────────────── */
function NewSessionModal({ onClose, onCreate, snippets }) {
    const [title, setTitle] = useState('New Chat');
    const [snippetId, setSnippetId] = useState('');
    const [loading, setLoading] = useState(false);
    const inputStyle = {
        width: '100%', padding: '11px 14px', borderRadius: 10,
        background: 'rgba(237,239,223,0.05)', border: '1px solid rgba(172,185,165,0.2)',
        color: C.bud, fontSize: 13,
    };
    return (
        <div
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(50,59,68,0.7)', backdropFilter: 'blur(8px)' }}
        >
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: 420, padding: 28, borderRadius: 22,
                    background: 'rgba(40,50,58,0.98)', border: '1px solid rgba(172,185,165,0.2)',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: C.bud }}>New Chat Session</h2>
                    <button onClick={onClose} style={{ opacity: 0.5, cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                    ><X size={16} color={C.green} /></button>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', color: C.green, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Title</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = C.blue}
                        onBlur={e => e.target.style.borderColor = 'rgba(172,185,165,0.2)'}
                    />
                </div>
                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', color: C.green, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Link Snippet (optional)</label>
                    <select value={snippetId} onChange={e => setSnippetId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="" style={{ background: C.bg }}>None</option>
                        {snippets.map(s => <option key={s.id} value={s.id} style={{ background: C.bg, color: C.bud }}>{s.title}</option>)}
                    </select>
                </div>
                <button
                    disabled={loading}
                    onClick={async () => { setLoading(true); await onCreate({ title, snippet: snippetId || null }); setLoading(false); onClose(); }}
                    style={{
                        width: '100%', padding: 13, borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                        background: `linear-gradient(135deg, ${C.blue}, rgba(40,121,153,0.75))`,
                        color: C.bud, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: '0 0 24px rgba(40,121,153,0.4)',
                    }}
                >
                    {loading ? <Loader2 size={15} className="spin" /> : <><Plus size={14} /> Create Session</>}
                </button>
            </motion.div>
        </div>
    );
}

/* ─── Message Bubble ─────────────────────── */
function Bubble({ msg }) {
    const isUser = msg.role === 'user';
    return (
        <motion.div initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.22 }}
            style={{ display: 'flex', gap: 10, flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start' }}
        >
            {/* Avatar */}
            <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                ...(isUser
                    ? { background: `linear-gradient(135deg, ${C.blue}, rgba(40,121,153,0.7))`, color: C.bud }
                    : { background: 'rgba(172,185,165,0.15)', border: '1px solid rgba(172,185,165,0.2)', color: C.green }),
            }}>
                {isUser ? 'U' : <Zap size={13} />}
            </div>
            {/* Bubble */}
            <div style={{
                maxWidth: '76%', padding: '11px 16px', borderRadius: 18, fontSize: 13, lineHeight: 1.65,
                ...(isUser
                    ? { background: 'linear-gradient(135deg, rgba(40,121,153,0.32), rgba(40,121,153,0.18))', border: '1px solid rgba(40,121,153,0.38)', color: C.bud, borderTopRightRadius: 5 }
                    : { background: 'rgba(172,185,165,0.09)', border: '1px solid rgba(172,185,165,0.14)', color: C.bud, borderTopLeftRadius: 5 }),
            }}>
                {isUser
                    ? <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{msg.content}</p>
                    : <div className="prose-snippet"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                }
                <p style={{ fontSize: 10, marginTop: 6, opacity: 0.45, color: isUser ? C.bud : C.green }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </motion.div>
    );
}

/* ─── Main Chat Page ─────────────────────── */
export default function ChatPage() {
    const [searchParams] = useSearchParams();
    const toast = useToast();
    const [sessions, setSessions] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loadingSess, setLoadingSess] = useState(true);
    const [loadingMsg, setLoadingMsg] = useState(false);
    const [sending, setSending] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [snippets, setSnippets] = useState([]);
    const bottomRef = useRef(null);

    useEffect(() => {
        Promise.all([
            api.get('chat/sessions/'),
            api.get('snippets/').catch(() => ({ data: [] })),
        ]).then(([c, s]) => {
            const sess = Array.isArray(c.data) ? c.data : c.data.results ?? [];
            setSessions(sess);
            setSnippets(Array.isArray(s.data) ? s.data : s.data.results ?? []);
            if (searchParams.get('snippet')) setShowModal(true);
            else if (sess.length > 0) setActiveId(sess[0].id);
        }).finally(() => setLoadingSess(false));
    }, []);

    useEffect(() => {
        if (!activeId) { setMessages([]); return; }
        setLoadingMsg(true);
        api.get(`chat/sessions/${activeId}/messages/`)
            .then(r => setMessages(Array.isArray(r.data) ? r.data : r.data.results ?? []))
            .catch(() => toast.error('Could not load messages'))
            .finally(() => setLoadingMsg(false));
    }, [activeId]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const createSession = async (payload) => {
        try {
            const { data } = await api.post('chat/sessions/', payload);
            setSessions(p => [data, ...p]); setActiveId(data.id);
        } catch { toast.error('Could not create session'); }
    };

    const deleteSession = async (id) => {
        try {
            await api.delete(`chat/sessions/${id}/`);
            setSessions(p => p.filter(s => s.id !== id));
            if (activeId === id) setActiveId(sessions.filter(s => s.id !== id)[0]?.id ?? null);
            toast.success('Session deleted');
        } catch { toast.error('Could not delete'); }
    };

    const sendMessage = async () => {
        if (!input.trim() || !activeId || sending) return;
        const content = input.trim(); setInput('');
        const opt = { id: Date.now(), role: 'user', content, created_at: new Date().toISOString() };
        setMessages(p => [...p, opt]); setSending(true);
        try {
            const { data } = await api.post(`chat/sessions/${activeId}/send/`, { content });
            setMessages(p => [...p.filter(m => m.id !== opt.id),
            data.user_message ?? { ...opt, id: Date.now() - 1 },
            data.assistant_message ?? data,
            ]);
        } catch {
            setMessages(p => p.filter(m => m.id !== opt.id)); toast.error('Message failed');
        } finally { setSending(false); }
    };

    const activeSession = sessions.find(s => s.id === activeId);

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            {/* Session Sidebar */}
            <div style={{
                width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden',
                background: 'rgba(35,44,52,0.8)', borderRight: '1px solid rgba(172,185,165,0.08)',
            }}>
                {/* Header */}
                <div style={{ padding: '18px 14px 14px', borderBottom: '1px solid rgba(172,185,165,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MessagesSquare size={14} color={C.blue} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.bud }}>Sessions</span>
                    </div>
                    <button onClick={() => setShowModal(true)} style={{
                        width: 28, height: 28, borderRadius: 8, cursor: 'pointer',
                        background: 'rgba(40,121,153,0.18)', border: '1px solid rgba(40,121,153,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Plus size={14} color={C.blue} />
                    </button>
                </div>
                {/* Sessions list */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
                    {loadingSess ? (
                        [1, 2, 3].map(i => <div key={i} style={{ height: 48, borderRadius: 10, marginBottom: 6, background: 'rgba(172,185,165,0.07)', animation: 'pulse 1.5s infinite' }} />)
                    ) : sessions.length === 0 ? (
                        <div style={{ textAlign: 'center', paddingBlock: 40, color: 'rgba(172,185,165,0.4)', fontSize: 12 }}>No sessions yet</div>
                    ) : sessions.map(s => (
                        <div key={s.id} onClick={() => setActiveId(s.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 10, cursor: 'pointer', marginBottom: 4,
                                background: activeId === s.id ? 'rgba(40,121,153,0.18)' : 'transparent',
                                border: activeId === s.id ? '1px solid rgba(40,121,153,0.3)' : '1px solid transparent',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { if (activeId !== s.id) e.currentTarget.style.background = 'rgba(172,185,165,0.06)'; }}
                            onMouseLeave={e => { if (activeId !== s.id) e.currentTarget.style.background = 'transparent'; }}
                        >
                            <MessagesSquare size={12} color={activeId === s.id ? C.blue : 'rgba(172,185,165,0.4)'} style={{ flexShrink: 0 }} />
                            <span style={{ flex: 1, fontSize: 12, color: activeId === s.id ? C.bud : C.green, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                            {activeId === s.id && (
                                <button onClick={e => { e.stopPropagation(); deleteSession(s.id); }}
                                    style={{ opacity: 0, transition: 'opacity 0.15s', cursor: 'pointer' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                >
                                    <Trash2 size={11} color={C.sun} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {!activeId ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
                        <div style={{ width: 60, height: 60, borderRadius: 20, background: 'rgba(40,121,153,0.15)', border: '1px solid rgba(40,121,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessagesSquare size={26} color={C.blue} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 16, fontWeight: 800, color: C.bud }}>Start a conversation</p>
                            <p style={{ fontSize: 13, color: C.green, marginTop: 4 }}>Select a session or create one to begin</p>
                        </div>
                        <button onClick={() => setShowModal(true)} style={{
                            display: 'flex', alignItems: 'center', gap: 7, padding: '11px 22px', borderRadius: 12, cursor: 'pointer',
                            background: `linear-gradient(135deg, ${C.blue}, rgba(40,121,153,0.75))`,
                            color: C.bud, fontWeight: 700, fontSize: 13, boxShadow: '0 0 24px rgba(40,121,153,0.4)',
                        }}>
                            <Plus size={15} /> New Session
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Chat header */}
                        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(172,185,165,0.08)', background: 'rgba(40,50,58,0.35)', flexShrink: 0 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(40,121,153,0.18)', border: '1px solid rgba(40,121,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MessagesSquare size={14} color={C.blue} />
                            </div>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 700, color: C.bud }}>{activeSession?.title}</p>
                                {activeSession?.snippet && (
                                    <Link to={`/app/snippets/${activeSession.snippet}`} style={{ fontSize: 11, color: C.green, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Code2 size={10} /> Linked snippet
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {loadingMsg ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                    <Loader2 size={24} color={C.blue} className="spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                    <Zap size={32} color="rgba(40,121,153,0.25)" />
                                    <p style={{ fontSize: 13, color: 'rgba(172,185,165,0.45)' }}>Ask anything about code...</p>
                                </div>
                            ) : (
                                messages.map(msg => <Bubble key={msg.id} msg={msg} />)
                            )}
                            {/* Typing indicator */}
                            {sending && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(172,185,165,0.15)', border: '1px solid rgba(172,185,165,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Zap size={13} color={C.green} />
                                    </div>
                                    <div style={{ padding: '12px 16px', borderRadius: 18, borderTopLeftRadius: 5, background: 'rgba(172,185,165,0.09)', border: '1px solid rgba(172,185,165,0.14)', display: 'flex', gap: 4, alignItems: 'center' }}>
                                        {[0, 0.15, 0.3].map((delay, i) => (
                                            <motion.span key={i}
                                                animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.8, delay }}
                                                style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block' }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(172,185,165,0.08)', background: 'rgba(40,50,58,0.28)', flexShrink: 0 }}>
                            <div style={{
                                display: 'flex', gap: 12, alignItems: 'flex-end', padding: '6px 8px',
                                background: 'rgba(40,50,58,0.7)', borderRadius: 16,
                                border: '1px solid rgba(172,185,165,0.15)',
                            }}>
                                <textarea
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                    placeholder="Ask about code, syntax, patterns... (Enter to send)"
                                    rows={1}
                                    style={{
                                        flex: 1, padding: '8px 10px', background: 'transparent', border: 'none', outline: 'none',
                                        color: C.bud, fontSize: 13, resize: 'none', lineHeight: 1.6, maxHeight: 130,
                                    }}
                                    onInput={e => { e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 130)}px`; }}
                                />
                                <button onClick={sendMessage} disabled={!input.trim() || sending} style={{
                                    width: 38, height: 38, borderRadius: 11, cursor: !input.trim() || sending ? 'not-allowed' : 'pointer',
                                    background: !input.trim() || sending ? 'rgba(40,121,153,0.2)' : `linear-gradient(135deg, ${C.blue}, rgba(40,121,153,0.8))`,
                                    boxShadow: !input.trim() || sending ? 'none' : '0 0 14px rgba(40,121,153,0.4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    transition: 'all 0.2s',
                                }}>
                                    {sending ? <Loader2 size={15} color={C.bud} className="spin" /> : <Send size={15} color={C.bud} />}
                                </button>
                            </div>
                            <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(172,185,165,0.3)', marginTop: 6 }}>Shift+Enter for new line</p>
                        </div>
                    </>
                )}
            </div>

            <AnimatePresence>
                {showModal && <NewSessionModal onClose={() => setShowModal(false)} onCreate={createSession} snippets={snippets} />}
            </AnimatePresence>
        </div>
    );
}
