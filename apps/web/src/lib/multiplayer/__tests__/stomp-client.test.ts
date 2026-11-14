import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimpleStompClient } from '../stomp-client';

describe('SimpleStompClient', () => {
  let mockWs: any;

  beforeEach(() => {
    mockWs = {
      send: vi.fn(),
      close: vi.fn(),
      readyState: 1, // OPEN
    };
    (global as any).WebSocket = vi.fn().mockImplementation(() => mockWs);
    (global as any).WebSocket.OPEN = 1;
  });

  it('connects and sends STOMP CONNECT frame with Bearer token', async () => {
    const client = new SimpleStompClient('ws://localhost:8081/ws', 'test-jwt-token');
    const connectPromise = client.connect();

    // Trigger onopen
    mockWs.onopen();

    expect(mockWs.send).toHaveBeenCalledWith(
      expect.stringContaining('CONNECT\naccept-version:1.2,1.1,1.0')
    );
    expect(mockWs.send).toHaveBeenCalledWith(
      expect.stringContaining('Authorization:Bearer test-jwt-token')
    );

    // Simulate CONNECTED frame
    mockWs.onmessage({
      data: 'CONNECTED\nversion:1.2\n\n\0',
    });

    await expect(connectPromise).resolves.toBeUndefined();
    expect(client.isConnected()).toBe(true);
  });

  it('subscribes to a topic and dispatches incoming messages', async () => {
    const client = new SimpleStompClient('ws://localhost:8081/ws');
    const connectPromise = client.connect();
    mockWs.onopen();
    mockWs.onmessage({ data: 'CONNECTED\nversion:1.2\n\n\0' });
    await connectPromise;

    const messageCallback = vi.fn();
    client.subscribe('/topic/rooms/TEST', messageCallback);

    expect(mockWs.send).toHaveBeenCalledWith(
      expect.stringContaining('SUBSCRIBE\nid:sub-0\ndestination:/topic/rooms/TEST')
    );

    // Simulate incoming STOMP MESSAGE frame
    const payload = { type: 'RACE_STARTED', payload: { roomCode: 'TEST' } };
    mockWs.onmessage({
      data: `MESSAGE\nsubscription:sub-0\ndestination:/topic/rooms/TEST\n\n${JSON.stringify(payload)}\0`,
    });

    expect(messageCallback).toHaveBeenCalledWith(payload, expect.any(Object));
  });

  it('sends SEND frame with destination and JSON body', async () => {
    const client = new SimpleStompClient('ws://localhost:8081/ws');
    const connectPromise = client.connect();
    mockWs.onopen();
    mockWs.onmessage({ data: 'CONNECTED\nversion:1.2\n\n\0' });
    await connectPromise;

    client.send('/app/race.progress', { roomCode: 'ABC', progressCharacters: 15 });

    expect(mockWs.send).toHaveBeenCalledWith(
      expect.stringContaining('SEND\ndestination:/app/race.progress\ncontent-type:application/json')
    );
    expect(mockWs.send).toHaveBeenCalledWith(
      expect.stringContaining('"roomCode":"ABC"')
    );
  });
});
