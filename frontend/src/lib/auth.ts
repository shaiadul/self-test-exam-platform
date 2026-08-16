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
  return localStorage.getItem("token");
}

export function setSession(token: string, user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  localStorage.setItem("userRole", user.role);
  localStorage.setItem("userName", user.name);
  localStorage.setItem("userEmail", user.email);
  localStorage.setItem("userID", user.id.toString());
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userID");
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
  }
  return result.user;
}

