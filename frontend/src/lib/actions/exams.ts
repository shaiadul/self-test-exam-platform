"use server";

import { revalidatePath } from "next/cache";
import { fetcherWithAuth } from "./fetcher";

export async function getExamsAction(packId: number, clientToken?: string) {
	const data = await fetcherWithAuth<any[]>(`/exam-packs/${packId}/exams`, {}, clientToken);
	return data || [];
}

export async function getExamDetailsAction(examId: string, clientToken?: string) {
	return await fetcherWithAuth<any>(`/exams/${examId}`, {}, clientToken);
}

export async function createExamAction(packId: number, examData: any) {
	try {
		const data = await fetcherWithAuth<any>(`/exam-packs/${packId}/exams`, {
			method: "POST",
			body: JSON.stringify(examData),
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
