"use server";

import { revalidatePath } from "next/cache";
import { fetcherWithAuth } from "./fetcher";

export async function getQuestionsAction(examId: string, clientToken?: string) {
	const data = await fetcherWithAuth<any[]>(`/exams/${examId}/questions`, {}, clientToken);
	return data || [];
}

export async function createQuestionAction(examId: string, questionData: any) {
	try {
		const data = await fetcherWithAuth<any>(`/exams/${examId}/questions`, {
			method: "POST",
			body: JSON.stringify(questionData),
		});

		if (!data) throw new Error("Failed to create question");

		revalidatePath(`/dashboard/exam-pack/exam-pack-details`);
		return { success: true, question: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function updateQuestionAction(examId: string, questionId: number | string, questionData: any) {
	try {
		const data = await fetcherWithAuth<any>(`/exams/${examId}/questions/${questionId}`, {
			method: "PUT",
			body: JSON.stringify(questionData),
		});

		if (!data) throw new Error("Failed to update question");

		revalidatePath(`/dashboard/question/add`);
		revalidatePath(`/dashboard/exam-pack/exam-pack-details`);
		return { success: true, question: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function deleteQuestionAction(examId: string, questionId: number | string) {
	try {
		await fetcherWithAuth<any>(`/exams/${examId}/questions/${questionId}`, {
			method: "DELETE",
		});

		revalidatePath(`/dashboard/question/add`);
		revalidatePath(`/dashboard/exam-pack/exam-pack-details`);
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
