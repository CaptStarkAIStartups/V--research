"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Check,
  Clock3,
  ExternalLink,
  FileText,
  FlaskConical,
  Loader2,
  Search,
  Sparkles,
  Stethoscope,
  Tag,
  X,
} from "lucide-react";
import WorkstationShell from "@/components/WorkstationShell";

type Article = {
  id: string;
  title: string;
  abstract: string;
  source: string;
  url: string;
  authors: string[];
  publishedAt: string | null;
};

const topics = [
  "Cancer Research",
  "Gene Editing",
  "Artificial Intelligence",
  "Neuroscience",
  "Immunology",
  "Drug Discovery",
  "Virology",
  "Biotechnology",
];

const topicQueries: Record<string, string> = {
  "Cancer Research": "cancer research",
  "Gene Editing": "CRISPR gene editing",
  "Artificial Intelligence": "artificial intelligence medicine",
  Neuroscience: "neuroscience",
  Immunology: "immunology",
  "Drug Discovery": "drug discovery",
  Virology: "virology",
  Biotechnology: "biotechnology",
};

const sourceIcons: Record<string, React.ReactNode> = {
  OpenAlex: <FlaskConical size={15} />,
  PubMed: <Stethoscope size={15} />,
  Wikipedia: <BookOpen size={15} />,
};

export default function ResearchArticles() {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("All");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedSaved = JSON.parse(
        localStorage.getItem("vr_saved_articles") || "[]"
      ) as string[];

      const storedHistory = JSON.parse(
        localStorage.getItem("vr_article_history") || "[]"
      ) as string[];

      setSaved(storedSaved);
      setHistory(storedHistory);
    } catch {}
  }, []);

  async function searchArticles(
    event?: FormEvent<HTMLFormElement>,
    forcedQuery?: string
  ) {
    event?.preventDefault();

    const searchTerm = (forcedQuery ?? query).trim();

    if (!searchTerm) return;

    setQuery(searchTerm);
    setLoading(true);
    setSearched(true);
    setSourceFilter("All");

    try {
      const response = await fetch(
        `/api/research?q=${encodeURIComponent(searchTerm)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to load articles.");
      }

      const incoming: Article[] = (data?.results || []).map(
        (item: {
          title: string;
          description: string;
          url: string;
          source: string;
        }, index: number) => ({
          id: `${item.source}-${item.title}-${index}`,
          title: item.title,
          abstract:
            item.description ||
            "No abstract or summary is available for this publication.",
          source: item.source,
          url: item.url,
          authors: [],
          publishedAt: null,
        })
      );

      setArticles(incoming);

      const nextHistory = [
        searchTerm,
        ...history.filter((item) => item !== searchTerm),
      ].slice(0, 10);

      setHistory(nextHistory);

      localStorage.setItem(
        "vr_article_history",
        JSON.stringify(nextHistory)
      );
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleSaved(id: string) {
    setSaved((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];

      localStorage.setItem(
        "vr_saved_articles",
        JSON.stringify(next)
      );

      return next;
    });
  }

  async function copyArticle(article: Article) {
    try {
      await navigator.clipboard.writeText(
        `${article.title}\n${article.url}`
      );

      setCopied(article.id);

      window.setTimeout(() => {
        setCopied(null);
      }, 1600);
    } catch {}
  }

  const filteredArticles =
    sourceFilter === "All"
      ? articles
      : articles.filter(
          (article) => article.source === sourceFilter
        );

  const sources = [
    "All",
    ...Array.from(
      new Set(articles.map((article) => article.source))
    ),
  ];

  return (
    <WorkstationShell activePath="/articles">
      <div className="articles-workspace">
        <section className="articles-header">
          <div>
            <div className="articles-eyebrow">
              <BookOpen size={15} />
              RESEARCH READING ROOM
            </div>

            <h1>Research Articles</h1>

            <p>
              Discover scientific publications, follow research
              topics, and build your personal reading queue.
            </p>
          </div>

          <div className="articles-header-status">
            <span className="articles-live-dot" />
            Research feed ready
          </div>
        </section>

        <section className="articles-search-panel">
          <form
            className="articles-search-form"
            onSubmit={searchArticles}
          >
            <Search size={21} />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search papers, discoveries, diseases, genes, technologies..."
              aria-label="Search research articles"
            />

            {query && (
              <button
                type="button"
                className="articles-clear"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}

            <button
              type="submit"
              className="articles-search-button"
              disabled={loading}
            >
              {loading ? (
                <Loader2
                  size={18}
                  className="articles-spin"
                />
              ) : (
                <Search size={18} />
              )}

              {loading ? "Searching" : "Explore"}
            </button>
          </form>

          <div className="articles-search-meta">
            <span>
              <Sparkles size={14} />
              Explore research across connected sources
            </span>

            <span>
              <Clock3 size={14} />
              {history.length} recent searches
            </span>
          </div>
        </section>

        <section className="articles-topic-section">
          <div className="articles-section-heading">
            <div>
              <span className="articles-kicker">EXPLORE</span>
              <h2>Research topics</h2>
            </div>

            <span className="articles-topic-count">
              {topics.length} topic areas
            </span>
          </div>

          <div className="articles-topic-grid">
            {topics.map((topic) => (
              <button
                key={topic}
                className="articles-topic-card"
                onClick={() =>
                  searchArticles(
                    undefined,
                    topicQueries[topic]
                  )
                }
              >
                <div className="articles-topic-icon">
                  <FlaskConical size={19} />
                </div>

                <div>
                  <strong>{topic}</strong>
                  <span>Explore publications</span>
                </div>

                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        </section>

        <section className="articles-main-grid">
          <div className="articles-feed">
            <div className="articles-feed-toolbar">
              <div>
                <span className="articles-kicker">
                  {searched ? "SEARCH RESULTS" : "DISCOVERY FEED"}
                </span>

                <h2>
                  {searched
                    ? `${filteredArticles.length} publications`
                    : "Start exploring research"}
                </h2>
              </div>

              {articles.length > 0 && (
                <div className="articles-filter-row">
                  {sources.map((source) => (
                    <button
                      key={source}
                      className={
                        sourceFilter === source
                          ? "articles-filter-active"
                          : ""
                      }
                      onClick={() =>
                        setSourceFilter(source)
                      }
                    >
                      {source}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading && (
              <div className="articles-loading">
                <div className="articles-loading-icon">
                  <Loader2
                    size={25}
                    className="articles-spin"
                  />
                </div>

                <strong>Building your reading feed</strong>

                <span>
                  Searching connected research sources...
                </span>
              </div>
            )}

            {!loading &&
              !searched && (
                <div className="articles-welcome">
                  <div className="articles-welcome-icon">
                    <BookOpen size={28} />
                  </div>

                  <h3>Your research reading room</h3>

                  <p>
                    Choose a research topic above or search for
                    a specific scientific subject to begin.
                  </p>

                  <div className="articles-welcome-hints">
                    <span>
                      <Tag size={14} />
                      Topic discovery
                    </span>

                    <span>
                      <Bookmark size={14} />
                      Save papers
                    </span>

                    <span>
                      <FileText size={14} />
                      Send to Notes
                    </span>
                  </div>
                </div>
              )}

            {!loading &&
              searched &&
              filteredArticles.length === 0 && (
                <div className="articles-welcome">
                  <div className="articles-welcome-icon">
                    <Search size={27} />
                  </div>

                  <h3>No publications found</h3>

                  <p>
                    Try a broader research topic or different
                    keywords.
                  </p>
                </div>
              )}

            {!loading &&
              filteredArticles.length > 0 && (
                <div className="articles-list">
                  {filteredArticles.map((article) => (
                    <article
                      className="article-card"
                      key={article.id}
                    >
                      <div className="article-card-top">
                        <div className="article-source">
                          {sourceIcons[article.source] || (
                            <FileText size={15} />
                          )}

                          {article.source}
                        </div>

                        <button
                          className={
                            saved.includes(article.id)
                              ? "article-save article-save-active"
                              : "article-save"
                          }
                          onClick={() =>
                            toggleSaved(article.id)
                          }
                          aria-label={
                            saved.includes(article.id)
                              ? "Remove saved article"
                              : "Save article"
                          }
                        >
                          {saved.includes(article.id) ? (
                            <Bookmark
                              size={18}
                              fill="currentColor"
                            />
                          ) : (
                            <Bookmark size={18} />
                          )}
                        </button>
                      </div>

                      <h3>{article.title}</h3>

                      <p className="article-abstract">
                        {article.abstract}
                      </p>

                      <div className="article-card-footer">
                        <div className="article-authors">
                          {article.authors.length > 0
                            ? article.authors
                                .slice(0, 2)
                                .join(" • ")
                            : "Publication indexed in research database"}
                        </div>

                        <div className="article-actions">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open paper
                            <ExternalLink size={14} />
                          </a>

                          <button
                            onClick={() =>
                              copyArticle(article)
                            }
                          >
                            {copied === article.id ? (
                              <>
                                <Check size={14} />
                                Copied
                              </>
                            ) : (
                              <>
                                Copy
                                <ArrowUpRight size={14} />
                              </>
                            )}
                          </button>

                          <button
                            onClick={() =>
                              window.alert(
                                "Notes integration will connect this article to your Knowledge & Notes workspace."
                              )
                            }
                          >
                            <FileText size={14} />
                            Notes
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
          </div>

          <aside className="articles-sidebar">
            <div className="articles-side-panel">
              <div className="articles-side-heading">
                <Bookmark size={18} />
                <div>
                  <span>PERSONAL</span>
                  <h3>Reading queue</h3>
                </div>
              </div>

              <div className="articles-queue-number">
                <strong>{saved.length}</strong>
                <span>saved publications</span>
              </div>

              <div className="articles-side-divider" />

              <div className="articles-side-stat">
                <span>Recent searches</span>
                <strong>{history.length}</strong>
              </div>

              <div className="articles-side-stat">
                <span>Current results</span>
                <strong>{articles.length}</strong>
              </div>
            </div>

            <div className="articles-side-panel articles-research-tip">
              <div className="articles-tip-icon">
                <Sparkles size={18} />
              </div>

              <div>
                <span className="articles-kicker">
                  RESEARCH TIP
                </span>

                <h3>Build a connected literature trail</h3>

                <p>
                  Search a broad topic first, then narrow it
                  using specific mechanisms, genes, diseases,
                  technologies, or treatments.
                </p>
              </div>
            </div>

            <div className="articles-side-panel articles-history-panel">
              <div className="articles-side-heading">
                <Clock3 size={18} />
                <div>
                  <span>HISTORY</span>
                  <h3>Recent searches</h3>
                </div>
              </div>

              {history.length === 0 ? (
                <p className="articles-no-history">
                  Your recent article searches will appear here.
                </p>
              ) : (
                <div className="articles-history-list">
                  {history.slice(0, 6).map((item) => (
                    <button
                      key={item}
                      onClick={() =>
                        searchArticles(undefined, item)
                      }
                    >
                      <Search size={13} />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </WorkstationShell>
  );
}
