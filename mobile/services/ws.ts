type Handler = (data: any) => void;

export class WsManager {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Handler[]>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private active = true;

  constructor(private url: string) {}

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(String(event.data));
        for (const handler of this.listeners.get(msg.event) ?? []) {
          handler(msg.data);
        }
      } catch {}
    };

    this.ws.onclose = () => {
      if (this.active) {
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      }
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  on(event: string, handler: Handler): () => void {
    const current = this.listeners.get(event) ?? [];
    this.listeners.set(event, [...current, handler]);
    return () => {
      const after = this.listeners.get(event) ?? [];
      this.listeners.set(event, after.filter((h) => h !== handler));
    };
  }

  send(msg: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  disconnect(): void {
    this.active = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}
