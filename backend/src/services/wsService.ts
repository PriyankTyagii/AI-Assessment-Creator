import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { WSMessage } from '../types/index.js';

const rooms = new Map<string, Set<WebSocket>>();

export function createWSSHandler(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket, _req: IncomingMessage) => {
    let subscribedRoom: string | null = null;

    ws.on('message', (raw) => {
      try {
        const msg: WSMessage = JSON.parse(raw.toString());
        if (msg.type === 'join' && msg.assignmentId) {
          subscribedRoom = msg.assignmentId;
          if (!rooms.has(subscribedRoom)) {
            rooms.set(subscribedRoom, new Set());
          }
          rooms.get(subscribedRoom)!.add(ws);
        }
      } catch {
        // ignore malformed messages
      }
    });

    ws.on('close', () => {
      if (subscribedRoom) {
        rooms.get(subscribedRoom)?.delete(ws);
        if (rooms.get(subscribedRoom)?.size === 0) {
          rooms.delete(subscribedRoom);
        }
      }
    });
  });
}

export function notifyRoom(assignmentId: string, message: WSMessage): void {
  const clients = rooms.get(assignmentId);
  if (!clients) return;
  const payload = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}
