"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { API_URL } from "./constants";
import { fetcher, fetcherWithAuth } from "./fetcher";

export async function loginAction(email: string, password: string) {
	try {
		const response = await fetch(`${API_URL}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
			cache: "no-store",
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.error || "Invalid credentials.");
		}

		// Save token & user profile in cookie
		const cookieStore = await cookies();
		cookieStore.set("token", data.token, {
			path: "/",
			maxAge: 60 * 60 * 24, // 24 hours
			httpOnly: false,
			secure: false,
		});

		if (data.user) {
			cookieStore.set("user_profile", JSON.stringify(data.user), {
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

export async function registerAction(name: string, email: string, password: string) {
	try {
		const response = await fetch(`${API_URL}/auth/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, email, password }),
			cache: "no-store",
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
		if (data.user) {
			cookieStore.set("user_profile", JSON.stringify(data.user), {
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
	try {
		await fetcherWithAuth<any>("/auth/logout", {
			method: "POST",
		});
	} catch {
		// Proceed with local cookie cleanup even if backend is offline
	}

	const cookieStore = await cookies();
	cookieStore.delete("token");
	cookieStore.delete("user_profile");
	cookieStore.delete("authjs.session-token");
	cookieStore.delete("__Secure-authjs.session-token");
	cookieStore.delete("next-auth.session-token");
	cookieStore.delete("__Secure-next-auth.session-token");

	revalidatePath("/", "layout");
	return { success: true };
}

/**
 * Returns user profile, prioritizing the HTTP cookie to avoid redundant backend requests.
 */
export async function getProfileAction(forceFresh = false) {
	try {
		const cookieStore = await cookies();
		if (!forceFresh) {
			const cached = cookieStore.get("user_profile")?.value;
			if (cached) {
				try {
					return JSON.parse(decodeURIComponent(cached));
				} catch {
					try {
						return JSON.parse(cached);
					} catch {
						// invalid JSON, fall through to fetch
					}
				}
			}
		}

		const profile = await fetcherWithAuth<any>("/auth/profile");
		if (profile && profile.id) {
			try {
				cookieStore.set("user_profile", JSON.stringify(profile), {
					path: "/",
					maxAge: 60 * 60 * 24,
					httpOnly: false,
					secure: false,
				});
			} catch {
				// Server component read-only cookie context; ignore
			}
		}
		return profile;
	} catch {
		return null;
	}
}

export async function updateProfileAction(profileData: any) {
	try {
		const user = await fetcherWithAuth<any>("/auth/complete-profile", {
			method: "PUT",
			body: JSON.stringify(profileData),
		});

		if (!user) throw new Error("Failed to update profile.");

		try {
			const cookieStore = await cookies();
			cookieStore.set("user_profile", JSON.stringify(user), {
				path: "/",
				maxAge: 60 * 60 * 24,
				httpOnly: false,
				secure: false,
			});
		} catch {
			// ignore
		}

		revalidatePath("/dashboard");
		revalidatePath("/dashboard/edit-profile");
		return { success: true, user };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

// ---------------------------------------------------------------------------
// Password Reset Flow
// ---------------------------------------------------------------------------

export async function requestPasswordResetAction(email: string) {
	try {
		const response = await fetch(`${API_URL}/auth/forgot-password`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email }),
			cache: "no-store",
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.error || "Failed to send recovery OTP.");
		}

		return { success: true, message: data.message };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function verifyResetOtpAction(email: string, otp: string) {
	try {
		const response = await fetch(`${API_URL}/auth/verify-otp`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, otp }),
			cache: "no-store",
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.error || "Invalid or expired OTP.");
		}

		return { success: true, resetToken: data.resetToken };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function confirmPasswordResetAction(
	token: string,
	password: string
) {
	try {
		const response = await fetch(`${API_URL}/auth/reset-password`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token, password }),
			cache: "no-store",
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.error || "Failed to reset password.");
		}

		return { success: true, message: data.message };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
