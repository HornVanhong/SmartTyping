export type MessageCallback = (data: any, headers: Record<string, string>) => void;

export class SimpleStompClient {
  private ws: WebSocket | null = null;
  private connected = false;
  private subscriptions = new Map<string, { destination: string; callback: MessageCallback }>();
  private subCounter = 0;
  private url: string;
  private token: string | null;
  private onConnectHandlers: Array<() => void> = [];
  private onDisconnectHandlers: Array<() => void> = [];
  private onErrorHandlers: Array<(err: any) => void> = [];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private explicitDisconnect = false;

  constructor(url: string, token?: string | null) {
    this.url = url;
    this.token = token || null;
  }

  public setToken(token: string | null) {
    this.token = token;
  }

  public connect(): Promise<void> {
    this.explicitDisconnect = false;
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
      } catch (err) {
        reject(err);
        return;
      }

      this.ws.onopen = () => {
        let connectFrame = 'CONNECT\naccept-version:1.2,1.1,1.0\nheart-beat:10000,10000\n';
        if (this.token) {
          connectFrame += `Authorization:Bearer ${this.token}\n`;
        }
        connectFrame += '\n\0';
        this.ws?.send(connectFrame);
      };

      this.ws.onmessage = (event) => {
        const raw = typeof event.data === 'string' ? event.data : '';
        this.handleIncomingRaw(raw, resolve);
      };

      this.ws.onerror = (err) => {
        this.onErrorHandlers.forEach((h) => h(err));
        if (!this.connected) {
          reject(err);
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.onDisconnectHandlers.forEach((h) => h());
        if (!this.explicitDisconnect) {
          this.scheduleReconnect();
        }
      };
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.explicitDisconnect && !this.connected) {
        this.connect()
          .then(() => {
            // Resubscribe active subscriptions
            this.subscriptions.forEach((sub, id) => {
              this.sendSubscribeFrame(id, sub.destination);
            });
          })
          .catch(() => {
            this.scheduleReconnect();
          });
      }
    }, 3000);
  }

  private handleIncomingRaw(raw: string, connectResolver?: (val: void) => void) {
    // STOMP frames can be multiple in one message, terminated by \0
    const frames = raw.split('\0');
    for (const frameText of frames) {
      const trimmed = frameText.trimStart();
      if (!trimmed) continue;

      const [headerPart, ...bodyParts] = trimmed.split('\n\n');
      const body = bodyParts.join('\n\n');

      const lines = headerPart.split('\n');
      const command = lines[0].trim();
      const headers: Record<string, string> = {};
      for (let i = 1; i < lines.length; i++) {
        const idx = lines[i].indexOf(':');
        if (idx !== -1) {
          const key = lines[i].substring(0, idx).trim();
          const val = lines[i].substring(idx + 1).trim();
          headers[key] = val;
        }
      }

      if (command === 'CONNECTED') {
        this.connected = true;
        this.onConnectHandlers.forEach((h) => h());
        if (connectResolver) connectResolver();
      } else if (command === 'MESSAGE') {
        const subId = headers['subscription'];
        let parsed = body;
        try {
          parsed = JSON.parse(body);
        } catch {}

        if (subId && this.subscriptions.has(subId)) {
          this.subscriptions.get(subId)!.callback(parsed, headers);
        } else {
          // Broadcast to any subscriber matching destination
          const dest = headers['destination'];
          this.subscriptions.forEach((sub) => {
            if (sub.destination === dest) {
              sub.callback(parsed, headers);
            }
          });
        }
      } else if (command === 'ERROR') {
        this.onErrorHandlers.forEach((h) => h(body || headers['message']));
      }
    }
  }

  public subscribe(destination: string, callback: MessageCallback): () => void {
    const subId = `sub-${this.subCounter++}`;
    this.subscriptions.set(subId, { destination, callback });

    if (this.connected && this.ws?.readyState === 1) {
      this.sendSubscribeFrame(subId, destination);
    }

    return () => {
      this.unsubscribe(subId);
    };
  }

  private sendSubscribeFrame(subId: string, destination: string) {
    const frame = `SUBSCRIBE\nid:${subId}\ndestination:${destination}\nack:auto\n\n\0`;
    this.ws?.send(frame);
  }

  public unsubscribe(subId: string) {
    if (this.subscriptions.has(subId)) {
      this.subscriptions.delete(subId);
      if (this.connected && this.ws?.readyState === 1) {
        const frame = `UNSUBSCRIBE\nid:${subId}\n\n\0`;
        this.ws?.send(frame);
      }
    }
  }

  public send(destination: string, payload: any) {
    if (!this.connected || this.ws?.readyState !== 1) {
      return;
    }
    const bodyStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const frame = `SEND\ndestination:${destination}\ncontent-type:application/json\ncontent-length:${bodyStr.length}\n\n${bodyStr}\0`;
    this.ws.send(frame);
  }

  public onConnect(handler: () => void) {
    this.onConnectHandlers.push(handler);
  }

  public onDisconnect(handler: () => void) {
    this.onDisconnectHandlers.push(handler);
  }

  public onError(handler: (err: any) => void) {
    this.onErrorHandlers.push(handler);
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public disconnect() {
    this.explicitDisconnect = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.connected && this.ws?.readyState === 1) {
      this.ws.send('DISCONNECT\n\n\0');
    }
    this.subscriptions.clear();
    this.ws?.close();
    this.ws = null;
    this.connected = false;
  }
}
