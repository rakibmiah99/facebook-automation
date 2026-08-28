import { TriangleAlert } from 'lucide-react';
import Modal from './Modal';

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    processing?: boolean;
    danger?: boolean;
}

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    processing = false,
    danger = true,
}: ConfirmDialogProps) {
    return (
        <Modal open={open} onClose={onClose} maxWidth="380px">
            <div className="flex flex-col items-center text-center gap-3">
                <div
                    className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{ background: danger ? 'rgba(244,63,94,0.12)' : 'var(--color-primary-dim)' }}
                >
                    <TriangleAlert size={20} style={{ color: danger ? 'var(--color-danger)' : 'var(--color-primary)' }} />
                </div>
                <div>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                        {title}
                    </h3>
                    {description && (
                        <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex gap-2 w-full mt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
                        style={{ background: danger ? 'var(--color-danger)' : 'var(--color-primary)', color: 'white', opacity: processing ? 0.6 : 1 }}
                    >
                        {processing ? 'Please wait…' : confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
