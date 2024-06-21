import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";

const date = new Date();

const contents = `
export const generated = {
  BUILD_TIME: "${date.toISOString()}",
  BUILD_TIMESTAMP: "${Number(date).toString()}",
  COMMIT_SHA: "${process.env.VERCEL_GIT_COMMIT_SHA ?? ""}",
} as const;
`;

async function ensureDir(path: string) {
  try {
    await access(path);
  } catch (e) {
    await mkdir(path);
  }
}

const pathToEnv = join(process.cwd(), "app", "generated");
await ensureDir(pathToEnv);
await writeFile(join(pathToEnv, "env.ts"), contents, "utf-8");
