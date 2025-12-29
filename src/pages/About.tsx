import { labLifeData } from "@/data/labLife";
import { Award, BookOpen, GraduationCap, Heart, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  return (
<div className="relative container py-12 px-4 md:px-6 space-y-12">
  {/* 柔和光晕（不影响内容） */}
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
    <div className="absolute top-40 -left-24 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-3xl" />
    <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-indigo-500/15 blur-3xl" />
  </div>
      {/* Hero Section */}
      <section className="py-6 md:py-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
  <div className="container max-w-screen-xl mx-auto">

    <h1 className="text-4xl font-bold mb-8">
      About VPX-Lab
    </h1>

    <div className="flex flex-col lg:flex-row gap-10 items-start">

      {/* Left: Text (70%) */}
      <div className="lg:w-[70%]">
        <p className="text-lg mb-6 leading-relaxed text-muted-foreground">
          The{" "}
          <span className="font-semibold text-violet-700">
            Visual Perception + X (VPX) Lab
          </span>{" "}
          is a research group led by{" "}
          <span className="font-semibold text-black">
            Prof. Yang Li
          </span>{" "}
          within the{" "}
          <span className="font-semibold text-black">
            School of Computer Science and Technology
          </span>{" "}
          at{" "}
          <span className="font-semibold text-black">
            East China Normal University (ECNU)
          </span>
          .
        </p>

        <p className="text-lg mb-6 leading-relaxed text-muted-foreground">
          Founded over{" "}
          <span className="font-semibold text-black">five years</span>{" "}
          ago, VPX Lab has grown into a vibrant research group with more than{" "}
          <span className="font-semibold text-violet-700">30 members</span>{" "}
          and over{" "}
          <span className="font-semibold text-violet-700">20 publications</span>{" "}
          in leading conferences and journals.
        </p>

        <p className="text-lg mb-6 leading-relaxed text-muted-foreground">
          Our mission is to advance visual perception for cross-disciplinary
          research, focusing on extracting meaningful information and structured
          data from videos and raw streaming sources.
        </p>

        <p className="text-lg leading-relaxed text-muted-foreground">
          Currently, VPX focuses on video analysis, controllable image and video
          generation, and non-rigid object manipulation in robotics, enabling
          applications in the metaverse, AIGC, and embodied intelligence.
        </p>

        <p className="text-lg mt-6">
          For more information, please visit our{" "}
          <a
            href="https://space.bilibili.com/487404760"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-violet-700 underline hover:opacity-80"
          >
            Bilibili
          </a>{" "}
          and{" "}
          <a
            href="https://github.com/vpx-ecnu"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-violet-700 underline hover:opacity-80"
          >
            GitHub
          </a>
          .
        </p>
      </div>

      {/* Right: Image (30%) */}
      <div className="lg:w-[40%] w-full">
        <img
          src="/lovable-uploads/about/about_about_vpx.jpg"
          alt="About VPX"
          className="w-full h-auto rounded-lg shadow"
        />
      </div>

    </div>
  </div>
</section>

{/* Lab Life */}
<section className="pt-6 pb-10 md:pt-8 md:pb-14 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md">
  <div className="container max-w-screen-xl mx-auto px-4 md:px-6">
    <div className="flex items-end justify-between gap-6 mb-6">
      <div className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
          Lab Life
        </h2>
        <p className="text-muted-foreground md:text-lg">
          Moments from our daily research, demos, meetings, and events.
        </p>
      </div>

      {/* 可选按钮（你需要就打开） */}
      {/* <Button asChild variant="outline">
        <Link to="/lab-life">View All</Link>
      </Button> */}
    </div>

    {/* 可滚动窗口 */}
    <div className="h-[520px] md:h-[640px] overflow-y-auto pr-2 rounded-xl border border-white/10 bg-black/20">
      {/* 图片墙 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
        {labLifeData.map((item) => {
          const Wrapper: any = item.link ? "a" : "div";
          return (
            <Wrapper
              key={item.id}
              {...(item.link
                ? {
                    href: item.link,
                    target: "_blank",
                    rel: "noreferrer",
                  }
                : {})}
              className="group block overflow-hidden bg-card border hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                  src={item.image}
                  alt={item.title || "Lab life"}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />

                {/* 悬浮信息层 */}
                {/* <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-black/35" />
                  <div className="absolute left-4 right-4 bottom-4 text-white">
                    {item.title ? (
                      <div className="font-semibold leading-snug">
                        {item.title}
                      </div>
                    ) : null}
                    {item.date ? (
                      <div className="mt-1 text-xs text-white/90">
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                    ) : null}
                  </div>
                </div> */}
              </div>
            </Wrapper>
          );
        })}
      </div>
    </div>
  </div>
</section>

      {/* Mission & Vision */}
      <section className="container py-12 px-4 md:px-6 space-y-12">
  <div className="container max-w-screen-xl mx-auto">
    <div className="flex flex-col lg:flex-row gap-12 items-start">
      
      {/* 左边：文字内容 */}
      <div className="flex-1 space-y-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">VPX Mission</h2>
          </div>
          <p className="text-muted-foreground">
            To cultivate outstanding ECNUers who can take full responsibility – mastering the art of continuous improvement in all endeavors!
          </p>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">VPX Practical Methods</h2>
          </div>
          <ul className="list-disc pl-6 space-y-2 text-lg text-muted-foreground">
            <li><span className="font-semibold">Making our future better through VPX!</span></li>
            <li><span className="font-semibold">Be efficient!</span></li>
            <li><span className="font-semibold">Be professional!</span></li>
            <li><span className="font-semibold">Be logical!</span></li>
            <li><span className="font-semibold">Be happy with our life!</span></li>
            <li><span className="font-semibold">Finishing is the first priority!</span></li>
            <li><span className="font-semibold">Think as a reviewer</span></li>
          </ul>
        </div>
      </div>

      {/* 右边：四张图 */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        <img src="/lovable-uploads/about/about_1.png" alt="img1" className="w-full h-auto rounded-lg shadow" />
        <img src="/lovable-uploads/about/about_2.png" alt="img2" className="w-full h-auto rounded-lg shadow" />
        <img src="/lovable-uploads/about/about_3.png" alt="img3" className="w-full h-auto rounded-lg shadow" />
        <img src="/lovable-uploads/about/about_4.png" alt="img4" className="w-full h-auto rounded-lg shadow" />
      </div>

    </div>
  </div>
</section>


      {/* Core Values */}
      <section className="py-16 px-6 bg-secondary/30">
        <div className="container">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="h-8 w-8" />,
                title: "Academic Excellence",
                description: "We uphold the highest standards of scholarly rigor and intellectual integrity in all our research endeavors.",
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "Innovation",
                description: "We embrace creative approaches and novel methodologies to address complex research questions.",
              },
              {
                icon: <Heart className="h-8 w-8" />,
                title: "Inclusivity",
                description: "We foster a diverse and inclusive environment where all perspectives are valued and respected.",
              },
            ].map((value, index) => (
              <div key={index} className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="mb-4 p-2 rounded-full bg-violet-500/15 text-violet-200 inline-block">{value.icon}</div>
                <h3 className="text-xl font-medium mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="grid gap-8 md:gap-12">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">Research Focus Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            // {
            //   title: "Artificial Intelligence",
            //   description: "Developing advanced AI techniques and exploring their applications across domains."
            // },
            // {
            //   title: "Data Science",
            //   description: "Extracting meaningful insights from complex datasets to address scientific and societal challenges."
            // },
            // {
            //   title: "Complex Systems",
            //   description: "Understanding emergent behaviors in interconnected systems across multiple scales."
            // },
            // {
            //   title: "Computational Biology",
            //   description: "Applying computational methods to understand biological processes and advance healthcare."
            // },
            // {
            //   title: "Sustainable Technologies",
            //   description: "Researching solutions that address environmental challenges and promote sustainability."
            // },
            // {
            //   title: "Human-Computer Interaction",
            //   description: "Designing intuitive interfaces and studying the relationship between humans and technology."
            // }
            {
              title: "Embodied Intelligence",
              description: "Integrating perception, reasoning, and action to enable intelligent agents that interact with the physical world."
            },
            {
              title: "AI-Generated Content (AIGC)",
              description: "Pioneering generative AI models for text, image, and video creation across multimodal creative applications."
            },
            {
              title: "3D Rendering & Graphics",
              description: "Advancing real-time neural rendering, Gaussian splatting, and immersive 3D experiences for next-generation visual computing."
            },
            {
              title: "Video Understanding",
              description: "Developing models for temporal segmentation, object tracking, and multimodal video analysis to unlock insights from dynamic visual data."
            }
          ].map((area, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{area.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{area.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* History Timeline */}
      {/* <section className="py-16 px-6">
        <div className="container">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Journey</h2>
          <div className="space-y-12 max-w-3xl mx-auto">
            {[
              {
                year: "2020.10",
                title: "VPX-Lab Established",
                description: "Established with a focus on interdisciplinary research across digital humanities and data science.",
              },
              {
                year: "2021.11",
                title: "Receive First Corporate Funds",
                description: "xxxxx.",
              },
              {
                year: "2022.01",
                title: "Receive First State Funds",
                description: "xxxxx.",
              },
              {
                year: "2023.02",
                title: "First Paper Accepted",
                description: "The paper was accepted by ICCASP2023.",
              },
              {
                year: "2023.03",
                title: "Laboratory 814 Opened for Use",
                description: "xxxxx.",
              },
              {
                year: "2023.06",
                title: "First Graduate Student to Graduate",
                description: "xxxxx.",
              },
              {
                year: "2024.04",
                title: "Successfully Published the First CCF Class A Paper",
                description: "xxxxx.",
              },
              {
                year: "2024.04",
                title: "Successfully Published the First CCF Class A Paper",
                description: "This paper was accepted by the conference IJCAI 2024.",
              },
              {
                year: "2024.05",
                title: "5 Research Teams Established",
                description: "xxxxxx.",
              },
            ].map((milestone, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  {index < 8 && <div className="w-0.5 h-full bg-border mt-2"></div>}
                </div>
                <div className="flex-1 pb-4">
                  <div className="text-sm font-bold text-muted-foreground mb-1">{milestone.year}</div>
                  <h3 className="text-lg font-medium mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default About;
