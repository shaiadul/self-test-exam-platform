"use server";

import { revalidatePath } from "next/cache";
import { API_URL } from "./constants";
import { getAuthHeader } from "./common";

export async function getSystemAssetsAction() {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/assets`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return [];
		return await response.json();
	} catch (error) {
		return [];
	}
}

export async function createSystemAssetAction(type: string, value: string) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/assets`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...authHeader,
			},
			body: JSON.stringify({ type, value }),
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Failed to create asset");

		revalidatePath("/dashboard/settings/assets-setup");
		return { success: true, asset: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function deleteSystemAssetAction(id: number) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/assets/${id}`, {
			method: "DELETE",
			headers: { ...authHeader },
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || "Failed to delete asset");
		}

		revalidatePath("/dashboard/settings/assets-setup");
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
