"use server";

import { fetcherWithAuth } from "./fetcher";

export async function adminGetUsersAction(clientToken?: string) {
	const data = await fetcherWithAuth<any[]>("/admin/users", {}, clientToken);
	return data || [];
}

export async function adminUpdateUserAction(id: number, role: string, clientToken?: string) {
	try {
		await fetcherWithAuth<any>(
			`/admin/users/${id}`,
			{
				method: "PUT",
				body: JSON.stringify({ role }),
			},
			clientToken
		);
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function adminDeleteUserAction(id: number, clientToken?: string) {
	try {
		await fetcherWithAuth<any>(
			`/admin/users/${id}`,
			{
				method: "DELETE",
			},
			clientToken
		);
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function adminGetPermissionsAction(clientToken?: string) {
	const data = await fetcherWithAuth<any[]>("/admin/permissions", {}, clientToken);
	return data || [];
}

export async function adminUpdatePermissionAction(id: number, access: string, clientToken?: string) {
	try {
		await fetcherWithAuth<any>(
			`/admin/permissions/${id}`,
			{
				method: "PUT",
				body: JSON.stringify({ access }),
			},
			clientToken
		);
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
