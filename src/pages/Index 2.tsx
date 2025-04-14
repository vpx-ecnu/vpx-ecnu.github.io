import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Users, FlaskConical, Calendar } from "lucide-react";

const Index = () => {
  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Advancing Research Through Collaborative Innovation
            </h1>
            <p className="text-xl mb-8 text-muted-foreground">
              Pioneering academic research at the intersection of science, technology, and society.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link to="/projects">
                  Explore Our Research
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/join-us">Join Our Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Research Areas */}
      <section className="py-16 px-6">
        <div className="container">
          <h2 className="text-3xl font-bold mb-12 text-center">Research Focus Areas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <BookOpen className="h-8 w-8" />,
                title: "Data Science & AI",
                description: "Advancing machine learning techniques for real-world applications across domains.",
              },
              {
                icon: <FlaskConical className="h-8 w-8" />,
                title: "Sustainable Energy",
                description: "Developing innovative solutions for clean energy generation and storage.",
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Human-Computer Interaction",
                description: "Creating intuitive interfaces and systems that enhance user experience.",
              },
              {
                icon: <Calendar className="h-8 w-8" />,
                title: "Public Policy",
                description: "Informing policy decisions with data-driven research and analysis.",
              },
            ].map((area, index) => (
              <div 
                key={index} 
                className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col items-center text-center"
              >
                <div className="mb-4 p-2 rounded-full bg-primary/10">{area.icon}</div>
                <h3 className="text-xl font-medium mb-2">{area.title}</h3>
                <p className="text-sm text-muted-foreground">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Publications */}
      <section className="py-16 px-6 bg-secondary/30">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Latest Publications</h2>
            <Button variant="outline" asChild>
              <Link to="/publications">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Machine Learning Applications in Climate Modeling",
                authors: "Zhang, J., Smith, A., Johnson, R.",
                journal: "Journal of Climate Science",
                year: "2024",
              },
              {
                title: "Neural Networks for Predictive Healthcare Analytics",
                authors: "Williams, S., Brown, T., Miller, M.",
                journal: "Medical Data Science Journal",
                year: "2023",
              },
              {
                title: "Optimizing Urban Infrastructure Using AI",
                authors: "Garcia, L., Park, S., Thompson, K.",
                journal: "Smart Cities Research",
                year: "2023",
              },
            ].map((publication, index) => (
              <div key={index} className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <h3 className="font-medium mb-2">{publication.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{publication.authors}</p>
                <div className="flex justify-between text-xs">
                  <span>{publication.journal}</span>
                  <span>{publication.year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 text-center">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">Join Our Research Community</h2>
          <p className="text-xl mb-8 text-muted-foreground">
            We're always looking for passionate researchers and collaborators to join our team.
          </p>
          <Button size="lg" asChild>
            <Link to="/join-us">Learn About Opportunities</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
