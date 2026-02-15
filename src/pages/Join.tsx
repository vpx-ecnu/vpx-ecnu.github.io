import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  ExternalLink,
  GraduationCap,
  Users,
  Mail,
  Sparkles,
  CheckCircle2,
  Link as LinkIcon,
  FileText,
  MapPin,
} from "lucide-react";

const YLI_EMAIL = "yli@cs.ecnu.edu.cn";
const ZULIP_INVITE =
  "https://vpx-ecnu.zulipchat.com/join/hskqkiyqkq4z537uzxcfhbqp/";
const LAB_ADDRESS = "Science Building, East China Normal University, 3663 Zhongshan North Road, Putuo District, Shanghai";
const LAB_LAT = 31.227861;
const LAB_LNG = 121.403694;
const LAB_MAP_LINK =
  `https://www.google.com/maps/search/?api=1&query=${LAB_LAT},${LAB_LNG}`;
const LAB_MAP_EMBED =
  `https://www.google.com/maps?q=${LAB_LAT},${LAB_LNG}(Science%20Building)&z=19&output=embed`;

const Join = () => {
  const commonTracks = [
    {
      title: "Next-Generation Rendering Engine",
      description:
        "Focused on NeRF and 3D Gaussian Splatting (3DGS), exploring virtual humans, lighting reconstruction, 3D reconstruction, and 3D scene stylization. Helpful skills: CG/ML background, VR/MR, UE5, CUDA, shaders, PyTorch.",
    },
    {
      title: "Metaverse Content Generation",
      description:
        "Centered around AIGC and diffusion models, investigating controllable image/video generation and 3D mesh generation. Helpful skills: DL/ML background, Photoshop, ComfyUI/WebUI, PyTorch.",
    },
    {
      title: "Video Analysis and Large Model Applications",
      description:
        "Focused on tracking, SAM, and large vision models (LVM), covering live content generation, soccer commentary, and virtual geofencing. Helpful skills: SAM, LLaVA, ChatGPT, YOLO, C++.",
    },
    {
      title: "Embodied Intelligence Robots",
      description:
        "Focused on reinforcement learning (RL) and vision-language-action (VLA) models, exploring household robotics and automated chemical experiments. Helpful skills: robotics/hardware, ROS, LVM, PPO, PyTorch.",
    },
  ];

  const faqs = [
    {
      q: "What should I include in my application email?",
      a: "Please include your CV and clearly state the track(s) you’re interested in. If you have representative projects, papers, or a portfolio, add links in the email.",
    },
    {
      q: "Do you support remote collaboration?",
      a: "Most positions require in-person participation, but we do collaborate remotely in specific cases. Mention your situation in the email so we can evaluate feasibility.",
    },
    {
      q: "How are candidates evaluated?",
      a: "We evaluate candidates holistically: fundamentals, research potential, execution ability, and fit with our tracks. Strong evidence of hands-on work is a big plus.",
    },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-background text-foreground">
    
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
    <div className="absolute top-40 -left-24 h-[320px] w-[320px] rounded-full bg-cyan-500/15 blur-3xl" />
    <div className="absolute -top-40 right-24 h-[320px] w-[320px] rounded-full bg-emerald-400/15 blur-2xl" />
    <div className="absolute bottom-80 left-50 h-[320px] w-[320px] rounded-full bg-cyan-500/15 blur-3xl" />
    <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-indigo-500/15 blur-3xl" />
  </div>
  <div className="container py-12 px-4 md:px-6 space-y-12 page-transition">
      {/* HERO */}
      <section className="space-y-4 text-center max-w-3xl mx-auto fade-in-content">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter md:whitespace-nowrap">
          Join VPX (Visual Perception + X Group)
        </h1>
        <p className="text-muted-foreground md:text-xl">
          Collaborate, learn, and contribute to research in next-generation AI, computer vision, computer graphics, and robotic perception.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild variant="secondary" className="gap-2">
            <a
              href="https://space.bilibili.com/487404760?spm_id_from=333.337.0.0"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              Follow on Bilibili
            </a>
          </Button>
          <Button asChild variant="secondary" className="gap-2">
            <a href="https://github.com/vpx-ecnu" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              View on GitHub
            </a>
          </Button>
        </div>
      </section>

      {/* COMMON INFO FIRST (Shared for PhD / Master / Undergrad) */}
      <section className="max-w-5xl mx-auto space-y-6 fade-in-content" style={{ animationDelay: "80ms" }}>
        <Card className="overflow-hidden">
          <CardHeader className="space-y-3">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              What You’ll Get at VPX
            </CardTitle>
            <CardDescription>
              Shared information for PhD, Master’s, and Undergraduate applicants.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-muted/40">
                <CardContent className="pt-6 text-center">
                  <GraduationCap className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Education</h3>
                  <p className="text-sm text-muted-foreground">
                    Mentorship, reading groups, and systematic research training.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/40">
                <CardContent className="pt-6 text-center">
                  <BookOpen className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Research</h3>
                  <p className="text-sm text-muted-foreground">
                    Meaningful projects with strong engineering + academic rigor.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/40">
                <CardContent className="pt-6 text-center">
                  <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Community</h3>
                  <p className="text-sm text-muted-foreground">
                    A collaborative team culture and frequent technical sharing.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Research Tracks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {commonTracks.map((t, idx) => (
                  <div key={idx} className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-medium">{t.title}</h4>
                        <p className="text-sm text-muted-foreground">{t.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Unified Application Method
                  </CardTitle>
                  <CardDescription>For PhD / Master’s / Undergraduate</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Send your CV and the track(s) you’re interested in to:
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button asChild className="gap-2 w-fit">
                      <a href={`mailto:${YLI_EMAIL}`}>
                        <Mail className="h-4 w-4" />
                        {YLI_EMAIL}
                      </a>
                    </Button>
                    <p className="text-xs">
                      Tip: Use a clear subject line like “Application – Master’s – Video Analysis”.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30 lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    What to Prepare
                  </CardTitle>
                  <CardDescription>Recommended materials to speed up evaluation</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2">
                    <li>CV (education, projects, publications, awards)</li>
                    <li>Links: GitHub / personal page / portfolio (if any)</li>
                    <li>One-page research interest statement (optional but helpful)</li>
                    <li>Representative work: papers / demos / reports (optional)</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ROLE-SPECIFIC TABS */}
      <section className="fade-in-content" style={{ animationDelay: "160ms" }}>
        <Tabs defaultValue="phd" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="phd">PhD</TabsTrigger>
            <TabsTrigger value="master">Master’s</TabsTrigger>
            <TabsTrigger value="undergrad">Undergraduate</TabsTrigger>
          </TabsList>

          {/* PhD */}
          <TabsContent value="phd" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>PhD Student Opportunities</CardTitle>
                <CardDescription>Doctoral positions in VPX</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We welcome PhD applicants who aim for top-tier research impact and can demonstrate strong research maturity and execution ability.
                </p>

                <h3 className="text-lg font-semibold mt-6">Additional Requirement (PhD)</h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-sm">
                    Applicants are expected to have{" "}
                    <span className="font-medium">A-class computer science conference papers</span>{" "}
                    (e.g., top-tier venues in CV/CG/ML), or equivalent research outputs.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    If your paper is under review, include the submission status and (if available) reviewer feedback.
                  </p>
                </div>

                <h3 className="text-lg font-semibold mt-6">How to Apply</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Pick the track(s) that fit your research goal.</li>
                  <li>Email your CV (and key links) to {YLI_EMAIL}.</li>
                  <li>Shortlisted candidates will be invited to interview.</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Master */}
          <TabsContent value="master" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Master’s Student Opportunities</CardTitle>
                <CardDescription>Full-time Master’s positions in VPX</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We are recruiting Master’s students who have solid fundamentals and strong hands-on capability. Master’s students are encouraged to build research depth through projects and paper-oriented training.
                </p>

                <h3 className="text-lg font-semibold mt-6">How to Apply</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Pick the track(s) that match your interest and skills.</li>
                  <li>Email your CV (and key links) to {YLI_EMAIL}.</li>
                  <li>Shortlisted candidates will be invited to interview.</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Undergrad */}
          <TabsContent value="undergrad" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Undergraduate Research</CardTitle>
                <CardDescription>Start your AI research journey with structured onboarding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-2">
                    <LinkIcon className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-2">
                      <h3 className="font-semibold">Join AI Club First (Required)</h3>
                      <p className="text-sm text-muted-foreground">
                        Hi everyone—before joining VPX-Lab, please use the link below to join our AI Club.
                        We hope this can become your starting point to get closer to artificial intelligence,
                        participate in research projects, and ultimately grow into a true AI expert.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        We’re currently designing AI Club tutorial materials and a set of small tasks—stay tuned.
                        If you can complete the corresponding tasks, you’ll have a chance to join VPX-Lab!
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <Button asChild className="gap-2 w-fit">
                          <a href={ZULIP_INVITE} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            Join via Zulip Invite Link
                          </a>
                        </Button>
                        {/* <Button asChild variant="secondary" className="gap-2 w-fit">
                          <a href={`mailto:${YLI_EMAIL}`}>
                            <Mail className="h-4 w-4" />
                            Email CV to Apply
                          </a>
                        </Button> */}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">How to Apply</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Join AI Club via the Zulip link above.</li>
                    <li>Prepare a brief self-introduction + CV (projects/coursework are great).</li>
                    <li>Email your CV and intended track(s) to {YLI_EMAIL}.</li>
                    <li>We will contact shortlisted students for the next steps.</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto fade-in-content" style={{ animationDelay: "240ms" }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" /> Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {faqs.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="font-medium">{item.q}</h4>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* BOTTOM CTA */}
      {/* <section className="text-center fade-in-content" style={{ animationDelay: "300ms" }}>
        <Card className="max-w-3xl mx-auto bg-muted/30">
          <CardContent className="py-8 space-y-3">
            <h3 className="text-xl font-semibold">Ready to Apply?</h3>
            <p className="text-sm text-muted-foreground">
              Email your CV and your preferred track(s). We’ll get back to you if there’s a strong match.
            </p>
            <div className="flex justify-center">
              <Button asChild className="gap-2">
                <a href={`mailto:${YLI_EMAIL}`}>
                  Apply via Email <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section> */}

      {/* LAB LOCATION */}
      <section className="max-w-5xl mx-auto fade-in-content" style={{ animationDelay: "300ms" }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Lab Location
            </CardTitle>
            <CardDescription>
              Our lab is based at ECNU (Putuo Campus), Shanghai.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {LAB_ADDRESS}
            </p>
            <div className="overflow-hidden rounded-lg border bg-muted">
              <iframe
                title="VPX Lab Location Map"
                src={LAB_MAP_EMBED}
                className="h-64 w-full md:h-72"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <Button asChild variant="secondary" className="gap-2 w-fit">
              <a href={LAB_MAP_LINK} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open in Google Maps
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
    </div>
  );
};

export default Join;
