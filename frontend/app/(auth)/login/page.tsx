'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/_context/AuthContext";
import GuestGuard from "@/app/_components/GuestGuard";

interface Organization {
  id: string;
  name: string;
  role: string;
}

export default function Login() {
  const router = useRouter();
  const { refetchUser } = useAuth();

  // Phase State
  const [phase, setPhase] = useState<1 | 2>(1); 
  const [availableOrgs, setAvailableOrgs] = useState<Organization[]>([]);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // UI State
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * PHASE 1: Verify Identity
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login Failed");
        return;
      }

      // Backend now returns the list of memberships in the login response
      const memberships = data.user?.organizations || [];

      if (memberships.length === 0) {
        setError("Account verified, but no active medical facility memberships found.");
      } else if (memberships.length === 1) {
        // Simple UX: If only one org, don't ask, just proceed
        await completeLogin(memberships[0].id);
      } else {
        // Multi-tenant UX: Move to selection phase
        setAvailableOrgs(memberships);
        setPhase(2);
      }
    } catch (err) {
      setError("Network error, is backend running?");
    } finally {
      setLoading(false);
    }
  };

  /**
   * PHASE 2: Establish Context
   */
  const completeLogin = async (orgId: string) => {
    setLoading(true);
    try {
      // 1. Store the context globally for headers
      localStorage.setItem("activeOrgId", orgId);
      
      // 2. Refetch user so the AuthContext/Guard gets the role for THIS specific org
      await refetchUser(); 
      
      // 3. Final redirect
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to establish organization context.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestGuard>
      <div
        className="flex items-center justify-center min-h-screen px-4"
        style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
      >
        <div
          className="w-full max-w-md p-8 rounded-2xl shadow-xl space-y-6 border"
          style={{ backgroundColor: "var(--card)", color: "var(--foreground)", borderColor: "var(--border)" }}
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold">
              {phase === 1 ? "Log In" : "Select Organization"}
            </h1>
            <p className="mt-2 text-gray-500">
              {phase === 1 
                ? "Your privacy is our responsibility" 
                : "Choose the facility you want to access"}
            </p>
          </div>

          {/* PHASE 1: Credentials Form */}
          {phase === 1 && (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition"
                style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition"
                style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
              />
              
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white transition active:scale-95 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Continue"}
              </button>
            </form>
          )}

          {/* PHASE 2: Organization Selection List */}
          {phase === 2 && (
            <div className="space-y-3">
              {availableOrgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => completeLogin(org.id)}
                  className="w-full p-4 text-left rounded-xl border-2 border-transparent hover:border-blue-500 bg-opacity-10 transition-all flex justify-between items-center group"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                >
                  <div>
                    <p className="font-bold text-lg group-hover:text-blue-500 transition">{org.name}</p>
                    <p className="text-xs uppercase tracking-widest text-gray-500">{org.role}</p>
                  </div>
                  <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition">
                    →
                  </div>
                </button>
              ))}
              
              <button 
                onClick={() => setPhase(1)}
                className="w-full text-center text-sm text-gray-500 hover:underline pt-4"
              >
                Back to credentials
              </button>
            </div>
          )}

          {/* Footer */}
          {phase === 1 && (
            <p className="text-center text-gray-500 text-sm mt-2">
              Haven't registered yet?{" "}
              <span
                className="text-blue-600 cursor-pointer font-medium"
                onClick={() => router.push("/signup")}
              >
                Sign Up
              </span>
            </p>
          )}
        </div>
      </div>
    </GuestGuard>
  );
}