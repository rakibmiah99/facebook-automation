import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import FormField, { PasswordField } from '../../../shared/components/FormField';
import { useToast } from '../../../shared/components/Toast';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

export default function Login() {
    const { toast } = useToast();
    const form = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('login.store'), {
            onFinish: () => form.reset('password'),
        });
    };

    return (
        <>
            <Head title="Sign in" />

            <div className="min-h-full flex" style={{ background: 'var(--color-bg)' }}>
                {/* Left panel */}
                <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10" style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}>
                    <div className="flex items-center gap-2.5">
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

                    <div>
                        <blockquote className="text-xl font-medium leading-relaxed mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                            "Nexus gave our team a single source of truth. Delivery velocity went up 40% in the first quarter."
                        </blockquote>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: 'var(--color-primary)', color: 'white' }}>
                                A
                            </div>
                            <div>
                                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                    Aisha Nakamura
                                </p>
                                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                    VP of Engineering, Helix Co.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {['48k', '99.9%', '4.9★'].map((stat, i) => (
                            <div key={i}>
                                <p className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>
                                    {stat}
                                </p>
                                <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                                    {['Active users', 'Uptime SLA', 'User rating'][i]}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right panel */}
                <div className="flex flex-1 items-center justify-center p-6">
                    <div className="w-full max-w-sm">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                                Welcome back
                            </h1>
                            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                                Sign in to your Nexus account
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <FormField
                                label="Email address"
                                id="email"
                                type="email"
                                autoComplete="username"
                                value={form.data.email}
                                onChange={(v) => form.setData('email', v)}
                                error={form.errors.email}
                                placeholder="you@company.com"
                            />

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password" className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => toast('Password reset is coming soon.', 'info')}
                                        className="text-xs"
                                        style={{ color: 'var(--color-primary)' }}
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <PasswordField
                                    label=""
                                    id="password"
                                    autoComplete="current-password"
                                    value={form.data.password}
                                    onChange={(v) => form.setData('password', v)}
                                    error={form.errors.password}
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
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
                                {form.processing ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>

                        <div className="mt-4 flex items-center gap-3">
                            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                                or
                            </span>
                            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                        </div>

                        <button
                            type="button"
                            onClick={() => toast('Google sign-in is coming soon.', 'info')}
                            className="mt-4 w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2.5 transition-all duration-150"
                            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-hover)')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)')}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.7 3.7 0 01-1.6 2.42v2h2.58c1.5-1.39 2.4-3.43 2.4-5.88z" fill="#4285F4" />
                                <path d="M8 16c2.16 0 3.97-.71 5.3-1.94l-2.58-2c-.72.48-1.63.76-2.72.76-2.09 0-3.86-1.41-4.5-3.3H.83v2.07A8 8 0 008 16z" fill="#34A853" />
                                <path d="M3.5 9.52A4.83 4.83 0 013.24 8c0-.53.09-1.04.26-1.52V4.41H.83A8 8 0 000 8c0 1.29.31 2.5.83 3.59l2.67-2.07z" fill="#FBBC05" />
                                <path d="M8 3.18c1.18 0 2.24.41 3.07 1.2l2.3-2.3A8 8 0 00.83 4.41L3.5 6.48C4.14 4.59 5.91 3.18 8 3.18z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-muted)' }}>
                            Don't have an account?{' '}
                            <Link href={route('register')} className="font-medium transition-colors" style={{ color: 'var(--color-primary)' }}>
                                Sign up free
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
