"use server";

import { revalidatePath } from "next/cache";
import { API_URL } from "./constants";
import { getAuthHeader } from "./common";

export async function getTransactionsAction() {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/transactions`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return [];
		return await response.json();
	} catch (error) {
		return [];
	}
}

export async function getFinancialSummaryAction() {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/transactions/summary`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		return null;
	}
}

export async function createTransactionAction(type: string, amount: number, description: string) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/transactions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...authHeader,
			},
			body: JSON.stringify({ type, amount, description }),
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Failed to create transaction");

		revalidatePath("/dashboard/settings/financial-report");
		return { success: true, transaction: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
