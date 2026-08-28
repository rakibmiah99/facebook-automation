import { useState, useEffect, useLayoutEffect } from "react";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import DashboardPage from "./components/dashboard/DashboardPage";
import AnalyticsPage from "./components/dashboard/AnalyticsPage";
import ProjectsPage from "./components/dashboard/ProjectsPage";
import TasksPage from "./components/dashboard/TasksPage";
import TeamPage from "./components/dashboard/TeamPage";
import SettingsPage from "./components/dashboard/SettingsPage";
import ReportsPage from "./components/dashboard/ReportsPage";
import CommandPalette from "./components/ui/CommandPalette";
import { ToastProvider, useToast } from "./components/ui/Toast";

type Page = "login" | "register" | "app";

interface User {
  name: string;
  email: string;
  avatar: string;
}

function AppShell() {
  const [page, setPage] = useState<Page>("login");
  const [user, setUser] = useState<User | null>(null);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("nexus-theme");
    return stored ? stored === "dark" : true;
  });
  const { toast } = useToast();

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("nexus-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => {
    document.documentElement.classList.add("theme-transitioning");
    setTimeout(() => document.documentElement.classList.remove("theme-transitioning"), 250);
    setIsDark((d) => !d);
    toast(isDark ? "Switched to light mode" : "Switched to dark mode", "info");
  };

  const handleLogin = (u: User) => {
    setUser(u);
    setPage("app");
    setTimeout(() => toast(`Welcome back, ${u.name.split(" ")[0]}!`, "success"), 300);
  };

  const handleLogout = () => {
    setUser(null);
    setPage("login");
  };

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (page === "app") setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [page]);

  if (page === "login") {
    return <Login onLogin={handleLogin} onGoRegister={() => setPage("register")} />;
  }

  if (page === "register") {
    return <Register onRegister={handleLogin} onGoLogin={() => setPage("login")} />;
  }

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar
        active={activeNav}
        onNav={setActiveNav}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar
          user={user!}
          onLogout={handleLogout}
          onOpenSearch={() => setCmdOpen(true)}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
        <main className="flex-1 overflow-hidden flex flex-col">
          {activeNav === "dashboard" && <DashboardPage />}
          {activeNav === "analytics" && <AnalyticsPage />}
          {activeNav === "projects" && <ProjectsPage />}
          {activeNav === "tasks" && <TasksPage />}
          {activeNav === "team" && <TeamPage />}
          {activeNav === "settings" && <SettingsPage />}
          {activeNav === "reports" && <ReportsPage />}
        </main>
      </div>

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onNav={(p) => { setActiveNav(p); setCmdOpen(false); }}
        onLogout={handleLogout}
        onToggleTheme={toggleTheme}
        toast={toast}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
