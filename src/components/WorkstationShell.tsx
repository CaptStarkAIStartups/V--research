"use client";

import { ReactNode, useState } from "react";
import {
  Activity,
  Beaker,
  BookOpen,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  FolderOpen,
  FlaskConical,
  Home,
  Menu,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  Wrench,
  X,
} from "lucide-react";

type NavItem = {
  label: string;
  icon: ReactNode;
  href: string;
};

const navigation: NavItem[] = [
  { label: "Command Center", icon: <Home size={19} />, href: "/" },
  { label: "Research Explorer", icon: <FlaskConical size={19} />, href: "/research" },
  { label: "Research Articles", icon: <BookOpen size={19} />, href: "/articles" },
  { label: "Dataset Manager", icon: <Database size={19} />, href: "/datasets" },
  { label: "Knowledge & Notes", icon: <FileText size={19} />, href: "/notes" },
  { label: "Files & Folders", icon: <FolderOpen size={19} />, href: "/files" },
  { label: "AI Lab", icon: <BrainCircuit size={19} />, href: "/ai" },
  { label: "Research Tools", icon: <Wrench size={19} />, href: "/tools" },
  { label: "Activity", icon: <Activity size={19} />, href: "/activity" },
  { label: "Settings", icon: <Settings size={19} />, href: "/settings" },
];

export default function WorkstationShell({
  children,
  activePath = "/",
}: {
  children: ReactNode;
  activePath?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  function navigate(href: string) {
    window.location.href = href;
  }

  return (
    <div className={dark ? "vr-app vr-dark" : "vr-app vr-light"}>
      <aside
        className={`vr-sidebar ${
          collapsed ? "vr-sidebar-collapsed" : ""
        } ${mobileOpen ? "vr-sidebar-mobile-open" : ""}`}
      >
        <div className="vr-brand">
          <div className="vr-brand-icon">
            <Beaker size={23} />
          </div>

          {!collapsed && (
            <div className="vr-brand-text">
              <strong>V Research</strong>
              <span>Research Workstation</span>
            </div>
          )}

          <button
            className="vr-icon-button vr-mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>

        <div className="vr-sidebar-section">
          {!collapsed && (
            <div className="vr-section-label">WORKSPACE</div>
          )}

          <nav className="vr-navigation">
            {navigation.map((item) => {
              const active =
                item.href === activePath ||
                (activePath !== "/" &&
                  item.href !== "/" &&
                  activePath.startsWith(item.href));

              return (
                <button
                  key={item.href}
                  className={`vr-nav-item ${
                    active ? "vr-nav-active" : ""
                  }`}
                  onClick={() => navigate(item.href)}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="vr-nav-icon">{item.icon}</span>

                  {!collapsed && (
                    <span className="vr-nav-label">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {!collapsed && (
          <div className="vr-sidebar-bottom">
            <div className="vr-status-card">
              <div className="vr-status-dot" />
              <div>
                <strong>Workspace Online</strong>
                <span>Research systems ready</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="vr-main">
        <header className="vr-topbar">
          <div className="vr-top-left">
            <button
              className="vr-icon-button"
              onClick={() => {
                if (window.innerWidth < 900) {
                  setMobileOpen(true);
                } else {
                  setCollapsed((value) => !value);
                }
              }}
              aria-label="Toggle navigation"
            >
              <Menu size={20} />
            </button>

            <button
              className="vr-mobile-brand"
              onClick={() => navigate("/")}
            >
              <Beaker size={19} />
              <span>V Research</span>
            </button>
          </div>

          <div className="vr-global-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search your research workspace..."
              onFocus={() => setSearchOpen(true)}
              onBlur={() =>
                setTimeout(() => setSearchOpen(false), 150)
              }
            />

            <kbd>⌘ K</kbd>

            {searchOpen && (
              <div className="vr-search-dropdown">
                <div className="vr-search-title">
                  Quick Search
                </div>

                <button onMouseDown={() => navigate("/research")}>
                  <FlaskConical size={16} />
                  Search scientific research
                </button>

                <button onMouseDown={() => navigate("/articles")}>
                  <BookOpen size={16} />
                  Search research articles
                </button>

                <button onMouseDown={() => navigate("/notes")}>
                  <FileText size={16} />
                  Search knowledge & notes
                </button>
              </div>
            )}
          </div>

          <div className="vr-top-actions">
            <button
              className="vr-icon-button"
              onClick={() => setDark((value) => !value)}
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <button
              className="vr-profile"
              onClick={() => navigate("/settings")}
              aria-label="Open settings"
            >
              <span>VR</span>
            </button>
          </div>
        </header>

        <main className="vr-content">{children}</main>
      </div>
    </div>
  );
}
