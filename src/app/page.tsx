"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Archive,
  BookOpen,
  Calculator,
  Camera,
  ChevronRight,
  Clock3,
  Compass,
  Database,
  FileText,
  Folder,
  FolderPlus,
  Globe2,
  Home,
  Lightbulb,
  Menu,
  MessageCircle,
  Moon,
  NotebookPen,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Sun,
  Timer,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";

type Page =
  | "dashboard"
  | "research"
  | "articles"
  | "datasets"
  | "notes"
  | "files"
  | "ai"
  | "tools"
  | "activity"
  | "settings";

type Note = {
  id: number;
  title: string;
  text: string;
  created: string;
};

type Dataset = {
  id: number;
  name: string;
  source: string;
  created: string;
};

type ResearchResult = {
  title?: string;
  description?: string;
  url?: string;
};

const navItems: {
  id: Page;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
  { id: "research", label: "Research Explorer", icon: <Search size={18} /> },
  { id: "articles", label: "Research Articles", icon: <BookOpen size={18} /> },
  { id: "datasets", label: "Datasets", icon: <Database size={18} /> },
  { id: "notes", label: "Quick Notes", icon: <NotebookPen size={18} /> },
  { id: "files", label: "Files & Folders", icon: <Folder size={18} /> },
  { id: "ai", label: "AI Lab", icon: <Sparkles size={18} /> },
  { id: "tools", label: "Research Tools", icon: <Calculator size={18} /> },
  { id: "activity", label: "Activity", icon: <Activity size={18} /> },
  { id: "settings", label: "Settings", icon: <Settings size={18} /> },
];

export default function VResearch() {
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dark, setDark] = useState(true);

  const [search, setSearch] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const [notes, setNotes] = useState<Note[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  const [showNote, setShowNote] = useState(false);
  const [showDataset, setShowDataset] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");

  const [datasetName, setDatasetName] = useState("");
  const [datasetSource, setDatasetSource] = useState("");

  const [clock, setClock] = useState(new Date());

  const [researchResults, setResearchResults] = useState<ResearchResult[]>(
    []
  );
  const [researchLoading, setResearchLoading] = useState(false);

  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  const [activitySeconds, setActivitySeconds] = useState(0);

  const [calculator, setCalculator] = useState("");

  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const savedNotes = localStorage.getItem("vresearch_notes");
    const savedDatasets = localStorage.getItem("vresearch_datasets");
    const savedHistory = localStorage.getItem("vresearch_history");
    const savedTheme = localStorage.getItem("vresearch_theme");

    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedDatasets) setDatasets(JSON.parse(savedDatasets));
    if (savedHistory) setSearchHistory(JSON.parse(savedHistory));

    if (savedTheme === "light") setDark(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("vresearch_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("vresearch_datasets", JSON.stringify(datasets));
  }, [datasets]);

  useEffect(() => {
    localStorage.setItem("vresearch_history", JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem("vresearch_theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const interval = setInterval(() => {
      setClock(new Date());
      setActivitySeconds((value) => value + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!timerRunning) return;

    const interval = setInterval(() => {
      setTimerSeconds((value) => {
        if (value <= 1) {
          setTimerRunning(false);
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const formattedTime = useMemo(
    () =>
      clock.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [clock]
  );

  const formattedDate = useMemo(
    () =>
      clock.toLocaleDateString([], {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [clock]
  );

  const timerDisplay = `${String(Math.floor(timerSeconds / 60)).padStart(
    2,
    "0"
  )}:${String(timerSeconds % 60).padStart(2, "0")}`;

  function goTo(next: Page) {
    setPage(next);
  }

  function performSearch(value = search) {
    const query = value.trim();

    if (!query) return;

    setSearch(query);

    setSearchHistory((history) => [
      query,
      ...history.filter((item) => item !== query),
    ].slice(0, 10));

    goTo("research");
    searchResearch(query);
  }

  async function searchResearch(query: string) {
    setResearchLoading(true);

    try {
      const response = await fetch(
        `/api/research?q=${encodeURIComponent(query)}&provider=all`
      );

      if (!response.ok) throw new Error("Research search failed");

      const data = await response.json();

      setResearchResults(data.results || []);
    } catch {
      setResearchResults([
        {
          title: "Search service unavailable",
          description:
            "The research API is not connected yet. The next setup step will connect the research providers.",
        },
      ]);
    } finally {
      setResearchLoading(false);
    }
  }

  function saveNote() {
    if (!noteTitle.trim() && !noteText.trim()) return;

    const note: Note = {
      id: Date.now(),
      title: noteTitle.trim() || "Untitled Note",
      text: noteText.trim(),
      created: new Date().toLocaleString(),
    };

    setNotes((items) => [note, ...items]);
    setNoteTitle("");
    setNoteText("");
    setShowNote(false);
  }

  function deleteNote(id: number) {
    setNotes((items) => items.filter((item) => item.id !== id));
  }

  function saveDataset() {
    if (!datasetName.trim()) return;

    const dataset: Dataset = {
      id: Date.now(),
      name: datasetName.trim(),
      source: datasetSource.trim() || "Manual",
      created: new Date().toLocaleString(),
    };

    setDatasets((items) => [dataset, ...items]);

    setDatasetName("");
    setDatasetSource("");
    setShowDataset(false);
  }

  function deleteDataset(id: number) {
    setDatasets((items) => items.filter((item) => item.id !== id));
  }

  async function openCamera() {
    setShowCamera(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch {
      alert(
        "Camera permission was not available. Please allow camera access in your browser."
      );
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setShowCamera(false);
  }

  function takePhoto() {
    const video = videoRef.current;

    if (!video) return;

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const link = document.createElement("a");
    link.download = `v-research-capture-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function resetTimer() {
    setTimerRunning(false);
    setTimerSeconds(25 * 60);
  }

  function calculate() {
    try {
      if (!calculator.trim()) return;

      const cleaned = calculator.replace(/[^0-9+\-*/().% ]/g, "");

      // Basic calculator evaluation for arithmetic expressions typed by the user.
      const result = Function(`"use strict"; return (${cleaned})`)();

      setCalculator(String(result));
    } catch {
      setCalculator("Error");
    }
  }

  async function askAI() {
    if (!aiInput.trim()) return;

    const question = aiInput.trim();

    setAiMessages((messages) => [
      ...messages,
      { role: "user", text: question },
    ]);

    setAiInput("");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question,
        }),
      });

      const data = await response.json();

      setAiMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          text:
            data.text ||
            "The AI service is not connected yet. We will connect it in the next step.",
        },
      ]);
    } catch {
      setAiMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          text:
            "AI Lab is ready, but the AI backend still needs to be connected.",
        },
      ]);
    }
  }

  function exportData() {
    const data = {
      notes,
      datasets,
      searchHistory,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "v-research-data.json";
    link.click();

    URL.revokeObjectURL(link.href);
  }

  function clearHistory() {
    setSearchHistory([]);
  }

  function resetEverything() {
    const confirmed = window.confirm(
      "Reset V Research local data? This will remove saved notes, datasets and search history from this browser."
    );

    if (!confirmed) return;

    localStorage.removeItem("vresearch_notes");
    localStorage.removeItem("vresearch_datasets");
    localStorage.removeItem("vresearch_history");

    setNotes([]);
    setDatasets([]);
    setSearchHistory([]);
  }

  return (
    <div className={dark ? "vr-app dark" : "vr-app light"}>
      <aside className={sidebarOpen ? "vr-sidebar open" : "vr-sidebar"}>
        <div className="vr-logo">
          <div className="vr-logo-icon">
            <Sparkles size={22} />
          </div>

          {sidebarOpen && (
            <div>
              <strong>V Research</strong>
              <span>Research Command Center</span>
            </div>
          )}
        </div>

        <nav className="vr-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? "nav-active" : ""}
              onClick={() => goTo(item.id)}
              title={item.label}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="sidebar-bottom">
            <div className="mini-status">
              <span className="status-dot" />
              Research system active
            </div>
          </div>
        )}
      </aside>

      <main className="vr-main">
        <header className="vr-topbar">
          <button
            className="icon-button"
            onClick={() => setSidebarOpen((value) => !value)}
            title="Toggle sidebar"
          >
            <Menu size={21} />
          </button>

          <div className="global-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") performSearch();
              }}
              placeholder="Search research, papers, datasets..."
            />

            {searchHistory.length > 0 && (
              <div className="search-history">
                <div className="history-header">
                  <span>Recent searches</span>
                  <button onClick={clearHistory}>Clear</button>
                </div>

                {searchHistory.slice(0, 5).map((item) => (
                  <button
                    key={item}
                    onClick={() => performSearch(item)}
                  >
                    <Clock3 size={14} />
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="quick-action"
            onClick={() => setShowNote(true)}
            title="Quick Note"
          >
            <NotebookPen size={19} />
            <span>Quick Note</span>
          </button>

          <button
            className="quick-action"
            onClick={openCamera}
            title="Camera"
          >
            <Camera size={19} />
            <span>Camera</span>
          </button>

          <button
            className="icon-button"
            onClick={() => setDark((value) => !value)}
            title="Toggle theme"
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </header>

        <section className="vr-content">
          {page === "dashboard" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">WELCOME BACK 👋</div>
                  <h1>Research Command Center</h1>
                  <p>
                    Search, organize, analyze and build your research
                    workspace.
                  </p>
                </div>

                <div className="clock-card">
                  <Clock3 size={18} />
                  <strong>{formattedTime}</strong>
                  <span>{formattedDate}</span>
                </div>
              </div>

              <div className="dashboard-grid">
                <DashboardCard
                  icon={<Search size={24} />}
                  title="Research Explorer"
                  value="Search"
                  description="Wikipedia, OpenAlex & PubMed"
                  onClick={() => goTo("research")}
                />

                <DashboardCard
                  icon={<Database size={24} />}
                  title="Datasets"
                  value={String(datasets.length)}
                  description="Research datasets stored"
                  onClick={() => goTo("datasets")}
                />

                <DashboardCard
                  icon={<NotebookPen size={24} />}
                  title="Quick Notes"
                  value={String(notes.length)}
                  description="Ideas & observations"
                  onClick={() => goTo("notes")}
                />

                <DashboardCard
                  icon={<Sparkles size={24} />}
                  title="AI Lab"
                  value="Ready"
                  description="Research assistant workspace"
                  onClick={() => goTo("ai")}
                />
              </div>

              <div className="large-grid">
                <section className="panel timer-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">FOCUS ENGINE</span>
                      <h2>Research Timer</h2>
                    </div>
                    <Timer size={22} />
                  </div>

                  <div className="timer-display">{timerDisplay}</div>

                  <div className="timer-controls">
                    <button
                      className="primary-button"
                      onClick={() => setTimerRunning((value) => !value)}
                    >
                      {timerRunning ? "Pause" : "Start"}
                    </button>

                    <button
                      className="secondary-button"
                      onClick={resetTimer}
                    >
                      <RefreshCw size={16} />
                      Reset
                    </button>
                  </div>

                  <div className="timer-presets">
                    {[5, 15, 25, 45, 60].map((minutes) => (
                      <button
                        key={minutes}
                        onClick={() => {
                          setTimerRunning(false);
                          setTimerSeconds(minutes * 60);
                        }}
                      >
                        {minutes}m
                      </button>
                    ))}
                  </div>
                </section>

                <section className="panel activity-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">LIVE</span>
                      <h2>Workspace Activity</h2>
                    </div>

                    <Activity size={22} />
                  </div>

                  <div className="activity-number">
                    {formatDuration(activitySeconds)}
                  </div>

                  <p>Current research session</p>

                  <div className="activity-bar">
                    <span />
                  </div>

                  <button
                    className="secondary-button full"
                    onClick={() => goTo("activity")}
                  >
                    View Activity Log
                    <ChevronRight size={16} />
                  </button>
                </section>
              </div>

              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">QUICK ACCESS</span>
                    <h2>Research Workspace</h2>
                  </div>
                </div>

                <div className="quick-grid">
                  <QuickTool
                    icon={<BookOpen size={22} />}
                    title="Articles"
                    text="Latest research"
                    onClick={() => goTo("articles")}
                  />

                  <QuickTool
                    icon={<Archive size={22} />}
                    title="Files"
                    text="Manage research files"
                    onClick={() => goTo("files")}
                  />

                  <QuickTool
                    icon={<Compass size={22} />}
                    title="Tools"
                    text="Calculator, converter & more"
                    onClick={() => goTo("tools")}
                  />

                  <QuickTool
                    icon={<Globe2 size={22} />}
                    title="Global Research"
                    text="Explore worldwide knowledge"
                    onClick={() => goTo("research")}
                  />
                </div>
              </section>
            </>
          )}

          {page === "research" && (
            <ResearchPage
              search={search}
              setSearch={setSearch}
              performSearch={performSearch}
              loading={researchLoading}
              results={researchResults}
            />
          )}

          {page === "articles" && (
            <ArticlesPage onSearch={(query) => performSearch(query)} />
          )}

          {page === "datasets" && (
            <section>
              <PageTitle
                eyebrow="DATA MANAGER"
                title="Datasets"
                description="Organize research datasets and sources."
                action={
                  <button
                    className="primary-button"
                    onClick={() => setShowDataset(true)}
                  >
                    <Plus size={17} />
                    New Dataset
                  </button>
                }
              />

              <div className="panel">
                {datasets.length === 0 ? (
                  <EmptyState
                    icon={<Database size={30} />}
                    title="No datasets yet"
                    text="Create your first research dataset."
                    button={
                      <button
                        className="primary-button"
                        onClick={() => setShowDataset(true)}
                      >
                        Create Dataset
                      </button>
                    }
                  />
                ) : (
                  <div className="item-list">
                    {datasets.map((dataset) => (
                      <div className="list-item" key={dataset.id}>
                        <div className="list-icon">
                          <Database size={20} />
                        </div>

                        <div className="list-main">
                          <strong>{dataset.name}</strong>
                          <span>{dataset.source}</span>
                          <small>{dataset.created}</small>
                        </div>

                        <button
                          className="danger-icon"
                          onClick={() => deleteDataset(dataset.id)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="panel wikipedia-panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">KNOWLEDGE ENGINE</span>
                    <h2>Wikipedia Research Search</h2>
                  </div>
                  <Globe2 size={22} />
                </div>

                <p>
                  Search Wikipedia directly through the Research Explorer and
                  save useful results into your research workflow.
                </p>

                <button
                  className="secondary-button"
                  onClick={() => goTo("research")}
                >
                  Open Research Explorer
                  <ChevronRight size={16} />
                </button>
              </div>
            </section>
          )}

          {page === "notes" && (
            <section>
              <PageTitle
                eyebrow="IDEA SPACE"
                title="Quick Notes"
                description="Capture hypotheses, observations and research ideas."
                action={
                  <button
                    className="primary-button"
                    onClick={() => setShowNote(true)}
                  >
                    <Plus size={17} />
                    New Note
                  </button>
                }
              />

              {notes.length === 0 ? (
                <section className="panel">
                  <EmptyState
                    icon={<NotebookPen size={30} />}
                    title="Your notebook is empty"
                    text="Start collecting your research ideas."
                    button={
                      <button
                        className="primary-button"
                        onClick={() => setShowNote(true)}
                      >
                        Write a Note
                      </button>
                    }
                  />
                </section>
              ) : (
                <div className="notes-grid">
                  {notes.map((note) => (
                    <article className="note-card" key={note.id}>
                      <div className="note-top">
                        <NotebookPen size={20} />
                        <button
                          className="danger-icon"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <h3>{note.title}</h3>
                      <p>{note.text}</p>
                      <small>{note.created}</small>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {page === "files" && (
            <FilesPage onExport={exportData} />
          )}

          {page === "ai" && (
            <section>
              <PageTitle
                eyebrow="AI LAB"
                title="Research AI"
                description="Your research assistant workspace."
              />

              <div className="ai-layout">
                <section className="panel ai-chat">
                  <div className="ai-messages">
                    {aiMessages.length === 0 ? (
                      <EmptyState
                        icon={<Sparkles size={30} />}
                        title="AI Lab is ready"
                        text="Ask a research question, request an explanation, or analyze an idea."
                      />
                    ) : (
                      aiMessages.map((message, index) => (
                        <div
                          key={index}
                          className={
                            message.role === "user"
                              ? "message user-message"
                              : "message assistant-message"
                          }
                        >
                          <span>
                            {message.role === "user" ? "YOU" : "AI"}
                          </span>
                          <p>{message.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="ai-input">
                    <textarea
                      value={aiInput}
                      onChange={(event) => setAiInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          askAI();
                        }
                      }}
                      placeholder="Ask your research assistant..."
                    />

                    <button className="primary-button" onClick={askAI}>
                      <Sparkles size={17} />
                      Ask AI
                    </button>
                  </div>
                </section>
              </div>
            </section>
          )}

          {page === "tools" && (
            <ToolsPage
              calculator={calculator}
              setCalculator={setCalculator}
              calculate={calculate}
              timerDisplay={timerDisplay}
              timerRunning={timerRunning}
              setTimerRunning={setTimerRunning}
              resetTimer={resetTimer}
            />
          )}

          {page === "activity" && (
            <section>
              <PageTitle
                eyebrow="WORKSPACE MONITOR"
                title="Activity"
                description="Visible tracking of your V Research session."
              />

              <div className="dashboard-grid">
                <DashboardCard
                  icon={<Clock3 size={24} />}
                  title="Current Session"
                  value={formatDuration(activitySeconds)}
                  description="Time since this page opened"
                />

                <DashboardCard
                  icon={<Activity size={24} />}
                  title="Status"
                  value="Active"
                  description="Workspace is running"
                />

                <DashboardCard
                  icon={<NotebookPen size={24} />}
                  title="Notes"
                  value={String(notes.length)}
                  description="Saved locally"
                />

                <DashboardCard
                  icon={<Database size={24} />}
                  title="Datasets"
                  value={String(datasets.length)}
                  description="Saved locally"
                />
              </div>

              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">SESSION</span>
                    <h2>Current activity</h2>
                  </div>
                  <Activity size={22} />
                </div>

                <div className="activity-log">
                  <div>
                    <span className="status-dot" />
                    V Research opened
                    <small>Current session</small>
                  </div>

                  <div>
                    <span className="status-dot" />
                    Workspace monitoring active
                    <small>{formatDuration(activitySeconds)}</small>
                  </div>
                </div>
              </section>
            </section>
          )}

          {page === "settings" && (
            <section>
              <PageTitle
                eyebrow="CONTROL CENTER"
                title="Settings"
                description="Customize your research environment."
              />

              <div className="settings-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">APPEARANCE</span>
                      <h2>Theme</h2>
                    </div>
                    {dark ? <Moon size={22} /> : <Sun size={22} />}
                  </div>

                  <div className="setting-row">
                    <div>
                      <strong>Dark mode</strong>
                      <span>Comfortable research interface</span>
                    </div>

                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={dark}
                        onChange={(event) => setDark(event.target.checked)}
                      />
                      <span />
                    </label>
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">DATA</span>
                      <h2>Storage</h2>
                    </div>
                    <Archive size={22} />
                  </div>

                  <button
                    className="secondary-button full"
                    onClick={exportData}
                  >
                    <Upload size={17} />
                    Export V Research Data
                  </button>

                  <button
                    className="danger-button full"
                    onClick={resetEverything}
                  >
                    <Trash2 size={17} />
                    Reset Local Data
                  </button>
                </section>
              </div>

              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">AI CONFIGURATION</span>
                    <h2>AI Assistants</h2>
                  </div>
                  <Sparkles size={22} />
                </div>

                <p>
                  Custom AI assistants, system instructions and connected AI
                  providers will be configured here.
                </p>

                <button
                  className="primary-button"
                  onClick={() => goTo("ai")}
                >
                  Open AI Lab
                  <ChevronRight size={16} />
                </button>
              </section>
            </section>
          )}
        </section>
      </main>

      {showNote && (
        <Modal
          title="Create Quick Note"
          onClose={() => setShowNote(false)}
        >
          <input
            className="modal-input"
            value={noteTitle}
            onChange={(event) => setNoteTitle(event.target.value)}
            placeholder="Note title"
          />

          <textarea
            className="modal-textarea"
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            placeholder="Write your research idea..."
          />

          <div className="modal-actions">
            <button
              className="secondary-button"
              onClick={() => setShowNote(false)}
            >
              Cancel
            </button>

            <button className="primary-button" onClick={saveNote}>
              Save Note
            </button>
          </div>
        </Modal>
      )}

      {showDataset && (
        <Modal
          title="Create Dataset"
          onClose={() => setShowDataset(false)}
        >
          <input
            className="modal-input"
            value={datasetName}
            onChange={(event) => setDatasetName(event.target.value)}
            placeholder="Dataset name"
          />

          <input
            className="modal-input"
            value={datasetSource}
            onChange={(event) => setDatasetSource(event.target.value)}
            placeholder="Source / URL / description"
          />

          <div className="modal-actions">
            <button
              className="secondary-button"
              onClick={() => setShowDataset(false)}
            >
              Cancel
            </button>

            <button className="primary-button" onClick={saveDataset}>
              Save Dataset
            </button>
          </div>
        </Modal>
      )}

      {showCamera && (
        <div className="camera-overlay">
          <div className="camera-window">
            <div className="camera-header">
              <div>
                <span className="eyebrow">LIVE CAPTURE</span>
                <h2>Research Camera</h2>
              </div>

              <button className="icon-button" onClick={closeCamera}>
                <X size={20} />
              </button>
            </div>

            <div className="camera-preview">
              <video ref={videoRef} autoPlay playsInline muted />
            </div>

            <div className="camera-controls">
              <button className="secondary-button">
                <RefreshCw size={17} />
                Switch Camera
              </button>

              <button className="camera-shutter" onClick={takePhoto}>
                <Camera size={25} />
              </button>

              <button className="secondary-button">
                <Video size={17} />
                Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardCard({
  icon,
  title,
  value,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <button className="dashboard-card" onClick={onClick}>
      <div className="card-icon">{icon}</div>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{description}</small>
    </button>
  );
}

function QuickTool({
  icon,
  title,
  text,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button className="quick-tool" onClick={onClick}>
      <div className="card-icon">{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
      <ChevronRight size={17} />
    </button>
  );
}

function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {action}
    </div>
  );
}

function ResearchPage({
  search,
  setSearch,
  performSearch,
  loading,
  results,
}: {
  search: string;
  setSearch: (value: string) => void;
  performSearch: (value?: string) => void;
  loading: boolean;
  results: ResearchResult[];
}) {
  return (
    <section>
      <PageTitle
        eyebrow="RESEARCH ENGINE"
        title="Research Explorer"
        description="Search scientific knowledge across multiple sources."
      />

      <div className="research-search panel">
        <Search size={21} />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") performSearch();
          }}
          placeholder="Search a topic, paper, disease, gene, technology..."
        />

        <button
          className="primary-button"
          onClick={() => performSearch()}
        >
          Search
        </button>
      </div>

      <div className="source-pills">
        <span>Wikipedia</span>
        <span>OpenAlex</span>
        <span>PubMed</span>
      </div>

      <div className="research-results">
        {loading ? (
          <section className="panel loading-box">
            <RefreshCw className="spin" size={28} />
            <h2>Searching research sources...</h2>
          </section>
        ) : results.length === 0 ? (
          <section className="panel">
            <EmptyState
              icon={<Search size={30} />}
              title="Start exploring"
              text="Search for a research topic to see results here."
            />
          </section>
        ) : (
          results.map((result, index) => (
            <article className="research-result" key={index}>
              <div className="result-icon">
                <BookOpen size={21} />
              </div>

              <div>
                <h3>{result.title || "Untitled research result"}</h3>
                <p>
                  {result.description || "No description available."}
                </p>

                {result.url && (
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open source →
                  </a>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function ArticlesPage({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) {
  const topics = [
    "oncology research",
    "gene editing research",
    "virology research",
    "artificial intelligence medicine",
    "drug discovery",
    "synthetic biology",
  ];

  return (
    <section>
      <PageTitle
        eyebrow="RESEARCH FEED"
        title="Research Articles"
        description="Explore research topics and open them in the research engine."
      />

      <div className="article-grid">
        {topics.map((topic) => (
          <article className="article-card" key={topic}>
            <div className="article-icon">
              <BookOpen size={22} />
            </div>

            <span>Research Topic</span>
            <h3>{topic}</h3>

            <button
              className="secondary-button"
              onClick={() => onSearch(topic)}
            >
              Explore
              <ChevronRight size={16} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function FilesPage({
  onExport,
}: {
  onExport: () => void;
}) {
  const [folders, setFolders] = useState<string[]>([]);
  const [folderName, setFolderName] = useState("");
  const [showFolder, setShowFolder] = useState(false);

  function createFolder() {
    if (!folderName.trim()) return;

    setFolders((items) => [...items, folderName.trim()]);
    setFolderName("");
    setShowFolder(false);
  }

  return (
    <section>
      <PageTitle
        eyebrow="RESEARCH STORAGE"
        title="Files & Folders"
        description="Organize your research workspace."
        action={
          <button
            className="primary-button"
            onClick={() => setShowFolder(true)}
          >
            <FolderPlus size={17} />
            New Folder
          </button>
        }
      />

      <div className="storage-actions">
        <button className="secondary-button" onClick={onExport}>
          <Upload size={17} />
          Export Data
        </button>

        <button
          className="secondary-button"
          onClick={() =>
            alert(
              "Device file access will be connected in the storage integration step."
            )
          }
        >
          <Folder size={17} />
          Device Storage
        </button>
      </div>

      <div className="folder-grid">
        {folders.map((folder) => (
          <div className="folder-card" key={folder}>
            <Folder size={32} />
            <strong>{folder}</strong>
            <span>Research folder</span>
          </div>
        ))}

        {folders.length === 0 && (
          <section className="panel">
            <EmptyState
              icon={<Folder size={30} />}
              title="No folders yet"
              text="Create folders to organize your research."
              button={
                <button
                  className="primary-button"
                  onClick={() => setShowFolder(true)}
                >
                  <FolderPlus size={17} />
                  Create Folder
                </button>
              }
            />
          </section>
        )}
      </div>

      {showFolder && (
        <Modal
          title="Create New Folder"
          onClose={() => setShowFolder(false)}
        >
          <input
            className="modal-input"
            value={folderName}
            onChange={(event) => setFolderName(event.target.value)}
            placeholder="Folder name"
            autoFocus
          />

          <div className="modal-actions">
            <button
              className="secondary-button"
              onClick={() => setShowFolder(false)}
            >
              Cancel
            </button>

            <button className="primary-button" onClick={createFolder}>
              Create Folder
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}

function ToolsPage({
  calculator,
  setCalculator,
  calculate,
  timerDisplay,
  timerRunning,
  setTimerRunning,
  resetTimer,
}: {
  calculator: string;
  setCalculator: (value: string) => void;
  calculate: () => void;
  timerDisplay: string;
  timerRunning: boolean;
  setTimerRunning: (value: boolean) => void;
  resetTimer: () => void;
}) {
  return (
    <section>
      <PageTitle
        eyebrow="LAB TOOLS"
        title="Research Tools"
        description="Useful utilities for your research workstation."
      />

      <div className="tools-grid">
        <section className="panel calculator-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">CALCULATOR</span>
              <h2>Scientific Workspace</h2>
            </div>

            <Calculator size={22} />
          </div>

          <input
            className="calculator-display"
            value={calculator}
            onChange={(event) => setCalculator(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") calculate();
            }}
            placeholder="Type calculation..."
          />

          <div className="calculator-grid">
            {[
              "7",
              "8",
              "9",
              "/",
              "4",
              "5",
              "6",
              "*",
              "1",
              "2",
              "3",
              "-",
              "0",
              ".",
              "%",
              "+",
            ].map((key) => (
              <button
                key={key}
                onClick={() => setCalculator(`${calculator}${key}`)}
              >
                {key}
              </button>
            ))}

            <button onClick={() => setCalculator("")}>Clear</button>

            <button className="calculate-key" onClick={calculate}>
              =
            </button>
          </div>
        </section>

        <section className="panel tool-timer">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">FOCUS TIMER</span>
              <h2>Timer</h2>
            </div>
            <Timer size={22} />
          </div>

          <div className="large-timer">{timerDisplay}</div>

          <div className="timer-controls">
            <button
              className="primary-button"
              onClick={() => setTimerRunning(!timerRunning)}
            >
              <Play size={16} />
              {timerRunning ? "Pause" : "Start"}
            </button>

            <button className="secondary-button" onClick={resetTimer}>
              Reset
            </button>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">UTILITY</span>
              <h2>Compass</h2>
            </div>
            <Compass size={22} />
          </div>

          <div className="compass">
            <span>N</span>
            <div className="compass-needle">▲</div>
            <span>S</span>
          </div>

          <p className="center-text">
            Device orientation integration will activate when supported by the
            browser.
          </p>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">CONVERSION</span>
              <h2>Unit Converter</h2>
            </div>
            <RefreshCw size={22} />
          </div>

          <div className="converter-demo">
            <input placeholder="Value" />
            <select defaultValue="kg">
              <option value="kg">Kilograms</option>
              <option value="g">Grams</option>
              <option value="mg">Milligrams</option>
              <option value="lb">Pounds</option>
              <option value="m">Meters</option>
              <option value="cm">Centimeters</option>
              <option value="km">Kilometers</option>
            </select>
          </div>

          <p>
            More scientific, laboratory and currency conversions will be added
            to the full tools engine.
          </p>
        </section>
      </div>
    </section>
  );
}

function EmptyState({
  icon,
  title,
  text,
  button,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  button?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h2>{title}</h2>
      <p>{text}</p>
      {button}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-heading">
          <h2>{title}</h2>

          <button className="icon-button" onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  }

  return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
}
