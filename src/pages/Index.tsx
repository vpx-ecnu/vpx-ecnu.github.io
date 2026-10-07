import { ArrowRight, BookOpen, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreloadLink as Link } from "@/components/preload-link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { useEffect, useMemo, useState } from "react";
import { formatPublicationVenue } from "@/lib/publication-venue";
import { researchTracks } from "@/data/researchIdentity";
import { useLocale } from "@/i18n/locale";

type NewsItem = {
  id: string;
  title: string;
  date: string; // ISO
  image?: string;
  sub_title?: string;
  description?: string;
  source?: string;
  source_url?: string;
};

type RecentPublication = {
  id: string;
  title: string;
  venue: string;
  url: string;
  image: string;
  mediaType?: "image" | "video";
  media?: string;
  poster?: string;
};

type OngoingResearchProject = {
  title: string;
  titleZh?: string;
  description?: string;
  descriptionZh?: string;
  thumbnail?: string;
  images?: string[];
  image?: string;
};

const slugifyProjectTitle = (title: string) =>
  title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const getProjectThumbnail = (project: OngoingResearchProject) =>
  project.thumbnail || project.images?.[0] || project.image || "/placeholder.svg";

const researchTrackLeaders = [
  { name: "Chenxi Shao", id: "grad-chenxi-shao" },
  { name: "Yijing Wa", id: "grad-yijing-wa" },
  { name: "Yu Zhang", id: "grad-yu-zhang" },
  { name: "Xiangyi Wei", id: "phd-xiangyi-wei" },
] as const;

const Index = () => {
  const { isZh, localize } = useLocale();
  // ----------------------
  // News (API based) - for home page latest 6
  // ----------------------
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState<string>("");
  const [publicationCount, setPublicationCount] = useState<number | null>(null);
  const [researcherCount, setResearcherCount] = useState<number | null>(null);
  const [recentPublications, setRecentPublications] = useState<RecentPublication[]>([]);
  const [ongoingResearchProjects, setOngoingResearchProjects] = useState<OngoingResearchProject[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadNews = async () => {
      setLoadingNews(true);
      setNewsError("");

      try {
        const r = await fetch("/news.json");
        const data = await r.json();
        if (cancelled) return;

        const arr = Array.isArray(data?.news) ? data.news : [];
        setNewsList(arr);
      } catch (e: unknown) {
        if (cancelled) return;
        setNewsList([]);
        setNewsError(e instanceof Error ? e.message : "Failed to load news");
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
    let cancelled = false;

    const loadOngoingProjects = async () => {
      try {
        const r = await fetch("/content/ongoing-projects.json");
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!cancelled) {
          setOngoingResearchProjects(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) setOngoingResearchProjects([]);
      }
    };

    loadOngoingProjects();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadRecentPublications = async () => {
      try {
        const r = await fetch("/publications/project_publications.json");
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        const pubs = Array.isArray(data?.publications) ? data.publications : [];
        if (!cancelled) setRecentPublications(pubs.slice(0, 6));
      } catch {
        if (!cancelled) setRecentPublications([]);
      }
    };

    loadRecentPublications();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const peopleFiles = [
      "/people/faculty.json",
      "/people/research-operations.json",
      "/people/phd.json",
      "/people/graduate.json",
      "/people/part-time.json",
      "/people/Undergraduate.json",
    ];

    const countPeople = (payload: unknown): number => {
      if (Array.isArray(payload)) return payload.length;
      if (payload && typeof payload === "object") {
        const obj = payload as Record<string, unknown>;
        if (Array.isArray(obj.people)) return obj.people.length;
      }
      return 0;
    };

    const loadStats = async () => {
      const [publicationResult, peopleResults] = await Promise.allSettled([
        fetch("/publications/publication_updated.json").then(async (response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        }),
        Promise.allSettled(
          peopleFiles.map(async (path) => {
            const r = await fetch(path);
            if (!r.ok) return 0;
            const data = await r.json();
            return countPeople(data);
          })
        ),
      ]);

      if (!cancelled) {
        if (publicationResult.status === "fulfilled") {
          setPublicationCount(
            Array.isArray(publicationResult.value) ? publicationResult.value.length : 0
          );
        } else {
          setPublicationCount(0);
        }

        if (peopleResults.status === "fulfilled") {
          const total = peopleResults.value.reduce((sum, result) => {
            if (result.status === "fulfilled") return sum + result.value;
            return sum;
          }, 0);
          setResearcherCount(total);
        } else {
          setResearcherCount(0);
        }
      }
    };

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const yearsOfResearch = useMemo(() => {
    const labStart = new Date(2020, 9, 1); // 2020-10-01
    const now = new Date();
    const elapsedMonths = Math.max(
      0,
      (now.getFullYear() - labStart.getFullYear()) * 12 +
        (now.getMonth() - labStart.getMonth())
    );
    return Math.max(1, Math.floor(elapsedMonths / 12));
  }, []);

  const latest8News = useMemo(() => {
    const sorted = [...newsList].sort((a, b) => {
      const ta = new Date(a.date).getTime();
      const tb = new Date(b.date).getTime();
      return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
    });
    return sorted.slice(0, 8);
  }, [newsList]);

  const featuredOngoingProjects = useMemo(
    () => ongoingResearchProjects.slice(0, 4),
    [ongoingResearchProjects]
  );

  const getNewsTitle = (item: NewsItem) => {
    const primary = item.title?.trim() || item.sub_title?.trim();
    if (primary) return primary;
    return isZh ? "VPX 动态" : "VPX Update";
  };

  const formatNewsDate = (date: string) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "—";
    return new Intl.DateTimeFormat(isZh ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(parsed);
  };

  const getNewsSummary = (item: NewsItem) => {
    return (
      item.sub_title?.trim() ||
      item.description?.trim() ||
      ""
    );
  };

  const getMosaicClassName = (index: number) => {
    if (index === 0) return "md:col-span-2 lg:col-span-2 lg:row-span-2";
    if (index === 3) return "md:col-span-2 lg:col-span-2";
    return "";
  };

  return (
    <div>
      <section className="relative isolate overflow-hidden pt-16 pb-16 sm:pt-20 sm:pb-20 md:pt-24 md:pb-24">
  <div className="absolute inset-0 -z-20">
    <video
      className="h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/vpx-assets/home/home_robot.jpg"
      aria-hidden="true"
    >
      <source src="/vpx-assets/home/home_robot.mp4" type="video/mp4" />
    </video>
  </div>

  {/* 多层遮罩：保证动态图不抢文字、同时更“学术” */}
  <div className="absolute inset-0 -z-10">
    {/* 暗化 + 冷色渐变，提升可读性 */}
    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/55 to-slate-950/75" />
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/25 via-violet-900/25 to-fuchsia-900/15" />
    {/* 轻微磨砂（比你原来的更克制） */}
    <div className="absolute inset-0 backdrop-blur-[2px]" />
    {/* 顶部/底部暗角，让视觉聚焦在中间内容 */}
    <div className="absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_35%,black,transparent)] bg-black/25" />
  </div>

  {/* 柔和光晕点缀（不抢主视觉） */}
  <div className="pointer-events-none absolute inset-0 -z-10">
    <div className="absolute left-1/2 top-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
    <div className="absolute -left-20 top-48 h-[420px] w-[420px] rounded-full bg-cyan-400/15 blur-3xl" />
    <div className="absolute right-0 bottom-0 h-[460px] w-[460px] rounded-full bg-fuchsia-400/10 blur-3xl" />
  </div>

  <div className="relative z-10 container px-4 md:px-6">
    <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
      {/* 顶部小标签：更像实验室官网 */}
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/85 backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm md:text-base">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/90" />
        Visual Perception + X • ECNU
      </div>

      <div className="mt-4 space-y-4 sm:mt-5">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-6xl">
          {isZh ? "欢迎来到" : "Welcome to"}{" "}
          <span className="bg-gradient-to-r from-violet-200 via-white to-cyan-200 bg-clip-text text-transparent">
            VPX Group
          </span>{" "}
          {isZh ? "@ 华东师范大学" : "at ECNU"}
        </h1>

        {/* <p className="mx-auto max-w-3xl text-base md:text-xl leading-relaxed text-white/80">
          We build visual perception systems for cross-disciplinary research, turning
          videos and streaming signals into meaningful, structured understanding.
        </p> */}
      </div>

      {/* 主信息卡：更干净的“玻璃卡片” + 更像学术站点 */}
      {/* ===== 玻璃卡片（真正更宽 + 字体适中放大） ===== */}
<div className="mt-7 w-full">
  <div className="mx-auto w-full max-w-[96rem] rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-xl shadow-[0_20px_80px_-40px_rgba(0,0,0,0.8)]">
    {/* 顶部细亮边 */}
    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />

    <div className="px-4 py-5 text-left sm:px-6 sm:py-7 md:px-14 md:py-11">
      <div className="space-y-5 text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">

        <p>
          <span className="font-semibold text-white">
            {isZh
              ? "华东师范大学视觉感知 + X（VPX）研究组"
              : "The Visual Perception + X (VPX) Group at East China Normal University"}
          </span>{" "}
          {isZh
            ? "以视觉感知为基础，与其他学科交叉融合，推动"
            : "takes visual perception as its foundation and connects it with other disciplines to advance"}{" "}
          <span className="font-semibold bg-gradient-to-r from-violet-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
            {isZh ? "以人为本的通用人工智能" : "human-centered AGI"}
          </span>
          {isZh ? "。" : "."}
        </p>

        <p>
          {isZh
            ? "我们研究智能系统如何感知并建模动态环境、生成可控内容，以及在物理世界中行动。"
            : "We study how intelligent systems perceive and model dynamic environments, generate controllable content, and act in the physical world."}
        </p>

        <p>
          {isZh ? "我们的研究连接四个方向：" : "Our research connects four directions:"}{" "}
          <span className="font-semibold bg-gradient-to-r from-violet-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
            {isZh
              ? "时序智能、空间智能、生成式智能与物理智能"
              : "Temporal AI, Spatial AI, Generative AI, and Physical AI"}
          </span>
          {isZh ? "。" : "."}
        </p>

      </div>
    </div>
  </div>
</div>


      {/* CTA 按钮：更统一的配色与 hover（第二个按钮文字别用深紫，否则在暗背景不稳） */}
      <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
        <Button
          asChild
          className="w-full px-5 py-4 text-base text-white shadow-lg shadow-violet-600/25 sm:w-auto sm:px-8 sm:text-lg md:px-9 md:py-7 md:text-xl
                     bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
        >
          <Link to={localize("/about")}>{isZh ? "了解我们" : "Learn About Us"}</Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full px-5 py-4 text-base text-white sm:w-auto sm:px-8 sm:text-lg md:px-9 md:py-7 md:text-xl
                     border-white/30 bg-white/5 hover:bg-white/10 hover:border-white/40"
        >
          <Link to={localize("/projects")}>{isZh ? "查看项目" : "View Our Projects"}</Link>
        </Button>
      </div>
    </div>
  </div>
</section>

      {featuredOngoingProjects.length > 0 ? (
        <section className="bg-secondary/30 px-4 py-12 sm:px-6 sm:py-14 md:px-12 lg:px-24 lg:py-20">
          <div className="relative overflow-visible">
            <Swiper
              modules={[Navigation]}
              navigation
              loop={featuredOngoingProjects.length > 1}
              spaceBetween={50}
              slidesPerView={1}
              className="relative container"
            >
              {featuredOngoingProjects.map((project) => {
                const projectLink = localize(`/projects?project=${slugifyProjectTitle(project.title)}`);
                const projectImage = getProjectThumbnail(project);
                const projectTitle = isZh && project.titleZh ? project.titleZh : project.title;
                const projectDescription =
                  isZh && project.descriptionZh ? project.descriptionZh : project.description;

                return (
                  <SwiperSlide key={project.title}>
                    <div className="flex flex-col items-center gap-4 sm:gap-5 lg:gap-8 lg:flex-row">
                      <div className="max-w-3xl flex-1">
                        <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl md:mb-5 md:text-4xl lg:text-5xl">
                          {projectTitle}
                        </h2>
                        <p className="mb-4 text-base text-muted-foreground sm:text-lg md:mb-6 md:text-xl">
                          {projectDescription ||
                            (isZh
                              ? "探索我们正在开展的研究项目。"
                              : "Explore one of our ongoing research projects.")}
                        </p>
                        <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
                          <Button
                            asChild
                            size="lg"
                            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/30 transition-all hover:from-violet-500 hover:to-fuchsia-500 sm:w-auto"
                          >
                            <Link to={projectLink}>
                              {isZh ? "探索项目" : "Explore Project"}{" "}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                      <div className="w-full flex-1">
                        <img
                          src={projectImage}
                          alt={projectTitle}
                          className="h-auto max-h-[240px] w-full rounded-lg object-cover shadow-lg transition-transform duration-300 hover:scale-[1.02] sm:max-h-[320px] lg:max-h-none"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </section>
      ) : null}

      {/* Featured Research */}
      <section className="pt-4 pb-16 md:pt-10 md:pb-20">
  <div className="container px-4 md:px-6">
    <div className="grid gap-8 md:gap-12">
      <div className="flex flex-col gap-2 md:gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">
          {isZh ? "研究方向" : "Research Tracks"}
        </h2>
        <p className="text-muted-foreground md:text-lg">
          {isZh
            ? "四个相互连接的方向，贯通视觉理解、世界建模、内容生成与具身行动。"
            : "Four connected directions link visual understanding, world modeling, generation, and embodied action."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {researchTracks.map((item, i) => (
          <div
            key={i}
            className="flex flex-col rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-xl font-semibold mb-2">
              {isZh ? item.titleZh : item.title}
            </h3>
            <p className="text-muted-foreground flex-1">
              {isZh ? item.descriptionZh : item.description}
            </p>

            <div className="mt-4 ml-auto text-sm text-muted-foreground">
              {isZh ? "方向负责人：" : "Leader:"}{" "}
              <Link
                to={localize(`/people#${researchTrackLeaders[i].id}`)}
                className="font-medium text-violet-600 hover:text-violet-700 transition-colors"
              >
                {researchTrackLeaders[i].name}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* Key Statistics */}
      <section className="mx-0 my-[3px] rounded-none bg-muted px-4 py-[21px] sm:px-6 md:px-[36px]">
        <h2 className="sr-only">{isZh ? "VPX 概览" : "VPX at a Glance"}</h2>
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <p className="text-3xl font-bold">{publicationCount ?? "..."}</p>
              <p className="text-muted-foreground">{isZh ? "论文" : "Publications"}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <p className="text-3xl font-bold">{researcherCount ?? "..."}</p>
              <p className="text-muted-foreground">{isZh ? "在组成员" : "Current Members"}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <p className="text-3xl font-bold">{yearsOfResearch}</p>
              <p className="text-muted-foreground">{isZh ? "研究历程（年）" : "Years of Research"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Publications */}
      <section className="py-10 md:py-14">
        <div className="container px-4 md:px-6">
          <div className="flex items-end justify-between gap-6 mb-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
                {isZh ? "近期论文" : "Recent Publications"}
              </h2>
              <p className="text-muted-foreground md:text-lg">
                {isZh ? "VPX 近期代表性论文。" : "Selected recent publications from VPX."}
              </p>
            </div>
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link to={localize("/projects?tab=publications")}>
                {isZh ? "查看全部" : "View All"} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentPublications.map((pub) => (
              <a
                key={pub.id}
                href={pub.url}
                target="_blank"
                rel="noreferrer"
                className="group block border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                  {pub.mediaType === "video" && pub.media ? (
                    <video
                      src={pub.media}
                      poster={pub.poster || pub.image || "/placeholder.svg"}
                      className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={pub.media || pub.image}
                      alt={pub.title}
                      className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 text-xs font-medium bg-black/70 text-white backdrop-blur-sm border border-white/10">
                      {formatPublicationVenue(pub.venue)}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-base md:text-lg font-semibold leading-snug group-hover:underline">
                    {pub.title}
                  </h3>
                  <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-violet-600">
                    {isZh ? "查看论文" : "View publication"} <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News & Activities */}
      <section className="pt-6 pb-10 md:pt-8 md:pb-14">
        <div className="container px-4 md:px-6">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">
                {isZh ? "最新动态与活动" : "Latest News & Activities"}
              </h2>
              <p className="text-sm text-muted-foreground/80 md:text-base">
                {isZh ? "来自 VPX 的近期动态。" : "Recent updates from VPX."}
              </p>
            </div>
            <Link
              to={localize("/activities")}
              className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 transition-colors hover:text-violet-700"
            >
              {isZh ? "查看全部" : "View all"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {newsError ? (
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              <div className="mb-1 font-medium text-foreground">
                {isZh ? "动态加载失败" : "Failed to load news"}
              </div>
              <div className="break-words">{isZh ? "请稍后重试。" : newsError}</div>
            </div>
          ) : null}

          {loadingNews ? (
            <div className="text-sm text-muted-foreground">
              {isZh ? "正在加载动态…" : "Loading news…"}
            </div>
          ) : null}

          {!loadingNews && !newsError && latest8News.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {isZh ? "暂无动态。" : "No news found."}
            </div>
          ) : null}

          {!loadingNews && !newsError && latest8News.length > 0 ? (
            <div className="grid auto-rows-[220px] grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {latest8News.map((item, index) => (
                <Link
                  key={item.id}
                  to={localize(`/activities?newsId=${encodeURIComponent(String(item.id || ""))}`)}
                  className={`group relative overflow-hidden rounded-2xl border bg-slate-900 ${getMosaicClassName(index)}`}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={getNewsTitle(item)}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent" />

                  <div className="relative flex h-full flex-col justify-end p-5 text-white">
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-white/80">
                      <span className="rounded-full border border-white/20 bg-white/10 px-2 py-1 backdrop-blur-sm">
                        {formatNewsDate(item.date)}
                      </span>
                    </div>

                    <h3 className={`${index === 0 ? "text-2xl md:text-3xl" : "text-lg"} font-semibold leading-snug`}>
                      {getNewsTitle(item)}
                    </h3>

                    {index < 4 && getNewsSummary(item) ? (
                      <p className="mt-3 text-sm leading-relaxed text-white/80 line-clamp-3">
                        {getNewsSummary(item)}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default Index;
