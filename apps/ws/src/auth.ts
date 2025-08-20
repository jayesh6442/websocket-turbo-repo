// apps/ws/src/auth.ts
import jwt from "jsonwebtoken";

const SECRET = "supersecret";
export function verifyToken(token: string) {
    try {
        return jwt.verify(token, SECRET) as { id: string; email: string };
    } catch {
        return null;
    }
}
