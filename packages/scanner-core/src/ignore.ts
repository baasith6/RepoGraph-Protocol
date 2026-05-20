import fs from "node:fs/promises";
import path from "node:path";
import ignoreModule from "ignore";

type IgnoreInstance = {
  add: (pattern: string | string[]) => IgnoreInstance;
  ignores: (path: string) => boolean;
};

function createIgnore(): IgnoreInstance {
  const factory = ignoreModule as unknown as () => IgnoreInstance;
  const withDefault = ignoreModule as unknown as { default: () => IgnoreInstance };
  return typeof factory === "function" ? factory() : withDefault.default();
}

export async function loadIgnore(root: string): Promise<IgnoreInstance> {
  const ig = createIgnore();
  ig.add(["node_modules", "dist", "bin", "obj", ".git", ".repograph/generated"]);

  const gitignorePath = path.join(root, ".gitignore");
  try {
    const content = await fs.readFile(gitignorePath, "utf-8");
    ig.add(content);
  } catch {
    // no .gitignore
  }

  const repographIgnorePath = path.join(root, ".repographignore");
  try {
    const content = await fs.readFile(repographIgnorePath, "utf-8");
    ig.add(content);
  } catch {
    // no .repographignore
  }

  return ig;
}
