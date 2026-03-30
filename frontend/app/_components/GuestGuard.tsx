'use client';

import { useEffect } from "react";
import { useAuth } from "../_context/AuthContext";
import { useRouter } from "next/navigation";

export default function GuestGuard({ children }: {children: React.ReactNode}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.replace('/dashboard');
        }
    },[user, loading, router]);

    if (loading || user ) return <p className="flex justify-center items-center h-200 text-2xl">Already logged in | Redirecting to dashboard...</p>

    return <>{children}</>;
}