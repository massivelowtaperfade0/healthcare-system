'use client';
import { useAuth } from "@/app/_context/AuthContext";
import { fetchWithAuth } from "@/app/_lib/fetch_client"
import { useRouter } from "next/navigation";
import { useState } from "react";

export const useLogout = () => {

    const { setUser } = useAuth();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {

        setIsLoggingOut(true);
        try {
            await fetch("http://localhost:5000/auth/logout", {
                method: "POST",
                credentials: 'include',                             
            });
        } catch (error) {
            console.log("Logout failed: ", error);
        } finally {
            setUser(null);
            router.replace("/");
        }
    }

    return { handleLogout, isLoggingOut };
}

