import { json } from '@codemirror/lang-json';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { useMemo } from 'react';

interface JsonEditorProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    height?: string;
}

/**
 * A syntax-highlighted, virtualized JSON editor (CodeMirror 6) — swapped in for a plain
 * <textarea> because a huge template `config` (hundreds of fields) made a controlled textarea
 * noticeably laggy on every keystroke, with no bracket-matching/line-numbers/folding to help
 * navigate it. CodeMirror only renders the visible viewport regardless of document size, so
 * typing stays smooth no matter how large the JSON gets.
 *
 * Colors are pulled entirely from the app's existing `--color-*` custom properties (see
 * resources/css/app.css) instead of a fixed light/dark theme package, so highlighting follows
 * the user's current theme automatically — no separate dark/light CodeMirror theme to keep in
 * sync.
 */
export default function JsonEditor({ value, onChange, error, height = '640px' }: JsonEditorProps) {
    const theme = useMemo(
        () => [
            EditorView.theme({
                '&': {
                    backgroundColor: 'var(--color-surface-2)',
                    color: 'var(--color-text)',
                    fontSize: '12px',
                },
                '.cm-content': {
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                    caretColor: 'var(--color-text)',
                },
                '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--color-text)' },
                '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': { backgroundColor: 'var(--color-primary-dim)' },
                '.cm-activeLine': { backgroundColor: 'var(--color-border-hover)' },
                '.cm-activeLineGutter': { backgroundColor: 'var(--color-border-hover)' },
                '.cm-gutters': {
                    backgroundColor: 'var(--color-surface-2)',
                    color: 'var(--color-muted)',
                    border: 'none',
                },
                '.cm-scroller': { overflow: 'auto' },
                '&.cm-focused': { outline: 'none' },
            }),
            syntaxHighlighting(
                HighlightStyle.define([
                    { tag: t.propertyName, color: 'var(--color-primary)' },
                    { tag: t.string, color: 'var(--color-success)' },
                    { tag: t.number, color: 'var(--color-warning)' },
                    { tag: [t.bool, t.null, t.keyword], color: 'var(--color-accent)' },
                    { tag: [t.punctuation, t.bracket, t.separator], color: 'var(--color-muted)' },
                ]),
            ),
        ],
        [],
    );

    return (
        <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}` }}>
            <CodeMirror
                value={value}
                onChange={onChange}
                height={height}
                extensions={[json()]}
                theme={theme}
                basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    highlightActiveLine: true,
                    autocompletion: true,
                }}
            />
        </div>
    );
}
