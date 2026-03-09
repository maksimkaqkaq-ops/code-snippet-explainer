import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, MessagesSquare, Zap, Plus, ArrowRight, Star, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const C = { blue: '#287999', green: '#ACB9A5', bud: '#EDEFDF', sun: '#F0C968', bg: '#323B44' };

const card = (opts = {}) => ({
    background: 'rgba(40,50,58,0.65)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(172,185,165,0.13)',
    borderRadius: 20,
    ...opts,
});

function StatCard({ icon: Icon, label, value, accent, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            style={{ ...card(), padding: '24px', position: 'relative', overflow: 'hidden' }}
        >
            <div style={{
                position: 'absolute', top: -20, right: -20,
                width: 100, height: 100, borderRadius: '50%',
                background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
            }} />
            <div style={{
                width: 42, height: 42, borderRadius: 12, marginBottom: 16,
                background: `${accent}18`, border: `1px solid ${accent}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={19} color={accent} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.bud, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 12, color: C.green, marginTop: 6, fontWeight: 500 }}>{label}</div>
        </motion.div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [snippets, setSnippets] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('snippets/').catch(() => ({ data: [] })),
            api.get('chat/sessions/').catch(() => ({ data: [] })),
        ]).then(([s, c]) => {
            setSnippets(Array.isArray(s.data) ? s.data : s.data.results ?? []);
            setSessions(Array.isArray(c.data) ? c.data : c.data.results ?? []);
        }).finally(() => setLoading(false));
    }, []);

    const recentSnippets = snippets.slice(0, 4);
    const recentSessions = sessions.slice(0, 3);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <Loader2 size={28} color={C.blue} className="spin" />
        </div>
    );

    return (
        <div style={{ padding: '32px 36px', maxWidth: 1100, margin: '0 auto' }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 6, height: 22, borderRadius: 3, background: `linear-gradient(${C.blue}, ${C.green})` }} />
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: C.bud, letterSpacing: '-0.5px' }}>
                        {greeting}, {user?.username ?? 'Developer'}
                    </h1>
                </div>
                <p style={{ color: C.green, fontSize: 14, marginLeft: 16 }}>Here's what's happening in your workspace</p>
            </motion.div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <StatCard icon={Code2} label="Total Snippets" value={snippets.length} accent={C.blue} delay={0} />
                <StatCard icon={MessagesSquare} label="Chat Sessions" value={sessions.length} accent={C.green} delay={0.07} />
                <StatCard icon={Star} label="Favorites" value="—" accent={C.sun} delay={0.14} />
            </div>

            {/* Bento grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                {/* Recent Snippets */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    style={{ ...card(), padding: 24, gridColumn: 'span 1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Code2 size={15} color={C.blue} />
                            <span style={{ fontWeight: 700, fontSize: 13, color: C.bud }}>Recent Snippets</span>
                        </div>
                        <Link to="/app/snippets/new" style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '6px 12px', borderRadius: 8,
                            background: 'rgba(40,121,153,0.15)', border: '1px solid rgba(40,121,153,0.25)',
                            color: C.blue, fontSize: 11, fontWeight: 600,
                        }}>
                            <Plus size={11} /> New
                        </Link>
                    </div>
                    {recentSnippets.length === 0 ? (
                        <div style={{ textAlign: 'center', paddingBlock: 32, color: C.green, fontSize: 13, opacity: 0.6 }}>
                            No snippets yet
                        </div>
                    ) : recentSnippets.map((s, i) => (
                        <Link key={s.id} to={`/app/snippets/${s.id}`} style={{ textDecoration: 'none' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '11px 13px', borderRadius: 12, marginBottom: 8,
                                background: 'rgba(172,185,165,0.05)', border: '1px solid rgba(172,185,165,0.08)',
                                transition: 'all 0.15s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(40,121,153,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(172,185,165,0.05)'}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: C.bud, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                                    <div style={{ fontSize: 11, color: C.green, marginTop: 2 }}>{s.language}</div>
                                </div>
                                <ArrowRight size={13} color="rgba(172,185,165,0.4)" />
                            </div>
                        </Link>
                    ))}
                    <Link to="/snippets" style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.blue, fontSize: 12, marginTop: 8, fontWeight: 600 }}>
                        View all <ArrowRight size={12} />
                    </Link>
                </motion.div>

                {/* AI Chat Sessions */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }}
                    style={{ ...card(), padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MessagesSquare size={15} color={C.green} />
                            <span style={{ fontWeight: 700, fontSize: 13, color: C.bud }}>AI Chat Sessions</span>
                        </div>
                        <Link to="/chat" style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '6px 12px', borderRadius: 8,
                            background: 'rgba(172,185,165,0.1)', border: '1px solid rgba(172,185,165,0.2)',
                            color: C.green, fontSize: 11, fontWeight: 600,
                        }}>
                            <Plus size={11} /> New
                        </Link>
                    </div>
                    {recentSessions.length === 0 ? (
                        <div style={{ textAlign: 'center', paddingBlock: 32, color: C.green, fontSize: 13, opacity: 0.6 }}>
                            No sessions yet
                        </div>
                    ) : recentSessions.map(s => (
                        <Link key={s.id} to="/chat" style={{ textDecoration: 'none' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '11px 13px', borderRadius: 12, marginBottom: 8,
                                background: 'rgba(172,185,165,0.05)', border: '1px solid rgba(172,185,165,0.08)',
                                transition: 'all 0.15s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(172,185,165,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(172,185,165,0.05)'}
                            >
                                <MessagesSquare size={13} color="rgba(172,185,165,0.5)" />
                                <span style={{ fontSize: 13, color: C.bud, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                            </div>
                        </Link>
                    ))}
                    <Link to="/chat" style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.green, fontSize: 12, marginTop: 8, fontWeight: 600 }}>
                        Open chat <ArrowRight size={12} />
                    </Link>
                </motion.div>

                {/* CTA */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
                    style={{
                        ...card(),
                        gridColumn: 'span 2', padding: '28px 32px',
                        background: 'linear-gradient(135deg, rgba(40,121,153,0.18) 0%, rgba(172,185,165,0.08) 100%)',
                        border: '1px solid rgba(40,121,153,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
                    }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Zap size={18} color={C.sun} />
                            <span style={{ fontSize: 16, fontWeight: 800, color: C.bud }}>Explain your code with AI</span>
                        </div>
                        <p style={{ fontSize: 13, color: C.green, maxWidth: 500 }}>
                            Upload a snippet and instantly get a detailed, beginner-friendly or advanced breakdown powered by LLM.
                        </p>
                    </div>
                    <Link to="/snippets/new" style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '12px 22px', borderRadius: 12, whiteSpace: 'nowrap',
                        background: `linear-gradient(135deg, ${C.blue}, rgba(40,121,153,0.75))`,
                        color: C.bud, fontWeight: 700, fontSize: 13,
                        boxShadow: '0 0 24px rgba(40,121,153,0.4)',
                    }}>
                        <Plus size={15} /> New Snippet
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
