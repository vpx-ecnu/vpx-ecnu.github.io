import { useEffect, useRef, useState } from "react";
import {
  CloudUpload,
  ExternalLink,
  FileJson,
  GitCommitHorizontal,
  KeyRound,
  Loader2,
  RefreshCw,
  ScanLine,
  ShieldAlert,
  TerminalSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const STUDIO_API_BASE = "http://127.0.0.1:3001/api/studio/news";
const DEFAULT_COMMIT_MESSAGE = "chore: update XHS news from local studio";
const STUDIO_SERVER_BASE = "http://127.0.0.1:3001";

type NewsItem = {
  id: string;
  title: string;
  date: string;
  image?: string;
  source_url?: string;
  video?: string;
};

type StudioConfig = {
  crawlMode: string;
  loginType: string;
  headless: boolean;
  creatorTarget: string;
  maxNotesCount: number;
  targetUserIds: string[];
  hasCookies: boolean;
};

type NewsSummary = {
  exists: boolean;
  path: string;
  count: number;
  latestDate: string | null;
  items: NewsItem[];
  modifiedAt: string | null;
};

type RawSummary = {
  exists: boolean;
  path: string | null;
  recordCount: number;
  modifiedAt: string | null;
};

type DiffSummary = {
  addedCount: number;
  preservedCount: number;
};

type GitSummary = {
  dirty: boolean;
  changedFiles: string[];
  error?: string;
};

type FileSummary = {
  exists: boolean;
  path: string;
  modifiedAt: string | null;
  size: number;
};

type CredentialSummary = {
  localCookie: FileSummary;
  github: {
    repo: string | null;
    remoteUrl: string | null;
    creatorId: string | null;
    cliAvailable: boolean;
    authenticated: boolean;
    error: string | null;
    lastSyncAt: string | null;
    syncedSecrets: string[];
    needsSync: boolean;
  };
};

type TaskState = {
  id: string | null;
  action: string;
  status: "idle" | "running" | "succeeded" | "failed";
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
  pid: number | null;
  logs: string[];
};

type StudioState = {
  config: StudioConfig;
  current: NewsSummary;
  draft: NewsSummary;
  raw: RawSummary;
  diff: DiffSummary;
  git: GitSummary;
  credentials: CredentialSummary;
  task: TaskState;
  runtime: {
    apiBase: string;
    pythonBinary: string;
    previewPath: string;
    publishCandidatePath: string;
  };
};

type FormState = {
  loginType: string;
  headless: boolean;
  creatorTarget: string;
  targetUserIds: string;
  cookieText: string;
  commitMessage: string;
};

function splitListInput(value: string) {
  return value
    .split(/[\n,，]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatList(values: string[]) {
  return values.join("\n");
}

function formatDate(value: string | null) {
  if (!value) return "Not available";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildPreviewImageSrc(src?: string) {
  const value = String(src || "").trim();
  if (!value) return "";
  if (!/^https?:\/\//i.test(value)) return value;

  try {
    const parsed = new URL(value);
    if (parsed.hostname.endsWith("xhscdn.com")) {
      return `${STUDIO_SERVER_BASE}/api/xhs-media?url=${encodeURIComponent(value)}`;
    }
  } catch (_error) {
    return value;
  }

  return value;
}

function buildFormFromState(state: StudioState): FormState {
  return {
    loginType: state.config.loginType || "qrcode",
    headless: state.config.headless,
    creatorTarget: state.config.creatorTarget || "",
    targetUserIds: formatList(state.config.targetUserIds),
    cookieText: "",
    commitMessage: DEFAULT_COMMIT_MESSAGE,
  };
}

function taskBadgeVariant(
  status: TaskState["status"],
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "failed") return "destructive";
  if (status === "succeeded") return "secondary";
  if (status === "running") return "default";
  return "outline";
}

async function requestStudio<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${STUDIO_API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(payload?.error || `Request failed with HTTP ${response.status}`);
  }
  return payload as T;
}

function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">{hint}</CardContent>
    </Card>
  );
}

function NewsPreviewList({
  items,
  emptyText,
}: {
  items: NewsItem[];
  emptyText: string;
}) {
  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <article
          key={item.id}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="grid gap-0 sm:grid-cols-[180px_minmax(0,1fr)]">
            <div className="h-40 bg-slate-100">
              {item.image ? (
                <img
                  src={buildPreviewImageSrc(item.image)}
                  alt={item.title || item.id}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No cover
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-3 p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">XHS</Badge>
                  {item.video ? <Badge variant="secondary">Video</Badge> : null}
                </div>
                <h3 className="line-clamp-2 text-base font-semibold text-slate-900">
                  {item.title || "Xiaohongshu Update"}
                </h3>
                <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="truncate">id: {item.id}</p>
                {item.source_url ? (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Open source note
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

const StudioNews = () => {
  const { toast } = useToast();
  const [state, setState] = useState<StudioState | null>(null);
  const [form, setForm] = useState<FormState>({
    loginType: "qrcode",
    headless: false,
    creatorTarget: "",
    targetUserIds: "",
    cookieText: "",
    commitMessage: DEFAULT_COMMIT_MESSAGE,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasHydratedForm = useRef(false);

  const isLocalHost =
    typeof window !== "undefined" &&
    (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost");

  const hydrateForm = (nextState: StudioState) => {
    setForm((current) => ({
      ...buildFormFromState(nextState),
      commitMessage: current.commitMessage || DEFAULT_COMMIT_MESSAGE,
    }));
    hasHydratedForm.current = true;
  };

  const loadState = async ({
    hydrate = false,
    silent = false,
  }: {
    hydrate?: boolean;
    silent?: boolean;
  } = {}) => {
    if (!silent) {
      setLoading(true);
      setErrorMessage(null);
    }

    try {
      const nextState = await requestStudio<StudioState>("/state");
      setState(nextState);
      if (hydrate || !hasHydratedForm.current) {
        hydrateForm(nextState);
      }
    } catch (error) {
      const message = String((error as Error).message || error);
      setErrorMessage(message);
      if (!silent) {
        toast({
          title: "Studio API unavailable",
          description: message,
          duration: 6000,
        });
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadState({ hydrate: true });
  }, []);

  useEffect(() => {
    if (state?.task.status !== "running") return undefined;
    const timer = window.setInterval(() => {
      void loadState({ silent: true });
    }, 4000);
    return () => window.clearInterval(timer);
  }, [state?.task.status]);

  const buildConfigPayload = (overrides: Record<string, unknown> = {}) => ({
    crawlMode: "creator",
    loginType: form.loginType,
    headless: form.headless,
    creatorTarget: form.creatorTarget.trim(),
    targetUserIds: splitListInput(form.targetUserIds),
    ...(form.cookieText.trim() ? { cookieText: form.cookieText.trim() } : {}),
    ...overrides,
  });

  const openLocalRoute = (path: string) => {
    if (typeof window === "undefined") return;
    const nextUrl = new URL(path, window.location.origin).toString();
    window.open(nextUrl, "_blank", "noopener,noreferrer");
  };

  const runAction = async <T,>({
    action,
    path,
    payload,
    onSuccess,
    pendingMessage,
  }: {
    action: string;
    path: string;
    payload: Record<string, unknown>;
    onSuccess?: (result: T) => void;
    pendingMessage: string;
  }) => {
    setSubmitting(action);
    setErrorMessage(null);
    try {
      const result = await requestStudio<T>(path, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onSuccess?.(result);
      setForm((current) => ({ ...current, cookieText: "" }));
      toast({
        title: pendingMessage,
        description:
          form.loginType === "qrcode" && action === "sync"
            ? "A local browser window may open for Xiaohongshu login."
            : "The task is now running in the local studio service.",
        duration: 5000,
      });
    } catch (error) {
      const message = String((error as Error).message || error);
      setErrorMessage(message);
      toast({
        title: "Studio task failed to start",
        description: message,
        duration: 6000,
      });
    } finally {
      setSubmitting(null);
    }
  };

  const saveSettings = async () => {
    await runAction<StudioState>({
      action: "save",
      path: "/config",
      payload: buildConfigPayload(),
      pendingMessage: "Studio settings saved",
      onSuccess: (nextState) => {
        setState(nextState);
        hydrateForm(nextState);
      },
    });
  };

  const runPreviewSync = async () => {
    if (
      form.loginType === "cookie" &&
      !form.cookieText.trim() &&
      !state?.config.hasCookies
    ) {
      toast({
        title: "Cookie login needs a saved session",
        description: "Paste a fresh cookie first, or switch the login type to QR code.",
        duration: 6000,
      });
      return;
    }

    await runAction<{ task: TaskState }>({
      action: "sync",
      path: "/sync",
      payload: buildConfigPayload(),
      pendingMessage: "Preview sync started",
      onSuccess: ({ task }) => {
        setState((current) => (current ? { ...current, task } : current));
      },
    });
  };

  const publishDraft = async () => {
    await runAction<{ task: TaskState }>({
      action: "publish",
      path: "/publish",
      payload: buildConfigPayload(),
      pendingMessage: "Publish task started",
      onSuccess: ({ task }) => {
        setState((current) => (current ? { ...current, task } : current));
      },
    });
  };

  const clearCookies = async () => {
    await runAction<StudioState>({
      action: "clear-cookies",
      path: "/config",
      payload: { clearCookies: true },
      pendingMessage: "Saved cookie cleared",
      onSuccess: (nextState) => {
        setState(nextState);
        setForm((current) => ({ ...current, cookieText: "" }));
      },
    });
  };

  const commitAndPush = async () => {
    await runAction<{ task: TaskState }>({
      action: "commit",
      path: "/commit",
      payload: {
        message: form.commitMessage.trim() || DEFAULT_COMMIT_MESSAGE,
      },
      pendingMessage: "Commit and push started",
      onSuccess: ({ task }) => {
        setState((current) => (current ? { ...current, task } : current));
      },
    });
  };

  const syncGitHubCredentials = async () => {
    await runAction<{ task: TaskState }>({
      action: "sync-github",
      path: "/credentials/sync",
      payload: {},
      pendingMessage: "GitHub credential sync started",
      onSuccess: ({ task }) => {
        setState((current) => (current ? { ...current, task } : current));
      },
    });
  };

  const isTaskRunning = state?.task.status === "running";
  const isBusy = Boolean(submitting) || isTaskRunning;
  const canSyncGitHubCredentials = Boolean(
    !isBusy &&
      state?.credentials.localCookie.exists &&
      state?.credentials.github.cliAvailable &&
      state?.credentials.github.authenticated &&
      state?.credentials.github.repo,
  );

  if (loading && !state) {
    return (
      <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 md:px-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading the local studio state...
        </div>
      </div>
    );
  }

  return (
    <div className="container space-y-8 px-4 py-12 md:px-6">
      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="outline" className="border-slate-300 text-slate-700">
              Local Studio / Creator Mode
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                VPX News Studio
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                Run a local creator-feed sync for the VPX Xiaohongshu account,
                review the draft, then merge new note IDs into
                {" "}
                <code>public/news.json</code>
                {" "}
                without overwriting existing entries or your manual edits.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={taskBadgeVariant(state?.task.status || "idle")}>
              Task: {state?.task.status || "idle"}
            </Badge>
            <Badge variant="outline">Mode: {state?.config.crawlMode || "creator"}</Badge>
            {state?.config.hasCookies ? (
              <Badge variant="secondary">Saved cookie present</Badge>
            ) : (
              <Badge variant="outline">No saved cookie</Badge>
            )}
            {state?.credentials.github.authenticated ? (
              <Badge variant="secondary">GitHub CLI ready</Badge>
            ) : (
              <Badge variant="outline">GitHub CLI not authenticated</Badge>
            )}
          </div>
        </div>

        {!isLocalHost ? (
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="flex gap-3 p-4 text-sm text-amber-900">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                This page is intended for local use with the studio API running on
                {" "}
                <code>127.0.0.1:3001</code>.
                {" "}
                It will not work from the deployed public site.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {errorMessage ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">{errorMessage}</CardContent>
          </Card>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Current site feed"
          value={String(state?.current.count || 0)}
          hint={`Latest: ${formatDate(state?.current.latestDate || null)}`}
        />
        <StatCard
          title="Draft preview"
          value={String(state?.draft.count || 0)}
          hint={`Preview file: ${state?.runtime.previewPath || ".local/studio/news/creator.preview.news.json"}`}
        />
        <StatCard
          title="Latest raw creator JSON"
          value={String(state?.raw.recordCount || 0)}
          hint={state?.raw.path || "Run a preview sync to generate raw results"}
        />
        <StatCard
          title="Git publish status"
          value={state?.git.dirty ? "Modified" : "Clean"}
          hint={state?.git.changedFiles[0] || "No staged or unstaged XHS news output"}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Sync Controls</CardTitle>
            <CardDescription>
              Configure the local login method and the creator target used for
              Xiaohongshu creator-feed sync.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="loginType">Login type</Label>
                <Select
                  value={form.loginType}
                  onValueChange={(value) =>
                    setForm((current) => ({ ...current, loginType: value }))
                  }
                >
                  <SelectTrigger id="loginType">
                    <SelectValue placeholder="Select login mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qrcode">QR code login</SelectItem>
                    <SelectItem value="cookie">Saved cookie login</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                <div className="space-y-1">
                  <Label htmlFor="headless">Headless browser</Label>
                  <p className="text-xs text-muted-foreground">
                    QR login usually needs a visible browser window.
                  </p>
                </div>
                <Switch
                  id="headless"
                  checked={form.headless}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({ ...current, headless: checked }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="creatorTarget">Creator target</Label>
                <Textarea
                  id="creatorTarget"
                  className="min-h-36"
                  value={form.creatorTarget}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      creatorTarget: event.target.value,
                    }))
                  }
                  placeholder="Paste the full Xiaohongshu creator profile URL when available. A 24-character internal user id also works."
                />
                <p className="text-xs text-muted-foreground">
                  Creator mode is now the primary sync strategy. The full profile
                  URL is preferred because it can carry the freshest xsec context.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetUserIds">Target user IDs</Label>
                <Textarea
                  id="targetUserIds"
                  className="min-h-36"
                  value={form.targetUserIds}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      targetUserIds: event.target.value,
                    }))
                  }
                  placeholder="One internal user id per line"
                />
                <p className="text-xs text-muted-foreground">
                  These IDs act as a safety filter and are also preserved as the
                  stable identity contract for later editor features.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="cookieText">Optional fresh cookie</Label>
                {state?.config.hasCookies ? (
                  <span className="text-xs text-muted-foreground">
                    A saved cookie already exists on this machine.
                  </span>
                ) : null}
              </div>
              <Textarea
                id="cookieText"
                className="min-h-28"
                value={form.cookieText}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    cookieText: event.target.value,
                  }))
                }
                placeholder="Paste web_session or the full cookie string here when you need to refresh login."
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={saveSettings} disabled={isBusy}>
                {submitting === "save" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileJson className="h-4 w-4" />
                )}
                Save settings
              </Button>
              <Button variant="secondary" onClick={runPreviewSync} disabled={isBusy}>
                {submitting === "sync" || isTaskRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ScanLine className="h-4 w-4" />
                )}
                Run preview sync
              </Button>
              <Button variant="outline" onClick={publishDraft} disabled={isBusy}>
                {submitting === "publish" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CloudUpload className="h-4 w-4" />
                )}
                Merge draft into site
              </Button>
              <Button variant="ghost" onClick={clearCookies} disabled={isBusy}>
                Clear saved cookie
              </Button>
              <Button variant="ghost" onClick={() => void loadState()} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4", loading ? "animate-spin" : "")} />
                Refresh state
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Publish Center</CardTitle>
            <CardDescription>
              Once the preview looks right, merge only the new note IDs into
              {" "}
              <code>public/news.json</code>
              {" "}
              while preserving all existing items and any manual edits you have
              already made.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Added</p>
                <p className="mt-2 text-2xl font-semibold">{state?.diff.addedCount || 0}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Kept</p>
                <p className="mt-2 text-2xl font-semibold">{state?.diff.preservedCount || 0}</p>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Latest task</p>
                <Badge variant={taskBadgeVariant(state?.task.status || "idle")}>
                  {state?.task.action || "idle"}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Started: {formatDate(state?.task.startedAt || null)}</p>
                <p>Finished: {formatDate(state?.task.finishedAt || null)}</p>
                <p>Python: {state?.runtime.pythonBinary || "python3"}</p>
                <p>Publish merge candidate: {state?.runtime.publishCandidatePath || ".local/studio/news/creator.publish.candidate.news.json"}</p>
              </div>
              {state?.task.error ? (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {state.task.error}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="commitMessage">Commit message</Label>
              <Input
                id="commitMessage"
                value={form.commitMessage}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    commitMessage: event.target.value,
                  }))
                }
                placeholder={DEFAULT_COMMIT_MESSAGE}
              />
            </div>

            <div className="space-y-2 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">GitHub credential sync</p>
                <Badge
                  variant={
                    state?.credentials.github.authenticated ? "secondary" : "outline"
                  }
                >
                  {state?.credentials.github.authenticated ? "ready" : "needs auth"}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Repo: {state?.credentials.github.repo || "Unavailable"}</p>
                <p>Stable creator ID: {state?.credentials.github.creatorId || "Unavailable"}</p>
                <p>
                  Local cookie cache: {state?.credentials.localCookie.exists
                    ? `updated ${formatDate(state.credentials.localCookie.modifiedAt)}`
                    : "missing"}
                </p>
                <p>
                  Last GitHub sync: {formatDate(state?.credentials.github.lastSyncAt || null)}
                </p>
                <p>
                  Secrets: {(state?.credentials.github.syncedSecrets || []).length
                    ? state?.credentials.github.syncedSecrets.join(", ")
                    : "Not synced yet"}
                </p>
              </div>
              {state?.credentials.github.error ? (
                <p className="rounded-md bg-slate-100 px-3 py-2 text-xs text-muted-foreground">
                  {state.credentials.github.error}
                </p>
              ) : null}
              {state?.credentials.github.needsSync ? (
                <p className="text-xs text-amber-700">
                  The local cookie cache is newer than the last GitHub secret sync.
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={commitAndPush} disabled={isBusy}>
                {submitting === "commit" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GitCommitHorizontal className="h-4 w-4" />
                )}
                Commit and push
              </Button>
              <Button
                variant="secondary"
                onClick={syncGitHubCredentials}
                disabled={!canSyncGitHubCredentials}
              >
                {submitting === "sync-github" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                Sync GitHub XHS credentials
              </Button>
              <Button
                variant="outline"
                onClick={() => openLocalRoute("/")}
                disabled={isTaskRunning}
              >
                <ExternalLink className="h-4 w-4" />
                Open local homepage
              </Button>
              <Button
                variant="outline"
                onClick={() => openLocalRoute("/activities")}
                disabled={isTaskRunning}
              >
                <ExternalLink className="h-4 w-4" />
                Open local activities
              </Button>
              <p className="text-xs leading-5 text-muted-foreground">
                After `Merge draft into site`, open the local homepage or activities
                page to confirm the result. If it looks right, use `Commit and push`.
                Use `Sync GitHub XHS credentials` separately when you want the backup
                GitHub Action flow to reuse the freshest local cookie cache.
              </p>
            </div>

            <p className="text-xs leading-5 text-muted-foreground">
              `npm run dev` reflects `public/news.json` changes immediately. If you are
              browsing a static `npm run preview` build, rebuild before checking the merged site.
            </p>

            {state?.git.changedFiles.length ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">Pending XHS output files</p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {state.git.changedFiles.map((file) => (
                    <p key={file}>{file}</p>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section>
        <Tabs defaultValue="draft" className="space-y-4">
          <TabsList>
            <TabsTrigger value="draft">Draft Preview</TabsTrigger>
            <TabsTrigger value="current">Current Site</TabsTrigger>
            <TabsTrigger value="logs">Task Log</TabsTrigger>
          </TabsList>

          <TabsContent value="draft">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Draft Preview</CardTitle>
                <CardDescription>
                  Generated from the latest raw creator JSON without touching the
                  live site files. Showing all {state?.draft.count || 0} draft items.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>Path: {state?.draft.path || ".local/studio/news/creator.preview.news.json"}</span>
                  <span>Updated: {formatDate(state?.draft.modifiedAt || null)}</span>
                </div>
                <NewsPreviewList
                  items={state?.draft.items || []}
                  emptyText="No preview draft exists yet. Run a preview sync first."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="current">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Current Site Feed</CardTitle>
                <CardDescription>
                  This mirrors the live data source consumed by the homepage and
                  the activities page. Showing all {state?.current.count || 0} current items.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>Path: {state?.current.path || "public/news.json"}</span>
                  <span>Updated: {formatDate(state?.current.modifiedAt || null)}</span>
                </div>
                <NewsPreviewList
                  items={state?.current.items || []}
                  emptyText="The current site feed could not be loaded."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Task Log</CardTitle>
                <CardDescription>
                  Live output from the local studio service and the XHS pipeline.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl bg-slate-950 p-4 text-slate-100">
                  <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                    <TerminalSquare className="h-4 w-4" />
                    Studio task output
                  </div>
                  <div className="max-h-[480px] overflow-auto">
                    <pre className="whitespace-pre-wrap break-words text-xs leading-6">
                      {(state?.task.logs || []).length
                        ? state?.task.logs.join("\n")
                        : "No logs yet."}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default StudioNews;
