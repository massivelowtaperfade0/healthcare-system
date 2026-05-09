'use server'
import { cookies } from "next/headers"

export async function fetchStaff(activeOrgId: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return {
            success: false,
            message: "Authentication required. Please log in again"
        }
    }

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/user/staff`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "x-org-id": `${activeOrgId}`
            },
            credentials: 'include'
        });

        const data = await res.json();

        console.log(res, data);

        if (!res.ok) {
            return data;
        }

        return data;
    } catch (err) {
        console.error("Server Error: ", err);
        return {
            success: false,
            message: "Network error occurred on server."
        };
    }
}