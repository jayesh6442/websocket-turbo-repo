// apps/ws/src/roomManager.ts
import { WebSocket } from "ws";

export class RoomManager {
    private rooms: Map<string, Set<WebSocket>> = new Map();

    joinRoom(roomId: string, ws: WebSocket) {
        if (!this.rooms.has(roomId)) this.rooms.set(roomId, new Set());
        this.rooms.get(roomId)!.add(ws);

        ws.send(JSON.stringify({ type: "joined_room", roomId }));
        this.broadcast(roomId, { type: "user_joined", roomId });
        console.log(`User joined room ${roomId}`);
    }

    leaveRoom(roomId: string, ws: WebSocket) {
        this.rooms.get(roomId)?.delete(ws);
        ws.send(JSON.stringify({ type: "left_room", roomId }));
        this.broadcast(roomId, { type: "user_left", roomId });
    }

    sendMessage(roomId: string, user: any, text: string) {
        this.broadcast(roomId, { type: "message", roomId, user, text });
    }

    public broadcast(roomId: string, message: any) {
        const members = this.rooms.get(roomId);
        if (!members) return;
        for (const client of members) {
            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify(message));
            }
        }
    }

    removeConnection(ws: WebSocket) {
        this.rooms.forEach((members, roomId) => {
            if (members.has(ws)) {
                members.delete(ws);
                this.broadcast(roomId, { type: "user_disconnected", roomId });
            }
        });
    }
}

// 👇 export ONE shared instance
export const roomManager = new RoomManager();
