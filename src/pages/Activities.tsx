
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Cpu, GraduationCap, Users } from "lucide-react";

// Sample activities data
const activitiesData = {
  news: [
    {
      id: 1,
      title: "Research Team Secures $2M Grant for Climate AI Project",
      date: "2023-04-10",
      description: "Our team has been awarded a significant grant to develop AI solutions for climate modeling and prediction.",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "New Publication in Nature on Quantum Computing Advancements",
      date: "2023-03-22",
      description: "Dr. Johnson and team published groundbreaking research on quantum algorithm optimization in Nature.",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Research Group Welcomes Three New PhD Students",
      date: "2023-02-15",
      description: "We're excited to expand our team with talented new doctoral researchers focusing on AI ethics, sustainable materials, and biomedical sensors.",
      image: "/placeholder.svg"
    },
    {
      id: 4,
      title: "Collaboration Established with International Research Institute",
      date: "2023-01-30",
      description: "A new partnership with the Global Science Institute will expand our research capabilities and international impact.",
      image: "/placeholder.svg"
    }
  ],
  seminars: [
    {
      id: 5,
      title: "Frontiers in Quantum Machine Learning",
      speaker: "Dr. Lisa Zhang, Quantum AI Institute",
      date: "2023-04-20",
      time: "14:00 - 15:30",
      location: "Science Building, Room 305",
      description: "Exploring recent advances in applying quantum computing to machine learning challenges."
    },
    {
      id: 6,
      title: "Ethical Considerations in Scientific Research",
      speaker: "Prof. Marcus Rivera, Ethics Department",
      date: "2023-04-13",
      time: "11:00 - 12:30",
      location: "Virtual Seminar",
      description: "Discussing the ethical dimensions of modern scientific research across disciplines."
    },
    {
      id: 7,
      title: "Sustainable Materials Engineering: Progress and Challenges",
      speaker: "Dr. Olivia Thompson, Materials Science Lab",
      date: "2023-04-06",
      time: "15:00 - 16:30",
      location: "Engineering Hall, Room 202",
      description: "Reviewing recent developments in sustainable materials with focus on biodegradable alternatives."
    }
  ],
  conferences: [
    {
      id: 8,
      title: "International Conference on AI and Climate Science",
      date: "2023-06-15",
      location: "Paris, France",
      involvement: "Dr. Johnson will deliver a keynote speech; three team members presenting papers",
      description: "A major gathering of researchers working at the intersection of artificial intelligence and climate science."
    },
    {
      id: 9,
      title: "Biomedical Engineering Symposium",
      date: "2023-05-22",
      location: "Boston, USA",
      involvement: "Dr. Williams chairing a session; PhD student presenting poster",
      description: "Annual symposium showcasing the latest advances in biomedical engineering and healthcare technologies."
    }
  ],
  workshops: [
    {
      id: 10,
      title: "Quantum Computing for Beginners Workshop",
      date: "2023-04-29",
      time: "09:00 - 16:00",
      location: "Computing Lab, Room 101",
      instructor: "Dr. Michael Chen and PhD students",
      description: "A hands-on introduction to quantum computing concepts and programming for students and researchers."
    },
    {
      id: 11,
      title: "Data Visualization for Scientific Research",
      date: "2023-04-15",
      time: "13:00 - 17:00",
      location: "Science Library, Computer Lab",
      instructor: "Dr. Sarah Williams",
      description: "Learn effective techniques for visualizing complex scientific data to communicate research findings."
    }
  ]
};

const Activities = () => {
  const [newsFilter, setNewsFilter] = useState("all");
  
  const filteredNews = newsFilter === "all" 
    ? activitiesData.news 
    : activitiesData.news.filter(item => {
        const itemDate = new Date(item.date);
        const currentDate = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
        
        return newsFilter === "recent" 
          ? itemDate >= threeMonthsAgo 
          : itemDate < threeMonthsAgo;
      });

  return (
    <div className="container py-12 px-4 md:px-6 space-y-12 page-transition">
      <section className="space-y-4 text-center max-w-3xl mx-auto fade-in-content">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">Activities & News</h1>
        <p className="text-muted-foreground md:text-xl">
          Stay updated with the latest happenings, events, and achievements in our research group.
        </p>
      </section>

      <section className="fade-in-content" style={{ animationDelay: "100ms" }}>
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" /> News
            </TabsTrigger>
            <TabsTrigger value="seminars" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Seminars
            </TabsTrigger>
            <TabsTrigger value="conferences" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Conferences
            </TabsTrigger>
            <TabsTrigger value="workshops" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Workshops
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="news" className="space-y-8">
            <div className="flex justify-end mb-4">
              <div className="flex gap-2">
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${newsFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                  onClick={() => setNewsFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${newsFilter === 'recent' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                  onClick={() => setNewsFilter('recent')}
                >
                  Recent
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${newsFilter === 'older' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                  onClick={() => setNewsFilter('older')}
                >
                  Older
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNews.map((item, index) => (
                <Card key={item.id} className="flex overflow-hidden fade-in-content" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="md:w-1/3 bg-muted flex items-center justify-center">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-12 h-12 text-muted-foreground"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>{new Date(item.date).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm">{item.description}</p>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="seminars" className="space-y-6">
            {activitiesData.seminars.map((seminar, index) => (
              <Card key={seminar.id} className="fade-in-content" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader>
                  <CardTitle>{seminar.title}</CardTitle>
                  <CardDescription>
                    <span className="font-medium">{seminar.speaker}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(seminar.date).toLocaleDateString()} | {seminar.time}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{seminar.location}</span>
                    </div>
                    <p className="mt-2">{seminar.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="conferences" className="space-y-6">
            {activitiesData.conferences.map((conference, index) => (
              <Card key={conference.id} className="fade-in-content" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader>
                  <CardTitle>{conference.title}</CardTitle>
                  <CardDescription>
                    <span>{new Date(conference.date).toLocaleDateString()} | {conference.location}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div>
                      <h4 className="font-medium">Our Involvement:</h4>
                      <p className="text-muted-foreground">{conference.involvement}</p>
                    </div>
                    <p className="mt-2">{conference.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="workshops" className="space-y-6">
            {activitiesData.workshops.map((workshop, index) => (
              <Card key={workshop.id} className="fade-in-content" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader>
                  <CardTitle>{workshop.title}</CardTitle>
                  <CardDescription>
                    <span>Instructor: {workshop.instructor}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(workshop.date).toLocaleDateString()} | {workshop.time}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{workshop.location}</span>
                    </div>
                    <p className="mt-2">{workshop.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default Activities;
