"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import WorkstationShell from "@/components/WorkstationShell";
import { supabase } from "@/lib/supabase";
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
  Plus,
  RefreshCcw,
  Search,
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
  file_type?: string | null;
  size?: number | null;
  storage_path?: string | null;
  created_at?: string;
};

export default function FilesPage() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [view, setView] = useState<"grid" | "list">("grid");

  const [folderName, setFolderName] = useState("");
  const [showFolderModal, setShowFolderModal] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadWorkspace();
  }, []);

  async function loadWorkspace() {
    setLoading(true);
    setError("");

    try {
      const [foldersResponse, filesResponse] = await Promise.all([
        fetch("/api/folders", { cache: "no-store" }),
        fetch("/api/files", { cache: "no-store" }),
      ]);

      const foldersData = await foldersResponse.json();
      const filesData = await filesResponse.json();

      if (!foldersResponse.ok) {
        throw new Error(
          foldersData?.error || "Unable to load folders."
        );
      }

      if (!filesResponse.ok) {
        throw new Error(
          filesData?.error || "Unable to load files."
        );
      }

      setFolders(foldersData.folders || []);
      setFiles(filesData.files || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your workspace."
      );
    } finally {
      setLoading(false);
    }
  }

  const currentFolderName =
    folders.find((folder) => folder.id === currentFolder)?.name ||
    "My Files";

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

  const totalSize = files.reduce(
    (sum, file) => sum + Number(file.size || 0),
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

  function showMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  }

  async function createFolder() {
    const name = folderName.trim();

    if (!name) {
      setError("Enter a folder name.");
      return;
    }

    setError("");

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          parent_id: currentFolder,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to create folder.");
      }

      setFolders((previous) => [
        ...previous,
        data.folder,
      ]);

      setFolderName("");
      setShowFolderModal(false);

      showMessage("Folder created successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create folder."
      );
    }
  }

  async function deleteFolder(id: string) {
    const folder = folders.find((item) => item.id === id);

    if (!folder) return;

    const confirmed = window.confirm(
      `Delete "${folder.name}" and its files?`
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch("/api/folders", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to delete folder."
        );
      }

      setFolders((previous) =>
        previous.filter((item) => item.id !== id)
      );

      setFiles((previous) =>
        previous.filter((file) => file.folder_id !== id)
      );

      if (currentFolder === id) {
        setCurrentFolder(folder.parent_id);
      }

      showMessage("Folder deleted.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete folder."
      );
    }
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  }

  async function uploadFile() {
    if (!selectedFile) {
      setError("Choose a file first.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);

      if (currentFolder) {
        formData.append("folder_id", currentFolder);
      }

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Upload failed.");
      }

      setFiles((previous) => [
        data.file,
        ...previous,
      ]);

      setSelectedFile(null);
      setShowUploadModal(false);

      showMessage("File uploaded successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload file."
      );
    } finally {
      setUploading(false);
    }
  }

  async function deleteFile(file: FileItem) {
    const confirmed = window.confirm(
      `Delete "${file.name}" permanently?`
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch("/api/files", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: file.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to delete file."
        );
      }

      setFiles((previous) =>
        previous.filter((item) => item.id !== file.id)
      );

      showMessage("File permanently deleted.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete file."
      );
    }
  }

  async function openFile(file: FileItem) {
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    if (!file.storage_path) {
      setError("This file has no storage path.");
      return;
    }

    try {
      const { data, error: signedUrlError } =
        await supabase.storage
          .from("research-files")
          .createSignedUrl(file.storage_path, 60 * 10);

      if (signedUrlError || !data?.signedUrl) {
        throw new Error(
          signedUrlError?.message ||
            "Unable to create a secure file link."
        );
      }

      window.open(data.signedUrl, "_blank");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to open file."
      );
    }
  }

  async function downloadFile(file: FileItem) {
    await openFile(file);
  }

  function resetWorkspace() {
    setSearch("");
    setCurrentFolder(null);
    setSortBy("name");
    setView("grid");
    setError("");
    showMessage("Workspace view reset.");
  }

  function getFileIcon(file: FileItem) {
    const type = `${file.file_type || ""} ${file.name}`.toLowerCase();

    if (type.includes("pdf")) {
      return <FileText size={26} />;
    }

    if (
      type.includes("csv") ||
      type.includes("sheet") ||
      type.includes("excel")
    ) {
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
              Your real research file library — organized,
              searchable and connected to secure storage.
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

        {error && (
          <div className="vr-files-error">
            <span>{error}</span>

            <button onClick={() => setError("")}>
              <X size={15} />
            </button>
          </div>
        )}

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
            <span>Storage Used</span>
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
                          (child) =>
                            child.parent_id === folder.id
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
                <span>
                  {formatSize(totalSize)} used
                </span>
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
                    placeholder="Search files and folders..."
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

            {loading ? (
              <div className="vr-files-loading">
                <RefreshCcw size={24} />
                <span>Loading your research workspace...</span>
              </div>
            ) : (
              <>
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
                              <strong>
                                {folder.name}
                              </strong>

                              <span>
                                {
                                  folders.filter(
                                    (child) =>
                                      child.parent_id ===
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
                      onClick={() =>
                        setShowUploadModal(true)
                      }
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
                        Upload your first research document
                        to this location.
                      </p>

                      <button
                        className="vr-primary-button"
                        onClick={() =>
                          setShowUploadModal(true)
                        }
                      >
                        <Upload size={16} />
                        Upload File
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
                                deleteFile(file)
                              }
                              title="Delete file"
                            >
                              <Trash2 size={15} />
                            </button>

                          </div>

                          <strong title={file.name}>
                            {file.name}
                          </strong>

                          <span>
                            {file.file_type || "file"} ·{" "}
                            {formatSize(
                              Number(file.size || 0)
                            )}
                          </span>

                          <div className="vr-file-card-footer">

                            <button
                              onClick={() =>
                                openFile(file)
                              }
                            >
                              Open
                            </button>

                            <button
                              onClick={() =>
                                downloadFile(file)
                              }
                              title="Download"
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
                              <strong>
                                {file.name}
                              </strong>

                              <span>
                                {file.file_type || "file"}
                              </span>
                            </div>

                          </div>

                          <span>
                            {formatSize(
                              Number(file.size || 0)
                            )}
                          </span>

                          <span>
                            <Clock3 size={14} />
                            Research file
                          </span>

                          <div>
                            <button
                              className="vr-card-menu"
                              onClick={() =>
                                openFile(file)
                              }
                              title="Open"
                            >
                              <Download size={15} />
                            </button>

                            <button
                              className="vr-card-menu"
                              onClick={() =>
                                deleteFile(file)
                              }
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                        </div>
                      ))}

                    </div>
                  )}

                </div>
              </>
            )}

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
                    REAL STORAGE
                  </span>

                  <h2>Upload Research File</h2>
                </div>

                <button
                  className="vr-icon-button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                  }}
                >
                  <X size={18} />
                </button>

              </div>

              <label className="vr-real-upload">

                <Upload size={31} />

                <strong>
                  Choose a file
                </strong>

                <span>
                  Uploading to your private
                  research-files storage.
                </span>

                <input
                  type="file"
                  onChange={chooseFile}
                />

              </label>

              {selectedFile && (
                <div className="vr-selected-file">

                  <div className="vr-file-icon small">
                    <File size={20} />
                  </div>

                  <div>
                    <strong>
                      {selectedFile.name}
                    </strong>

                    <span>
                      {formatSize(selectedFile.size)}
                    </span>
                  </div>

                </div>
              )}

              <div className="vr-upload-destination">

                <span>Destination</span>

                <strong>
                  📁 {currentFolderName}
                </strong>

              </div>

              <div className="vr-modal-actions">

                <button
                  className="vr-secondary-button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                  }}
                  disabled={uploading}
                >
                  Cancel
                </button>

                <button
                  className="vr-primary-button"
                  onClick={uploadFile}
                  disabled={
                    uploading || !selectedFile
                  }
                >
                  <Upload size={16} />

                  {uploading
                    ? "Uploading..."
                    : "Upload File"}
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
    </WorkstationShell>
  );
}
