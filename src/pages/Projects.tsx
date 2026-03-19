import React, { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useLocation, useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProjectVideo =
  | {
      type: "bilibili" | "youtube" | "web";
      embedUrl: string; // 建议直接存可用 iframe 的 URL
    }
  | undefined;

type Project = {
  title: string;
  status: string;
  timeframe?: string;
  lead?: string;
  description?: string; // 卡片摘要
  details?: string; // 详情页正文（Markdown）
  tags?: string[];

  // 图片：thumbnail 用于卡片；images 用于详情页右侧栏
  thumbnail?: string;
  images?: string[];

  // 也兼容你旧字段（如果你之前是 image 单张）
  image?: string;

  // 视频（可选）
  video?: ProjectVideo;

  // completed 项目可能有 link
  link?: string;
};

type ProjectPublication = {
  id: string;
  title: string;
  venue: string;
  url: string;
  image: string;
  mediaType?: "image" | "video";
  media?: string;
  poster?: string;
};

const getThumbnail = (p: Project) => {
  // 优先 thumbnail；否则 images[0]；否则旧的 image
  return p.thumbnail || p.images?.[0] || p.image || "";
};

const slugifyProjectTitle = (title: string) =>
  title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const Projects = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [ongoingProjects, setOngoingProjects] = useState<Project[]>([]);
  const [projectPublications, setProjectPublications] = useState<ProjectPublication[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetch("/content/completed-projects.json")
      .then((res) => res.json())
      .then((data) => setCompletedProjects(data))
      .catch(() => setCompletedProjects([]));

    fetch("/content/ongoing-projects.json")
      .then((res) => res.json())
      .then((data) => setOngoingProjects(data))
      .catch(() => setOngoingProjects([]));

    fetch("/publications/project_publications.json")
      .then((res) => res.json())
      .then((data) => {
        const pubs = Array.isArray(data?.publications) ? data.publications : [];
        setProjectPublications(pubs);
      })
      .catch(() => setProjectPublications([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedProject = params.get("project");
    if (!requestedProject) return;

    const allProjects = [...ongoingProjects, ...completedProjects];
    const match = allProjects.find(
      (project) => slugifyProjectTitle(project.title) === requestedProject
    );

    if (match) {
      setSelectedProject(match);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.search, ongoingProjects, completedProjects]);

  const selectedImages = useMemo(() => {
    if (!selectedProject) return [];
    // 兼容：images 数组优先，否则用单张 image
    return selectedProject.images?.length
      ? selectedProject.images
      : selectedProject.image
      ? [selectedProject.image]
      : [];
  }, [selectedProject]);

  return (
    <div className="relative w-full overflow-hidden bg-background text-foreground">
  {/* 柔和光晕（不影响内容） */}
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
    <div className="absolute top-40 -left-24 h-[320px] w-[320px] rounded-full bg-cyan-500/15 blur-3xl" />
    <div className="absolute -top-40 right-24 h-[320px] w-[320px] rounded-full bg-emerald-400/15 blur-2xl" />
    <div className="absolute bottom-80 left-50 h-[320px] w-[320px] rounded-full bg-cyan-500/15 blur-3xl" />
    <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-indigo-500/15 blur-3xl" />
  </div>
    <div className="container py-12 px-4 md:px-6">
      {/* Hero */}
      <section className="py-12 md:py-14 px-0 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Research Projects</h1>
          <p className="text-lg max-w-3xl text-muted-foreground">
            Explore our ongoing and completed research initiatives spanning
            multiple disciplines and methodologies.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 md:py-12">
        <div className="container px-4 md:px-6">
          {selectedProject ? (
            <div className="animate-fade-in">
              <button
                className="mb-6 px-4 py-2 border bg-card hover:bg-muted/40 transition"
                onClick={() => {
                  setSelectedProject(null);
                  navigate("/projects", { replace: true });
                }}
              >
                ← Back to Projects
              </button>

              {/* Title + meta */}
              <div className="mb-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <h2 className="text-3xl font-bold">{selectedProject.title}</h2>
                  {selectedProject.status && (
                    <Badge
                      variant={
                        selectedProject.status === "Active" ? "default" : "secondary"
                      }
                    >
                      {selectedProject.status}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  {selectedProject.timeframe ? selectedProject.timeframe : null}
                  {selectedProject.timeframe && selectedProject.lead ? " • " : null}
                  {selectedProject.lead ? `Lead: ${selectedProject.lead}` : null}
                </p>
              </div>

              {/* 详情页：左文右图 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: content */}
                <div className="lg:col-span-2">
                  {/* 正文（Markdown） */}
                  <div className="prose dark:prose-invert max-w-none prose-headings:mt-6 prose-headings:mb-2">
                      {/* <ReactMarkdown>
                        {selectedProject.details || selectedProject.description || ""}
                      </ReactMarkdown> */}
                      <ReactMarkdown
    components={{
      h2: ({ node, ...props }) => (
        <h2 className="mt-8 mb-3 text-2xl font-bold" {...props} />
      ),
      h3: ({ node, ...props }) => (
        <h3 className="mt-6 mb-2 text-xl font-semibold" {...props} />
      ),
      p: ({ node, ...props }) => (
        <p className="mb-4 text-base leading-relaxed text-muted-foreground" {...props} />
      ),
      ul: ({ node, ...props }) => (
        <ul className="mb-4 list-disc pl-6 space-y-2" {...props} />
      ),
      li: ({ node, ...props }) => <li className="text-muted-foreground" {...props} />,
    }}
  >
    {selectedProject.details || selectedProject.description || ""}
  </ReactMarkdown>
                  </div>

                  {/* 视频（可选） */}
                  {selectedProject.video?.embedUrl ? (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-3">Demo Video</h3>

                      {/* iframe 容器：16:9 */}
                      <div className="relative w-full overflow-hidden border bg-card">
                        <div className="aspect-video">
                          <iframe
                            src={selectedProject.video.embedUrl}
                            className="h-full w-full"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            title={`${selectedProject.title} video`}
                          />
                        </div>
                      </div>

                      {/* 小提示（可删） */}
                      {selectedProject.video.type === "bilibili" ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          If the video does not display, please check your site CSP settings
                          (iframe permissions) and ensure the embed URL uses player.bilibili.com.
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Tags */}
                  {selectedProject.tags?.length ? (
                    <div className="mt-8">
                      {/* <h4 className="font-medium text-sm mb-2">Tags</h4> */}
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tags.map((tag, i) => (
                          <Badge key={i} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Right: image column */}
                {selectedImages.length > 0 && (
                  <aside className="lg:col-span-1 space-y-6">
                    {selectedImages.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt={`${selectedProject.title} image ${idx + 1}`}
                        className="w-full rounded-xl object-cover"
                        loading="lazy"
                      />
                    ))}
                  </aside>
                )}
              </div>
            </div>
          ) : (
              <Tabs defaultValue="ongoing" className="mb-12">
              <TabsList className="grid h-auto w-full max-w-2xl grid-cols-1 gap-2 bg-transparent p-0 sm:grid-cols-3">
                <TabsTrigger
                  value="ongoing"
                  className="min-h-10 whitespace-normal border bg-muted/60 px-3 py-2 text-center leading-snug data-[state=active]:border-border data-[state=active]:bg-background"
                >
                  Ongoing Projects
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="min-h-10 whitespace-normal border bg-muted/60 px-3 py-2 text-center leading-snug data-[state=active]:border-border data-[state=active]:bg-background"
                >
                  Completed Projects
                </TabsTrigger>
                <TabsTrigger
                  value="publications"
                  className="min-h-10 whitespace-normal border bg-muted/60 px-3 py-2 text-center leading-snug data-[state=active]:border-border data-[state=active]:bg-background"
                >
                  Publications
                </TabsTrigger>
              </TabsList>

              {/* Ongoing */}
              <TabsContent value="ongoing" className="mt-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {ongoingProjects.map((project, index) => {
                    const thumb = getThumbnail(project);
                    return (
                      <Card
                        key={index}
                        className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedProject(project)}
                      >
                        {/* 缩略图 */}
                        {thumb ? (
                          <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                            <img
                              src={thumb}
                              alt={project.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                            {/* status badge */}
                            {project.status ? (
                              <div className="absolute top-3 left-3">
                                <Badge
                                  variant={
                                    project.status === "Active"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="border border-white/10"
                                >
                                  {project.status}
                                </Badge>
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        <CardHeader>
                          <CardTitle className="text-lg leading-snug">
                            {project.title}
                          </CardTitle>
                          {project.timeframe ? (
                            <CardDescription>{project.timeframe}</CardDescription>
                          ) : null}
                        </CardHeader>

                        <CardContent>
                          {project.description ? (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {project.description}
                            </p>
                          ) : null}

                          {project.lead ? (
                            <div className="mt-4">
                              <p className="text-sm font-medium">Lead Researcher</p>
                              <p className="text-sm text-muted-foreground">
                                {project.lead}
                              </p>
                            </div>
                          ) : null}
                        </CardContent>

                        {project.tags?.length ? (
                          <CardFooter>
                            <div className="flex flex-wrap gap-2">
                              {project.tags.map((tag, i) => (
                                <Badge key={i} variant="outline">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardFooter>
                        ) : null}
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Completed */}
              <TabsContent value="completed" className="mt-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {completedProjects.map((project, index) => {
                    const thumb = getThumbnail(project);
                    return (
                      <Card
                        key={index}
                        className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedProject(project)}
                      >
                        {/* 缩略图 */}
                        {thumb ? (
                          <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                            <img
                              src={thumb}
                              alt={project.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                            {project.status ? (
                              <div className="absolute top-3 left-3">
                                <Badge variant="secondary" className="border border-white/10">
                                  {project.status}
                                </Badge>
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        <CardHeader>
                          <CardTitle className="text-lg leading-snug">
                            {project.title}
                          </CardTitle>
                          {project.timeframe ? (
                            <CardDescription>{project.timeframe}</CardDescription>
                          ) : null}
                        </CardHeader>

                        <CardContent>
                          {project.description ? (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {project.description}
                            </p>
                          ) : null}

                          {project.link ? (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-3 text-sm text-violet-600 hover:underline"
                              onClick={(e) => e.stopPropagation()} // 避免点链接触发选中
                            >
                              View Project →
                            </a>
                          ) : null}

                          {project.lead ? (
                            <div className="mt-4">
                              <p className="text-sm font-medium">Lead Researcher</p>
                              <p className="text-sm text-muted-foreground">
                                {project.lead}
                              </p>
                            </div>
                          ) : null}
                        </CardContent>

                        {project.tags?.length ? (
                          <CardFooter>
                            <div className="flex flex-wrap gap-2">
                              {project.tags.map((tag, i) => (
                                <Badge key={i} variant="outline">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardFooter>
                        ) : null}
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Publications */}
              <TabsContent value="publications" className="mt-6">
                {projectPublications.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No project-publication cards available.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {projectPublications.map((pub) => (
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
                              src={pub.media || pub.image || "/placeholder.svg"}
                              alt={pub.title}
                              className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                              loading="lazy"
                            />
                          )}
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 text-xs font-medium bg-black/70 text-white backdrop-blur-sm border border-white/10">
                              {pub.venue || "Unknown Venue"}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-base md:text-lg font-semibold leading-snug group-hover:underline">
                            {pub.title}
                          </h3>
                          <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-violet-600">
                            View on web →
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
      </div>
    </div>
  );
};

export default Projects;
