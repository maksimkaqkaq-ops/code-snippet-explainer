import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    Zap, Code2, MessagesSquare, Star, ArrowRight,
    ChevronRight, Sparkles, Shield, Terminal, GitBranch,
    Cpu, BookOpen, Eye
} from 'lucide-react';

/* ── Palette ─────────────────────────────────── */
const C = {
    bg: '#323B44',
    blue: '#287999',
    green: '#ACB9A5',
    bud: '#EDEFDF',
    sun: '#F0C968',
};

/* ── Glassmorphic card helper ───────────────── */
const glass = (extra = {}) => ({
    background: 'rgba(40,50,58,0.6)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
    border: '1px solid rgba(172,185,165,0.14)',
    borderRadius: 20,
    ...extra,
});

/* ── Animated counter ──────────────────────── */
function Counter({ target, suffix = '' }) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = Math.ceil(target / 60);
        const t = setInterval(() => {
            start += step;
            if (start >= target) { setVal(target); clearInterval(t); }
            else setVal(start);
        }, 18);
        return () => clearInterval(t);
    }, [target]);
    return <>{val.toLocaleString()}{suffix}</>;
}

/* ── Floating code snippet card ─────────────── */
const CODE_SNIPPET = `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`;

const AI_RESPONSE = `## Binary Search — O(log n)

1. **Divide** the array in half each iteration
2. **Compare** midpoint with target value  
3. **Discard** the irrelevant half
4. Repeat until found or array exhausted

> Time: O(log n) · Space: O(1)`;

/* ── Feature card ───────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, accent, delay, wide }) {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                ...glass(),
                padding: '28px 26px',
                position: 'relative', overflow: 'hidden',
                gridColumn: wide ? 'span 2' : 'span 1',
                transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
                borderColor: hovered ? `${accent}40` : 'rgba(172,185,165,0.14)',
                transform: hovered ? 'translateY(-3px)' : 'none',
                boxShadow: hovered ? `0 12px 40px rgba(0,0,0,0.25), 0 0 0 1px ${accent}20` : 'none',
            }}
        >
            {/* ambient glow */}
            <div style={{
                position: 'absolute', top: -30, right: -30, width: 120, height: 120,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
                transition: 'opacity 0.3s',
                opacity: hovered ? 1 : 0.5,
            }} />
            <div style={{
                width: 44, height: 44, borderRadius: 14, marginBottom: 18,
                background: `${accent}16`, border: `1px solid ${accent}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={20} color={accent} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.bud, marginBottom: 8 }}>{title}</h3>
            <p style={{ fontSize: 13, color: C.green, lineHeight: 1.65 }}>{desc}</p>
        </motion.div>
    );
}

/* ── Main Landing Page ─────────────────────── */
export default function LandingPage() {
    const heroRef = useRef(null);
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const heroY = useTransform(scrollY, [0, 400], [0, 80]);

    const FEATURES = [
        {
            icon: Zap, accent: C.sun, delay: 0,
            title: 'Instant AI Explanations',
            desc: 'Get simple, intermediate, or advanced breakdowns of any code snippet in seconds — powered by cutting-edge LLMs.',
        },
        {
            icon: Terminal, accent: C.blue, delay: 0.08,
            title: 'Multi-Language Support',
            desc: 'Python, JavaScript, TypeScript, Rust, Go, Java, C++ and more. Any language, any paradigm.',
        },
        {
            icon: MessagesSquare, accent: C.green, delay: 0.16,
            title: 'Conversational AI Chat',
            desc: 'Follow-up questions, debugging help, design patterns — chat with AI about your code like a pair programmer.',
        },
        {
            icon: BookOpen, accent: C.sun, delay: 0.24,
            title: 'Three Complexity Levels',
            desc: 'Simple for beginners, Intermediate for developers, Advanced for deep dives. Choose your depth dynamically.',
        },
        {
            icon: Star, accent: C.blue, delay: 0.32,
            title: 'Favorite Explanations',
            desc: 'Star the explanations you love. Build a personal library of well-understood code patterns to reference anytime.',
        },
        {
            icon: GitBranch, accent: C.green, delay: 0.40,
            title: 'Snippet Management',
            desc: 'Organize, search, and filter your entire snippet library. Tag by language and find anything instantly.',
        },
    ];

    return (
        <div style={{ minHeight: '100vh', background: C.bg, color: C.bud, overflowX: 'hidden' }}>

            {/* ── Nav ─────────────────────────────── */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 48px',
                background: 'rgba(50,59,68,0.7)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(172,185,165,0.1)',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: `linear-gradient(135deg, ${C.blue}, ${C.green})`,
                        boxShadow: `0 0 18px rgba(40,121,153,0.45)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Zap size={17} color="#EDEFDF" />
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: C.bud, letterSpacing: '-0.3px' }}>
                        Code<span style={{ color: C.blue }}>Explainer</span>
                    </span>
                </div>

                {/* Nav links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    {['Features', 'How it works', 'Pricing'].map(l => (
                        <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                            style={{ fontSize: 13, color: C.green, fontWeight: 500, transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = C.bud}
                            onMouseLeave={e => e.currentTarget.style.color = C.green}
                        >{l}</a>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', gap: 10 }}>
                    <Link to="/login" style={{
                        padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                        background: 'rgba(172,185,165,0.08)', border: '1px solid rgba(172,185,165,0.18)',
                        color: C.green, transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(172,185,165,0.15)'; e.currentTarget.style.color = C.bud; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(172,185,165,0.08)'; e.currentTarget.style.color = C.green; }}
                    >Sign In</Link>
                    <Link to="/register" style={{
                        padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700,
                        background: `linear-gradient(135deg, ${C.blue}, rgba(40,121,153,0.8))`,
                        color: C.bud, boxShadow: '0 0 16px rgba(40,121,153,0.4)',
                        transition: 'box-shadow 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 28px rgba(40,121,153,0.65)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 16px rgba(40,121,153,0.4)'}
                    >Get Started Free</Link>
                </div>
            </nav>

            {/* ── Hero ─────────────────────────────── */}
            <section ref={heroRef} style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', padding: '120px 48px 80px',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Background orbs */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: '10%', left: '8%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(40,121,153,0.18) 0%, transparent 65%)' }} />
                    <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,201,104,0.1) 0%, transparent 65%)' }} />
                    <div style={{ position: 'absolute', top: '50%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(172,185,165,0.09) 0%, transparent 65%)' }} />
                    {/* Grid */}
                    <div style={{
                        position: 'absolute', inset: 0, opacity: 0.035,
                        backgroundImage: 'linear-gradient(rgba(172,185,165,1) 1px, transparent 1px), linear-gradient(90deg, rgba(172,185,165,1) 1px, transparent 1px)',
                        backgroundSize: '52px 52px',
                    }} />
                </div>

                <motion.div style={{ opacity: heroOpacity, y: heroY }} className="hero-content">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                        style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}
                    >
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px',
                            borderRadius: 999, fontSize: 12, fontWeight: 600,
                            background: 'rgba(40,121,153,0.12)', border: '1px solid rgba(40,121,153,0.3)',
                            color: C.blue,
                        }}>
                            <Sparkles size={13} />
                            AI-powered code understanding
                            <ChevronRight size={12} />
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            fontSize: 'clamp(40px, 6vw, 78px)', fontWeight: 900,
                            textAlign: 'center', lineHeight: 1.08, letterSpacing: '-2px',
                            maxWidth: 860, margin: '0 auto 24px',
                        }}
                    >
                        <span style={{ color: C.bud }}>Understand any code</span>
                        <br />
                        <span style={{
                            background: `linear-gradient(135deg, ${C.blue} 0%, ${C.green} 50%, ${C.sun} 100%)`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            instantly with AI
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.55 }}
                        style={{
                            textAlign: 'center', fontSize: 'clamp(15px, 1.8vw, 20px)', color: C.green,
                            maxWidth: 580, margin: '0 auto 44px', lineHeight: 1.7,
                        }}
                    >
                        Paste any snippet — Python, JavaScript, Rust, Go, anything — and get a clear,
                        structured explanation at the complexity level you choose.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                        style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
                    >
                        <Link to="/register" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 9,
                            padding: '15px 32px', borderRadius: 14, fontSize: 15, fontWeight: 800,
                            background: `linear-gradient(135deg, ${C.blue} 0%, rgba(40,121,153,0.8) 100%)`,
                            color: C.bud, boxShadow: '0 0 36px rgba(40,121,153,0.5), 0 4px 20px rgba(0,0,0,0.3)',
                            transition: 'all 0.25s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 52px rgba(40,121,153,0.7), 0 8px 32px rgba(0,0,0,0.3)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 36px rgba(40,121,153,0.5), 0 4px 20px rgba(0,0,0,0.3)'}
                        >
                            Start for Free <ArrowRight size={17} />
                        </Link>
                        <a href="#features" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '15px 28px', borderRadius: 14, fontSize: 15, fontWeight: 600,
                            background: 'rgba(172,185,165,0.08)', border: '1px solid rgba(172,185,165,0.2)',
                            color: C.green, transition: 'all 0.2s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(172,185,165,0.15)'; e.currentTarget.style.color = C.bud; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(172,185,165,0.08)'; e.currentTarget.style.color = C.green; }}
                        >
                            See how it works <Eye size={16} />
                        </a>
                    </motion.div>
                </motion.div>

                {/* ── Hero interactive preview ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    style={{ marginTop: 72, width: '100%', maxWidth: 960, position: 'relative', zIndex: 1 }}
                >
                    {/* Glow behind panel */}
                    <div style={{
                        position: 'absolute', inset: '-20px', borderRadius: 30,
                        background: 'radial-gradient(ellipse at 50% 50%, rgba(40,121,153,0.15) 0%, transparent 70%)',
                        filter: 'blur(30px)',
                    }} />

                    <div style={{
                        ...glass({ borderRadius: 24, overflow: 'hidden' }),
                        boxShadow: '0 40px 100px rgba(0,0,0,0.45), inset 0 1px 0 rgba(172,185,165,0.1)',
                        position: 'relative',
                    }}>
                        {/* Mock browser bar */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px',
                            borderBottom: '1px solid rgba(172,185,165,0.09)',
                            background: 'rgba(35,44,52,0.8)',
                        }}>
                            {['#F0C968', '#287999', '#ACB9A5'].map((c, i) => <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
                            <div style={{
                                marginLeft: 12, flex: 1, maxWidth: 280, height: 24, borderRadius: 8,
                                background: 'rgba(172,185,165,0.07)', border: '1px solid rgba(172,185,165,0.1)',
                                display: 'flex', alignItems: 'center', paddingLeft: 10,
                                fontSize: 11, color: 'rgba(172,185,165,0.4)',
                            }}>app.codeexplainer.ai/snippets/42</div>
                        </div>

                        {/* Content: code + explanation side-by-side */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                            {/* Code panel */}
                            <div style={{ borderRight: '1px solid rgba(172,185,165,0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid rgba(172,185,165,0.06)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                        <Code2 size={13} color={C.blue} />
                                        <span style={{ fontSize: 12, fontWeight: 600, color: C.green }}>binary_search.py</span>
                                    </div>
                                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 5, background: 'rgba(40,121,153,0.15)', color: C.blue, fontWeight: 600 }}>Python</span>
                                </div>
                                <pre style={{
                                    padding: '18px 20px', fontSize: 11.5, lineHeight: 1.75,
                                    color: C.bud, margin: 0, fontFamily: 'JetBrains Mono, Fira Code, monospace',
                                    background: 'transparent', overflow: 'hidden',
                                }}>
                                    {CODE_SNIPPET.split('\n').map((line, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 14 }}>
                                            <span style={{ color: 'rgba(172,185,165,0.25)', userSelect: 'none', minWidth: 16, textAlign: 'right' }}>{i + 1}</span>
                                            <span style={{ color: line.includes('def ') ? C.sun : line.includes('return') ? C.blue : line.includes('#') ? C.green : C.bud }}>{line}</span>
                                        </div>
                                    ))}
                                </pre>
                            </div>

                            {/* Explanation panel */}
                            <div>
                                <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(172,185,165,0.06)', display: 'flex', gap: 6 }}>
                                    {['Simple', 'Intermediate', 'Advanced'].map((l, i) => (
                                        <div key={l} style={{
                                            padding: '4px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                                            background: i === 1 ? 'rgba(40,121,153,0.2)' : 'rgba(172,185,165,0.06)',
                                            border: i === 1 ? '1px solid rgba(40,121,153,0.35)' : '1px solid transparent',
                                            color: i === 1 ? C.blue : 'rgba(172,185,165,0.45)',
                                        }}>{l}</div>
                                    ))}
                                </div>
                                <div style={{ padding: '18px 20px' }}>
                                    {/* Simulated AI markdown */}
                                    <div style={{ marginBottom: 10 }}>
                                        <span style={{ fontSize: 14, fontWeight: 800, color: C.sun }}>## Binary Search — O(log n)</span>
                                    </div>
                                    {[
                                        { bullet: '1.', text: 'Divide', rest: ' the array in half each iteration', color: C.blue },
                                        { bullet: '2.', text: 'Compare', rest: ' midpoint with target value', color: C.green },
                                        { bullet: '3.', text: 'Discard', rest: ' the irrelevant half', color: C.sun },
                                    ].map(item => (
                                        <div key={item.bullet} style={{ display: 'flex', gap: 8, marginBottom: 7, fontSize: 12, lineHeight: 1.5 }}>
                                            <span style={{ color: 'rgba(172,185,165,0.4)', flexShrink: 0 }}>{item.bullet}</span>
                                            <span><strong style={{ color: item.color }}>{item.text}</strong><span style={{ color: C.green }}>{item.rest}</span></span>
                                        </div>
                                    ))}
                                    <div style={{
                                        marginTop: 16, padding: '10px 14px', borderRadius: 10,
                                        background: 'rgba(40,121,153,0.1)', border: '1px solid rgba(40,121,153,0.2)',
                                        fontSize: 11, display: 'flex', gap: 14, color: C.blue, fontWeight: 600,
                                    }}>
                                        <span>⏱ Time: O(log n)</span>
                                        <span>💾 Space: O(1)</span>
                                    </div>
                                    <div style={{
                                        marginTop: 14, display: 'flex', alignItems: 'center', gap: 7,
                                        fontSize: 11, color: 'rgba(172,185,165,0.5)',
                                    }}>
                                        <Zap size={11} color={C.sun} />
                                        <span>Generated by AI · Just now</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ── Stats strip ──────────────────────── */}
            <section style={{ padding: '60px 48px', borderTop: '1px solid rgba(172,185,165,0.07)', borderBottom: '1px solid rgba(172,185,165,0.07)' }}>
                <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
                    {[
                        { value: 10, suffix: 'k+', label: 'Snippets Explained', accent: C.blue },
                        { value: 50, suffix: '+', label: 'Languages Supported', accent: C.green },
                        { value: 3, suffix: 'x', label: 'Faster Code Review', accent: C.sun },
                    ].map((s, i) => (
                        <motion.div key={s.label}
                            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                            transition={{ delay: i * 0.12, duration: 0.6 }}
                            style={{
                                textAlign: 'center', padding: '32px 20px',
                                borderRight: i < 2 ? '1px solid rgba(172,185,165,0.08)' : 'none',
                            }}
                        >
                            <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-2px', color: s.accent, lineHeight: 1 }}>
                                <Counter target={s.value} suffix={s.suffix} />
                            </div>
                            <div style={{ fontSize: 13, color: C.green, marginTop: 8, fontWeight: 500 }}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Features ─────────────────────────── */}
            <section id="features" style={{ padding: '100px 48px' }}>
                <div style={{ maxWidth: 960, margin: '0 auto' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: 64 }}
                    >
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 999,
                            fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                            background: 'rgba(172,185,165,0.08)', border: '1px solid rgba(172,185,165,0.15)',
                            color: C.green, marginBottom: 20,
                        }}>
                            <Shield size={11} /> Everything you need
                        </div>
                        <h2 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900, color: C.bud, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>
                            Built for developers
                            <br />
                            <span style={{ color: C.blue }}>who love to learn</span>
                        </h2>
                        <p style={{ color: C.green, fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
                            Every feature is designed to help you understand code faster, deeper, and more confidently.
                        </p>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
                    </div>
                </div>
            </section>

            {/* ── How it works ─────────────────────── */}
            <section id="how-it-works" style={{ padding: '80px 48px', background: 'rgba(35,44,52,0.4)' }}>
                <div style={{ maxWidth: 860, margin: '0 auto' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: 60 }}
                    >
                        <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 900, color: C.bud, letterSpacing: '-1.5px', marginBottom: 14 }}>
                            Three steps to clarity
                        </h2>
                        <p style={{ color: C.green, fontSize: 15, lineHeight: 1.7 }}>
                            No setup. No config. Just paste, pick, and understand.
                        </p>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                        {[
                            { step: '01', icon: Code2, color: C.blue, title: 'Paste your snippet', desc: 'Copy any piece of code — from a tutorial, a codebase, or Stack Overflow — and paste it into the editor.' },
                            { step: '02', icon: Cpu, color: C.green, title: 'Choose your level', desc: 'Pick Simple for high-level overview, Intermediate for patterns, or Advanced for deep internals and edge cases.' },
                            { step: '03', icon: Zap, color: C.sun, title: 'Get your answer', desc: 'AI generates a structured Markdown explanation, complete with complexity analysis and key concepts highlighted.' },
                        ].map((item, i) => (
                            <motion.div key={item.step}
                                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}
                                style={{ ...glass(), padding: '28px 24px', position: 'relative' }}
                            >
                                <div style={{
                                    position: 'absolute', top: 20, right: 20,
                                    fontSize: 36, fontWeight: 900, color: 'rgba(172,185,165,0.06)', lineHeight: 1,
                                }}>{item.step}</div>
                                <div style={{
                                    width: 42, height: 42, borderRadius: 12, marginBottom: 18,
                                    background: `${item.color}16`, border: `1px solid ${item.color}33`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <item.icon size={19} color={item.color} />
                                </div>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.bud, marginBottom: 10 }}>{item.title}</h3>
                                <p style={{ fontSize: 13, color: C.green, lineHeight: 1.65 }}>{item.desc}</p>
                                {i < 2 && (
                                    <div style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                                        <ChevronRight size={20} color="rgba(172,185,165,0.2)" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Final CTA ────────────────────────── */}
            <section style={{ padding: '100px 48px' }}>
                <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
                    <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div style={{
                            ...glass({ padding: '64px 52px', position: 'relative', overflow: 'hidden' }),
                            boxShadow: '0 32px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(172,185,165,0.1)',
                        }}>
                            {/* Background glow */}
                            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(40,121,153,0.15) 0%, transparent 65%)', pointerEvents: 'none' }} />
                            <div style={{
                                width: 56, height: 56, borderRadius: 18, margin: '0 auto 24px',
                                background: `linear-gradient(135deg, ${C.blue}, ${C.green})`,
                                boxShadow: `0 0 40px rgba(40,121,153,0.5)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Zap size={26} color="#EDEFDF" />
                            </div>
                            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, color: C.bud, letterSpacing: '-1.5px', marginBottom: 16, lineHeight: 1.1 }}>
                                Ready to understand code<br />
                                <span style={{ color: C.blue }}>like never before?</span>
                            </h2>
                            <p style={{ fontSize: 15, color: C.green, marginBottom: 36, lineHeight: 1.7 }}>
                                Join developers who use CodeExplainer to read code faster,
                                learn new languages, and debug smarter.
                            </p>
                            <Link to="/register" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 9,
                                padding: '15px 36px', borderRadius: 14, fontSize: 16, fontWeight: 800,
                                background: `linear-gradient(135deg, ${C.blue} 0%, rgba(40,121,153,0.8) 100%)`,
                                color: C.bud, boxShadow: '0 0 40px rgba(40,121,153,0.55), 0 8px 32px rgba(0,0,0,0.3)',
                                transition: 'all 0.25s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 60px rgba(40,121,153,0.75), 0 12px 40px rgba(0,0,0,0.35)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(40,121,153,0.55), 0 8px 32px rgba(0,0,0,0.3)'}
                            >
                                Start Free — No Credit Card <ArrowRight size={18} />
                            </Link>
                            <p style={{ fontSize: 12, color: 'rgba(172,185,165,0.45)', marginTop: 18 }}>
                                Free forever · No setup required · Instant access
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Footer ───────────────────────────── */}
            <footer style={{
                padding: '32px 48px', borderTop: '1px solid rgba(172,185,165,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, background: `linear-gradient(135deg, ${C.blue}, ${C.green})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={12} color="#EDEFDF" />
                    </div>
                    <span style={{ fontSize: 13, color: C.green }}>CodeExplainer · 2026</span>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                    {['Privacy', 'Terms', 'GitHub'].map(l => (
                        <a key={l} href="#" style={{ fontSize: 12, color: 'rgba(172,185,165,0.45)', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = C.green}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(172,185,165,0.45)'}
                        >{l}</a>
                    ))}
                </div>
            </footer>
        </div>
    );
}
