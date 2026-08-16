"use server";

import { revalidatePath } from "next/cache";
import { API_URL } from "./constants";
import { getAuthHeader } from "./common";

export async function submitExamAction(examId: string, answers: any, warningCount: number, securityMessage: string) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exams/${examId}/submit`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...authHeader,
			},
			body: JSON.stringify({ answers, warningCount, securityMessage }),
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Failed to submit exam");

		revalidatePath("/dashboard");
		return { success: true, result: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function getUserAttemptsAction() {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/attempts`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return [];
		return await response.json();
	} catch (error) {
		return [];
	}
}

export async function getAttemptDetailsAction(id: number) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/attempts/${id}`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		return null;
	}
}
