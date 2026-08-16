"use server";

import { revalidatePath } from "next/cache";
import { API_URL } from "./constants";
import { getAuthHeader } from "./common";

export async function getExamsAction(packId: number) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exam-packs/${packId}/exams`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return [];
		return await response.json();
	} catch (error) {
		return [];
	}
}

export async function getExamDetailsAction(examId: string) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exams/${examId}`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		return null;
	}
}

export async function createExamAction(packId: number, examData: any) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exam-packs/${packId}/exams`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...authHeader,
			},
			body: JSON.stringify(examData),
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Failed to create exam");

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
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exams/${examId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				...authHeader,
			},
			body: JSON.stringify(examData),
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Failed to update exam");

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
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exams/${examId}`, {
			method: "DELETE",
			headers: { ...authHeader },
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || "Failed to delete exam");
		}

		revalidatePath("/dashboard");
		revalidatePath(`/dashboard/exam-pack/exam-pack-details`);
		revalidatePath(`/dashboard/manage-exam-pack/${packId}`);
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
