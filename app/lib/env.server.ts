/* eslint-disable @typescript-eslint/no-empty-interface */
import process from "node:process";

import { type TypeOf, z } from "zod";

import { generated } from "~/generated/env.ts";

const schema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"] as const),
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends TypeOf<typeof schema> {}
  }
}

export function init() {
  const parsed = schema.safeParse({ ...process.env, ...generated });

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );

    throw new Error("Invalid environment variables");
  }
}

/**
 * This is used in both `entry.server.ts` and `root.tsx` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv() {
  return {
    MODE: process.env.NODE_ENV,
    BUILD_TIME: generated.BUILD_TIME,
    BUILD_TIMESTAMP: generated.BUILD_TIMESTAMP,
    COMMIT_SHA: generated.COMMIT_SHA,
  };
}

type ENV = ReturnType<typeof getEnv>;

declare global {
  // eslint-disable-next-line no-var
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}
