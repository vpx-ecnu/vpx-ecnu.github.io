import { Award, BookOpen, GraduationCap, Heart, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  return (
<div className="container py-12 px-4 md:px-6 space-y-12">
      {/* Hero Section */}
      <section className="py-16 px-6 bg-secondary/30">
        <div className="container">
          <h1 className="text-4xl font-bold mb-6">About RadiantResearch</h1>
          <div className="max-w-3xl">
            <p className="text-lg mb-6">
              Founded in 2010, the RadiantResearch Group is an interdisciplinary research unit dedicated to advancing knowledge across multiple domains through innovative methodologies and collaborative approaches.
            </p>
            <p className="text-lg">
              Our team consists of leading researchers, post-doctoral fellows, graduate students, and support staff committed to excellence in research and education.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Our Mission</h2>
              </div>
              <p className="text-muted-foreground">
                To produce cutting-edge research that addresses complex societal challenges through interdisciplinary collaboration and innovative methodologies, while training the next generation of researchers and thought leaders.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Our Vision</h2>
              </div>
              <p className="text-muted-foreground">
                To be globally recognized as a leader in transformative research that bridges disciplines and creates meaningful impact for communities worldwide through scientific inquiry and knowledge dissemination.
              </p>
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
            {
              title: "Artificial Intelligence",
              description: "Developing advanced AI techniques and exploring their applications across domains."
            },
            {
              title: "Data Science",
              description: "Extracting meaningful insights from complex datasets to address scientific and societal challenges."
            },
            {
              title: "Complex Systems",
              description: "Understanding emergent behaviors in interconnected systems across multiple scales."
            },
            {
              title: "Computational Biology",
              description: "Applying computational methods to understand biological processes and advance healthcare."
            },
            {
              title: "Sustainable Technologies",
              description: "Researching solutions that address environmental challenges and promote sustainability."
            },
            {
              title: "Human-Computer Interaction",
              description: "Designing intuitive interfaces and studying the relationship between humans and technology."
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
                year: "2010",
                title: "Founding of RadiantResearch",
                description: "Established with a focus on interdisciplinary research across digital humanities and data science.",
              },
              {
                year: "2015",
                title: "Expansion of Research Areas",
                description: "Added new focus areas in sustainable technologies and public policy research.",
              },
              {
                year: "2019",
                title: "International Collaboration Network",
                description: "Established partnerships with leading research institutions across Europe, Asia, and North America.",
              },
              {
                year: "2022",
                title: "Launch of Innovation Lab",
                description: "Created a dedicated space for experimental research and prototype development.",
              },
              {
                year: "2024",
                title: "Current Focus",
                description: "Expanding our impact through open-access research and community engagement initiatives.",
              },
            ].map((milestone, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  {index < 4 && <div className="w-0.5 h-full bg-border mt-2"></div>}
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
