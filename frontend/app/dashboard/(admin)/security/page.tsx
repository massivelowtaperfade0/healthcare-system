'use client'

import { useAuth } from "@/app/_context/AuthContext"
import { notFound } from "next/navigation";


const Activity = () => {

    const {user, loading} = useAuth();

    if (loading) {
        return <p>Loading</p>
    }

    if (user?.activeOrg?.role !== 'ADMIN') {
        notFound();
    }

    return(
        <>
        <div>Only admin can view activity page</div>
        </>
    )
}

export default Activity