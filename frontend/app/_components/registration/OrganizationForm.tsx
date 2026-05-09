'use client';
import { useFormContext } from "@/app/_context/FormContext"
import { useRouter } from "next/navigation";
import { useState } from "react";

const OrganizationForm = ({ onNext }: { onNext: () => void }) => {

    const { formData, updateData } = useFormContext();
    const [error, setError] = useState("");
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        updateData({ [name]: value });
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.organization ||
            !formData.city ||
            !formData.state ||
            !formData.country
        ) {
            setError("Please fill in all details");
            return;
        }

        setError("");
        onNext();
    }

    return (
        <div className="w-full max-w-md p-8 rounded-2xl shadow-xl space-y-6 border"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <form
                className="w-full max-w-md rounded-2xl space-y-6"
                style={{ backgroundColor: "var(--card)", color: "var(--foreground)", borderColor: "var(--border)" }}
            >
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>Organization</h1>
                    <p className="mt-1 text-gray-500">
                        Register your organization to get access to our secure medical records management system
                    </p>
                </div>

                {/* Organization */}
                <input
                    name="organization"
                    type="text"
                    placeholder="Organization Name"
                    value={formData.organization || ""}
                    onChange={handleChange}
                    className="w-full p-3 mb-5 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 active:scale-105"
                    style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
                />

                {/* Email */}
                <input
                    name="city"
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-3 mb-5 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 active:scale-105"
                    style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
                />

                {/* Password */}
                <input
                    name="state"
                    type="type"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full p-3 mb-5 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 active:scale-105"
                    style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
                />

                <input
                    name="country"
                    type="type"
                    placeholder="Country"
                    value={formData.country}
                    onChange={(handleChange)}
                    className="w-full p-3 mb-8 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 active:scale-105"
                    style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
                />

                {/* Error */}
                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                {/* Sign Up Button */}
                <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3 rounded-lg font-semibold transition bg-blue-600 text-white"
                >
                    Continue to Admin Setup
                </button>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-2">
                    Already have an account?{" "}
                    <span
                        className="text-blue-600 cursor-pointer"
                        onClick={() => router.push("/login")}
                    >
                        Login
                    </span>
                </p>
            </form>
        </div>
    )
}

export default OrganizationForm