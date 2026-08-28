import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
  color?: string;
}

interface MultiLabelDropdownProps {
  options: Option[];
  selected: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
  label?: string;
}

export default function MultiLabelDropdown({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  label,
}: MultiLabelDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
  };

  const removeTag = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((v) => v !== val));
  };

  const selectedOptions = options.filter((o) => selected.includes(o.value));

  return (
    <div className="relative" ref={ref}>
      {label && (
        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-muted)" }}>
          {label}
        </label>
      )}
      <div
        onClick={() => setOpen(!open)}
        className="flex flex-wrap gap-1.5 min-h-10 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150"
        style={{
          background: "var(--color-surface-2)",
          border: `1px solid ${open ? "var(--color-primary)" : "var(--color-border)"}`,
          outline: open ? "1px solid rgba(99,102,241,0.25)" : "none",
        }}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-sm self-center" style={{ color: "var(--color-muted)" }}>
            {placeholder}
          </span>
        ) : (
          selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
              style={{
                background: opt.color ? `${opt.color}20` : "var(--color-primary-dim)",
                color: opt.color ?? "var(--color-primary)",
                border: `1px solid ${opt.color ? `${opt.color}40` : "rgba(99,102,241,0.3)"}`,
              }}
            >
              {opt.label}
              <button
                onClick={(e) => removeTag(opt.value, e)}
                className="hover:opacity-70 transition-opacity leading-none"
              >
                ×
              </button>
            </span>
          ))
        )}
        <span
          className="ml-auto self-center transition-transform duration-200"
          style={{
            color: "var(--color-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {open && (
        <div
          className="absolute z-50 w-full mt-1.5 rounded-lg overflow-hidden shadow-2xl"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-hover)",
          }}
        >
          <div className="p-1">
            {options.map((opt) => {
              const isSelected = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggle(opt.value)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm transition-colors duration-100"
                  style={{
                    background: isSelected ? "var(--color-primary-dim)" : "transparent",
                    color: isSelected ? "var(--color-primary)" : "var(--color-text)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <span
                    className="flex items-center justify-center w-4 h-4 rounded flex-shrink-0 transition-all"
                    style={{
                      background: isSelected ? "var(--color-primary)" : "transparent",
                      border: `1.5px solid ${isSelected ? "var(--color-primary)" : "var(--color-border-hover)"}`,
                    }}
                  >
                    {isSelected && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3l2.5 2.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: opt.color ?? "var(--color-primary)" }}
                  />
                  {opt.label}
                </button>
              );
            })}
          </div>
          {selected.length > 0 && (
            <div style={{ borderTop: "1px solid var(--color-border)" }} className="p-2">
              <button
                onClick={() => onChange([])}
                className="w-full text-xs py-1 rounded transition-colors duration-100"
                style={{ color: "var(--color-muted)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-danger)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-muted)")}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
