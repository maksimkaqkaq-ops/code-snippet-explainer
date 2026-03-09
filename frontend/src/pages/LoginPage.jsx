import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/NotificationContext';

const C = {
    bg: '#323B44',
    glass: 'rgba(40,50,58,0.75)',
    blue: '#287999',
    green: '#ACB9A5',
    bud: '#EDEFDF',
    sun: '#F0C968',
};

export default function LoginPage() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.password) { toast.error('Please fill in all fields'); return; }
        setLoading(true);
        try {
            await login(form.username, form.password);
            toast.success('Welcome back!');
            navigate('/app/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.detail ?? 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `radial-gradient(ellipse at 20% 20%, rgba(40,121,153,0.22) 0%, transparent 50%),
                   radial-gradient(ellipse at 80% 80%, rgba(240,201,104,0.12) 0%, transparent 55%),
                   radial-gradient(ellipse at 60% 10%, rgba(172,185,165,0.1) 0%, transparent 45%),
                   ${C.bg}`,
            position: 'relative',
            overflow: 'hidden',
            padding: '20px',
        }}>
            {/* Grid pattern */}
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.035, pointerEvents: 'none',
                backgroundImage: 'linear-gradient(rgba(172,185,165,1) 1px, transparent 1px), linear-gradient(90deg, rgba(172,185,165,1) 1px, transparent 1px)',
                backgroundSize: '52px 52px',
            }} />

            <motion.div
                initial={{ opacity: 0, y: 32, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
            >
                {/* Brand */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 18, margin: '0 auto 16px',
                        background: `linear-gradient(135deg, ${C.blue}, ${C.green})`,
                        boxShadow: `0 0 40px rgba(40,121,153,0.5), 0 0 80px rgba(40,121,153,0.15)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Zap size={26} color="#EDEFDF" />
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: C.bud, letterSpacing: '-0.5px' }}>Code Explainer</h1>
                    <p style={{ color: C.green, fontSize: 14, marginTop: 4 }}>Sign in to your workspace</p>
                </div>

                {/* Card */}
                <div style={{
                    background: C.glass,
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    border: '1px solid rgba(172,185,165,0.18)',
                    borderRadius: 24,
                    padding: '36px 32px',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(172,185,165,0.1)',
                }}>
                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <div style={{ marginBottom: 18 }}>
                            <label style={{ display: 'block', color: C.green, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Username</label>
                            <input
                                type="text"
                                value={form.username}
                                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                                placeholder="your_username"
                                style={{
                                    width: '100%', padding: '12px 16px', borderRadius: 12,
                                    background: 'rgba(237,239,223,0.05)',
                                    border: '1px solid rgba(172,185,165,0.2)',
                                    color: C.bud, fontSize: 14,
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={e => e.target.style.borderColor = C.blue}
                                onBlur={e => e.target.style.borderColor = 'rgba(172,185,165,0.2)'}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: 26 }}>
                            <label style={{ display: 'block', color: C.green, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%', padding: '12px 48px 12px 16px', borderRadius: 12,
                                        background: 'rgba(237,239,223,0.05)',
                                        border: '1px solid rgba(172,185,165,0.2)',
                                        color: C.bud, fontSize: 14,
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = C.blue}
                                    onBlur={e => e.target.style.borderColor = 'rgba(172,185,165,0.2)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(p => !p)}
                                    style={{
                                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                        opacity: 0.5, transition: 'opacity 0.2s', background: 'transparent', border: 'none',
                                        cursor: 'pointer', padding: 0, display: 'flex',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                                >
                                    {showPw ? <EyeOff size={17} color={C.green} /> : <Eye size={17} color={C.green} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '13px', borderRadius: 12,
                                background: loading
                                    ? 'rgba(40,121,153,0.4)'
                                    : `linear-gradient(135deg, ${C.blue} 0%, rgba(40,121,153,0.75) 100%)`,
                                color: C.bud, fontSize: 14, fontWeight: 700,
                                boxShadow: loading ? 'none' : '0 0 28px rgba(40,121,153,0.45)',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                transition: 'all 0.25s',
                            }}
                        >
                            {loading
                                ? <Loader2 size={18} className="spin" />
                                : <><LogIn size={16} /> Sign In</>}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', fontSize: 13, color: C.green, marginTop: 22 }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: C.sun, fontWeight: 600 }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >Create one</Link>
                </p>
            </motion.div>
        </div>
    );
}
