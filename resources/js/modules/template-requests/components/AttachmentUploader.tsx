import { File as FileIcon, Upload, X } from 'lucide-react';
import { useRef } from 'react';

interface AttachmentUploaderProps {
    files: File[];
    onChange: (files: File[]) => void;
    error?: string;
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentUploader({ files, onChange, error }: AttachmentUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const addFiles = (incoming: FileList | null) => {
        if (!incoming) return;
        onChange([...files, ...Array.from(incoming)]);
    };

    const removeAt = (index: number) => {
        onChange(files.filter((_, i) => i !== index));
    };

    return (
        <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                Reference files (logos, brand images, sample designs, etc.)
            </label>

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    addFiles(e.dataTransfer.files);
                }}
                className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-lg transition-colors duration-150"
                style={{
                    background: 'var(--color-surface-2)',
                    border: `1.5px dashed ${error ? 'var(--color-danger)' : 'var(--color-border-hover)'}`,
                }}
            >
                <Upload size={20} style={{ color: 'var(--color-muted)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    Click to upload or drag & drop
                </span>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    Multiple images, PDFs — up to 15MB each
                </span>
            </button>
            <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = '';
                }}
            />
            {error && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>
                    {error}
                </p>
            )}

            {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                    {files.map((file, index) => (
                        <li
                            key={`${file.name}-${index}`}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                        >
                            {file.type.startsWith('image/') ? (
                                <img src={URL.createObjectURL(file)} alt={file.name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                            ) : (
                                <FileIcon size={16} style={{ color: 'var(--color-muted)' }} />
                            )}
                            <span className="flex-1 text-xs truncate" style={{ color: 'var(--color-text)' }}>
                                {file.name}
                            </span>
                            <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-muted)' }}>
                                {formatSize(file.size)}
                            </span>
                            <button
                                type="button"
                                onClick={() => removeAt(index)}
                                className="flex-shrink-0"
                                style={{ color: 'var(--color-muted)' }}
                            >
                                <X size={14} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
