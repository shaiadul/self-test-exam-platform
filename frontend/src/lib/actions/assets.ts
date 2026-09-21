"use server";

import { revalidatePath } from "next/cache";
import { fetcherWithAuth } from "./fetcher";

export async function getSystemAssetsAction(clientToken?: string) {
	const data = await fetcherWithAuth<any[]>("/assets", {}, clientToken);
	return data || [];
}

export async function createSystemAssetAction(type: string, value: string, clientToken?: string) {
	try {
		const asset = await fetcherWithAuth<any>(
			"/assets",
			{
				method: "POST",
				body: JSON.stringify({ type, value }),
			},
			clientToken
		);

		if (!asset) throw new Error("Failed to create asset");

		revalidatePath("/dashboard/settings/assets-setup");
		return { success: true, asset };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function updateSystemAssetAction(id: number, value: string, clientToken?: string) {
	try {
		await fetcherWithAuth<any>(
			`/assets/${id}`,
			{
				method: "PUT",
				body: JSON.stringify({ value }),
			},
			clientToken
		);

		revalidatePath("/dashboard/settings/assets-setup");
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function deleteSystemAssetAction(id: number, clientToken?: string) {
	try {
		await fetcherWithAuth<any>(
			`/assets/${id}`,
			{
				method: "DELETE",
			},
			clientToken
		);

		revalidatePath("/dashboard/settings/assets-setup");
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

// ---- Institution Suggestions ----

/** User submits a custom institution name (shown to admin for approval). */
export async function submitInstitutionSuggestionAction(value: string, clientToken?: string) {
	try {
		const s = await fetcherWithAuth<any>(
			"/institutions/suggest",
			{
				method: "POST",
				body: JSON.stringify({ value }),
			},
			clientToken
		);
		return { success: true, suggestion: s };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

/** Admin: fetch all (or filtered by status) institution suggestions. */
export async function getInstitutionSuggestionsAction(status?: string, clientToken?: string) {
	const qs = status ? `?status=${status}` : "";
	const data = await fetcherWithAuth<any[]>(`/admin/institutions/suggestions${qs}`, {}, clientToken);
	return Array.isArray(data) ? data : [];
}

/** Admin: edit an institution suggestion name. */
export async function updateInstitutionSuggestionAction(id: number, value: string, clientToken?: string) {
	try {
		const s = await fetcherWithAuth<any>(
			`/admin/institutions/suggestions/${id}`,
			{
				method: "PUT",
				body: JSON.stringify({ value }),
			},
			clientToken
		);
		revalidatePath("/dashboard/settings/assets-setup");
		return { success: true, suggestion: s };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

/** Admin: approve a suggestion (optionally with an edited value) → promotes value to system_assets. */
export async function approveInstitutionSuggestionAction(id: number, editedValue?: string, clientToken?: string) {
	try {
		const s = await fetcherWithAuth<any>(
			`/admin/institutions/suggestions/${id}/approve`,
			{
				method: "PUT",
				body: editedValue ? JSON.stringify({ value: editedValue }) : undefined,
			},
			clientToken
		);
		revalidatePath("/dashboard/settings/assets-setup");
		return { success: true, suggestion: s };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

/** Admin: reject (soft-delete) a suggestion. */
export async function rejectInstitutionSuggestionAction(id: number, clientToken?: string) {
	try {
		await fetcherWithAuth<any>(
			`/admin/institutions/suggestions/${id}`,
			{ method: "DELETE" },
			clientToken
		);
		revalidatePath("/dashboard/settings/assets-setup");
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

