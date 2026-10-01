"use server";

import { revalidatePath } from "next/cache";
import { fetcherWithAuth } from "./fetcher";
import { getProfileAction } from "./auth";
import { PaginationParams, PaginatedResponse, normalizePaginatedResponse } from "./pagination";

export async function getExamPacksAction(options?: { mine?: boolean; manage?: boolean } | string) {
	const isMine = typeof options === "object" && Boolean(options?.mine);
	const isManage = typeof options === "object" && Boolean(options?.manage);

	let profile: any = null;
	try {
		profile = await getProfileAction();
	} catch {
		// unauthenticated
	}
	const role = String(profile?.role || "").toLowerCase();

	if (isManage && role === "student") {
		return [];
	}

	let endpoint = "/exam-packs?per_page=100";
	if (isManage) {
		endpoint += "&manage=true";
	} else if (isMine) {
		endpoint += "&mine=true";
	}

	const data = await fetcherWithAuth<any>(endpoint);
	let packs: any[] = [];
	if (Array.isArray(data)) packs = data;
	else if (data && Array.isArray(data.data)) packs = data.data;

	// The backend already filters by creator for teachers when manage=true or mine=true,
	// so we trust the backend response. Only guard against students.
	if ((isManage || isMine) && role === "student") {
		return [];
	}

	return packs;
}

export async function getExamPacksPaginatedAction(
	params?: PaginationParams,
	clientToken?: string
): Promise<PaginatedResponse<any>> {
	let profile: any = null;
	try {
		profile = await getProfileAction();
	} catch {
		// unauthenticated
	}
	const role = String(profile?.role || "").toLowerCase();

	const isManage = Boolean(params?.manage);
	const isMine = Boolean(params?.mine);

	if (isManage && role === "student") {
		return {
			data: [],
			meta: {
				total_items: 0,
				total_pages: 1,
				current_page: params?.page || 1,
				per_page: params?.per_page || 10,
			},
		};
	}

	const queryParams: Record<string, string | number | boolean | undefined> = {};
	if (params?.page) queryParams.page = params.page;
	if (params?.per_page) queryParams.per_page = params.per_page;
	if (params?.limit) queryParams.limit = params.limit;
	if (params?.search) queryParams.search = params.search;
	if (params?.category) queryParams.category = params.category;
	if (params?.sort_by) queryParams.sort_by = params.sort_by;
	if (params?.sort_order) queryParams.sort_order = params.sort_order;
	if (isManage) queryParams.manage = true;
	else if (isMine) queryParams.mine = true;

	const data = await fetcherWithAuth<any>(
		"/exam-packs",
		{ params: queryParams },
		clientToken
	);
	const normalized = normalizePaginatedResponse(data, params?.page || 1, params?.per_page || 10);

	// The backend already filters by creator for teachers when manage=true or mine=true,
	// so we trust the backend response and do NOT re-filter here. Re-filtering a paginated
	// response breaks pagination metadata and drops items from other pages.
	if ((isManage || isMine) && role === "student") {
		return {
			data: [],
			meta: {
				total_items: 0,
				total_pages: 1,
				current_page: params?.page || 1,
				per_page: params?.per_page || 10,
			},
		};
	}

	return normalized;
}

export async function getExamPackDetailsAction(id: number, clientToken?: string) {
	return await fetcherWithAuth<any>(`/exam-packs/${id}`, {}, clientToken);
}

export async function createExamPackAction(packData: any) {
	try {
		const data = await fetcherWithAuth<any>("/exam-packs", {
			method: "POST",
			body: JSON.stringify(packData),
		});

		if (!data) throw new Error("Failed to create exam pack");

		revalidatePath("/dashboard");
		revalidatePath("/dashboard/exam-pack");
		revalidatePath("/dashboard/manage-exam-pack");
		return { success: true, pack: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function updateExamPackAction(id: number, packData: any) {
	try {
		const data = await fetcherWithAuth<any>(`/exam-packs/${id}`, {
			method: "PUT",
			body: JSON.stringify(packData),
		});

		if (!data) throw new Error("Failed to update exam pack");

		revalidatePath("/dashboard");
		revalidatePath("/dashboard/exam-pack");
		revalidatePath("/dashboard/manage-exam-pack");
		return { success: true, pack: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function deleteExamPackAction(id: number) {
	try {
		await fetcherWithAuth<any>(`/exam-packs/${id}`, {
			method: "DELETE",
		});

		revalidatePath("/dashboard");
		revalidatePath("/dashboard/exam-pack");
		revalidatePath("/dashboard/manage-exam-pack");
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
