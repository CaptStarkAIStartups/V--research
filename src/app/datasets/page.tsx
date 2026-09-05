"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowUpRight,
  Database,
  ExternalLink,
  FileText,
  FlaskConical,
  Globe2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import WorkstationShell from "@/components/WorkstationShell";
import { supabase } from "@/lib/supabase";

type Dataset = {
  id: string;
  name: string;
  description: string;
  source: string;
  source_url: string;
  category: string;
  created_at: string;
  updated_at: string;
};

type ResearchResult = {
  title: string;
  description: string;
  url: string;
  source: string;
};

const categories = [
  "All",
  "Biomedical",
  "Genomics",
  "Clinical",
  "AI & Technology",
  "Environmental",
  "Chemistry",
  "Other",
];

export default function DatasetManager() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newCategory, setNewCategory] = useState("Biomedical");

  const [researchQuery, setResearchQuery] = useState("");
  const [researchResults, setResearchResults] = useState<
    ResearchResult[]
  >([]);
  const [researchLoading, setResearchLoading] = useState(false);

  async function loadDatasets() {
    setLoading(true);

    try {
      if (!supabase) {
        setDatasets([]);
        return;
      }

      const { data, error } = await supabase
        .from("datasets")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error(error);
        setDatasets([]);
        return;
      }

      setDatasets((data || []) as Dataset[]);
    } catch {
      setDatasets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDatasets();
  }, []);

  async function addDataset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newName.trim()) return;

    if (!supabase) {
      window.alert(
        "Supabase is not connected in this browser."
      );
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("datasets")
        .insert({
          name: newName.trim(),
          description: newDescription.trim(),
          source: newSource.trim(),
          source_url: newSourceUrl.trim(),
          category: newCategory,
        })
        .select()
        .single();

      if (error) {
        console.error(error);
        window.alert(
          "The dataset could not be saved. Make sure you are signed in."
        );
        return;
      }

      if (data) {
        setDatasets((current) => [
          data as Dataset,
          ...current,
        ]);
      }

      setNewName("");
      setNewDescription("");
      setNewSource("");
      setNewSourceUrl("");
      setNewCategory("Biomedical");
      setShowAdd(false);
    } catch {
      window.alert("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteDataset(id: string) {
    const confirmed = window.confirm(
      "Delete this dataset from your workspace?"
    );

    if (!confirmed || !supabase) return;

    try {
      const { error } = await supabase
        .from("datasets")
        .delete()
        .eq("id", id);

      if (error) {
        window.alert(
          "The dataset could not be deleted."
        );
        return;
      }

      setDatasets((current) =>
        current.filter((dataset) => dataset.id !== id)
      );
    } catch {
      window.alert("Something went wrong.");
    }
  }

  async function searchResearch(event?: FormEvent) {
    event?.preventDefault();

    const query = researchQuery.trim();

    if (!query) return;

    setResearchLoading(true);

    try {
      const response = await fetch(
        `/api/research?q=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Search failed");
      }

      setResearchResults(data?.results || []);
    } catch {
      setResearchResults([]);
    } finally {
      setResearchLoading(false);
    }
  }

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesCategory =
      selectedCategory === "All" ||
      dataset.category === selectedCategory;

    const term = search.toLowerCase();

    const matchesSearch =
      !term ||
      dataset.name.toLowerCase().includes(term) ||
      dataset.description.toLowerCase().includes(term) ||
      dataset.source.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });

  const categoryCount = (category: string) =>
    category === "All"
      ? datasets.length
      : datasets.filter(
          (dataset) => dataset.category === category
        ).length;

  return (
    <WorkstationShell activePath="/datasets">
      <div className="datasets-workspace">
        <section className="datasets-header">
          <div>
            <div className="datasets-eyebrow">
              <Database size={15} />
              DATASET MANAGER
            </div>

            <h1>Research data workspace</h1>

            <p>
              Organize datasets, track their sources, and
              build a structured research data library.
            </p>
          </div>

          <div className="datasets-header-actions">
            <button
              className="datasets-secondary-button"
              onClick={loadDatasets}
              title="Refresh datasets"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              className="datasets-primary-button"
              onClick={() => setShowAdd(true)}
            >
              <Plus size={17} />
              Add dataset
            </button>
          </div>
        </section>

        <section className="datasets-stat-grid">
          <div className="datasets-stat-card">
            <div className="datasets-stat-icon">
              <Database size={19} />
            </div>

            <span>Total datasets</span>
            <strong>{datasets.length}</strong>
          </div>

          <div className="datasets-stat-card">
            <div className="datasets-stat-icon">
              <FlaskConical size={19} />
            </div>

            <span>Research categories</span>
            <strong>
              {
                new Set(
                  datasets.map(
                    (dataset) => dataset.category
                  )
                ).size
              }
            </strong>
          </div>

          <div className="datasets-stat-card">
            <div className="datasets-stat-icon">
              <Globe2 size={19} />
            </div>

            <span>External sources</span>
            <strong>
              {
                new Set(
                  datasets
                    .map((dataset) => dataset.source)
                    .filter(Boolean)
                ).size
              }
            </strong>
          </div>

          <div className="datasets-stat-card">
            <div className="datasets-stat-icon">
              <FileText size={19} />
            </div>

            <span>Visible datasets</span>
            <strong>{filteredDatasets.length}</strong>
          </div>
        </section>

        <section className="datasets-main-grid">
          <div className="datasets-library">
            <div className="datasets-library-toolbar">
              <div>
                <span className="datasets-kicker">
                  DATA LIBRARY
                </span>

                <h2>My datasets</h2>
              </div>

              <div className="datasets-search">
                <Search size={16} />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search datasets..."
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

            <div className="datasets-category-row">
              {categories.map((category) => (
                <button
                  key={category}
                  className={
                    selectedCategory === category
                      ? "datasets-category-active"
                      : ""
                  }
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                >
                  {category}
                  <span>{categoryCount(category)}</span>
                </button>
              ))}
            </div>

            {loading && (
              <div className="datasets-empty">
                <Loader2
                  size={25}
                  className="datasets-spin"
                />

                <strong>Loading your data library</strong>

                <span>
                  Connecting to your research database...
                </span>
              </div>
            )}

            {!loading &&
              filteredDatasets.length === 0 && (
                <div className="datasets-empty">
                  <div className="datasets-empty-icon">
                    <Database size={27} />
                  </div>

                  <h3>No datasets here yet</h3>

                  <p>
                    Add your first research dataset to start
                    building your data library.
                  </p>

                  <button
                    className="datasets-primary-button"
                    onClick={() => setShowAdd(true)}
                  >
                    <Plus size={16} />
                    Add first dataset
                  </button>
                </div>
              )}

            {!loading &&
              filteredDatasets.length > 0 && (
                <div className="datasets-list">
                  {filteredDatasets.map((dataset) => (
                    <article
                      className="dataset-card"
                      key={dataset.id}
                    >
                      <div className="dataset-card-top">
                        <div className="dataset-category">
                          <Database size={14} />
                          {dataset.category}
                        </div>

                        <button
                          className="dataset-delete"
                          onClick={() =>
                            deleteDataset(dataset.id)
                          }
                          aria-label="Delete dataset"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <h3>{dataset.name}</h3>

                      <p>
                        {dataset.description ||
                          "No description added yet."}
                      </p>

                      <div className="dataset-meta">
                        <span>
                          Source:{" "}
                          <strong>
                            {dataset.source || "Not specified"}
                          </strong>
                        </span>

                        <span>
                          Updated{" "}
                          {new Date(
                            dataset.updated_at
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="dataset-actions">
                        {dataset.source_url && (
                          <a
                            href={dataset.source_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open source
                            <ExternalLink size={13} />
                          </a>
                        )}

                        <button
                          onClick={() =>
                            window.alert(
                              "Dataset records workspace will be connected here next."
                            )
                          }
                        >
                          <FileText size={14} />
                          Records
                        </button>

                        <button
                          onClick={() =>
                            window.alert(
                              "Dataset editing will be added in the next Dataset Manager upgrade."
                            )
                          }
                        >
                          Edit
                          <ArrowUpRight size={13} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
          </div>

          <aside className="datasets-sidebar">
            <div className="datasets-side-panel">
              <div className="datasets-side-heading">
                <Globe2 size={18} />

                <div>
                  <span>RESEARCH SEARCH</span>
                  <h3>Find data sources</h3>
                </div>
              </div>

              <form
                className="datasets-research-search"
                onSubmit={searchResearch}
              >
                <Search size={15} />

                <input
                  value={researchQuery}
                  onChange={(event) =>
                    setResearchQuery(event.target.value)
                  }
                  placeholder="Search research..."
                />

                <button
                  type="submit"
                  disabled={researchLoading}
                >
                  {researchLoading ? (
                    <Loader2
                      size={14}
                      className="datasets-spin"
                    />
                  ) : (
                    <ArrowUpRight size={14} />
                  )}
                </button>
              </form>

              <p className="datasets-side-description">
                Search connected research sources and use
                useful publications as dataset references.
              </p>

              {researchResults.length > 0 && (
                <div className="datasets-research-results">
                  {researchResults
                    .slice(0, 5)
                    .map((result, index) => (
                      <a
                        key={`${result.source}-${index}`}
                        href={result.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <div>
                          <span>{result.source}</span>
                          <strong>{result.title}</strong>
                        </div>

                        <ExternalLink size={13} />
                      </a>
                    ))}
                </div>
              )}
            </div>

            <div className="datasets-side-panel">
              <div className="datasets-side-heading">
                <FlaskConical size={18} />

                <div>
                  <span>DATA WORKFLOW</span>
                  <h3>Recommended structure</h3>
                </div>
              </div>

              <div className="datasets-workflow">
                <div>
                  <b>01</b>
                  <span>Find a reliable source</span>
                </div>

                <div>
                  <b>02</b>
                  <span>Save the dataset reference</span>
                </div>

                <div>
                  <b>03</b>
                  <span>Organize records and metadata</span>
                </div>

                <div>
                  <b>04</b>
                  <span>Connect findings to Notes</span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {showAdd && (
          <div
            className="datasets-modal-backdrop"
            onMouseDown={() => setShowAdd(false)}
          >
            <div
              className="datasets-modal"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <div className="datasets-modal-header">
                <div>
                  <span className="datasets-kicker">
                    NEW RESOURCE
                  </span>

                  <h2>Add dataset</h2>
                </div>

                <button
                  className="dataset-modal-close"
                  onClick={() => setShowAdd(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                className="datasets-form"
                onSubmit={addDataset}
              >
                <label>
                  Dataset name
                  <input
                    value={newName}
                    onChange={(event) =>
                      setNewName(event.target.value)
                    }
                    placeholder="e.g. Cancer Genomics Dataset"
                    required
                  />
                </label>

                <label>
                  Description
                  <textarea
                    value={newDescription}
                    onChange={(event) =>
                      setNewDescription(event.target.value)
                    }
                    placeholder="What does this dataset contain?"
                    rows={4}
                  />
                </label>

                <div className="datasets-form-two">
                  <label>
                    Category
                    <select
                      value={newCategory}
                      onChange={(event) =>
                        setNewCategory(event.target.value)
                      }
                    >
                      {categories
                        .filter(
                          (category) => category !== "All"
                        )
                        .map((category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        ))}
                    </select>
                  </label>

                  <label>
                    Source
                    <input
                      value={newSource}
                      onChange={(event) =>
                        setNewSource(event.target.value)
                      }
                      placeholder="PubMed, Kaggle, NIH..."
                    />
                  </label>
                </div>

                <label>
                  Source URL
                  <input
                    type="url"
                    value={newSourceUrl}
                    onChange={(event) =>
                      setNewSourceUrl(event.target.value)
                    }
                    placeholder="https://..."
                  />
                </label>

                <div className="datasets-form-actions">
                  <button
                    type="button"
                    className="datasets-secondary-button"
                    onClick={() => setShowAdd(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="datasets-primary-button"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2
                          size={15}
                          className="datasets-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus size={15} />
                        Save dataset
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
