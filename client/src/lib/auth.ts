import { apiRequest } from "./queryClient";
import { User, InsertUser } from "@shared/schema";

interface AuthResponse {
  user: User;
  token: string;
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  try {
    const res = await apiRequest("POST", "/api/auth/login", {
      username,
      password
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Đăng nhập thất bại");
    }

    return await res.json();
  } catch (error: any) {
    throw new Error(error.message || "Đăng nhập thất bại");
  }
}

export async function register(userData: InsertUser): Promise<AuthResponse> {
  try {
    const res = await apiRequest("POST", "/api/auth/register", userData);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Đăng ký thất bại");
    }

    return await res.json();
  } catch (error: any) {
    throw new Error(error.message || "Đăng ký thất bại");
  }
}

export async function getProfile(token: string): Promise<User> {
  try {
    const res = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      credentials: "include"
    });

    if (!res.ok) {
      throw new Error("Failed to get user profile");
    }

    return await res.json();
  } catch (error: any) {
    throw new Error(error.message || "Failed to get user profile");
  }
}

export function getAuthHeader(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
