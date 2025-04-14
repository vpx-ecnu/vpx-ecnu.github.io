
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  return (
    <div className="container py-12 px-4 md:px-6 space-y-12">
      <section className="space-y-4 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">About Our Research Group</h1>
        <p className="text-muted-foreground md:text-xl">
          Pushing the boundaries of knowledge through collaborative research and innovation.
        </p>
      </section>

      <section className="grid gap-8 md:gap-12">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">Our Mission</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p>
            Our research group is dedicated to advancing fundamental understanding in our field while developing practical applications that address real-world challenges. Through rigorous inquiry, innovative methodologies, and interdisciplinary collaboration, we aim to:
          </p>
          <ul>
            <li>Conduct groundbreaking research that extends the frontiers of knowledge</li>
            <li>Train the next generation of researchers and thought leaders</li>
            <li>Translate discoveries into impactful solutions for society</li>
            <li>Foster a collaborative and inclusive research environment</li>
          </ul>
          <p>
            We believe that the most significant breakthroughs occur at the intersection of disciplines and through diverse perspectives working together toward common goals.
          </p>
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

      <section className="grid gap-8 md:gap-12">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">Our History</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p>
            Founded in 2010, our research group began with a small team of dedicated scientists focused on a specific set of research questions. Over the years, we have grown into a diverse community of researchers spanning multiple disciplines and research areas.
          </p>
          <p>
            Key milestones in our journey include:
          </p>
          <ul>
            <li><strong>2010:</strong> Research group established with initial focus on fundamental research</li>
            <li><strong>2013:</strong> First major grant funding received, enabling expansion of research areas</li>
            <li><strong>2015:</strong> Launch of interdisciplinary collaboration initiative</li>
            <li><strong>2018:</strong> Established formal graduate training program</li>
            <li><strong>2020:</strong> Celebrated 10 years with publication of 100th research paper</li>
            <li><strong>Present:</strong> Continuing to expand our research portfolio and global collaborations</li>
          </ul>
          <p>
            Through these years, we have remained committed to our founding principles of scientific excellence, collaborative spirit, and societal impact.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
