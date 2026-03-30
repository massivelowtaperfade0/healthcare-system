'use client';
import { useFormContext } from "@/app/_context/FormContext";
import { useState } from "react";

interface AdminFormProps {
    onBack: () => void;
    onSubmit: () => Promise<void>;
    loading: boolean;
}

const AdminForm = ({ onBack, onSubmit, loading }: AdminFormProps) => {
    const { formData, updateData } = useFormContext();
    const [localError, setLocalError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateData({ [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError("");

        // 1. Final Validation
        if (!formData.firstName || !formData.lastName || !formData.password) {
            setLocalError("All fields are required.");
            return;
        }

        if (formData.password.length < 8) {
            setLocalError("For medical systems, passwords must be at least 12 characters.");
            return;
        }

        // 2. Trigger the Parent's API call
        try {
            await onSubmit();
        } catch (err) {
            setLocalError("Failed to create account. Email might already be in use.");
        }
    };

    return (
        <div className="w-full max-w-md p-8 rounded-2xl shadow-xl space-y-6 border"
             style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            
            <div className="text-center">
                <h1 className="text-3xl font-bold">Admin Account</h1>
                <p className="mt-2 text-gray-500">Step 2: Create the primary administrator</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName || ""}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border focus:ring-2 outline-none transition-all duration-200 active:scale-105"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                />

                <input
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName || ""}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border focus:ring-2 outline-none transition-all duration-200 active:scale-105"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                />
                
                <input
                    name="email"
                    type="email"
                    placeholder="Admin Email (Work)"
                    value={formData.email || ""}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border focus:ring-2 outline-none transition-all duration-200 active:scale-105"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Secure Password"
                    value={formData.password || ""}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border focus:ring-2 outline-none transition-all duration-200 active:scale-105"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                />

                {localError && <p className="text-red-500 text-sm">{localError}</p>}

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="w-1/3 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition"
                        style={{ backgroundColor: "var(--background)" }}
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-2/3 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        {loading ? "Creating System..." : "Complete Setup"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminForm;