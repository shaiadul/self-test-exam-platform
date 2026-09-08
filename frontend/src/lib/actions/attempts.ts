"use server";

import { revalidatePath } from "next/cache";
import { fetcherWithAuth } from "./fetcher";

export async function submitExamAction(
	examId: string,
	answers: any,
	warningCount: number,
	securityMessage: string,
	clientToken?: string
) {
	try {
		const result = await fetcherWithAuth<any>(
			`/exams/${examId}/submit`,
			{
				method: "POST",
				body: JSON.stringify({ answers, warningCount, securityMessage }),
			},
			clientToken
		);

		if (!result) throw new Error("Failed to submit exam");

		revalidatePath("/dashboard");
		return { success: true, result };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function getUserAttemptsAction(clientToken?: string) {
	const data = await fetcherWithAuth<any[]>("/attempts", {}, clientToken);
	return data || [];
}

export async function getAttemptDetailsAction(id: number, clientToken?: string) {
	return await fetcherWithAuth<any>(`/attempts/${id}`, {}, clientToken);
}
