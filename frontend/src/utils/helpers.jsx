import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...classes) {
    return twMerge(clsx(classes));
}

/** Language → colored badge label */
export const LANGUAGE_COLORS = {
    python: '#287999',
    javascript: '#F0C968',
    typescript: '#287999',
    java: '#ACB9A5',
    cpp: '#F0C968',
    c: '#ACB9A5',
    csharp: '#287999',
    go: '#ACB9A5',
    rust: '#F0C968',
    php: '#ACB9A5',
    ruby: '#F0C968',
    swift: '#287999',
    kotlin: '#ACB9A5',
    sql: '#F0C968',
    html: '#ACB9A5',
    css: '#287999',
    bash: '#ACB9A5',
    other: '#EDEFDF',
};

export function LanguageBadge({ language }) {
    const color = LANGUAGE_COLORS[language] ?? '#EDEFDF';
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider"
            style={{
                background: `${color}18`,
                border: `1px solid ${color}40`,
                color,
            }}
        >
            <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: color }}
            />
            {language}
        </span>
    );
}
