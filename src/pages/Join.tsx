import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Bookmark,
  Compass,
  ExternalLink,
  GraduationCap,
  Heart,
  Laptop,
  Lightbulb,
  Mail,
  Sparkles,
  CheckCircle2,
  Link as LinkIcon,
  FileText,
  MapPin,
  Rocket,
  Target,
  Users,
  Workflow,
} from "lucide-react";

const APPLICATION_EMAIL = "talents.vpx@gmail.com";
const APPLICATION_SUBJECT =
  "[VPX Application][Category][Research Track][Remote/On-site] Name – Institution";
const APPLICATION_MAILTO = `mailto:${APPLICATION_EMAIL}?subject=${encodeURIComponent(
  APPLICATION_SUBJECT,
)}`;
const LAST_UPDATED = "August 2026";
const ZULIP_INVITE =
  "https://vpx-ecnu.zulipchat.com/join/hskqkiyqkq4z537uzxcfhbqp/";
const LAB_ADDRESS = "Science Building, East China Normal University, 3663 Zhongshan North Road, Putuo District, Shanghai";
const LAB_LAT = 31.227861;
const LAB_LNG = 121.403694;
const LAB_MAP_LINK =
  `https://www.google.com/maps/search/?api=1&query=${LAB_LAT},${LAB_LNG}`;
const LAB_MAP_EMBED =
  `https://www.google.com/maps?q=${LAB_LAT},${LAB_LNG}(Science%20Building)&z=19&output=embed`;

const memberBenefits = [
  {
    icon: Lightbulb,
    title: "Idea-Rich, Structured Research Mentorship",
    description:
      "Work with a rich pool of original, mechanism-driven research ideas, with structured guidance in problem formulation, experimentation, engineering, and academic writing.",
  },
  {
    icon: Workflow,
    title: "End-to-End Research Training",
    description:
      "Learn the full research process, from defining a problem and analyzing mechanisms to prototyping, rigorous evaluation, and communicating results.",
  },
  {
    icon: Compass,
    title: "Frontier and Interdisciplinary Research",
    description:
      "Explore open questions across temporal, spatial, generative, and physical AI, where different fields and methods meet.",
  },
  {
    icon: Rocket,
    title: "Research with Real-World Impact",
    description:
      "Pursue strong academic contributions while validating ideas through systems, applications, and real-world research problems.",
  },
  {
    icon: GraduationCap,
    title: "Growth toward Research Independence",
    description:
      "Progress from structured onboarding to developing your own research judgment, original ideas, and the ability to lead projects independently.",
  },
  {
    icon: Users,
    title: "Like-Minded Peers and a Shared Mission",
    description:
      "Build lasting friendships with curious, ambitious peers and contribute together to human-centered AGI that benefits people and society.",
  },
];

const coreValues = [
  {
    icon: Sparkles,
    title: "Create with Originality",
    description:
      "We believe breakthroughs begin with original questions and ideas. We cross disciplinary boundaries, challenge assumptions, and combine perspectives from vision, graphics, generative models, robotics, and beyond.",
  },
  {
    icon: Target,
    title: "Pursue Excellence",
    description:
      "Great ideas are only the beginning. We reason from mechanisms and evidence, execute with rigor, and refine our work until it can stand at the highest level and create real impact.",
  },
  {
    icon: Heart,
    title: "Stay Open and Inclusive",
    description:
      "Frontier research is uncertain, debated, and interdisciplinary. We welcome diverse perspectives and constructive disagreement, respect the people behind every idea, and pursue human-centered AI that serves people and contributes to a better society.",
  },
];

const researchTracks = [
  {
    title: "Temporal AI — VLM Perception & Reasoning",
    description:
      "Understanding people, objects, behaviors, and events as the visual world evolves over time.",
  },
  {
    title: "Spatial AI — 3D/4D World Modeling",
    description:
      "Building computable, reconstructable, and interactive representations of dynamic spaces.",
  },
  {
    title: "Generative AI — Controllable Content Creation",
    description:
      "Creating controllable and temporally consistent images, videos, 3D content, and digital humans.",
  },
  {
    title: "Physical AI — Embodied Perception & Action",
    description:
      "Enabling intelligent agents to perceive, reason, decide, and act through continuous interaction with the physical world.",
  },
];

const faqs = [
  {
    q: "What should I include in my application email?",
    a: `Use the subject format “${APPLICATION_SUBJECT}”. Include your CV, application category, intended research track, and representative projects, papers, or portfolio links. Undergraduate students@ECNU should follow the Zulip process instead of applying by email.`,
  },
  {
    q: "Do you support remote collaboration?",
    a: "Yes. VPX supports project-based remote collaboration, primarily through Remote RA opportunities. A minimum commitment of three months is expected. Research scope, weekly availability, supervision, and collaboration arrangements will be discussed individually. Formal degree programs remain subject to ECNU requirements.",
  },
  {
    q: "How are candidates evaluated?",
    a: "We look for candidates who align with VPX’s core values and have the potential to reach an exceptional level in all three: original thinking, rigorous execution that turns ideas into impact, and an open, inclusive, human-centered approach to interdisciplinary research. Role-specific eligibility requirements still apply.",
  },
  {
    q: "Will every applicant receive a reply?",
    a: "We receive an exceptionally high volume of application emails. Due to limited capacity, we may only be able to reply to candidates whose background and interests closely match our current opportunities.",
  },
];

const Join = () => {
  const [activeQr, setActiveQr] = useState<"xiaohongshu" | "douyin" | null>(null);

  return (
    <div className="relative w-full overflow-hidden bg-background text-foreground">
    
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
    <div className="absolute top-40 -left-24 h-[320px] w-[320px] rounded-full bg-cyan-500/15 blur-3xl" />
    <div className="absolute -top-40 right-24 h-[320px] w-[320px] rounded-full bg-emerald-400/15 blur-2xl" />
    <div className="absolute bottom-80 left-50 h-[320px] w-[320px] rounded-full bg-cyan-500/15 blur-3xl" />
    <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-indigo-500/15 blur-3xl" />
  </div>
  <div className="container space-y-12 px-4 py-12 md:px-6">
      {/* HERO */}
      <section className="mx-auto max-w-3xl space-y-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
          Join VPX (Visual Perception + X Group)
        </h1>
        <p className="text-muted-foreground md:text-xl">
          Collaborate, learn, and contribute to research in next-generation AI, computer vision, computer graphics, and robotic perception.
        </p>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="flex flex-col gap-3 justify-center pt-2 sm:flex-row sm:flex-wrap">
          <Button asChild variant="secondary" className="w-full gap-2 sm:w-auto">
            <a
              href="https://space.bilibili.com/487404760?spm_id_from=333.337.0.0"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              Follow on Bilibili
            </a>
          </Button>
          <Button asChild variant="secondary" className="w-full gap-2 sm:w-auto">
            <a href="https://github.com/vpx-ecnu" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              View on GitHub
            </a>
          </Button>
          <Button
            variant="secondary"
            className="w-full gap-2 sm:w-auto"
            onClick={() => setActiveQr("xiaohongshu")}
          >
            <ExternalLink className="h-4 w-4" />
            Follow on Xiaohongshu
          </Button>
          <Button
            variant="secondary"
            className="w-full gap-2 sm:w-auto"
            onClick={() => setActiveQr("douyin")}
          >
            <ExternalLink className="h-4 w-4" />
            Follow on Douyin
          </Button>
        </div>
      </section>

      {/* APPLICATION OVERVIEW */}
      <section className="mx-auto max-w-5xl space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Application by Email
                  </CardTitle>
                  <CardDescription>For PhD / Master’s / RA</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Send your CV, application category, and intended research track to:
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button asChild className="w-full gap-2 sm:w-fit">
                      <a href={APPLICATION_MAILTO}>
                        <Mail className="h-4 w-4" />
                        {APPLICATION_EMAIL}
                      </a>
                    </Button>
                    <p className="break-words text-xs">
                      Subject: {APPLICATION_SUBJECT}
                    </p>
                    <p className="text-xs">
                      Replace each bracketed placeholder with your details before sending.
                    </p>
                    <p className="text-xs">
                      Categories: PhD, Direct PhD, Master’s, On-site RA, or Remote RA.
                    </p>
                    <p className="text-xs">
                      Due to the exceptionally high volume of application emails and our limited capacity, we may only be able to reply to candidates whose background and interests closely match our current opportunities.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    What to Prepare
                  </CardTitle>
                  <CardDescription>For PhD, Master’s, and RA email applications</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2">
                    <li>CV (education, projects, publications, awards)</li>
                    <li>Application category, intended research track, and preferred working mode</li>
                    <li>Links: GitHub / personal page / portfolio (if any)</li>
                    <li>One-page research interest statement (optional but helpful)</li>
                    <li>Representative work: papers / demos / reports (required where specified below)</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ROLE-SPECIFIC TABS */}
      <section>
        <Tabs defaultValue="phd" className="w-full">
          <TabsList className="mb-8 grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0 sm:grid-cols-2 lg:grid-cols-4">
            <TabsTrigger
              value="phd"
              className="min-h-10 whitespace-normal border bg-muted/60 px-3 py-2 text-center leading-snug data-[state=active]:border-border data-[state=active]:bg-background"
            >
              PhD
            </TabsTrigger>
            <TabsTrigger
              value="master"
              className="min-h-10 whitespace-normal border bg-muted/60 px-3 py-2 text-center leading-snug data-[state=active]:border-border data-[state=active]:bg-background"
            >
              Master’s
            </TabsTrigger>
            <TabsTrigger
              value="undergrad"
              className="min-h-10 whitespace-normal border bg-muted/60 px-3 py-2 text-center leading-snug data-[state=active]:border-border data-[state=active]:bg-background"
            >
              Undergraduate
            </TabsTrigger>
            <TabsTrigger
              value="ra"
              className="min-h-10 whitespace-normal border bg-muted/60 px-3 py-2 text-center leading-snug data-[state=active]:border-border data-[state=active]:bg-background"
            >
              Research Assistant (RA)
            </TabsTrigger>
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
                  We welcome PhD applicants who aim for top-tier research impact and can demonstrate strong research maturity and execution ability. Please apply through the pathway that matches your academic background.
                </p>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                    <div>
                      <h3 className="font-semibold">PhD Applicants with a Master’s Degree</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        For applicants who already hold a Master’s degree.
                      </p>
                    </div>
                    <p className="text-sm">
                      Applicants must already hold a Master’s degree and have at least one paper accepted by or currently submitted to a CCF-A conference.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      For a paper under review, attach the submitted manuscript and state its current submission status. Reviewer comments are not required.
                    </p>
                  </div>

                  <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                    <div>
                      <h3 className="font-semibold">Direct PhD Applicants</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        For applicants entering directly from a Bachelor’s degree.
                      </p>
                    </div>
                    <p className="text-sm">
                      Applicants should demonstrate substantial research experience or an outstanding achievement in a relevant area.
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6">How to Apply</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>State “PhD” or “Direct PhD” and choose the track(s) that fit your research goal.</li>
                  <li>Email your CV, key links, and any required manuscript to {APPLICATION_EMAIL}.</li>
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
                <CardDescription>Research opportunities for Master’s students in VPX</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We are recruiting Master’s students who have solid fundamentals and strong hands-on capability. Master’s students are encouraged to build research depth through projects and paper-oriented training.
                </p>

                <h3 className="text-lg font-semibold mt-6">How to Apply</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Pick the track(s) that match your interest and skills.</li>
                  <li>Email your CV (and key links) to {APPLICATION_EMAIL}.</li>
                  <li>Shortlisted candidates will be invited to interview.</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Undergrad */}
          <TabsContent value="undergrad" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Undergraduate Research for ECNU Students</CardTitle>
                <CardDescription>For current ECNU undergraduate students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-2">
                    <LinkIcon className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-2">
                      <h3 className="font-semibold">Join AI Club and Complete the Tutorial</h3>
                      <p className="text-sm text-muted-foreground">
                        This pathway is for current ECNU undergraduate students. Before joining VPX, use the link below to join our AI Club on Zulip.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Read the Welcome guidance and complete the tutorial provided there. You do not need to send an application email.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <Button asChild className="w-full gap-2 sm:w-fit">
                          <a href={ZULIP_INVITE} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            Join via Zulip Invite Link
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">How to Get Started</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Join AI Club through the Zulip link above.</li>
                    <li>Follow the Welcome guidance and complete the tutorial.</li>
                    <li>Once finished, send the PI a direct message on Zulip with a brief introduction and what you completed.</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Research Assistant */}
          <TabsContent value="ra" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Research Assistant Opportunities</CardTitle>
                <CardDescription>Project-based on-site and remote collaboration with VPX</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-muted-foreground">
                  RA opportunities are available for candidates who want to contribute to ongoing VPX research projects. The project scope, responsibilities, and collaboration arrangements will be discussed individually.
                </p>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">On-site RA</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Work on-site with the VPX team for a minimum commitment of six months.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Compensation may be available depending on the project scope, responsibilities, and candidate fit.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Depending on the project, accommodation may be available at ECNU’s Lin-gang Campus; availability and arrangements will be discussed individually.
                    </p>
                  </div>

                  <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-2">
                      <Laptop className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Remote RA</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Join selected VPX research projects remotely for a minimum commitment of three months.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Research scope, weekly availability, supervision, and collaboration arrangements will be discussed individually.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">How to Apply</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>State whether you are applying for an On-site RA or Remote RA role and select your intended research track.</li>
                    <li>Email your CV and representative work to {APPLICATION_EMAIL}.</li>
                    <li>Include your location, time zone, earliest start date, expected duration, and weekly availability.</li>
                    <li>Shortlisted candidates will be contacted to discuss a suitable project and working arrangement.</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* VPX EXPERIENCE, VALUES, AND RESEARCH */}
      <section className="mx-auto max-w-5xl space-y-6">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-3">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              What You’ll Get at VPX
            </CardTitle>
            <CardDescription>
              Shared information for PhD, Master’s, Undergraduate, and Research Assistant applicants.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {memberBenefits.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="bg-muted/40">
                  <CardContent className="pt-6 text-center">
                    <Icon className="mx-auto mb-4 h-10 w-10 text-primary" />
                    <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold">VPX Core Values</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  These principles guide how we select, mentor, and grow our members.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {coreValues.map(({ icon: Icon, title, description }) => (
                  <Card key={title} className="bg-muted/30">
                    <CardContent className="pt-6">
                      <div className="mb-3 flex items-center gap-2">
                        <Icon className="h-5 w-5 shrink-0 text-primary" />
                        <h4 className="font-semibold">{title}</h4>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Research Tracks</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {researchTracks.map((track) => (
                  <div key={track.title} className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                      <div className="space-y-1">
                        <h4 className="font-medium">{track.title}</h4>
                        <p className="text-sm text-muted-foreground">{track.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" /> Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {faqs.map((item) => (
              <div key={item.q} className="space-y-2">
                <h4 className="font-medium">{item.q}</h4>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* LAB LOCATION */}
      <section className="mx-auto max-w-5xl">
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
            <Button asChild variant="secondary" className="w-full gap-2 sm:w-fit">
              <a href={LAB_MAP_LINK} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open in Google Maps
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Dialog open={activeQr !== null} onOpenChange={(open) => !open && setActiveQr(null)}>
        <DialogContent className="sm:max-w-md">
          <div className="rounded-md border bg-muted p-2">
            <img
              src={activeQr === "xiaohongshu" ? "/小红书.jpg" : "/抖音.jpg"}
              alt={activeQr === "xiaohongshu" ? "Xiaohongshu QR Code" : "Douyin QR Code"}
              className="mx-auto w-full h-auto max-h-[70vh] object-contain"
              loading="lazy"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
};

export default Join;
