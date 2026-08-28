import { useEffect, useState, createContext, useContext, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastCtx {
  toast: (msg: string, type?: ToastType, duration?: number) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(Ctx);
}

const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="#10b981" strokeWidth="1.3" />
      <path d="M4 7l2 2 4-4" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="#f43f5e" strokeWidth="1.3" />
      <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="#f43f5e" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2L13 12H1L7 2z" stroke="#f59e0b" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M7 6v3M7 10.5v.5" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="#6366f1" strokeWidth="1.3" />
      <path d="M7 6v4M7 4v.5" stroke="#6366f1" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
};

const barColor: Record<ToastType, string> = {
  success: "#10b981",
  error: "#f43f5e",
  warning: "#f59e0b",
  info: "#6366f1",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const dur = toast.duration ?? 3500;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.max(0, 100 - (elapsed / dur) * 100));
    }, 30);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, dur);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-xl shadow-2xl flex items-start gap-3 pr-8"
      style={{
        padding: "12px 14px",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border-hover)",
        minWidth: "280px",
        maxWidth: "360px",
        transform: visible ? "translateX(0)" : "translateX(120%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
      }}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <p className="text-sm leading-snug" style={{ color: "var(--color-text)" }}>{toast.message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300); }}
        className="absolute top-3 right-3 transition-opacity hover:opacity-60"
        style={{ color: "var(--color-muted)" }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      <div
        className="absolute bottom-0 left-0 h-0.5 rounded-b-xl transition-none"
        style={{ width: `${progress}%`, background: barColor[toast.type] }}
      />
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info", duration?: number) => {
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
        style={{ pointerEvents: toasts.length ? "auto" : "none" }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>
    </Ctx.Provider>
  );
}
