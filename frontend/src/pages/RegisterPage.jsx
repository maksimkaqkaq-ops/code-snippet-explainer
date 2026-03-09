import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/NotificationContext';

const C = {
    bg: '#323B44', glass: 'rgba(40,50,58,0.75)',
    blue: '#287999', green: '#ACB9A5', bud: '#EDEFDF', sun: '#F0C968',
};

export default function RegisterPage() {
    const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const pwMatch = form.password && form.password2 && form.password !== form.password2;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.password) { toast.error('Please fill all required fields'); return; }
        if (form.password !== form.password2) { toast.error('Passwords do not match'); return; }
        setLoading(true);
        try {
            await register(form.username, form.email, form.password);
            toast.success('Account created!');
            navigate('/app/dashboard');
        } catch (err) {
            const data = err.response?.data;
            toast.error(data?.username?.[0] ?? data?.detail ?? 'Registration failed');
        } finally { setLoading(false); }
    };

    const inputStyle = {
        width: '100%', padding: '12px 16px', borderRadius: 12,
        background: 'rgba(237,239,223,0.05)',
        border: '1px solid rgba(172,185,165,0.2)',
        color: C.bud, fontSize: 14, transition: 'border-color 0.2s',
    };
    const labelStyle = {
        display: 'block', color: C.green, fontSize: 11, fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8,
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `radial-gradient(ellipse at 75% 20%, rgba(40,121,153,0.2) 0%, transparent 50%),
                   radial-gradient(ellipse at 20% 80%, rgba(172,185,165,0.12) 0%, transparent 55%),
                   ${C.bg}`,
            position: 'relative', overflow: 'hidden', padding: '20px',
        }}>
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.035, pointerEvents: 'none',
                backgroundImage: 'linear-gradient(rgba(172,185,165,1) 1px, transparent 1px), linear-gradient(90deg, rgba(172,185,165,1) 1px, transparent 1px)',
                backgroundSize: '52px 52px',
            }} />

            <motion.div
                initial={{ opacity: 0, y: 32, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
            >
                {/* Brand */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{
                        width: 54, height: 54, borderRadius: 18, margin: '0 auto 14px',
                        background: `linear-gradient(135deg, ${C.blue}, ${C.green})`,
                        boxShadow: `0 0 40px rgba(40,121,153,0.5)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Zap size={25} color="#EDEFDF" />
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: C.bud, letterSpacing: '-0.5px' }}>Create Account</h1>
                    <p style={{ color: C.green, fontSize: 13, marginTop: 4 }}>Join Code Explainer today</p>
                </div>

                {/* Card */}
                <div style={{
                    background: C.glass, backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
                    border: '1px solid rgba(172,185,165,0.18)', borderRadius: 24,
                    padding: '32px 28px',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(172,185,165,0.1)',
                }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px', marginBottom: 14 }}>
                            <div>
                                <label style={labelStyle}>Username *</label>
                                <input type="text" value={form.username} placeholder="username"
                                    onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = C.blue}
                                    onBlur={e => e.target.style.borderColor = 'rgba(172,185,165,0.2)'}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input type="email" value={form.email} placeholder="you@email.com"
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = C.blue}
                                    onBlur={e => e.target.style.borderColor = 'rgba(172,185,165,0.2)'}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 14 }}>
                            <label style={labelStyle}>Password *</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPw ? 'text' : 'password'} value={form.password} placeholder="••••••••"
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    style={{ ...inputStyle, paddingRight: 44 }}
                                    onFocus={e => e.target.style.borderColor = C.blue}
                                    onBlur={e => e.target.style.borderColor = 'rgba(172,185,165,0.2)'}
                                />
                                <button type="button" onClick={() => setShowPw(p => !p)}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5, padding: 0, display: 'flex' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                                >
                                    {showPw ? <EyeOff size={16} color={C.green} /> : <Eye size={16} color={C.green} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ ...labelStyle, color: pwMatch ? '#F0C968' : C.green }}>
                                Confirm Password * {pwMatch && '— passwords don\'t match'}
                            </label>
                            <input type={showPw ? 'text' : 'password'} value={form.password2} placeholder="••••••••"
                                onChange={e => setForm(p => ({ ...p, password2: e.target.value }))}
                                style={{ ...inputStyle, borderColor: pwMatch ? 'rgba(240,201,104,0.4)' : 'rgba(172,185,165,0.2)' }}
                                onFocus={e => e.target.style.borderColor = pwMatch ? 'rgba(240,201,104,0.6)' : C.blue}
                                onBlur={e => e.target.style.borderColor = pwMatch ? 'rgba(240,201,104,0.4)' : 'rgba(172,185,165,0.2)'}
                            />
                        </div>

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '13px', borderRadius: 12,
                            background: loading ? 'rgba(40,121,153,0.4)' : `linear-gradient(135deg, ${C.blue} 0%, rgba(40,121,153,0.75) 100%)`,
                            color: C.bud, fontSize: 14, fontWeight: 700,
                            boxShadow: loading ? 'none' : '0 0 28px rgba(40,121,153,0.45)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.25s',
                        }}>
                            {loading ? <Loader2 size={18} className="spin" /> : <><UserPlus size={16} /> Create Account</>}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', fontSize: 13, color: C.green, marginTop: 20 }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: C.sun, fontWeight: 600 }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >Sign in</Link>
                </p>
            </motion.div>
        </div>
    );
}
