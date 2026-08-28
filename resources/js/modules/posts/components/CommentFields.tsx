import { MessageSquarePlus, Paperclip, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Switch from '../../../shared/components/Switch';

interface CommentFieldsProps {
    checked: boolean;
    onToggle: (checked: boolean) => void;
    message: string;
    onMessageChange: (value: string) => void;
    attachment: File | null;
    onAttachmentChange: (file: File | null) => void;
    messageError?: string;
    attachmentError?: string;
}

export default function CommentFields({
    checked,
    onToggle,
    message,
    onMessageChange,
    attachment,
    onAttachmentChange,
    messageError,
    attachmentError,
}: CommentFieldsProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!attachment) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(attachment);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [attachment]);

    return (
        <div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-2.5">
                    <MessageSquarePlus size={16} style={{ color: 'var(--color-muted)' }} />
                    <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                            Also comment on this post
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                            Adds a first comment right after publishing.
                        </p>
                    </div>
                </div>
                <Switch checked={checked} onChange={onToggle} />
            </div>

            {checked && (
                <div className="mt-3 space-y-3 p-3 rounded-lg" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        Add a message, an attachment, or both.
                    </p>

                    <div>
                        {preview ? (
                            <div className="relative rounded-lg overflow-hidden w-fit" style={{ border: '1px solid var(--color-border)' }}>
                                <img src={preview} alt="Attachment preview" className="h-20 w-20 object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        onAttachmentChange(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    title="Remove attachment"
                                    className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 rounded"
                                    style={{ background: 'rgba(9,9,15,0.7)', color: 'white' }}
                                >
                                    <X size={11} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-100"
                                style={{ background: 'var(--color-surface)', border: `1px solid ${attachmentError ? 'var(--color-danger)' : 'var(--color-border)'}`, color: 'var(--color-text)' }}
                            >
                                <Paperclip size={13} />
                                Attach an image
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => onAttachmentChange(e.target.files?.[0] ?? null)}
                        />
                        {attachmentError && (
                            <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>
                                {attachmentError}
                            </p>
                        )}
                    </div>

                    <div>
                        <textarea
                            rows={2}
                            value={message}
                            onChange={(e) => onMessageChange(e.target.value)}
                            placeholder="Write a comment…"
                            className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all duration-150 resize-none"
                            style={{
                                background: 'var(--color-surface)',
                                border: `1px solid ${messageError ? 'var(--color-danger)' : 'var(--color-border)'}`,
                                color: 'var(--color-text)',
                            }}
                            onFocus={(e) => {
                                if (!messageError) {
                                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                                    e.currentTarget.style.outline = '1px solid rgba(99,102,241,0.25)';
                                }
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = messageError ? 'var(--color-danger)' : 'var(--color-border)';
                                e.currentTarget.style.outline = 'none';
                            }}
                        />
                        {messageError && (
                            <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>
                                {messageError}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
