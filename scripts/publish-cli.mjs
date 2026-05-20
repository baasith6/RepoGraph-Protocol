import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const cliDir = path.join(root, "apps/cli");
const pkgPath = path.join(cliDir, "package.json");

const distIndex = path.join(cliDir, "dist/index.js");
const skipBuild = process.env.SKIP_BUILD === "1" && fs.existsSync(distIndex);

if (skipBuild) {
  console.log("SKIP_BUILD=1 — using existing apps/cli/dist/");
} else {
  console.log("Building monorepo...");
  execSync("pnpm build", { cwd: root, stdio: "inherit" });
  console.log("Bundling CLI for npm...");
  execSync("node scripts/bundle-cli.mjs", { cwd: root, stdio: "inherit" });
}

const original = fs.readFileSync(pkgPath, "utf-8");
const pkg = JSON.parse(original);

function stripWorkspaceDeps(deps) {
  if (!deps) return {};
  const out = {};
  for (const [name, version] of Object.entries(deps)) {
    if (typeof version === "string" && version.startsWith("workspace:")) continue;
    out[name] = version;
  }
  return out;
}

const publishPkg = {
  ...pkg,
  // Keep non-workspace deps (e.g. commander). Workspace deps are bundled.
  dependencies: stripWorkspaceDeps(pkg.dependencies),
  devDependencies: undefined,
};
delete publishPkg.scripts.prepublishOnly;
delete publishPkg.scripts.prepack;

const backupPath = path.join(cliDir, "package.json.publish-backup");
fs.writeFileSync(backupPath, original);
fs.writeFileSync(pkgPath, JSON.stringify(publishPkg, null, 2) + "\n");

const npmrcPath = path.join(cliDir, ".npmrc");
let wroteNpmrc = false;

try {
  const pkgName = pkg.name ?? "@repographprotocol/cli";
  const token = process.env.NPM_TOKEN;
  const otp = process.env.NPM_OTP;

  if (!token && !otp) {
    console.error(
      "Set NPM_TOKEN (automation/granular token) or NPM_OTP (2FA code).\n" +
        "  $env:NPM_TOKEN=\"npm_...\"; $env:SKIP_BUILD=\"1\"; pnpm publish:cli\n" +
        "  $env:NPM_OTP=\"123456\"; $env:SKIP_BUILD=\"1\"; pnpm publish:cli"
    );
    process.exit(1);
  }

  if (token) {
    fs.writeFileSync(npmrcPath, `//registry.npmjs.org/:_authToken=${token}\n`);
    wroteNpmrc = true;
  }

  console.log(`Publishing ${pkgName} to npm...`);
  const otpArg = otp ? ` --otp=${otp}` : "";
  execSync(`npm publish --access public${otpArg}`, { cwd: cliDir, stdio: "inherit" });
  console.log("Published successfully.");
} catch (err) {
  console.error(
    "\nPublish failed. Common fixes:\n" +
      "  • Granular token: Read+Write on @repographprotocol/*, publish permission\n" +
      "  • Automation token: enable bypass 2FA when creating the token\n" +
      "  • Or use NPM_OTP with 2FA enabled on your npm account\n"
  );
  throw err;
} finally {
  if (wroteNpmrc && fs.existsSync(npmrcPath)) fs.unlinkSync(npmrcPath);
  fs.writeFileSync(pkgPath, fs.readFileSync(backupPath, "utf-8"));
  fs.unlinkSync(backupPath);
}
