# Security Policy

## Reporting vulnerabilities

Report security issues privately via GitHub Security Advisories on
[RepoGraph-Protocol](https://github.com/baasith6/RepoGraph-Protocol/security/advisories/new).

Do not open public issues for undisclosed vulnerabilities.

## npm access tokens

- **Never** commit `.npmrc`, tokens, or OTP codes to the repository.
- **Never** paste tokens in chat, issues, or CI logs.
- Publish using a short-lived token in environment variables only:

```powershell
$env:NPM_TOKEN = "npm_..."   # Automation or granular token with publish scope
$env:SKIP_BUILD = "1"          # optional, after local bundle
pnpm publish:cli
```

### If a token was exposed

1. Revoke it immediately: [npm Access Tokens](https://www.npmjs.com/settings/baasith6/tokens)
2. Create a new **Automation** token (bypass 2FA for CI) or **Granular** token scoped to `@repographprotocol/*`
3. Store the new token only in:
   - Your local shell environment, or
   - GitHub repository secret `NPM_TOKEN` (for automated releases)

## GitHub Actions secrets

For publishing from CI, add repository secret:

| Secret | Purpose |
|--------|---------|
| `NPM_TOKEN` | Publish `@repographprotocol/cli` |

Composite Action consumers do not need npm tokens; they install the public package.
