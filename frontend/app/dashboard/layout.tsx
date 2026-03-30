'use client';

import { useEffect } from "react";
import { useAuth } from "../_context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we are DEFINITELY not loading and DEFINITELY have no user
    if (!loading && user === null) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Stay on the loading screen until the AuthContext finishes its fetch
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Verifying Medical Credentials...</p>
      </div>
    );
  }

  // If loading is done but user is still null, the useEffect above will redirect.
  // We return null here to prevent the children from mounting prematurely.
  if (!user) {
    return null; 
  }

  // Only render children if user is an object
  return <>{children}</>;
}