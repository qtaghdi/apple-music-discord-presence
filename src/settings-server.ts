import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseDisplaySettings } from "./config.js";
import type { DisplaySettings } from "./types.js";

export const SETTINGS_HOST = "127.0.0.1";
export const SETTINGS_PORT = 47_621;
export const SETTINGS_ORIGIN = `http://${SETTINGS_HOST}:${SETTINGS_PORT}`;

const files = new Map<string, readonly [string, string]>([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
] as const);

interface SettingsServerOptions {
  root: string;
  getSettings: () => DisplaySettings;
  saveSettings: (settings: DisplaySettings) => Promise<DisplaySettings>;
  host?: string;
  port?: number;
}

export class SettingsServer {
  private server: Server | undefined;
  private activeOrigin = SETTINGS_ORIGIN;

  constructor(private readonly options: SettingsServerOptions) {}

  async start(): Promise<void> {
    if (this.server) return;
    const server = createServer((request, response) => {
      void this.handle(request, response).catch((error) => {
        this.json(response, 500, { error: error instanceof Error ? error.message : "Could not process the request." });
      });
    });
    const host = this.options.host ?? SETTINGS_HOST;
    const port = this.options.port ?? SETTINGS_PORT;
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(port, host, () => {
        server.off("error", reject);
        resolve();
      });
    });
    this.server = server;
    const address = server.address() as AddressInfo;
    this.activeOrigin = `http://${host}:${address.port}`;
  }

  get origin(): string {
    return this.activeOrigin;
  }

  stop(): void {
    this.server?.close();
    this.server = undefined;
  }

  private async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const pathname = new URL(request.url ?? "/", this.activeOrigin).pathname;
    this.headers(response);

    if (request.method === "GET" && pathname === "/health") {
      this.json(response, 200, { ok: true });
      return;
    }
    if (request.method === "GET" && pathname === "/api/settings") {
      this.json(response, 200, this.options.getSettings());
      return;
    }
    if (request.method === "PUT" && pathname === "/api/settings") {
      if (request.headers.origin !== this.activeOrigin) {
        this.json(response, 403, { error: "Settings can only be changed from the local settings page." });
        return;
      }
      if (!request.headers["content-type"]?.startsWith("application/json")) {
        this.json(response, 415, { error: "Expected JSON settings." });
        return;
      }
      try {
        const settings = parseDisplaySettings(JSON.parse(await readBody(request)) as unknown);
        this.json(response, 200, await this.options.saveSettings(settings));
      } catch (error) {
        this.json(response, 400, { error: error instanceof Error ? error.message : "Invalid settings." });
      }
      return;
    }
    const file = files.get(pathname);
    if (request.method === "GET" && file) {
      const [name, contentType] = file;
      response.statusCode = 200;
      response.setHeader("Content-Type", contentType);
      response.end(await readFile(join(this.options.root, "settings", name)));
      return;
    }
    this.json(response, 404, { error: "Not found." });
  }

  private headers(response: ServerResponse): void {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Content-Security-Policy", "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
  }

  private json(response: ServerResponse, status: number, body: unknown): void {
    if (response.headersSent) return;
    response.statusCode = status;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify(body));
  }
}

async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  let length = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    length += buffer.length;
    if (length > 8_192) throw new Error("Settings payload is too large.");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}
