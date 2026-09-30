"use server";

import { fetcherWithAuth } from "./fetcher";
import { PaginationParams, PaginatedResponse, normalizePaginatedResponse } from "./pagination";

export async function adminGetUsersAction(clientToken?: string) {
	const res = await fetcherWithAuth<any>("/admin/users?per_page=100", {}, clientToken);
	if (Array.isArray(res)) return res;
	if (res && Array.isArray(res.data)) return res.data;
	return [];
}

export async function adminGetUsersPaginatedAction(
	params?: PaginationParams,
	clientToken?: string
): Promise<PaginatedResponse<any>> {
	const queryParams: Record<string, string | number | boolean | undefined> = {};
	if (params?.page) queryParams.page = params.page;
	if (params?.per_page) queryParams.per_page = params.per_page;
	if (params?.search) queryParams.search = params.search;

	const res = await fetcherWithAuth<any>(
		"/admin/users",
		{ params: queryParams },
		clientToken
	);

	return normalizePaginatedResponse(res, params?.page || 1, params?.per_page || 10);
}

export async function adminUpdateUserAction(
	id: number,
	updateData: string | { role?: string; examLimit?: number; examPackLimit?: number },
	clientToken?: string
) {
	try {
		const payload = typeof updateData === "string" ? { role: updateData } : updateData;
		await fetcherWithAuth<any>(
			`/admin/users/${id}`,
			{
				method: "PUT",
				body: JSON.stringify(payload),
				throwOnError: true,
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
				throwOnError: true,
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
				throwOnError: true,
			},
			clientToken
		);
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
