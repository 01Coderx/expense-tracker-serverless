import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import { User } from "./models/User";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required.");
}

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
};

export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const headerStore = await headers();
  const authHeader = headerStore.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED");
  }

  const token = authHeader.slice(7).trim();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    if (!decoded.id || typeof decoded.id !== "string") {
      throw new Error("UNAUTHORIZED");
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
    };
  } catch {
    throw new Error("UNAUTHORIZED");
  }
}
