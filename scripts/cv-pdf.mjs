#!/usr/bin/env node
// Prints the CV page to a PDF.
//
//   npm run cv:pdf
//
// Builds the site, serves ./dist on a spare port, and has a headless Chrome
// or Chromium print /cv/ using the print rules in src/styles/global.css. The
// result lands in ./public, so the next build ships it and the Download
// button on /cv/ appears. Edit src/lib/cv.ts, run this, commit both.
//
// No dependencies on purpose: a browser you already have does the printing.
// Set CHROME_PATH if yours is somewhere this does not look.

import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");

// The filename is whatever lib/cv.ts says it is, so the page's download link
// and this script cannot disagree.
const declared = /pdf:\s*"([^"]+)"/.exec(readFileSync(join(root, "src/lib/cv.ts"), "utf8"));
if (!declared) fail("Could not find the `pdf` path in src/lib/cv.ts.");
const out = join(root, "public", declared[1]);

function fail(message) {
  console.error(`cv:pdf  ${message}`);
  process.exit(1);
}

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  ].filter(Boolean);
  for (const path of candidates) if (existsSync(path)) return path;

  for (const name of ["google-chrome-stable", "google-chrome", "chromium", "chromium-browser", "brave", "brave-browser"]) {
    const found = spawnSync("which", [name], { encoding: "utf8" });
    if (found.status === 0 && found.stdout.trim()) return found.stdout.trim();
  }
  return null;
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

/** Just enough of a static server to hand the browser one page and its assets. */
function serve() {
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
    let file = join(dist, path);
    if (!file.startsWith(dist)) return res.writeHead(403).end();
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!existsSync(file)) return res.writeHead(404).end();
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

const browser = findBrowser();
if (!browser) fail("No Chrome or Chromium found. Install one, or set CHROME_PATH to its binary.");

console.log("cv:pdf  building the site");
const build = spawnSync(process.execPath, [join(root, "node_modules/astro/bin/astro.mjs"), "build"], {
  cwd: root,
  stdio: ["ignore", "ignore", "inherit"],
});
if (build.status !== 0) fail("The build failed, so there is no page to print.");

const server = await serve();
const { port } = server.address();
const url = `http://127.0.0.1:${port}/cv/`;

console.log(`cv:pdf  printing ${url}`);
// Asynchronous on purpose. The server above lives in this process, so waiting
// on the browser synchronously would stop it answering the browser's requests.
const status = await new Promise((resolve) => {
  const child = spawn(
    browser,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      // Long enough for the web fonts to land before the page is captured.
      "--virtual-time-budget=5000",
      `--print-to-pdf=${out}`,
      url,
    ],
    { stdio: "ignore" },
  );
  const timer = setTimeout(() => child.kill(), 60_000);
  child.on("exit", (code) => {
    clearTimeout(timer);
    resolve(code);
  });
  child.on("error", () => {
    clearTimeout(timer);
    resolve(1);
  });
});
server.close();

if (status !== 0 || !existsSync(out)) fail("The browser did not produce a PDF.");

const kb = Math.round(statSync(out).size / 1024);
console.log(`cv:pdf  wrote ${out.replace(root, "")} (${kb} kB)`);
console.log("cv:pdf  commit it with the change to src/lib/cv.ts; the next build ships it.");
