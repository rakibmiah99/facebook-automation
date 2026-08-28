import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children?: ReactNode;
    maxWidth?: string;
}

export default function Modal({ open, onClose, title, description, children, maxWidth = '440px' }: ModalProps) {
    useEffect(() => {
        if (!open) return;
        const handle = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
        >
            <div
                className="w-full rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-hover)', maxWidth }}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className="flex items-start justify-between gap-4 px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <div>
                            <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                                {title}
                            </h2>
                            {description && (
                                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                                    {description}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-100"
                            style={{ color: 'var(--color-muted)' }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}
