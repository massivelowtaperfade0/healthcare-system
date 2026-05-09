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
  const [loading, setLoading] = useState(false);
  const { formData } = useFormContext();

  const handleFinalSubmit = async () => {
    console.log(`Submit reached`)
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
      console.log(`Starting fetch to ${process.env.NEXT_PUBLIC_API_GATEWAY}/register/org`);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/register/org`, {
        method: 'POST',
        headers: { 'Content-Type': "application/json" },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      console.log(`response status: ${response.status}`);

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || "Something went wrong")
        setIsSubmitting(false);
        setLoading(false);
        return;
      }

      console.log(`Success...! Attempting redirect...`)

      setInterval(() => {
        router.push('/login');
      }, 1000);
      console.log(`router push called`);
    } catch (err){
      setError("Network error, is backend running");
      console.log(err);
      setIsSubmitting(false);
      setLoading(false);
    }
  }

  return (
    <main className="h-200 flex flex-col items-center justify-center">
      <div className="mb-8 flex space-x-4">
        <div className={`h-2 w-16 rounded ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
        <div className={`h-2 w-16 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
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
  );
}