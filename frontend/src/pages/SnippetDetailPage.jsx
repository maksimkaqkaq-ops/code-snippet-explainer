import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Zap, Star, StarOff, Trash2, Copy, Check, Loader2, MessagesSquare } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/NotificationContext';

const C = { blue: '#287999', green: '#ACB9A5', bud: '#EDEFDF', sun: '#F0C968' };
const LEVELS = ['simple', 'intermediate', 'advanced'];
const LEVEL_META = {
    simple: { label: 'Simple', color: '#ACB9A5' },
    intermediate: { label: 'Intermediate', color: '#287999' },
    advanced: { label: 'Advanced', color: '#F0C968' },
};

export default function SnippetDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [snippet, setSnippet] = useState(null);
    const [explanations, setExplanations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [explaining, setExplaining] = useState(false);
    const [activeLevel, setActiveLevel] = useState('intermediate');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        Promise.all([
            api.get(`snippets/${id}/`),
            api.get(`snippets/${id}/explanations/`),
        ]).then(([s, e]) => {
            setSnippet(s.data);
            setExplanations(Array.isArray(e.data) ? e.data : e.data.results ?? []);
        }).catch(() => { toast.error('Snippet not found'); navigate('/snippets'); })
            .finally(() => setLoading(false));
    }, [id]);

    const handleExplain = async () => {
        setExplaining(true);
        try {
            const { data } = await api.post(`snippets/${id}/explain/`, { complexity_level: activeLevel });
            setExplanations(prev => [data, ...prev.filter(e => e.complexity_level !== activeLevel)]);
            toast.success(`${LEVEL_META[activeLevel].label} explanation generated!`);
        } catch { toast.error('AI explanation failed'); }
        finally { setExplaining(false); }
    };

    const toggleFavorite = async (exp) => {
        try {
            const { data } = await api.patch(`snippets/explanations/${exp.id}/`, { is_favorite: !exp.is_favorite });
            setExplanations(prev => prev.map(e => e.id === exp.id ? data : e));
        } catch { toast.error('Could not update'); }
    };

    const handleDelete = async () => {
        try { await api.delete(`snippets/${id}/`); toast.success('Deleted'); navigate('/snippets'); }
        catch { toast.error('Could not delete'); }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(snippet?.code ?? '');
        setCopied(true); setTimeout(() => setCopied(false), 2000);
    };

    const activeExp = explanations.find(e => e.complexity_level === activeLevel);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <Loader2 size={26} color={C.blue} className="spin" />
        </div>
    );

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
            <Link to="/snippets" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.green, fontSize: 13, marginBottom: 20 }}>
                <ArrowLeft size={14} /> Back
            </Link>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 6, height: 22, borderRadius: 3, background: `linear-gradient(${C.blue}, ${C.green})` }} />
                        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.bud, letterSpacing: '-0.4px' }}>{snippet?.title}</h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 16 }}>
                        <span style={{
                            padding: '2px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                            background: 'rgba(40,121,153,0.15)', border: '1px solid rgba(40,121,153,0.3)', color: C.blue,
                        }}>{snippet?.language}</span>
                        <span style={{ fontSize: 11, color: 'rgba(172,185,165,0.5)' }}>
                            {new Date(snippet?.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/chat?snippet=${id}`} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10,
                        background: 'rgba(172,185,165,0.08)', border: '1px solid rgba(172,185,165,0.18)',
                        color: C.green, fontSize: 12, fontWeight: 600,
                    }}><MessagesSquare size={13} /> Chat about it</Link>
                    <button onClick={handleDelete} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10,
                        background: 'rgba(240,201,104,0.08)', border: '1px solid rgba(240,201,104,0.2)',
                        color: C.sun, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}><Trash2 size={13} /> Delete</button>
                </div>
            </div>

            {/* Two-column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
                {/* Code panel */}
                <div style={{
                    background: 'rgba(40,50,58,0.7)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(172,185,165,0.12)', borderRadius: 18, overflow: 'hidden',
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', borderBottom: '1px solid rgba(172,185,165,0.08)',
                    }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {['#F0C968', '#287999', '#ACB9A5'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                        </div>
                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(172,185,165,0.4)' }}>{snippet?.language}</span>
                        <button onClick={copyCode} style={{
                            display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7, cursor: 'pointer',
                            background: copied ? 'rgba(172,185,165,0.15)' : 'rgba(172,185,165,0.07)',
                            border: '1px solid rgba(172,185,165,0.12)',
                            color: copied ? C.green : 'rgba(172,185,165,0.45)', fontSize: 11,
                        }}>
                            {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                        </button>
                    </div>
                    <pre style={{ padding: 20, fontSize: 12, color: C.bud, overflowX: 'auto', maxHeight: 480, margin: 0, lineHeight: 1.7 }}>
                        <code>{snippet?.code}</code>
                    </pre>
                </div>

                {/* AI Explanation panel */}
                <div style={{
                    background: 'rgba(40,50,58,0.6)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(172,185,165,0.12)', borderRadius: 18, overflow: 'hidden',
                }}>
                    {/* Level tabs */}
                    <div style={{ display: 'flex', gap: 8, padding: '12px 14px', borderBottom: '1px solid rgba(172,185,165,0.08)' }}>
                        {LEVELS.map(l => (
                            <button key={l} onClick={() => setActiveLevel(l)} style={{
                                flex: 1, padding: '7px', borderRadius: 9, cursor: 'pointer',
                                background: activeLevel === l ? `${LEVEL_META[l].color}18` : 'rgba(172,185,165,0.05)',
                                border: activeLevel === l ? `1px solid ${LEVEL_META[l].color}40` : '1px solid transparent',
                                color: activeLevel === l ? LEVEL_META[l].color : C.green,
                                fontSize: 11, fontWeight: 600, transition: 'all 0.18s',
                            }}>{LEVEL_META[l].label}</button>
                        ))}
                    </div>

                    <div style={{ padding: '18px 20px' }}>
                        {!activeExp ? (
                            <div style={{ textAlign: 'center', paddingBlock: 36 }}>
                                <div style={{
                                    width: 50, height: 50, borderRadius: 14, margin: '0 auto 14px',
                                    background: `${LEVEL_META[activeLevel].color}15`,
                                    border: `1px solid ${LEVEL_META[activeLevel].color}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Zap size={20} color={LEVEL_META[activeLevel].color} />
                                </div>
                                <p style={{ color: C.bud, fontWeight: 600, fontSize: 13 }}>No {LEVEL_META[activeLevel].label} explanation</p>
                                <p style={{ color: C.green, fontSize: 12, marginTop: 4, marginBottom: 18 }}>Click below to generate with AI</p>
                                <button onClick={handleExplain} disabled={explaining} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
                                    background: `${LEVEL_META[activeLevel].color}20`,
                                    border: `1px solid ${LEVEL_META[activeLevel].color}45`,
                                    color: LEVEL_META[activeLevel].color, fontWeight: 700, fontSize: 13,
                                }}>
                                    {explaining ? <Loader2 size={14} className="spin" /> : <Zap size={14} />}
                                    {explaining ? 'Generating...' : `Explain (${LEVEL_META[activeLevel].label})`}
                                </button>
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                <motion.div key={activeLevel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: LEVEL_META[activeLevel].color }}>
                                            ✦ {LEVEL_META[activeLevel].label} Explanation
                                        </span>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <button onClick={() => toggleFavorite(activeExp)} style={{ opacity: 0.6, transition: 'opacity 0.2s', cursor: 'pointer' }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                                onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                                            >
                                                {activeExp.is_favorite
                                                    ? <Star size={14} fill={C.sun} color={C.sun} />
                                                    : <StarOff size={14} color={C.green} />}
                                            </button>
                                            <button onClick={handleExplain} disabled={explaining} style={{
                                                display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, cursor: 'pointer',
                                                background: 'rgba(40,121,153,0.12)', border: '1px solid rgba(40,121,153,0.25)',
                                                color: C.blue, fontSize: 11, fontWeight: 600,
                                            }}>
                                                {explaining ? <Loader2 size={11} className="spin" /> : <Zap size={11} />} Regenerate
                                            </button>
                                        </div>
                                    </div>
                                    <div className="prose-snippet" style={{
                                        maxHeight: 380, overflowY: 'auto', fontSize: 13, lineHeight: 1.7,
                                        padding: '14px', borderRadius: 12, background: 'rgba(50,59,68,0.5)',
                                        border: '1px solid rgba(172,185,165,0.08)',
                                    }}>
                                        <ReactMarkdown>{activeExp.content}</ReactMarkdown>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
