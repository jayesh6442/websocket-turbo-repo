// apps/ws/src/auth.ts
import jwt from "jsonwebtoken";

let SECRET = process.env.JWT_SECRET;
if (!SECRET) {
    if (process.env.NODE_ENV === "production") {
        throw new Error("JWT_SECRET is required in production");
    }
    SECRET = "supersecret";
}
export function verifyToken(token: string) {
    try {
        const payload = jwt.verify(token, SECRET) as { userId: string };
        // Return in format expected by the WebSocket handler
        return { userId: payload.userId, id: payload.userId };
    } catch {
        return null;
    }
}
