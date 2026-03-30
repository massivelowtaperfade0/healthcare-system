'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "@/app/_context/FormContext";
import OrganizationForm from "@/app/_components/registration/OrganizationForm";
import AdminForm from "@/app/_components/registration/AdminForm";

export default function SignUp() {
  const router = useRouter();
  
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { formData } = useFormContext();

  const handleFinalSubmit = async () =>  {
    setError("");
    setLoading(true);
    setIsSubmitting(true);

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      organization: formData.organization,
      city: formData.city,
      state: formData.state,
      country: formData.country
    }

    try {
      const response = await fetch('http://localhost:5000/register/org', {
        method: 'POST',
        headers: { 'Content-Type': "application/json"},
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Something went wrong")
        return
      }

      router.push('/dashboard');
    } catch {
      setError("Network error, is backend running");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="h-200 flex flex-col items-center justify-center">
      <div className="mb-8 flex space-x-4">
        <div className={`h-2 w-16 rounded ${step >= 1 ? 'bg-blue-600': 'bg-gray-300'}`} />
        <div className={`h-2 w-16 rounded ${step >= 2 ? 'bg-blue-600': 'bg-gray-300'}`} />
      </div>

      {step === 1 && (
        <OrganizationForm onNext={() => setStep(2)} />
      )}

      {step === 2 && (
        <AdminForm 
          onBack={() => setStep(1)}
          onSubmit={handleFinalSubmit}
          loading={isSubmitting}
        />
      )}
    </main>
    // <div
    //   className="flex items-center justify-center min-h-screen px-4"
    //   style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    // >
    //   <form
    //     className="w-full max-w-md p-8 rounded-2xl shadow-xl space-y-6"
    //     style={{ backgroundColor: "var(--card)", color: "var(--foreground)", borderColor: "var(--border)" }}
    //   >
    //     {/* Header */}
    //     <div className="text-center">
    //       <h1 className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>Register Organization</h1>
    //       <p className="mt-2 text-gray-500">
    //         Register your organization to get access to our secure medical records management system
    //       </p>
    //     </div>

    //     {/* Organization */}
    //     <input
    //       type="text"
    //       placeholder="Organization"
    //       value={organization}
    //       onChange={(e) => setOrganization(e.target.value)}
    //       className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition"
    //       style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
    //     />

    //     {/* Email */}
    //     <input
    //       type="text"
    //       placeholder="City"
    //       value={city}
    //       onChange={(e) => setCity(e.target.value)}
    //       className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition"
    //       style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
    //     />

    //     {/* Password */}
    //     <input
    //       type="type"
    //       placeholder="State"
    //       value={state}
    //       onChange={(e) => setState(e.target.value)}
    //       className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition"
    //       style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
    //     />

    //     <input
    //       type="type"
    //       placeholder="Country"
    //       value={country}
    //       onChange={(e) => setCountry(e.target.value)}
    //       className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition"
    //       style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
    //     />

    //     {/* Error */}
    //     {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

    //     {/* Sign Up Button */}
    //     <button
    //       onClick={() => }
    //       disabled={loading}
    //       className="w-full py-3 rounded-lg font-semibold transition bg-blue-600 text-white"
    //     >
    //       {loading ? "Creating Account..." : "Sign Up"}
    //     </button>

    //     {/* Footer */}
    //     <p className="text-center text-gray-500 text-sm mt-2">
    //       Already have an account?{" "}
    //       <span
    //         className="text-blue-600 cursor-pointer"
    //         onClick={() => router.push("/login")}
    //       >
    //         Login
    //       </span>
    //     </p>
    //   </form>
    // </div>
  );
}