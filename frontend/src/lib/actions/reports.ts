"use server";

import { API_URL } from "./constants";
import { getAuthHeader } from "./common";

export async function getDashboardStatsAction() {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/dashboard/stats`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		return null;
	}
}

export async function getTeacherReportsAction() {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/teacher/reports`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return [];
		return await response.json();
	} catch (error) {
		return [];
	}
}

export async function getTeacherReportDetailsAction(examId: string) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/teacher/reports/${examId}`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		return null;
	}
}

export async function getAnalysisStatsAction() {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/admin/analysis`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		return null;
	}
}
