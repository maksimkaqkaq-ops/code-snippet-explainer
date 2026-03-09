import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Code2, MessagesSquare, LogOut, Zap, Menu, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/NotificationContext';

const C = {
    bg: '#323B44', sidebar: 'rgba(35,44,52,0.9)',
    blue: '#287999', green: '#ACB9A5', bud: '#EDEFDF', sun: '#F0C968',
};

const NAV = [
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/app/snippets', icon: Code2, label: 'Snippets' },
    { to: '/app/chat', icon: MessagesSquare, label: 'AI Chat' },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success('Signed out');
        navigate('/login');
    };

    const SidebarContent = () => (
        <div style={{
            display: 'flex', flexDirection: 'column', height: '100%',
            padding: '24px 16px',
        }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36, paddingLeft: 4 }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    background: `linear-gradient(135deg, ${C.blue}, ${C.green})`,
                    boxShadow: `0 0 20px rgba(40,121,153,0.4)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Zap size={18} color="#EDEFDF" />
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.bud, letterSpacing: '-0.3px' }}>Code Explainer</div>
                    <div style={{ fontSize: 11, color: 'rgba(172,185,165,0.6)', marginTop: 1 }}>AI Workspace</div>
                </div>
            </div>

            {/* Nav section label */}
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(172,185,165,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 8 }}>
                Navigation
            </div>

            {/* Nav links */}
            <nav style={{ flex: 1 }}>
                {NAV.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to} style={{ display: 'block', marginBottom: 4, textDecoration: 'none' }}>
                        {({ isActive }) => (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 11,
                                padding: '10px 12px', borderRadius: 12,
                                background: isActive ? 'rgba(40,121,153,0.2)' : 'transparent',
                                border: isActive ? '1px solid rgba(40,121,153,0.35)' : '1px solid transparent',
                                color: isActive ? C.bud : C.green,
                                fontSize: 13, fontWeight: isActive ? 600 : 400,
                                transition: 'all 0.18s',
                            }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(172,185,165,0.07)'; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                            >
                                <Icon size={16} style={{ flexShrink: 0, color: isActive ? C.blue : 'rgba(172,185,165,0.6)' }} />
                                {label}
                                {isActive && <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: C.blue }} />}
                            </div>
                        )}
                    </NavLink>
                ))}

                {(user?.is_staff || user?.role === 'admin') && (
                    <NavLink to="/app/admin" style={{ display: 'block', marginTop: 16, textDecoration: 'none' }}>
                        {({ isActive }) => (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 11,
                                padding: '10px 12px', borderRadius: 12,
                                background: isActive ? 'rgba(240,201,104,0.18)' : 'rgba(240,201,104,0.1)',
                                border: '1px solid rgba(240,201,104,0.25)',
                                color: C.sun, fontSize: 13, fontWeight: 700,
                                transition: 'all 0.18s',
                                boxShadow: isActive ? `inset 0 0 0 1px rgba(240,201,104,0.3)` : 'none'
                            }}
                                onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'rgba(240,201,104,0.18)')}
                                onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'rgba(240,201,104,0.1)')}
                            >
                                <Shield size={16} style={{ flexShrink: 0, color: C.sun }} />
                                Admin Panel
                            </div>
                        )}
                    </NavLink>
                )}
            </nav>

            {/* User footer */}
            <div style={{
                borderTop: '1px solid rgba(172,185,165,0.1)', paddingTop: 16, marginTop: 16,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: `linear-gradient(135deg, ${C.blue}, rgba(172,185,165,0.5))`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: C.bud,
                    }}>
                        {user?.username?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.bud, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.username ?? 'User'}
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(172,185,165,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email ?? ''}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%', padding: '9px 12px', borderRadius: 10,
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'rgba(240,201,104,0.07)',
                        border: '1px solid rgba(240,201,104,0.15)',
                        color: C.sun, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.18s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,201,104,0.14)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(240,201,104,0.07)'}
                >
                    <LogOut size={13} /> Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: C.bg }}>
            {/* Desktop sidebar */}
            <div style={{
                width: 220, flexShrink: 0,
                background: C.sidebar,
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                borderRight: '1px solid rgba(172,185,165,0.1)',
                display: 'flex', flexDirection: 'column',
            }}>
                <SidebarContent />
            </div>

            {/* Mobile sidebar overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
                        />
                        <motion.div
                            initial={{ x: -220 }} animate={{ x: 0 }} exit={{ x: -220 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            style={{
                                position: 'fixed', left: 0, top: 0, bottom: 0, width: 220,
                                background: C.sidebar, zIndex: 50,
                            }}
                        >
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Mobile topbar */}
                <div style={{
                    display: 'none', // hidden on desktop; show via responsive later
                    alignItems: 'center', gap: 12, padding: '12px 16px',
                    borderBottom: '1px solid rgba(172,185,165,0.08)',
                    background: 'rgba(35,44,52,0.8)', backdropFilter: 'blur(20px)',
                }}>
                    <button onClick={() => setMobileOpen(p => !p)} style={{ padding: 4 }}>
                        <Menu size={20} color={C.green} />
                    </button>
                </div>

                {/* Page outlet */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={window.location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                            style={{ height: '100%' }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
