import { labLifeData } from "@/data/labLife";
import { Award, BookOpen, GraduationCap, Heart, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  return (
    <div className="relative w-full overflow-hidden bg-background text-foreground">
       <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
    {/* 主光晕：紫（品牌主色） */}
  <div
    className="absolute -top-44 left-1/2 h-[660px] w-[660px] -translate-x-1/2 rounded-full
               bg-violet-500/70 blur-[150px] mix-blend-screen opacity-40"
  />

  {/* 侧光：青（科技感） */}
  <div
    className="absolute top-56 -left-60 h-[760px] w-[760px] rounded-full
               bg-cyan-400/30 blur-[160px] mix-blend-screen opacity-18"
  />

  {/* 托底：靛（深度与稳定） */}
  <div
    className="absolute bottom-[-260px] right-[-260px] h-[820px] w-[820px] rounded-full
               bg-indigo-500/80 blur-[190px] mix-blend-screen opacity-26"
  />

  {/* ✨ 新增：暖色高光（玫红/洋红）——让页面不冷 */}
  <div
    className="absolute top-24 right-[-220px] h-[620px] w-[620px] rounded-full
               bg-fuchsia-400/80 blur-[170px] mix-blend-screen opacity-20"
  />

  {/* ✨ 新增：祖母绿对冲（学术但更丰富） */}
  <div
    className="absolute bottom-24 -left-64 h-[640px] w-[640px] rounded-full
               bg-emerald-400/70 blur-[180px] mix-blend-screen opacity-16"
  />

  {/* ✨ 新增：琥珀“暖点”（非常淡，提气色） */}
  <div
    className="absolute -top-10 left-24 h-[420px] w-[420px] rounded-full
               bg-amber-300/60 blur-[160px] mix-blend-screen opacity-10"
  />

  {/* 氛围层：轻微冷色渐变（别压太狠） */}
  <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/45 to-background/85" />


    {/* 整体压暗渐变：保证文字对比度（非常重要） */}
    {/* <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" /> */}

  </div>

      {/* 页面容器：统一版心与节奏 */}
      <div className="relative z-10 container px-4 md:px-6 py-10 md:py-14">
        <div className="space-y-16 md:space-y-20">

          {/* About Hero（不改内容，只更好看） */}
          <section className="relative">
            <div className="mx-auto max-w-screen-xl">
              {/* 标题更有层次 */}
              <div className="mb-8 md:mb-10">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  About VPX Group
                </h1>
                <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-border/70 to-transparent" />
              </div>

              <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-10">
                {/* Left: Text */}
                <div className="lg:w-[62%]">
                  <div className="rounded-2xl border border-border/60 bg-background/40 backdrop-blur-md p-6 md:p-8 shadow-[0_22px_70px_-48px_rgba(0,0,0,0.55)]">
                    
                    <p className="mb-6 text-base leading-relaxed text-muted-foreground md:text-lg">
                      The{" "}
                      <span className="font-semibold bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
                        Visual Perception + X (VPX) Group
                      </span>{" "}
                      is a research group led by{" "}
                      <span className="font-semibold bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
                        Prof. Yang Li
                      </span>{" "}
                      within the{" "}
                      <span className="font-semibold bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
                        School of Computer Science and Technology
                      </span>{" "}
                      at{" "}
                      <span className="font-semibold bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
                        East China Normal University (ECNU)
                      </span>
                      .
                    </p>

                    <p className="mb-6 text-base leading-relaxed text-muted-foreground md:text-lg">
                      Our mission is to advance{" "}
                      <span className="font-semibold bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
                        visual perception for cross-disciplinary research
                      </span>
                      , focusing on extracting{" "}
                      <span className="font-semibold bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
                        meaningful information
                      </span>{" "}
                      and{" "}
                      <span className="font-semibold bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
                        structured data
                      </span>{" "}
                      from videos and raw streaming sources.
                    </p>

                    <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                      Currently, VPX focuses on{" "}
                      <span className="font-semibold bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
                        video analysis
                      </span>
                      ,{" "}
                      <span className="font-semibold bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
                        controllable image and video generation
                      </span>
                      , and{" "}
                      <span className="font-semibold bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
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
                        className="font-medium bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text text-transparent hover:opacity-85 transition-opacity"
                      >
                        Bilibili
                      </a>{" "}
                      and{" "}
                      <a
                        href="https://github.com/vpx-ecnu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium bg-gradient-to-r from-violet-500 via-cyan-400 to-sky-400 bg-clip-text text-transparent hover:opacity-85 transition-opacity"
                      >
                        GitHub
                      </a>
                      .
                    </p>

                  </div>
                </div>

                {/* Right: Image */}
                <div className="w-full lg:w-[38%]">
                  {/* 图片外包一层，统一边框/阴影/高级感 */}
                  <div className="rounded-2xl border border-border/60 bg-background/30 p-2 shadow-[0_22px_70px_-48px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-3">
                    <img
                      src="/vpx-assets/about/about_about_vpx.jpg"
                      alt="About VPX Group"
                      className="w-full h-auto rounded-xl shadow-sm object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Lab Life：保持内容，提升“信息墙”质感 */}
          <section className="rounded-2xl border border-border/60 bg-background/35 backdrop-blur-md shadow-[0_22px_70px_-52px_rgba(0,0,0,0.55)] overflow-hidden">
            <div className="px-4 py-6 sm:px-6 sm:py-7 md:px-8 md:py-9">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Lab Life
                  </h2>
                  <p className="text-muted-foreground md:text-lg">
                    Moments from our daily research, demos, meetings, and events.
                  </p>
                </div>
              </div>

              {/* 可滚动窗口（更像画廊 + 轻提示） */}
              <div className="relative rounded-xl border border-border/60 bg-black/20">
                <div className="h-[420px] overflow-y-auto pr-2 sm:h-[520px] md:h-[640px]">
                  <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3">
                    {labLifeData.map((item) => {
                      const Wrapper: any = item.link ? "a" : "div";
                      return (
                        <Wrapper
                          key={item.id}
                          {...(item.link
                            ? { href: item.link, target: "_blank", rel: "noreferrer" }
                            : {})}
                          className="group block overflow-hidden bg-transparent transition"
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                            <img
                              src={item.image}
                              alt={item.title || "Lab life"}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                            {/* 轻遮罩：hover 更“酷但不吵” */}
                            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                            </div>
                          </div>
                        </Wrapper>
                      );
                    })}
                  </div>
                </div>

                {/* 底部淡出提示：更像 feed */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent rounded-b-xl" />
              </div>
            </div>
          </section>

          {/* Mission & Vision：更统一的“左文右图”模块 */}
          <section className="rounded-2xl border border-border/60 bg-background/35 backdrop-blur-md shadow-[0_22px_70px_-52px_rgba(0,0,0,0.55)] overflow-hidden">
            <div className="px-4 py-7 sm:px-6 md:px-8 md:py-10">
              <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
                {/* 左边文字 */}
                <div className="flex-1 space-y-12">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="h-6 w-6 text-violet-600" />
                      <h2 className="text-2xl font-bold">VPX Mission</h2>
                    </div>
                    <p className="text-muted-foreground">
                      To cultivate rigorous, responsible researchers who combine academic ambition with strong execution, professionalism, and continuous improvement.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
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

                {/* 右边四张图：统一圆角/边框/hover */}
                <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    "/vpx-assets/about/about_1.png",
                    "/vpx-assets/about/about_2.png",
                    "/vpx-assets/about/about_3.png",
                    "/vpx-assets/about/about_4.png",
                  ].map((src, idx) => (
                    <div
                      key={src}
                      className="rounded-xl border border-border/60 bg-background/30 p-2 shadow-sm"
                    >
                      <img
                        src={src}
                        alt={`img${idx + 1}`}
                        className="w-full h-auto rounded-lg object-cover transition-transform duration-300 hover:scale-[1.02]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Core Values：卡片统一、图标更学术克制 */}
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
                    className="rounded-2xl border border-border/60 bg-background/35 p-5 shadow-sm transition-shadow hover:shadow-md backdrop-blur-md"
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

          {/* Research Focus Areas：保持内容，统一卡片风格 */}
          <section className="grid gap-8 md:gap-10">
            <div className="mx-auto max-w-screen-xl w-full">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
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
                    className="border-border/60 bg-background/35 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow"
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
