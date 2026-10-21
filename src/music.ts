import { EventEmitter } from "node:events";
import { spawn, type ChildProcessByStdio } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import type { MusicSnapshot } from "./types.js";

export class MusicWatcher extends EventEmitter {
  private child: ChildProcessByStdio<null, Readable, Readable> | undefined;
  private stopped = false;
  private restartTimer: NodeJS.Timeout | undefined;

  constructor(private readonly intervalMs: number) {
    super();
  }

  start(): void {
    this.stopped = false;
    this.launch();
  }

  stop(): void {
    this.stopped = true;
    if (this.restartTimer) clearTimeout(this.restartTimer);
    this.child?.kill("SIGTERM");
  }

  private launch(): void {
    const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
    const helper = process.env.MUSIC_METADATA_HELPER ?? join(root, "bin", "music-metadata");
    if (!existsSync(helper)) {
      this.emit("error", new Error(`Music helper not found at ${helper}; run npm run build.`));
      return;
    }

    const child = spawn(helper, ["--interval-ms", String(this.intervalMs)], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    this.child = child;
    let buffer = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      buffer += chunk;
      let newline: number;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (!line) continue;
        try {
          this.emit("snapshot", JSON.parse(line) as MusicSnapshot);
        } catch (error) {
          this.emit("error", new Error(`Invalid helper output: ${String(error)}`));
        }
      }
    });
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (message: string) => this.emit("warning", message.trim()));
    child.on("error", (error) => this.emit("error", error));
    child.on("exit", (code, signal) => {
      if (this.child === child) this.child = undefined;
      if (!this.stopped) {
        this.emit("warning", `Music helper exited (${code ?? signal}); restarting.`);
        this.restartTimer = setTimeout(() => this.launch(), 1500);
      }
    });
  }
}
