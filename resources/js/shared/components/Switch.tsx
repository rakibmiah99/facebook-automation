interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
}

export default function Switch({ checked, onChange, label }: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className="flex items-center gap-2.5"
        >
            <span
                className="relative inline-flex flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-150"
                style={{ background: checked ? 'var(--color-primary)' : 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
            >
                <span
                    className="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform duration-150"
                    style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
                />
            </span>
            {label && (
                <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                    {label}
                </span>
            )}
        </button>
    );
}
