import { ArrowRight, BookOpen, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { publicationsData } from "@/data/publications";
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

const Index = () => {
  // ----------------------
  // News (API based) - for home page latest 6
  // ----------------------
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState<string>("");

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

  return (
    <div className="page-transition">
      <section
        className="relative pt-32 pb-32 bg-cover bg-center"
        style={{
          backgroundImage: "url('/lovable-uploads/home/home_robot.gif')",
        }}
      >
        {/* 半透明遮罩 */}
        <div className="absolute inset-0 bg-background/20 backdrop-blur-sm" />

        {/* 内容 */}
        <div className="relative z-10 container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8 md:space-y-12">
            <div className="space-y-6 max-w-4xl text-lg md:text-xl">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight md:whitespace-nowrap text-white">
                Welcome to <span className="text-violet-800">VPX Group</span> @ ECNU
              </h1>
            </div>

            <div className="w-full max-w-7xl bg-gradient-to-r from-blue-900/40 to-violet-900/40 backdrop-blur-md border border-white/10 px-10 py-6 text-left">
              <div className="space-y-5 text-lg md:text-2xl leading-relaxed tracking-wide text-white/90">
                <p>
                  <span className="font-semibold text-white">Visual Perception + X (VPX)</span>{" "}
                  develops visual perception for{" "}
                  <span className="font-semibold text-cyan-300">cross-disciplinary research</span>,
                  focusing on extracting{" "}
                  <span className="font-semibold text-cyan-300">meaningful information</span> and{" "}
                  <span className="font-semibold text-cyan-300">structured data</span> from videos and
                  raw streaming sources.
                </p>

                <p>
                  We leverage visual information to enable AI-based downstream applications, including{" "}
                  <span className="font-semibold text-amber-300">metaverse</span>,{" "}
                  <span className="font-semibold text-amber-300">AIGC</span>, and{" "}
                  <span className="font-semibold text-amber-300">embodied intelligence</span>.
                </p>

                <p>
                  Our current focus includes{" "}
                  <span className="font-semibold text-emerald-300">video analysis</span>,{" "}
                  <span className="font-semibold text-emerald-300">
                    controllable image & video generation
                  </span>
                  , and <span className="font-semibold text-emerald-300">robotic manipulation</span>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 justify-center">
              <Button asChild className="px-10 py-7 text-xl bg-violet-600 hover:bg-violet-700 text-white">
                <Link to="/about">Learn About Us</Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="px-10 py-7 text-xl border border-white/40 text-violet-900 hover:bg-white/10"
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
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                    Embodied Intelligence for Automated Chemical Titration
                  </h1>
                  <p className="text-xl mb-8 text-muted-foreground">
                    An automated titration framework that combines robotic liquid handling and real-time pH feedback to
                    deliver accurate, repeatable, and safe chemical experiments.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button asChild size="lg">
                      <Link to="/projects">
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
                    src="/lovable-uploads/home/robot2.jpg"
                    alt="VPX Lab Environment"
                    className="w-full h-auto rounded-lg shadow-lg object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </SwiperSlide>

            {/* Slide 2 */}
            <SwiperSlide>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="max-w-3xl flex-1">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                    AI-Powered Virtual Human Video Generation
                  </h1>
                  <p className="text-xl mb-8 text-muted-foreground">
                    Automatically generating expressive, speaker-driven presentation videos from portraits, slides,
                    scripts, and backgrounds, enabling fast, scalable, and personalized content creation.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button asChild size="lg">
                      <Link to="/projects#aigc">Explore AIGC Research</Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/join">Join Our Team</Link>
                    </Button>
                  </div>
                </div>
                <div className="flex-1 hidden md:block">
                  <img
                    src="/lovable-uploads/home/home_metahuman.png"
                    alt="Generative AI Showcase"
                    className="w-full h-auto rounded-lg shadow-lg object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </SwiperSlide>

            {/* Slide 3 */}
            <SwiperSlide>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="max-w-3xl flex-1">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                    Toward Intelligent Cinematic Virtual Production
                  </h1>
                  <p className="text-xl mb-8 text-muted-foreground">
                    We build an intelligent filming environment where cameras, lighting, and virtual scenes collaborate automatically to achieve highly realistic and efficient virtual production.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button asChild size="lg">
                      <Link to="/projects#embodied-ai">View 3D Research</Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/join">Join Our Team</Link>
                    </Button>
                  </div>
                </div>
                <div className="flex-1 hidden md:block">
                  <img
                    src="/lovable-uploads/home/home_filming.png"
                    alt="Embodied AI Robot"
                    className="w-full h-auto rounded-lg shadow-lg object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="max-w-3xl flex-1">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                    Intelligent Sandplay for Psychological Assessment
                  </h1>
                  <p className="text-xl mb-8 text-muted-foreground">
                    Leveraging comprehensive data capture and AI-driven analysis to enhance the reliability,
                    scalability, and safety of sandplay-based psychological evaluation in educational settings.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button asChild size="lg">
                      <Link to="/projects#embodied-ai">View VLM Research</Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/join">Join Our Team</Link>
                    </Button>
                  </div>
                </div>
                <div className="flex-1 hidden md:block">
                  <img
                    src="/lovable-uploads/home/home_shapan.png"
                    alt="Embodied AI Robot"
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
              <h3 className="text-3xl font-bold">20+</h3>
              <p className="text-muted-foreground">Publications</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">30+</h3>
              <p className="text-muted-foreground">Researchers</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">5</h3>
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
              <p className="text-muted-foreground md:text-lg">Selected recent papers with arXiv links.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publicationsData.slice(0, 6).map((pub) => (
              <a
                key={pub.id}
                href={pub.arxivUrl}
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
              <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">Ongoing Research</h2>
              <p className="text-muted-foreground md:text-lg">
                Our current researchs span multiple disciplines and real-world applications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Embodied AI",
                  description:
                    "Developing intelligent agents that perceive, learn, and interact with physical environments through robotics and simulation platforms.",
                },
                {
                  title: "AIGC",
                  description:
                    "Pioneering AI-generated content technologies for text, image, video and multimodal creation using cutting-edge generative models.",
                },
                {
                  title: "3D Computer Graphics",
                  description:
                    "Advancing neural rendering, 3D Gaussian splatting, virtual reality (VR), and ray tracing technologies to power next-generation immersive visual experiences.",
                },
                {
                  title: "Video Analysis",
                  description:
                    "Pioneering video understanding, object tracking, video action analysis, and multimodal large language models (LLMs) to build next-generation intelligent video systems.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col p-6 bg-card rounded-lg border hover:shadow-md transition-shadow fade-in-content"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground flex-1">{item.description}</p>
                  <Button asChild variant="link" className="mt-4 ml-auto p-0">
                    <Link to={`/projects#${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      Learn more <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
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

            <div className="h-[520px] overflow-y-auto p-5">
              {newsError ? (
                <div className="rounded-md border p-4 text-sm text-muted-foreground">
                  <div className="font-medium text-foreground mb-1">Failed to load news</div>
                  <div className="break-words">{newsError}</div>s
                </div>
              ) : null}

              {loadingNews ? <div className="text-sm text-muted-foreground">Loading news…</div> : null}

              {!loadingNews && !newsError && latest6News.length === 0 ? (
                <div className="text-sm text-muted-foreground">No news found.</div>
              ) : null}

              <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
                {latest6News.map((item) => (
                  <a
                    key={item.id}
                    href={item.source_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="mb-5 block break-inside-avoid border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="w-full overflow-hidden bg-muted">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-auto object-cover" loading="lazy" />
                      ) : null}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 border bg-muted">{sourceLabel(item.source)}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold leading-snug">{item.title}</h3>

                      {(item.sub_title || item.description) ? (
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                          {item.sub_title || item.description}
                        </p>
                      ) : null}

                      <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-violet-600">
                        Open <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </a>
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
