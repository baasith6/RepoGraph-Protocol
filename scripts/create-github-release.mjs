/**
 * Create GitHub release for an existing tag using GITHUB_TOKEN env var.
 * Usage: GITHUB_TOKEN=ghp_... node scripts/create-github-release.mjs v0.2.1
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const tag = process.argv[2] ?? "v0.2.1";
const token = process.env.GITHUB_TOKEN;
const owner = "baasith6";
const repo = "RepoGraph-Protocol";

if (!token) {
  console.error("Set GITHUB_TOKEN to create a release via API.");
  console.error("Or create manually: https://github.com/baasith6/RepoGraph-Protocol/releases/new");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const notesPath = path.join(__dirname, "..", "docs", "releases", `${tag.replace(/^v/, "")}.md`);
const body = fs.existsSync(notesPath)
  ? fs.readFileSync(notesPath, "utf-8")
  : `Release ${tag}`;

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
  "X-GitHub-Api-Version": "2022-11-28",
};

const existing = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`,
  { headers }
);
if (existing.ok) {
  const rel = await existing.json();
  const patch = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/releases/${rel.id}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({ name: tag, body }),
    }
  );
  if (!patch.ok) {
    console.error(`Failed to update release (${patch.status}):`, await patch.text());
    process.exit(1);
  }
  const data = await patch.json();
  console.log("Release updated:", data.html_url);
  process.exit(0);
}

const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    tag_name: tag,
    name: tag,
    body,
    draft: false,
    prerelease: false,
  }),
});

if (!res.ok) {
  const text = await res.text();
  console.error(`Failed (${res.status}):`, text);
  process.exit(1);
}

const data = await res.json();
console.log("Release created:", data.html_url);
