# GitHub Releases

RepoGraph uses [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases) so users can read **what changed** without digging through commits.

## How releases work here

1. **Version tags** on git (`v0.2.1`, `v1.0.0`, …)
2. **Release notes** in this folder (`docs/releases/vX.Y.Z.md`)
3. **CHANGELOG.md** at repo root — full history for contributors
4. **npm** package `@repographprotocol/cli` — published separately; see each release note for install pin

## Create a release (maintainers)

### Option A — GitHub UI

1. Go to [Releases → Draft a new release](https://github.com/baasith6/RepoGraph-Protocol/releases/new)
2. Choose an existing tag or create tag `vX.Y.Z`
3. Title: `vX.Y.Z`
4. Paste body from `docs/releases/vX.Y.Z.md`
5. Publish

### Option B — Script (API)

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
GITHUB_TOKEN=ghp_... node scripts/create-github-release.mjs vX.Y.Z
```

### Option C — CI (automatic)

Pushing a tag `v*` triggers [.github/workflows/release.yml](../../.github/workflows/release.yml) if `GITHUB_TOKEN` has release permissions (default in GITHUB_TOKEN for same repo).

## Release index

| Tag | Summary |
|-----|---------|
| [v1.0.0](v1.0.0.md) | First public release — docs, examples, Phase A sync |
| [v0.2.1](v0.2.1.md) | Fix npm global CLI crash |
| [v0.2.0](v0.2.0.md) | diff, Roslyn, protocol 0.2, GitHub Action |
| [v0.1.0](v0.1.0.md) | Initial RepoGraph Protocol |
