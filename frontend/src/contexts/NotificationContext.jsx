import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const C = { blue: '#287999', green: '#ACB9A5', bud: '#EDEFDF', sun: '#F0C968' };

const TYPE_CONFIG = {
    success: { color: '#4CAF50', icon: CheckCircle, border: 'rgba(76,175,80,0.35)' },
    error: { color: '#F0C968', icon: XCircle, border: 'rgba(240,201,104,0.35)' },
    info: { color: '#287999', icon: Info, border: 'rgba(40,121,153,0.35)' },
};

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    let idRef = 0;

    const addToast = useCallback((type, message) => {
        const id = ++idRef;
        setNotifications(p => [...p, { id, type, message }]);
        setTimeout(() => setNotifications(p => p.filter(n => n.id !== id)), 4000);
    }, []);

    const toast = {
        success: msg => addToast('success', msg),
        error: msg => addToast('error', msg),
        info: msg => addToast('info', msg),
    };

    return (
        <NotificationContext.Provider value={toast}>
            {children}
            {/* Toast container */}
            <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <AnimatePresence>
                    {notifications.map(n => {
                        const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
                        const Icon = cfg.icon;
                        return (
                            <motion.div key={n.id}
                                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '12px 16px', borderRadius: 14, minWidth: 260, maxWidth: 360,
                                    background: 'rgba(35,44,52,0.96)', backdropFilter: 'blur(20px)',
                                    border: `1px solid ${cfg.border}`,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                                }}
                            >
                                <Icon size={16} color={cfg.color} style={{ flexShrink: 0 }} />
                                <p style={{ flex: 1, fontSize: 13, color: C.bud, lineHeight: 1.4 }}>{n.message}</p>
                                <button
                                    onClick={() => setNotifications(p => p.filter(t => t.id !== n.id))}
                                    style={{ opacity: 0.45, cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.2s', padding: 2 }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '0.45'}
                                >
                                    <X size={13} color={C.green} />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
}

export const useToast = () => useContext(NotificationContext);
