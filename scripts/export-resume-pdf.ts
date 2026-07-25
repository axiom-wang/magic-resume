import { spawn, type ChildProcess } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";
import { RESUME_EXPORT_ROOT_SELECTOR } from "../src/lib/resumeExport";
import {
  TEMPLATE_PREVIEW_HEIGHT_PX,
  TEMPLATE_PREVIEW_WIDTH_PX,
} from "../src/lib/templatePreview";
import type { ResumeData } from "../src/types/resume";

const EXPORT_SERVER_HOST = "127.0.0.1";
const EXPORT_SERVER_PORT = 4174;
const EXPORT_SERVER_URL = `http://${EXPORT_SERVER_HOST}:${EXPORT_SERVER_PORT}`;
const VITE_CLI_FILE = path.resolve(
  process.cwd(),
  "node_modules",
  "vite",
  "bin",
  "vite.js"
);
const MIN_NODE_MAJOR = 20;
const MIN_NODE_MINOR = 19;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseArgs = (argv: string[]) => {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      args[key] = "true";
      continue;
    }
    args[key] = value;
    i += 1;
  }
  return args;
};

const assertSupportedNodeVersion = () => {
  const [major, minor] = process.versions.node
    .split(".")
    .map((segment) => Number(segment));

  if (
    Number.isNaN(major) ||
    Number.isNaN(minor) ||
    major < MIN_NODE_MAJOR ||
    (major === MIN_NODE_MAJOR && minor < MIN_NODE_MINOR)
  ) {
    throw new Error(
      `Node.js ${MIN_NODE_MAJOR}.${MIN_NODE_MINOR}+ is required. Current runtime is ${process.versions.node}.`
    );
  }
};

const waitForServer = async (timeoutMs = 60_000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(EXPORT_SERVER_URL);
      if (response.ok || response.status === 404) {
        return;
      }
    } catch {
      // keep polling
    }
    await sleep(500);
  }

  throw new Error(`Timed out waiting for ${EXPORT_SERVER_URL}`);
};

const startDevServer = (): ChildProcess =>
  spawn(
    process.execPath,
    [
      VITE_CLI_FILE,
      "dev",
      "--host",
      EXPORT_SERVER_HOST,
      "--port",
      String(EXPORT_SERVER_PORT),
      "--strictPort",
    ],
    {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env,
    }
  );

const stopProcess = (child: ChildProcess | null) => {
  if (!child || child.exitCode !== null) return;
  child.kill("SIGTERM");
};

const ensurePlaywrightBrowser = async () => {
  try {
    const browser = await chromium.launch();
    await browser.close();
  } catch (error) {
    throw new Error(
      "Playwright Chromium is not installed. Run `pnpm exec playwright install chromium` first.",
      { cause: error }
    );
  }
};

const loadResumeJson = async (inputPath: string): Promise<ResumeData> => {
  const absolutePath = path.resolve(process.cwd(), inputPath);
  const raw = await readFile(absolutePath, "utf8");
  const parsed = JSON.parse(raw) as ResumeData;

  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Invalid resume JSON: ${absolutePath}`);
  }
  if (!parsed.basic?.name) {
    throw new Error(`Resume JSON missing basic.name: ${absolutePath}`);
  }

  return {
    ...parsed,
    id: parsed.id || "export-resume",
    createdAt: parsed.createdAt || new Date(0).toISOString(),
    updatedAt: parsed.updatedAt || new Date(0).toISOString(),
    templateId: parsed.templateId || "kami",
    certificates: parsed.certificates || [],
    customData: parsed.customData || {},
    draggingProjectId: parsed.draggingProjectId ?? null,
    activeSection: parsed.activeSection || "basic",
  };
};

const main = async () => {
  assertSupportedNodeVersion();

  const args = parseArgs(process.argv.slice(2));
  const input = args.input;
  const output = args.output;

  if (!input || !output) {
    console.error(
      "Usage: pnpm export:resume-pdf -- --input path/to/resume.json --output path/to/resume.pdf"
    );
    process.exitCode = 1;
    return;
  }

  const resumeData = await loadResumeJson(input);
  const outputPath = path.resolve(process.cwd(), output);
  await mkdir(path.dirname(outputPath), { recursive: true });

  await ensurePlaywrightBrowser();

  const devServer = startDevServer();

  try {
    console.log(`Starting preview server on ${EXPORT_SERVER_URL}...`);
    await waitForServer();
    console.log("Preview server is ready.");

    const browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: {
        width: TEMPLATE_PREVIEW_WIDTH_PX,
        height: TEMPLATE_PREVIEW_HEIGHT_PX,
      },
      deviceScaleFactor: 1,
      colorScheme: "light",
    });

    await page.addInitScript((data) => {
      (window as Window).__MAGIC_RESUME_DATA__ = data as ResumeData;
    }, resumeData);

    const previewUrl = `${EXPORT_SERVER_URL}/app/preview-resume?snapshot=1`;
    await page.goto(previewUrl, { waitUntil: "networkidle" });
    await page.waitForSelector(RESUME_EXPORT_ROOT_SELECTOR, {
      timeout: 30_000,
    });
    await page.evaluate(async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
    });
    await sleep(300);

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      preferCSSPageSize: false,
    });

    await browser.close();
    console.log(`PDF written: ${outputPath}`);
  } finally {
    stopProcess(devServer);
  }
};

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
