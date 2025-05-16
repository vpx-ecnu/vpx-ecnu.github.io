
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bookmark, BookOpen, Clock, ExternalLink, GraduationCap, Users } from "lucide-react";

const Join = () => {
  return (
    <div className="container py-12 px-4 md:px-6 space-y-12 page-transition">
      <section className="space-y-4 text-center max-w-3xl mx-auto fade-in-content">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">Join Our Research Group</h1>
        <p className="text-muted-foreground md:text-xl">
          Explore opportunities to collaborate, learn, and contribute to cutting-edge research.
        </p>
      </section>

      <section className="max-w-3xl mx-auto space-y-6 fade-in-content" style={{ animationDelay: "100ms" }}>
        <p>
          We're always looking for talented and motivated individuals who are passionate about research and innovation. 
          Welcome to all students interested in next-generation artificial intelligence, computer vision, computer graphics, and robotic perception to join our Visual Perception and Frontier Technology Group, VPX (Visual Perception + X Group). If you're interested in our group, feel free to follow us on 
          <a href="https://space.bilibili.com/487404760?spm_id_from=333.337.0.0" target="_blank" style={{ textDecoration: 'underline' }}> Bilibili</a> and 
          <a href="https://github.com/vpx-ecnu" target="_blank" style={{ textDecoration: 'underline' }}> GitHub</a>.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
          <Card className="bg-muted/50">
            <CardContent className="pt-6 text-center">
              <GraduationCap className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Education</h3>
              <p className="text-sm text-muted-foreground">Opportunities for academic growth and mentorship</p>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/50">
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Research</h3>
              <p className="text-sm text-muted-foreground">Work on meaningful projects at the cutting edge</p>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/50">
            <CardContent className="pt-6 text-center">
              <Users className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">Join a collaborative and supportive team</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="fade-in-content" style={{ animationDelay: "200ms" }}>
        <Tabs defaultValue="phd" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="phd">PhD Positions</TabsTrigger>
            {/* <TabsTrigger value="postdoc">Postdoc Positions</TabsTrigger>
            <TabsTrigger value="visiting">Visiting Researchers</TabsTrigger> */}
            <TabsTrigger value="master">Master's Positions</TabsTrigger>
            <TabsTrigger value="undergrad">Undergraduate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="phd" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>PhD Student Opportunities</CardTitle>
                <CardDescription>Full-time doctoral positions in our research group</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We are recruiting PhD students with strong backgrounds in relevant fields who are interested in pursuing 
                  cutting-edge research. Our PhD program typically takes 5-7 years to complete and includes both coursework 
                  and research components.
                </p>
                
                <h3 className="text-lg font-semibold mt-6">Current Openings</h3>
                <div className="space-y-4">
                  {[
                    {
                      title: "Next-Generation Rendering Engine:",
                      // deadline: "May 15, 2023",
                      description: "Focused on NeRF and 3D Gaussian Splatting (3DGS), this research explores virtual humans, lighting reconstruction, 3D reconstruction, and stylization of 3D scenes. It requires knowledge in computer graphics (CG) and machine learning (ML). Relevant skills include experience with VR/MR, Unreal Engine 5 (UE5), CUDA, shaders, and PyTorch."
                    },
                    {
                      title: "Metaverse Content Generation:",
                      // deadline: "April 30, 2023",
                      description: "Centered around AIGC and diffusion models, this research investigates controllable image, video, and 3D mesh generation. It requires knowledge in deep learning (DL) and machine learning (ML). Relevant skills include experience with Photoshop, ComfyUI, WebUI, and PyTorch."
                    },
                    {
                      title: "Video Analysis and Large Model Applications:",
                      // deadline: "June 1, 2023",
                      description: "With a focus on tracking, SAM, and large vision models (LVM), this direction covers live content generation, soccer commentary, and virtual geofencing. It requires knowledge in computer vision (CV) and large language models (LLM). Relevant skills include SAM, LLaVA, ChatGPT, YOLO, and C++."
                    },
                    {
                      title: "Embodied Intelligence Robots:",
                      // deadline: "June 1, 2023",
                      description: "Focused on reinforcement learning (RL) and vision-language-action (VLA) models, this research explores tasks such as large model-based household robotics and automated chemical experiments. It requires knowledge in robotics and large language models (LLM). Relevant skills include hardware development, ROS, LVM, PPO, and PyTorch."
                    }
                  ].map((position, index) => (
                    <div key={index} className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium">{position.title}</h4>
                      {/* <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4 mr-1" /> Application Deadline: {position.deadline}
                      </div> */}
                      <p className="text-sm mt-2">{position.description}</p>
                      {/* <Button className="mt-4" size="sm">
                        Apply Now <ArrowRight className="h-4 w-4 ml-1" />
                      </Button> */}
                    </div>
                  ))}
                </div>
                
                <h3 className="text-lg font-semibold mt-6">Application Process</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Review our research areas and identify potential supervisors</li>
                  <li>We have a PhD recruitment plan for next year. Students interested in direct PhD admission are encouraged to indicate this clearly in their email.</li>
                  <li>Regular PhD applicants must have top-tier publications (or submissions with reviewer comments) in CV, CG, or ML.</li>
                  <li>If you are interested in applying, please send your CV along with the research direction you are interested in to yli@cs.ecnu.edu.cn.</li>
                  <li>Selected candidates will be invited for interviews</li>
                </ol>
                
                <h3 className="text-lg font-semibold mt-6">Funding</h3>
                <p>
                  Full funding packages including tuition, stipend, and conference travel are available for qualified 
                  PhD candidates. Additional fellowship opportunities are available through the university and external sources.
                </p>
                
                {/* <div className="flex justify-center mt-6">
                  <Button className="flex items-center gap-2">
                    View All PhD Opportunities <ExternalLink className="h-4 w-4" />
                  </Button>
                </div> */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="master" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Master's Student Opportunities</CardTitle>
                <CardDescription>Full-time master's positions in our research group</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We are recruiting Master's students with strong backgrounds in relevant fields who are interested in pursuing 
                  cutting-edge research. Our Master's program typically takes 3 years to complete and includes both coursework 
                  and research components.
                </p>
                
                <h3 className="text-lg font-semibold mt-6">Current Openings</h3>
                <div className="space-y-4">
                  {[
                    {
                      title: "Next-Generation Rendering Engine:",
                      // deadline: "May 15, 2023",
                      description: "Focused on NeRF and 3D Gaussian Splatting (3DGS), this research explores virtual humans, lighting reconstruction, 3D reconstruction, and stylization of 3D scenes. It requires knowledge in computer graphics (CG) and machine learning (ML). Relevant skills include experience with VR/MR, Unreal Engine 5 (UE5), CUDA, shaders, and PyTorch."
                    },
                    {
                      title: "Metaverse Content Generation:",
                      // deadline: "April 30, 2023",
                      description: "Centered around AIGC and diffusion models, this research investigates controllable image, video, and 3D mesh generation. It requires knowledge in deep learning (DL) and machine learning (ML). Relevant skills include experience with Photoshop, ComfyUI, WebUI, and PyTorch."
                    },
                    {
                      title: "Video Analysis and Large Model Applications:",
                      // deadline: "June 1, 2023",
                      description: "With a focus on tracking, SAM, and large vision models (LVM), this direction covers live content generation, soccer commentary, and virtual geofencing. It requires knowledge in computer vision (CV) and large language models (LLM). Relevant skills include SAM, LLaVA, ChatGPT, YOLO, and C++."
                    },
                    {
                      title: "Embodied Intelligence Robots:",
                      // deadline: "June 1, 2023",
                      description: "Focused on reinforcement learning (RL) and vision-language-action (VLA) models, this research explores tasks such as large model-based household robotics and automated chemical experiments. It requires knowledge in robotics and large language models (LLM). Relevant skills include hardware development, ROS, LVM, PPO, and PyTorch."
                    }
                  ].map((position, index) => (
                    <div key={index} className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium">{position.title}</h4>
                      {/* <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4 mr-1" /> Application Deadline: {position.deadline}
                      </div> */}
                      <p className="text-sm mt-2">{position.description}</p>
                      {/* <Button className="mt-4" size="sm">
                        Apply Now <ArrowRight className="h-4 w-4 ml-1" />
                      </Button> */}
                    </div>
                  ))}
                </div>
                
                <h3 className="text-lg font-semibold mt-6">Application Process</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Review our research areas and identify potential supervisors</li>
                  {/* <li>We have a PhD recruitment plan for next year. Students interested in direct PhD admission are encouraged to indicate this clearly in their email.</li>
                  <li>Regular PhD applicants must have top-tier publications (or submissions with reviewer comments) in CV, CG, or ML.</li> */}
                  <li>If you are interested in applying, please send your CV along with the research direction you are interested in to yli@cs.ecnu.edu.cn.</li>
                  <li>Selected candidates will be invited for interviews</li>
                </ol>
                
                <h3 className="text-lg font-semibold mt-6">Funding</h3>
                <p>
                  Full funding packages including tuition, stipend, and conference travel are available for qualified 
                  Master's candidates. Additional fellowship opportunities are available through the university and external sources.
                </p>
                
                {/* <div className="flex justify-center mt-6">
                  <Button className="flex items-center gap-2">
                    View All PhD Opportunities <ExternalLink className="h-4 w-4" />
                  </Button>
                </div> */}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="postdoc" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Postdoctoral Positions</CardTitle>
                <CardDescription>Research opportunities for recent PhD graduates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Postdoctoral researchers in our group enjoy intellectual freedom to pursue innovative research directions 
                  while collaborating with faculty and students. Positions typically last 2-3 years with possibilities for extension.
                </p>
                
                <h3 className="text-lg font-semibold mt-6">Current Openings</h3>
                <div className="space-y-4">
                  {[
                    {
                      title: "Postdoctoral Researcher in Machine Learning",
                      deadline: "Open until filled",
                      description: "Developing novel ML techniques for scientific applications across disciplines."
                    },
                    {
                      title: "Postdoctoral Researcher in Biomedical Sensors",
                      deadline: "April 20, 2023",
                      description: "Research on next-generation sensing technologies for healthcare applications."
                    }
                  ].map((position, index) => (
                    <div key={index} className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium">{position.title}</h4>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4 mr-1" /> Application Deadline: {position.deadline}
                      </div>
                      <p className="text-sm mt-2">{position.description}</p>
                      <Button className="mt-4" size="sm">
                        Apply Now <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <h3 className="text-lg font-semibold mt-6">Qualifications</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>PhD in a relevant field (completed or near completion)</li>
                  <li>Strong publication record</li>
                  <li>Excellent research and communication skills</li>
                  <li>Ability to work independently and as part of a team</li>
                </ul>
                
                <h3 className="text-lg font-semibold mt-6">How to Apply</h3>
                <p>
                  Please submit your application including CV, research statement, representative publications, and 
                  contact information for three references to the specific position posting or to our general 
                  postdoctoral application portal.
                </p>
                
                <div className="flex justify-center mt-6">
                  <Button className="flex items-center gap-2">
                    View All Postdoc Opportunities <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="visiting" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Visiting Researchers</CardTitle>
                <CardDescription>Short-term research collaborations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We welcome visiting researchers, faculty members, and scholars who wish to collaborate with our group 
                  for periods ranging from a few weeks to a year. These visits provide opportunities for knowledge exchange 
                  and establishment of long-term collaborations.
                </p>
                
                <h3 className="text-lg font-semibold mt-6">Visiting Scholar Program</h3>
                <p>
                  Our visiting scholar program supports researchers who wish to spend time in our lab collaborating on 
                  specific projects. We provide workspace, access to facilities, and integration with our research community.
                </p>
                
                <h3 className="text-lg font-semibold mt-6">Application Process</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Identify a faculty member whose research aligns with your interests</li>
                  <li>Reach out to discuss potential collaboration opportunities</li>
                  <li>Prepare a short proposal outlining the purpose and expected outcomes of your visit</li>
                  <li>Submit formal application materials</li>
                </ol>
                
                <h3 className="text-lg font-semibold mt-6">Funding</h3>
                <p>
                  Visiting researchers are expected to secure their own funding for travel and living expenses. 
                  In some cases, partial support may be available through our research grants or university 
                  international visitor programs.
                </p>
                
                <div className="flex justify-center mt-6">
                  <Button className="flex items-center gap-2">
                    Learn More About Visiting Opportunities <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="undergrad" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Undergraduate Research</CardTitle>
                <CardDescription>Opportunities for undergraduate students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We offer various opportunities for undergraduate students to gain research experience through 
                  independent studies, summer research programs, and honors thesis projects. These experiences provide 
                  valuable skills and preparation for graduate studies or industry careers.
                </p>
                
                <h3 className="text-lg font-semibold mt-6">Available Programs</h3>
                <div className="space-y-4">
                  {[
                    {
                      title: "Next-Generation Rendering Engine:",
                      // deadline: "May 15, 2023",
                      description: "Focused on NeRF and 3D Gaussian Splatting (3DGS), this research explores virtual humans, lighting reconstruction, 3D reconstruction, and stylization of 3D scenes. It requires knowledge in computer graphics (CG) and machine learning (ML). Relevant skills include experience with VR/MR, Unreal Engine 5 (UE5), CUDA, shaders, and PyTorch."
                    },
                    {
                      title: "Metaverse Content Generation:",
                      // deadline: "April 30, 2023",
                      description: "Centered around AIGC and diffusion models, this research investigates controllable image, video, and 3D mesh generation. It requires knowledge in deep learning (DL) and machine learning (ML). Relevant skills include experience with Photoshop, ComfyUI, WebUI, and PyTorch."
                    },
                    {
                      title: "Video Analysis and Large Model Applications:",
                      // deadline: "June 1, 2023",
                      description: "With a focus on tracking, SAM, and large vision models (LVM), this direction covers live content generation, soccer commentary, and virtual geofencing. It requires knowledge in computer vision (CV) and large language models (LLM). Relevant skills include SAM, LLaVA, ChatGPT, YOLO, and C++."
                    },
                    {
                      title: "Embodied Intelligence Robots:",
                      // deadline: "June 1, 2023",
                      description: "Focused on reinforcement learning (RL) and vision-language-action (VLA) models, this research explores tasks such as large model-based household robotics and automated chemical experiments. It requires knowledge in robotics and large language models (LLM). Relevant skills include hardware development, ROS, LVM, PPO, and PyTorch."
                    }
                  ].map((program, index) => (
                    <div key={index} className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium">{program.title}</h4>
                      {/* <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4 mr-1" /> Application Deadline: {program.deadline}
                      </div> */}
                      <p className="text-sm mt-2">{program.description}</p>
                      {/* <Button className="mt-4" size="sm">
                        Learn More <ArrowRight className="h-4 w-4 ml-1" />
                      </Button> */}
                    </div>
                  ))}
                </div>
                
                <h3 className="text-lg font-semibold mt-6">Application Process</h3>
                <ol className="list-decimal list-inside space-y-2">
                  If you're interested in joining one of our research projects, feel free to send an email or drop by the office. Please be prepared to briefly introduce yourself, including relevant coursework or project experience.
                </ol>

                <h3 className="text-lg font-semibold mt-6">Eligibility</h3>
                <p>
                  Undergraduate research opportunities are open to students in relevant majors with strong academic 
                  performance. Specific requirements vary by program, but enthusiasm for research and willingness to 
                  learn are essential.
                </p>
                
                {/* <div className="flex justify-center mt-6">
                  <Button className="flex items-center gap-2">
                    Explore Undergraduate Opportunities <ExternalLink className="h-4 w-4" />
                  </Button>
                </div> */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <section className="max-w-3xl mx-auto fade-in-content" style={{ animationDelay: "300ms" }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" /> Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                question: "What qualifications do I need to apply for a PhD position?",
                answer: "Typically, candidates need a master's degree in a relevant field, although exceptional candidates with a bachelor's degree may be considered. Strong academic performance, research experience, and alignment with our research areas are important."
              },
              {
                question: "Is funding available for PhD students?",
                answer: "Yes, full funding packages including tuition, stipend, and conference travel are available for qualified PhD candidates. Additional fellowship opportunities may be available."
              },
              {
                question: "Can I join as a visiting researcher for a short period?",
                answer: "Yes, we welcome visiting researchers for periods ranging from a few weeks to a year. Please contact the relevant faculty member to discuss possibilities."
              },
              {
                question: "Are there opportunities for remote collaboration?",
                answer: "While most positions require physical presence in our lab, we do engage in remote collaborations with researchers at other institutions. Contact us to discuss specific arrangements."
              },
              {
                question: "How competitive are the positions in your group?",
                answer: "Our positions are competitive, but we evaluate candidates holistically based on their background, skills, research interests, and potential fit with our group. We encourage interested candidates to apply even if they're uncertain about their qualifications."
              }
            ].map((faq, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-medium">{faq.question}</h4>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Join;
