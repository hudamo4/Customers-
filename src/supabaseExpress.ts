import { withSupabase, SupabaseContext, WithSupabaseConfig } from "@supabase/server";
import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";

/**
 * Adapter that converts an Express route handler into a standard web fetch withSupabase handler.
 */
export function expressWithSupabase(
  config: WithSupabaseConfig,
  handler: (req: Request, ctx: SupabaseContext) => Promise<Response>
) {
  // Create the underlying fetch handler
  const fetchHandler = withSupabase(config, handler);

  return async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    try {
      // 1. Construct URL
      const protocol = req.protocol || "http";
      const host = req.get("host") || "localhost:3000";
      const fullUrl = `${protocol}://${host}${req.originalUrl}`;

      // 2. Build headers
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      }

      // 3. Extract and parse body if applicable
      let body: any = undefined;
      if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
        if (req.body) {
          if (typeof req.body === "object") {
            body = JSON.stringify(req.body);
            if (!headers.has("content-type")) {
              headers.set("content-type", "application/json");
            }
          } else {
            body = req.body;
          }
        }
      }

      // 4. Create standard Request
      const webReq = new Request(fullUrl, {
        method: req.method,
        headers,
        body,
      });

      // 5. Invoke standard fetch handler
      const webRes = await fetchHandler(webReq);

      // 6. Pipe standard Response back to Express
      res.status(webRes.status);
      webRes.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      const text = await webRes.text();
      res.send(text);
    } catch (err) {
      next(err);
    }
  };
}
