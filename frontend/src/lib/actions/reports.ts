"use server";

import { fetcherWithAuth } from "./fetcher";

export async function getDashboardStatsAction(clientToken?: string) {
	return await fetcherWithAuth<any>("/dashboard/stats", {}, clientToken);
}

export async function getTeacherReportsAction(clientToken?: string) {
	const res = await fetcherWithAuth<any>("/teacher/reports", {}, clientToken);
	if (res && typeof res === "object" && Array.isArray(res.data)) {
		return res.data as any[];
	}
	return Array.isArray(res) ? res : [];
}

export async function getTeacherReportDetailsAction(examId: string, clientToken?: string) {
	return await fetcherWithAuth<any>(`/teacher/reports/${examId}`, {}, clientToken);
}

export async function getAnalysisStatsAction(clientToken?: string) {
	return await fetcherWithAuth<any>("/admin/analysis", {}, clientToken);
}
