'use server'

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers";

export async function createClaimAction(
    payload: {
        patientId: string;
        organizationName: string,
    }
) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return {
            success: false,
            message: "Authentication required. Please log in again."
        }
    }
    try {
        const res = await fetch('http://localhost:5000/auth/create-claim', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload),
            credentials: 'include',
        });

        const data = await res.json();
        console.log(data);

        if (!res.ok) {
            return {
                success: false,
                message: data.message || "Failed to verify OTP."
            }
        }

        return { success: true }
    } catch (err) {
        console.error("Server Error: ", err);
        return {
            success: false,
            message: "Network error occurred on server."
        };
    }
}

export async function verifyClaimAction(
    payload: {
        patientId: string;
        claimCode: string;
        organizationName: string;
    }
) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return {
            success: false,
            message: "Authentication required. Please log in again."
        }
    }
    try {
        const res = await fetch('http://localhost:5000/auth/verify-claim', {
            method: "POST",
            headers: {
                 "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
             },
            body: JSON.stringify(payload),
            credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok) {
            return { 
                success: false, 
                message: data.message || "Failed to verify OTP"
            }
        }

        revalidatePath('/dashboard');

        return { success: true }
    } catch (err) {
        console.error("Server Error: ", err);
        return {
            success: false,
            message: "Network error occurred on server."
        };
    }
}