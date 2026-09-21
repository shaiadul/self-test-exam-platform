"use server";

import { revalidatePath } from "next/cache";
import { fetcherWithAuth } from "./fetcher";

export async function submitExamAction(
	examId: string,
	answers: any,
	warningCount: number,
	securityMessage: string,
	passcode?: string,
	durationSeconds?: number,
	startedAt?: string,
	clientToken?: string
) {
	try {
		const result = await fetcherWithAuth<any>(
			`/exams/${examId}/submit`,
			{
				method: "POST",
				body: JSON.stringify({ answers, warningCount, securityMessage, passcode, durationSeconds, startedAt }),
			},
			clientToken
		);

		if (!result) throw new Error("Failed to submit exam");

		revalidatePath("/dashboard");
		return { success: true, result };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function verifyExamPasscodeAction(examId: string, passcode: string, clientToken?: string) {
	try {
		await fetcherWithAuth<any>(
			`/exams/${examId}/verify-passcode`,
			{
				method: "POST",
				body: JSON.stringify({ passcode }),
				throwOnError: true,
			},
			clientToken
		);
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

import { PaginationParams, PaginatedResponse, normalizePaginatedResponse } from "./pagination";

export async function getUserAttemptsAction(clientToken?: string) {
	const res = await fetcherWithAuth<any>("/attempts?per_page=100", {}, clientToken);
	if (Array.isArray(res)) return res;
	if (res && Array.isArray(res.data)) return res.data;
	return [];
}

export async function getUserAttemptsPaginatedAction(
	params?: PaginationParams,
	clientToken?: string
): Promise<PaginatedResponse<any>> {
	const queryParams: Record<string, string | number | boolean | undefined> = {};
	if (params?.page) queryParams.page = params.page;
	if (params?.per_page) queryParams.per_page = params.per_page;
	if (params?.search) queryParams.search = params.search;

	const res = await fetcherWithAuth<any>(
		"/attempts",
		{ params: queryParams },
		clientToken
	);

	return normalizePaginatedResponse(res, params?.page || 1, params?.per_page || 10);
}

export async function getAttemptDetailsAction(id: number, clientToken?: string) {
	return await fetcherWithAuth<any>(`/attempts/${id}`, {}, clientToken);
}

export async function getAttemptQuestionsAction(attemptId: number, clientToken?: string) {
	const data = await fetcherWithAuth<any[]>(`/attempts/${attemptId}/questions`, {}, clientToken);
	return data || [];
}
