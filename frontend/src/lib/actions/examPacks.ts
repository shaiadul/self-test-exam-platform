"use server";

import { revalidatePath } from "next/cache";
import { API_URL } from "./constants";
import { getAuthHeader } from "./common";

export async function getExamPacksAction() {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exam-packs`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return [];
		return await response.json();
	} catch (error) {
		return [];
	}
}

export async function getExamPackDetailsAction(id: number) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exam-packs/${id}`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		return null;
	}
}

export async function createExamPackAction(packData: any) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exam-packs`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...authHeader,
			},
			body: JSON.stringify(packData),
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Failed to create exam pack");

		revalidatePath("/dashboard");
		revalidatePath("/dashboard/exam-pack");
		revalidatePath("/dashboard/manage-exam-pack");
		return { success: true, pack: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function updateExamPackAction(id: number, packData: any) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exam-packs/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				...authHeader,
			},
			body: JSON.stringify(packData),
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Failed to update exam pack");

		revalidatePath("/dashboard");
		revalidatePath("/dashboard/exam-pack");
		revalidatePath("/dashboard/manage-exam-pack");
		return { success: true, pack: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function deleteExamPackAction(id: number) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exam-packs/${id}`, {
			method: "DELETE",
			headers: { ...authHeader },
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || "Failed to delete exam pack");
		}

		revalidatePath("/dashboard");
		revalidatePath("/dashboard/exam-pack");
		revalidatePath("/dashboard/manage-exam-pack");
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
