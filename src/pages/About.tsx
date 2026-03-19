import { useEffect, useRef, useState, type CSSProperties } from "react";
import { labLifeData, type LabLifeItem } from "@/data/labLife";
import { Award, BookOpen, GraduationCap, Heart, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const surfaceClassName =
  "rounded-2xl border border-border/60 bg-background/85 shadow-[0_22px_70px_-52px_rgba(0,0,0,0.32)] overflow-hidden";

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
};

const LabLifeTile = ({ item, index, scrollRoot }: LabLifeTileProps) => {
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
          <img
            src={resolveLabLifeImageSrc(item.image)}
            alt={item.title || "Lab life"}
            loading={index < 6 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={index < 3 ? "high" : "auto"}
            onLoad={() => setIsLoaded(true)}
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
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
                  About VPX Group
                </h1>
                <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-border/70 to-transparent" />
              </div>

              <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-10">
                <div className="lg:w-[62%]">
                  <div className="rounded-2xl border border-border/60 bg-background/90 p-6 shadow-[0_22px_70px_-48px_rgba(0,0,0,0.28)] md:p-8">
                    <p className="mb-6 text-base leading-relaxed text-muted-foreground md:text-lg">
                      The{" "}
                      <span className="bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text font-semibold text-transparent">
                        Visual Perception + X (VPX) Group
                      </span>{" "}
                      is a research group led by{" "}
                      <span className="bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text font-semibold text-transparent">
                        Prof. Yang Li
                      </span>{" "}
                      within the{" "}
                      <span className="bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text font-semibold text-transparent">
                        School of Computer Science and Technology
                      </span>{" "}
                      at{" "}
                      <span className="bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text font-semibold text-transparent">
                        East China Normal University (ECNU)
                      </span>
                      .
                    </p>

                    <p className="mb-6 text-base leading-relaxed text-muted-foreground md:text-lg">
                      Our mission is to advance{" "}
                      <span className="bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text font-semibold text-transparent">
                        visual perception for cross-disciplinary research
                      </span>
                      , focusing on extracting{" "}
                      <span className="bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text font-semibold text-transparent">
                        meaningful information
                      </span>{" "}
                      and{" "}
                      <span className="bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text font-semibold text-transparent">
                        structured data
                      </span>{" "}
                      from videos and raw streaming sources.
                    </p>

                    <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                      Currently, VPX focuses on{" "}
                      <span className="bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text font-semibold text-transparent">
                        video analysis
                      </span>
                      ,{" "}
                      <span className="bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text font-semibold text-transparent">
                        controllable image and video generation
                      </span>
                      , and{" "}
                      <span className="bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text font-semibold text-transparent">
                        non-rigid object manipulation in robotics
                      </span>
                      , enabling applications in the metaverse, AIGC, and embodied intelligence.
                    </p>

                    <p className="mt-6 text-base text-muted-foreground md:text-lg">
                      For more information, please visit our{" "}
                      <a
                        href="https://space.bilibili.com/487404760"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text font-medium text-transparent transition-opacity hover:opacity-85"
                      >
                        Bilibili
                      </a>{" "}
                      and{" "}
                      <a
                        href="https://github.com/vpx-ecnu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text font-medium text-transparent transition-opacity hover:opacity-85"
                      >
                        GitHub
                      </a>
                      .
                    </p>
                  </div>
                </div>

                <div className="w-full lg:w-[38%]">
                  <div className="rounded-2xl border border-border/60 bg-background/92 p-2 shadow-[0_22px_70px_-48px_rgba(0,0,0,0.28)] sm:p-3">
                    <img
                      src="/vpx-assets/about/about_about_vpx.jpg"
                      alt="About VPX Group"
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
            <div className="px-4 py-6 sm:px-6 sm:py-7 md:px-8 md:py-9">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                    Lab Life
                  </h2>
                  <p className="text-muted-foreground md:text-lg">
                    Moments from our daily research, demos, meetings, and events.
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
                      />
                    ))}
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-xl bg-gradient-to-t from-background/92 to-transparent" />
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
                      <h2 className="text-2xl font-bold">VPX Mission</h2>
                    </div>
                    <p className="text-muted-foreground">
                      To cultivate rigorous, responsible researchers who combine academic ambition with strong execution, professionalism, and continuous improvement.
                    </p>
                  </div>

                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <GraduationCap className="h-6 w-6 text-violet-600" />
                      <h2 className="text-2xl font-bold">How We Work</h2>
                    </div>
                    <ul className="list-disc space-y-2 pl-6 text-base text-muted-foreground md:text-lg">
                      <li><span className="font-semibold">Pursue research that creates long-term value.</span></li>
                      <li><span className="font-semibold">Work efficiently and communicate clearly.</span></li>
                      <li><span className="font-semibold">Maintain professional standards in research and engineering.</span></li>
                      <li><span className="font-semibold">Think logically and make decisions based on evidence.</span></li>
                      <li><span className="font-semibold">Build a healthy, sustainable, and supportive lab culture.</span></li>
                      <li><span className="font-semibold">Prioritize execution and finish what we start.</span></li>
                      <li><span className="font-semibold">Review our work from the perspective of reviewers and users.</span></li>
                    </ul>
                  </div>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    "/vpx-assets/about/about_1.png",
                    "/vpx-assets/about/about_2.png",
                    "/vpx-assets/about/about_3.png",
                    "/vpx-assets/about/about_4.png",
                  ].map((src, idx) => (
                    <div
                      key={src}
                      className="rounded-xl border border-border/60 bg-background/92 p-2 shadow-sm"
                    >
                      <img
                        src={src}
                        alt={`img${idx + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="h-auto w-full rounded-lg object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="py-2">
            <div className="mx-auto max-w-screen-xl">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold tracking-tight">Our Core Values</h2>
                <p className="mt-2 text-muted-foreground">
                  Guiding principles that shape how we research, collaborate, and grow.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    icon: <BookOpen className="h-7 w-7" />,
                    title: "Academic Excellence",
                    description:
                      "We uphold the highest standards of scholarly rigor and intellectual integrity in all our research endeavors.",
                  },
                  {
                    icon: <Award className="h-7 w-7" />,
                    title: "Innovation",
                    description:
                      "We embrace creative approaches and novel methodologies to address complex research questions.",
                  },
                  {
                    icon: <Heart className="h-7 w-7" />,
                    title: "Inclusivity",
                    description:
                      "We foster a diverse and inclusive environment where all perspectives are valued and respected.",
                  },
                ].map((value, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-border/60 bg-background/90 p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="inline-flex items-center justify-center rounded-lg border border-border/60 bg-gradient-to-b from-violet-500/10 to-cyan-500/5 p-2.5 text-violet-600">
                        {value.icon}
                      </div>
                      <h3 className="text-lg font-semibold leading-snug">{value.title}</h3>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-8 md:gap-10">
            <div className="mx-auto w-full max-w-screen-xl">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Research Focus Areas
              </h2>
              <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-border/70 to-transparent" />

              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    title: "Embodied Intelligence",
                    description:
                      "Integrating perception, reasoning, and action to enable intelligent agents that interact with the physical world.",
                  },
                  {
                    title: "AI-Generated Content (AIGC)",
                    description:
                      "Pioneering generative AI models for text, image, and video creation across multimodal creative applications.",
                  },
                  {
                    title: "3D Rendering & Graphics",
                    description:
                      "Advancing real-time neural rendering, Gaussian splatting, and immersive 3D experiences for next-generation visual computing.",
                  },
                  {
                    title: "Video Understanding",
                    description:
                      "Developing models for temporal segmentation, object tracking, and multimodal video analysis to unlock insights from dynamic visual data.",
                  },
                ].map((area, index) => (
                  <Card
                    key={index}
                    className="border-border/60 bg-background/90 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{area.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="leading-relaxed">
                        {area.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
