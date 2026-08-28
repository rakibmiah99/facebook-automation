import { Eye, EyeOff } from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface FormFieldProps {
    label: string;
    id: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    suffix?: ReactNode;
    autoComplete?: string;
}

export default function FormField({ label, id, type = 'text', value, onChange, error, placeholder, suffix, autoComplete }: FormFieldProps) {
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    name={id}
                    type={type}
                    value={value}
                    autoComplete={autoComplete}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all duration-150"
                    style={{
                        background: 'var(--color-surface-2)',
                        border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
                        color: 'var(--color-text)',
                        paddingRight: suffix ? '44px' : undefined,
                    }}
                    onFocus={(e) => {
                        if (!error) {
                            e.currentTarget.style.borderColor = 'var(--color-primary)';
                            e.currentTarget.style.outline = '1px solid rgba(99,102,241,0.25)';
                        }
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border)';
                        e.currentTarget.style.outline = 'none';
                    }}
                />
                {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
            </div>
            {error && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>
                    {error}
                </p>
            )}
        </div>
    );
}

interface PasswordFieldProps {
    label: string;
    id: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    autoComplete?: string;
}

export function PasswordField({ label, id, value, onChange, error, placeholder, autoComplete }: PasswordFieldProps) {
    const [show, setShow] = useState(false);

    return (
        <FormField
            label={label}
            id={id}
            type={show ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            error={error}
            placeholder={placeholder}
            autoComplete={autoComplete}
            suffix={
                <button type="button" onClick={() => setShow((s) => !s)} style={{ color: 'var(--color-muted)' }} tabIndex={-1}>
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
            }
        />
    );
}
