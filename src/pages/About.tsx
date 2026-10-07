import { useEffect, useRef, useState, type CSSProperties } from "react";
import { labLifeData, type LabLifeItem } from "@/data/labLife";
import { coreValues, researchTracks } from "@/data/researchIdentity";
import { GraduationCap, Heart, Sparkles, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const surfaceClassName =
  "rounded-2xl border border-border/60 bg-background/85 shadow-[0_22px_70px_-52px_rgba(0,0,0,0.32)] overflow-hidden";
const coreValueIcons = [Sparkles, Target, Heart] as const;

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
              alt={item.title || "Lab life"}
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
                    <div className="space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
                      <p>
                        Based at{" "}
                        <span className="bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text font-semibold text-transparent">
                          East China Normal University
                        </span>
                        , the{" "}
                        <span className="bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text font-semibold text-transparent">
                          Visual Perception + X (VPX) Group
                        </span>{" "}
                        takes visual perception as its foundation and connects it
                        with other disciplines to advance{" "}
                        <span className="bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text font-semibold text-transparent">
                          human-centered AGI
                        </span>.
                      </p>

                      <p>
                        We study how intelligent systems perceive and model dynamic
                        environments, generate controllable content, and act in the
                        physical world. Our work connects four research directions:
                      </p>

                      <ul className="space-y-2.5 border-l border-border/70 pl-5">
                        {researchTracks.map((track) => (
                          <li key={track.name}>
                            <span className="font-semibold text-foreground">
                              {track.name}
                            </span>{" "}
                            — {track.shortDescription}
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
                      <h2 className="text-2xl font-bold">VPX Mission</h2>
                    </div>
                    <p className="text-muted-foreground">
                      To pursue original, rigorous research toward human-centered AGI that benefits people and society, while helping members develop independent research judgment in a supportive lab culture.
                    </p>
                  </div>

                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <GraduationCap className="h-6 w-6 text-violet-600" />
                      <h2 className="text-2xl font-bold">How We Work</h2>
                    </div>
                    <ul className="list-disc space-y-2 pl-6 text-base text-muted-foreground md:text-lg">
                      <li><span className="font-semibold">Ask original questions and examine underlying mechanisms.</span></li>
                      <li><span className="font-semibold">Design rigorous experiments and evaluate claims against evidence.</span></li>
                      <li><span className="font-semibold">Turn promising ideas into complete, reproducible research.</span></li>
                      <li><span className="font-semibold">Communicate clearly and welcome constructive critique.</span></li>
                      <li><span className="font-semibold">Build a healthy, inclusive, and sustainable lab culture.</span></li>
                    </ul>
                  </div>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    "/vpx-assets/about/about_1.png",
                    "/vpx-assets/about/about_2.png",
                    "/vpx-assets/about/about_3.png",
                    "/vpx-assets/about/about_4.png",
                  ].map((src) => (
                    <div
                      key={src}
                      className="rounded-xl border border-border/60 bg-background/92 p-2 shadow-sm"
                    >
                      <img
                        src={src}
                        alt=""
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
                  These principles guide how we select, mentor, and grow our members.
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
                      <h3 className="text-lg font-semibold leading-snug">{value.title}</h3>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{value.description}</p>
                  </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="grid gap-8 md:gap-10">
            <div className="mx-auto w-full max-w-screen-xl">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Research Tracks
              </h2>
              <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-border/70 to-transparent" />

              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {researchTracks.map((area) => (
                  <Card
                    key={area.name}
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
        </div>
      </div>
    </div>
  );
};

export default About;
