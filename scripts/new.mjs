#!/usr/bin/env node
// Content scaffolder. Run `npm run new` to interactively create a writing or
// work entry with schema-correct frontmatter, then write the body in any
// editor and commit. Keeps the frontmatter honest so the build never trips
// over a typo'd field.
//
// Schema source of truth: src/content.config.ts (keep these in sync).

import {
  intro,
  outro,
  select,
  text,
  confirm,
  isCancel,
  cancel,
  note,
  log,
} from "@clack/prompts";
import { mkdir, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Quote + escape a value for safe single-line YAML.
const yamlStr = (s) => `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

const yamlList = (arr) =>
  arr.length === 0 ? "[]" : `[${arr.map((t) => yamlStr(t)).join(", ")}]`;

const today = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const exists = async (p) => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};

const bail = (value) => {
  if (isCancel(value)) {
    cancel("Cancelled. Nothing written.");
    process.exit(0);
  }
  return value;
};

async function main() {
  intro("New content");

  const type = bail(
    await select({
      message: "What are you creating?",
      options: [
        { value: "writing", label: "Writing", hint: "a post / note" },
        { value: "work", label: "Work", hint: "a project / case study" },
      ],
    })
  );

  const title = bail(
    await text({
      message: "Title",
      placeholder: type === "writing" ? "On shipping small" : "pyxyll.com",
      validate: (v) => (v.trim().length === 0 ? "Title is required" : undefined),
    })
  );

  const defaultSlug = slugify(title);
  const slug = bail(
    await text({
      message: "Slug (filename)",
      initialValue: defaultSlug,
      validate: (v) => {
        if (v.trim().length === 0) return "Slug is required";
        if (!/^[a-z0-9-]+$/.test(v)) return "Use lowercase letters, numbers, hyphens only";
        return undefined;
      },
    })
  );

  const dir = join(ROOT, "src", "content", type);
  const filePath = join(dir, `${slug}.mdx`);

  if (await exists(filePath)) {
    const overwrite = bail(
      await confirm({
        message: `src/content/${type}/${slug}.mdx already exists. Overwrite?`,
        initialValue: false,
      })
    );
    if (!overwrite) {
      cancel("Left the existing file untouched.");
      process.exit(0);
    }
  }

  let frontmatter;
  let body;

  if (type === "writing") {
    const description = bail(
      await text({
        message: "Description",
        placeholder: "One sentence that shows in lists, OG cards, and search.",
        validate: (v) => (v.trim().length === 0 ? "Description is required" : undefined),
      })
    );

    const tagsRaw = bail(
      await text({
        message: "Tags",
        placeholder: "comma,separated  (leave blank for none)",
      })
    );
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const draft = bail(
      await confirm({
        message: "Start as a draft? (hidden from the site until you flip it)",
        initialValue: true,
      })
    );

    const lines = [
      "---",
      `title: ${yamlStr(title)}`,
      `description: ${yamlStr(description)}`,
      `publishedAt: ${today()}`,
      `tags: ${yamlList(tags)}`,
      `draft: ${draft}`,
      "---",
    ];
    frontmatter = lines.join("\n");
    body = `\n\nStart writing here.\n`;
  } else {
    const summary = bail(
      await text({
        message: "Summary",
        placeholder: "One line that shows in the work list and OG card.",
        validate: (v) => (v.trim().length === 0 ? "Summary is required" : undefined),
      })
    );

    const category = bail(
      await text({
        message: "Category",
        placeholder: "COSMIC, Web apps, Sites, Homelab…",
        validate: (v) => (v.trim().length === 0 ? "Category is required" : undefined),
      })
    );

    const role = bail(
      await text({
        message: "Role (optional)",
        placeholder: "e.g. Designer & engineer  (leave blank to omit)",
      })
    );

    const stackRaw = bail(
      await text({
        message: "Stack",
        placeholder: "comma,separated  (leave blank for none)",
      })
    );
    const stack = stackRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const url = bail(
      await text({ message: "Live URL (optional)", placeholder: "https://… (leave blank to omit)" })
    );
    const repo = bail(
      await text({ message: "Repo URL (optional)", placeholder: "https://… (leave blank to omit)" })
    );

    const lines = [
      "---",
      `title: ${yamlStr(title)}`,
      `summary: ${yamlStr(summary)}`,
      `category: ${yamlStr(category.trim())}`,
    ];
    if (role.trim()) lines.push(`role: ${yamlStr(role.trim())}`);
    lines.push(`publishedAt: ${today()}`);
    lines.push(`stack: ${yamlList(stack)}`);
    if (url.trim()) lines.push(`url: ${yamlStr(url.trim())}`);
    if (repo.trim()) lines.push(`repo: ${yamlStr(repo.trim())}`);
    lines.push("---");
    frontmatter = lines.join("\n");
    body = `\n\n## Overview\n\nWhat it is, who it was for, what you did.\n`;
  }

  await mkdir(dir, { recursive: true });
  await writeFile(filePath, frontmatter + body, { flag: "w" });

  note(`src/content/${type}/${slug}.mdx`, "Created");
  log.info("Open it in your editor and write the body. Commit when ready.");
  if (type === "writing") {
    log.message("It's a draft. Set `draft: false` in the frontmatter to publish.");
  }
  outro("Done.");
}

main().catch((err) => {
  log.error(String(err?.stack ?? err));
  process.exit(1);
});
