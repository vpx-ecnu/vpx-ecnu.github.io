
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

// const markdownFilePath = '/content/completed-projects.json';

const Projects = () => {
  const [completedProjects, setCompletedProjects] = useState([]);
  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetch("/content/completed-projects.json")
      .then((res) => res.json())
      .then((data) => setCompletedProjects(data));

     fetch("/content/ongoing-projects.json")
    .then((res) => res.json())
    .then((data) => setOngoingProjects(data));
  }, []);

  // return
    return (
    <div className="container py-12 px-4 md:px-6 page-transition">
      <section className="py-16 px-6 bg-secondary/30">
        <div className="container">
          <h1 className="text-4xl font-bold mb-6">Research Projects</h1>
          <p className="text-lg max-w-3xl">
            Explore our diverse portfolio of ongoing and completed research
            initiatives spanning multiple disciplines and methodologies.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="container">
          {selectedProject ? (
            <div className="animate-fade-in">
              <button
                className="mb-6 px-4 py-2 bg-primary text-white rounded"
                onClick={() => setSelectedProject(null)}
              >
                ← Back to Projects
              </button>
              <h2 className="text-3xl font-bold mb-4">{selectedProject.title}</h2>
              <p className="text-muted-foreground mb-2 text-sm">
                {selectedProject.timeframe} • Lead: {selectedProject.lead}
              </p>
              <div className="prose dark:prose-invert max-w-none mb-4">
                <p>{selectedProject.details}</p>
              </div>
              {selectedProject.image && (
                <img
                  src={selectedProject.image}
                  alt={`${selectedProject.title} image`}
                  className="w-full max-w-3xl rounded shadow-lg mt-6"
                />
              )}
              <div className="mt-6">
                <h4 className="font-medium text-sm mb-2">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tags.map((tag, i) => (
                    <Badge key={i} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="ongoing" className="mb-12">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="ongoing">Ongoing Projects</TabsTrigger>
                <TabsTrigger value="completed">Completed Projects</TabsTrigger>
              </TabsList>

              <TabsContent value="ongoing" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ongoingProjects.map((project, index) => (
                    <Card
                      key={index}
                      className="h-full flex flex-col cursor-pointer"
                      onClick={() => setSelectedProject(project)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle>{project.title}</CardTitle>
                          <Badge
                            variant={
                              project.status === "Active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <CardDescription>{project.timeframe}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground mb-4">
                          {project.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} />
                        </div>
                        <div className="mt-4">
                          <p className="text-sm font-medium">Lead Researcher:</p>
                          <p className="text-sm text-muted-foreground">
                            {project.lead}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag, i) => (
                            <Badge key={i} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

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
                        <p className="text-sm text-muted-foreground mb-4">
                          {project.description}
                        </p>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-sm text-blue-600 underline hover:text-blue-800"
                          >
                            View Project →
                          </a>
                        )}
                        <div>
                          <p className="text-sm font-medium">Lead Researcher:</p>
                          <p className="text-sm text-muted-foreground">
                            {project.lead}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag, i) => (
                            <Badge key={i} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </div>
  );
};

// export default Projects;

// const Projects = () => {
//   return (
//     <div className="container py-12 px-4 md:px-6 page-transition">
//       {/* Hero Section */}
//       <section className="py-16 px-6 bg-secondary/30">
//         <div className="container">
//           <h1 className="text-4xl font-bold mb-6">Research Projects</h1>
//           <p className="text-lg max-w-3xl">
//             Explore our diverse portfolio of ongoing and completed research initiatives spanning multiple disciplines and methodologies.
//           </p>
//         </div>
//       </section>

//       {/* Projects Section */}
//       <section className="py-16 px-6">
//         <div className="container">
//           <Tabs defaultValue="ongoing" className="mb-12">
//             <TabsList className="grid w-full max-w-md grid-cols-2">
//               <TabsTrigger value="ongoing">Ongoing Projects</TabsTrigger>
//               <TabsTrigger value="completed">Completed Projects</TabsTrigger>
//             </TabsList>
//             <TabsContent value="ongoing" className="mt-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                             {ongoingProjects.map((project, index) => (
//               <Card key={index} className="h-full flex flex-col" onClick={() => setSelectedProject(project)}>
//                 <CardHeader>
//                   <div className="flex justify-between items-start">
//                     <CardTitle>{project.title}</CardTitle>
//                     <Badge variant={project.status === "Active" ? "default" : "secondary"}>
//                       {project.status}
//                     </Badge>
//                   </div>
//                   <CardDescription>{project.timeframe}</CardDescription>
//                 </CardHeader>
//                 <CardContent className="flex-1">
//                   <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span>Progress</span>
//                       <span>{project.progress}%</span>
//                     </div>
//                     <Progress value={project.progress} />
//                   </div>
//                   <div className="mt-4">
//                     <p className="text-sm font-medium">Lead Researcher:</p>
//                     <p className="text-sm text-muted-foreground">{project.lead}</p>
//                   </div>
//                 </CardContent>
//                 <CardFooter>
//                   <div className="flex flex-wrap gap-2">
//                     {project.tags.map((tag, i) => (
//                       <Badge key={i} variant="outline">{tag}</Badge>
//                     ))}
//                   </div>
//                 </CardFooter>
//               </Card>
//             ))}
//               </div>
//             </TabsContent>
//           <TabsContent value="completed" className="mt-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {completedProjects.map((project, index) => (
//                 <Card key={index}>
//                   <CardHeader>
//                     <div className="flex justify-between items-start">
//                       <CardTitle>{project.title}</CardTitle>
//                       <Badge variant="secondary">{project.status}</Badge>
//                     </div>
//                     <CardDescription>{project.timeframe}</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
//                     <div>
//                       <p className="text-sm font-medium">Lead Researcher:</p>
//                       <p className="text-sm text-muted-foreground">{project.lead}</p>
//                     </div>
//                   </CardContent>
//                   <CardFooter>
//                     <div className="flex flex-wrap gap-2">
//                       {project.tags.map((tag, i) => (
//                         <Badge key={i} variant="outline">{tag}</Badge>
//                       ))}
//                     </div>
//                   </CardFooter>
//                 </Card>
//               ))}
//             </div>
//           </TabsContent>
//           </Tabs>
//         </div>
//       </section>
//     </div>
//   );
// };

export default Projects;
