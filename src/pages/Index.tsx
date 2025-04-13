
import { ArrowRight, BookOpen, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background to-muted pt-16 pb-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8 md:space-y-12">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
                Pioneering Research for the Future
              </h1>
              <p className="text-muted-foreground md:text-xl">
                Our interdisciplinary team tackles complex challenges at the frontier of science and technology.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/about">Learn About Us</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/projects">View Our Projects</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Research */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:gap-12">
            <div className="fade-in-content flex flex-col gap-2 md:gap-4">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">
                Featured Research
              </h2>
              <p className="text-muted-foreground md:text-lg">
                Our current projects span multiple disciplines and real-world applications.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="flex flex-col p-6 bg-card rounded-lg border hover:shadow-md transition-shadow fade-in-content"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <h3 className="text-xl font-semibold mb-2">
                    Research Project {i}
                  </h3>
                  <p className="text-muted-foreground flex-1">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vel tincidunt arcu.
                  </p>
                  <Button asChild variant="link" className="mt-4 ml-auto p-0">
                    <Link to="/projects">Learn more <ArrowRight className="h-4 w-4 ml-1" /></Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Statistics */}
      <section className="bg-muted py-16">
        <div className="container px-4 md:px-6 fade-in-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">120+</h3>
              <p className="text-muted-foreground">Publications</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">35</h3>
              <p className="text-muted-foreground">Researchers</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">15</h3>
              <p className="text-muted-foreground">Years of Research</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News/Activities */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:gap-12">
            <div className="fade-in-content flex flex-col gap-2 md:gap-4">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">
                Latest Activities
              </h2>
              <p className="text-muted-foreground md:text-lg">
                Stay updated with our recent events, discoveries, and achievements.
              </p>
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="flex flex-col md:flex-row gap-4 fade-in-content"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="md:w-1/4 bg-muted rounded-lg h-40 flex items-center justify-center">
                    <span className="text-muted-foreground">Image {i}</span>
                  </div>
                  <div className="md:w-3/4">
                    <div className="text-sm text-muted-foreground mb-2">
                      {new Date().toLocaleDateString()}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Research Team Achieves Breakthrough
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vel tincidunt arcu. Nulla facilisi. Duis euismod urna id metus dictum.
                    </p>
                    <Button asChild variant="link" className="p-0">
                      <Link to="/activities">Read more <ArrowRight className="h-4 w-4 ml-1" /></Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Button asChild>
                <Link to="/activities">View All Activities</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
