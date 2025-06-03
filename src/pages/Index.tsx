import { ArrowRight, BookOpen, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { activitiesData } from "@/data/activities";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
const Index = () => {
  return <div className="page-transition">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background to-muted pt-16 pb-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8 md:space-y-12">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
                Welcome to VPX Group @ ECNU
              </h1>
              <p className="text-muted-foreground md:text-xl">
              Visual Perception + X (VPX) group's mission is to develop visual perception for cross-disciplinary research, particularly, in methods of extracting meaningful information and structural data from videos and raw streaming sources. 
              Using the visual information further enables AI-based downstream application, including metaverse, AIGC and embodied intelligence. 
              Currently, we are focusing on video analysis, controllable video & image generation, and manipulation with robotics.
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
      
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-secondary/30">
      <div className="relative overflow-visible">
  <Swiper
    modules={[Navigation]}
    navigation
    spaceBetween={50}
    slidesPerView={1}
    className="relative container"
  >
    {/* Slide 1 */}
    <SwiperSlide>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="max-w-3xl flex-1">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Embodied Intelligence: Robots That See, Think, and Act
          </h1>
          <p className="text-xl mb-8 text-muted-foreground">
            Empowering robots with reinforcement learning and LLMs to perform tasks from household chores to automated chemistry experiments.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link to="/projects">
                Explore Robot Research
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/join">Join Our Team</Link>
            </Button>
          </div>
        </div>
        <div className="flex-1 hidden md:block">
          <img
            src="/lovable-uploads/robot.jpeg"
            alt="VPX Lab Environment"
            className="w-full h-auto rounded-lg shadow-lg object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </SwiperSlide>

    {/* Slide 2 */}
    <SwiperSlide>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="max-w-3xl flex-1">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Creative Intelligence: Generating for the Metaverse
          </h1>
          <p className="text-xl mb-8 text-muted-foreground">
            Leveraging diffusion models for controllable image, video, and 3D mesh generation in immersive digital environments.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link to="/projects#aigc">Explore AIGC Research</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/join">Join Our Team</Link>
            </Button>
          </div>
        </div>
        <div className="flex-1 hidden md:block">
          <img
            src="/lovable-uploads/via.png"
            alt="Generative AI Showcase"
            className="w-full h-auto rounded-lg shadow-lg object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </SwiperSlide>

    {/* Slide 3 */}
    <SwiperSlide>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="max-w-3xl flex-1">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Reimagining Visual Realism: Next-Gen Rendering
          </h1>
          <p className="text-xl mb-8 text-muted-foreground">
            Exploring NeRF and 3DGS for virtual humans, lighting reconstruction, 3D scene stylization, and realistic rendering.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link to="/projects#embodied-ai">View 3D Research</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/join">Join Our Team</Link>
            </Button>
          </div>
        </div>
        <div className="flex-1 hidden md:block">
          <img
            src="/lovable-uploads/sun.png"
            alt="Embodied AI Robot"
            className="w-full h-auto rounded-lg shadow-lg object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </SwiperSlide>
    <SwiperSlide>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="max-w-3xl flex-1">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Vision Meets Language: Intelligent Video Understanding
          </h1>
          <p className="text-xl mb-8 text-muted-foreground">
            Combining tracking, segmentation, and large language models for applications like live content generation and sports commentary.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link to="/projects#embodied-ai">View VLM Research</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/join">Join Our Team</Link>
            </Button>
          </div>
        </div>
        <div className="flex-1 hidden md:block">
          <img
            src="/lovable-uploads/soccer-application.png"
            alt="Embodied AI Robot"
            className="w-full h-auto rounded-lg shadow-lg object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </SwiperSlide>
  </Swiper>
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
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="flex flex-col p-6 bg-card rounded-lg border hover:shadow-md transition-shadow fade-in-content" style={{
              animationDelay: `${i * 150}ms`
            }}>
                  <h3 className="text-xl font-semibold mb-2">
                    Research Project {i}
                  </h3>
                  <p className="text-muted-foreground flex-1">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vel tincidunt arcu.
                  </p>
                  <Button asChild variant="link" className="mt-4 ml-auto p-0">
                    <Link to="/projects">Learn more <ArrowRight className="h-4 w-4 ml-1" /></Link>
                  </Button>
                </div>)}
            </div> */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Embodied AI",
                description: "Developing intelligent agents that perceive, learn, and interact with physical environments through robotics and simulation platforms."
              },
              {
                title: "AIGC",
                description: "Pioneering AI-generated content technologies for text, image, video and multimodal creation using cutting-edge generative models."
              },
              {
                title: "3D Computer Graphics",
                description: "Advancing neural rendering, 3D Gaussian splatting, virtual reality (VR), and ray tracing technologies to power next-generation immersive visual experiences."
              },
              {
                title: "Video Analysis",
                description: "Pioneering video understanding, object tracking, video action analysis, and multimodal large language models (LLMs) to build next-generation intelligent video systems."
              }
            ].map((item, i) => (
              <div 
                key={i} 
                className="flex flex-col p-6 bg-card rounded-lg border hover:shadow-md transition-shadow fade-in-content" 
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <h3 className="text-xl font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground flex-1">
                  {item.description}
                </p>
                <Button asChild variant="link" className="mt-4 ml-auto p-0">
                  <Link to={`/projects#${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    Learn more <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* Key Statistics */}
      <section className="bg-muted my-[3px] py-[21px] mx-0 px-[36px] rounded-none">
        <div className="container px-4 md:px-6 fade-in-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">10+</h3>
              <p className="text-muted-foreground">Publications</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">20</h3>
              <p className="text-muted-foreground">Researchers</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">5</h3>
              <p className="text-muted-foreground">Years of Research</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News/Activities */}
      {/* <section className="py-16 md:py-24">
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
              {[1, 2, 3].map(i => <div key={i} className="flex flex-col md:flex-row gap-4 fade-in-content" style={{
              animationDelay: `${i * 150}ms`
            }}>
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
                </div>)}
            </div>
            <div className="text-center">
              <Button asChild>
                <Link to="/activities">View All Activities</Link>
              </Button>
            </div>
          </div>
        </div>
      </section> */}
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
              {activitiesData.news.slice(0, 3).map((item, index) => (
                <div 
                  key={item.id} 
                  className="flex flex-col md:flex-row gap-4 fade-in-content" 
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="md:w-1/4 bg-muted rounded-lg h-40 flex items-center justify-center overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="md:w-3/4">
                    <div className="text-sm text-muted-foreground mb-2">
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {item.description}
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

    </div>;
};
export default Index;