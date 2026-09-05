"use client";

import { useEffect, useMemo, useState } from "react";
import WorkstationShell from "@/components/WorkstationShell";
import {
  Archive,
  ChevronRight,
  Clock3,
  Download,
  File,
  FileText,
  Folder,
  FolderPlus,
  Grid3X3,
  List,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Search,
  SortAsc,
  Trash2,
  Upload,
  X,
} from "lucide-react";

type FolderItem = {
  id: string;
  name: string;
  parent_id: string | null;
  created_at?: string;
};

type FileItem = {
  id: string;
  name: string;
  folder_id: string | null;
  file_type?: string;
  size?: number | null;
  storage_path?: string | null;
  created_at?: string;
};

const demoFolders: FolderItem[] = [
  { id: "research", name: "Research", parent_id: null },
  { id: "papers", name: "Papers", parent_id: "research" },
  { id: "references", name: "References", parent_id: "research" },
  { id: "datasets", name: "Datasets", parent_id: null },
  { id: "experiments", name: "Experiments", parent_id: null },
];

const demoFiles: FileItem[] = [
  {
    id: "1",
    name: "Research Notes.pdf",
    folder_id: "research",
    file_type: "pdf",
    size: 2400000,
  },
  {
    id: "2",
    name: "Cancer Research Review.pdf",
    folder_id: "papers",
    file_type: "pdf",
    size: 5300000,
  },
  {
    id: "3",
    name: "Gene Editing References.docx",
    folder_id: "references",
    file_type: "document",
    size: 1800000,
  },
  {
    id: "4",
    name: "Experiment Data.csv",
    folder_id: "datasets",
    file_type: "spreadsheet",
    size: 740000,
  },
];

export default function FilesPage() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [view, setView] = useState<"grid" | "list">("grid");

  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");

  const [showUploadModal, setShowUploadModal] = useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    try {
      const folderResponse = await fetch("/api/folders");

      if (folderResponse.ok) {
        const folderData = await folderResponse.json();
        setFolders(folderData.folders || []);
      } else {
        setFolders(demoFolders);
      }

      const fileResponse = await fetch("/api/files");

      if (fileResponse.ok) {
        const fileData = await fileResponse.json();
        setFiles(fileData.files || []);
      } else {
        setFiles(demoFiles);
      }
    } catch {
      setFolders(demoFolders);
      setFiles(demoFiles);
    }
  }

  const visibleFolders = useMemo(() => {
    return folders
      .filter((folder) => folder.parent_id === currentFolder)
      .filter((folder) =>
        folder.name.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [folders, currentFolder, search]);

  const visibleFiles = useMemo(() => {
    const result = files.filter(
      (file) =>
        file.folder_id === currentFolder &&
        file.name.toLowerCase().includes(search.toLowerCase())
    );

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    }

    if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.created_at || 0).getTime() -
          new Date(b.created_at || 0).getTime()
      );
    }

    if (sortBy === "type") {
      result.sort((a, b) =>
        (a.file_type || "").localeCompare(b.file_type || "")
      );
    }

    return result;
  }, [files, currentFolder, search, sortBy]);

  const currentFolderName =
    folders.find((folder) => folder.id === currentFolder)?.name || "My Files";

  const totalSize = files.reduce(
    (sum, file) => sum + (file.size || 0),
    0
  );

  function formatSize(bytes: number) {
    if (!bytes) return "—";

    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unit = 0;

    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit++;
    }

    return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unit]}`;
  }

  function createFolder() {
    if (!folderName.trim()) return;

    const newFolder: FolderItem = {
      id: `local-${Date.now()}`,
      name: folderName.trim(),
      parent_id: currentFolder,
    };

    setFolders((previous) => [...previous, newFolder]);
    setFolderName("");
    setShowFolderModal(false);

    showMessage("Folder created successfully.");
  }

  function deleteFolder(id: string) {
    const folder = folders.find((item) => item.id === id);
    if (!folder) return;

    const children = folders.filter((item) => item.parent_id === id);

    if (children.length > 0) {
      showMessage("Move or delete the subfolders first.");
      return;
    }

    setFolders((previous) =>
      previous.filter((item) => item.id !== id)
    );

    setFiles((previous) =>
      previous.filter((file) => file.folder_id !== id)
    );

    showMessage("Folder deleted.");
  }

  function deleteFile(id: string) {
    setFiles((previous) =>
      previous.filter((file) => file.id !== id)
    );

    showMessage("File removed from the workspace.");
  }

  function showMessage(text: string) {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  function resetWorkspace() {
    setSearch("");
    setCurrentFolder(null);
    setSortBy("name");
    setView("grid");

    showMessage("File workspace reset.");
  }

  function getFileIcon(file: FileItem) {
    if (file.file_type === "pdf") {
      return <FileText size={26} />;
    }

    if (file.file_type === "spreadsheet") {
      return <Archive size={26} />;
    }

    return <File size={26} />;
  }

  return (
    <WorkstationShell activePath="/files">
      <div className="vr-files-page">

        <div className="vr-page-header">
          <div>
            <div className="vr-eyebrow">
              V RESEARCH / FILE SYSTEM
            </div>

            <h1>Files & Folders</h1>

            <p>
              Organize papers, datasets, experiments, references,
              and research documents in one workspace.
            </p>
          </div>

          <div className="vr-page-actions">
            <button
              className="vr-secondary-button"
              onClick={resetWorkspace}
            >
              <RefreshCcw size={17} />
              Reset
            </button>

            <button
              className="vr-secondary-button"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload size={17} />
              Upload
            </button>

            <button
              className="vr-primary-button"
              onClick={() => setShowFolderModal(true)}
            >
              <FolderPlus size={17} />
              New Folder
            </button>
          </div>
        </div>

        <div className="vr-files-stats">
          <div>
            <span>Folders</span>
            <strong>{folders.length}</strong>
          </div>

          <div>
            <span>Files</span>
            <strong>{files.length}</strong>
          </div>

          <div>
            <span>Workspace Size</span>
            <strong>{formatSize(totalSize)}</strong>
          </div>

          <div>
            <span>Current Location</span>
            <strong>{currentFolderName}</strong>
          </div>
        </div>

        <div className="vr-files-layout">

          <aside className="vr-files-sidebar">

            <div className="vr-files-sidebar-title">
              <span>Folders</span>

              <button
                className="vr-small-icon"
                onClick={() => setShowFolderModal(true)}
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              className={`vr-folder-tree-item ${
                currentFolder === null
                  ? "vr-folder-tree-active"
                  : ""
              }`}
              onClick={() => setCurrentFolder(null)}
            >
              <Folder size={17} />
              <span>My Files</span>
            </button>

            {folders
              .filter((folder) => folder.parent_id === null)
              .map((folder) => (
                <div key={folder.id}>

                  <button
                    className={`vr-folder-tree-item ${
                      currentFolder === folder.id
                        ? "vr-folder-tree-active"
                        : ""
                    }`}
                    onClick={() =>
                      setCurrentFolder(folder.id)
                    }
                  >
                    <Folder size={17} />
                    <span>{folder.name}</span>

                    <span className="vr-folder-count">
                      {
                        folders.filter(
                          (item) =>
                            item.parent_id === folder.id
                        ).length
                      }
                    </span>
                  </button>

                  {folders
                    .filter(
                      (child) =>
                        child.parent_id === folder.id
                    )
                    .map((child) => (
                      <button
                        key={child.id}
                        className={`vr-folder-tree-item vr-folder-child ${
                          currentFolder === child.id
                            ? "vr-folder-tree-active"
                            : ""
                        }`}
                        onClick={() =>
                          setCurrentFolder(child.id)
                        }
                      >
                        <Folder size={15} />
                        <span>{child.name}</span>
                      </button>
                    ))}
                </div>
              ))}

            <div className="vr-storage-card">
              <div className="vr-storage-icon">
                <Archive size={18} />
              </div>

              <div>
                <strong>Research Storage</strong>
                <span>{formatSize(totalSize)} used</span>
              </div>

              <div className="vr-storage-bar">
                <span />
              </div>
            </div>
          </aside>

          <section className="vr-files-main">

            <div className="vr-files-toolbar">

              <div className="vr-breadcrumbs">
                <button
                  onClick={() => setCurrentFolder(null)}
                >
                  My Files
                </button>

                {currentFolder && (
                  <>
                    <ChevronRight size={15} />

                    <span>{currentFolderName}</span>
                  </>
                )}
              </div>

              <div className="vr-files-toolbar-right">

                <div className="vr-file-search">
                  <Search size={17} />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search files..."
                  />

                  {search && (
                    <button
                      onClick={() => setSearch("")}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value)
                  }
                  className="vr-sort-select"
                >
                  <option value="name">Name</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="type">File type</option>
                </select>

                <button
                  className={`vr-view-button ${
                    view === "grid"
                      ? "vr-view-active"
                      : ""
                  }`}
                  onClick={() => setView("grid")}
                >
                  <Grid3X3 size={17} />
                </button>

                <button
                  className={`vr-view-button ${
                    view === "list"
                      ? "vr-view-active"
                      : ""
                  }`}
                  onClick={() => setView("list")}
                >
                  <List size={17} />
                </button>
              </div>
            </div>

            {visibleFolders.length > 0 && (
              <div className="vr-files-section">

                <div className="vr-files-section-header">
                  <div>
                    <h2>Folders</h2>
                    <span>
                      {visibleFolders.length} folders
                    </span>
                  </div>
                </div>

                <div className="vr-folder-grid">
                  {visibleFolders.map((folder) => (
                    <div
                      className="vr-folder-card"
                      key={folder.id}
                    >
                      <button
                        className="vr-folder-open"
                        onClick={() =>
                          setCurrentFolder(folder.id)
                        }
                      >
                        <Folder size={29} />

                        <div>
                          <strong>{folder.name}</strong>

                          <span>
                            {
                              folders.filter(
                                (item) =>
                                  item.parent_id ===
                                  folder.id
                              ).length
                            }{" "}
                            subfolders
                          </span>
                        </div>
                      </button>

                      <button
                        className="vr-card-menu"
                        onClick={() =>
                          deleteFolder(folder.id)
                        }
                        title="Delete folder"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="vr-files-section">

              <div className="vr-files-section-header">
                <div>
                  <h2>Files</h2>
                  <span>
                    {visibleFiles.length} items
                  </span>
                </div>

                <button
                  className="vr-inline-action"
                  onClick={() => setShowUploadModal(true)}
                >
                  <Upload size={15} />
                  Add file
                </button>
              </div>

              {visibleFiles.length === 0 ? (
                <div className="vr-empty-files">
                  <div className="vr-empty-icon">
                    <File size={28} />
                  </div>

                  <h3>No files here yet</h3>

                  <p>
                    Upload research documents or move files
                    into this folder.
                  </p>

                  <button
                    className="vr-primary-button"
                    onClick={() =>
                      setShowUploadModal(true)
                    }
                  >
                    <Upload size={16} />
                    Add a file
                  </button>
                </div>
              ) : view === "grid" ? (
                <div className="vr-file-grid">

                  {visibleFiles.map((file) => (
                    <div
                      className="vr-file-card"
                      key={file.id}
                    >
                      <div className="vr-file-card-top">
                        <div className="vr-file-icon">
                          {getFileIcon(file)}
                        </div>

                        <button
                          className="vr-card-menu"
                          onClick={() =>
                            deleteFile(file.id)
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <strong>{file.name}</strong>

                      <span>
                        {file.file_type || "file"} ·{" "}
                        {formatSize(file.size || 0)}
                      </span>

                      <div className="vr-file-card-footer">
                        <button
                          onClick={() =>
                            showMessage(
                              "File preview will be connected to Supabase Storage next."
                            )
                          }
                        >
                          Open
                        </button>

                        <button
                          onClick={() =>
                            showMessage(
                              "Download will be enabled after Storage is connected."
                            )
                          }
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                </div>
              ) : (
                <div className="vr-file-list">

                  {visibleFiles.map((file) => (
                    <div
                      className="vr-file-list-row"
                      key={file.id}
                    >
                      <div className="vr-file-list-name">
                        <div className="vr-file-icon small">
                          {getFileIcon(file)}
                        </div>

                        <div>
                          <strong>{file.name}</strong>
                          <span>
                            {file.file_type || "file"}
                          </span>
                        </div>
                      </div>

                      <span>
                        {formatSize(file.size || 0)}
                      </span>

                      <span>
                        <Clock3 size={14} />
                        Research file
                      </span>

                      <button
                        className="vr-card-menu"
                        onClick={() =>
                          deleteFile(file.id)
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}

                </div>
              )}
            </div>

          </section>
        </div>

        {message && (
          <div className="vr-toast">
            {message}
          </div>
        )}

        {showFolderModal && (
          <div className="vr-modal-backdrop">
            <div className="vr-modal">

              <div className="vr-modal-header">
                <div>
                  <span className="vr-eyebrow">
                    FILE SYSTEM
                  </span>
                  <h2>Create Folder</h2>
                </div>

                <button
                  className="vr-icon-button"
                  onClick={() =>
                    setShowFolderModal(false)
                  }
                >
                  <X size={18} />
                </button>
              </div>

              <label>Folder name</label>

              <input
                autoFocus
                value={folderName}
                onChange={(event) =>
                  setFolderName(event.target.value)
                }
                placeholder="e.g. Literature Review"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    createFolder();
                  }
                }}
              />

              <div className="vr-modal-actions">
                <button
                  className="vr-secondary-button"
                  onClick={() =>
                    setShowFolderModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="vr-primary-button"
                  onClick={createFolder}
                >
                  <FolderPlus size={16} />
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        )}

        {showUploadModal && (
          <div className="vr-modal-backdrop">
            <div className="vr-modal">

              <div className="vr-modal-header">
                <div>
                  <span className="vr-eyebrow">
                    FILE SYSTEM
                  </span>
                  <h2>Add Research File</h2>
                </div>

                <button
                  className="vr-icon-button"
                  onClick={() =>
                    setShowUploadModal(false)
                  }
                >
                  <X size={18} />
                </button>
              </div>

              <div className="vr-upload-zone">
                <Upload size={32} />

                <strong>
                  File upload interface ready
                </strong>

                <span>
                  Supabase Storage will be connected here
                  so your actual research files can be
                  uploaded and stored securely.
                </span>
              </div>

              <div className="vr-modal-actions">
                <button
                  className="vr-secondary-button"
                  onClick={() =>
                    setShowUploadModal(false)
                  }
                >
                  Close
                </button>

                <button
                  className="vr-primary-button"
                  onClick={() => {
                    setShowUploadModal(false);
                    showMessage(
                      "Storage connection is the next step."
                    );
                  }}
                >
                  <Upload size={16} />
                  Continue
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </WorkstationShell>
  );
}
