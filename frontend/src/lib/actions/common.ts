"use server";

import { cookies } from "next/headers";

export async function getAuthHeader(): Promise<Record<string, string>> {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;
	if (!token) return {};
	return { Authorization: `Bearer ${token}` };
}
