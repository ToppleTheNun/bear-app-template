import { RemixServer } from "@remix-run/react";
import { type EntryContext, handleRequest } from "@vercel/remix";
import { nanoid } from "nanoid";

import { NonceProvider } from "~/lib/nonce-provider.ts";

export default async function (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const remixServer = (
    <NonceProvider value={nanoid()}>
      <RemixServer context={remixContext} url={request.url} />
    </NonceProvider>
  );
  return handleRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixServer,
  );
}
