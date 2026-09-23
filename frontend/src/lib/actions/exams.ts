"use server";

import { revalidatePath } from "next/cache";
import { fetcherWithAuth } from "./fetcher";
import { getProfileAction } from "./auth";
import { PaginationParams, PaginationMeta, PaginatedResponse, normalizePaginatedResponse } from "./pagination";

export type ExamListParams = PaginationParams;
export type PaginatedExamsResponse = PaginatedResponse<any>;
export type { PaginationMeta };

export async function getAllExamsAction(
	params?: ExamListParams,
	clientToken?: string
): Promise<PaginatedExamsResponse> {
	const queryParams: Record<string, string | number | boolean | undefined> = {};
	if (params?.search) queryParams.search = params.search;
	if (params?.page) queryParams.page = params.page;
	if (params?.per_page) queryParams.per_page = params.per_page;
	if (params?.limit) queryParams.limit = params.limit;
	if (params?.pack_id) queryParams.pack_id = params.pack_id;
	if (params?.level) queryParams.level = params.level;
	if (params?.batch) queryParams.batch = params.batch;

	const res = await fetcherWithAuth<any>(
		"/exams",
		{ params: queryParams },
		clientToken
	);

	return normalizePaginatedResponse(res, params?.page || 1, params?.per_page || params?.limit || 10);
}

export async function getExamsAction(packId: number, clientToken?: string) {
	const res = await fetcherWithAuth<any>(`/exam-packs/${packId}/exams?per_page=100`, {}, clientToken);
	if (Array.isArray(res)) return res;
	if (res && Array.isArray(res.data)) return res.data;
	return [];
}

export async function getExamsPaginatedAction(
	packId: number,
	params?: PaginationParams,
	clientToken?: string
): Promise<PaginatedResponse<any>> {
	const queryParams: Record<string, string | number | boolean | undefined> = {};
	if (params?.search) queryParams.search = params.search;
	if (params?.page) queryParams.page = params.page;
	if (params?.per_page) queryParams.per_page = params.per_page;
	if (params?.limit) queryParams.limit = params.limit;

	const res = await fetcherWithAuth<any>(
		`/exam-packs/${packId}/exams`,
		{ params: queryParams },
		clientToken
	);

	return normalizePaginatedResponse(res, params?.page || 1, params?.per_page || 10);
}

export async function getTeacherExamsAction(packId: number, clientToken?: string) {
	try {
		const profile = await getProfileAction();
		const role = String(profile?.role || "").toLowerCase();
		if (role === "student") {
			return [];
		}

		const data = await fetcherWithAuth<any[]>(`/exam-packs/${packId}/exams?manage=true`, {}, clientToken);
		if (!Array.isArray(data)) return [];

		if (role === "teacher" && profile?.id) {
			return data.filter((e: any) => !e.createdBy || String(e.createdBy) === String(profile.id));
		}

		return data;
	} catch {
		return [];
	}
}

export async function getExamDetailsAction(examId: string, clientToken?: string) {
	return await fetcherWithAuth<any>(`/exams/${examId}`, {}, clientToken);
}

export async function createExamAction(packId: number, examData: any) {
	try {
		const data = await fetcherWithAuth<any>(`/exam-packs/${packId}/exams`, {
			method: "POST",
			body: JSON.stringify(examData),
			throwOnError: true,
		});

		if (!data) throw new Error("Failed to create exam");

		revalidatePath("/dashboard");
		revalidatePath(`/dashboard/exam-pack/exam-pack-details`);
		revalidatePath(`/dashboard/manage-exam-pack/${packId}`);
		return { success: true, exam: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function updateExamAction(examId: string, packId: number, examData: any) {
	try {
		const data = await fetcherWithAuth<any>(`/exams/${examId}`, {
			method: "PUT",
			body: JSON.stringify(examData),
		});

		if (!data) throw new Error("Failed to update exam");

		revalidatePath("/dashboard");
		revalidatePath(`/dashboard/exam-pack/exam-pack-details`);
		revalidatePath(`/dashboard/manage-exam-pack/${packId}`);
		return { success: true, exam: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function deleteExamAction(examId: string, packId: number) {
	try {
		const res = await fetcherWithAuth<any>(`/exams/${examId}`, {
			method: "DELETE",
		});

		revalidatePath("/dashboard");
		revalidatePath(`/dashboard/exam-pack/exam-pack-details`);
		revalidatePath(`/dashboard/manage-exam-pack/${packId}`);
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
