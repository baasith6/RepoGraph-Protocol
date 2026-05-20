import { scanRepositoryAndWrite } from "./scan.js";

export async function syncCommand(): Promise<void> {
  await scanRepositoryAndWrite();
}
