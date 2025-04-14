
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Projects = () => {
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
                    title: "AI for Climate Modeling",
                    description: "Developing machine learning algorithms to improve climate change predictions and mitigation strategies.",
                    lead: "Dr. Sarah Johnson",
                    progress: 75,
                    tags: ["AI/ML", "Climate Science", "Data Modeling"],
                    timeframe: "2023-2025",
                    status: "Active",
                  },
                  {
                    title: "Quantum Computing Applications",
                    description: "Exploring practical applications of quantum computing in cryptography and optimization problems.",
                    lead: "Dr. Michael Chen",
                    progress: 40,
                    tags: ["Quantum Computing", "Cryptography", "Algorithms"],
                    timeframe: "2022-2025",
                    status: "Active",
                  },
                  {
                    title: "Smart Urban Infrastructure",
                    description: "Creating data-driven solutions for urban planning and infrastructure optimization.",
                    lead: "Dr. Emma Rodriguez",
                    progress: 60,
                    tags: ["Urban Planning", "IoT", "Smart Cities"],
                    timeframe: "2023-2026",
                    status: "Active",
                  },
                  {
                    title: "Sustainable Materials Research",
                    description: "Developing eco-friendly materials for construction and consumer products.",
                    lead: "Dr. Thomas Wilson",
                    progress: 30,
                    tags: ["Materials Science", "Sustainability", "Engineering"],
                    timeframe: "2024-2027",
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
            <TabsContent value="completed" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Project Cards - Completed */}
                {[
                  {
                    title: "Renewable Energy Grid Integration",
                    description: "Optimizing integration of renewable energy sources into existing power grids.",
                    lead: "Dr. James Patterson",
                    tags: ["Energy Systems", "Renewables", "Optimization"],
                    timeframe: "2020-2023",
                    status: "Completed",
                  },
                  {
                    title: "Healthcare Data Analytics",
                    description: "Using big data to improve patient outcomes and healthcare delivery systems.",
                    lead: "Dr. Lisa Thompson",
                    tags: ["Healthcare", "Data Analytics", "Patient Care"],
                    timeframe: "2019-2022",
                    status: "Completed",
                  },
                  {
                    title: "Natural Language Processing for Legal Documents",
                    description: "Developing NLP tools to analyze and categorize legal texts and precedents.",
                    lead: "Dr. Robert Garcia",
                    tags: ["NLP", "Legal Tech", "AI"],
                    timeframe: "2018-2022",
                    status: "Completed",
                  },
                ].map((project, index) => (
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
