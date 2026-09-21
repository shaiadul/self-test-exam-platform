"use server";

import { revalidatePath } from "next/cache";
import { fetcherWithAuth } from "./fetcher";
import { PaginationParams, PaginatedResponse, normalizePaginatedResponse } from "./pagination";

export async function getExamPacksAction(clientToken?: string) {
	const data = await fetcherWithAuth<any>("/exam-packs?per_page=100", {}, clientToken);
	if (Array.isArray(data)) return data;
	if (data && Array.isArray(data.data)) return data.data;
	return [];
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

	const data = await fetcherWithAuth<any>(
		"/exam-packs",
		{ params: queryParams },
		clientToken
	);
	return normalizePaginatedResponse(data, params?.page || 1, params?.per_page || 10);
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
