'use client'

import { useAuth } from "@/app/_context/AuthContext"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClaimAction, verifyClaimAction } from "./claimCode";

export default function ClaimForm() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [patientId, setPatientId] = useState("");
    const [organizationName, setOrganizationName] = useState("");
    const [outgoingOtp, setOutgoingOtp] = useState("");
    const [step, setStep] = useState(1);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    if (authLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading</div>
    }

    if (!user) {
        return null;
    }

    const generateOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        const result = await createClaimAction({
            patientId,
            organizationName,
        })
        console.log("Request created");

        setLoading(false);

        if (!result.success) {
            setErrorMsg( result.message || "");
            return;
        }

        setStep(2);
    };

    const validateOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        
        const result = await verifyClaimAction({
            patientId,
            claimCode: outgoingOtp,
            organizationName,
        });

        setLoading(false);

        if (!result.success) {
            setErrorMsg(result.message || "");
            return;
        }

        router.push('/dashboard');
    };

    return (
        <div
        className="flex items-center justify-center min-h-screen px-4"
        style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
        >
            <div
            className="w-full max-w-md p-8 rounded-2xl shadow-xl space-y-6 border"
            style={{ backgroundColor: "var(--card)", color: "var(--foreground)", borderColor: "var(--border)" }}
            >
                <div className="text-center">
                    <h1 className="text-3xl font-bold">
                    {step === 1 ? "Link Account" : "Verify OTP"}
                    </h1>
                    <p className="mt-2 text-gray-500">
                    {step === 1 
                        ? "Link your account and get access to your medical records" 
                        : "Enter valid OTP sent to your email"}
                    </p>
                </div>

                {errorMsg && 
                <p className="text-red-500 text-sm text-center font-medium">
                    {errorMsg}
                </p>}

                {step === 1 && (
                    <form onSubmit={generateOtp} className="space-y-4">
                        <input
                            type="text"
                            placeholder="'XXX-XXXX-XXXXX'"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition"
                            style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                        />
                        <input
                            type="text"
                            placeholder="'CITY HOSPITAL'"
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition"
                            style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 mt-5 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white transition active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Verifying..." : "Generate Claim Code"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={validateOtp} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="'e.g. 123456'"
                            value={outgoingOtp}
                            onChange={(e) => setOutgoingOtp(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition"
                            style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 mt-5 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white transition active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>
                )}

            </div>
        </div>
    )

}