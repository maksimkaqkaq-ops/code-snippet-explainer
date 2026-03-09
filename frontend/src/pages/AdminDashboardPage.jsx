import { useState, useEffect } from 'react';
import { Shield, Users, Code2, MessagesSquare, Trash2, ShieldAlert, CheckCircle2, XCircle, Search, Activity, Box, Database, TrendingUp, Filter, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const C = {
    bg: '#323B44', dark: 'rgba(35,44,52,0.6)',
    blue: '#287999', green: '#ACB9A5', bud: '#EDEFDF', sun: '#F0C968',
    red: '#ff6b6b'
};

const TABS = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'snippets', label: 'Snippets', icon: Code2 },
    { id: 'chats', label: 'Chat Sessions', icon: MessagesSquare }
];

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('overview');

    // Data states
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [snippets, setSnippets] = useState([]);
    const [chats, setChats] = useState([]);

    // UI states
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user && user.role !== 'admin' && !user.is_staff) {
            toast.error('Unauthorized access');
            navigate('/app/dashboard');
            return;
        }
        fetchData(activeTab);
    }, [activeTab, user]);

    // Handle debounced search for list tabs
    useEffect(() => {
        if (activeTab === 'overview') return;
        const delay = setTimeout(() => fetchData(activeTab, searchQuery), 500);
        return () => clearTimeout(delay);
    }, [searchQuery]);

    const fetchData = async (tab, search = '') => {
        setLoading(true);
        try {
            const params = search ? { search } : {};
            if (tab === 'overview') {
                const { data } = await api.get('admin/stats/');
                setStats(data);
            } else if (tab === 'users') {
                const { data } = await api.get('admin/users/', { params });
                setUsers(data);
            } else if (tab === 'snippets') {
                const { data } = await api.get('admin/snippets/', { params });
                setSnippets(data);
            } else if (tab === 'chats') {
                const { data } = await api.get('admin/chat-sessions/', { params });
                setChats(data);
            }
        } catch (error) {
            toast.error(`Failed to load ${tab} data`);
        } finally {
            setLoading(false);
        }
    };

    // Actions
    const toggleUserActive = async (id, currentStatus) => {
        try {
            const { data } = await api.post(`admin/users/${id}/toggle-active/`);
            setUsers(users.map(u => u.id === id ? { ...u, is_active: data.is_active } : u));
            toast.success(data.detail);
        } catch { toast.error('Failed to toggle user status'); }
    };

    const changeUserRole = async (id, newRole) => {
        try {
            const { data } = await api.post(`admin/users/${id}/change-role/`, { role: newRole });
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
            toast.success(`Role changed to ${newRole}`);
        } catch { toast.error('Failed to change role'); }
    };

    const deleteSnippet = async (id) => {
        if (!window.confirm('Delete this snippet and all explanations permanently?')) return;
        try {
            const { data } = await api.delete(`admin/snippets/${id}/`);
            setSnippets(snippets.filter(s => s.id !== id));
            toast.success(data.detail || 'Snippet deleted');
        } catch { toast.error('Failed to delete snippet'); }
    };

    const deleteChat = async (id) => {
        if (!window.confirm('Delete this chat session permanently?')) return;
        try {
            const { data } = await api.delete(`admin/chat-sessions/${id}/`);
            setChats(chats.filter(c => c.id !== id));
            toast.success(data.detail || 'Chat deleted');
        } catch { toast.error('Failed to delete chat'); }
    };

    const StatCard = ({ title, value, sub, icon: Icon, color = C.blue }) => (
        <div style={{
            background: 'rgba(40,50,58,0.65)', backdropFilter: 'blur(20px)',
            border: `1px solid rgba(172,185,165,0.12)`, borderRadius: 16,
            padding: 20, display: 'flex', flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(172,185,165,0.7)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    {title}
                </div>
                <div style={{ padding: 6, borderRadius: 8, background: `rgba(40,121,153,0.1)` }}>
                    <Icon size={16} color={color} />
                </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.bud, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {value ?? '-'}
            </div>
            {sub && <div style={{ fontSize: 12, color: C.green, marginTop: 8 }}>{sub}</div>}
        </div>
    );

    return (
        <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{ width: 4, height: 24, borderRadius: 4, background: C.sun }} />
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.bud, letterSpacing: '-0.03em', margin: 0 }}>
                            Admin Center
                        </h1>
                    </div>
                    <p style={{ color: C.green, margin: 0, fontSize: 14 }}>System overview and moderation</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{
                display: 'flex', gap: 8, marginBottom: 24,
                borderBottom: '1px solid rgba(172,185,165,0.1)', paddingBottom: 16
            }}>
                {TABS.map(tab => {
                    const active = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 16px', borderRadius: 12, border: 'none',
                                background: active ? 'rgba(40,121,153,0.15)' : 'transparent',
                                color: active ? C.bud : C.green,
                                fontSize: 14, fontWeight: active ? 600 : 500,
                                cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: active ? `inset 0 0 0 1px rgba(40,121,153,0.3)` : 'none'
                            }}
                            onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(172,185,165,0.05)')}
                            onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
                        >
                            <Icon size={16} color={active ? C.blue : C.green} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && stats && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                            <StatCard title="Total Users" value={stats.total_users} sub={`${stats.active_users} active, ${stats.new_users_today} joined today`} icon={Users} />
                            <StatCard title="Total Snippets" value={stats.total_snippets} sub={`${stats.snippets_today} created today`} icon={Code2} color={C.green} />
                            <StatCard title="AI Explanations" value={stats.total_explanations} sub={`${stats.favorited_explanations} favorited`} icon={Zap} color={C.sun} />
                            <StatCard title="Chat Sessions" value={stats.total_chat_sessions} sub={`${stats.total_chat_messages} total messages`} icon={MessagesSquare} color={C.blue} />
                        </div>
                    )}

                    {/* LIST TABS (Users, Snippets, Chats) */}
                    {['users', 'snippets', 'chats'].includes(activeTab) && (
                        <div style={{ background: 'rgba(40,50,58,0.4)', borderRadius: 16, border: '1px solid rgba(172,185,165,0.1)', overflow: 'hidden' }}>
                            {/* Toolbar */}
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(172,185,165,0.1)', display: 'flex', gap: 16 }}>
                                <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
                                    <Search size={16} color={C.green} style={{ position: 'absolute', left: 14, top: 12 }} />
                                    <input
                                        type="text"
                                        placeholder={`Search ${activeTab}...`}
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        style={{
                                            width: '100%', padding: '10px 16px 10px 40px',
                                            background: 'rgba(35,44,52,0.6)', border: '1px solid rgba(172,185,165,0.2)',
                                            borderRadius: 10, color: C.bud, fontSize: 14, outline: 'none'
                                        }}
                                        onFocus={e => e.target.style.borderColor = C.blue}
                                        onBlur={e => e.target.style.borderColor = 'rgba(172,185,165,0.2)'}
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(35,44,52,0.4)', color: 'rgba(172,185,165,0.6)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {activeTab === 'users' && (<><th style={{ padding: '14px 20px' }}>User</th><th style={{ padding: '14px 20px' }}>Role</th><th style={{ padding: '14px 20px' }}>Status</th><th style={{ padding: '14px 20px' }}>Stats</th><th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th></>)}
                                            {activeTab === 'snippets' && (<><th style={{ padding: '14px 20px' }}>Title</th><th style={{ padding: '14px 20px' }}>Language</th><th style={{ padding: '14px 20px' }}>Author</th><th style={{ padding: '14px 20px' }}>Created</th><th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th></>)}
                                            {activeTab === 'chats' && (<><th style={{ padding: '14px 20px' }}>Session Title</th><th style={{ padding: '14px 20px' }}>User</th><th style={{ padding: '14px 20px' }}>Messages</th><th style={{ padding: '14px 20px' }}>Created</th><th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th></>)}
                                        </tr>
                                    </thead>
                                    <tbody style={{ fontSize: 14, color: C.bud }}>
                                        {loading ? (
                                            <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: C.green }}>Loading {activeTab}...</td></tr>
                                        ) : (
                                            <>
                                                {/* USERS ROw */}
                                                {activeTab === 'users' && users.map(u => (
                                                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(172,185,165,0.05)' }}>
                                                        <td style={{ padding: '16px 20px' }}>
                                                            <div style={{ fontWeight: 600 }}>{u.username}</div>
                                                            <div style={{ fontSize: 12, color: C.green }}>{u.email}</div>
                                                        </td>
                                                        <td style={{ padding: '16px 20px' }}>
                                                            <span style={{
                                                                padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                                                                background: u.role === 'admin' ? 'rgba(240,201,104,0.15)' : 'rgba(172,185,165,0.1)',
                                                                color: u.role === 'admin' ? C.sun : C.green
                                                            }}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '16px 20px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: u.is_active ? C.green : C.red, fontSize: 13, fontWeight: 500 }}>
                                                                {u.is_active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                                                {u.is_active ? 'Active' : 'Blocked'}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px 20px', color: C.green, fontSize: 13 }}>
                                                            {u.snippet_count} snip • {u.chat_count} chats
                                                        </td>
                                                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                            {u.id !== user.id && (
                                                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                                    <button onClick={() => toggleUserActive(u.id, u.is_active)} style={{ background: 'rgba(172,185,165,0.1)', border: 'none', color: C.bud, padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                                                                        {u.is_active ? 'Block' : 'Unblock'}
                                                                    </button>
                                                                    <button onClick={() => changeUserRole(u.id, u.role === 'admin' ? 'user' : 'admin')} style={{ background: 'rgba(40,121,153,0.15)', border: 'none', color: C.blue, padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                                                                        Make {u.role === 'admin' ? 'User' : 'Admin'}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}

                                                {/* SNIPPETS ROW */}
                                                {activeTab === 'snippets' && snippets.map(s => (
                                                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(172,185,165,0.05)' }}>
                                                        <td style={{ padding: '16px 20px', fontWeight: 500 }}>{s.title}</td>
                                                        <td style={{ padding: '16px 20px' }}>
                                                            <span style={{ color: C.blue, fontSize: 13, fontWeight: 600 }}>{s.language}</span>
                                                        </td>
                                                        <td style={{ padding: '16px 20px', color: C.green }}>{s.owner}</td>
                                                        <td style={{ padding: '16px 20px', color: C.green, fontSize: 13 }}>{new Date(s.created_at).toLocaleDateString()}</td>
                                                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                            <button onClick={() => deleteSnippet(s.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} title="Delete">
                                                                <Trash2 size={16} color={C.red} opacity={0.7} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {/* CHATS ROW */}
                                                {activeTab === 'chats' && chats.map(c => (
                                                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(172,185,165,0.05)' }}>
                                                        <td style={{ padding: '16px 20px', fontWeight: 500 }}>{c.title}</td>
                                                        <td style={{ padding: '16px 20px', color: C.green }}>{c.owner}</td>
                                                        <td style={{ padding: '16px 20px', color: C.green, fontSize: 13 }}>{c.message_count} msgs</td>
                                                        <td style={{ padding: '16px 20px', color: C.green, fontSize: 13 }}>{new Date(c.created_at).toLocaleDateString()}</td>
                                                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                            <button onClick={() => deleteChat(c.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} title="Delete">
                                                                <Trash2 size={16} color={C.red} opacity={0.7} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {!loading && ((activeTab === 'users' && users.length === 0) || (activeTab === 'snippets' && snippets.length === 0) || (activeTab === 'chats' && chats.length === 0)) && (
                                                    <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: C.green }}>No {activeTab} found.</td></tr>
                                                )}
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
