const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { spawn, execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);
const fetch = (...args) => import("node-fetch").then(({ default: nodeFetch }) => nodeFetch(...args));

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const ROOT = path.resolve(__dirname, "..", "..");
const SECRETS_DIR = path.join(ROOT, "secrets");
const CURRENT_NEWS_PATH = path.join(ROOT, "public", "news.json");
const RAW_JSON_DIR = path.join(ROOT, "MediaCrawler", "data", "xhs", "json");
const STUDIO_NEWS_DIR = path.join(ROOT, ".local", "studio", "news");
const STUDIO_SETTINGS_PATH = path.join(STUDIO_NEWS_DIR, "settings.json");
const STUDIO_LOG_PATH = path.join(STUDIO_NEWS_DIR, "task.log");
const STUDIO_GITHUB_SYNC_PATH = path.join(STUDIO_NEWS_DIR, "github-credentials-sync.json");

const MID = 487404760;
const SERIES_ID = 3793757;

const DEFAULT_XHS_CRAWL_MODE = "creator";
const DEFAULT_XHS_SEARCH_KEYWORDS = ["VPX", "VPXer们的快乐科研生活"];
const DEFAULT_XHS_TARGET_USER_IDS = ["63428cc7000000001901f9a4", "2901283856"];
const DEFAULT_XHS_TARGET_NICKNAMES = ["VPXer们的快乐科研生活"];
const DEFAULT_XHS_MAX_NOTES_COUNT = 200;
const MANAGED_GITHUB_XHS_SECRETS = [
  "XHS_COOKIES",
  "XHS_CREATOR_ID",
  "XHS_CREATOR_URL",
  "XHS_TARGET_USER_ID",
  "XHS_TARGET_NICKNAMES",
];
const DEFAULT_STUDIO_SETTINGS = {
  crawlMode: DEFAULT_XHS_CRAWL_MODE,
  loginType: "qrcode",
  headless: false,
  maxNotesCount: DEFAULT_XHS_MAX_NOTES_COUNT,
};

const SECRET_FILES = {
  cookies: path.join(SECRETS_DIR, "xhs_cookies.txt"),
  creatorUrl: path.join(SECRETS_DIR, "xhs_creator_url.txt"),
  creatorId: path.join(SECRETS_DIR, "xhs_creator_id.txt"),
  searchKeywords: path.join(SECRETS_DIR, "xhs_search_keywords.txt"),
  targetUserIds: path.join(SECRETS_DIR, "xhs_target_user_id.txt"),
  targetNicknames: path.join(SECRETS_DIR, "xhs_target_nicknames.txt"),
};

const PYTHON_CANDIDATES = [
  path.join(ROOT, ".venv-xhs310", "bin", "python"),
  path.join(ROOT, ".venv-xhs", "bin", "python"),
  process.env.PYTHON_BIN || "",
  "python3",
];

let newsTask = {
  id: null,
  action: "idle",
  status: "idle",
  startedAt: null,
  finishedAt: null,
  logs: [],
  error: null,
  pid: null,
};

function normalizeCover(pic) {
  if (!pic) return "";
  if (pic.startsWith("//")) return `https:${pic}`;
  return pic;
}

function isAllowedXhsMediaHost(hostname) {
  return hostname.endsWith("xhscdn.com");
}

function ensureDirSync(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function pathExists(targetPath) {
  return fs.existsSync(targetPath);
}

function readTextFile(targetPath) {
  if (!pathExists(targetPath)) return "";
  return fs.readFileSync(targetPath, "utf-8");
}

function readSingleValueFile(targetPath) {
  if (!pathExists(targetPath)) return "";
  const lines = fs.readFileSync(targetPath, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const value = line.trim();
    if (!value || value.startsWith("#")) continue;
    return value;
  }
  return "";
}

function writeTextFile(targetPath, value) {
  ensureDirSync(path.dirname(targetPath));
  fs.writeFileSync(targetPath, value, "utf-8");
}

function removeFileIfExists(targetPath) {
  if (pathExists(targetPath)) {
    fs.unlinkSync(targetPath);
  }
}

function isCreatorProfileUrl(value) {
  return /^https?:\/\/www\.xiaohongshu\.com\/user\/profile\//.test(String(value || "").trim());
}

function isCreatorUserId(value) {
  return /^[0-9a-f]{24}$/i.test(String(value || "").trim());
}

function normalizeCreatorTarget(value) {
  return String(value || "").trim();
}

function readCreatorTarget() {
  return (
    readSingleValueFile(SECRET_FILES.creatorUrl) ||
    readSingleValueFile(SECRET_FILES.creatorId)
  );
}

function writeCreatorTarget(value) {
  const target = normalizeCreatorTarget(value);
  if (!target) {
    removeFileIfExists(SECRET_FILES.creatorUrl);
    removeFileIfExists(SECRET_FILES.creatorId);
    return;
  }
  if (isCreatorProfileUrl(target)) {
    writeTextFile(SECRET_FILES.creatorUrl, `${target}\n`);
    removeFileIfExists(SECRET_FILES.creatorId);
    return;
  }
  writeTextFile(SECRET_FILES.creatorId, `${target}\n`);
  removeFileIfExists(SECRET_FILES.creatorUrl);
}

function normalizeListInput(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,，]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function uniquePreserveOrder(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

function readListFile(targetPath) {
  return uniquePreserveOrder(normalizeListInput(readTextFile(targetPath)));
}

function writeListFile(targetPath, values) {
  const normalized = uniquePreserveOrder(normalizeListInput(values));
  if (!normalized.length) {
    removeFileIfExists(targetPath);
    return;
  }
  writeTextFile(targetPath, normalized.join("\n") + "\n");
}

function readJsonFile(targetPath, fallback) {
  if (!pathExists(targetPath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(targetPath, "utf-8"));
  } catch (error) {
    return fallback;
  }
}

function writeJsonFile(targetPath, payload) {
  ensureDirSync(path.dirname(targetPath));
  fs.writeFileSync(targetPath, JSON.stringify(payload, null, 2), "utf-8");
}

function relativeToRoot(targetPath) {
  return path.relative(ROOT, targetPath) || ".";
}

function summarizeLocalFile(targetPath) {
  if (!pathExists(targetPath)) {
    return {
      exists: false,
      path: relativeToRoot(targetPath),
      modifiedAt: null,
      size: 0,
    };
  }

  const stats = fs.statSync(targetPath);
  return {
    exists: true,
    path: relativeToRoot(targetPath),
    modifiedAt: stats.mtime.toISOString(),
    size: stats.size,
  };
}

function readStudioSettings() {
  const payload = readJsonFile(STUDIO_SETTINGS_PATH, {});
  return {
    ...DEFAULT_STUDIO_SETTINGS,
    ...(payload && typeof payload === "object" ? payload : {}),
  };
}

function writeStudioSettings(partial) {
  const next = {
    ...readStudioSettings(),
    ...partial,
  };
  writeJsonFile(STUDIO_SETTINGS_PATH, next);
  return next;
}

function getStudioPreviewPath(crawlMode = DEFAULT_XHS_CRAWL_MODE) {
  return path.join(STUDIO_NEWS_DIR, `${crawlMode}.preview.news.json`);
}

function getStudioPublishCandidatePath(crawlMode = DEFAULT_XHS_CRAWL_MODE) {
  return path.join(STUDIO_NEWS_DIR, `${crawlMode}.publish.candidate.news.json`);
}

function loadStudioNewsConfig() {
  const settings = readStudioSettings();
  const creatorTarget = readCreatorTarget();
  const searchKeywords = readListFile(SECRET_FILES.searchKeywords);
  const targetUserIds = readListFile(SECRET_FILES.targetUserIds);
  const targetNicknames = readListFile(SECRET_FILES.targetNicknames);
  const fallbackCreatorTarget = targetUserIds.find((value) => isCreatorUserId(value)) || "";
  return {
    crawlMode: settings.crawlMode || DEFAULT_STUDIO_SETTINGS.crawlMode,
    loginType: settings.loginType || DEFAULT_STUDIO_SETTINGS.loginType,
    headless: Boolean(settings.headless),
    maxNotesCount: Number(settings.maxNotesCount) || DEFAULT_STUDIO_SETTINGS.maxNotesCount,
    creatorTarget: creatorTarget || fallbackCreatorTarget,
    searchKeywords: searchKeywords.length ? searchKeywords : DEFAULT_XHS_SEARCH_KEYWORDS,
    targetUserIds: targetUserIds.length ? targetUserIds : DEFAULT_XHS_TARGET_USER_IDS,
    targetNicknames: targetNicknames.length ? targetNicknames : DEFAULT_XHS_TARGET_NICKNAMES,
    hasCookies: pathExists(SECRET_FILES.cookies),
  };
}

function saveStudioNewsConfig(input) {
  const nextSettings = {};
  if (typeof input.crawlMode === "string" && input.crawlMode.trim()) {
    nextSettings.crawlMode = input.crawlMode.trim().toLowerCase();
  }
  if (typeof input.loginType === "string" && input.loginType.trim()) {
    nextSettings.loginType = input.loginType.trim().toLowerCase();
  }
  if (typeof input.headless === "boolean") {
    nextSettings.headless = input.headless;
  }
  if (input.maxNotesCount !== undefined) {
    const normalized = Number(input.maxNotesCount);
    if (Number.isFinite(normalized) && normalized > 0) {
      nextSettings.maxNotesCount = Math.floor(normalized);
    }
  }
  if (Object.keys(nextSettings).length) {
    writeStudioSettings(nextSettings);
  }

  if ("creatorTarget" in input) {
    writeCreatorTarget(input.creatorTarget);
  }
  if ("searchKeywords" in input) {
    writeListFile(SECRET_FILES.searchKeywords, input.searchKeywords);
  }
  if ("targetUserIds" in input) {
    writeListFile(SECRET_FILES.targetUserIds, input.targetUserIds);
  }
  if ("targetNicknames" in input) {
    writeListFile(SECRET_FILES.targetNicknames, input.targetNicknames);
  }
  if (input.clearCookies === true) {
    removeFileIfExists(SECRET_FILES.cookies);
  } else if (typeof input.cookieText === "string" && input.cookieText.trim()) {
    writeTextFile(SECRET_FILES.cookies, input.cookieText.trim() + "\n");
  }
}

function extractCreatorIdFromTarget(value) {
  const target = normalizeCreatorTarget(value);
  if (!target) return "";
  if (isCreatorUserId(target)) return target;
  if (!isCreatorProfileUrl(target)) return "";

  try {
    const parsed = new URL(target);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 3 && parts[0] === "user" && parts[1] === "profile") {
      return parts[2].trim();
    }
  } catch (_error) {
    return "";
  }

  return "";
}

function getCreatorIdForGitHubSync(config) {
  return (
    extractCreatorIdFromTarget(config.creatorTarget) ||
    config.targetUserIds.find((value) => isCreatorUserId(value)) ||
    ""
  );
}

function resolvePythonBinary() {
  for (const candidate of PYTHON_CANDIDATES) {
    if (!candidate) continue;
    if (candidate === "python3") return candidate;
    if (pathExists(candidate)) return candidate;
  }
  return "python3";
}

function getRawJsonRegex(crawlMode) {
  if (crawlMode === "creator") return /^creator_contents_.*\.json$/;
  if (crawlMode === "search") return /^search_contents_.*\.json$/;
  return /_contents_.*\.json$/;
}

function parseGitHubRepoSlug(remoteUrl) {
  const value = String(remoteUrl || "").trim();
  if (!value) return "";

  const sshMatch = value.match(/^git@github\.com:([^/]+\/[^/]+?)(?:\.git)?$/i);
  if (sshMatch) return sshMatch[1];

  const httpsMatch = value.match(/^https?:\/\/github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/i);
  if (httpsMatch) return httpsMatch[1];

  return "";
}

async function getOriginGitHubRepo() {
  try {
    const { stdout } = await execFileAsync("git", ["remote", "get-url", "origin"], { cwd: ROOT });
    const remoteUrl = stdout.trim();
    const repo = parseGitHubRepoSlug(remoteUrl);
    return {
      repo,
      remoteUrl,
      error: repo ? null : "Origin remote is not a GitHub repository URL.",
    };
  } catch (error) {
    return {
      repo: "",
      remoteUrl: "",
      error: String(error.message || error),
    };
  }
}

async function getGitHubCliStatus() {
  try {
    await execFileAsync("gh", ["--version"], { cwd: ROOT });
  } catch (error) {
    return {
      cliAvailable: false,
      authenticated: false,
      error: "GitHub CLI is not installed or not available in PATH.",
    };
  }

  try {
    await execFileAsync("gh", ["auth", "status"], { cwd: ROOT });
    return {
      cliAvailable: true,
      authenticated: true,
      error: null,
    };
  } catch (error) {
    const stderr = String(error.stderr || "").trim();
    const stdout = String(error.stdout || "").trim();
    const detail = stderr || stdout || String(error.message || error);
    return {
      cliAvailable: true,
      authenticated: false,
      error: detail || "GitHub CLI is not authenticated. Run `gh auth login` first.",
    };
  }
}

function loadGitHubSyncState() {
  return readJsonFile(STUDIO_GITHUB_SYNC_PATH, {
    lastSyncAt: null,
    repo: "",
    secrets: [],
  });
}

function saveGitHubSyncState(payload) {
  writeJsonFile(STUDIO_GITHUB_SYNC_PATH, payload);
}

function getLatestRawJsonPath(crawlMode = DEFAULT_XHS_CRAWL_MODE) {
  if (!pathExists(RAW_JSON_DIR)) return null;
  const filePattern = getRawJsonRegex(crawlMode);
  const files = fs
    .readdirSync(RAW_JSON_DIR)
    .filter((file) => filePattern.test(file))
    .map((file) => path.join(RAW_JSON_DIR, file));
  if (!files.length) return null;
  files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return files[0];
}

function summarizeRawJson(crawlMode = DEFAULT_XHS_CRAWL_MODE) {
  const latestPath = getLatestRawJsonPath(crawlMode);
  if (!latestPath) {
    return {
      exists: false,
      path: null,
      recordCount: 0,
      modifiedAt: null,
    };
  }

  let recordCount = 0;
  try {
    const payload = readJsonFile(latestPath, []);
    if (Array.isArray(payload)) {
      recordCount = payload.length;
    } else if (payload && typeof payload === "object") {
      recordCount = 1;
    }
  } catch (error) {
    recordCount = 0;
  }

  return {
    exists: true,
    path: relativeToRoot(latestPath),
    recordCount,
    modifiedAt: fs.statSync(latestPath).mtime.toISOString(),
  };
}

function loadNewsItems(filePath) {
  const payload = readJsonFile(filePath, { news: [] });
  if (payload && Array.isArray(payload.news)) {
    return payload.news;
  }
  return [];
}

function summarizeNewsFile(filePath) {
  if (!pathExists(filePath)) {
    return {
      exists: false,
      path: relativeToRoot(filePath),
      count: 0,
      latestDate: null,
      items: [],
      modifiedAt: null,
    };
  }

  const items = loadNewsItems(filePath);
  return {
    exists: true,
    path: relativeToRoot(filePath),
    count: items.length,
    latestDate: items[0]?.date || null,
    items,
    modifiedAt: fs.statSync(filePath).mtime.toISOString(),
  };
}

function computeNewsDiff(currentItems, draftItems) {
  const currentMap = new Map(currentItems.map((item) => [item.id, item]));
  const draftMap = new Map(draftItems.map((item) => [item.id, item]));

  let addedCount = 0;
  for (const id of draftMap.keys()) {
    if (!currentMap.has(id)) addedCount += 1;
  }

  return {
    addedCount,
    preservedCount: currentItems.length,
  };
}

function loadNewsPayload(filePath) {
  const payload = readJsonFile(filePath, { news: [] });
  if (payload && Array.isArray(payload.news)) {
    return payload;
  }
  return { news: [] };
}

function normalizeNewsDate(item) {
  const parsed = new Date(item?.date || "");
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function mergeNewsItemsById(currentItems, candidateItems) {
  const currentIds = new Set(
    currentItems.map((item) => String(item?.id || "").trim()).filter(Boolean),
  );
  const newItems = [];

  for (const candidate of candidateItems) {
    const id = String(candidate?.id || "").trim();
    if (!id || currentIds.has(id)) continue;
    currentIds.add(id);
    newItems.push(candidate);
  }

  newItems.sort((a, b) => normalizeNewsDate(b) - normalizeNewsDate(a));
  return {
    mergedItems: [...newItems, ...currentItems],
    addedCount: newItems.length,
    preservedCount: currentItems.length,
  };
}

async function getGitSummary() {
  try {
    const { stdout } = await execFileAsync(
      "git",
      [
        "status",
        "--short",
        "--",
        "public/news.json",
        "public/xhs_news_images",
        "public/xhs_news_videos",
      ],
      { cwd: ROOT },
    );
    const changedFiles = stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    return {
      dirty: changedFiles.length > 0,
      changedFiles,
    };
  } catch (error) {
    return {
      dirty: false,
      changedFiles: [],
      error: String(error.message || error),
    };
  }
}

function appendTaskLog(task, chunk) {
  const text = String(chunk || "");
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return;
  ensureDirSync(path.dirname(STUDIO_LOG_PATH));

  for (const line of lines) {
    const stamped = `[${new Date().toISOString()}] ${line}`;
    task.logs.push(stamped);
    if (task.logs.length > 400) {
      task.logs.shift();
    }
    fs.appendFileSync(STUDIO_LOG_PATH, stamped + "\n");
  }
}

function serializeTask(task) {
  return {
    id: task.id,
    action: task.action,
    status: task.status,
    startedAt: task.startedAt,
    finishedAt: task.finishedAt,
    error: task.error,
    pid: task.pid,
    logs: task.logs.slice(-200),
  };
}

function ensureIdleTask() {
  if (newsTask.status === "running") {
    const error = new Error("A studio news task is already running.");
    error.statusCode = 409;
    throw error;
  }
}

function runProcess(task, { command, args, env, cwd, label, input }) {
  return new Promise((resolve, reject) => {
    appendTaskLog(task, `> ${label}`);
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    task.pid = child.pid || null;

    if (typeof input === "string" || Buffer.isBuffer(input)) {
      child.stdin.write(input);
    }
    child.stdin.end();

    child.stdout.on("data", (chunk) => appendTaskLog(task, chunk.toString("utf-8")));
    child.stderr.on("data", (chunk) => appendTaskLog(task, chunk.toString("utf-8")));
    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      task.pid = null;
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${label} failed with exit code ${code}`));
      }
    });
  });
}

function startNewsTask(action, runner) {
  ensureIdleTask();

  newsTask = {
    id: `${Date.now()}`,
    action,
    status: "running",
    startedAt: new Date().toISOString(),
    finishedAt: null,
    logs: [],
    error: null,
    pid: null,
  };

  ensureDirSync(path.dirname(STUDIO_LOG_PATH));
  fs.writeFileSync(STUDIO_LOG_PATH, "", "utf-8");
  appendTaskLog(newsTask, `Studio task started: ${action}`);

  Promise.resolve()
    .then(() => runner(newsTask))
    .then(() => {
      newsTask.status = "succeeded";
      newsTask.finishedAt = new Date().toISOString();
      appendTaskLog(newsTask, `Studio task finished: ${action}`);
    })
    .catch((error) => {
      newsTask.status = "failed";
      newsTask.error = String(error.message || error);
      newsTask.finishedAt = new Date().toISOString();
      appendTaskLog(newsTask, `Studio task failed: ${newsTask.error}`);
    });

  return serializeTask(newsTask);
}

function buildPipelineEnv(config, overrides = {}) {
  const creatorTarget = String(overrides.creatorTarget || config.creatorTarget || "").trim();
  const isCreatorUrl = isCreatorProfileUrl(creatorTarget);
  return {
    ...process.env,
    XHS_CRAWLER_MODE: overrides.crawlMode || config.crawlMode || DEFAULT_XHS_CRAWL_MODE,
    XHS_LOGIN_TYPE: overrides.loginType || config.loginType,
    XHS_HEADLESS: String(
      overrides.headless !== undefined ? overrides.headless : config.headless,
    ),
    XHS_SEARCH_KEYWORDS: config.searchKeywords.join(","),
    XHS_CREATOR_URL: isCreatorUrl ? creatorTarget : "",
    XHS_CREATOR_ID: !isCreatorUrl ? creatorTarget : "",
    XHS_TARGET_USER_ID: config.targetUserIds.join(","),
    XHS_TARGET_NICKNAMES: config.targetNicknames.join(","),
    XHS_OUTPUT_NEWS_JSON: overrides.outputPath,
    XHS_MAX_NOTES_COUNT: String(
      overrides.maxNotesCount !== undefined ? overrides.maxNotesCount : config.maxNotesCount,
    ),
    XHS_LOCALIZE_MEDIA: String(
      overrides.localizeMedia !== undefined ? overrides.localizeMedia : true,
    ),
    XHS_RAW_JSON_PATH: overrides.rawJsonPath || "",
    XHS_COOKIE_EXPORT_PATH: SECRET_FILES.cookies,
    SKIP_MEDIACRAWLER: overrides.skipCrawler ? "true" : "false",
  };
}

async function runStudioNewsPipeline(task, overrides = {}) {
  const config = loadStudioNewsConfig();
  const env = buildPipelineEnv(config, overrides);
  const pythonBinary = resolvePythonBinary();
  await runProcess(task, {
    command: pythonBinary,
    args: ["run_xhs_pipeline_mediacrawler.py"],
    env,
    cwd: ROOT,
    label: `${path.basename(pythonBinary)} run_xhs_pipeline_mediacrawler.py`,
  });
}

async function publishDraftWithMerge(task) {
  const config = loadStudioNewsConfig();
  const latestRawJsonPath = getLatestRawJsonPath(config.crawlMode);
  const publishCandidatePath = getStudioPublishCandidatePath(config.crawlMode);
  if (!latestRawJsonPath) {
    throw new Error("No raw creator JSON found. Run a preview sync first.");
  }

  await runStudioNewsPipeline(task, {
    outputPath: publishCandidatePath,
    localizeMedia: true,
    skipCrawler: true,
    rawJsonPath: latestRawJsonPath,
  });

  const currentPayload = loadNewsPayload(CURRENT_NEWS_PATH);
  const candidatePayload = loadNewsPayload(publishCandidatePath);
  const { mergedItems, addedCount, preservedCount } = mergeNewsItemsById(
    currentPayload.news,
    candidatePayload.news,
  );

  if (addedCount === 0) {
    appendTaskLog(task, "No new XHS note IDs were found. Existing public/news.json was preserved.");
    return;
  }

  writeJsonFile(CURRENT_NEWS_PATH, { news: mergedItems });
  appendTaskLog(
    task,
    `Merged ${addedCount} new XHS note(s) into public/news.json and kept ${preservedCount} existing site item(s) unchanged.`,
  );
}

async function syncGitHubXhsCredentials(task) {
  const config = loadStudioNewsConfig();
  const cookieText = readTextFile(SECRET_FILES.cookies).trim();
  if (!cookieText) {
    throw new Error("No local XHS cookie is available. Run a preview sync or save a fresh cookie first.");
  }

  const creatorId = getCreatorIdForGitHubSync(config);
  if (!creatorId) {
    throw new Error("No stable creator user ID is configured for GitHub sync.");
  }

  const repoInfo = await getOriginGitHubRepo();
  if (!repoInfo.repo) {
    throw new Error(repoInfo.error || "Could not resolve the GitHub repository from origin.");
  }

  const ghStatus = await getGitHubCliStatus();
  if (!ghStatus.cliAvailable) {
    throw new Error(ghStatus.error || "GitHub CLI is not available.");
  }
  if (!ghStatus.authenticated) {
    throw new Error(
      ghStatus.error || "GitHub CLI is not authenticated. Run `gh auth login` first.",
    );
  }

  const targetUserIds = uniquePreserveOrder([creatorId, ...config.targetUserIds]).join(",");
  const secretsToSync = [
    { name: "XHS_COOKIES", value: cookieText },
    { name: "XHS_CREATOR_ID", value: creatorId },
    {
      name: "XHS_CREATOR_URL",
      value: creatorId,
      note: "Using the stable creator ID here to override any stale creator URL secret.",
    },
    { name: "XHS_TARGET_USER_ID", value: targetUserIds },
  ];

  if (Array.isArray(config.targetNicknames) && config.targetNicknames.length) {
    secretsToSync.push({
      name: "XHS_TARGET_NICKNAMES",
      value: config.targetNicknames.join(","),
    });
  }

  for (const secret of secretsToSync) {
    if (secret.note) {
      appendTaskLog(task, secret.note);
    }
    await runProcess(task, {
      command: "gh",
      args: ["secret", "set", secret.name, "--repo", repoInfo.repo],
      env: process.env,
      cwd: ROOT,
      label: `gh secret set ${secret.name} --repo ${repoInfo.repo}`,
      input: `${secret.value}\n`,
    });
  }

  saveGitHubSyncState({
    lastSyncAt: new Date().toISOString(),
    repo: repoInfo.repo,
    secrets: secretsToSync.map((secret) => secret.name),
    creatorId,
    localCookiePath: relativeToRoot(SECRET_FILES.cookies),
  });

  appendTaskLog(
    task,
    `Synced ${secretsToSync.length} GitHub secret(s) for ${repoInfo.repo}.`,
  );
}

async function commitAndPushNews(task, message) {
  await runProcess(task, {
    command: "git",
    args: [
      "add",
      "public/news.json",
      "public/xhs_news_images",
      "public/xhs_news_videos",
    ],
    env: process.env,
    cwd: ROOT,
    label: "git add public/news.json public/xhs_news_images public/xhs_news_videos",
  });

  const { stdout } = await execFileAsync(
    "git",
    ["diff", "--cached", "--name-only"],
    { cwd: ROOT },
  );
  if (!stdout.trim()) {
    appendTaskLog(task, "No staged XHS news changes to commit.");
    return;
  }

  await runProcess(task, {
    command: "git",
    args: ["commit", "-m", message],
    env: process.env,
    cwd: ROOT,
    label: `git commit -m ${JSON.stringify(message)}`,
  });

  await runProcess(task, {
    command: "git",
    args: ["push"],
    env: process.env,
    cwd: ROOT,
    label: "git push",
  });
}

async function buildCredentialSummary(config) {
  const localCookie = summarizeLocalFile(SECRET_FILES.cookies);
  const repoInfo = await getOriginGitHubRepo();
  const ghStatus = await getGitHubCliStatus();
  const syncState = loadGitHubSyncState();
  const creatorId = getCreatorIdForGitHubSync(config);
  const lastSyncAt = syncState.lastSyncAt || null;
  const cookieModifiedAt = localCookie.modifiedAt;
  const needsSync =
    Boolean(localCookie.exists && cookieModifiedAt) &&
    (!lastSyncAt || new Date(cookieModifiedAt).getTime() > new Date(lastSyncAt).getTime());

  return {
    localCookie,
    github: {
      repo: repoInfo.repo || null,
      remoteUrl: repoInfo.remoteUrl || null,
      creatorId: creatorId || null,
      cliAvailable: ghStatus.cliAvailable,
      authenticated: ghStatus.authenticated,
      error: ghStatus.error || repoInfo.error || null,
      lastSyncAt,
      syncedSecrets: Array.isArray(syncState.secrets) ? syncState.secrets : [],
      needsSync,
    },
  };
}

async function buildStudioNewsState() {
  ensureDirSync(STUDIO_NEWS_DIR);
  const config = loadStudioNewsConfig();
  const previewPath = getStudioPreviewPath(config.crawlMode);
  const publishCandidatePath = getStudioPublishCandidatePath(config.crawlMode);
  const current = summarizeNewsFile(CURRENT_NEWS_PATH);
  const draft = summarizeNewsFile(previewPath);
  const raw = summarizeRawJson(config.crawlMode);
  const diff = computeNewsDiff(current.items, draft.items);
  const git = await getGitSummary();
  const credentials = await buildCredentialSummary(config);

  return {
    config,
    current,
    draft,
    raw,
    diff,
    git,
    credentials,
    task: serializeTask(newsTask),
    runtime: {
      apiBase: "http://127.0.0.1:3001",
      pythonBinary: resolvePythonBinary(),
      previewPath: relativeToRoot(previewPath),
      publishCandidatePath: relativeToRoot(publishCandidatePath),
    },
  };
}

app.get("/api/studio/news/state", async (req, res) => {
  res.json(await buildStudioNewsState());
});

app.post("/api/studio/news/config", async (req, res) => {
  saveStudioNewsConfig(req.body || {});
  res.json(await buildStudioNewsState());
});

app.post("/api/studio/news/sync", async (req, res) => {
  try {
    saveStudioNewsConfig(req.body || {});
    const nextConfig = loadStudioNewsConfig();
    const previewPath = getStudioPreviewPath(nextConfig.crawlMode);
    const task = startNewsTask("sync-preview", (taskState) =>
      runStudioNewsPipeline(taskState, {
        outputPath: previewPath,
        localizeMedia: false,
        skipCrawler: false,
        loginType: nextConfig.loginType,
        headless: nextConfig.headless,
      }),
    );
    res.status(202).json({ task });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: String(error.message || error) });
  }
});

app.post("/api/studio/news/publish", async (req, res) => {
  try {
    saveStudioNewsConfig(req.body || {});
    const nextConfig = loadStudioNewsConfig();
    const latestRawJsonPath = getLatestRawJsonPath(nextConfig.crawlMode);
    if (!latestRawJsonPath) {
      return res.status(400).json({
        error: "No raw creator JSON found. Run a preview sync first.",
      });
    }

    const task = startNewsTask("publish-merge", (taskState) =>
      publishDraftWithMerge(taskState),
    );
    res.status(202).json({ task });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: String(error.message || error) });
  }
});

app.post("/api/studio/news/commit", async (req, res) => {
  try {
    const message =
      (typeof req.body?.message === "string" && req.body.message.trim()) ||
      "chore: update XHS news from local studio";
    const task = startNewsTask("commit-and-push", (taskState) =>
      commitAndPushNews(taskState, message),
    );
    res.status(202).json({ task });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: String(error.message || error) });
  }
});

app.post("/api/studio/news/credentials/sync", async (req, res) => {
  try {
    const task = startNewsTask("sync-github-credentials", (taskState) =>
      syncGitHubXhsCredentials(taskState),
    );
    res.status(202).json({ task });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: String(error.message || error) });
  }
});

app.get("/api/vpx-reading-club", async (req, res) => {
  try {
    const url = `https://api.bilibili.com/x/series/archives?mid=${MID}&series_id=${SERIES_ID}&pn=1&ps=50`;

    const r = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
      },
    });

    if (!r.ok) {
      return res.status(500).json({ videos: [], error: `Bili API HTTP ${r.status}` });
    }

    const json = await r.json();
    const archives = (json && json.data && json.data.archives) ? json.data.archives : [];

    const videos = archives.map((v) => ({
      bvid: v.bvid,
      title: v.title,
      cover: normalizeCover(v.pic),
      description: v.description || "",
      publishedAt: v.pubdate ? new Date(v.pubdate * 1000).toISOString() : null,
    }));

    res.json({ videos });
  } catch (e) {
    res.status(500).json({ videos: [], error: String(e) });
  }
});

app.get("/api/img", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url || typeof url !== "string") {
      return res.status(400).send("Missing url");
    }

    const u = new URL(url);
    const host = u.hostname;
    if (!host.endsWith("hdslb.com") && !host.endsWith("biliimg.com")) {
      return res.status(403).send("Forbidden host");
    }

    const r = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
        referer: "https://www.bilibili.com/",
      },
    });

    if (!r.ok) {
      return res.status(r.status).send(`Upstream HTTP ${r.status}`);
    }

    const contentType = r.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");

    const buf = Buffer.from(await r.arrayBuffer());
    res.send(buf);
  } catch (e) {
    res.status(500).send(String(e));
  }
});

app.get("/api/xhs-media", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url || typeof url !== "string") {
      return res.status(400).send("Missing url");
    }

    const u = new URL(url);
    if (!isAllowedXhsMediaHost(u.hostname)) {
      return res.status(403).send("Forbidden host");
    }

    const r = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
        accept: "*/*",
      },
    });

    if (!r.ok) {
      return res.status(r.status).send(`Upstream HTTP ${r.status}`);
    }

    const contentType = r.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");

    const buf = Buffer.from(await r.arrayBuffer());
    res.send(buf);
  } catch (e) {
    res.status(500).send(String(e));
  }
});

app.get("/api/vpx-news", (req, res) => {
  try {
    const raw = fs.readFileSync(CURRENT_NEWS_PATH, "utf-8");
    const json = JSON.parse(raw);
    res.json({ news: Array.isArray(json.news) ? json.news : [] });
  } catch (e) {
    res.status(500).json({
      news: [],
      error: e?.message || "Failed to read news.json",
    });
  }
});

app.listen(3001, "127.0.0.1", () => {
  console.log("Studio API running: http://127.0.0.1:3001");
});
