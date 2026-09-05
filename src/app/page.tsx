"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Database,
  FlaskConical,
  FolderOpen,
  FileText,
  BrainCircuit,
  Clock3,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import WorkstationShell from "@/components/WorkstationShell";

export default function CommandCenter() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function updateTime() {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }

    updateTime();

    const timer = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <WorkstationShell activePath="/">
      <div className="vr-dashboard">
        <section className="vr-hero">
          <div>
            <div className="vr-eyebrow">
              <Sparkles size={14} />
              RESEARCH WORKSTATION
            </div>

            <h1>Command Center</h1>

            <p>
              Your central workspace for discovering,
              organizing and developing research.
            </p>
          </div>

          <div className="vr-live-clock">
            <Clock3 size={17} />
            <span>{time || "Loading..."}</span>
            <div className="vr-status-dot" />
            <span>Live</span>
          </div>
        </section>

        <section className="vr-stat-grid">
          <StatCard
            icon={<FlaskConical size={20} />}
            label="Research Searches"
            value="0"
            detail="Start exploring"
          />

          <StatCard
            icon={<BookOpen size={20} />}
            label="Saved Articles"
            value="0"
            detail="Your reading library"
          />

          <StatCard
            icon={<Database size={20} />}
            label="Datasets"
            value="0"
            detail="Research data"
          />

          <StatCard
            icon={<Activity size={20} />}
            label="Today's Activity"
            value="0m"
            detail="Research time"
          />
        </section>

        <section className="vr-work-grid">
          <div className="vr-panel vr-main-panel">
            <div className="vr-panel-header">
              <div>
                <span className="vr-panel-kicker">
                  WORKSPACE
                </span>
                <h2>Quick Launch</h2>
              </div>

              <button
                className="vr-text-button"
                onClick={() =>
                  (window.location.href = "/research")
                }
              >
                Explore <ArrowUpRight size={15} />
              </button>
            </div>

            <div className="vr-launch-grid">
              <LaunchCard
                icon={<FlaskConical size={21} />}
                title="Research Explorer"
                description="Search scientific knowledge"
                href="/research"
              />

              <LaunchCard
                icon={<BookOpen size={21} />}
                title="Research Articles"
                description="Read and save publications"
                href="/articles"
              />

              <LaunchCard
                icon={<Database size={21} />}
                title="Dataset Manager"
                description="Organize research datasets"
                href="/datasets"
              />

              <LaunchCard
                icon={<FileText size={21} />}
                title="Knowledge & Notes"
                description="Build your research notebook"
                href="/notes"
              />

              <LaunchCard
                icon={<FolderOpen size={21} />}
                title="Files & Folders"
                description="Manage research files"
                href="/files"
              />

              <LaunchCard
                icon={<BrainCircuit size={21} />}
                title="AI Lab"
                description="Work with your research assistant"
                href="/ai"
              />
            </div>
          </div>

          <aside className="vr-panel vr-side-panel">
            <div className="vr-panel-header">
              <div>
                <span className="vr-panel-kicker">
                  TODAY
                </span>
                <h2>Research Pulse</h2>
              </div>
            </div>

            <div className="vr-pulse">
              <div className="vr-pulse-icon">
                <TrendingUp size={21} />
              </div>

              <strong>Workspace ready</strong>

              <p>
                Your research environment is ready
                for the next session.
              </p>
            </div>

            <div className="vr-mini-list">
              <MiniRow
                icon={<Search size={16} />}
                title="Research"
                value="Ready"
              />

              <MiniRow
                icon={<FileText size={16} />}
                title="Notes"
                value="Ready"
              />

              <MiniRow
                icon={<Database size={16} />}
                title="Datasets"
                value="Ready"
              />
            </div>

            <button
              className="vr-primary-button"
              onClick={() =>
                (window.location.href = "/research")
              }
            >
              <Plus size={17} />
              Start Research
            </button>
          </aside>
        </section>
      </div>
    </WorkstationShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="vr-stat-card">
      <div className="vr-stat-icon">{icon}</div>

      <div className="vr-stat-info">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function LaunchCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <button
      className="vr-launch-card"
      onClick={() => (window.location.href = href)}
    >
      <div className="vr-launch-icon">{icon}</div>

      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <ArrowUpRight className="vr-launch-arrow" size={17} />
    </button>
  );
}

function MiniRow({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="vr-mini-row">
      <div className="vr-mini-icon">{icon}</div>

      <span>{title}</span>

      <strong>{value}</strong>
    </div>
  );
}
