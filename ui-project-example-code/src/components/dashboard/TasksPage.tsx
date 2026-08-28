import { useState } from "react";

type Priority = "high" | "medium" | "low";
type Status = "todo" | "in-progress" | "done";

interface Task {
  id: number;
  title: string;
  project: string;
  priority: Priority;
  status: Status;
  assignee: string;
  due: string;
  tags: string[];
}

const initialTasks: Task[] = [
  { id: 1, title: "Migrate auth service to Zod schema validation", project: "Nexus API v3", priority: "high", status: "in-progress", assignee: "R", due: "Nov 5", tags: ["backend", "security"] },
  { id: 2, title: "Design token audit and cleanup", project: "Design System", priority: "medium", status: "todo", assignee: "S", due: "Nov 8", tags: ["design"] },
  { id: 3, title: "Fix mobile overflow on settings panel", project: "Onboarding Redesign", priority: "high", status: "todo", assignee: "L", due: "Oct 31", tags: ["bug", "mobile"] },
  { id: 4, title: "Set up Kafka consumer for event pipeline", project: "Data Pipeline v2", priority: "high", status: "in-progress", assignee: "O", due: "Nov 18", tags: ["infra"] },
  { id: 5, title: "Write Q4 OKR retrospective", project: "Growth Dashboard", priority: "low", status: "done", assignee: "M", due: "Oct 20", tags: ["docs"] },
  { id: 6, title: "Implement cohort retention chart", project: "Growth Dashboard", priority: "medium", status: "todo", assignee: "R", due: "Dec 1", tags: ["analytics"] },
  { id: 7, title: "Accessibility audit: color contrast pass", project: "Onboarding Redesign", priority: "medium", status: "done", assignee: "S", due: "Oct 22", tags: ["a11y"] },
  { id: 8, title: "Add E2E tests for checkout flow", project: "Nexus API v3", priority: "high", status: "todo", assignee: "L", due: "Nov 14", tags: ["testing"] },
  { id: 9, title: "Spike: evaluate Turso for edge DB", project: "Data Pipeline v2", priority: "low", status: "in-progress", assignee: "O", due: "Nov 28", tags: ["research", "infra"] },
];

const cols: { id: Status; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "#6b6b80" },
  { id: "in-progress", label: "In Progress", color: "#f59e0b" },
  { id: "done", label: "Done", color: "#10b981" },
];

const priorityColor: Record<Priority, string> = {
  high: "#f43f5e",
  medium: "#f59e0b",
  low: "#6b6b80",
};

const avatarColors = ["#6366f1", "#22d3ee", "#10b981", "#f59e0b", "#f43f5e"];
const avatarMap: Record<string, number> = { R: 0, S: 4, L: 2, O: 3, M: 1 };

const tagColor: Record<string, string> = {
  backend: "#6366f1", security: "#f43f5e", design: "#f59e0b", bug: "#f43f5e",
  mobile: "#22d3ee", infra: "#10b981", docs: "#6b6b80", analytics: "#6366f1",
  a11y: "#22d3ee", testing: "#10b981", research: "#f59e0b",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<Status | null>(null);
  const [showAdd, setShowAdd] = useState<Status | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const move = (id: number, status: Status) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const addTask = (status: Status) => {
    if (!newTitle.trim()) return;
    const task: Task = {
      id: Date.now(), title: newTitle.trim(), project: "General",
      priority: "medium", status, assignee: "M", due: "TBD", tags: [],
    };
    setTasks((ts) => [...ts, task]);
    setNewTitle("");
    setShowAdd(null);
  };

  const deleteTask = (id: number) => setTasks((ts) => ts.filter((t) => t.id !== id));

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Tasks</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>
            {tasks.filter(t => t.status !== "done").length} open · {tasks.filter(t => t.status === "done").length} completed
          </p>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-4 h-full min-w-max">
          {cols.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            const isOver = over === col.id;
            return (
              <div
                key={col.id}
                className="flex flex-col rounded-xl transition-all duration-150"
                style={{
                  width: "300px",
                  background: isOver ? "rgba(99,102,241,0.04)" : "var(--color-surface)",
                  border: `1px solid ${isOver ? "var(--color-primary)" : "var(--color-border)"}`,
                }}
                onDragOver={(e) => { e.preventDefault(); setOver(col.id); }}
                onDragLeave={() => setOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragging !== null) move(dragging, col.id);
                  setDragging(null);
                  setOver(null);
                }}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-4 py-3.5 flex-shrink-0" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                    <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>{col.label}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded font-medium"
                      style={{ background: "var(--color-surface-2)", color: "var(--color-muted)" }}
                    >
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAdd(col.id)}
                    className="w-6 h-6 flex items-center justify-center rounded transition-colors"
                    style={{ color: "var(--color-muted)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)"; (e.currentTarget as HTMLElement).style.color = "var(--color-text)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--color-muted)"; }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Tasks */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                  {showAdd === col.id && (
                    <div className="rounded-lg p-3" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
                      <input
                        autoFocus
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") addTask(col.id); if (e.key === "Escape") setShowAdd(null); }}
                        placeholder="Task title..."
                        className="w-full bg-transparent text-sm outline-none mb-2"
                        style={{ color: "var(--color-text)" }}
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => addTask(col.id)}
                          className="flex-1 py-1 rounded text-xs font-medium"
                          style={{ background: "var(--color-primary)", color: "white" }}
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setShowAdd(null)}
                          className="flex-1 py-1 rounded text-xs"
                          style={{ background: "var(--color-surface)", color: "var(--color-muted)" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDragging(task.id)}
                      onDragEnd={() => { setDragging(null); setOver(null); }}
                      className="rounded-lg p-3.5 cursor-grab active:cursor-grabbing group transition-all duration-100"
                      style={{
                        background: dragging === task.id ? "rgba(99,102,241,0.08)" : "var(--color-bg)",
                        border: `1px solid ${dragging === task.id ? "var(--color-primary)" : "var(--color-border)"}`,
                        opacity: dragging === task.id ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => { if (dragging !== task.id) (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-hover)"; }}
                      onMouseLeave={(e) => { if (dragging !== task.id) (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)"; }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-xs leading-snug font-medium flex-1" style={{ color: "var(--color-text)" }}>
                          {task.title}
                        </p>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          style={{ color: "var(--color-muted)" }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>

                      <p className="text-[11px] mb-2.5" style={{ color: "var(--color-muted)" }}>{task.project}</p>

                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                              style={{ background: `${tagColor[tag] ?? "#6366f1"}18`, color: tagColor[tag] ?? "#6366f1" }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                            style={{
                              background: avatarColors[avatarMap[task.assignee] ?? 0],
                              color: "white",
                            }}
                          >
                            {task.assignee}
                          </div>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide"
                            style={{ color: priorityColor[task.priority], background: `${priorityColor[task.priority]}15` }}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>{task.due}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
