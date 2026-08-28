import { Head, Link, useForm } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import FormField, { PasswordField } from '../../../shared/components/FormField';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    company: string;
    role: string;
}

const roles = ['Engineer', 'Designer', 'Product Manager', 'Team Lead', 'Founder', 'Other'];

const STEP1_FIELDS: (keyof RegisterForm)[] = ['name', 'email', 'password', 'password_confirmation'];

export default function Register() {
    const [step, setStep] = useState(1);
    const [localErrors, setLocalErrors] = useState<Partial<Record<keyof RegisterForm, string>>>({});
    const form = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        company: '',
        role: '',
    });

    const update = (field: keyof RegisterForm, value: string) => {
        form.setData(field, value);
        form.clearErrors(field);
        setLocalErrors((e) => ({ ...e, [field]: undefined }));
    };

    const validateStep1 = () => {
        const errs: Partial<Record<keyof RegisterForm, string>> = {};
        if (!form.data.name.trim()) errs.name = 'Full name is required';
        if (!form.data.email || !/\S+@\S+\.\S+/.test(form.data.email)) errs.email = 'Valid email required';
        if (form.data.password.length < 8) errs.password = 'Minimum 8 characters';
        if (form.data.password !== form.data.password_confirmation) errs.password_confirmation = 'Passwords do not match';
        return errs;
    };

    const handleStep1 = (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validateStep1();
        if (Object.keys(errs).length) {
            setLocalErrors(errs);
            return;
        }
        setLocalErrors({});
        setStep(2);
    };

    const handleStep2 = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.data.role) {
            setLocalErrors({ role: 'Please select a role' });
            return;
        }
        form.post(route('register.store'), {
            onError: (errors) => {
                if (STEP1_FIELDS.some((f) => errors[f])) setStep(1);
            },
        });
    };

    const error = (field: keyof RegisterForm) => localErrors[field] ?? form.errors[field];

    const strength = (() => {
        const password = form.data.password;
        if (!password) return 0;
        let s = 0;
        if (password.length >= 8) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        return s;
    })();

    const strengthColor = ['', '#f43f5e', '#f59e0b', '#10b981', '#6366f1'][strength];
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];

    return (
        <>
            <Head title="Create account" />

            <div className="min-h-full flex items-center justify-center p-6" style={{ background: 'var(--color-bg)' }}>
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="flex items-center gap-2 justify-center mb-8">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" />
                                <rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.6" />
                                <rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.6" />
                                <rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" />
                            </svg>
                        </div>
                        <span className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                            Nexus
                        </span>
                    </div>

                    {/* Steps */}
                    <div className="flex items-center gap-2 mb-6">
                        {[1, 2].map((s) => (
                            <div key={s} className="flex items-center gap-2 flex-1">
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all"
                                    style={{
                                        background: step >= s ? 'var(--color-primary)' : 'var(--color-surface-2)',
                                        color: step >= s ? 'white' : 'var(--color-muted)',
                                    }}
                                >
                                    {step > s ? '✓' : s}
                                </div>
                                <span className="text-xs" style={{ color: step >= s ? 'var(--color-text)' : 'var(--color-muted)' }}>
                                    {s === 1 ? 'Account' : 'Profile'}
                                </span>
                                {s < 2 && <div className="flex-1 h-px" style={{ background: step > 1 ? 'var(--color-primary)' : 'var(--color-border)' }} />}
                            </div>
                        ))}
                    </div>

                    <div className="rounded-2xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        {step === 1 ? (
                            <>
                                <h1 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                                    Create your account
                                </h1>
                                <p className="text-sm mb-5" style={{ color: 'var(--color-muted)' }}>
                                    Free forever. No credit card required.
                                </p>

                                <form onSubmit={handleStep1} className="space-y-4">
                                    <FormField label="Full name" id="name" value={form.data.name} onChange={(v) => update('name', v)} error={error('name')} placeholder="Alex Johnson" />
                                    <FormField
                                        label="Work email"
                                        id="email"
                                        type="email"
                                        autoComplete="username"
                                        value={form.data.email}
                                        onChange={(v) => update('email', v)}
                                        error={error('email')}
                                        placeholder="alex@company.com"
                                    />
                                    <div>
                                        <PasswordField
                                            label="Password"
                                            id="password"
                                            autoComplete="new-password"
                                            value={form.data.password}
                                            onChange={(v) => update('password', v)}
                                            error={error('password')}
                                            placeholder="Min. 8 characters"
                                        />
                                        {form.data.password && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="flex gap-1 flex-1">
                                                    {[1, 2, 3, 4].map((i) => (
                                                        <div
                                                            key={i}
                                                            className="h-1 flex-1 rounded-full transition-all"
                                                            style={{ background: i <= strength ? strengthColor : 'var(--color-surface-2)' }}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[11px] font-medium" style={{ color: strengthColor }}>
                                                    {strengthLabel}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <PasswordField
                                        label="Confirm password"
                                        id="password_confirmation"
                                        autoComplete="new-password"
                                        value={form.data.password_confirmation}
                                        onChange={(v) => update('password_confirmation', v)}
                                        error={error('password_confirmation')}
                                        placeholder="••••••••"
                                    />

                                    <button
                                        type="submit"
                                        className="w-full py-2.5 rounded-lg text-sm font-semibold mt-2 transition-opacity"
                                        style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'var(--font-display)' }}
                                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.88')}
                                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                                    >
                                        Continue →
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                <h1 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                                    Tell us about yourself
                                </h1>
                                <p className="text-sm mb-5" style={{ color: 'var(--color-muted)' }}>
                                    Help us personalize your experience.
                                </p>

                                <form onSubmit={handleStep2} className="space-y-4">
                                    <FormField label="Company (optional)" id="company" value={form.data.company} onChange={(v) => update('company', v)} placeholder="Acme Inc." />
                                    <div>
                                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                            Your role
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {roles.map((r) => {
                                                const sel = form.data.role === r;
                                                return (
                                                    <button
                                                        key={r}
                                                        type="button"
                                                        onClick={() => update('role', r)}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                                                        style={{
                                                            background: sel ? 'var(--color-primary)' : 'var(--color-surface-2)',
                                                            color: sel ? 'white' : 'var(--color-muted)',
                                                            border: `1px solid ${sel ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                                        }}
                                                    >
                                                        {r}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {error('role') && (
                                            <p className="text-xs mt-1.5" style={{ color: 'var(--color-danger)' }}>
                                                {error('role')}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                                        <Info size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                                        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                                            By creating an account, you agree to our <span style={{ color: 'var(--color-primary)' }}>Terms of Service</span> and{' '}
                                            <span style={{ color: 'var(--color-primary)' }}>Privacy Policy</span>.
                                        </p>
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                                            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={form.processing}
                                            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
                                            style={{
                                                background: form.processing ? 'rgba(99,102,241,0.5)' : 'var(--color-primary)',
                                                color: 'white',
                                                fontFamily: 'var(--font-display)',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!form.processing) (e.currentTarget as HTMLElement).style.opacity = '0.88';
                                            }}
                                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                                        >
                                            {form.processing ? 'Creating account...' : 'Create account'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>

                    <p className="text-center text-sm mt-4" style={{ color: 'var(--color-muted)' }}>
                        Already have an account?{' '}
                        <Link href={route('login')} className="font-medium" style={{ color: 'var(--color-primary)' }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
