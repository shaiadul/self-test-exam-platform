"use server";

import { fetcherWithAuth } from "./fetcher";

export async function getDashboardStatsAction(clientToken?: string) {
	return await fetcherWithAuth<any>("/dashboard/stats", {}, clientToken);
}

export async function getTeacherReportsAction(clientToken?: string) {
	const data = await fetcherWithAuth<any[]>("/teacher/reports", {}, clientToken);
	return data || [];
}

export async function getTeacherReportDetailsAction(examId: string, clientToken?: string) {
	return await fetcherWithAuth<any>(`/teacher/reports/${examId}`, {}, clientToken);
}

export async function getAnalysisStatsAction(clientToken?: string) {
	return await fetcherWithAuth<any>("/admin/analysis", {}, clientToken);
}
