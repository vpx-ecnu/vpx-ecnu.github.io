import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { coreValues, researchTracks } from "@/data/researchIdentity";
import { useLocale } from "@/i18n/locale";
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
const LAST_UPDATED = "September 2026";
const LAST_UPDATED_ZH = "2026年9月";
const ZULIP_INVITE =
  "https://vpx-ecnu.zulipchat.com/join/hskqkiyqkq4z537uzxcfhbqp/";
const LAB_ADDRESS =
  "School of International Chinese Studies, East China Normal University, No. 3663 North Zhongshan Road, Putuo District, Shanghai 200062, China";
const LAB_ADDRESS_ZH =
  "中国上海市普陀区中山北路3663号，华东师范大学对外汉语学院，邮编 200062";
const LAB_LAT = 31.222083;
const LAB_LNG = 121.403611;
const LAB_MAP_LINK =
  `https://www.google.com/maps/search/?api=1&query=${LAB_LAT},${LAB_LNG}`;
const LAB_MAP_EMBED =
  `https://www.google.com/maps?q=${LAB_LAT},${LAB_LNG}(School%20of%20International%20Chinese%20Studies)&z=19&output=embed`;

const memberBenefits = [
  {
    icon: Lightbulb,
    title: "Idea-Rich, Structured Research Mentorship",
    titleZh: "充满想法的系统科研指导",
    description:
      "Explore a broad range of original, mechanism-driven research ideas through structured guidance in problem formulation, experimentation, engineering, and academic writing.",
    descriptionZh:
      "在问题定义、实验设计、工程实现和学术写作的系统指导下，探索丰富而原创、注重机制思考的研究想法。",
  },
  {
    icon: Workflow,
    title: "End-to-End Research Training",
    titleZh: "端到端科研训练",
    description:
      "Learn the full research process, from defining a problem and analyzing mechanisms to prototyping, rigorous evaluation, and communicating results.",
    descriptionZh:
      "学习完整的科研流程：从定义问题、分析机制，到原型实现、严谨评测和清晰表达研究成果。",
  },
  {
    icon: Compass,
    title: "Frontier and Interdisciplinary Research",
    titleZh: "前沿与跨学科研究",
    description:
      "Explore open questions across temporal, spatial, generative, and physical AI, where different fields and methods meet.",
    descriptionZh:
      "探索时序、空间、生成与物理智能中的开放问题，在不同领域与方法的交汇处寻找突破。",
  },
  {
    icon: Rocket,
    title: "Research with Real-World Impact",
    titleZh: "面向真实影响力的研究",
    description:
      "Pursue strong academic contributions while validating ideas through systems, applications, and real-world research problems.",
    descriptionZh:
      "追求有分量的学术贡献，并通过系统、应用与真实研究问题检验想法的价值。",
  },
  {
    icon: GraduationCap,
    title: "Growth toward Research Independence",
    titleZh: "走向独立研究",
    description:
      "Progress from structured onboarding to developing your own research judgment, original ideas, and the ability to lead projects independently.",
    descriptionZh:
      "从系统入门逐步形成自己的科研判断、原创想法，以及独立推动研究项目的能力。",
  },
  {
    icon: Users,
    title: "Research Community and Shared Purpose",
    titleZh: "志同道合的伙伴与共同使命",
    description:
      "Connect with curious, ambitious peers and work together toward human-centered AGI that benefits people and society.",
    descriptionZh:
      "结识充满好奇心与进取心的同行者，共同推动以人为本、造福人类与社会的 AGI。",
  },
];

const coreValueIcons = [Sparkles, Target, Heart] as const;

const faqs = [
  {
    q: "What should I include in my application email?",
    qZh: "申请邮件中需要包含哪些内容？",
    a: `Use the subject format “${APPLICATION_SUBJECT}”. Include your CV, application category, intended research track, and representative projects, papers, or portfolio links. Current ECNU undergraduate students should follow the Zulip process instead of applying by email. Undergraduate students at other institutions may apply for Remote RA opportunities by email.`,
    aZh: `请使用邮件主题格式“${APPLICATION_SUBJECT}”。邮件中应包含个人简历、申请类别、意向研究方向，以及代表性项目、论文或作品集链接。华东师范大学在读本科生请按照 Zulip 流程参与，无需发送申请邮件；其他高校的本科生可以通过邮件申请 Remote RA。`,
  },
  {
    q: "Do you support remote collaboration?",
    qZh: "是否支持远程合作？",
    a: "Yes. VPX supports project-based remote collaboration, primarily through Remote RA opportunities. A minimum commitment of three months is expected. Research scope, weekly availability, supervision, and collaboration arrangements will be discussed individually. Formal degree programs remain subject to ECNU requirements.",
    aZh:
      "支持。VPX 可通过 Remote RA 等方式开展以项目为基础的远程合作，原则上至少投入三个月。研究范围、每周可投入时间、指导方式与合作安排将根据具体情况沟通；正式学位项目仍须遵循华东师范大学的相关要求。",
  },
  {
    q: "How are candidates evaluated?",
    qZh: "我们如何评估申请者？",
    a: "We look for candidates who share VPX’s core values and show strong potential in all three areas: original thinking, rigorous execution that turns ideas into impact, and open, inclusive collaboration toward human-centered AGI. Role-specific eligibility requirements still apply.",
    aZh:
      "我们寻找认同 VPX 核心价值观，并有潜力在三个方面取得突破的候选人：能够原创思考，能够通过严谨执行将想法转化为影响力，并能以开放、包容的方式协作，共同推动以人为本的 AGI。同时，各类岗位的具体申请门槛仍然适用。",
  },
  {
    q: "Will every applicant receive a reply?",
    qZh: "每位申请者都会收到回复吗？",
    a: "We receive a large number of application emails and have limited capacity. We may therefore only be able to reply to candidates whose background and interests closely match our current opportunities.",
    aZh:
      "我们收到的申请邮件数量非常多，而可投入的评估精力有限，因此可能只能回复背景与研究兴趣高度匹配当前机会的候选人。",
  },
];

type LocalizedResearchItem = {
  title: string;
  description: string;
  titleZh?: string;
  descriptionZh?: string;
};

const Join = () => {
  const { isZh } = useLocale();
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
          {isZh ? "加入 VPX（Visual Perception + X Group）" : "Join VPX (Visual Perception + X Group)"}
        </h1>
        <p className="text-muted-foreground md:text-xl">
          {isZh
            ? "与我们一起协作、学习和探索，从视觉感知、生成模型到具身系统，共同迈向以人为本的 AGI。"
            : "Collaborate, learn, and contribute to research across visual perception, generative models, and embodied systems on the path toward human-centered AGI."}
        </p>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {isZh ? `最后更新：${LAST_UPDATED_ZH}` : `Last updated: ${LAST_UPDATED}`}
        </p>

        <div className="flex flex-col gap-3 justify-center pt-2 sm:flex-row sm:flex-wrap">
          <Button asChild variant="secondary" className="w-full gap-2 sm:w-auto">
            <a
              href="https://space.bilibili.com/487404760?spm_id_from=333.337.0.0"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              {isZh ? "关注哔哩哔哩" : "Follow on Bilibili"}
            </a>
          </Button>
          <Button asChild variant="secondary" className="w-full gap-2 sm:w-auto">
            <a href="https://github.com/vpx-ecnu" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              {isZh ? "查看 GitHub" : "View on GitHub"}
            </a>
          </Button>
          <Button
            variant="secondary"
            className="w-full gap-2 sm:w-auto"
            onClick={() => setActiveQr("xiaohongshu")}
          >
            <ExternalLink className="h-4 w-4" />
            {isZh ? "关注小红书" : "Follow on Xiaohongshu"}
          </Button>
          <Button
            variant="secondary"
            className="w-full gap-2 sm:w-auto"
            onClick={() => setActiveQr("douyin")}
          >
            <ExternalLink className="h-4 w-4" />
            {isZh ? "关注抖音" : "Follow on Douyin"}
          </Button>
        </div>
      </section>

      {/* APPLICATION OVERVIEW */}
      <section className="mx-auto max-w-5xl space-y-6">
        <h2 className="sr-only">{isZh ? "申请概览" : "Application Overview"}</h2>
        <Card className="overflow-hidden">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    {isZh ? "邮件申请" : "Application by Email"}
                  </CardTitle>
                  <CardDescription>
                    {isZh ? "适用于博士 / 硕士 / RA 申请" : "For PhD / Master’s / RA"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    {isZh
                      ? "请将个人简历、申请类别和意向研究方向发送至："
                      : "Send your CV, application category, and intended research track to:"}
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button asChild className="w-full gap-2 sm:w-fit">
                      <a href={APPLICATION_MAILTO}>
                        <Mail className="h-4 w-4" />
                        {APPLICATION_EMAIL}
                      </a>
                    </Button>
                    <p className="break-words text-xs">
                      {isZh ? "邮件主题：" : "Subject: "}{APPLICATION_SUBJECT}
                    </p>
                    <p className="text-xs">
                      {isZh
                        ? "发送前，请将方括号内的每一项占位内容替换为你的实际信息。"
                        : "Replace each bracketed placeholder with your details before sending."}
                    </p>
                    <p className="text-xs">
                      {isZh
                        ? "申请类别：硕士起点博士、直博（本科起点）、硕士、线下 RA 或 Remote RA。"
                        : "Categories: Master’s-entry PhD, Direct-entry PhD (Bachelor’s Entry), Master’s, On-site RA, or Remote RA."}
                    </p>
                    <p className="text-xs">
                      {isZh
                        ? "由于申请邮件数量非常多，而我们的评估精力有限，可能只能回复背景与研究兴趣高度匹配当前机会的候选人。"
                        : "Due to the large number of application emails and our limited capacity, we may only be able to reply to candidates whose background and interests closely match our current opportunities."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    {isZh ? "申请材料" : "What to Prepare"}
                  </CardTitle>
                  <CardDescription>
                    {isZh
                      ? "适用于博士、硕士和 RA 的邮件申请"
                      : "For PhD, Master’s, and RA email applications"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2">
                    <li>{isZh ? "个人简历（教育经历、项目、论文、奖项）" : "CV (education, projects, publications, awards)"}</li>
                    <li>{isZh ? "申请类别和意向研究方向" : "Application category and intended research track"}</li>
                    <li>{isZh ? "RA 申请者：期望的工作方式与可投入时间" : "For RA applicants: preferred working mode and availability"}</li>
                    <li>{isZh ? "GitHub、个人主页或作品集链接（如有）" : "Links: GitHub / personal page / portfolio (if any)"}</li>
                    <li>{isZh ? "一页研究兴趣陈述（非必需，但建议提供）" : "One-page research interest statement (optional but helpful)"}</li>
                    <li>{isZh ? "代表性成果：论文、演示或报告（下文注明必需时须提供）" : "Representative work: papers / demos / reports (required where specified below)"}</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ROLE-SPECIFIC TABS */}
      <section>
        <h2 className="sr-only">{isZh ? "各类别机会" : "Opportunities by Role"}</h2>
        <Tabs defaultValue="phd" className="w-full">
          <TabsList className="mb-8 grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0 sm:grid-cols-2 lg:grid-cols-4">
            <TabsTrigger
              value="phd"
              className="min-h-10 whitespace-normal border bg-muted/60 px-3 py-2 text-center leading-snug data-[state=active]:border-border data-[state=active]:bg-background"
            >
              {isZh ? "博士" : "PhD"}
            </TabsTrigger>
            <TabsTrigger
              value="master"
              className="min-h-10 whitespace-normal border bg-muted/60 px-3 py-2 text-center leading-snug data-[state=active]:border-border data-[state=active]:bg-background"
            >
              {isZh ? "硕士" : "Master’s"}
            </TabsTrigger>
            <TabsTrigger
              value="undergrad"
              className="min-h-10 whitespace-normal border bg-muted/60 px-3 py-2 text-center leading-snug data-[state=active]:border-border data-[state=active]:bg-background"
            >
              {isZh ? "本科生" : "Undergraduate"}
            </TabsTrigger>
            <TabsTrigger
              value="ra"
              className="min-h-10 whitespace-normal border bg-muted/60 px-3 py-2 text-center leading-snug data-[state=active]:border-border data-[state=active]:bg-background"
            >
              {isZh ? "研究助理（RA）" : "Research Assistant (RA)"}
            </TabsTrigger>
          </TabsList>

          {/* PhD */}
          <TabsContent value="phd" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>{isZh ? "博士生招生" : "PhD Student Opportunities"}</CardTitle>
                <CardDescription>
                  {isZh ? "VPX 博士阶段研究机会" : "Doctoral research opportunities at VPX"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {isZh
                    ? "我们欢迎以产生顶尖研究影响为目标，并能展现较强科研成熟度与执行能力的博士申请者。请根据自己的学术背景选择相应的申请类型。"
                    : "We welcome PhD applicants who aim for top-tier research impact and can demonstrate strong research maturity and execution ability. Please apply through the pathway that matches your academic background."}
                </p>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                    <div>
                      <h4 className="font-semibold">
                        {isZh ? "硕士起点博士（Master’s-entry PhD）" : "Master’s-entry PhD"}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {isZh
                          ? "适用于已经取得硕士学位的申请者。"
                          : "For applicants who already hold a Master’s degree."}
                      </p>
                    </div>
                    <p className="text-sm">
                      {isZh
                        ? "申请者须已取得硕士学位，并至少有一篇论文被 CCF A 类会议或期刊录用。"
                        : "Applicants must already hold a Master’s degree and have at least one paper accepted by a CCF Category A venue."}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isZh
                        ? "申请时请附上已录用论文或其链接。"
                        : "Include the accepted paper or a link to it with your application."}
                    </p>
                  </div>

                  <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                    <div>
                      <h4 className="font-semibold">
                        {isZh
                          ? "直博（本科起点，Direct-entry PhD）"
                          : "Direct-entry PhD (Bachelor’s Entry)"}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {isZh
                          ? "适用于本科毕业后直接攻读博士学位的申请者。"
                          : "For applicants entering directly from a Bachelor’s degree."}
                      </p>
                    </div>
                    <p className="text-sm">
                      {isZh
                        ? "申请者须有至少一次向 CCF A 类会议或期刊投稿研究论文的经历，论文不要求已经录用；同时应具备较为丰富的科研经验，或在相关方向取得突出的成果。"
                        : "Applicants must have experience submitting at least one research paper to a CCF Category A venue. Acceptance is not required. They should also demonstrate substantial research experience or an outstanding achievement in a relevant area."}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isZh
                        ? "请附上投稿论文，并注明投稿会议或期刊及当前状态；无需提供审稿意见。"
                        : "Include the submitted manuscript and identify the venue and submission status. Reviewer comments are not required."}
                    </p>
                  </div>
                </div>

                <h4 className="text-lg font-semibold mt-6">
                  {isZh ? "如何申请" : "How to Apply"}
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    {isZh
                      ? "请注明申请“Master’s-entry PhD”或“Direct-entry PhD (Bachelor’s Entry)”，并选择与你研究目标匹配的方向。"
                      : "State “Master’s-entry PhD” or “Direct-entry PhD (Bachelor’s Entry)” and choose the track(s) that fit your research goal."}
                  </li>
                  <li>
                    {isZh ? "将个人简历、关键链接及规定的论文材料发送至" : "Email your CV, key links, and any required manuscript to"}{" "}
                    {APPLICATION_EMAIL}{isZh ? "。" : "."}
                  </li>
                  <li>{isZh ? "通过初筛的候选人将收到面试邀请。" : "Shortlisted candidates will be invited to interview."}</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Master */}
          <TabsContent value="master" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>{isZh ? "硕士生科研机会" : "Master’s Student Opportunities"}</CardTitle>
                <CardDescription>
                  {isZh ? "面向 VPX 硕士生的研究机会" : "Research opportunities for Master’s students in VPX"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {isZh
                    ? "我们欢迎基础扎实、动手能力强的硕士生申请。你可以通过科研项目和面向论文产出的训练，逐步建立研究深度。"
                    : "We welcome applications from Master’s students with solid fundamentals and strong hands-on skills. Students can build research depth through projects and publication-oriented training."}
                </p>

                <h4 className="text-lg font-semibold mt-6">
                  {isZh ? "如何申请" : "How to Apply"}
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>{isZh ? "选择与你的兴趣和能力匹配的研究方向。" : "Pick the track(s) that match your interest and skills."}</li>
                  <li>
                    {isZh ? "将个人简历（以及关键链接）发送至" : "Email your CV (and key links) to"}{" "}
                    {APPLICATION_EMAIL}{isZh ? "。" : "."}
                  </li>
                  <li>{isZh ? "通过初筛的候选人将收到面试邀请。" : "Shortlisted candidates will be invited to interview."}</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Undergrad */}
          <TabsContent value="undergrad" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isZh ? "面向华东师范大学本科生的科研机会" : "Undergraduate Research for ECNU Students"}
                </CardTitle>
                <CardDescription>
                  {isZh ? "适用于华东师范大学在读本科生" : "For current ECNU undergraduate students"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-2">
                    <LinkIcon className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-semibold">
                        {isZh ? "加入 AI Club 并完成教程" : "Join AI Club and Complete the Tutorial"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isZh
                          ? "这一参与方式面向华东师范大学在读本科生。加入 VPX 前，请通过下方链接加入我们在 Zulip 上的 AI Club。"
                          : "This pathway is for current ECNU undergraduate students. Before joining VPX, use the link below to join our AI Club on Zulip."}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isZh
                          ? "请阅读其中的 Welcome 指引并完成相应教程，无需发送申请邮件。"
                          : "Read the Welcome guidance and complete the tutorial provided there. You do not need to send an application email."}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <Button asChild className="w-full gap-2 sm:w-fit">
                          <a href={ZULIP_INVITE} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            {isZh ? "通过邀请链接加入 Zulip" : "Join via Zulip Invite Link"}
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-semibold">
                    {isZh ? "如何开始" : "How to Get Started"}
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>{isZh ? "通过上方 Zulip 链接加入 AI Club。" : "Join AI Club through the Zulip link above."}</li>
                    <li>{isZh ? "按照 Welcome 指引完成教程。" : "Follow the Welcome guidance and complete the tutorial."}</li>
                    <li>
                      {isZh
                        ? "完成后，在 Zulip 上私信李扬老师，简要介绍自己并说明已完成的内容。"
                        : "Once finished, send Professor Yang Li a direct message on Zulip with a brief introduction and what you completed."}
                    </li>
                  </ol>
                  <p className="text-sm text-muted-foreground">
                    {isZh
                      ? "其他高校的本科生可以改为通过邮件申请 Remote RA。"
                      : "Undergraduate students at other institutions may apply for Remote RA opportunities by email instead."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Research Assistant */}
          <TabsContent value="ra" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>{isZh ? "研究助理机会" : "Research Assistant Opportunities"}</CardTitle>
                <CardDescription>
                  {isZh
                    ? "以项目为基础，与 VPX 开展线下或远程合作"
                    : "Project-based on-site and remote collaboration with VPX"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-muted-foreground">
                  {isZh
                    ? "RA 机会面向希望参与 VPX 在研项目的候选人。项目范围、具体职责和合作方式将根据实际情况单独沟通。"
                    : "RA opportunities are available for candidates who want to contribute to ongoing VPX research projects. The project scope, responsibilities, and collaboration arrangements will be discussed individually."}
                </p>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">{isZh ? "线下 RA" : "On-site RA"}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isZh
                        ? "与 VPX 团队开展线下合作，原则上至少投入六个月。"
                        : "Work on-site with the VPX team for a minimum commitment of six months."}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isZh
                        ? "根据项目范围、具体职责和候选人的匹配情况，可能提供相应薪酬。"
                        : "Compensation may be available depending on the project scope, responsibilities, and candidate fit."}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isZh
                        ? "根据具体项目，可能提供位于华东师范大学临港校区的住宿；实际名额和安排需单独沟通。"
                        : "Depending on the project, accommodation may be available at ECNU’s Lin-gang Campus; availability and arrangements will be discussed individually."}
                    </p>
                  </div>

                  <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-2">
                      <Laptop className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">{isZh ? "远程 RA" : "Remote RA"}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isZh
                        ? "远程参与指定的 VPX 研究项目，原则上至少投入三个月。"
                        : "Join selected VPX research projects remotely for a minimum commitment of three months."}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isZh
                        ? "研究范围、每周可投入时间、指导方式与合作安排将根据具体情况沟通。"
                        : "Research scope, weekly availability, supervision, and collaboration arrangements will be discussed individually."}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-semibold">
                    {isZh ? "如何申请" : "How to Apply"}
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>
                      {isZh
                        ? "请注明申请线下 RA 还是 Remote RA，并选择意向研究方向。"
                        : "State whether you are applying for an On-site RA or Remote RA role and select your intended research track."}
                    </li>
                    <li>
                      {isZh ? "将个人简历与代表性成果发送至" : "Email your CV and representative work to"}{" "}
                      {APPLICATION_EMAIL}{isZh ? "。" : "."}
                    </li>
                    <li>
                      {isZh
                        ? "请注明所在地、时区、最早开始日期、预计参与时长以及每周可投入时间。"
                        : "Include your location, time zone, earliest start date, expected duration, and weekly availability."}
                    </li>
                    <li>
                      {isZh
                        ? "我们将联系通过初筛的候选人，共同讨论合适的项目与合作方式。"
                        : "Shortlisted candidates will be contacted to discuss a suitable project and working arrangement."}
                    </li>
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
            <h2 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight">
              <Sparkles className="h-5 w-5 text-primary" />
              {isZh ? "你将在 VPX 获得什么" : "What You’ll Get at VPX"}
            </h2>
            <CardDescription>
              {isZh
                ? "以下内容适用于所有希望加入 VPX 的伙伴；具体机会和指导方式会因申请类别与项目而有所不同。"
                : "Shared information for prospective VPX members. Specific opportunities and guidance vary by role and project."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {memberBenefits.map(({ icon: Icon, title, titleZh, description, descriptionZh }) => (
                <Card key={title} className="bg-muted/40">
                  <CardContent className="pt-6 text-center">
                    <Icon className="mx-auto mb-4 h-10 w-10 text-primary" />
                    <h3 className="mb-2 text-lg font-semibold">{isZh ? titleZh : title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isZh ? descriptionZh : description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold">
                  {isZh ? "VPX 核心价值观" : "VPX Core Values"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isZh
                    ? "这些原则是我们选拔、指导和培养成员的核心依据。"
                    : "These principles guide how we select, mentor, and grow our members."}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {(coreValues as readonly LocalizedResearchItem[]).map((value, index) => {
                  const title = isZh ? value.titleZh ?? value.title : value.title;
                  const description = isZh
                    ? value.descriptionZh ?? value.description
                    : value.description;
                  const Icon = coreValueIcons[index];
                  return (
                    <Card key={value.title} className="bg-muted/30">
                      <CardContent className="pt-6">
                        <div className="mb-3 flex items-center gap-2">
                          <Icon className="h-5 w-5 shrink-0 text-primary" />
                          <h4 className="font-semibold">{title}</h4>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">{isZh ? "研究方向" : "Research Tracks"}</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(researchTracks as readonly LocalizedResearchItem[]).map((track) => {
                  const title = isZh ? track.titleZh ?? track.title : track.title;
                  const description = isZh
                    ? track.descriptionZh ?? track.description
                    : track.description;
                  return (
                    <div key={track.title} className="rounded-lg bg-muted/50 p-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                        <div className="space-y-1">
                          <h4 className="font-medium">{title}</h4>
                          <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-5xl">
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight">
              <Bookmark className="h-5 w-5 text-primary" />
              {isZh ? "常见问题" : "Frequently Asked Questions"}
            </h2>
          </CardHeader>
          <CardContent className="space-y-5">
            {faqs.map((item) => (
              <div key={item.q} className="space-y-2">
                <h3 className="font-medium">{isZh ? item.qZh : item.q}</h3>
                <p className="text-sm text-muted-foreground">{isZh ? item.aZh : item.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* LAB LOCATION */}
      <section className="mx-auto max-w-5xl">
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight">
              <MapPin className="h-5 w-5 text-primary" />
              {isZh ? "实验室地址" : "Lab Location"}
            </h2>
            <CardDescription>
              {isZh
                ? "我们的实验室位于上海华东师范大学普陀校区对外汉语学院。"
                : "Our lab is located in the School of International Chinese Studies at ECNU’s Putuo Campus in Shanghai."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isZh ? LAB_ADDRESS_ZH : LAB_ADDRESS}
            </p>
            <div className="overflow-hidden rounded-lg border bg-muted">
              <iframe
                title={isZh ? "VPX 实验室位置地图" : "VPX Lab Location Map"}
                src={LAB_MAP_EMBED}
                className="h-64 w-full md:h-72"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <Button asChild variant="secondary" className="w-full gap-2 sm:w-fit">
              <a href={LAB_MAP_LINK} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                {isZh ? "在 Google 地图中打开" : "Open in Google Maps"}
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Dialog open={activeQr !== null} onOpenChange={(open) => !open && setActiveQr(null)}>
        <DialogContent
          className="sm:max-w-md"
          closeLabel={isZh ? "关闭" : "Close"}
        >
          <DialogTitle className="sr-only">
            {isZh
              ? activeQr === "xiaohongshu"
                ? "小红书二维码"
                : "抖音二维码"
              : activeQr === "xiaohongshu"
                ? "Xiaohongshu QR Code"
                : "Douyin QR Code"}
          </DialogTitle>
          <div className="rounded-md border bg-muted p-2">
            <img
              src={activeQr === "xiaohongshu" ? "/小红书.jpg" : "/抖音.jpg"}
              alt={
                activeQr === "xiaohongshu"
                  ? isZh
                    ? "小红书二维码"
                    : "Xiaohongshu QR Code"
                  : isZh
                    ? "抖音二维码"
                    : "Douyin QR Code"
              }
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
