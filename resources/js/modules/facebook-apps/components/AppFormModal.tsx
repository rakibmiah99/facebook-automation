import {useForm} from '@inertiajs/react';
import {route} from 'ziggy-js';
import FormField, {PasswordField} from '../../../shared/components/FormField';
import Modal from '../../../shared/components/Modal';
import Switch from '../../../shared/components/Switch';
import type {FacebookApp} from '../types/facebook-app';

interface AppFormModalProps {
    open: boolean,
    onClose: () => void,
    app: FacebookApp | null,
    key?: number | string
}

interface AppForm {
    app_name: string;
    app_id: string;
    app_secret: string;
    app_token: string;
    status: boolean;
}

export default function AppFormModal({open, onClose, app, key}: AppFormModalProps) {
    const isEdit = Boolean(app);
    const form = useForm<AppForm>({
        app_name: app?.app_name ?? '',
        app_id: app?.app_id ?? '',
        app_secret: '',
        app_token: '',
        status: app?.status ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const onSuccess = () => {
            form.reset();
            onClose();
        };

        if (isEdit && app) {
            form.post(route('facebook-apps.update', {facebookApp: app.id}), {onSuccess, preserveScroll: true});
        } else {
            form.post(route('facebook-apps.store'), {onSuccess, preserveScroll: true});
        }
    };

    const handleClose = () => {
        form.reset();
        form.clearErrors();
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEdit ? 'Edit Facebook App' : 'Add Facebook App'}
            description={isEdit ? 'Update this app’s credentials and settings.' : 'Connect a new Facebook app to your account.'}
            maxWidth="460px"
        >
            <form onSubmit={submit} className="space-y-4">
                <FormField label="App name" id="app_name" value={form.data.app_name}
                           onChange={(v) => form.setData('app_name', v)} error={form.errors.app_name}
                           placeholder="My Marketing App"/>
                <FormField label="App ID" id="app_id" value={form.data.app_id}
                           onChange={(v) => form.setData('app_id', v)} error={form.errors.app_id}
                           placeholder="1234567890123456"/>
                <PasswordField
                    label={isEdit ? 'App secret (leave blank to keep unchanged)' : 'App secret'}
                    id="app_secret"
                    value={form.data.app_secret}
                    onChange={(v) => form.setData('app_secret', v)}
                    error={form.errors.app_secret}
                    placeholder={isEdit ? '••••••••' : 'App secret from Meta developer console'}
                />
                <PasswordField
                    label={isEdit ? 'Access token (leave blank to keep unchanged)' : 'Access token'}
                    id="app_token"
                    value={form.data.app_token}
                    onChange={(v) => form.setData('app_token', v)}
                    error={form.errors.app_token}
                    placeholder={isEdit ? '••••••••' : 'Long-lived access token'}
                />

                <div className="flex items-center justify-between p-3 rounded-lg"
                     style={{background: 'var(--color-surface-2)', border: '1px solid var(--color-border)'}}>
                    <div>
                        <p className="text-sm font-medium" style={{color: 'var(--color-text)'}}>
                            Active
                        </p>
                        <p className="text-xs mt-0.5" style={{color: 'var(--color-muted)'}}>
                            Inactive apps are excluded from automation.
                        </p>
                    </div>
                    <Switch checked={form.data.status} onChange={(v) => form.setData('status', v)}/>
                </div>

                <div className="flex gap-2 pt-1">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                        style={{
                            background: 'var(--color-surface-2)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text)'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
                        style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                            fontFamily: 'var(--font-display)',
                            opacity: form.processing ? 0.6 : 1
                        }}
                    >
                        {form.processing ? 'Saving…' : isEdit ? 'Save changes' : 'Create app'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
