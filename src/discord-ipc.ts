import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import { connect, type Socket } from "node:net";
import { tmpdir } from "node:os";
import { posix } from "node:path";
import type { DiscordActivity } from "./types.js";

const OP_HANDSHAKE = 0;
const OP_FRAME = 1;
const OP_CLOSE = 2;
const OP_PING = 3;
const OP_PONG = 4;

export function encodeFrame(opcode: number, payload: unknown): Buffer {
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  const frame = Buffer.allocUnsafe(body.length + 8);
  frame.writeUInt32LE(opcode, 0);
  frame.writeUInt32LE(body.length, 4);
  body.copy(frame, 8);
  return frame;
}

export function ipcPaths(
  environment: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
): string[] {
  if (platform === "win32") {
    return Array.from({ length: 10 }, (_, index) => `\\\\?\\pipe\\discord-ipc-${index}`);
  }
  const directories = [
    environment.XDG_RUNTIME_DIR,
    environment.TMPDIR,
    environment.TMP,
    environment.TEMP,
    tmpdir(),
    "/tmp",
  ].filter((value): value is string => Boolean(value));
  return [...new Set(directories)].flatMap((directory) =>
    Array.from({ length: 10 }, (_, index) => posix.join(directory, `discord-ipc-${index}`)),
  );
}

export class DiscordIpc extends EventEmitter {
  private socket: Socket | undefined;
  private receiveBuffer = Buffer.alloc(0);
  private reconnectTimer: NodeJS.Timeout | undefined;
  private reconnectAttempt = 0;
  private stopped = false;
  private connecting = false;
  private ready = false;

  constructor(private readonly clientId: string) {
    super();
  }

  start(): void {
    this.stopped = false;
    void this.connectAny();
  }

  stop(): void {
    this.stopped = true;
    this.ready = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.destroy();
  }

  isReady(): boolean {
    return this.ready;
  }

  setActivity(activity: DiscordActivity | null): void {
    if (!this.ready || !this.socket) return;
    const payload = {
      cmd: "SET_ACTIVITY",
      args: { pid: process.pid, activity },
      nonce: randomUUID(),
    };
    this.socket.write(encodeFrame(OP_FRAME, payload));
  }

  private async connectAny(): Promise<void> {
    if (this.connecting || this.stopped) return;
    this.connecting = true;
    for (const path of ipcPaths()) {
      if (this.stopped) break;
      const socket = await this.tryConnect(path);
      if (socket) {
        this.attach(socket);
        this.connecting = false;
        return;
      }
    }
    this.connecting = false;
    this.scheduleReconnect();
  }

  private tryConnect(path: string): Promise<Socket | undefined> {
    return new Promise((resolve) => {
      const socket = connect(path);
      const timer = setTimeout(() => {
        socket.destroy();
        resolve(undefined);
      }, 250);
      socket.once("connect", () => {
        clearTimeout(timer);
        socket.removeAllListeners("error");
        resolve(socket);
      });
      socket.once("error", () => {
        clearTimeout(timer);
        resolve(undefined);
      });
    });
  }

  private attach(socket: Socket): void {
    this.socket = socket;
    this.receiveBuffer = Buffer.alloc(0);
    this.ready = false;
    socket.on("data", (chunk) => this.onData(chunk));
    socket.on("error", (error) => this.emit("warning", `Discord IPC error: ${error.message}`));
    socket.on("close", () => {
      if (this.socket !== socket) return;
      this.socket = undefined;
      this.ready = false;
      this.emit("disconnected");
      this.scheduleReconnect();
    });
    socket.write(encodeFrame(OP_HANDSHAKE, { v: 1, client_id: this.clientId }));
  }

  private onData(chunk: Buffer): void {
    this.receiveBuffer = Buffer.concat([this.receiveBuffer, chunk]);
    while (this.receiveBuffer.length >= 8) {
      const opcode = this.receiveBuffer.readUInt32LE(0);
      const length = this.receiveBuffer.readUInt32LE(4);
      if (length > 1024 * 1024) {
        this.socket?.destroy(new Error("Discord IPC frame is too large"));
        return;
      }
      if (this.receiveBuffer.length < length + 8) return;
      const body = this.receiveBuffer.subarray(8, length + 8);
      this.receiveBuffer = this.receiveBuffer.subarray(length + 8);
      if (opcode === OP_PING) {
        this.socket?.write(encodeFrame(OP_PONG, JSON.parse(body.toString("utf8"))));
      } else if (opcode === OP_CLOSE) {
        this.socket?.destroy();
      } else if (opcode === OP_FRAME) {
        const message = JSON.parse(body.toString("utf8")) as { evt?: string; data?: unknown };
        if (message.evt === "READY") {
          this.ready = true;
          this.reconnectAttempt = 0;
          this.emit("ready", message.data);
        }
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.stopped || this.reconnectTimer) return;
    const delay = Math.min(30_000, 1_000 * 2 ** this.reconnectAttempt++);
    const jittered = Math.round(delay * (0.85 + Math.random() * 0.3));
    this.emit("reconnecting", jittered);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      void this.connectAny();
    }, jittered);
  }
}
