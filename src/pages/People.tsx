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
  graduationYear?: string;
  bio: string;
  image: string;
  imagePosition?: string;
  email: string;
  website?: string;
  personalWebsite?: string;
  research?: string[];
  coSupervisors?: Array<string | { name: string; url?: string }>;
};

const DEFAULT_AVATAR_POSITION = "center 20%";

const getAvatarImageStyle = (member: Person): React.CSSProperties => ({
  objectPosition: member.imagePosition || DEFAULT_AVATAR_POSITION,
});

const getFacultyAvatarClassName = (member: Person) =>
  member.name === "Yang Li"
    ? "h-44 w-44 rounded-full sm:h-40 sm:w-40 lg:h-52 lg:w-52"
    : "h-40 w-40 rounded-full sm:h-36 sm:w-36 lg:h-44 lg:w-44";

const ALUMNI_GROUPS = [
  { key: "phd", label: "PhD" },
  { key: "master", label: "Master" },
  { key: "undergraduate", label: "Undergraduate" },
  { key: "part-time", label: "Part-Time" },
] as const;

const getAlumniGroupKey = (title: string) => {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes("phd")) return "phd";
  if (normalizedTitle.includes("master")) return "master";
  if (normalizedTitle.includes("undergraduate")) return "undergraduate";
  if (normalizedTitle.includes("part-time") || normalizedTitle.includes("part time")) return "part-time";

  return "other";
};

const getGraduationYearValue = (person: Person) => {
  const value = Number.parseInt(person.graduationYear || "", 10);
  return Number.isFinite(value) ? value : 0;
};

const getWebsite = (p: Person) => p.personalWebsite || p.website;

const getCoSupervisorName = (supervisor: string | { name: string; url?: string }) =>
  typeof supervisor === "string" ? supervisor : supervisor.name;

const getCoSupervisorUrl = (supervisor: string | { name: string; url?: string }) =>
  typeof supervisor === "string" ? undefined : supervisor.url;

const getCoSupervisorSeparator = (index: number, total: number) => {
  if (index === 0) return "";
  if (index === total - 1) return total === 2 ? " and " : ", and ";
  return ", ";
};

const renderCoSupervisionNote = (person: Person) => {
  if (!person.coSupervisors || person.coSupervisors.length === 0) return null;

  return (
    <>
      <span>Cosupervised with </span>
      {person.coSupervisors.map((supervisor, index) => {
        const name = getCoSupervisorName(supervisor);
        const url = getCoSupervisorUrl(supervisor);

        return (
          <React.Fragment key={`${name}-${index}`}>
            {getCoSupervisorSeparator(index, person.coSupervisors?.length ?? 0)}
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-muted-foreground/50 underline-offset-2 transition-colors hover:text-foreground"
              >
                {name}
              </a>
            ) : (
              <span>{name}</span>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

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
    <div className="relative w-full">
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
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

          <Group id="undergrad" title="Undergraduate Students">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
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

          <Group id="part-time" title="Part-Time Students">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {partTimeList.map((m, i) => (
                <div
                  key={`part-time-${i}`}
                  id={getPersonAnchorId("part-time", m.name)}
                  className="scroll-mt-24"
                >
                  <PartTimeMemberCard member={m} />
                </div>
              ))}
            </div>
          </Group>

          <Group id="alumni" title="Alumni" subtitle="Compact list of alumni placements.">
            <AlumniColumns data={alumniList} />
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
    <div className="flex flex-col items-center gap-5 sm:items-start lg:flex-row lg:items-start">
      {/* left: circle avatar */}
      <div className="flex w-full shrink-0 justify-center sm:justify-start lg:w-auto">
        <Avatar className={getFacultyAvatarClassName(member)}>
          <AvatarImage
            src={member.image}
            loading="lazy"
            decoding="async"
            className="object-cover"
            style={getAvatarImageStyle(member)}
          />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
      </div>

      {/* right: text */}
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold leading-tight md:text-2xl">{member.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">{member.title}</p>
          </div>
        </div>

        {member.bio ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            {member.bio}
          </p>
        ) : null}

        {member.research && member.research.length > 0 ? (
          <div className="mt-4">
            <p className="text-sm font-medium">Research Areas</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
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

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {member.email ? (
            <Button size="sm" variant="outline" className="h-9 w-full sm:w-auto" asChild>
              <a href={`mailto:${member.email}`}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </a>
            </Button>
          ) : null}

          {website ? (
            <Button size="sm" variant="outline" className="h-9 w-full sm:w-auto" asChild>
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
  const mobileResearch = member.research?.slice(0, 2) ?? [];
  const coSupervisionNote = renderCoSupervisionNote(member);

  return (
    <Card className="flex h-full flex-col border/60 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="px-3 pb-1.5 pt-3 sm:flex sm:flex-col sm:items-center sm:px-3.5 sm:pb-1 sm:pt-3.5 sm:text-center">
        <div className="flex w-full items-center gap-3 sm:flex-col sm:items-center sm:gap-2.5">
          <Avatar className="h-32 w-32 shrink-0 sm:h-32 sm:w-32 md:h-36 md:w-36">
            <AvatarImage
              src={member.image}
              loading="lazy"
              decoding="async"
              className="object-cover"
              style={getAvatarImageStyle(member)}
            />
            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 text-left sm:text-center">
            <div className="space-y-2 sm:space-y-1.5">
              <CardTitle className="text-lg leading-tight sm:text-[1.02rem]">{member.name}</CardTitle>

              {coSupervisionNote ? (
                <p className="text-xs leading-relaxed text-muted-foreground sm:px-2">
                  {coSupervisionNote}
                </p>
              ) : null}

              {mobileResearch.length > 0 ? (
                <div className="mt-2 space-y-1 sm:hidden">
                  {mobileResearch.map((area, i) => (
                    <p key={i} className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {area}
                    </p>
                  ))}
                  {(member.research?.length ?? 0) > mobileResearch.length ? (
                    <p className="text-xs text-muted-foreground">...</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-0 pt-0 sm:flex-1 sm:px-3.5 sm:pb-2.5">
        {member.bio ? (
          <p className="hidden text-center text-xs leading-relaxed text-muted-foreground line-clamp-3 sm:block">
            {member.bio}
          </p>
        ) : null}

        {member.research && member.research.length > 0 ? (
          <div className="mt-1.5 hidden sm:block">
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

      <CardFooter className="flex flex-col items-stretch justify-center gap-1.5 px-3 pb-3 pt-1 sm:flex-row sm:items-center sm:px-3.5 sm:pb-3.5 sm:pt-0.5">
        {member.email ? (
          <Button size="sm" variant="outline" className="h-8 w-full px-3 text-xs sm:w-auto" asChild>
            <a href={`mailto:${member.email}`}>
              <Mail className="h-3.5 w-3.5 mr-2" />
              Email
            </a>
          </Button>
        ) : null}

        {website ? (
          <Button size="sm" variant="outline" className="h-8 w-full px-3 text-xs sm:w-auto" asChild>
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

const PartTimeMemberCard = ({ member }: { member: Person }) => {
  return (
    <Card className="h-full border/60 shadow-sm">
      <CardHeader className="px-3 py-3 sm:px-3.5 sm:py-3.5">
        <CardTitle className="text-sm leading-snug sm:text-base line-clamp-2">
          {member.name}
        </CardTitle>
        <CardDescription className="pt-0.5 text-xs leading-snug sm:text-sm">
          {member.title}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

const AlumniColumns = ({ data }: { data: Person[] }) => {
  const formatResearch = (r?: string[]) => {
    if (!r || r.length === 0) return "—";
    return r.join(", ");
  };

  const groupedData = ALUMNI_GROUPS.map((group) => ({
    ...group,
    members: data
      .filter((person) => getAlumniGroupKey(person.title) === group.key)
      .sort((a, b) => getGraduationYearValue(b) - getGraduationYearValue(a)),
  }));

  return (
    <div className="space-y-8">
      {groupedData.map((group) =>
        group.members.length > 0 ? (
          <section key={group.key} className="overflow-hidden rounded-lg">
            <h3 className="mb-3 text-lg font-semibold">{group.label}</h3>

            <div className="hidden grid-cols-12 gap-3 pb-2 text-xs font-medium text-muted-foreground lg:grid">
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Graduation Years</div>
              <div className="col-span-7">Placement</div>
            </div>

            <div className="divide-y divide-border/60">
              {group.members.map((person, idx) => (
                <div key={idx} className="grid grid-cols-1 gap-3 py-3 lg:grid-cols-12 lg:gap-3">
                  <div className="min-w-0 lg:col-span-3">
                    <div className="text-sm font-semibold leading-tight">{person.name}</div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="text-xs text-muted-foreground lg:hidden">Graduation Years</div>
                    <div className="text-sm leading-snug text-muted-foreground">
                      {person.graduationYear || "2020"}
                    </div>
                  </div>

                  <div className="lg:col-span-7">
                    <div className="text-xs text-muted-foreground lg:hidden">Placement</div>
                    <div className="text-sm leading-snug text-muted-foreground">
                      {formatResearch(person.research)}
                    </div>

                    {person.bio ? (
                      <div className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2 lg:hidden">
                        {person.bio}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null
      )}
    </div>
  );
};

export default People;
