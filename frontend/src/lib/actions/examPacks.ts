"use server";

import { revalidatePath } from "next/cache";
import { fetcherWithAuth } from "./fetcher";

export async function getExamPacksAction(clientToken?: string) {
	const data = await fetcherWithAuth<any[]>("/exam-packs", {}, clientToken);
	return data || [];
}

export async function getExamPackDetailsAction(id: number, clientToken?: string) {
	return await fetcherWithAuth<any>(`/exam-packs/${id}`, {}, clientToken);
}

export async function createExamPackAction(packData: any) {
	try {
		const data = await fetcherWithAuth<any>("/exam-packs", {
			method: "POST",
			body: JSON.stringify(packData),
		});

		if (!data) throw new Error("Failed to create exam pack");

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
		const data = await fetcherWithAuth<any>(`/exam-packs/${id}`, {
			method: "PUT",
			body: JSON.stringify(packData),
		});

		if (!data) throw new Error("Failed to update exam pack");

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
		await fetcherWithAuth<any>(`/exam-packs/${id}`, {
			method: "DELETE",
		});

		revalidatePath("/dashboard");
		revalidatePath("/dashboard/exam-pack");
		revalidatePath("/dashboard/manage-exam-pack");
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
