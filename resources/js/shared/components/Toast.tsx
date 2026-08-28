import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastEntry {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastCtx {
    toast: (message: string, type?: ToastType, duration?: number) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
    return useContext(Ctx);
}

const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle2 size={14} color="#10b981" />,
    error: <XCircle size={14} color="#f43f5e" />,
    warning: <AlertTriangle size={14} color="#f59e0b" />,
    info: <Info size={14} color="#6366f1" />,
};

const barColor: Record<ToastType, string> = {
    success: '#10b981',
    error: '#f43f5e',
    warning: '#f59e0b',
    info: '#6366f1',
};

function ToastItem({ toast, onRemove }: { toast: ToastEntry; onRemove: (id: string) => void }) {
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(100);
    const dur = toast.duration ?? 3500;

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        const start = performance.now();
        const interval = setInterval(() => {
            const elapsed = performance.now() - start;
            setProgress(Math.max(0, 100 - (elapsed / dur) * 100));
        }, 30);
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onRemove(toast.id), 300);
        }, dur);
        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            className="relative overflow-hidden rounded-xl shadow-2xl flex items-start gap-3 pr-8"
            style={{
                padding: '12px 14px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border-hover)',
                minWidth: '280px',
                maxWidth: '360px',
                transform: visible ? 'translateX(0)' : 'translateX(120%)',
                opacity: visible ? 1 : 0,
                transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
            }}
        >
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            <p className="text-sm leading-snug" style={{ color: 'var(--color-text)' }}>
                {toast.message}
            </p>
            <button
                onClick={() => {
                    setVisible(false);
                    setTimeout(() => onRemove(toast.id), 300);
                }}
                className="absolute top-3 right-3 transition-opacity hover:opacity-60"
                style={{ color: 'var(--color-muted)' }}
            >
                <X size={12} />
            </button>
            <div
                className="absolute bottom-0 left-0 h-0.5 rounded-b-xl transition-none"
                style={{ width: `${progress}%`, background: barColor[toast.type] }}
            />
        </div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastEntry[]>([]);

    const toast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const remove = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <Ctx.Provider value={{ toast }}>
            {children}
            <div
                className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end"
                style={{ pointerEvents: toasts.length ? 'auto' : 'none' }}
            >
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onRemove={remove} />
                ))}
            </div>
        </Ctx.Provider>
    );
}
