import { useEffect, useRef, useState, type CSSProperties } from "react";
import { labLifeData, type LabLifeItem } from "@/data/labLife";
import { coreValues, researchTracks } from "@/data/researchIdentity";
import {
  ArrowDown,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUp,
  GraduationCap,
  Heart,
  Sparkles,
  Target,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/i18n/locale";

const surfaceClassName =
  "rounded-2xl border border-border/60 bg-background/85 shadow-[0_22px_70px_-52px_rgba(0,0,0,0.32)] overflow-hidden";
const coreValueIcons = [Sparkles, Target, Heart] as const;
const missionDirections = [
  {
    track: researchTracks[0],
    position: "col-start-3 row-start-1",
    theme: "border-violet-500/30 bg-violet-500/10 text-violet-950 dark:text-violet-100",
  },
  {
    track: researchTracks[1],
    position: "col-start-5 row-start-3",
    theme: "border-cyan-500/30 bg-cyan-500/10 text-cyan-950 dark:text-cyan-100",
  },
  {
    track: researchTracks[2],
    position: "col-start-3 row-start-5",
    theme: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-950 dark:text-fuchsia-100",
  },
  {
    track: researchTracks[3],
    position: "col-start-1 row-start-3",
    theme: "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100",
  },
] as const;

const tileStyle: CSSProperties = {
  contain: "layout paint style",
  containIntrinsicSize: "320px 240px",
  contentVisibility: "auto",
};

const resolveLabLifeImageSrc = (src: string) =>
  src.includes("/vpx-assets/about/lab-life/web/")
    ? src
    : src.replace("/vpx-assets/about/lab-life/", "/vpx-assets/about/lab-life/web/");

type LabLifeTileProps = {
  item: LabLifeItem;
  index: number;
  scrollRoot: HTMLDivElement | null;
  isZh: boolean;
};

const LabLifeTile = ({ item, index, scrollRoot, isZh }: LabLifeTileProps) => {
  const [shouldLoad, setShouldLoad] = useState(index < 6);
  const [isLoaded, setIsLoaded] = useState(false);
  const frameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldLoad || !frameRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      {
        root: scrollRoot,
        rootMargin: "280px 0px",
      }
    );

    observer.observe(frameRef.current);
    return () => observer.disconnect();
  }, [scrollRoot, shouldLoad]);

  const Wrapper = item.link ? "a" : "div";

  return (
    <Wrapper
      {...(item.link
        ? { href: item.link, target: "_blank", rel: "noreferrer" }
        : {})}
      className="group block overflow-hidden bg-transparent"
    >
      <div
        ref={frameRef}
        style={tileStyle}
        className="relative aspect-[4/3] w-full overflow-hidden bg-muted/60"
      >
        {shouldLoad ? (
          <>
            {item.imageFit === "contain" ? (
              <img
                src={resolveLabLifeImageSrc(item.image)}
                alt=""
                aria-hidden="true"
                loading={index < 6 ? "eager" : "lazy"}
                decoding="async"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-xl"
              />
            ) : null}
            <img
              src={resolveLabLifeImageSrc(item.image)}
              alt={isZh ? "VPX 实验室生活" : item.title || "Lab life"}
              loading={index < 6 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={index < 3 ? "high" : "auto"}
              onLoad={() => setIsLoaded(true)}
              className={`relative h-full w-full transition-opacity duration-300 ${
                item.imageFit === "contain" ? "object-contain" : "object-cover"
              } ${isLoaded ? "opacity-100" : "opacity-0"}`}
            />
          </>
        ) : null}

        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br from-muted/75 via-muted/45 to-muted/15 transition-opacity duration-300 ${
            isLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      </div>
    </Wrapper>
  );
};

const About = () => {
  const [labLifeScrollRoot, setLabLifeScrollRoot] = useState<HTMLDivElement | null>(null);
  const { isZh } = useLocale();
  const workPrinciples = isZh
    ? [
        "提出原创问题，深入思考底层机制。",
        "设计严谨的实验，以证据检验研究结论。",
        "将有潜力的想法发展为完整、可复现的研究。",
        "清晰沟通，欢迎建设性的批评与讨论。",
        "共同建设健康、包容且可持续的实验室文化。",
      ]
    : [
        "Ask original questions and examine underlying mechanisms.",
        "Design rigorous experiments and evaluate claims against evidence.",
        "Turn promising ideas into complete, reproducible research.",
        "Communicate clearly and welcome constructive critique.",
        "Build a healthy, inclusive, and sustainable lab culture.",
      ];

  return (
    <div className="relative w-full overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-28 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/18 blur-3xl" />
        <div className="absolute top-64 -left-24 h-[360px] w-[360px] rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute right-[-120px] top-20 h-[360px] w-[360px] rounded-full bg-fuchsia-400/12 blur-3xl" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[460px] w-[460px] rounded-full bg-indigo-500/14 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/85 to-background" />
      </div>

      <div className="relative z-10 container px-4 py-10 md:px-6 md:py-14">
        <div className="space-y-16 md:space-y-20">
          <section className="relative">
            <div className="mx-auto max-w-screen-xl">
              <div className="mb-8 md:mb-10">
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                  {isZh ? "关于 VPX Group" : "About VPX Group"}
                </h1>
                <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-border/70 to-transparent" />
              </div>

              <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-10">
                <div className="lg:w-[62%]">
                  <div className="rounded-2xl border border-border/60 bg-background/90 p-6 shadow-[0_22px_70px_-48px_rgba(0,0,0,0.28)] md:p-8">
                    <div className="space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
                      <p>
                        {isZh ? "依托" : "Based at"}{" "}
                        <span className="bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text font-semibold text-transparent">
                          {isZh ? "华东师范大学" : "East China Normal University"}
                        </span>
                        {isZh ? "，" : ", the "}
                        <span className="bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text font-semibold text-transparent">
                          {isZh ? "视觉感知 + X（VPX）研究组" : "Visual Perception + X (VPX) Group"}
                        </span>
                        {isZh
                          ? "以视觉感知为基础，与其他学科交叉融合，推动"
                          : " takes visual perception as its foundation and connects it with other disciplines to advance "}
                        <span className="bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text font-semibold text-transparent">
                          {isZh ? "以人为本的通用人工智能" : "human-centered AGI"}
                        </span>
                        {isZh ? "的发展。" : "."}
                      </p>

                      <p>
                        {isZh
                          ? "我们研究智能系统如何感知并建模动态环境、生成可控内容，以及在物理世界中行动。我们的工作连接四个研究方向："
                          : "We study how intelligent systems perceive and model dynamic environments, generate controllable content, and act in the physical world. Our work connects four research directions:"}
                      </p>

                      <ul className="space-y-2.5 border-l border-border/70 pl-5">
                        {researchTracks.map((track) => (
                          <li key={track.name}>
                            <span className="font-semibold text-foreground">
                              {isZh ? track.nameZh : track.name}
                            </span>{" "}
                            — {isZh ? track.shortDescriptionZh : track.shortDescription}
                          </li>
                        ))}
                      </ul>

                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-[38%]">
                  <div className="rounded-2xl border border-border/60 bg-background/92 p-2 shadow-[0_22px_70px_-48px_rgba(0,0,0,0.28)] sm:p-3">
                    <img
                      src="/vpx-assets/about/about_about_vpx.jpg"
                      alt=""
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      className="h-auto w-full rounded-xl object-cover shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={surfaceClassName}>
            <div className="px-4 py-7 sm:px-6 md:px-8 md:py-10">
              <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
                <div className="flex-1 space-y-12">
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <Target className="h-6 w-6 text-violet-600" />
                      <h2 className="text-2xl font-bold">
                        {isZh ? "VPX 使命" : "VPX Mission"}
                      </h2>
                    </div>
                    <p className="text-muted-foreground">
                      {isZh
                        ? "以原创、严谨的研究推动以人为本的通用人工智能，让技术造福人类与社会；同时在相互支持的实验室文化中，帮助每位成员建立独立的研究判断力。"
                        : "To pursue original, rigorous research toward human-centered AGI that benefits people and society, while helping members develop independent research judgment in a supportive lab culture."}
                    </p>
                  </div>

                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <GraduationCap className="h-6 w-6 text-violet-600" />
                      <h2 className="text-2xl font-bold">
                        {isZh ? "我们的研究方式" : "How We Work"}
                      </h2>
                    </div>
                    <ul className="list-disc space-y-2 pl-6 text-base text-muted-foreground md:text-lg">
                      {workPrinciples.map((principle) => (
                        <li key={principle}>
                          <span className="font-semibold">{principle}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="w-full flex-1 lg:max-w-[30rem]">
                  <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] via-background to-cyan-500/[0.08] p-5 shadow-sm sm:p-7">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet-500/15 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-cyan-400/15 blur-3xl" />
                    <div className="relative">
                      <p className="mb-6 text-center text-xs font-semibold text-muted-foreground sm:text-sm">
                        {isZh
                          ? "四个研究方向彼此促进，共同指向以人为本的 AGI"
                          : "Four mutually reinforcing directions, one human-centered goal"}
                      </p>
                      <p className="sr-only">
                        {isZh
                          ? "时序智能、空间智能、生成式智能与物理智能彼此促进，并分别为以人为本的通用人工智能贡献关键能力。"
                          : "Temporal, spatial, generative, and physical AI reinforce one another while each contributes essential capabilities toward human-centered AGI."}
                      </p>
                      <div className="grid w-full grid-cols-[minmax(0,1fr)_1.25rem_minmax(0,1.15fr)_1.25rem_minmax(0,1fr)] grid-rows-[auto_1.5rem_auto_1.5rem_auto] items-center">
                        {missionDirections.map(({ track, position, theme }) => (
                          <div
                            key={track.name}
                            className={`${position} ${theme} flex min-h-16 items-center justify-center rounded-xl border px-1.5 py-2 text-center text-[0.68rem] font-semibold leading-tight shadow-sm sm:min-h-20 sm:px-3 sm:text-sm`}
                          >
                            {isZh ? track.nameZh : track.name}
                          </div>
                        ))}

                        <ArrowDown
                          className="col-start-3 row-start-2 h-4 w-4 place-self-center text-violet-500"
                          aria-hidden="true"
                        />
                        <ArrowLeft
                          className="col-start-4 row-start-3 h-4 w-4 place-self-center text-cyan-500"
                          aria-hidden="true"
                        />
                        <ArrowUp
                          className="col-start-3 row-start-4 h-4 w-4 place-self-center text-fuchsia-500"
                          aria-hidden="true"
                        />
                        <ArrowRight
                          className="col-start-2 row-start-3 h-4 w-4 place-self-center text-emerald-500"
                          aria-hidden="true"
                        />

                        <ArrowLeftRight
                          className="col-start-4 row-start-2 h-4 w-4 rotate-45 place-self-center text-muted-foreground/80"
                          aria-hidden="true"
                        />
                        <ArrowLeftRight
                          className="col-start-4 row-start-4 h-4 w-4 -rotate-45 place-self-center text-muted-foreground/80"
                          aria-hidden="true"
                        />
                        <ArrowLeftRight
                          className="col-start-2 row-start-4 h-4 w-4 rotate-45 place-self-center text-muted-foreground/80"
                          aria-hidden="true"
                        />
                        <ArrowLeftRight
                          className="col-start-2 row-start-2 h-4 w-4 -rotate-45 place-self-center text-muted-foreground/80"
                          aria-hidden="true"
                        />

                        <div className="col-start-3 row-start-3 flex min-h-24 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 px-2 py-3 text-center text-white shadow-lg shadow-violet-500/20 sm:min-h-28 sm:px-3">
                          <Heart className="mb-1.5 h-5 w-5" aria-hidden="true" />
                          <span className="text-xs font-bold leading-tight sm:text-sm">
                            {isZh ? "以人为本的 AGI" : "Human-centered AGI"}
                          </span>
                          <span className="mt-1 hidden text-[0.65rem] leading-tight text-white/80 sm:block">
                            {isZh ? "造福人类与社会" : "Benefiting people and society"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-2">
            <div className="mx-auto max-w-screen-xl">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold tracking-tight">
                  {isZh ? "我们的核心价值观" : "Our Core Values"}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {isZh
                    ? "这些原则贯穿我们对成员的选拔、培养与共同成长。"
                    : "These principles guide how we select, mentor, and grow our members."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {coreValues.map((value, index) => {
                  const Icon = coreValueIcons[index];
                  return (
                  <div
                    key={value.title}
                    className="rounded-2xl border border-border/60 bg-background/90 p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="inline-flex items-center justify-center rounded-lg border border-border/60 bg-gradient-to-b from-violet-500/10 to-cyan-500/5 p-2.5 text-violet-600">
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-lg font-semibold leading-snug">
                        {isZh ? value.titleZh : value.title}
                      </h3>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {isZh ? value.descriptionZh : value.description}
                    </p>
                  </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="grid gap-8 md:gap-10">
            <div className="mx-auto w-full max-w-screen-xl">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                {isZh ? "研究方向" : "Research Tracks"}
              </h2>
              <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-border/70 to-transparent" />

              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {researchTracks.map((area) => (
                  <Card
                    key={area.name}
                    className="border-border/60 bg-background/90 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        {isZh ? area.titleZh : area.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="leading-relaxed">
                        {isZh ? area.descriptionZh : area.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section className={surfaceClassName}>
            <div className="px-4 py-6 sm:px-6 sm:py-7 md:px-8 md:py-9">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                    {isZh ? "实验室生活" : "Lab Life"}
                  </h2>
                  <p className="text-muted-foreground md:text-lg">
                    {isZh
                      ? "记录我们的日常研究、演示、组会与活动。"
                      : "Moments from our daily research, demos, meetings, and events."}
                  </p>
                </div>
              </div>

              <div className="relative rounded-xl border border-border/60 bg-background/92">
                <div
                  ref={setLabLifeScrollRoot}
                  className="h-[420px] overflow-y-auto pr-2 sm:h-[520px] md:h-[640px]"
                  style={{
                    scrollbarGutter: "stable",
                  }}
                >
                  <div className="grid grid-cols-1 gap-px bg-border/40 sm:grid-cols-2 lg:grid-cols-3">
                    {labLifeData.map((item, index) => (
                      <LabLifeTile
                        key={item.id}
                        item={item}
                        index={index}
                        scrollRoot={labLifeScrollRoot}
                        isZh={isZh}
                      />
                    ))}
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-xl bg-gradient-to-t from-background/92 to-transparent" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
