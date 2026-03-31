'use client'
import { useAuth } from "@/app/_context/AuthContext"
import { notFound } from "next/navigation";
import { fetchAllActiveStaff } from "./getStaff";
import { useEffect, useState } from "react";

interface StaffMember {
    id: string,
    userId: string,
    user: {
        firstName: string,
        lastName: string,
    },
    role: string,
    status: string,
    statusChagnedById: string | null,
    statusChangeReason: string | null,
}

const ManageStaff = () => {
    const { user, loading } = useAuth();
    const [fetching, setFetching] = useState(true);
    const [staff, setStaff] = useState<StaffMember[]>([]);

    useEffect(() => {
        const loadStaff = async () => {
            try {
                const activeOrgId = user?.activeOrg?.id || '';
                const data = await fetchAllActiveStaff(activeOrgId);

                if (Array.isArray(data)) {
                    setStaff(data);
                }
            } catch (err) {
                console.error("Failed to fetch staff: ", err);
            } finally {
                setFetching(false);
            }
        }

        if (user?.activeOrg?.role === 'ADMIN') {
            loadStaff();
        }
    }, [user]);

    if (loading || fetching) {
        return <div>Loading</div>
    }

    const userRole = user?.activeOrg?.role

    if (!userRole || userRole !== 'ADMIN') {
        notFound();
    }

    console.log(staff);

    return(
        <>
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Manage Staff</h1>

            {staff.length === 0 ? (
                <p>No staff added yet</p>
            ): (
                <div 
                className="grid gap-4"
                // style={{ backgroundColor: "var(--secondary)", color: "var(--foreground)" }}
                >
                    {staff.map(({id, role, status, user}) => (
                        <div key={id} className="p-4 rounded-lg shadow-sm w-120"
                        style={{ backgroundColor: "var(--secondary)", color: "var(--foreground)" }}
                        >
                            <p><strong>Name: </strong> {user.firstName + " " + user.lastName}</p>
                            <p><strong>Role: </strong> {role} </p>
                            <p><strong>Status: </strong><span className="text-green-600">{status}</span></p>
                            <p><strong>Staff ID: </strong> {id} </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
        </>
    )
    
}

export default ManageStaff