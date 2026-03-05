import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Cpu, GraduationCap, Users } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import readingClub from "@/data/readingClub.json";

type ReadingVideo = {
  bvid: string;
  title: string;
  cover: string;
  description: string;
  publishedAt: string | null;
};

type NewsItem = {
  id: string;
  title: string;
  date: string; // ISO
  image?: string; // 封面（兼容旧数据）
  images?: string[]; // 全部图片（拼贴）
  video?: string; // 单个视频（兼容）
  videos?: string[]; // 全部视频
  sub_title?: string;
  description?: string;
  source?: string;
  source_url?: string;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

const PAGE_SIZE = 20;

const Activities = () => {
  const location = useLocation();
  // ----------------------
  // News states (API based)
  // ----------------------
  const [newsFilter, setNewsFilter] = useState<"all" | "recent" | "older">("all");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const loadNews = async () => {
      setLoadingNews(true);
      setNewsError("");

      try {
        const r = await fetch("/news.json");;
        const data = await r.json();

        if (cancelled) return;

        const arr = Array.isArray(data?.news) ? data.news : [];
        setNewsList(arr);
      } catch (e: any) {
        if (cancelled) return;
        setNewsList([]);
        setNewsError(e?.message || "Failed to load news");
      } finally {
        if (!cancelled) setLoadingNews(false);
      }
    };

    loadNews();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!newsList.length) return;
    const params = new URLSearchParams(location.search);
    const newsId = params.get("newsId");
    if (!newsId) return;

    const target = newsList.find((item) => String(item.id) === newsId);
    if (target) {
      setNewsFilter("all");
      setSelectedNews(target);
    }
  }, [location.search, newsList]);

  const filteredNews =
    newsFilter === "all"
      ? newsList
      : newsList.filter((item) => {
          const itemDate = new Date(item.date);
          const currentDate = new Date();
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

          return newsFilter === "recent"
            ? itemDate >= threeMonthsAgo
            : itemDate < threeMonthsAgo;
        });

  // ----------------------
  // Reading Club (static JSON)
  // ----------------------
  const videos: ReadingVideo[] = (readingClub as any)?.videos || [];

  const [videoQuery, setVideoQuery] = useState("");
  const [activeVideo, setActiveVideo] = useState<ReadingVideo | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);

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
    <div className="container py-12 px-4 md:px-6 space-y-12 page-transition relative">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute top-40 -left-24 h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -top-40 right-24 h-[320px] w-[320px] rounded-full bg-emerald-400/10 blur-2xl" />
      </div>

      {/* Header */}
      <section className="relative space-y-4 text-center max-w-3xl mx-auto fade-in-content">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
          Updates
        </h1>
        <p className="text-muted-foreground md:text-xl">
          Stay updated with the latest news, events, and academic activities in our research group.
        </p>
      </section>

      {/* Tabs */}
      <section className="relative fade-in-content" style={{ animationDelay: "100ms" }}>
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

          {/* ---------------- News Tab ---------------- */}
          <TabsContent value="news" className="space-y-8">
            {newsError ? (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                <div className="font-medium text-foreground mb-1">
                  Failed to load news
                </div>
                <div className="break-words">{newsError}</div>
              </div>
            ) : null}

            {loadingNews ? (
              <div className="text-sm text-muted-foreground">Loading news…</div>
            ) : null}

            {selectedNews ? (
              <div className="animate-fade-in">
                <button
                  className="mb-6 px-4 py-2 rounded text-white shadow-lg shadow-violet-600/25 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-colors"
                  onClick={() => setSelectedNews(null)}
                >
                  ← Back to All News
                </button>

                <h2 className="text-3xl font-bold mb-2">{selectedNews.title}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {new Date(selectedNews.date).toLocaleDateString()}
                </p>
                {(() => {
                  const hasVideos =
                    (Array.isArray(selectedNews.videos) && selectedNews.videos.length > 0) ||
                    Boolean(selectedNews.video);
                  const imageCount = Array.isArray(selectedNews.images)
                    ? selectedNews.images.length
                    : (selectedNews.image ? 1 : 0);
                  const hideImageForVideoOnly = hasVideos && imageCount <= 1;

                  return (
                    <>
                      {/* Videos: 优先 videos[]，否则用单个 video */}
                      {Array.isArray(selectedNews.videos) && selectedNews.videos.length > 0 ? (
                        <div className="mb-6 space-y-4">
                          {selectedNews.videos.map((url, idx) => (
                            <video
                              key={`${selectedNews.id}-video-${idx}`}
                              src={url}
                              controls
                              preload="metadata"
                              className="w-full max-w-3xl rounded-lg border bg-black"
                            />
                          ))}
                        </div>
                      ) : selectedNews.video ? (
                        <video
                          src={selectedNews.video}
                          controls
                          preload="metadata"
                          className="w-full max-w-3xl rounded-lg border bg-black mb-6"
                        />
                      ) : null}

                      {/* Images collage: 视频-only 帖子隐藏封面图 */}
                      {!hideImageForVideoOnly ? (
                        Array.isArray(selectedNews.images) && selectedNews.images.length > 0 ? (
                          <div className="mb-6">
                            <div className="columns-2 sm:columns-3 gap-3 [column-fill:_balance]">
                              {selectedNews.images.map((url, idx) => (
                                <a
                                  key={`${selectedNews.id}-img-${idx}`}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mb-3 block break-inside-avoid"
                                  title="Open image"
                                >
                                  <img
                                    src={url}
                                    alt={`${selectedNews.title} - ${idx + 1}`}
                                    className="w-full h-auto rounded-lg border bg-muted object-cover hover:opacity-95 transition"
                                    loading="lazy"
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : selectedNews.image ? (
                          <img
                            src={selectedNews.image}
                            alt={selectedNews.title}
                            className="w-full max-w-3xl rounded-lg shadow mb-6"
                            loading="lazy"
                          />
                        ) : null
                      ) : null}
                    </>
                  );
                })()}

                <div className="prose dark:prose-invert max-w-none space-y-4">
                  {selectedNews.description ? (
                    <p>{selectedNews.description}</p>
                  ) : (
                    <p className="text-muted-foreground">—</p>
                  )}

                  {selectedNews.source_url ? (
                    <p>
                      <a
                        href={selectedNews.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        View on Xiaohongshu
                      </a>
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                {/* News Wall (scrollable masonry) */}
                <div className="border bg-card">
                  {/* title bar */}
                  <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
                    <div className="text-sm font-medium">Updates</div>

                    {/* filter buttons */}
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

                  {/* scroll area */}
                  <div className="h-[720px] overflow-y-auto p-5">
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
                      {filteredNews.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedNews(item)}
                          className="mb-5 block w-full text-left break-inside-avoid border bg-card hover:shadow-md transition-shadow"
                        >
                          {/* image */}
                          <div className="w-full overflow-hidden bg-muted">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-auto object-cover"
                                loading="lazy"
                              />
                            ) : null}
                          </div>

                          {/* text */}
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.date).toLocaleDateString()}
                              </span>
                            </div>

                            <h3 className="text-base font-semibold leading-snug">
                              {item.title}
                            </h3>

                            {item.description ? (
                              <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-4">
                                {item.description}
                              </p>
                            ) : null}

                            <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-violet-600">
                              Open
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {!loadingNews && !newsError && filteredNews.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No news found.</div>
                    ) : null}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* ---------------- VPX Reading Club Tab ---------------- */}
          <TabsContent value="seminars" className="space-y-6">
            {/* Top controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Total:{" "}
                <span className="text-foreground font-medium">
                  {filteredVideos.length}
                </span>
                {filteredVideos.length > 0 ? (
                  <>
                    {" "}
                    · Page{" "}
                    <span className="text-foreground font-medium">{page}</span>/
                    <span className="text-foreground font-medium">
                      {totalPages}
                    </span>{" "}
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

            {/* Videos grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {pagedVideos.map((v) => (
                <Card
                  key={v.bvid}
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveVideo(v)}
                >
                  {/* Cover (static) */}
                  <div className="relative aspect-video bg-muted">
                    {v.cover ? (
                      <img
                        src={v.cover}
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
              <div className="text-sm text-muted-foreground">No videos found.</div>
            ) : null}

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
