import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "berber-randevu-super-secret-key-change-in-production"
);

const COOKIE_NAME = "admin_session";

export async function createSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function verifySession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;

    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function verifyPassword(password: string): Promise<boolean> {
  const adminPassSetting = await prisma.setting.findUnique({
    where: { key: "admin_password_hash" },
  });

  if (!adminPassSetting) return false;
  return bcrypt.compare(password, adminPassSetting.value);
}

export async function changePassword(newPassword: string): Promise<void> {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  await prisma.setting.upsert({
    where: { key: "admin_password_hash" },
    update: { value: hash },
    create: { key: "admin_password_hash", value: hash },
  });
}