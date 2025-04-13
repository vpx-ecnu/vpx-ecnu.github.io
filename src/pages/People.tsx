
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample people data
const peopleData = {
  faculty: [
    {
      id: 1,
      name: "Dr. Emily Johnson",
      title: "Director & Professor",
      image: "/placeholder.svg",
      research: "Quantum Computing, Artificial Intelligence",
      bio: "Dr. Johnson leads our research group with over 20 years of experience in quantum computing and AI applications.",
      email: "ejohnson@university.edu"
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      title: "Associate Professor",
      image: "/placeholder.svg",
      research: "Machine Learning, Data Science",
      bio: "Specializing in machine learning algorithms with applications in complex systems modeling.",
      email: "mchen@university.edu"
    },
    {
      id: 3,
      name: "Dr. Sarah Williams",
      title: "Assistant Professor",
      image: "/placeholder.svg",
      research: "Biomedical Engineering, Sensors",
      bio: "Dr. Williams focuses on developing novel biomedical sensors for healthcare applications.",
      email: "swilliams@university.edu"
    }
  ],
  postdocs: [
    {
      id: 4,
      name: "Dr. Robert Taylor",
      title: "Postdoctoral Researcher",
      image: "/placeholder.svg",
      research: "Climate Modeling, Neural Networks",
      bio: "Working on applying deep learning techniques to improve climate prediction models.",
      email: "rtaylor@university.edu"
    },
    {
      id: 5,
      name: "Dr. Priya Patel",
      title: "Postdoctoral Researcher",
      image: "/placeholder.svg",
      research: "Materials Science, Sustainability",
      bio: "Researching biodegradable materials with applications in sustainable packaging.",
      email: "ppatel@university.edu"
    }
  ],
  phd: [
    {
      id: 6,
      name: "Alex Rodriguez",
      title: "PhD Candidate",
      image: "/placeholder.svg",
      research: "Quantum Algorithms, Cryptography",
      bio: "Working on novel quantum algorithms for cryptographic applications.",
      email: "arodriguez@university.edu"
    },
    {
      id: 7,
      name: "Zoe Anderson",
      title: "PhD Candidate",
      image: "/placeholder.svg",
      research: "Urban Planning, Data Science",
      bio: "Analyzing urban mobility patterns using data-driven approaches.",
      email: "zanderson@university.edu"
    },
    {
      id: 8,
      name: "David Kim",
      title: "PhD Student",
      image: "/placeholder.svg",
      research: "AI Ethics, Philosophy of Technology",
      bio: "Exploring ethical considerations in artificial intelligence development.",
      email: "dkim@university.edu"
    },
    {
      id: 9,
      name: "Sophia Martinez",
      title: "PhD Student",
      image: "/placeholder.svg",
      research: "Smart Buildings, Energy Optimization",
      bio: "Working on reinforcement learning approaches to optimize energy consumption.",
      email: "smartinez@university.edu"
    }
  ],
  alumni: [
    {
      id: 10,
      name: "Dr. James Wilson",
      title: "Former PhD Student, now Assistant Professor at Tech University",
      image: "/placeholder.svg",
      research: "Natural Language Processing, Scientific Literature",
      bio: "Graduated in 2021, developed language models for scientific literature analysis.",
      email: "jwilson@techuniversity.edu"
    },
    {
      id: 11,
      name: "Dr. Olivia Brown",
      title: "Former Postdoc, now Research Scientist at AI Lab",
      image: "/placeholder.svg",
      research: "Federated Learning, Healthcare Applications",
      bio: "Collaborated on privacy-preserving machine learning techniques for healthcare, 2018-2020.",
      email: "obrown@ailab.org"
    }
  ]
};

const People = () => {
  return (
    <div className="container py-12 px-4 md:px-6 page-transition">
      <section className="space-y-4 text-center max-w-3xl mx-auto mb-12 fade-in-content">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">Our Team</h1>
        <p className="text-muted-foreground md:text-xl">
          Meet the dedicated researchers, faculty, and students who make our work possible.
        </p>
      </section>

      <section className="fade-in-content" style={{ animationDelay: "100ms" }}>
        <Tabs defaultValue="faculty" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="postdocs">Postdocs</TabsTrigger>
            <TabsTrigger value="phd">PhD Students</TabsTrigger>
            <TabsTrigger value="alumni">Alumni</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faculty" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {peopleData.faculty.map((person, index) => (
                <Card key={person.id} className="overflow-hidden hover:shadow-md transition-shadow fade-in-content" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <img 
                      src={person.image} 
                      alt={person.name} 
                      className="w-16 h-16 text-muted-foreground"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold">{person.name}</h3>
                    <p className="text-primary font-medium">{person.title}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      <span className="font-medium">Research:</span> {person.research}
                    </p>
                    <p className="text-sm mt-4">{person.bio}</p>
                    <p className="text-sm text-primary mt-4">{person.email}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="postdocs" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {peopleData.postdocs.map((person, index) => (
                <Card key={person.id} className="overflow-hidden hover:shadow-md transition-shadow fade-in-content" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <img 
                      src={person.image} 
                      alt={person.name} 
                      className="w-16 h-16 text-muted-foreground"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold">{person.name}</h3>
                    <p className="text-primary font-medium">{person.title}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      <span className="font-medium">Research:</span> {person.research}
                    </p>
                    <p className="text-sm mt-4">{person.bio}</p>
                    <p className="text-sm text-primary mt-4">{person.email}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="phd" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {peopleData.phd.map((person, index) => (
                <Card key={person.id} className="overflow-hidden hover:shadow-md transition-shadow fade-in-content" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <img 
                      src={person.image} 
                      alt={person.name} 
                      className="w-16 h-16 text-muted-foreground"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold">{person.name}</h3>
                    <p className="text-primary font-medium">{person.title}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      <span className="font-medium">Research:</span> {person.research}
                    </p>
                    <p className="text-sm mt-4">{person.bio}</p>
                    <p className="text-sm text-primary mt-4">{person.email}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="alumni" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {peopleData.alumni.map((person, index) => (
                <Card key={person.id} className="overflow-hidden hover:shadow-md transition-shadow fade-in-content" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <img 
                      src={person.image} 
                      alt={person.name} 
                      className="w-16 h-16 text-muted-foreground"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold">{person.name}</h3>
                    <p className="text-primary font-medium">{person.title}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      <span className="font-medium">Research:</span> {person.research}
                    </p>
                    <p className="text-sm mt-4">{person.bio}</p>
                    <p className="text-sm text-primary mt-4">{person.email}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default People;
