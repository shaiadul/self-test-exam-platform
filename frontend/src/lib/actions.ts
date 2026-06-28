"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Helper to get authorization header
async function getAuthHeader(): Promise<Record<string, string>> {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;
	if (!token) return {};
	return { Authorization: `Bearer ${token}` };
}

// ----------------------------------------------------
// 1. AUTHENTICATION ACTIONS
// ----------------------------------------------------

export async function loginAction(email: string, password: string) {
	try {
		const response = await fetch(`${API_URL}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.error || "Invalid credentials.");
		}

		// Save token in httpOnly cookie
		const cookieStore = await cookies();
		cookieStore.set("token", data.token, {
			path: "/",
			maxAge: 60 * 60 * 24, // 24 hours
			httpOnly: false, // Set to false so client-side library can read if it needs to, but Server Actions will fetch it
			secure: false, // Development
		});

		return { success: true, user: data.user, token: data.token };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function registerAction(name: string, email: string, password: string) {
	try {
		const response = await fetch(`${API_URL}/auth/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, email, password }),
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.error || "Registration failed.");
		}

		const cookieStore = await cookies();
		if (data.token) {
			cookieStore.set("token", data.token, {
				path: "/",
				maxAge: 60 * 60 * 24,
				httpOnly: false,
				secure: false,
			});
		}

		return { success: true, user: data.user, token: data.token };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function logoutAction() {
	const cookieStore = await cookies();
	cookieStore.delete("token");
	revalidatePath("/");
	return { success: true };
}

export async function getProfileAction() {
	try {
		const authHeader = await getAuthHeader();
		if (!authHeader.Authorization) return null;

		const response = await fetch(`${API_URL}/auth/profile`, {
			method: "GET",
			headers: { ...authHeader },
		});

		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		return null;
	}
}

export async function updateProfileAction(profileData: any) {
	try {
		const authHeader = await getAuthHeader();
		if (!authHeader.Authorization) {
			throw new Error("Unauthorized: Please sign in again.");
		}

		const response = await fetch(`${API_URL}/auth/complete-profile`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...authHeader,
			},
			body: JSON.stringify(profileData),
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.error || "Failed to update profile.");
		}

		revalidatePath("/dashboard");
		revalidatePath("/dashboard/edit-profile");
		return { success: true, user: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

// ----------------------------------------------------
// 2. EXAMS AND PACKS ACTIONS
// ----------------------------------------------------

export async function getExamPacksAction() {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exam-packs`, {
			headers: { ...authHeader },
			next: { revalidate: 0 }, // Ensure it loads fresh database data
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

export async function getExamsAction(packId: number) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exam-packs/${packId}/exams`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return [];
		return await response.json();
	} catch (error) {
		return [];
	}
}

export async function getExamDetailsAction(examId: string) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exams/${examId}`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		return null;
	}
}

export async function createExamAction(packId: number, examData: any) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exam-packs/${packId}/exams`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...authHeader,
			},
			body: JSON.stringify(examData),
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Failed to create exam");

		revalidatePath("/dashboard");
		revalidatePath(`/dashboard/exam-pack/exam-pack-details`);
		revalidatePath(`/dashboard/manage-exam-pack/${packId}`);
		return { success: true, exam: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function updateExamAction(examId: string, packId: number, examData: any) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exams/${examId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				...authHeader,
			},
			body: JSON.stringify(examData),
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Failed to update exam");

		revalidatePath("/dashboard");
		revalidatePath(`/dashboard/exam-pack/exam-pack-details`);
		revalidatePath(`/dashboard/manage-exam-pack/${packId}`);
		return { success: true, exam: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function deleteExamAction(examId: string, packId: number) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exams/${examId}`, {
			method: "DELETE",
			headers: { ...authHeader },
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || "Failed to delete exam");
		}

		revalidatePath("/dashboard");
		revalidatePath(`/dashboard/exam-pack/exam-pack-details`);
		revalidatePath(`/dashboard/manage-exam-pack/${packId}`);
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function getQuestionsAction(examId: string) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exams/${examId}/questions`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return [];
		return await response.json();
	} catch (error) {
		return [];
	}
}

export async function createQuestionAction(examId: string, questionData: any) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exams/${examId}/questions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...authHeader,
			},
			body: JSON.stringify(questionData),
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Failed to create question");

		revalidatePath(`/dashboard/exam-pack/exam-pack-details`);
		return { success: true, question: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function submitExamAction(examId: string, answers: any, warningCount: number, securityMessage: string) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/exams/${examId}/submit`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...authHeader,
			},
			body: JSON.stringify({ answers, warningCount, securityMessage }),
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Failed to submit exam");

		revalidatePath("/dashboard");
		return { success: true, result: data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function getDashboardStatsAction() {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/dashboard/stats`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		return null;
	}
}

export async function getUserAttemptsAction() {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/attempts`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return [];
		return await response.json();
	} catch (error) {
		return [];
	}
}

export async function getAttemptDetailsAction(id: number) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/attempts/${id}`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		return null;
	}
}

export async function getTeacherReportsAction() {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/teacher/reports`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return [];
		return await response.json();
	} catch (error) {
		return [];
	}
}

export async function getTeacherReportDetailsAction(examId: string) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/teacher/reports/${examId}`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		return null;
	}
}

export async function adminGetUsersAction() {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/admin/users`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return [];
		return await response.json();
	} catch (error) {
		return [];
	}
}

export async function adminUpdateUserAction(id: number, role: string) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/admin/users/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				...authHeader,
			},
			body: JSON.stringify({ role }),
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || "Failed to update user");
		}
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function adminDeleteUserAction(id: number) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/admin/users/${id}`, {
			method: "DELETE",
			headers: { ...authHeader },
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || "Failed to delete user");
		}
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function adminGetPermissionsAction() {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/admin/permissions`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return [];
		return await response.json();
	} catch (error) {
		return [];
	}
}

export async function adminUpdatePermissionAction(id: number, access: string) {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/admin/permissions/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				...authHeader,
			},
			body: JSON.stringify({ access }),
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || "Failed to update permission");
		}
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function getAnalysisStatsAction() {
	try {
		const authHeader = await getAuthHeader();
		const response = await fetch(`${API_URL}/admin/analysis`, {
			headers: { ...authHeader },
			next: { revalidate: 0 },
		});

		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		return null;
	}
}

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
