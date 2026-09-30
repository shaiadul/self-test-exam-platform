import { loginAction, registerAction, updateProfileAction } from "./actions";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  image?: string;
  phone?: string;
  level?: string;
  batch?: string;
  board?: string;
  institution?: string;
  address?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CompleteProfileInput {
  image?: string;
  name?: string;
  email?: string;
  phone?: string;
  level?: string;
  batch?: string;
  board?: string;
  institution?: string;
  address?: string;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : null;
}

export function setSession(token: string, user: User) {
  if (typeof window === "undefined") return;
  // Token is managed at the fetch level via HTTP cookie
  document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
  document.cookie = `user_profile=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=86400; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("profileUpdated", { detail: user }));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userID");
  localStorage.removeItem("userImage");
  document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "user_profile=; path=/; max-age=0; SameSite=Lax";
  window.dispatchEvent(new CustomEvent("profileUpdated", { detail: null }));
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const result = await loginAction(email, password);
  if (!result.success || !result.token) {
    throw new Error(result.error || "Invalid credentials. Please try again.");
  }
  setSession(result.token, result.user);
  return { token: result.token, user: result.user };
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const result = await registerAction(name, email, password);
  if (!result.success || !result.token) {
    throw new Error(result.error || "Registration failed. Please try again.");
  }
  setSession(result.token, result.user);
  return { token: result.token, user: result.user };
}

export async function completeProfile(profileData: CompleteProfileInput): Promise<User> {
  const result = await updateProfileAction(profileData);
  if (!result.success || !result.user) {
    throw new Error(result.error || "Failed to update profile.");
  }
  if (typeof window !== "undefined") {
    localStorage.setItem("userName", result.user.name);
    if (result.user.image) {
      localStorage.setItem("userImage", result.user.image);
    }
    window.dispatchEvent(new CustomEvent("profileUpdated", { detail: result.user }));
  }
  return result.user;
}

