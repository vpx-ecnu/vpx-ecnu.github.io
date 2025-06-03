
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ExternalLink } from "lucide-react";

// Sample publications data
const publicationsData = [
  {
    id: 1,
    title: "Advancements in Quantum Machine Learning Algorithms for Material Science Applications",
    authors: "J. Smith, A. Johnson, L. Williams",
    journal: "Journal of Quantum Computing",
    year: 2023,
    doi: "10.1000/xyz123",
    tags: ["Quantum Computing", "Machine Learning", "Material Science"]
  },
  {
    id: 2,
    title: "Neural Network Approaches to Climate Modeling: A Comparative Analysis",
    authors: "R. Miller, S. Davis, T. Wilson",
    journal: "Nature Climate Science",
    year: 2023,
    doi: "10.1000/abc456",
    tags: ["Climate Science", "Neural Networks", "Modeling"]
  },
  {
    id: 3,
    title: "Sustainable Urban Planning through Data-Driven Decision Making",
    authors: "E. Brown, C. Taylor, H. Moore",
    journal: "Urban Studies Journal",
    year: 2022,
    doi: "10.1000/def789",
    tags: ["Urban Planning", "Data Science", "Sustainability"]
  },
  {
    id: 4,
    title: "Novel Biomedical Sensors for Remote Patient Monitoring",
    authors: "K. Anderson, M. Thomas, P. Garcia",
    journal: "IEEE Transactions on Biomedical Engineering",
    year: 2022,
    doi: "10.1000/ghi012",
    tags: ["Biomedical Engineering", "Sensors", "Remote Monitoring"]
  },
  {
    id: 5,
    title: "Ethical Considerations in Artificial Intelligence Development",
    authors: "N. White, V. Martin, D. Lewis",
    journal: "AI Ethics Journal",
    year: 2021,
    doi: "10.1000/jkl345",
    tags: ["AI Ethics", "Philosophy", "Technology"]
  },
  {
    id: 6,
    title: "Biodegradable Materials for Sustainable Packaging Solutions",
    authors: "F. Clark, O. Rodriguez, S. Lee",
    journal: "Journal of Materials Engineering",
    year: 2021,
    doi: "10.1000/mno678",
    tags: ["Materials Science", "Sustainability", "Manufacturing"]
  },
  {
    id: 7,
    title: "Optimizing Energy Consumption in Smart Buildings Using Reinforcement Learning",
    authors: "G. Hill, J. Perez, B. Adams",
    journal: "Energy and Buildings",
    year: 2020,
    doi: "10.1000/pqr901",
    tags: ["Energy", "Reinforcement Learning", "Smart Buildings"]
  },
  {
    id: 8,
    title: "Privacy-Preserving Federated Learning for Healthcare Applications",
    authors: "I. Cook, Y. Chen, Z. Wang",
    journal: "Medical AI Research",
    year: 2020,
    doi: "10.1000/stu234",
    tags: ["Federated Learning", "Healthcare", "Privacy"]
  }
];

// Extract unique years for filtering
const years = Array.from(new Set(publicationsData.map(pub => pub.year))).sort((a, b) => b - a);

const Publications = () => {
  // const [selectedYear, setSelectedYear] = useState<number | null>(null);
  // const [searchTerm, setSearchTerm] = useState("");
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // useEffect(() => {
  //   fetch("http://127.0.0.1:8001/api/publications")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setPublications(data);
  //       setLoading(false);
  //     })
  //     .catch((err) => {
  //       console.error("Failed to fetch publications:", err);
  //       setLoading(false);
  //     });
  // }, []);
  useEffect(() => {
    fetch("/publications.json")
      .then((res) => res.json())
      .then((data) => {
        console.log("Loaded from JSON:", data);
        setPublications(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load publications:", err);
        setLoading(false);
      });
  }, []);
  // Filter publications based on selected year and search term
  // const filteredPublications = publicationsData.filter(pub => {
  //   const matchesYear = selectedYear === null || pub.year === selectedYear;
    
  //   const matchesSearch = 
  //     pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     pub.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     pub.journal.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     pub.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
  //   return matchesYear && matchesSearch;
  // });
  const filteredPublications = publications.filter(pub => {
    const matchesYear = selectedYear === null || pub.year === selectedYear;
  
    const matchesSearch =
      pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.journal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pub.tags || []).some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
    return matchesYear && matchesSearch;
  });

  filteredPublications.sort((a, b) => b.year - a.year);
  return (
    <div className="container py-12 px-4 md:px-6 page-transition">
      <section className="space-y-4 text-center max-w-3xl mx-auto mb-12 fade-in-content">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">Publications</h1>
        <p className="text-muted-foreground md:text-xl">
          Our research outputs in peer-reviewed journals and conference proceedings.
        </p>
      </section>

      <section className="mb-12 fade-in-content" style={{ animationDelay: "100ms" }}>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search publications..."
              className="w-full p-2 border rounded-md bg-background"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-muted-foreground">Year:</span>
            <Button
              variant={selectedYear === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedYear(null)}
            >
              All
            </Button>
            {years.map(year => (
              <Button
                key={year}
                variant={selectedYear === year ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredPublications.map((publication, index) => (
            <Card key={publication.id} className="fade-in-content" style={{ animationDelay: `${index * 50}ms` }}>
              <CardContent className="p-6">
                <div className="grid gap-3">
                  <h3 className="text-lg font-semibold">{publication.title}</h3>
                  {/* <div className="flex flex-wrap gap-2 mt-2">
                    {publication.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div> */}
                  <h3 className="text-lg text-muted-foreground">{publication.authors}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {/* <span className="font-medium">{publication.journal}</span>,  */}
                      {publication.year}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        // onClick={() => window.open(`https://doi.org/${publication.doi}`, '_blank')}
                        onClick={() => window.open(`${publication.doi}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" /> DOI
                      </Button>
                      {/* <Button variant="outline" size="sm" className="text-xs">
                        <Download className="h-3 w-3 mr-1" /> PDF
                      </Button> */}
                    </div>
                  </div>
                
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Publications;
