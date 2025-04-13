
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Sample project data
const projectsData = [
  {
    id: 1,
    title: "Machine Learning for Climate Modeling",
    description: "Utilizing advanced machine learning techniques to improve climate prediction models and understand long-term climate patterns.",
    categories: ["AI", "Climate Science", "Current"],
    image: "/placeholder.svg",
    year: 2023
  },
  {
    id: 2,
    title: "Quantum Algorithm Development",
    description: "Researching novel quantum algorithms with applications in cryptography, optimization, and simulation of physical systems.",
    categories: ["Quantum Computing", "Algorithms", "Current"],
    image: "/placeholder.svg",
    year: 2023
  },
  {
    id: 3,
    title: "Integrated Biomedical Sensors",
    description: "Developing non-invasive sensors for continuous health monitoring with applications in preventive medicine and chronic disease management.",
    categories: ["Biomedical", "Sensors", "Current"],
    image: "/placeholder.svg",
    year: 2022
  },
  {
    id: 4,
    title: "Urban Mobility Analysis",
    description: "Analyzing patterns in urban transportation and developing models for more efficient and sustainable city planning.",
    categories: ["Data Science", "Urban Planning", "Completed"],
    image: "/placeholder.svg",
    year: 2021
  },
  {
    id: 5,
    title: "Language Model for Scientific Literature",
    description: "Creating specialized language models for processing and summarizing academic research papers across disciplines.",
    categories: ["NLP", "Scientific Computing", "Current"],
    image: "/placeholder.svg",
    year: 2022
  },
  {
    id: 6,
    title: "Sustainable Materials Engineering",
    description: "Researching biodegradable alternatives to conventional materials with applications in packaging and construction.",
    categories: ["Materials Science", "Sustainability", "Completed"],
    image: "/placeholder.svg",
    year: 2020
  }
];

// Extract unique categories
const allCategories = Array.from(
  new Set(projectsData.flatMap(project => project.categories))
);

const Projects = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter projects based on selected categories and search term
  const filteredProjects = projectsData.filter(project => {
    const matchesCategories = selectedCategories.length === 0 || 
      project.categories.some(category => selectedCategories.includes(category));
    
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategories && matchesSearch;
  });

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="container py-12 px-4 md:px-6 page-transition">
      <section className="space-y-4 text-center max-w-3xl mx-auto mb-12 fade-in-content">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">Our Research Projects</h1>
        <p className="text-muted-foreground md:text-xl">
          Explore our diverse portfolio of research initiatives spanning multiple disciplines.
        </p>
      </section>

      <section className="mb-12 fade-in-content" style={{ animationDelay: "100ms" }}>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="w-full p-2 border rounded-md bg-background"
            />
          </div>
          <div className="flex-1 flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-muted-foreground">Filter:</span>
            {allCategories.map(category => (
              <Button
                key={category}
                variant={selectedCategories.includes(category) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCategory(category)}
                className="text-xs"
              >
                {category}
              </Button>
            ))}
            {selectedCategories.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategories([])}
                className="ml-auto text-xs"
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-12 h-12 text-muted-foreground"
                />
              </div>
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.categories.map(category => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {project.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4 text-sm text-muted-foreground">
                <span>Year: {project.year}</span>
                <Button variant="link" size="sm" className="p-0">
                  Learn more
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Projects;
