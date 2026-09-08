"use server";

import { revalidatePath } from "next/cache";
import { fetcherWithAuth } from "./fetcher";

export async function getTransactionsAction(clientToken?: string) {
	const data = await fetcherWithAuth<any[]>("/transactions", {}, clientToken);
	return data || [];
}

export async function getFinancialSummaryAction(clientToken?: string) {
	return await fetcherWithAuth<any>("/transactions/summary", {}, clientToken);
}

export async function createTransactionAction(
	type: string,
	amount: number,
	description: string,
	clientToken?: string
) {
	try {
		const transaction = await fetcherWithAuth<any>(
			"/transactions",
			{
				method: "POST",
				body: JSON.stringify({ type, amount, description }),
			},
			clientToken
		);

		if (!transaction) throw new Error("Failed to create transaction");

		revalidatePath("/dashboard/settings/financial-report");
		return { success: true, transaction };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
