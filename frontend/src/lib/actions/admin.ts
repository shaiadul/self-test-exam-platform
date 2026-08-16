"use server";

import { API_URL } from "./constants";
import { getAuthHeader } from "./common";

export async function adminGetUsersAction() {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/admin/users`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return [];
		return await response.json();
	} catch (error) {
		return [];
	}
}

export async function adminUpdateUserAction(id: number, role: string) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/admin/users/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				...authHeader,
			},
			body: JSON.stringify({ role }),
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || "Failed to update user");
		}
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function adminDeleteUserAction(id: number) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/admin/users/${id}`, {
			method: "DELETE",
			headers: { ...authHeader },
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || "Failed to delete user");
		}
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function adminGetPermissionsAction() {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/admin/permissions`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return [];
		return await response.json();
	} catch (error) {
		return [];
	}
}

export async function adminUpdatePermissionAction(id: number, access: string) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/admin/permissions/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				...authHeader,
			},
			body: JSON.stringify({ access }),
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || "Failed to update permission");
		}
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
