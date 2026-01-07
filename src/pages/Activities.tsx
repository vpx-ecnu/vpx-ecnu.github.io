import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Calendar, Cpu, GraduationCap, Users } from "lucide-react";
import { activitiesData } from "@/data/activities";

const Activities = () => {
  const [newsFilter, setNewsFilter] = useState("all");
  const [selectedNews, setSelectedNews] = useState(null);

  const filteredNews =
    newsFilter === "all"
      ? activitiesData.news
      : activitiesData.news.filter((item) => {
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
      {/* Header */}
      <section className="space-y-4 text-center max-w-3xl mx-auto fade-in-content">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
          News & Activities
        </h1>
        <p className="text-muted-foreground md:text-xl">
          Stay updated with the latest news, events, and academic activities in
          our research group.
        </p>
      </section>

      {/* Tabs */}
      <section className="fade-in-content" style={{ animationDelay: "100ms" }}>
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              News & Activities
            </TabsTrigger>
            <TabsTrigger value="seminars" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              VPX Reading Club
            </TabsTrigger>
          </TabsList>

          {/* News */}
          <TabsContent value="news" className="space-y-8">
            {selectedNews ? (
              <div className="animate-fade-in">
                <button
                  className="mb-6 px-4 py-2 bg-primary text-primary-foreground rounded"
                  onClick={() => setSelectedNews(null)}
                >
                  ← Back to All News
                </button>

                <h2 className="text-3xl font-bold mb-2">
                  {selectedNews.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {new Date(selectedNews.date).toLocaleDateString()}
                </p>

                {selectedNews.image && (
                  <img
                    src={selectedNews.image}
                    alt={selectedNews.title}
                    className="w-full max-w-3xl rounded-lg shadow mb-6"
                  />
                )}

                <div className="prose dark:prose-invert max-w-none">
                  <p>{selectedNews.description}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Filter */}
                <div className="flex justify-end mb-4">
                  <div className="flex gap-2">
                    {["all", "recent", "older"].map((filter) => (
                      <button
                        key={filter}
                        className={`px-3 py-1 text-sm rounded-md ${
                          newsFilter === filter
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                        onClick={() => setNewsFilter(filter)}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* News List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredNews.map((item, index) => (
                    <Card
                      key={item.id}
                      className="flex overflow-hidden cursor-pointer fade-in-content"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => setSelectedNews(item)}
                    >
                      <div className="md:w-1/3 bg-muted">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="md:w-2/3">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-lg">
                            {item.title}
                          </CardTitle>
                          <CardDescription>
                            {new Date(item.date).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            {item.sub_title}
                          </p>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* VPX Reading Club */}
          <TabsContent value="seminars" className="space-y-6">
            {activitiesData.seminars.map((seminar, index) => (
              <Card
                key={seminar.id}
                className="fade-in-content"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <CardTitle>{seminar.title}</CardTitle>
                  <CardDescription>
                    <span className="font-medium">{seminar.speaker}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(seminar.date).toLocaleDateString()} |{" "}
                      {seminar.time}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{seminar.location}</span>
                  </div>

                  <p className="pt-2 text-muted-foreground">
                    {seminar.description}
                  </p>

                  {seminar.link && (
                    <a
                      href={seminar.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-block pt-2"
                    >
                      Learn more →
                    </a>
                  )}
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
