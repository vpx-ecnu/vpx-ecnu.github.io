
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import faculty from "../../public/people/faculty.json";
import phdStudents from "../../public/people/phd.json";
import gradStudents from "../../public/people/graduate.json";
import undergraduate from "../../public/people/Undergraduate.json";
import alumni from "../../public/people/alumni.json";
import part_time from "../../public/people/part-time.json";

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
      {/* Hero Section */}
      <section className="py-16 px-6 bg-secondary/30">
        <div className="container">
          <h1 className="text-4xl font-bold mb-6">Our Team</h1>
          <p className="text-lg max-w-3xl">
            Meet the diverse group of researchers, faculty, and staff who contribute to our research initiatives and academic mission.
          </p>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="py-16 px-6">
        <div className="container">
          {/* <Tabs defaultValue="faculty" className="mb-12">
            <TabsList className="flex flex-wrap justify-center gap-2 mb-6">
              <TabsTrigger value="faculty">Faculty</TabsTrigger>
              <TabsTrigger value="postdocs">Post-Doctoral Researchers</TabsTrigger>
              <TabsTrigger value="students">Graduate Students</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="alumni">Alumni</TabsTrigger>
              
            </TabsList>
            <TabsContent value="faculty" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: "Dr. Sarah Johnson",
                    title: "Director & Professor of Data Science",
                    bio: "Leading expert in AI applications for climate modeling with over 15 years of research experience.",
                    image: "",
                    email: "sjohnson@radiantresearch.edu",
                    website: "#",
                    research: ["AI/ML", "Climate Science", "Data Modeling"],
                  },
                  {
                    name: "Dr. Michael Chen",
                    title: "Associate Professor of Quantum Computing",
                    bio: "Specializes in quantum algorithms and their applications in cryptography and optimization problems.",
                    image: "",
                    email: "mchen@radiantresearch.edu",
                    website: "#",
                    research: ["Quantum Computing", "Algorithms", "Cryptography"],
                  },
                  {
                    name: "Dr. Emma Rodriguez",
                    title: "Associate Professor of Urban Planning",
                    bio: "Focuses on data-driven approaches to urban infrastructure and smart city technologies.",
                    image: "",
                    email: "erodriguez@radiantresearch.edu",
                    website: "#",
                    research: ["Urban Planning", "Smart Cities", "Infrastructure"],
                  },
                  {
                    name: "Dr. Thomas Wilson",
                    title: "Professor of Materials Science",
                    bio: "Researches sustainable materials and their applications in various industries.",
                    image: "",
                    email: "twilson@radiantresearch.edu",
                    website: "#",
                    research: ["Materials Science", "Sustainability", "Engineering"],
                  },
                ].map((member, index) => (
                  <PeopleCard key={index} member={member} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="postdocs" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: "Dr. Jennifer Park",
                    title: "Post-Doctoral Research Associate",
                    bio: "Researching machine learning applications in healthcare analytics and medical imaging.",
                    image: "",
                    email: "jpark@radiantresearch.edu",
                    website: "#",
                    research: ["Machine Learning", "Healthcare", "Medical Imaging"],
                  },
                  {
                    name: "Dr. Raj Patel",
                    title: "Post-Doctoral Research Associate",
                    bio: "Working on quantum computing algorithms for optimization problems in logistics.",
                    image: "",
                    email: "rpatel@radiantresearch.edu",
                    website: "#",
                    research: ["Quantum Computing", "Optimization", "Logistics"],
                  },
                  {
                    name: "Dr. Sophia Lee",
                    title: "Post-Doctoral Research Associate",
                    bio: "Developing new methods for sustainable urban planning using geospatial data.",
                    image: "",
                    email: "slee@radiantresearch.edu",
                    website: "#",
                    research: ["Urban Planning", "Sustainability", "GIS"],
                  },
                ].map((member, index) => (
                  <PeopleCard key={index} member={member} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="students" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: "Alex Thompson",
                    title: "PhD Candidate",
                    bio: "Researching neural networks for climate prediction models.",
                    image: "",
                    email: "athompson@radiantresearch.edu",
                    research: ["Neural Networks", "Climate Science", "Prediction Models"],
                  },
                  {
                    name: "Maria Garcia",
                    title: "PhD Candidate",
                    bio: "Studying the applications of quantum computing in materials science.",
                    image: "",
                    email: "mgarcia@radiantresearch.edu",
                    research: ["Quantum Computing", "Materials Science", "Modeling"],
                  },
                  {
                    name: "David Kim",
                    title: "PhD Student",
                    bio: "Working on sustainable urban infrastructure models using AI.",
                    image: "",
                    email: "dkim@radiantresearch.edu",
                    research: ["Urban Planning", "Sustainability", "AI"],
                  },
                  {
                    name: "Priya Singh",
                    title: "PhD Student",
                    bio: "Developing new algorithms for renewable energy optimization.",
                    image: "",
                    email: "psingh@radiantresearch.edu",
                    research: ["Algorithms", "Renewable Energy", "Optimization"],
                  },
                ].map((member, index) => (
                  <PeopleCard key={index} member={member} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="staff" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: "Robert Taylor",
                    title: "Research Administrator",
                    bio: "Manages research grants, budgets, and administrative processes.",
                    image: "",
                    email: "rtaylor@radiantresearch.edu",
                  },
                  {
                    name: "Linda Martinez",
                    title: "Communications Coordinator",
                    bio: "Handles public relations, website management, and research dissemination.",
                    image: "",
                    email: "lmartinez@radiantresearch.edu",
                  },
                  {
                    name: "James Wilson",
                    title: "Laboratory Manager",
                    bio: "Oversees research equipment, lab safety, and technical support.",
                    image: "",
                    email: "jwilson@radiantresearch.edu",
                  },
                ].map((member, index) => (
                  <PeopleCard key={index} member={member} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="alumni" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {peopleData.alumni.map((person, index) => (
                  <Card key={person.id} className="overflow-hidden hover:shadow-md transition-shadow fade-in-content" style={{ animationDelay: `${index * 100}ms` }}>
                    
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
          </Tabs> */}
          <Tabs defaultValue="faculty">
            <TabsList className="flex flex-wrap justify-center gap-2 mb-6">
              <TabsTrigger value="faculty">Faculty</TabsTrigger>
              <TabsTrigger value="phd">PhD Students</TabsTrigger>
              <TabsTrigger value="grad">Graduate Students</TabsTrigger>
              <TabsTrigger value="part">Part-time Students</TabsTrigger>
              <TabsTrigger value="undergrad">Undergraduate Student</TabsTrigger>
              <TabsTrigger value="alumni">Alumni</TabsTrigger>
            </TabsList>

            <TabsContent value="faculty" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {faculty.map((member, index) => (
                  <PeopleCard key={index} member={member} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="phd" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {phdStudents.map((member, index) => (
                  <PeopleCard key={index} member={member} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="grad" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gradStudents.map((member, index) => (
                  <PeopleCard key={index} member={member} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="part" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {part_time.map((member, index) => (
                  <PeopleCard key={index} member={member} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="undergrad" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {undergraduate.map((member, index) => (
                  <PeopleCard key={index} member={member} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="alumni" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {alumni.map((member, index) => (
                  <PeopleCard key={index} member={member} isAlumni/>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

interface PeopleCardProps {
  member: {
    name: string;
    title: string;
    bio: string;
    image: string;
    email: string;
    website?: string;
    research?: string[];
  };
  isAlumni?: boolean;
}

const PeopleCard = ({ member, isAlumni = false }: PeopleCardProps) => {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Card className="h-full flex flex-col">
  <CardHeader className={`flex flex-col ${isAlumni ? "items-start text-left" : "items-center text-center"}`}>
    {!isAlumni && (
      <Avatar className="w-44 h-44">
        <AvatarImage src={member.image} className="object-cover" />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
    )}
    <CardTitle className={isAlumni ? "mt-0" : "mt-4"}>{member.name}</CardTitle>
    <CardDescription className={isAlumni ? "text-blue-600" : ""}>
  {member.title}
</CardDescription>
  </CardHeader>
  <CardContent className="flex-1">
    <p className={`text-sm text-muted-foreground ${isAlumni ? "" : "text-center"}`}>{member.bio}</p>
    {member.research && (
      <div className="mt-4">
        <p className={`text-sm font-medium ${isAlumni ? "" : "text-center"}`}>
  {isAlumni ? "Alumni Placement" : "Research Areas"}
</p>
        <ul className={`mt-2 text-sm text-muted-foreground space-y-1 ${isAlumni ? "" : "text-center"}`}>
          {member.research.map((area, i) => (
            <li key={i}>{area}</li>
          ))}
        </ul>
      </div>
    )}
  </CardContent>
  <CardFooter className={`flex ${isAlumni ? "justify-start" : "justify-center"} gap-2`}>
    {!isAlumni && (
      <Button size="sm" variant="outline" asChild>
        <a href={`mailto:${member.email}`}>
          <Mail className="h-4 w-4 mr-2" />
          Email
        </a>
      </Button>
    )}
    {member.website && (
      <Button size="sm" variant="outline" asChild>
        <a href={member.website} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4 mr-2" />
          Website
        </a>
      </Button>
    )}
  </CardFooter>
</Card>
  );
};

export default People;
