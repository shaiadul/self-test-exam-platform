"use server";

import { revalidatePath } from "next/cache";
import { API_URL } from "./constants";
import { getAuthHeader } from "./common";

export async function getQuestionsAction(examId: string) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exams/${examId}/questions`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return [];
		return await response.json();
	} catch (error) {
		return [];
	}
}

export async function createQuestionAction(examId: string, questionData: any) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exams/${examId}/questions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...authHeader,
			},
			body: JSON.stringify(questionData),
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Failed to create question");

		revalidatePath(`/dashboard/exam-pack/exam-pack-details`);
		return { success: true, question: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
