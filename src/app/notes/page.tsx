"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Archive,
  Bookmark,
  Check,
  FileText,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import WorkstationShell from "@/components/WorkstationShell";
import { supabase } from "@/lib/supabase";

type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

const defaultTags = [
  "All",
  "Research",
  "Idea",
  "Experiment",
  "Literature",
  "Hypothesis",
  "Important",
];

export default function KnowledgeNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [pinned, setPinned] = useState(false);

  async function loadNotes() {
    setLoading(true);

    try {
      if (!supabase) {
        setNotes([]);
        return;
      }

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error(error);
        setNotes([]);
        return;
      }

      setNotes((data || []) as Note[]);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  function openNewNote() {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setTagsText("");
    setPinned(false);
    setEditorOpen(true);
  }

  function openEditNote(note: Note) {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTagsText(note.tags?.join(", ") || "");
    setPinned(note.pinned);
    setEditorOpen(true);
  }

  async function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) return;

    if (!supabase) {
      window.alert("Supabase is not connected.");
      return;
    }

    setSaving(true);

    const tags = tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      if (selectedNote) {
        const { data, error } = await supabase
          .from("notes")
          .update({
            title: title.trim(),
            content,
            tags,
            pinned,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedNote.id)
          .select()
          .single();

        if (error) {
          console.error(error);
          window.alert("Unable to update this note.");
          return;
        }

        if (data) {
          setNotes((current) =>
            current.map((note) =>
              note.id === selectedNote.id
                ? (data as Note)
                : note
            )
          );
        }
      } else {
        const { data, error } = await supabase
          .from("notes")
          .insert({
            title: title.trim(),
            content,
            tags,
            pinned,
          })
          .select()
          .single();

        if (error) {
          console.error(error);
          window.alert(
            "Unable to save the note. Make sure you are signed in."
          );
          return;
        }

        if (data) {
          setNotes((current) => [
            data as Note,
            ...current,
          ]);
        }
      }

      setEditorOpen(false);
      setSelectedNote(null);
    } catch {
      window.alert("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(id: string) {
    const confirmed = window.confirm(
      "Delete this note permanently?"
    );

    if (!confirmed || !supabase) return;

    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", id);

      if (error) {
        window.alert("Unable to delete this note.");
        return;
      }

      setNotes((current) =>
        current.filter((note) => note.id !== id)
      );

      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    } catch {
      window.alert("Something went wrong.");
    }
  }

  async function togglePin(note: Note) {
    if (!supabase) return;

    const nextPinned = !note.pinned;

    try {
      const { data, error } = await supabase
        .from("notes")
        .update({
          pinned: nextPinned,
          updated_at: new Date().toISOString(),
        })
        .eq("id", note.id)
        .select()
        .single();

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        setNotes((current) =>
          current.map((item) =>
            item.id === note.id ? (data as Note) : item
          )
        );
      }
    } catch {}
  }

  const availableTags = useMemo(() => {
    const generated = notes.flatMap(
      (note) => note.tags || []
    );

    return Array.from(
      new Set([...defaultTags, ...generated])
    );
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const term = search.toLowerCase().trim();

    return notes
      .filter((note) => {
        const matchesSearch =
          !term ||
          note.title.toLowerCase().includes(term) ||
          note.content.toLowerCase().includes(term) ||
          (note.tags || []).some((tag) =>
            tag.toLowerCase().includes(term)
          );

        const matchesTag =
          selectedTag === "All" ||
          (selectedTag === "Important"
            ? note.pinned
            : (note.tags || []).some(
                (tag) =>
                  tag.toLowerCase() ===
                  selectedTag.toLowerCase()
              ));

        return matchesSearch && matchesTag;
      })
      .sort(
        (a, b) =>
          Number(b.pinned) - Number(a.pinned) ||
          new Date(b.updated_at).getTime() -
            new Date(a.updated_at).getTime()
      );
  }, [notes, search, selectedTag]);

  const pinnedCount = notes.filter(
    (note) => note.pinned
  ).length;

  return (
    <WorkstationShell activePath="/notes">
      <div className="notes-workspace">
        <section className="notes-header">
          <div>
            <div className="notes-eyebrow">
              <FileText size={15} />
              KNOWLEDGE & NOTES
            </div>

            <h1>Research knowledge base</h1>

            <p>
              Capture ideas, observations, hypotheses and
              important findings in one organized workspace.
            </p>
          </div>

          <div className="notes-header-actions">
            <button
              className="notes-secondary-button"
              onClick={loadNotes}
            >
              <RefreshCw size={15} />
              Refresh
            </button>

            <button
              className="notes-primary-button"
              onClick={openNewNote}
            >
              <Plus size={16} />
              New note
            </button>
          </div>
        </section>

        <section className="notes-stat-grid">
          <div className="notes-stat-card">
            <div className="notes-stat-icon">
              <FileText size={18} />
            </div>

            <span>Total notes</span>
            <strong>{notes.length}</strong>
          </div>

          <div className="notes-stat-card">
            <div className="notes-stat-icon">
              <Pin size={18} />
            </div>

            <span>Pinned knowledge</span>
            <strong>{pinnedCount}</strong>
          </div>

          <div className="notes-stat-card">
            <div className="notes-stat-icon">
              <Bookmark size={18} />
            </div>

            <span>Research tags</span>
            <strong>
              {Math.max(0, availableTags.length - 7)}
            </strong>
          </div>

          <div className="notes-stat-card">
            <div className="notes-stat-icon">
              <Archive size={18} />
            </div>

            <span>Visible notes</span>
            <strong>{filteredNotes.length}</strong>
          </div>
        </section>

        <section className="notes-main-grid">
          <div className="notes-library">
            <div className="notes-toolbar">
              <div>
                <span className="notes-kicker">
                  KNOWLEDGE LIBRARY
                </span>

                <h2>Your notes</h2>
              </div>

              <div className="notes-search">
                <Search size={16} />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search notes, ideas, tags..."
                />

                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="notes-tag-row">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  className={
                    selectedTag === tag
                      ? "notes-tag-active"
                      : ""
                  }
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>

            {loading && (
              <div className="notes-empty">
                <RefreshCw
                  size={25}
                  className="notes-spin"
                />

                <strong>Loading knowledge base</strong>

                <span>
                  Connecting to your research notes...
                </span>
              </div>
            )}

            {!loading &&
              filteredNotes.length === 0 && (
                <div className="notes-empty">
                  <div className="notes-empty-icon">
                    <FileText size={27} />
                  </div>

                  <h3>
                    {notes.length === 0
                      ? "Your knowledge base is empty"
                      : "No matching notes"}
                  </h3>

                  <p>
                    {notes.length === 0
                      ? "Create your first research note to start building your knowledge base."
                      : "Try another search or reset your filters."}
                  </p>

                  {notes.length === 0 ? (
                    <button
                      className="notes-primary-button"
                      onClick={openNewNote}
                    >
                      <Plus size={15} />
                      Create first note
                    </button>
                  ) : (
                    <button
                      className="notes-secondary-button"
                      onClick={() => {
                        setSearch("");
                        setSelectedTag("All");
                      }}
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              )}

            {!loading &&
              filteredNotes.length > 0 && (
                <div className="notes-list">
                  {filteredNotes.map((note) => (
                    <article
                      className={`note-card ${
                        selectedNote?.id === note.id
                          ? "note-card-selected"
                          : ""
                      }`}
                      key={note.id}
                      onClick={() => openEditNote(note)}
                    >
                      <div className="note-card-top">
                        <div className="note-card-label">
                          {note.pinned && (
                            <Pin
                              size={13}
                              fill="currentColor"
                            />
                          )}

                          <span>
                            {note.pinned
                              ? "PINNED"
                              : "NOTE"}
                          </span>
                        </div>

                        <div className="note-card-date">
                          {new Date(
                            note.updated_at
                          ).toLocaleDateString()}
                        </div>
                      </div>

                      <h3>{note.title}</h3>

                      <p>
                        {note.content ||
                          "No content added yet."}
                      </p>

                      {note.tags?.length > 0 && (
                        <div className="note-card-tags">
                          {note.tags
                            .slice(0, 5)
                            .map((tag) => (
                              <span key={tag}>
                                {tag}
                              </span>
                            ))}
                        </div>
                      )}

                      <div className="note-card-actions">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            togglePin(note);
                          }}
                        >
                          <Pin size={13} />
                          {note.pinned
                            ? "Unpin"
                            : "Pin"}
                        </button>

                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteNote(note.id);
                          }}
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
          </div>

          <aside className="notes-sidebar">
            <div className="notes-side-panel notes-quick-panel">
              <div className="notes-side-heading">
                <Sparkles size={18} />

                <div>
                  <span>QUICK CAPTURE</span>
                  <h3>Research thought</h3>
                </div>
              </div>

              <p>
                Quickly capture an idea before it gets lost.
              </p>

              <button
                className="notes-quick-button"
                onClick={openNewNote}
              >
                <Plus size={15} />
                Capture new thought
              </button>
            </div>

            <div className="notes-side-panel">
              <div className="notes-side-heading">
                <Pin size={18} />

                <div>
                  <span>PINNED</span>
                  <h3>Important knowledge</h3>
                </div>
              </div>

              {pinnedCount === 0 ? (
                <p className="notes-side-muted">
                  Pin important research notes and they will
                  appear here.
                </p>
              ) : (
                <div className="notes-pinned-list">
                  {notes
                    .filter((note) => note.pinned)
                    .slice(0, 5)
                    .map((note) => (
                      <button
                        key={note.id}
                        onClick={() => openEditNote(note)}
                      >
                        <Pin size={12} />
                        <span>{note.title}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div className="notes-side-panel">
              <div className="notes-side-heading">
                <Bookmark size={18} />

                <div>
                  <span>WORKFLOW</span>
                  <h3>Organize your research</h3>
                </div>
              </div>

              <div className="notes-workflow">
                <div>
                  <b>01</b>
                  <span>Capture the observation</span>
                </div>

                <div>
                  <b>02</b>
                  <span>Add a useful tag</span>
                </div>

                <div>
                  <b>03</b>
                  <span>Pin important findings</span>
                </div>

                <div>
                  <b>04</b>
                  <span>Connect notes to sources</span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {editorOpen && (
          <div
            className="notes-modal-backdrop"
            onMouseDown={() => setEditorOpen(false)}
          >
            <div
              className="notes-modal"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <div className="notes-modal-header">
                <div>
                  <span className="notes-kicker">
                    {selectedNote
                      ? "EDIT KNOWLEDGE"
                      : "NEW KNOWLEDGE"}
                  </span>

                  <h2>
                    {selectedNote
                      ? "Edit note"
                      : "Create research note"}
                  </h2>
                </div>

                <button
                  className="notes-close-button"
                  onClick={() => setEditorOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form
                className="notes-form"
                onSubmit={saveNote}
              >
                <label>
                  Title
                  <input
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    placeholder="e.g. CRISPR research hypothesis"
                    required
                  />
                </label>

                <label>
                  Research note
                  <textarea
                    value={content}
                    onChange={(event) =>
                      setContent(event.target.value)
                    }
                    placeholder="Write your observation, hypothesis, research finding or idea..."
                    rows={10}
                  />
                </label>

                <label>
                  Tags
                  <input
                    value={tagsText}
                    onChange={(event) =>
                      setTagsText(event.target.value)
                    }
                    placeholder="Research, Hypothesis, Important"
                  />
                  <small>
                    Separate multiple tags with commas.
                  </small>
                </label>

                <button
                  type="button"
                  className={`notes-pin-toggle ${
                    pinned
                      ? "notes-pin-toggle-active"
                      : ""
                  }`}
                  onClick={() => setPinned(!pinned)}
                >
                  <Pin
                    size={15}
                    fill={pinned ? "currentColor" : "none"}
                  />
                  {pinned
                    ? "Pinned as important"
                    : "Pin this note"}
                </button>

                <div className="notes-form-actions">
                  <button
                    type="button"
                    className="notes-secondary-button"
                    onClick={() =>
                      setEditorOpen(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="notes-primary-button"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <RefreshCw
                          size={14}
                          className="notes-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={15} />
                        Save note
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </WorkstationShell>
  );
}
