import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Globe } from "lucide-react";

import faculty from "../../public/people/faculty.json";
import phdStudents from "../../public/people/phd.json";
import gradStudents from "../../public/people/graduate.json";
import partTimeStudents from "../../public/people/part-time.json";
import undergraduate from "../../public/people/Undergraduate.json";
import alumni from "../../public/people/alumni.json";

import { useLocation } from "react-router-dom";
import { useEffect } from "react";

type Person = {
  name: string;
  title: string;
  bio: string;
  image: string;
  email: string;
  website?: string;
  personalWebsite?: string;
  research?: string[];
};

const getWebsite = (p: Person) => p.personalWebsite || p.website;

const slugifyName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const getPersonAnchorId = (group: string, name: string) =>
  `${group}-${slugifyName(name)}`;

const LEGACY_ANCHOR_ALIASES: Record<string, string> = {
  "yu-zhang": "grad-yu-zhang",
};

const People = () => {
  const facultyList = faculty as Person[];
  const phdList = phdStudents as Person[];
  const gradList = gradStudents as Person[];
  const partTimeList = partTimeStudents as Person[];
  const ugList = undergraduate as Person[];
  const alumniList = alumni as Person[];

const location = useLocation();

useEffect(() => {
  const hash = location.hash;
  if (!hash) return;

  const id = decodeURIComponent(hash.slice(1));

  // 多次尝试：解决“初次进入时 DOM/图片还没渲染导致找不到元素”的问题
  let tries = 0;
  const maxTries = 30; // 约 30 帧 ≈ 0.5 秒

  const tick = () => {
    const directMatch = document.getElementById(id);
    const fallbackMatch =
      LEGACY_ANCHOR_ALIASES[id]
        ? document.getElementById(LEGACY_ANCHOR_ALIASES[id])
        : null;
    const suffixMatches = Array.from(
      document.querySelectorAll<HTMLElement>(`[id$="-${CSS.escape(id)}"]`)
    );
    const el =
      directMatch ||
      fallbackMatch ||
      (suffixMatches.length === 1 ? suffixMatches[0] : null);

    if (el) {
      // 先滚到元素
      el.scrollIntoView({ block: "start" });

      // 再根据你的顶部导航栏高度做微调（这里你可以改成 -64 / -80 / -96）
      window.scrollBy(0, -80);
      return;
    }

    tries += 1;
    if (tries < maxTries) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}, [location.key, location.hash]);


  return (
    <div className="relative w-full page-transition">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute top-40 -left-24 h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -top-40 right-24 h-[320px] w-[320px] rounded-full bg-emerald-400/10 blur-2xl" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative container px-4 md:px-6 py-8 md:py-10">
        {/* Hero */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">People</h1>
          <p className="text-base text-muted-foreground mt-2 max-w-4xl leading-relaxed">
            Meet the faculty members, researchers, and students who contribute to the VPX Group's research and academic community.
          </p>
        </header>

        <div className="space-y-12">
          {/* Faculty */}
          <Group id="faculty" title="Faculty" subtitle="Principal investigators and faculty members.">
            <div className="space-y-8">
              {facultyList.map((m, i) => (
                <FacultyRow key={`faculty-${i}`} member={m} />
              ))}
            </div>
          </Group>

          <Group id="phd" title="PhD Students">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {phdList.map((m, i) => (
                <div
                  key={`phd-${i}`}
                  id={getPersonAnchorId("phd", m.name)}
                  className="scroll-mt-24"
                >
                  <PeopleCardCompact member={m} />
                </div>
              ))}
            </div>
          </Group>

          <Group id="grad" title="Graduate Students">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gradList.map((m, i) => (
                <div
                  key={`grad-${i}`}
                  id={getPersonAnchorId("grad", m.name)}
                  className="scroll-mt-24"
                >
                  <PeopleCardCompact member={m} />
                </div>
              ))}
            </div>
          </Group>

          <Group id="part-time" title="Part-Time Students">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {partTimeList.map((m, i) => (
                <div
                  key={`part-time-${i}`}
                  id={getPersonAnchorId("part-time", m.name)}
                  className="scroll-mt-24"
                >
                  <PeopleCardCompact member={m} />
                </div>
              ))}
            </div>
          </Group>

          <Group id="undergrad" title="Undergraduate Students">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ugList.map((m, i) => (
                <div
                  key={`undergrad-${i}`}
                  id={getPersonAnchorId("undergrad", m.name)}
                  className="scroll-mt-24"
                >
                  <PeopleCardCompact member={m} />
                </div>
              ))}
            </div>
          </Group>

          <Group id="alumni" title="Alumni" subtitle="Compact list of alumni placements.">
            <AlumniTable data={alumniList} />
          </Group>
        </div>
      </div>
    </div>
  );
};

const Group = ({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => {
  return (
    <section id={id} className="scroll-mt-24">
      {/* Bigger title, no pill background */}
      <div className="mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
        {subtitle ? <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-3xl">{subtitle}</p> : null}
      </div>
      <div className="mb-6 h-px w-full bg-border/60" />
      {children}
    </section>
  );
};

/** Faculty: no Card background, left avatar (circle) + right content */
const FacultyRow = ({ member }: { member: Person }) => {
  const initials =
    member.name
      ?.split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 3) || "NA";

  const website = getWebsite(member);

  return (
    <div className="flex flex-col md:flex-row md:items-start gap-5">
      {/* left: circle avatar */}
      <div className="shrink-0 flex justify-start">
        <Avatar className="w-40 h-40 md:w-44 md:h-44 rounded-full">
          <AvatarImage src={member.image} className="object-cover" />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
      </div>

      {/* right: text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xl md:text-2xl font-semibold leading-tight">{member.name}</h3>
            <p className="text-sm md:text-base text-muted-foreground mt-1">{member.title}</p>
          </div>
        </div>

        {member.bio ? (
          <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
            {member.bio}
          </p>
        ) : null}

        {member.research && member.research.length > 0 ? (
          <div className="mt-4">
            <p className="text-sm font-medium">Research Areas</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {member.research.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full border bg-background/50 px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {member.email ? (
            <Button size="sm" variant="outline" className="h-9" asChild>
              <a href={`mailto:${member.email}`}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </a>
            </Button>
          ) : null}

          {website ? (
            <Button size="sm" variant="outline" className="h-9" asChild>
              <a href={website} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4 mr-2" />
                Personal Website
              </a>
            </Button>
          ) : null}
        </div>

        {/* subtle divider between faculty rows */}
        <div className="mt-8 h-px w-full bg-border/40" />
      </div>
    </div>
  );
};

/** Students: smaller, denser, 4 per row on lg */
const PeopleCardCompact = ({ member }: { member: Person }) => {
  const initials =
    member.name
      ?.split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 3) || "NA";

  const website = getWebsite(member);

  return (
    <Card className="h-full flex flex-col border/60 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-col items-center text-center pb-2 pt-4 px-4">
        <Avatar className="w-24 h-24 md:w-28 md:h-28">
          <AvatarImage src={member.image} className="object-cover" />
          <AvatarFallback className="text-sm">{initials}</AvatarFallback>
        </Avatar>

        <CardTitle className="mt-2 text-base leading-tight">{member.name}</CardTitle>
        <CardDescription className="text-xs leading-snug line-clamp-2">{member.title}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pt-0 px-4 pb-3">
        {member.bio ? (
          <p className="text-xs text-muted-foreground text-center leading-relaxed line-clamp-3">
            {member.bio}
          </p>
        ) : null}

        {member.research && member.research.length > 0 ? (
          <div className="mt-2">
            <p className="text-xs font-medium text-center">Research</p>
            <ul className="mt-1 text-xs text-muted-foreground space-y-1 text-center">
              {member.research.slice(0, 3).map((area, i) => (
                <li key={i} className="line-clamp-1">{area}</li>
              ))}
              {member.research.length > 3 ? <li>…</li> : null}
            </ul>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex justify-center gap-2 pt-0 pb-4 px-4">
        {member.email ? (
          <Button size="sm" variant="outline" className="h-8 px-3 text-xs" asChild>
            <a href={`mailto:${member.email}`}>
              <Mail className="h-3.5 w-3.5 mr-2" />
              Email
            </a>
          </Button>
        ) : null}

        {website ? (
          <Button size="sm" variant="outline" className="h-8 px-3 text-xs" asChild>
            <a href={website} target="_blank" rel="noopener noreferrer">
              <Globe className="h-3.5 w-3.5 mr-2" />
              Website
            </a>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
};

/** Alumni: unchanged */
const AlumniTable = ({ data }: { data: Person[] }) => {
  const formatResearch = (r?: string[]) => {
    if (!r || r.length === 0) return "—";
    return r.join(", ");
  };

  return (
    <div className="rounded-lg overflow-hidden">
      <div className="hidden md:grid grid-cols-12 gap-3 pb-2 text-xs font-medium text-muted-foreground">
        <div className="col-span-3">Name</div>
        <div className="col-span-5">Past Position</div>
        <div className="col-span-4">Placement</div>
      </div>

      <div className="divide-y divide-border/60">
        {data.map((p, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 py-3">
            <div className="md:col-span-3 min-w-0">
              <div className="text-sm font-semibold leading-tight truncate">{p.name}</div>
              <div className="md:hidden text-xs text-muted-foreground mt-1 line-clamp-2">{p.title}</div>
            </div>

            <div className="hidden md:block md:col-span-5 text-sm text-muted-foreground leading-snug">
              {p.title}
            </div>

            <div className="md:col-span-4">
              <div className="text-sm text-muted-foreground leading-snug">
                {formatResearch(p.research)}
              </div>

              {p.bio ? (
                <div className="md:hidden text-xs text-muted-foreground leading-relaxed mt-2 line-clamp-2">
                  {p.bio}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default People;
