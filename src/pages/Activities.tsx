import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Cpu, GraduationCap, Users } from "lucide-react";
import { activitiesData } from "@/data/activities";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ReadingVideo = {
  bvid: string;
  title: string;
  cover: string;
  description: string;
  publishedAt: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

const DEFAULT_READING_CLUB_API =
  (import.meta as any).env?.VITE_READING_CLUB_API ||
  "http://localhost:3001/api/vpx-reading-club";

const PAGE_SIZE = 20;

const Activities = () => {
  // ----------------------
  // News states (keep your original logic)
  // ----------------------
  const [newsFilter, setNewsFilter] = useState<"all" | "recent" | "older">("all");
  const [selectedNews, setSelectedNews] = useState<any>(null);

  const filteredNews =
    newsFilter === "all"
      ? activitiesData.news
      : activitiesData.news.filter((item: any) => {
          const itemDate = new Date(item.date);
          const currentDate = new Date();
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

          return newsFilter === "recent"
            ? itemDate >= threeMonthsAgo
            : itemDate < threeMonthsAgo;
        });

  // ----------------------
  // Reading Club states (updated)
  // ----------------------
  const [videos, setVideos] = useState<ReadingVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [videoQuery, setVideoQuery] = useState("");
  const [activeVideo, setActiveVideo] = useState<ReadingVideo | null>(null);
  const [videoError, setVideoError] = useState<string>("");

  // Pagination states
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingVideos(true);
      setVideoError("");

      try {
        const r = await fetch(DEFAULT_READING_CLUB_API);
        const data = await r.json();

        if (cancelled) return;

        const arr = Array.isArray(data?.videos) ? data.videos : [];
        setVideos(arr);
      } catch (e: any) {
        if (cancelled) return;
        setVideos([]);
        setVideoError(e?.message || "Failed to load videos");
      } finally {
        if (!cancelled) setLoadingVideos(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredVideos = useMemo(() => {
    const q = videoQuery.trim().toLowerCase();
    return videos.filter((v) => {
      if (!q) return true;
      return (
        (v.title || "").toLowerCase().includes(q) ||
        (v.description || "").toLowerCase().includes(q)
      );
    });
  }, [videos, videoQuery]);

  // Reset to page 1 when search changes / data changes
  useEffect(() => {
    setPage(1);
  }, [videoQuery, videos.length]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredVideos.length / PAGE_SIZE));
  }, [filteredVideos.length]);

  const pagedVideos = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredVideos.slice(start, start + PAGE_SIZE);
  }, [filteredVideos, page]);

  const goToPage = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
  };

  const pageNumbers = useMemo(() => {
    // Simple compact pagination: show up to 7 numbers around current page
    const maxButtons = 7;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    const nums: number[] = [];
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }, [page, totalPages]);

  return (
    <div className="container py-12 px-4 md:px-6 space-y-12 page-transition">
      {/* Header */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute top-40 -left-24 h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -top-40 right-24 h-[320px] w-[320px] rounded-full bg-emerald-400/10 blur-2xl" />
      </div>

      <section className="space-y-4 text-center max-w-3xl mx-auto fade-in-content">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
          News & Activities
        </h1>
        <p className="text-muted-foreground md:text-xl">
          Stay updated with the latest news, events, and academic activities in our research group.
        </p>
      </section>

      {/* Tabs */}
      <section className="fade-in-content" style={{ animationDelay: "100ms" }}>
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              News & Activities
            </TabsTrigger>
            <TabsTrigger value="seminars" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              VPX Reading Club
            </TabsTrigger>
          </TabsList>

          {/* ---------------- News Tab (your original) ---------------- */}
          <TabsContent value="news" className="space-y-8">
            {selectedNews ? (
              <div className="animate-fade-in">
                <button
                  className="mb-6 px-4 py-2 bg-primary text-primary-foreground rounded"
                  onClick={() => setSelectedNews(null)}
                >
                  ← Back to All News
                </button>

                <h2 className="text-3xl font-bold mb-2">{selectedNews.title}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {new Date(selectedNews.date).toLocaleDateString()}
                </p>

                {selectedNews.image && (
                  <img
                    src={selectedNews.image}
                    alt={selectedNews.title}
                    className="w-full max-w-3xl rounded-lg shadow mb-6"
                  />
                )}

                <div className="prose dark:prose-invert max-w-none">
                  <p>{selectedNews.description}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Filter */}
                <div className="flex justify-end mb-4">
                  <div className="flex gap-2">
                    {(["all", "recent", "older"] as const).map((filter) => (
                      <button
                        key={filter}
                        className={`px-3 py-1 text-sm rounded-md ${
                          newsFilter === filter
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                        onClick={() => setNewsFilter(filter)}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* News List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredNews.map((item: any, index: number) => (
                    <Card
                      key={item.id}
                      className="flex overflow-hidden cursor-pointer fade-in-content"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => setSelectedNews(item)}
                    >
                      <div className="md:w-1/3 bg-muted">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="md:w-2/3">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <CardDescription>
                            {new Date(item.date).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            {item.sub_title}
                          </p>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* ---------------- VPX Reading Club Tab (UPDATED) ---------------- */}
          <TabsContent value="seminars" className="space-y-6">
            {/* Top controls: remove "Recent (3 months)" & "All" toggle, keep search only */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Total: <span className="text-foreground font-medium">{filteredVideos.length}</span>
                {filteredVideos.length > 0 ? (
                  <>
                    {" "}
                    · Page{" "}
                    <span className="text-foreground font-medium">{page}</span>/
                    <span className="text-foreground font-medium">{totalPages}</span>
                    {" "}
                    · Showing{" "}
                    <span className="text-foreground font-medium">
                      {(page - 1) * PAGE_SIZE + 1}
                    </span>
                    -
                    <span className="text-foreground font-medium">
                      {Math.min(page * PAGE_SIZE, filteredVideos.length)}
                    </span>
                  </>
                ) : null}
              </div>

              <input
                value={videoQuery}
                onChange={(e) => setVideoQuery(e.target.value)}
                placeholder="Search title / description..."
                className="h-9 w-full md:w-80 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* status */}
            {videoError ? (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                <div className="font-medium text-foreground mb-1">
                  Failed to load videos
                </div>
                <div className="break-words">{videoError}</div>
                <div className="mt-2 text-xs">
                  Tip: make sure your server is running at{" "}
                  <span className="font-mono">{DEFAULT_READING_CLUB_API}</span>
                </div>
              </div>
            ) : null}

            {loadingVideos ? (
              <div className="text-sm text-muted-foreground">Loading videos…</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {pagedVideos.map((v) => (
                    <Card
                      key={v.bvid}
                      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setActiveVideo(v)}
                    >
                      {/* Cover */}
                      <div className="relative aspect-video bg-muted">
                        {v.cover ? (
                          <img
                            src={`http://localhost:3001/api/img?url=${encodeURIComponent(
                              v.cover
                            )}`}
                            alt={v.title}
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : null}
                      </div>

                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base leading-snug line-clamp-2">
                          {v.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(v.publishedAt)}</span>
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {v.description || "—"}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {filteredVideos.length > PAGE_SIZE ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 text-sm rounded-md bg-muted text-muted-foreground disabled:opacity-50"
                        onClick={() => goToPage(page - 1)}
                        disabled={page <= 1}
                      >
                        Prev
                      </button>

                      {/* Optional leading ellipsis */}
                      {pageNumbers[0] > 1 ? (
                        <>
                          <button
                            className="px-3 py-1 text-sm rounded-md bg-muted text-muted-foreground"
                            onClick={() => goToPage(1)}
                          >
                            1
                          </button>
                          <span className="text-muted-foreground text-sm">…</span>
                        </>
                      ) : null}

                      {pageNumbers.map((p) => (
                        <button
                          key={p}
                          className={`px-3 py-1 text-sm rounded-md ${
                            p === page
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                          onClick={() => goToPage(p)}
                        >
                          {p}
                        </button>
                      ))}

                      {/* Optional trailing ellipsis */}
                      {pageNumbers[pageNumbers.length - 1] < totalPages ? (
                        <>
                          <span className="text-muted-foreground text-sm">…</span>
                          <button
                            className="px-3 py-1 text-sm rounded-md bg-muted text-muted-foreground"
                            onClick={() => goToPage(totalPages)}
                          >
                            {totalPages}
                          </button>
                        </>
                      ) : null}

                      <button
                        className="px-3 py-1 text-sm rounded-md bg-muted text-muted-foreground disabled:opacity-50"
                        onClick={() => goToPage(page + 1)}
                        disabled={page >= totalPages}
                      >
                        Next
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Go to</span>
                      <input
                        value={String(page)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d]/g, "");
                          const num = raw ? parseInt(raw, 10) : 1;
                          setPage(num);
                        }}
                        onBlur={() => goToPage(page)}
                        className="h-9 w-20 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                      <span>/ {totalPages}</span>
                    </div>
                  </div>
                ) : null}

                {filteredVideos.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No videos found.
                  </div>
                ) : null}
              </>
            )}

            {/* Player dialog */}
            <Dialog
              open={!!activeVideo}
              onOpenChange={(open) => !open && setActiveVideo(null)}
            >
              <DialogContent className="max-w-5xl">
                {activeVideo ? (
                  <>
                    <DialogHeader>
                      <DialogTitle className="pr-8">{activeVideo.title}</DialogTitle>
                    </DialogHeader>

                    <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                      <iframe
                        src={`https://player.bilibili.com/player.html?bvid=${activeVideo.bvid}&page=1&high_quality=1&danmaku=0`}
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </div>

                    {activeVideo.description ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="text-muted-foreground">
                            {formatDate(activeVideo.publishedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {activeVideo.description}
                        </p>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default Activities;
