import { Award, BookOpen, GraduationCap, Heart, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  return (
<div className="container py-12 px-4 md:px-6 space-y-12">
      {/* Hero Section */}
      {/* <section className="py-16 px-6 bg-secondary/30">
        <div className="container">
          <h1 className="text-4xl font-bold mb-6">About VPX-Lab</h1>
          <div className="max-w-3xl">
            <p className="text-lg mb-6">
            Welcome to our "Visual Perception + X" (VPX) group. X means anything that attracts your eyes or anything that needs perception.
            We are aiming at applying computer vision technologies to other fields.
            </p>
            <p className="text-lg">
              In general, our research area includes:
            </p>
            <ul className="text-lg list-disc pl-6 space-y-1">
              <li>Computer Vision</li>
              <li>Machine Learning</li>
              <li>Computer Graphics (Neural Rendering)</li>
              <li>Robotics (Visual Perception)</li>
              <li>X</li>
            </ul>

          </div>
        </div>
      </section> */}
      <section className="py-16 px-1 bg-secondary/30">
        <div className="container max-w-screen-2xl max-w-screen-xl mx-auto flex flex-col lg:flex-row items-center gap-8">
          {/* Text Content */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-6">About VPX-Lab</h1>
            {/* <p className="text-lg mb-6">
              Welcome to our "Visual Perception + X" (VPX) group. X means anything that attracts your eyes or anything that needs perception.
              We are aiming at applying computer vision technologies to other fields.
            </p> */}
            <p className="text-lg mb-6">
  Welcome to our "Visual Perception + X" (VPX) group. X means anything that attracts your eyes or anything that needs perception.
  We are aiming at applying computer vision technologies to other fields.
  <br />
  <span className="mt-2 inline-block">
    For more information, check out our{" "}
    <a
      href="https://space.bilibili.com/487404760?spm_id_from=333.337.0.0"
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline hover:opacity-80"
    >
      Bilibili
    </a>{" "}
    and{" "}
    <a
      href="https://github.com/vpx-ecnu"
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline hover:opacity-80"
    >
      GitHub
    </a>
    .
  </span>
</p>
            <p className="text-lg mb-4">In general, our research area includes:</p>
            <ul className="text-lg list-disc pl-6 space-y-1">
              <li>Computer Vision</li>
              <li>Machine Learning</li>
              <li>Computer Graphics (Neural Rendering)</li>
              <li>Robotics (Visual Perception)</li>
              <li>X</li>
            </ul>
          </div>

          {/* Image */}
          <div className="flex-1">
            <img
              src="/lovable-uploads/vpx_things.jpg" // 替换为实际路径
              alt="About VPX"
              className="w-full h-auto rounded-lg shadow"
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6">
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
        <img src="/lovable-uploads/about_1.png" alt="img1" className="w-full h-auto rounded-lg shadow" />
        <img src="/lovable-uploads/about_2.png" alt="img2" className="w-full h-auto rounded-lg shadow" />
        <img src="/lovable-uploads/about_3.png" alt="img3" className="w-full h-auto rounded-lg shadow" />
        <img src="/lovable-uploads/about_4.png" alt="img4" className="w-full h-auto rounded-lg shadow" />
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
                <div className="mb-4 p-2 rounded-full bg-primary/10 inline-block">{value.icon}</div>
                <h3 className="text-xl font-medium mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="grid gap-8 md:gap-12">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">Research Focus Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <section className="py-16 px-6">
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
      </section>
    </div>
  );
};

export default About;
