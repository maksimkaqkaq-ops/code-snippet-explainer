import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Eye, Code2, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/NotificationContext';

const C = { blue: '#287999', green: '#ACB9A5', bud: '#EDEFDF', sun: '#F0C968' };

const LANG_COLORS = {
    python: '#3776AB', javascript: '#F7DF1E', typescript: '#3178C6',
    java: '#ED8B00', rust: '#CE422B', go: '#00ADD8', cpp: '#659AD2',
    c: '#A8B9CC', css: '#264DE4', html: '#E34C26', sql: '#e38c00', other: '#ACB9A5',
};

function LangBadge({ language }) {
    const lower = language?.toLowerCase() ?? 'other';
    const color = LANG_COLORS[lower] ?? LANG_COLORS.other;
    return (
        <span style={{
            padding: '2px 9px', borderRadius: 6, fontSize: 10, fontWeight: 700,
            background: `${color}18`, border: `1px solid ${color}45`, color,
            textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>{language ?? 'other'}</span>
    );
}

export default function SnippetsListPage() {
    const [snippets, setSnippets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [langFilter, setLangFilter] = useState('');
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('snippets/')
            .then(r => setSnippets(Array.isArray(r.data) ? r.data : r.data.results ?? []))
            .catch(() => toast.error('Failed to load snippets'))
            .finally(() => setLoading(false));
    }, []);

    const languages = [...new Set(snippets.map(s => s.language).filter(Boolean))];
    const filtered = snippets.filter(s => {
        const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
        const matchLang = !langFilter || s.language === langFilter;
        return matchSearch && matchLang;
    });

    const handleDelete = async (e, id) => {
        e.preventDefault(); e.stopPropagation();
        try {
            await api.delete(`snippets/${id}/`);
            setSnippets(p => p.filter(s => s.id !== id));
            toast.success('Deleted');
        } catch { toast.error('Could not delete'); }
    };

    return (
        <div style={{ padding: '32px 36px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <div style={{ width: 6, height: 22, borderRadius: 3, background: `linear-gradient(${C.blue}, ${C.green})` }} />
                        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.bud, letterSpacing: '-0.4px' }}>Code Snippets</h1>
                    </div>
                    <p style={{ color: C.green, fontSize: 13, marginLeft: 16 }}>{snippets.length} snippet{snippets.length !== 1 && 's'} in your workspace</p>
                </div>
                <Link to="/app/snippets/new" style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12,
                    background: `linear-gradient(135deg, ${C.blue}, rgba(40,121,153,0.75))`,
                    color: C.bud, fontWeight: 700, fontSize: 13,
                    boxShadow: '0 0 24px rgba(40,121,153,0.4)',
                }}>
                    <Plus size={15} /> New Snippet
                </Link>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
                    <Search size={14} color="rgba(172,185,165,0.5)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search snippets..."
                        style={{
                            width: '100%', padding: '10px 12px 10px 36px', borderRadius: 11,
                            background: 'rgba(40,50,58,0.65)', backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(172,185,165,0.15)',
                            color: C.bud, fontSize: 13,
                        }}
                        onFocus={e => e.target.style.borderColor = C.blue}
                        onBlur={e => e.target.style.borderColor = 'rgba(172,185,165,0.15)'}
                    />
                </div>
                {/* Language pills */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => setLangFilter('')} style={{
                        padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        background: !langFilter ? 'rgba(40,121,153,0.2)' : 'rgba(172,185,165,0.08)',
                        border: `1px solid ${!langFilter ? 'rgba(40,121,153,0.4)' : 'rgba(172,185,165,0.15)'}`,
                        color: !langFilter ? C.blue : C.green,
                    }}>All</button>
                    {languages.map(l => (
                        <button key={l} onClick={() => setLangFilter(l === langFilter ? '' : l)} style={{
                            padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            background: l === langFilter ? 'rgba(40,121,153,0.2)' : 'rgba(172,185,165,0.08)',
                            border: `1px solid ${l === langFilter ? 'rgba(40,121,153,0.4)' : 'rgba(172,185,165,0.15)'}`,
                            color: l === langFilter ? C.blue : C.green,
                        }}>{l}</button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                    <Loader2 size={26} color={C.blue} className="spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', paddingBlock: 80 }}>
                    <Code2 size={44} color="rgba(172,185,165,0.2)" style={{ margin: '0 auto 16px' }} />
                    <p style={{ color: C.green, fontSize: 14, opacity: 0.7 }}>
                        {snippets.length === 0 ? 'No snippets yet — create your first one!' : 'No snippets match your filters'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    <AnimatePresence>
                        {filtered.map((s, i) => (
                            <motion.div key={s.id}
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                            >
                                <Link to={`/app/snippets/${s.id}`} style={{ textDecoration: 'none' }}>
                                    <div style={{
                                        background: 'rgba(40,50,58,0.65)', backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(172,185,165,0.12)', borderRadius: 18,
                                        overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer',
                                    }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.border = '1px solid rgba(40,121,153,0.35)';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.border = '1px solid rgba(172,185,165,0.12)';
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {/* Card header */}
                                        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid rgba(172,185,165,0.07)' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                                                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.bud, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{s.title}</h3>
                                                <button
                                                    onClick={e => handleDelete(e, s.id)}
                                                    style={{ flexShrink: 0, opacity: 0.35, transition: 'opacity 0.2s', background: 'transparent', border: 'none', padding: 2, cursor: 'pointer' }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '0.35'}
                                                >
                                                    <Trash2 size={13} color={C.sun} />
                                                </button>
                                            </div>
                                            <div style={{ marginTop: 8 }}>
                                                <LangBadge language={s.language} />
                                            </div>
                                        </div>
                                        {/* Code preview */}
                                        <pre style={{
                                            padding: '12px 18px', fontSize: 11, lineHeight: 1.6,
                                            color: 'rgba(237,239,223,0.7)', background: 'rgba(50,59,68,0.5)',
                                            overflow: 'hidden', maxHeight: 90, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                                        }}>
                                            <code>{s.code?.substring(0, 200)}</code>
                                        </pre>
                                        {/* Footer */}
                                        <div style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: 11, color: 'rgba(172,185,165,0.45)' }}>
                                                {new Date(s.created_at || Date.now()).toLocaleDateString()}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.blue, fontSize: 11, fontWeight: 600 }}>
                                                <Eye size={12} /> View
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
