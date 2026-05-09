'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/auth/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "SignUp Failed");
        return;
      }

      router.push("/login");
    } catch {
      setError("Network error, is backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <form
        className="w-full max-w-md p-8 rounded-2xl shadow-xl space-y-6"
        style={{ backgroundColor: "var(--card)", color: "var(--foreground)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>Sign Up</h1>
          <p className="mt-2 text-gray-500">
            Fill the following details to create a new account
          </p>
        </div>

        {/* First + Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition"
            style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition"
            style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
          />
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition"
          style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition"
          style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
        />

        {/* Error */}
        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

        {/* Sign Up Button */}
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold transition bg-blue-600 text-white"
        >
          {loading ? "Creating Account..." : "Sign Up"}
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
  );
}