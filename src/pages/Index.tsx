import { ArrowRight, BookOpen, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { useEffect, useMemo, useState } from "react";

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
};

const Index = () => {
  // ----------------------
  // News (API based) - for home page latest 6
  // ----------------------
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState<string>("");
  const [publicationCount, setPublicationCount] = useState<number | null>(null);
  const [researcherCount, setResearcherCount] = useState<number | null>(null);
  const [recentPublications, setRecentPublications] = useState<RecentPublication[]>([]);

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
    let cancelled = false;

    const loadRecentPublications = async () => {
      try {
        const r = await fetch("/publications/recent_publications.json");
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
      try {
        const pubResp = await fetch("/publications/publication_updated.json");
        const pubJson = await pubResp.json();
        if (!cancelled) {
          setPublicationCount(Array.isArray(pubJson) ? pubJson.length : 0);
        }
      } catch {
        if (!cancelled) setPublicationCount(0);
      }

      try {
        const peopleResults = await Promise.allSettled(
          peopleFiles.map(async (path) => {
            const r = await fetch(path);
            if (!r.ok) return 0;
            const data = await r.json();
            return countPeople(data);
          })
        );

        const total = peopleResults.reduce((sum, result) => {
          if (result.status === "fulfilled") return sum + result.value;
          return sum;
        }, 0);

        if (!cancelled) setResearcherCount(total);
      } catch {
        if (!cancelled) setResearcherCount(0);
      }
    };

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const yearsOfResearch = useMemo(() => {
    const startYear = 2020;
    const currentYear = new Date().getFullYear();
    return Math.max(1, currentYear - startYear + 1);
  }, []);

  const latest6News = useMemo(() => {
    const sorted = [...newsList].sort((a, b) => {
      const ta = new Date(a.date).getTime();
      const tb = new Date(b.date).getTime();
      return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
    });
    return sorted.slice(0, 6);
  }, [newsList]);

  const sourceLabel = (source?: string) => {
    const s = (source || "").toLowerCase();
    if (s.includes("xiaohongshu") || s === "xhs") return "Xiaohongshu";
    if (s.includes("bilibili") || s === "bili") return "Bilibili";
    if (s.includes("twitter") || s.includes("x.com") || s === "twitter") return "Twitter / X";
    return source || "Website";
  };

  const getNewsTitle = (item: NewsItem) => {
    const primary = item.title?.trim() || item.sub_title?.trim();
    if (primary) return primary;
    return item.source ? `${sourceLabel(item.source)} Update` : "VPX Update";
  };

  return (
    <div className="page-transition">
      <section
  className="relative isolate overflow-hidden pt-20 pb-20 md:pt-24 md:pb-24 bg-cover bg-center"
  style={{ backgroundImage: "url('/lovable-uploads/home/home_robot.gif')" }}
>
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
      <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm md:text-base text-white/85 backdrop-blur-md mb-2">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/90" />
        Visual Perception + X • ECNU
      </div>

      <div className="mt-5 space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-violet-200 via-white to-cyan-200 bg-clip-text text-transparent">
            VPX Group
          </span>{" "}
          @ ECNU
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

    <div className="px-8 py-9 md:px-14 md:py-11 text-left">
      <div className="space-y-6 text-lg md:text-xl leading-relaxed text-white/85">

        <p>
          <span className="font-semibold text-white">
            Visual Perception + X (VPX)
          </span>{" "}
          develops visual perception for{" "}
          <span className="font-semibold bg-gradient-to-r from-violet-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
            cross-disciplinary research
          </span>
          , focusing on extracting{" "}
          <span className="font-semibold bg-gradient-to-r from-violet-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
            meaningful information
          </span>{" "}
          and{" "}
          <span className="font-semibold bg-gradient-to-r from-violet-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
            structured representations
          </span>{" "}
          from videos and raw streaming sources.
        </p>

        <p>
          Our research explores visual intelligence from perception to generation and
          interaction, with a focus on{" "}
          <span className="font-semibold bg-gradient-to-r from-violet-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
            Embodied AI, AIGC, 3D Computer Graphics, and Video Analysis
          </span>
          .
        </p>

      </div>
    </div>
  </div>
</div>


      {/* CTA 按钮：更统一的配色与 hover（第二个按钮文字别用深紫，否则在暗背景不稳） */}
      <div className="mt-10 flex flex-wrap gap-4 justify-center">
        <Button
          asChild
          className="px-9 py-7 text-lg md:text-xl text-white shadow-lg shadow-violet-600/25
                     bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
        >
          <Link to="/about">Learn About Us</Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="px-9 py-7 text-lg md:text-xl text-white
                     border-white/30 bg-white/5 hover:bg-white/10 hover:border-white/40"
        >
          <Link to="/projects">View Our Projects</Link>
        </Button>
      </div>
    </div>
  </div>
</section>


      <section className="py-20 px-6 md:px-12 lg:px-24 bg-secondary/30">
        <div className="relative overflow-visible">
          <Swiper modules={[Navigation]} navigation spaceBetween={50} slidesPerView={1} className="relative container">
            {/* Slide 1 */}
            <SwiperSlide>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="max-w-3xl flex-1">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    Embodied Intelligence for Automated Chemical Titration
                  </h1>
                  <p className="text-xl mb-8 text-muted-foreground">
                    An automated titration framework that combines robotic liquid handling and real-time pH feedback to
                    deliver accurate, repeatable, and safe chemical experiments.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button
                        asChild
                        size="lg"
                        className="
                          bg-gradient-to-r from-violet-600 to-fuchsia-600
                          hover:from-violet-500 hover:to-fuchsia-500
                          text-white
                          shadow-lg shadow-violet-600/30
                          transition-all
                        "
                      >
                    <Link to="/projects?project=embodied-intelligence-for-automated-chemical-titration">
                      Explore Robot Research <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/join">Join Our Team</Link>
                    </Button>
                  </div>
                </div>
                <div className="flex-1 hidden md:block">
                  <img
                    src="/lovable-uploads/home/home_robot.jpg"
                    alt="Automated chemical titration robot"
                    className="w-full h-auto rounded-lg shadow-lg object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </SwiperSlide>

            {/* Slide 2 */}
            <SwiperSlide>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="max-w-3xl flex-1">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    AI-Powered Virtual Human Video Generation
                  </h1>
                  <p className="text-xl mb-8 text-muted-foreground">
                    Automatically generating expressive, speaker-driven presentation videos from portraits, slides,
                    scripts, and backgrounds, enabling fast, scalable, and personalized content creation.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button
                        asChild
                        size="lg"
                        className="
                          bg-gradient-to-r from-violet-600 to-fuchsia-600
                          hover:from-violet-500 hover:to-fuchsia-500
                          text-white
                          shadow-lg shadow-violet-600/30
                          transition-all
                        "
                      >
                      <Link to="/projects?project=ai-powered-virtual-human-video-generation">
                        Explore AIGC Research
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/join">Join Our Team</Link>
                    </Button>
                  </div>
                </div>
                <div className="flex-1 hidden md:block">
                  <img
                    src="/lovable-uploads/home/home_metahuman.png"
                    alt="Virtual human generation demo"
                    className="w-full h-auto rounded-lg shadow-lg object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </SwiperSlide>

            {/* Slide 3 */}
            <SwiperSlide>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="max-w-3xl flex-1">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    Toward Intelligent Cinematic Virtual Production
                  </h1>
                  <p className="text-xl mb-8 text-muted-foreground">
                    We build an intelligent filming environment where cameras, lighting, and virtual scenes collaborate automatically to achieve highly realistic and efficient virtual production.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button
                        asChild
                        size="lg"
                        className="
                          bg-gradient-to-r from-violet-600 to-fuchsia-600
                          hover:from-violet-500 hover:to-fuchsia-500
                          text-white
                          shadow-lg shadow-violet-600/30
                          transition-all
                        "
                      >
                      <Link to="/projects?project=intelligent-virtual-production-with-camera-and-lighting-co-design">
                        View 3D Research
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/join">Join Our Team</Link>
                    </Button>
                  </div>
                </div>
                <div className="flex-1 hidden md:block">
                  <img
                    src="/lovable-uploads/home/home_filming.png"
                    alt="Virtual production research demo"
                    className="w-full h-auto rounded-lg shadow-lg object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="max-w-3xl flex-1">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    Intelligent Sandplay for Psychological Assessment
                  </h1>
                  <p className="text-xl mb-8 text-muted-foreground">
                    Leveraging comprehensive data capture and AI-driven analysis to enhance the reliability,
                    scalability, and safety of sandplay-based psychological evaluation in educational settings.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button
                        asChild
                        size="lg"
                        className="
                          bg-gradient-to-r from-violet-600 to-fuchsia-600
                          hover:from-violet-500 hover:to-fuchsia-500
                          text-white
                          shadow-lg shadow-violet-600/30
                          transition-all
                        "
                      >
                      <Link to="/projects?project=intelligent-sandplay-for-psychological-assessment">
                        View VLM Research
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/join">Join Our Team</Link>
                    </Button>
                  </div>
                </div>
                <div className="flex-1 hidden md:block">
                  <img
                    src="/lovable-uploads/home/home_shapan.png"
                    alt="Psychological assessment research demo"
                    className="w-full h-auto rounded-lg shadow-lg object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </section>

      {/* Key Statistics */}
      <section className="bg-muted my-[3px] py-[21px] mx-0 px-[36px] rounded-none">
        <div className="container px-4 md:px-6 fade-in-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">{publicationCount ?? "..."}</h3>
              <p className="text-muted-foreground">Publications</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">{researcherCount ?? "..."}</h3>
              <p className="text-muted-foreground">Current Members</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">{yearsOfResearch}</h3>
              <p className="text-muted-foreground">Years of Research</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Publications */}
      <section className="py-10 md:py-14">
        <div className="container px-4 md:px-6">
          <div className="flex items-end justify-between gap-6 mb-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Recent Publications</h2>
              <p className="text-muted-foreground md:text-lg">Selected recent papers with project webpages.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentPublications.map((pub) => (
              <a
                key={pub.id}
                href={pub.url}
                target="_blank"
                rel="noreferrer"
                className="group block border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                  <img
                    src={pub.image}
                    alt={pub.title}
                    className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 text-xs font-medium bg-black/70 text-white backdrop-blur-sm border border-white/10">
                      {pub.venue}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-base md:text-lg font-semibold leading-snug group-hover:underline">
                    {pub.title}
                  </h3>
                  <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-violet-600">
                    View on web <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Research */}
      <section className="pt-4 pb-16 md:pt-10 md:pb-20">
  <div className="container px-4 md:px-6">
    <div className="grid gap-8 md:gap-12">
      <div className="fade-in-content flex flex-col gap-2 md:gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">Core Research Areas</h2>
        <p className="text-muted-foreground md:text-lg">
          Our current research spans multiple disciplines and real-world applications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Embodied AI",
            description:
              "Developing intelligent agents that perceive, learn, and interact with physical environments through robotics and simulation platforms.",
            leaderName: "Xiangyi Wei",
            leaderId: "phd-xiangyi-wei",
          },
          {
            title: "AIGC",
            description:
              "Pioneering AI-generated content technologies for text, image, video and multimodal creation using cutting-edge generative models.",
            leaderName: "Yu Zhang",
            leaderId: "grad-yu-zhang",
          },
          {
            title: "3D Computer Graphics",
            description:
              "Advancing neural rendering, 3D Gaussian splatting, virtual reality (VR), and ray tracing technologies to power next-generation immersive visual experiences.",
            leaderName: "Yijing Wa",
            leaderId: "grad-yijing-wa",
          },
          {
            title: "Video Analysis",
            description:
              "Pioneering video understanding, object tracking, video action analysis, and multimodal large language models (LLMs) to build next-generation intelligent video systems.",
            leaderName: "Chenxi Shao",
            leaderId: "grad-chenxi-shao",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="flex flex-col p-6 bg-card rounded-lg border hover:shadow-md transition-shadow fade-in-content"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-muted-foreground flex-1">{item.description}</p>

            {/* ✅ 这里是替换 Learn more 的部分 */}
            <div className="mt-4 ml-auto text-sm text-muted-foreground">
              Leader:{" "}
              <Link
                to={`/people#${item.leaderId}`}
                className="font-medium text-violet-600 hover:text-violet-700 transition-colors"
              >
                {item.leaderName}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>


      {/* Latest News Wall in a scrollable window */}
      <section className="pt-6 pb-10 md:pt-8 md:pb-14">
        <div className="container px-4 md:px-6">
          <div className="flex items-end justify-between gap-6 mb-6">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">Latest News & Activities</h2>
              <p className="text-muted-foreground md:text-lg">A feed-style wall of recent updates.</p>
            </div>
          </div>

          <div className="border bg-card">
            <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
              <div className="text-sm font-medium">Updates</div>
              <Link to="/activities" className="text-sm font-medium text-violet-600 hover:underline">
                View all
              </Link>
            </div>

            <div className="h-[680px] overflow-y-auto p-5">
              {newsError ? (
                <div className="rounded-md border p-4 text-sm text-muted-foreground">
                  <div className="font-medium text-foreground mb-1">Failed to load news</div>
                  <div className="break-words">{newsError}</div>
                </div>
              ) : null}

              {loadingNews ? <div className="text-sm text-muted-foreground">Loading news…</div> : null}

              {!loadingNews && !newsError && latest6News.length === 0 ? (
                <div className="text-sm text-muted-foreground">No news found.</div>
              ) : null}

              <div className="columns-1 sm:columns-2 lg:columns-4 gap-5 [column-fill:_balance]">
                {latest6News.map((item) => (
                  <Link
                    key={item.id}
                    to={`/activities?newsId=${encodeURIComponent(String(item.id || ""))}`}
                    className="mb-5 block break-inside-avoid border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="w-full overflow-hidden bg-muted">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={getNewsTitle(item)}
                          className="w-full h-auto object-cover"
                          loading="lazy"
                        />
                      ) : null}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {/* <span className="text-xs px-2 py-1 border bg-muted">{sourceLabel(item.source)}</span> */}
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold leading-snug">
                        {getNewsTitle(item)}
                      </h3>

                      {(item.sub_title || item.description) ? (
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                          {item.sub_title || item.description}
                        </p>
                      ) : null}

                      <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-violet-600">
                        Open <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
