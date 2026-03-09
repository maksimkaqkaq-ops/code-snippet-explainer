import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Code2, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/NotificationContext';

const C = { blue: '#287999', green: '#ACB9A5', bud: '#EDEFDF', sun: '#F0C968' };

// Values must exactly match backend LANGUAGE_CHOICES slugs
const LANGUAGES = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'java', label: 'Java' },
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'php', label: 'PHP' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'sql', label: 'SQL' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'bash', label: 'Bash' },
    { value: 'other', label: 'Other' },
];

export default function SnippetCreatePage() {
    const [form, setForm] = useState({ title: '', language: 'python', code: '' });
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const lines = form.code ? form.code.split('\n') : [''];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { toast.error('Title is required'); return; }
        if (!form.code.trim()) { toast.error('Code is required'); return; }
        setLoading(true);
        try {
            const { data } = await api.post('snippets/', form);
            toast.success('Snippet created!');
            navigate(`/app/snippets/${data.id}`);
        } catch { toast.error('Failed to create snippet'); }
        finally { setLoading(false); }
    };

    const labelStyle = {
        display: 'block', color: C.green, fontSize: 11, fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8,
    };
    const inputStyle = {
        width: '100%', padding: '11px 14px', borderRadius: 11,
        background: 'rgba(237,239,223,0.05)', border: '1px solid rgba(172,185,165,0.18)',
        color: C.bud, fontSize: 13, transition: 'border-color 0.2s',
    };

    return (
        <div style={{ padding: '32px 36px', maxWidth: 820, margin: '0 auto' }}>
            <Link to="/snippets" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.green, fontSize: 13, marginBottom: 24 }}>
                <ArrowLeft size={14} /> Back to Snippets
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <div style={{ width: 6, height: 22, borderRadius: 3, background: `linear-gradient(${C.blue}, ${C.green})` }} />
                <h1 style={{ fontSize: 22, fontWeight: 800, color: C.bud, letterSpacing: '-0.4px' }}>New Snippet</h1>
            </div>

            <motion.form
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                style={{
                    background: 'rgba(40,50,58,0.65)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(172,185,165,0.13)', borderRadius: 22,
                    padding: '28px 28px',
                }}
            >
                {/* Title + Language row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: 22 }}>
                    <div>
                        <label style={labelStyle}>Title *</label>
                        <input
                            value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            placeholder="e.g. Binary Search Implementation"
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = C.blue}
                            onBlur={e => e.target.style.borderColor = 'rgba(172,185,165,0.18)'}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Language</label>
                        <select
                            value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))}
                            style={{ ...inputStyle, width: 160, cursor: 'pointer' }}
                            onFocus={e => e.target.style.borderColor = C.blue}
                            onBlur={e => e.target.style.borderColor = 'rgba(172,185,165,0.18)'}
                        >
                            {LANGUAGES.map(l => <option key={l.value} value={l.value} style={{ background: '#323B44' }}>{l.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Code editor */}
                <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <label style={labelStyle}>Code *</label>
                        <span style={{ fontSize: 11, color: 'rgba(172,185,165,0.45)' }}>
                            {lines.length} line{lines.length !== 1 && 's'} · {form.code.length} chars
                        </span>
                    </div>
                    <div style={{
                        display: 'flex', borderRadius: 14, overflow: 'hidden',
                        border: '1px solid rgba(172,185,165,0.18)',
                        background: 'rgba(50,59,68,0.6)',
                    }}>
                        {/* Line numbers */}
                        <div style={{
                            padding: '14px 0', background: 'rgba(50,59,68,0.5)',
                            borderRight: '1px solid rgba(172,185,165,0.08)',
                            minWidth: 44, textAlign: 'right',
                            fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: '1.75',
                            color: 'rgba(172,185,165,0.3)', userSelect: 'none',
                        }}>
                            {lines.map((_, i) => (
                                <div key={i} style={{ paddingRight: 10 }}>{i + 1}</div>
                            ))}
                        </div>
                        {/* Textarea */}
                        <textarea
                            value={form.code}
                            onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                            placeholder={`# Your ${form.language} code here...`}
                            rows={Math.max(14, lines.length + 2)}
                            style={{
                                flex: 1, padding: '14px', resize: 'vertical',
                                background: 'transparent', border: 'none', outline: 'none',
                                color: C.bud, fontSize: 12, lineHeight: 1.75,
                                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                            }}
                            onFocus={e => e.currentTarget.parentElement.parentElement.style.borderColor = C.blue}
                            onBlur={e => e.currentTarget.parentElement.parentElement.style.borderColor = 'rgba(172,185,165,0.18)'}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <Link to="/snippets" style={{
                        padding: '10px 20px', borderRadius: 10,
                        background: 'rgba(172,185,165,0.08)', border: '1px solid rgba(172,185,165,0.15)',
                        color: C.green, fontSize: 13, fontWeight: 600,
                    }}>Cancel</Link>
                    <button type="submit" disabled={loading} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 22px', borderRadius: 10,
                        background: loading ? 'rgba(40,121,153,0.4)' : `linear-gradient(135deg, ${C.blue}, rgba(40,121,153,0.75))`,
                        color: C.bud, fontSize: 13, fontWeight: 700,
                        boxShadow: loading ? 'none' : '0 0 22px rgba(40,121,153,0.4)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                    }}>
                        {loading ? <Loader2 size={15} className="spin" /> : <><Save size={14} /> Save Snippet</>}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
