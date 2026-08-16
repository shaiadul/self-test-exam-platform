"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { API_URL } from "./constants";
import { getAuthHeader } from "./common";

export async function loginAction(email: string, password: string) {
	try {
		const response = await fetch(`${API_URL}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.error || "Invalid credentials.");
		}

		// Save token in httpOnly cookie
		const cookieStore = await cookies();
		cookieStore.set("token", data.token, {
			path: "/",
			maxAge: 60 * 60 * 24, // 24 hours
			httpOnly: false,
			secure: false,
		});

		return { success: true, user: data.user, token: data.token };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function registerAction(name: string, email: string, password: string) {
	try {
		const response = await fetch(`${API_URL}/auth/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, email, password }),
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.error || "Registration failed.");
		}

		const cookieStore = await cookies();
		if (data.token) {
			cookieStore.set("token", data.token, {
				path: "/",
				maxAge: 60 * 60 * 24,
				httpOnly: false,
				secure: false,
			});
		}

		return { success: true, user: data.user, token: data.token };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function logoutAction() {
	const cookieStore = await cookies();
	cookieStore.delete("token");
	revalidatePath("/");
	return { success: true };
}

export async function getProfileAction() {
	try {
		const authHeader = await getAuthHeader();
		if (!authHeader.Authorization) return null;

		const response = await fetch(`${API_URL}/auth/profile`, {
			method: "GET",
			headers: { ...authHeader },
		});

		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		return null;
	}
}

export async function updateProfileAction(profileData: any) {
	try {
		const authHeader = await getAuthHeader();
		if (!authHeader.Authorization) {
			throw new Error("Unauthorized: Please sign in again.");
		}

		const response = await fetch(`${API_URL}/auth/complete-profile`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...authHeader,
			},
			body: JSON.stringify(profileData),
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.error || "Failed to update profile.");
		}

		revalidatePath("/dashboard");
		revalidatePath("/dashboard/edit-profile");
		return { success: true, user: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
