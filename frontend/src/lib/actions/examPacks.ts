"use server";

import { revalidatePath } from "next/cache";
import { fetcherWithAuth } from "./fetcher";
import { getProfileAction } from "./auth";
import { PaginationParams, PaginatedResponse, normalizePaginatedResponse } from "./pagination";

export async function getExamPacksAction(options?: { mine?: boolean } | string) {
	let endpoint = "/exam-packs?per_page=100";
	const isMine = typeof options === "object" && options?.mine;
	if (isMine) {
		endpoint += "&mine=true";
	}
	const data = await fetcherWithAuth<any>(endpoint);
	let packs: any[] = [];
	if (Array.isArray(data)) packs = data;
	else if (data && Array.isArray(data.data)) packs = data.data;

	if (isMine) {
		try {
			const profile = await getProfileAction();
			if (profile && String(profile.role).toLowerCase() === "teacher") {
				return packs.filter((p: any) => p.createdBy && Number(p.createdBy) === Number(profile.id));
			}
		} catch {
			// ignore
		}
	}

	return packs;
}

export async function getExamPacksPaginatedAction(
	params?: PaginationParams,
	clientToken?: string
): Promise<PaginatedResponse<any>> {
	const queryParams: Record<string, string | number | boolean | undefined> = {};
	if (params?.page) queryParams.page = params.page;
	if (params?.per_page) queryParams.per_page = params.per_page;
	if (params?.limit) queryParams.limit = params.limit;
	if (params?.search) queryParams.search = params.search;
	if (params?.category) queryParams.category = params.category;
	if (params?.sort_by) queryParams.sort_by = params.sort_by;
	if (params?.sort_order) queryParams.sort_order = params.sort_order;
	if (params?.mine) queryParams.mine = true;

	const data = await fetcherWithAuth<any>(
		"/exam-packs",
		{ params: queryParams },
		clientToken
	);
	const normalized = normalizePaginatedResponse(data, params?.page || 1, params?.per_page || 10);

	if (params?.mine) {
		try {
			const profile = await getProfileAction();
			if (profile && String(profile.role).toLowerCase() === "teacher") {
				const filtered = (normalized.data || []).filter(
					(p: any) => p.createdBy && Number(p.createdBy) === Number(profile.id)
				);
				return {
					data: filtered,
					meta: {
						...normalized.meta,
						total_items: filtered.length,
						total_pages: Math.max(1, Math.ceil(filtered.length / (params?.per_page || 10))),
					},
				};
			}
		} catch {
			// ignore
		}
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
