import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

type Publication = {
  title: string;
  authors: string;
  journal: string; // 你现在的 json 里已经是类似 "AAAI 2026"
  year: number;
  doi: string; // paper 链接（arxiv/ieee/pdf/...）
  tags?: string[];
};

const Publications = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/publications/publication_updated.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Publication[]) => {
        setPublications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load publications:", err);
        setPublications([]);
        setLoading(false);
      });
  }, []);

  // ✅ 年份按钮：从真实 publications 动态生成
  const years = useMemo(() => {
    const ys = Array.from(
      new Set(publications.map((p) => Number(p.year)).filter(Boolean))
    );
    ys.sort((a, b) => b - a);
    return ys;
  }, [publications]);

  // ✅ 搜索 + 年份过滤 + 年份倒序
  const filteredPublications = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    const result = publications.filter((pub) => {
      const matchesYear = selectedYear === null || pub.year === selectedYear;

      const matchesSearch =
        !q ||
        (pub.title || "").toLowerCase().includes(q) ||
        (pub.authors || "").toLowerCase().includes(q) ||
        (pub.journal || "").toLowerCase().includes(q) ||
        (pub.tags || []).some((t) => (t || "").toLowerCase().includes(q));

      return matchesYear && matchesSearch;
    });

    result.sort((a, b) => (b.year || 0) - (a.year || 0));
    return result;
  }, [publications, selectedYear, searchTerm]);

  const openLink = (url?: string) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="container py-12 px-4 md:px-6 page-transition">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
    <div className="absolute top-40 -left-24 h-[180px] w-[320px] rounded-full bg-emerald-400/15 blur-2xl" />
    <div className="absolute -top-40 right-24 h-[320px] w-[320px] rounded-full bg-cyan-500/15 blur-2xl" />
  </div>
      {/* Header */}
      <section className="space-y-4 text-center max-w-3xl mx-auto mb-12 fade-in-content">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
          Publications
        </h1>
        <p className="text-muted-foreground md:text-xl">
          Our research outputs in peer-reviewed journals and conference proceedings.
        </p>
      </section>

      {/* Filters */}
      <section className="mb-10 fade-in-content" style={{ animationDelay: "100ms" }}>
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title / authors / venue..."
              className="w-full h-10 px-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            />
          </div>

          {/* Year buttons */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-muted-foreground">Year:</span>

            <Button
              variant={selectedYear === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedYear(null)}
              className={
                selectedYear === null
                  ? "bg-violet-600 hover:bg-violet-600/90 text-white"
                  : "border-white/15 hover:bg-white/5"
              }
            >
              All
            </Button>

            {years.map((year) => (
              <Button
                key={year}
                variant={selectedYear === year ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedYear(year)}
                className={
                  selectedYear === year
                    ? "bg-violet-600 hover:bg-violet-600/90 text-white"
                    : "border-white/15 hover:bg-white/5"
                }
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* List */}
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : filteredPublications.length === 0 ? (
        <div className="text-sm text-muted-foreground">No publications found.</div>
      ) : (
        <section className="space-y-3">
          {filteredPublications.map((pub, index) => (
            <Card
              key={`${pub.title}-${pub.year}-${index}`}
              className="fade-in-content
    border border-white/15
    bg-white/5
    backdrop-blur-md
    hover:bg-white/8
    hover:border-white/25
    transition-all"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4 md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  {/* Title */}
                  <div className="min-w-0 space-y-2">
                    <h3 className="text-base font-semibold leading-snug md:text-lg">
                      {pub.title}
                    </h3>

                    {/* Authors + Venue */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                      <p className="text-sm text-muted-foreground leading-6">
                        {pub.authors}
                      </p>
                      {pub.journal ? (
                        <Badge className="bg-violet-500/15 text-violet-700 border border-violet-500/20">
                          {pub.journal}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Unknown Venue</Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center md:shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-white/15 bg-white/5 px-3 hover:bg-white/10"
                      onClick={() => openLink(pub.doi)}
                      disabled={!pub.doi}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Paper
                    </Button>
                  </div>

                  {/* Optional tags（你以后要用再打开） */}
                  {/* {(pub.tags || []).length ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(pub.tags || []).slice(0, 6).map((t) => (
                        <Badge key={`${pub.title}-${pub.year}-${t}`} variant="secondary">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  ) : null} */}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
};

export default Publications;
