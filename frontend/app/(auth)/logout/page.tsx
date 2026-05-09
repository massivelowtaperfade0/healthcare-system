'use client';

import { useAuth } from "@/app/_context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";


const Logout = () => {
  const { user, setUser } = useAuth();
  const [verification, setVerification] = useState("");
  const [signOutAll, setSignOutAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFinalLogout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (verification.toLowerCase() !== "logout") return;

    setLoading(true);
    try {
      if (!signOutAll) {
        await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/auth/logout`, {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/auth/logoutAll`, {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })
      }
    } catch (err) {
      console.error("Operaion Failed", err)
    } finally {
      setUser(null);
      router.replace("/login");
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center h-200 bg-gray-50 p-4"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl shadow-sm"
        style={{ backgroundColor: "var(--card)", color: "var(--foreground) border-clor: var(--border)" }}
      >
        <h1 className="text-2xl font-bold mb-2">Confirm Logout</h1>
        <p
          className="mb-6 text-sm"
          style={{ color: "var(--foreground)" }}
        >
          To prevent accidental logout, please type <span
            className="font-mono font-bold text-blue-400"
          >logout</span> below.
        </p>

        <form onSubmit={handleFinalLogout} className="space-y-4">
          <input
            type="text"
            placeholder="Type 'logout' to confirm"
            value={verification}
            onChange={(e) => setVerification(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2  outline-none transition-all"
            style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
          />

          <label
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
            style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
          >
            <input
              type="checkbox"
              checked={signOutAll}
              onChange={(e) => setSignOutAll(e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium">Sign out from all devices</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 p-3 text-sm font-semibold rounded-xl border hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={verification.toLowerCase() !== "logout" || loading}
              className="flex-1 p-3 text-sm font-semibold text-white bg-red-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-all duration-200 hover:scale-103"
            >
              {loading ? "Processing..." : "Confirm Logout"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Logout