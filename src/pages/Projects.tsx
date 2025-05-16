
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

// const markdownFilePath = '/content/completed-projects.json';

const Projects = () => {
  const [completedProjects, setCompletedProjects] = useState([]);

  useEffect(() => {
    fetch("/content/completed-projects.json")
      .then((res) => res.json())
      .then((data) => setCompletedProjects(data));
  }, []);

// const Projects = () => {
  return (
    <div className="container py-12 px-4 md:px-6 page-transition">
      {/* Hero Section */}
      <section className="py-16 px-6 bg-secondary/30">
        <div className="container">
          <h1 className="text-4xl font-bold mb-6">Research Projects</h1>
          <p className="text-lg max-w-3xl">
            Explore our diverse portfolio of ongoing and completed research initiatives spanning multiple disciplines and methodologies.
          </p>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 px-6">
        <div className="container">
          <Tabs defaultValue="ongoing" className="mb-12">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="ongoing">Ongoing Projects</TabsTrigger>
              <TabsTrigger value="completed">Completed Projects</TabsTrigger>
            </TabsList>
            <TabsContent value="ongoing" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Project Cards - Ongoing */}
                {[
                  {
                    title: "Embodied Intelligence",
                    description: "Integrating perception, reasoning, and action to enable intelligent agents that interact with the physical world.",
                    lead: "Libing Yang",
                    progress: 75,
                    tags: ["AI/ML", "RL", "LLM-for-VLA"],
                    timeframe: "2023-2026",
                    status: "Active",
                  },
                  {
                    title: "AI-Generated Content (AIGC)",
                    description: "Pioneering generative AI models for text, image, and video creation across multimodal creative applications.",
                    lead: "Changgu Chen",
                    progress: 75,
                    tags: ["Diffusion", "Video Generation", "Digital Human","Image Editing"],
                    timeframe: "2023-2026",
                    status: "Active",
                  },
                  {
                    title: "3D Rendering & Graphics",
                    description: "Advancing real-time neural rendering, Gaussian splatting, and immersive 3D experiences for next-generation visual computing.",
                    lead: "Wenjie Liu",
                    progress: 75,
                    tags: ["3DGS", "Style Transfer", "Rendering"],
                    timeframe: "2023-2026",
                    status: "Active",
                  },
                  {
                    title: "Video Understanding",
                    description: "Developing models for temporal segmentation, object tracking, and multimodal video analysis to unlock insights from dynamic visual data.",
                    lead: "Ling You",
                    progress: 75,
                    tags: ["MLLM", "Tracking", "Video Analysis"],
                    timeframe: "2023-2026",
                    status: "Active",
                  },
                ].map((project, index) => (
                  <Card key={index} className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{project.title}</CardTitle>
                        <Badge variant={project.status === "Active" ? "default" : "secondary"}>
                          {project.status}
                        </Badge>
                      </div>
                      <CardDescription>{project.timeframe}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} />
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-medium">Lead Researcher:</p>
                        <p className="text-sm text-muted-foreground">{project.lead}</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, i) => (
                          <Badge key={i} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            {/* <TabsContent value="completed" className="mt-6">
            <div className="prose max-w-none dark:prose-invert">
              <ReactMarkdown>{completedMarkdown}</ReactMarkdown>
            </div>
          </TabsContent> */}
          <TabsContent value="completed" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedProjects.map((project, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{project.title}</CardTitle>
                      <Badge variant="secondary">{project.status}</Badge>
                    </div>
                    <CardDescription>{project.timeframe}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                    <div>
                      <p className="text-sm font-medium">Lead Researcher:</p>
                      <p className="text-sm text-muted-foreground">{project.lead}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, i) => (
                        <Badge key={i} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Projects;
