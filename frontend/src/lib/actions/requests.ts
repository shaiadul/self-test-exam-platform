"use server";

import { revalidatePath } from "next/cache";
import { fetcherWithAuth } from "./fetcher";

export async function getRequestsAction(clientToken?: string) {
	const data = await fetcherWithAuth<any[]>("/requests", {}, clientToken);
	return data || [];
}

export async function createRequestAction(payload: {
	type: "pack" | "limit";
	packId?: number;
	title: string;
	description?: string;
	requestedLimit: number;
}) {
	try {
		const data = await fetcherWithAuth<any>("/requests", {
			method: "POST",
			body: JSON.stringify(payload),
			throwOnError: true,
		});

		if (!data) throw new Error("Failed to submit request");

		revalidatePath("/dashboard/requests");
		revalidatePath("/dashboard");
		return { success: true, request: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function reviewRequestAction(
	id: number,
	status: "approved" | "rejected",
	adminNote?: string
) {
	try {
		const data = await fetcherWithAuth<any>(`/requests/${id}`, {
			method: "PUT",
			body: JSON.stringify({ status, adminNote }),
			throwOnError: true,
		});

		revalidatePath("/dashboard/requests");
		revalidatePath("/dashboard");
		return { success: true, request: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
