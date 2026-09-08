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
