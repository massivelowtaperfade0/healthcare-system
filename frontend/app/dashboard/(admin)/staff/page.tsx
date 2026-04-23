'use client'
import { useAuth } from "@/app/_context/AuthContext"
import { notFound } from "next/navigation";
import { fetchStaff } from "./getStaff";
import { useEffect, useState } from "react";
import { Plus, X, ListFilter } from 'lucide-react'

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
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ACTIVE");
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

    useEffect(() => {
        const loadStaff = async () => {
            try {
                const activeOrgId = user?.activeOrg?.id || '';
                const data = await fetchStaff(activeOrgId);

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
        return <div>Loading...</div>
    }

    const userRole = user?.activeOrg?.role

    if (!userRole || userRole !== 'ADMIN') {
        notFound();
    }

    // Dynamic search filtering
    const filteredStaff = staff.filter((member) => {
        const fullName = `${member.user.firstName} ${member.user.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || member.role.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleOpenModal = (member: StaffMember | null) => {
        setSelectedStaff(member); // null means "Create Mode", populated means "Update Mode"
        setIsModalOpen(true);
    };

    return (
        <div className="relative min-200 p-5">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold ml-5">Active Staff</h1>
                
                <div className="flex items-center gap-5 mr-5">
                    <input 
                        type="text" 
                        placeholder="Search by name or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="rounded-lg p-2 border focus:outline-blue-500 w-64"
                        style={{ backgroundColor: "var(--navbar)", color: "var(--foreground)" }}
                    />
                    <div className="flex gap-4">
                        <Plus 
                            onClick={() => handleOpenModal(null)} // Triggers fresh "Add" modal
                            className="p-1 rounded-full bg-blue-500 text-white transition-all duration-300 cursor-pointer hover:bg-blue-600 transition-colors w-9 h-9"
                        />
                        <ListFilter 
                            className="p-1 rounded-full cursor-pointer hover:bg-blue-500 w-9 h-9 transition-all duration-300"
                        />
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            {filteredStaff.length === 0 ? (
                <p className="ml-5 text-gray-500">No staff found</p>
            ) : (
                <div className="flex gap-4 flex-wrap p-5">
                    {filteredStaff.map((member) => (
                        <div 
                            key={member.id} 
                            onClick={() => handleOpenModal(member)} // Triggers "Update" modal with data
                            className="p-5 rounded-lg shadow-sm w-115 transition-all cursor-pointer border hover:scale-102 hover:shadow-lg"
                            style={{ backgroundColor: "var(--secondary)", color: "var(--foreground)" }}
                        >
                            <p><strong>Name: </strong> {member.user.firstName + " " + member.user.lastName}</p>
                            <p><strong>Role: </strong> {member.role} </p>
                            <p><strong>Status: </strong><span className="text-green-600">{member.status}</span></p>
                            <p className="text-sm text-gray-700 mt-2"><strong>Staff ID: </strong> {member.id} </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Dynamic Modal For Add/Update */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white text-black p-6 rounded-xl shadow-xl w-full max-w-md relative">
                        {/* Close Button */}
                        <X 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-black"
                        />
                        
                        <h2 className="text-xl font-bold mb-4">
                            {selectedStaff ? 'Update Staff Member' : 'Add Staff Member'}
                        </h2>

                        <form className="flex flex-col gap-3">
                            <label className="text-sm font-medium">First Name</label>
                            <input 
                                type="text" 
                                className="border p-2 rounded-lg" 
                                defaultValue={selectedStaff?.user.firstName || ''}
                            />

                            <label className="text-sm font-medium">Last Name</label>
                            <input 
                                type="text" 
                                className="border p-2 rounded-lg" 
                                defaultValue={selectedStaff?.user.lastName || ''}
                            />

                            <label className="text-sm font-medium">Role</label>
                            <select 
                                className="border p-2 rounded-lg" 
                                defaultValue={selectedStaff?.role || 'NURSE'}
                            >
                                <option value="DOCTOR">Doctor</option>
                                <option value="NURSE">Nurse</option>
                            </select>

                            <button type="submit" className="mt-4 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                                {selectedStaff ? 'Save Changes' : 'Invite Staff'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ManageStaff;