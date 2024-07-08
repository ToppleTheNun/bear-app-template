import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { invariantResponse } from "@epic-web/invariant";
import {
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useFetchers,
  useLoaderData,
} from "@remix-run/react";
import { Analytics } from "@vercel/analytics/react";
import type {
  ActionFunctionArgs,
  HeadersArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "@vercel/remix";
import { json } from "@vercel/remix";
import type { ReactNode } from "react";
import { z } from "zod";

import { GeneralErrorBoundary } from "~/components/GeneralErrorBoundary.tsx";
import { MainNav } from "~/components/MainNav.tsx";
import { MobileNav } from "~/components/MobileNav.tsx";
import { ProgressBar } from "~/components/ProgressBar.tsx";
import { TailwindIndicator } from "~/components/TailwindIndicator.tsx";
import { Button, buttonVariants } from "~/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu.tsx";
import { href as iconsHref, Icon } from "~/components/ui/icon.tsx";
import { siteConfig } from "~/config/site.ts";
import { ClientHintCheck, getHints, useHints } from "~/lib/client-hints.tsx";
import { serverTiming, setCookie } from "~/lib/constants.ts";
import { getEnv } from "~/lib/env.server.ts";
import { combineHeaders, getDomainUrl } from "~/lib/misc.ts";
import { useNonce } from "~/lib/nonce-provider.ts";
import { useRequestInfo } from "~/lib/request-info.ts";
import type { Theme } from "~/lib/theme.server.ts";
import { getTheme, setTheme } from "~/lib/theme.server.ts";
import { makeTimings } from "~/lib/timing.server.ts";
import { isPresent } from "~/lib/typeGuards.ts";
import { cn } from "~/lib/utils.ts";
import tailwindStyleSheetUrl from "~/styles/tailwind.css?url";

export const links: LinksFunction = () => {
  return [
    // Preload svg sprite as a resource to avoid render blocking
    { rel: "preload", href: iconsHref, as: "image" },

    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png?v=1",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicon-32x32.png?v=1",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicon-16x16.png?v=1",
    },
    {
      rel: "icon",
      type: "image/x-icon",
      href: "/favicon.ico?v=1",
    },
    { rel: "manifest", href: "/site.webmanifest?v=1" },
    {
      rel: "mask-icon",
      href: "/favicon.svg?v=1",
      color: "#5bbad5",
    },

    { rel: "stylesheet", href: tailwindStyleSheetUrl },
  ].filter(isPresent);
};

// eslint-disable-next-line @typescript-eslint/require-await
export async function loader({ request }: LoaderFunctionArgs) {
  const timings = makeTimings("root loader");

  return json(
    {
      ENV: getEnv(),
      requestInfo: {
        hints: getHints(request),
        origin: getDomainUrl(request),
        path: new URL(request.url).pathname,
        userPrefs: {
          theme: getTheme(request),
        },
      },
    },
    {
      headers: combineHeaders(
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        { [serverTiming]: timings.toString() },
      ),
    },
  );
}

export function headers({ loaderHeaders }: HeadersArgs) {
  return {
    [serverTiming]: loaderHeaders.get(serverTiming) ?? "",
  };
}

const ThemeFormSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: ThemeFormSchema,
  });

  invariantResponse(submission.status === "success", "Invalid theme received");

  const { theme } = submission.value;

  const responseInit = {
    headers: { [setCookie]: setTheme(theme) },
  };
  return json({ result: submission.reply() }, responseInit);
}

function Document({
  children,
  nonce,
  theme = "light",
  env = {},
}: {
  children: ReactNode;
  nonce: string;
  theme?: Theme | null;
  env?: Record<string, string>;
}) {
  return (
    <html className={cn(theme)} lang="en" dir="ltr">
      <head>
        <ClientHintCheck nonce={nonce} />
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Links />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(env)}`,
          }}
        />
        <ScrollRestoration nonce={nonce} />
        <TailwindIndicator />
        <Scripts nonce={nonce} />
        <Analytics />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  // the nonce doesn't rely on the loader so we can access that
  const nonce = useNonce();

  // NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
  // likely failed to run so we have to do the best we can.
  // We could probably do better than this (it's possible the loader did run).
  // This would require a change in Remix.

  // Just make sure your root route never errors out and you'll always be able
  // to give the user a better UX.

  return (
    <Document nonce={nonce}>
      <GeneralErrorBoundary />
    </Document>
  );
}

/**
 * If the user's changing their theme mode preference, this will return the
 * value it's being changed to.
 */
export function useOptimisticThemeMode() {
  const fetchers = useFetchers();
  const themeFetcher = fetchers.find((f) => f.formAction === "/");

  if (themeFetcher && themeFetcher.formData) {
    const submission = parseWithZod(themeFetcher.formData, {
      schema: ThemeFormSchema,
    });

    if (submission.status === "success") {
      return submission.value.theme;
    }
  }
}

/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
export function useTheme() {
  const hints = useHints();
  const requestInfo = useRequestInfo();
  const optimisticMode = useOptimisticThemeMode();
  if (optimisticMode) {
    return optimisticMode === "system" ? hints.theme : optimisticMode;
  }
  return requestInfo.userPrefs.theme ?? hints.theme;
}

function ThemeSwitch() {
  const fetcher = useFetcher<typeof action>();

  const [form] = useForm({
    id: "theme-switch",
    lastResult: fetcher.data?.result,
  });

  return (
    <fetcher.Form method="POST" {...getFormProps(form)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-9 px-0">
            <Icon
              name="sun"
              className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            />
            <Icon
              name="moon"
              className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              fetcher.submit(
                { theme: "light" },
                { action: "/", method: "post" },
              );
            }}
          >
            Light
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              fetcher.submit(
                { theme: "dark" },
                { action: "/", method: "post" },
              );
            }}
          >
            Dark
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </fetcher.Form>
  );
}

function App() {
  const data = useLoaderData<typeof loader>();
  const nonce = useNonce();
  const theme = useTheme();

  return (
    <Document nonce={nonce} env={data.ENV} theme={theme}>
      <div className="relative flex min-h-screen flex-col">
        <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container flex h-14 items-center">
            <MainNav />
            <MobileNav />
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <nav className="flex items-center">
                <NavLink
                  to={siteConfig.links.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "w-9 px-0",
                    )}
                  >
                    <Icon name="github-logo" size="sm">
                      <span className="sr-only">GitHub</span>
                    </Icon>
                  </div>
                </NavLink>
                <ThemeSwitch />
              </nav>
            </div>
          </div>
        </header>
        <main className="container flex-1 items-start relative py-6 lg:gap-10 lg:py-8">
          <Outlet />
        </main>
        <footer className="space-y-2 py-6 md:px-8 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built by{" "}
              <a
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                ToppleTheNun
              </a>
              . The source code is available on{" "}
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                GitHub
              </a>
              .
            </p>
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Logo by{" "}
              <a
                href="https://yilinzc.carrd.co/"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                yilinzc
              </a>
              .
            </p>
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Using and inspired by{" "}
              <a
                href="https://ui.shadcn.com"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                shadcn/ui
              </a>
              .
            </p>
          </div>
        </footer>
      </div>
      <ProgressBar />
    </Document>
  );
}

function AppWithProviders() {
  return <App />;
}

export default AppWithProviders;
