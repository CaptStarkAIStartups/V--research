import { NextRequest, NextResponse } from "next/server";

type ResearchResult = {
  title: string;
  description: string;
  url: string;
  source: string;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { error: "Search query is required." },
      { status: 400 }
    );
  }

  const results: ResearchResult[] = [];

  try {
    // Wikipedia
    const wikipediaUrl =
      `https://en.wikipedia.org/w/api.php?` +
      new URLSearchParams({
        action: "query",
        generator: "search",
        gsrsearch: q,
        gsrlimit: "8",
        prop: "extracts|info",
        exintro: "1",
        explaintext: "1",
        exchars: "500",
        inprop: "url",
        format: "json",
        origin: "*",
      }).toString();

    const wikipediaResponse = await fetch(wikipediaUrl, {
      headers: {
        "User-Agent": "VResearch/1.0 research-dashboard",
      },
      next: {
        revalidate: 3600,
      },
    });

    if (wikipediaResponse.ok) {
      const wikipediaData = await wikipediaResponse.json();

      const pages = Object.values(
        wikipediaData?.query?.pages || {}
      ) as Array<{
        title?: string;
        extract?: string;
        fullurl?: string;
      }>;

      for (const page of pages) {
        results.push({
          title: page.title || "Wikipedia result",
          description:
            page.extract || "No description available.",
          url:
            page.fullurl ||
            `https://en.wikipedia.org/wiki/${encodeURIComponent(
              page.title || ""
            )}`,
          source: "Wikipedia",
        });
      }
    }
  } catch {
    // Keep searching other providers if Wikipedia fails.
  }

  try {
    // OpenAlex
    const openAlexUrl =
      `https://api.openalex.org/works?search=${encodeURIComponent(
        q
      )}&per-page=8`;

    const openAlexResponse = await fetch(openAlexUrl, {
      next: {
        revalidate: 1800,
      },
    });

    if (openAlexResponse.ok) {
      const openAlexData = await openAlexResponse.json();

      for (const work of openAlexData?.results || []) {
        const title =
          work?.title || "Untitled scientific work";

        const abstract =
          work?.abstract_inverted_index
            ? Object.keys(work.abstract_inverted_index)
                .slice(0, 80)
                .join(" ")
            : "Scientific publication indexed by OpenAlex.";

        const url =
          work?.primary_location?.landing_page_url ||
          work?.doi ||
          `https://openalex.org/${work?.id?.split("/").pop() || ""}`;

        results.push({
          title,
          description: abstract,
          url,
          source: "OpenAlex",
        });
      }
    }
  } catch {
    // Continue.
  }

  try {
    // PubMed
    const pubmedSearchUrl =
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?` +
      new URLSearchParams({
        db: "pubmed",
        term: q,
        retmode: "json",
        retmax: "8",
      }).toString();

    const searchResponse = await fetch(pubmedSearchUrl);

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();

      const ids: string[] =
        searchData?.esearchresult?.idlist || [];

      if (ids.length > 0) {
        const summaryUrl =
          `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?` +
          new URLSearchParams({
            db: "pubmed",
            id: ids.join(","),
            retmode: "json",
          }).toString();

        const summaryResponse = await fetch(summaryUrl);

        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();

          for (const id of ids) {
            const item = summaryData?.result?.[id];

            if (!item) continue;

            results.push({
              title: item.title || "PubMed publication",
              description:
                item.sortfirstauthor ||
                "Medical and biomedical publication indexed by PubMed.",
              url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
              source: "PubMed",
            });
          }
        }
      }
    }
  } catch {
    // Continue.
  }

  return NextResponse.json({
    query: q,
    count: results.length,
    results,
  });
}
