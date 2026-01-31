import { Request, Response } from "express";
import { createUser, findUserByEmail, findUserById, validatePassword } from "../services/user.service.js";
import { signToken } from "../utils/jwt.js";
import UserSchema from "../models/user.model.js";

export async function registerUser(req: Request, res: Response) {
  const safeData = UserSchema.safeParse(req.body);
  if (!safeData.success) {
    return res.status(400).json({ error: "Invalid user data", issues: safeData.error.issues });
  }
  const { email, password, name } = req.body;


  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required" });
  }
  try {
    const existing = await findUserByEmail(email).catch((err) => {
      console.error("Error finding user:", err);
      return null;
    });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }
    const user = await createUser(email, password, name);
    res.status(201).json({ message: "User registered", user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
}

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isValid = await validatePassword(password, user.password);
    if (!isValid) return res.status(400).json({ error: "Invalid credentials" });

    const token = signToken({ userId: user.id });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
}

export async function getProfile(req: Request, res: Response) {
  const userId = (req as any).userId;
  try {
    const user = await findUserById(userId);
    res.json({ id: user?.id, email: user?.email, name: user?.name });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

