// apps/ws/src/auth.ts
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";
export function verifyToken(token: string) {
    try {
        const payload = jwt.verify(token, SECRET) as { userId: string };
        // Return in format expected by the WebSocket handler
        return { userId: payload.userId, id: payload.userId };
    } catch {
        return null;
    }
}
