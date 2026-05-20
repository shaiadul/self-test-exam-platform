const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

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
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Invalid credentials. Please try again.");
  }

  setSession(data.token, data.user);
  return data;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Registration failed. Please try again.");
  }

  if (data.token) {
    setSession(data.token, data.user);
  }
  return data;
}

export async function completeProfile(profileData: CompleteProfileInput): Promise<User> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found. Please sign in.");
  }

  const response = await fetch(`${API_URL}/auth/complete-profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to update profile.");
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("userName", data.name);
  }
  return data;
}
