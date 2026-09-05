"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BookOpen,
  Camera,
  Calculator,
  ChevronRight,
  Clock3,
  Compass,
  Database,
  FileText,
  Folder,
  Home,
  Menu,
  Moon,
  NotebookPen,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Timer,
  Trash2,
  Upload,
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

type Result = {
  title: string;
  description: string;
  url: string;
  source: string;
};

export default function VResearch() {
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebar, setSidebar] = useState(true);
  const [dark, setDark] = useState(true);

  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const [notes, setNotes] = useState<Note[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  const [showNote, setShowNote] = useState(false);
  const [showDataset, setShowDataset] = useState(false);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");

  const [datasetName, setDatasetName] = useState("");
  const [datasetSource, setDatasetSource] = useState("");

  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  const [time, setTime] = useState(new Date());
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const [timer, setTimer] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  const [calculator, setCalculator] = useState("");

  const [aiInput, setAiInput] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");

  const [cameraOpen, setCameraOpen] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem("vr_notes");
      const savedDatasets = localStorage.getItem("vr_datasets");
      const savedHistory = localStorage.getItem("vr_history");
      const savedTheme = localStorage.getItem("vr_theme");

      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }

      if (savedDatasets) {
        setDatasets(JSON.parse(savedDatasets));
      }

      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }

      if (savedTheme === "light") {
        setDark(false);
      }
    } catch {
      // Ignore invalid local data.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("vr_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("vr_datasets", JSON.stringify(datasets));
  }, [datasets]);

  useEffect(() => {
    localStorage.setItem("vr_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("vr_theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTime(new Date());
      setSessionSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!timerRunning) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimer((value) => {
        if (value <= 1) {
          setTimerRunning(false);
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoStream]);

  async function searchResearch() {
    const query = search.trim();

    if (!query) {
      return;
    }

    setLoading(true);

    setHistory((oldHistory) => {
      const updated = oldHistory.filter((item) => item !== query);
      return [query, ...updated].slice(0, 10);
    });

    setPage("research");

    try {
      const response = await fetch(
        "/api/research?q=" + encodeURIComponent(query)
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();

      setResults(Array.isArray(data.results) ? data.results : []);
    } catch {
      setResults([
        {
          title: "Research service unavailable",
          description:
            "The research sources could not be reached. Check the API setup.",
          url: "",
          source: "V Research",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function saveNote() {
    if (!noteTitle.trim() && !noteText.trim()) {
      return;
    }

    const newNote: Note = {
      id: Date.now(),
      title: noteTitle.trim() || "Untitled Note",
      text: noteText.trim(),
      created: new Date().toLocaleString(),
    };

    setNotes((oldNotes) => [newNote, ...oldNotes]);

    setNoteTitle("");
    setNoteText("");
    setShowNote(false);
  }

  function saveDataset() {
    if (!datasetName.trim()) {
      return;
    }

    const newDataset: Dataset = {
      id: Date.now(),
      name: datasetName.trim(),
      source: datasetSource.trim() || "Manual",
      created: new Date().toLocaleString(),
    };

    setDatasets((oldDatasets) => [newDataset, ...oldDatasets]);

    setDatasetName("");
    setDatasetSource("");
    setShowDataset(false);
  }

  function exportData() {
    const data = {
      notes,
      datasets,
      history,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "v-research-data.json";
    link.click();

    URL.revokeObjectURL(url);
  }

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      setVideoStream(stream);
      setCameraOpen(true);
    } catch {
      window.alert(
        "Camera permission was not available. Please allow camera access."
      );
    }
  }

  function closeCamera() {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
    }

    setVideoStream(null);
    setCameraOpen(false);
  }

  function calculate() {
    try {
      const safe = calculator.replace(/[^0-9+\-*/().% ]/g, "");

      if (!safe.trim()) {
        return;
      }

      const answer = Function(
        '"use strict"; return (' + safe + ")"
      )();

      setCalculator(String(answer));
    } catch {
      setCalculator("Error");
    }
  }

  async function askAI() {
    const message = aiInput.trim();

    if (!message) {
      return;
    }

    setAiInput("");
    setAiAnswer("Thinking...");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      const data = await response.json();

      setAiAnswer(
        data.text ||
          "AI Lab is ready, but the AI provider has not been configured."
      );
    } catch {
      setAiAnswer("AI service is currently unavailable.");
    }
  }

  function resetTimer() {
    setTimerRunning(false);
    setTimer(25 * 60);
  }

  const timeText = time.toLocaleTimeString();
  const dateText = time.toLocaleDateString();

  return (
    <div className={dark ? "vr-app dark" : "vr-app light"}>
      <aside className={sidebar ? "vr-sidebar open" : "vr-sidebar"}>
        <div className="vr-logo">
          <div className="vr-logo-icon">
            <Sparkles size={22} />
          </div>

          {sidebar && (
            <div>
              <strong>V Research</strong>
              <span>Research Command Center</span>
            </div>
          )}
        </div>

        <nav className="vr-nav">
          <NavButton
            active={page === "dashboard"}
            icon={<Home size={18} />}
            label="Dashboard"
            open={sidebar}
            onClick={() => setPage("dashboard")}
          />

          <NavButton
            active={page === "research"}
            icon={<Search size={18} />}
            label="Research Explorer"
            open={sidebar}
            onClick={() => setPage("research")}
          />

          <NavButton
            active={page === "articles"}
            icon={<BookOpen size={18} />}
            label="Research Articles"
            open={sidebar}
            onClick={() => setPage("articles")}
          />

          <NavButton
            active={page === "datasets"}
            icon={<Database size={18} />}
            label="Datasets"
            open={sidebar}
            onClick={() => setPage("datasets")}
          />

          <NavButton
            active={page === "notes"}
            icon={<NotebookPen size={18} />}
            label="Quick Notes"
            open={sidebar}
            onClick={() => setPage("notes")}
          />

          <NavButton
            active={page === "files"}
            icon={<Folder size={18} />}
            label="Files & Folders"
            open={sidebar}
            onClick={() => setPage("files")}
          />

          <NavButton
            active={page === "ai"}
            icon={<Sparkles size={18} />}
            label="AI Lab"
            open={sidebar}
            onClick={() => setPage("ai")}
          />

          <NavButton
            active={page === "tools"}
            icon={<Calculator size={18} />}
            label="Research Tools"
            open={sidebar}
            onClick={() => setPage("tools")}
          />

          <NavButton
            active={page === "activity"}
            icon={<Activity size={18} />}
            label="Activity"
            open={sidebar}
            onClick={() => setPage("activity")}
          />

          <NavButton
            active={page === "settings"}
            icon={<Settings size={18} />}
            label="Settings"
            open={sidebar}
            onClick={() => setPage("settings")}
          />
        </nav>
      </aside>

      <main className="vr-main">
        <header className="vr-topbar">
          <button
            className="icon-button"
            onClick={() => setSidebar(!sidebar)}
            title="Menu"
          >
            <Menu size={20} />
          </button>

          <div className="global-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  searchResearch();
                }
              }}
              placeholder="Search research..."
            />

            {history.length > 0 && (
              <div className="search-history">
                <div className="history-header">
                  <span>Recent searches</span>

                  <button onClick={() => setHistory([])}>
                    Clear
                  </button>
                </div>

                {history.slice(0, 5).map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setSearch(item);
                      setTimeout(searchResearch, 0);
                    }}
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
            <NotebookPen size={18} />
            <span>Quick Note</span>
          </button>

          <button
            className="quick-action"
            onClick={openCamera}
            title="Camera"
          >
            <Camera size={18} />
            <span>Camera</span>
          </button>

          <button
            className="icon-button"
            onClick={() => setDark(!dark)}
            title="Theme"
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </header>

        <section className="vr-content">
          {page === "dashboard" && (
            <Dashboard
              time={timeText}
              date={dateText}
              notes={notes.length}
              datasets={datasets.length}
              timer={timer}
              timerRunning={timerRunning}
              setTimerRunning={setTimerRunning}
              resetTimer={resetTimer}
              sessionSeconds={sessionSeconds}
              setPage={setPage}
            />
          )}

          {page === "research" && (
            <ResearchPage
              search={search}
              setSearch={setSearch}
              searchResearch={searchResearch}
              results={results}
              loading={loading}
            />
          )}

          {page === "articles" && (
            <ArticlesPage
              setSearch={setSearch}
              searchResearch={searchResearch}
            />
          )}

          {page === "datasets" && (
            <DatasetsPage
              datasets={datasets}
              deleteDataset={(id) =>
                setDatasets((items) =>
                  items.filter((item) => item.id !== id)
                )
              }
              openCreate={() => setShowDataset(true)}
            />
          )}

          {page === "notes" && (
            <NotesPage
              notes={notes}
              deleteNote={(id) =>
                setNotes((items) =>
                  items.filter((item) => item.id !== id)
                )
              }
              openCreate={() => setShowNote(true)}
            />
          )}

          {page === "files" && (
            <FilesPage exportData={exportData} />
          )}

          {page === "ai" && (
            <AIPage
              input={aiInput}
              setInput={setAiInput}
              answer={aiAnswer}
              askAI={askAI}
            />
          )}

          {page === "tools" && (
            <ToolsPage
              calculator={calculator}
              setCalculator={setCalculator}
              calculate={calculate}
              timer={timer}
              timerRunning={timerRunning}
              setTimerRunning={setTimerRunning}
              resetTimer={resetTimer}
            />
          )}

          {page === "activity" && (
            <ActivityPage
              seconds={sessionSeconds}
              notes={notes.length}
              datasets={datasets.length}
            />
          )}

          {page === "settings" && (
            <SettingsPage
              dark={dark}
              setDark={setDark}
              exportData={exportData}
              reset={() => {
                localStorage.clear();
                setNotes([]);
                setDatasets([]);
                setHistory([]);
              }}
            />
          )}
        </section>
      </main>

      {showNote && (
        <Modal
          title="Quick Note"
          close={() => setShowNote(false)}
        >
          <input
            className="modal-input"
            value={noteTitle}
            onChange={(event) => setNoteTitle(event.target.value)}
            placeholder="Title"
          />

          <textarea
            className="modal-textarea"
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            placeholder="Write your research note..."
          />

          <div className="modal-actions">
            <button
              className="secondary-button"
              onClick={() => setShowNote(false)}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              onClick={saveNote}
            >
              Save Note
            </button>
          </div>
        </Modal>
      )}

      {showDataset && (
        <Modal
          title="New Dataset"
          close={() => setShowDataset(false)}
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
            onChange={(event) =>
              setDatasetSource(event.target.value)
            }
            placeholder="Source / URL"
          />

          <div className="modal-actions">
            <button
              className="secondary-button"
              onClick={() => setShowDataset(false)}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              onClick={saveDataset}
            >
              Save Dataset
            </button>
          </div>
        </Modal>
      )}

      {cameraOpen && (
        <CameraModal
          stream={videoStream}
          close={closeCamera}
        />
      )}
    </div>
  );
}

function NavButton({
  active,
  icon,
  label,
  open,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={active ? "nav-active" : ""}
      onClick={onClick}
      title={label}
    >
      {icon}
      {open && <span>{label}</span>}
    </button>
  );
}

function PageHeader({
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

function Dashboard({
  time,
  date,
  notes,
  datasets,
  timer,
  timerRunning,
  setTimerRunning,
  resetTimer,
  sessionSeconds,
  setPage,
}: {
  time: string;
  date: string;
  notes: number;
  datasets: number;
  timer: number;
  timerRunning: boolean;
  setTimerRunning: (value: boolean) => void;
  resetTimer: () => void;
  sessionSeconds: number;
  setPage: (page: Page) => void;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">WELCOME TO V RESEARCH 👋</div>
          <h1>Research Command Center</h1>
          <p>Your personal scientific workspace.</p>
        </div>

        <div className="clock-card">
          <Clock3 size={18} />
          <strong>{time}</strong>
          <span>{date}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <DashboardCard
          icon={<Search size={24} />}
          title="Research Explorer"
          value="Search"
          description="Scientific knowledge"
          onClick={() => setPage("research")}
        />

        <DashboardCard
          icon={<Database size={24} />}
          title="Datasets"
          value={String(datasets)}
          description="Saved datasets"
          onClick={() => setPage("datasets")}
        />

        <DashboardCard
          icon={<NotebookPen size={24} />}
          title="Quick Notes"
          value={String(notes)}
          description="Research ideas"
          onClick={() => setPage("notes")}
        />

        <DashboardCard
          icon={<Sparkles size={24} />}
          title="AI Lab"
          value="READY"
          description="Research assistant"
          onClick={() => setPage("ai")}
        />
      </div>

      <div className="large-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">FOCUS ENGINE</div>
              <h2>Research Timer</h2>
            </div>
            <Timer size={22} />
          </div>

          <div className="timer-display">
            {formatTimer(timer)}
          </div>

          <div className="timer-controls">
            <button
              className="primary-button"
              onClick={() => setTimerRunning(!timerRunning)}
            >
              {timerRunning ? "Pause" : "Start"}
            </button>

            <button
              className="secondary-button"
              onClick={resetTimer}
            >
              Reset
            </button>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">LIVE SESSION</div>
              <h2>Activity</h2>
            </div>
            <Activity size={22} />
          </div>

          <div className="activity-number">
            {formatDuration(sessionSeconds)}
          </div>

          <p>Current workspace session</p>

          <button
            className="secondary-button full"
            onClick={() => setPage("activity")}
          >
            View Activity
            <ChevronRight size={16} />
          </button>
        </section>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">QUICK ACCESS</div>
            <h2>Research Workspace</h2>
          </div>
        </div>

        <div className="quick-grid">
          <QuickTool
            icon={<BookOpen size={22} />}
            title="Articles"
            text="Research topics"
            onClick={() => setPage("articles")}
          />

          <QuickTool
            icon={<Folder size={22} />}
            title="Files"
            text="Research storage"
            onClick={() => setPage("files")}
          />

          <QuickTool
            icon={<Calculator size={22} />}
            title="Tools"
            text="Research utilities"
            onClick={() => setPage("tools")}
          />

          <QuickTool
            icon={<Settings size={22} />}
            title="Settings"
            text="Customize workspace"
            onClick={() => setPage("settings")}
          />
        </div>
      </section>
    </>
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

function ResearchPage({
  search,
  setSearch,
  searchResearch,
  results,
  loading,
}: {
  search: string;
  setSearch: (value: string) => void;
  searchResearch: () => void;
  results: Result[];
  loading: boolean;
}) {
  return (
    <>
      <PageHeader
        eyebrow="RESEARCH ENGINE"
        title="Research Explorer"
        description="Explore scientific knowledge from multiple sources."
      />

      <section className="research-search panel">
        <Search size={20} />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              searchResearch();
            }
          }}
          placeholder="Search a research topic..."
        />

        <button
          className="primary-button"
          onClick={searchResearch}
        >
          Search
        </button>
      </section>

      <div className="source-pills">
        <span>Wikipedia</span>
        <span>OpenAlex</span>
        <span>PubMed</span>
      </div>

      <div className="research-results">
        {loading && (
          <section className="panel loading-box">
            <RefreshIcon />
            <h2>Searching...</h2>
          </section>
        )}

        {!loading &&
          results.map((result, index) => (
            <article
              className="research-result"
              key={result.url + index}
            >
              <div className="result-icon">
                <BookOpen size={20} />
              </div>

              <div>
                <span className="result-source">
                  {result.source}
                </span>

                <h3>{result.title}</h3>

                <p>{result.description}</p>

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
          ))}

        {!loading && results.length === 0 && (
          <section className="panel">
            <Empty
              icon={<Search size={28} />}
              title="Start researching"
              text="Search for a topic above."
            />
          </section>
        )}
      </div>
    </>
  );
}

function ArticlesPage({
  setSearch,
  searchResearch,
}: {
  setSearch: (value: string) => void;
  searchResearch: () => void;
}) {
  const topics = [
    "Cancer research",
    "Gene editing",
    "Virology",
    "Drug discovery",
    "Synthetic biology",
    "AI in medicine",
  ];

  function explore(topic: string) {
    setSearch(topic);
    setTimeout(searchResearch, 0);
  }

  return (
    <>
      <PageHeader
        eyebrow="RESEARCH FEED"
        title="Research Articles"
        description="Explore major research areas."
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
              onClick={() => explore(topic)}
            >
              Explore
              <ChevronRight size={16} />
            </button>
          </article>
        ))}
      </div>
    </>
  );
}

function DatasetsPage({
  datasets,
  deleteDataset,
  openCreate,
}: {
  datasets: Dataset[];
  deleteDataset: (id: number) => void;
  openCreate: () => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="DATA MANAGER"
        title="Datasets"
        description="Store and organize research datasets."
        action={
          <button
            className="primary-button"
            onClick={openCreate}
          >
            <Plus size={17} />
            New Dataset
          </button>
        }
      />

      <section className="panel">
        {datasets.length === 0 ? (
          <Empty
            icon={<Database size={30} />}
            title="No datasets"
            text="Create your first research dataset."
            button={
              <button
                className="primary-button"
                onClick={openCreate}
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
      </section>
    </>
  );
}

function NotesPage({
  notes,
  deleteNote,
  openCreate,
}: {
  notes: Note[];
  deleteNote: (id: number) => void;
  openCreate: () => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="IDEA SPACE"
        title="Quick Notes"
        description="Capture research ideas and observations."
        action={
          <button
            className="primary-button"
            onClick={openCreate}
          >
            <Plus size={17} />
            New Note
          </button>
        }
      />

      {notes.length === 0 ? (
        <section className="panel">
          <Empty
            icon={<NotebookPen size={30} />}
            title="Notebook empty"
            text="Create your first research note."
            button={
              <button
                className="primary-button"
                onClick={openCreate}
              >
                Write Note
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
    </>
  );
}

function FilesPage({
  exportData,
}: {
  exportData: () => void;
}) {
  const [folders, setFolders] = useState<string[]>([]);
  const [folder, setFolder] = useState("");
  const [open, setOpen] = useState(false);

  function createFolder() {
    if (!folder.trim()) {
      return;
    }

    setFolders((items) => [...items, folder.trim()]);
    setFolder("");
    setOpen(false);
  }

  return (
    <>
      <PageHeader
        eyebrow="RESEARCH STORAGE"
        title="Files & Folders"
        description="Organize your research workspace."
        action={
          <button
            className="primary-button"
            onClick={() => setOpen(true)}
          >
            <Plus size={17} />
            New Folder
          </button>
        }
      />

      <div className="storage-actions">
        <button
          className="secondary-button"
          onClick={exportData}
        >
          <Upload size={17} />
          Export Data
        </button>

        <label className="secondary-button">
          <FileText size={17} />
          Import File
          <input
            type="file"
            hidden
            onChange={() =>
              window.alert(
                "File selected. Full file-manager storage will be connected in the next stage."
              )
            }
          />
        </label>
      </div>

      <div className="folder-grid">
        {folders.map((item) => (
          <div className="folder-card" key={item}>
            <Folder size={32} />
            <strong>{item}</strong>
            <span>Research folder</span>
          </div>
        ))}
      </div>

      {folders.length === 0 && (
        <section className="panel">
          <Empty
            icon={<Folder size={30} />}
            title="No folders"
            text="Create a folder to organize your research."
            button={
              <button
                className="primary-button"
                onClick={() => setOpen(true)}
              >
                <Plus size={17} />
                Create Folder
              </button>
            }
          />
        </section>
      )}

      {open && (
        <Modal
          title="Create Folder"
          close={() => setOpen(false)}
        >
          <input
            className="modal-input"
            autoFocus
            value={folder}
            onChange={(event) => setFolder(event.target.value)}
            placeholder="Folder name"
          />

          <div className="modal-actions">
            <button
              className="secondary-button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              onClick={createFolder}
            >
              Create
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

function AIPage({
  input,
  setInput,
  answer,
  askAI,
}: {
  input: string;
  setInput: (value: string) => void;
  answer: string;
  askAI: () => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="AI LAB"
        title="Research AI"
        description="Ask questions and work with your research assistant."
      />

      <section className="panel ai-chat">
        <div className="ai-welcome">
          <div className="card-icon">
            <Sparkles size={25} />
          </div>

          <h2>V Research AI</h2>

          <p>
            Ask about research concepts, papers, hypotheses or
            scientific topics.
          </p>
        </div>

        {answer && (
          <div className="ai-answer">
            <strong>AI</strong>
            <p>{answer}</p>
          </div>
        )}

        <div className="ai-input">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask a research question..."
          />

          <button
            className="primary-button"
            onClick={askAI}
          >
            <Sparkles size={17} />
            Ask AI
          </button>
        </div>
      </section>
    </>
  );
}

function ToolsPage({
  calculator,
  setCalculator,
  calculate,
  timer,
  timerRunning,
  setTimerRunning,
  resetTimer,
}: {
  calculator: string;
  setCalculator: (value: string) => void;
  calculate: () => void;
  timer: number;
  timerRunning: boolean;
  setTimerRunning: (value: boolean) => void;
  resetTimer: () => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="LAB TOOLS"
        title="Research Tools"
        description="Utilities for your research workflow."
      />

      <div className="tools-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">CALCULATOR</div>
              <h2>Calculator</h2>
            </div>

            <Calculator size={22} />
          </div>

          <input
            className="calculator-display"
            value={calculator}
            onChange={(event) =>
              setCalculator(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                calculate();
              }
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
                onClick={() =>
                  setCalculator(calculator + key)
                }
              >
                {key}
              </button>
            ))}

            <button onClick={() => setCalculator("")}>
              Clear
            </button>

            <button
              className="calculate-key"
              onClick={calculate}
            >
              =
            </button>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">FOCUS</div>
              <h2>Research Timer</h2>
            </div>

            <Timer size={22} />
          </div>

          <div className="large-timer">
            {formatTimer(timer)}
          </div>

          <div className="timer-controls">
            <button
              className="primary-button"
              onClick={() =>
                setTimerRunning(!timerRunning)
              }
            >
              {timerRunning ? "Pause" : "Start"}
            </button>

            <button
              className="secondary-button"
              onClick={resetTimer}
            >
              Reset
            </button>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">DIRECTION</div>
              <h2>Compass</h2>
            </div>

            <Compass size={22} />
          </div>

          <div className="compass">
            <strong>N</strong>
            <div className="compass-needle">▲</div>
            <strong>S</strong>
          </div>

          <p className="center-text">
            Device orientation support will be connected later.
          </p>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">CONVERSION</div>
              <h2>Unit Converter</h2>
            </div>
          </div>

          <input
            className="modal-input"
            placeholder="Enter value"
            type="number"
          />

          <select className="modal-input">
            <option>Kilograms → Grams</option>
            <option>Grams → Milligrams</option>
            <option>Meters → Centimeters</option>
            <option>Kilometers → Meters</option>
            <option>Celsius → Fahrenheit</option>
          </select>
        </section>
      </div>
    </>
  );
}

function ActivityPage({
  seconds,
  notes,
  datasets,
}: {
  seconds: number;
  notes: number;
  datasets: number;
}) {
  return (
    <>
      <PageHeader
        eyebrow="WORKSPACE MONITOR"
        title="Activity"
        description="Visible information about your current session."
      />

      <div className="dashboard-grid">
        <DashboardCard
          icon={<Clock3 size={24} />}
          title="Session"
          value={formatDuration(seconds)}
          description="Current session"
        />

        <DashboardCard
          icon={<Activity size={24} />}
          title="Status"
          value="Active"
          description="Workspace running"
        />

        <DashboardCard
          icon={<NotebookPen size={24} />}
          title="Notes"
          value={String(notes)}
          description="Saved notes"
        />

        <DashboardCard
          icon={<Database size={24} />}
          title="Datasets"
          value={String(datasets)}
          description="Saved datasets"
        />
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">LIVE LOG</div>
            <h2>Current Session</h2>
          </div>

          <Activity size={22} />
        </div>

        <div className="activity-log">
          <div>
            <span className="status-dot" />
            V Research session active
            <small>{formatDuration(seconds)}</small>
          </div>

          <div>
            <span className="status-dot" />
            Workspace activity recording
            <small>Visible to the user</small>
          </div>
        </div>
      </section>
    </>
  );
}

function SettingsPage({
  dark,
  setDark,
  exportData,
  reset,
}: {
  dark: boolean;
  setDark: (value: boolean) => void;
  exportData: () => void;
  reset: () => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="CONTROL CENTER"
        title="Settings"
        description="Customize your V Research workspace."
      />

      <div className="settings-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">APPEARANCE</div>
              <h2>Theme</h2>
            </div>

            {dark ? <Moon size={22} /> : <Sun size={22} />}
          </div>

          <div className="setting-row">
            <div>
              <strong>Dark Mode</strong>
              <span>Switch between light and dark workspace.</span>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={dark}
                onChange={(event) =>
                  setDark(event.target.checked)
                }
              />
              <span />
            </label>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">DATA</div>
              <h2>Backup</h2>
            </div>

            <Upload size={22} />
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
            onClick={reset}
          >
            <Trash2 size={17} />
            Reset Local Data
          </button>
        </section>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">CUSTOMIZATION</div>
            <h2>Workspace Settings</h2>
          </div>

          <Settings size={22} />
        </div>

        <p>
          Font, text size, accent color, AI assistants,
          accessibility and advanced research preferences will
          be connected here.
        </p>
      </section>
    </>
  );
}

function CameraModal({
  stream,
  close,
}: {
  stream: MediaStream | null;
  close: () => void;
}) {
  const videoRef = (element: HTMLVideoElement | null) => {
    if (element && stream) {
      element.srcObject = stream;
    }
  };

  return (
    <div className="camera-overlay">
      <div className="camera-window">
        <div className="camera-header">
          <div>
            <div className="eyebrow">LIVE CAPTURE</div>
            <h2>Research Camera</h2>
          </div>

          <button className="icon-button" onClick={close}>
            <X size={19} />
          </button>
        </div>

        <div className="camera-preview">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
          />
        </div>

        <div className="camera-controls">
          <button
            className="secondary-button"
            onClick={() =>
              window.alert(
                "Camera switching will be connected in the next camera module."
              )
            }
          >
            Switch Camera
          </button>

          <button
            className="camera-shutter"
            onClick={() =>
              window.alert(
                "Camera preview is active. Capture tools will be expanded next."
              )
            }
          >
            <Camera size={25} />
          </button>

          <button
            className="secondary-button"
            onClick={() =>
              window.alert(
                "Video recording will be added to the camera module."
              )
            }
          >
            Record
          </button>
        </div>
      </div>
    </div>
  );
}

function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: React.ReactNode;
  close: () => void;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-heading">
          <h2>{title}</h2>

          <button className="icon-button" onClick={close}>
            <X size={19} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function Empty({
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

function RefreshIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
    </svg>
  );
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(remaining).padStart(2, "0")
  );
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;

  if (hours > 0) {
    return (
      String(hours) +
      "h " +
      String(minutes).padStart(2, "0") +
      "m"
    );
  }

  return (
    String(minutes) +
    "m " +
    String(remaining).padStart(2, "0") +
    "s"
  );
}
