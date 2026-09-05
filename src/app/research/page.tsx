"use client";

import { FormEvent, useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  Check,
  ExternalLink,
  FileText,
  FlaskConical,
  Globe2,
  Loader2,
  Search,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import WorkstationShell from "@/components/WorkstationShell";

type ResearchResult = {
  title: string;
  description: string;
  url: string;
  source: string;
};

const sourceIcons: Record<string, React.ReactNode> = {
  Wikipedia: <Globe2 size={15} />,
  OpenAlex: <FlaskConical size={15} />,
  PubMed: <Stethoscope size={15} />,
};

export default function ResearchExplorer() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("All");
  const [saved, setSaved] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  async function runSearch(
    event?: FormEvent<HTMLFormElement>,
    forcedQuery?: string
  ) {
    event?.preventDefault();

    const searchTerm = (forcedQuery ?? query).trim();

    if (!searchTerm) return;

    setQuery(searchTerm);
    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(
        `/api/research?q=${encodeURIComponent(searchTerm)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Search failed.");
      }

      setResults(data?.results || []);

      try {
        const history = JSON.parse(
          localStorage.getItem("vr_history") || "[]"
        ) as string[];

        const nextHistory = [
          searchTerm,
          ...history.filter((item) => item !== searchTerm),
        ].slice(0, 20);

        localStorage.setItem(
          "vr_history",
          JSON.stringify(nextHistory)
        );
      } catch {}
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function copyResearch(result: ResearchResult) {
    try {
      await navigator.clipboard.writeText(
        `${result.title}\n${result.url}`
      );

      setCopied(result.title);

      window.setTimeout(() => {
        setCopied(null);
      }, 1800);
    } catch {}
  }

  function toggleSaved(title: string) {
    setSaved((current) =>
      current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title]
    );
  }

  const filteredResults =
    sourceFilter === "All"
      ? results
      : results.filter(
          (result) => result.source === sourceFilter
        );

  const sourceCounts = {
    All: results.length,
    Wikipedia: results.filter(
      (result) => result.source === "Wikipedia"
    ).length,
    OpenAlex: results.filter(
      (result) => result.source === "OpenAlex"
    ).length,
    PubMed: results.filter(
      (result) => result.source === "PubMed"
    ).length,
  };

  return (
    <WorkstationShell activePath="/research">
      <div className="research-workspace">
        <section className="research-header">
          <div>
            <div className="research-eyebrow">
              <FlaskConical size={15} />
              RESEARCH EXPLORER
            </div>

            <h1>Explore scientific knowledge</h1>

            <p>
              Search across trusted knowledge and research
              sources from one workspace.
            </p>
          </div>

          <div className="research-header-badge">
            <Sparkles size={15} />
            Multi-source search
          </div>
        </section>

        <section className="research-search-panel">
          <form
            className="research-search-form"
            onSubmit={runSearch}
          >
            <Search size={22} />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search a topic, disease, gene, technology, discovery..."
              aria-label="Research search"
            />

            <button type="submit" disabled={loading}>
              {loading ? (
                <Loader2
                  size={18}
                  className="research-spin"
                />
              ) : (
                <Search size={18} />
              )}

              {loading ? "Searching" : "Search"}
            </button>
          </form>

          <div className="research-suggestions">
            <span>Try:</span>

            {[
              "CRISPR gene editing",
              "cancer immunotherapy",
              "artificial photosynthesis",
              "Alzheimer's disease",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => runSearch(undefined, suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </section>

        <section className="research-body">
          <div className="research-results-area">
            <div className="research-results-toolbar">
              <div>
                <span className="research-kicker">
                  DISCOVERY
                </span>

                <h2>
                  {searched
                    ? `${filteredResults.length} results`
                    : "Research results"}
                </h2>
              </div>

              <div className="research-filter-row">
                {[
                  "All",
                  "Wikipedia",
                  "OpenAlex",
                  "PubMed",
                ].map((source) => (
                  <button
                    key={source}
                    className={
                      sourceFilter === source
                        ? "research-filter-active"
                        : ""
                    }
                    onClick={() =>
                      setSourceFilter(source)
                    }
                  >
                    {source}

                    <span>
                      {sourceCounts[
                        source as keyof typeof sourceCounts
                      ]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="research-loading">
                <div className="research-loading-icon">
                  <Loader2
                    size={25}
                    className="research-spin"
                  />
                </div>

                <strong>Searching research sources</strong>

                <span>
                  Gathering relevant knowledge and
                  publications...
                </span>
              </div>
            )}

            {!loading &&
              searched &&
              filteredResults.length === 0 && (
                <div className="research-empty">
                  <div className="research-empty-icon">
                    <Search size={25} />
                  </div>

                  <h3>No results found</h3>

                  <p>
                    Try a broader research topic or another
                    search term.
                  </p>
                </div>
              )}

            {!loading &&
              !searched && (
                <div className="research-empty research-welcome">
                  <div className="research-empty-icon">
                    <FlaskConical size={27} />
                  </div>

                  <h3>Begin your research</h3>

                  <p>
                    Search a scientific topic above to
                    explore multiple research sources.
                  </p>
                </div>
              )}

            {!loading &&
              filteredResults.length > 0 && (
                <div className="research-result-list">
                  {filteredResults.map((result, index) => (
                    <article
                      className="research-result-card"
                      key={`${result.source}-${result.title}-${index}`}
                    >
                      <div className="research-result-top">
                        <div
                          className={`research-source research-source-${result.source.toLowerCase()}`}
                        >
                          {sourceIcons[result.source] || (
                            <FileText size={15} />
                          )}

                          {result.source}
                        </div>

                        <button
                          className={
                            saved.includes(result.title)
                              ? "research-save saved"
                              : "research-save"
                          }
                          onClick={() =>
                            toggleSaved(result.title)
                          }
                          aria-label="Save research"
                        >
                          {saved.includes(result.title) ? (
                            <Bookmark
                              size={17}
                              fill="currentColor"
                            />
                          ) : (
                            <Bookmark size={17} />
                          )}
                        </button>
                      </div>

                      <h3>{result.title}</h3>

                      <p>
                        {result.description ||
                          "No description available."}
                      </p>

                      <div className="research-result-actions">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open source
                          <ExternalLink size={14} />
                        </a>

                        <button
                          onClick={() =>
                            copyResearch(result)
                          }
                        >
                          {copied === result.title ? (
                            <>
                              <Check size={14} />
                              Copied
                            </>
                          ) : (
                            <>
                              Copy link
                              <ArrowUpRight size={14} />
                            </>
                          )}
                        </button>

                        <button
                          onClick={() =>
                            window.alert(
                              "Notes integration will be connected in the Knowledge & Notes workspace."
                            )
                          }
                        >
                          <FileText size={14} />
                          Send to Notes
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
          </div>

          <aside className="research-context-panel">
            <div className="research-context-header">
              <span className="research-kicker">
                WORKSPACE
              </span>

              <h2>Research Context</h2>
            </div>

            <div className="research-context-card">
              <div className="research-context-icon">
                <Search size={18} />
              </div>

              <span>Current query</span>

              <strong>
                {query || "No active search"}
              </strong>
            </div>

            <div className="research-context-card">
              <div className="research-context-icon">
                <FlaskConical size={18} />
              </div>

              <span>Sources connected</span>

              <strong>3 research sources</strong>
            </div>

            <div className="research-context-card">
              <div className="research-context-icon">
                <Bookmark size={18} />
              </div>

              <span>Saved this session</span>

              <strong>{saved.length} discoveries</strong>
            </div>

            <div className="research-context-tip">
              <Sparkles size={17} />

              <div>
                <strong>Research tip</strong>

                <p>
                  Start broad, then refine your query with
                  specific genes, diseases, mechanisms or
                  technologies.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </WorkstationShell>
  );
}
