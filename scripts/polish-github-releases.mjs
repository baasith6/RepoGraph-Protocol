#!/usr/bin/env node
/**
 * Polish GitHub releases (v0.2.1 stable, ensure v1.0.0 / v0.3.0 notes).
 * Usage: GITHUB_TOKEN=ghp_... node scripts/polish-github-releases.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
const owner = "baasith6";
const repo = "RepoGraph-Protocol";

if (!token) {
  console.error("Set GITHUB_TOKEN or GH_TOKEN");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
  "X-GitHub-Api-Version": "2022-11-28",
};

async function getReleaseByTag(tag) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`,
    { headers }
  );
  if (!res.ok) return null;
  return res.json();
}

async function updateRelease(id, body, prerelease = false) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ body, prerelease }),
  });
  if (!res.ok) {
    throw new Error(`${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function createFromNotes(tag) {
  const ver = tag.replace(/^v/, "");
  const notesPath = path.join(root, "docs/releases", `${ver}.md`);
  if (!fs.existsSync(notesPath)) {
    console.warn(`Skip ${tag}: no ${notesPath}`);
    return;
  }
  const body = fs.readFileSync(notesPath, "utf-8");
  const existing = await getReleaseByTag(tag);
  if (existing) {
    const data = await updateRelease(existing.id, body, false);
    console.log("Updated:", data.html_url);
    return;
  }
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
    method: "POST",
    headers,
    body: JSON.stringify({ tag_name: tag, name: tag, body, draft: false, prerelease: false }),
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  const data = await res.json();
  console.log("Created:", data.html_url);
}

for (const tag of ["v0.2.1", "v1.0.0", "v0.3.0"]) {
  await createFromNotes(tag);
}
