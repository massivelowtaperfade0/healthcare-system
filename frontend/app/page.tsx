'use client';
import { useRouter } from "next/navigation";
import { useAuth } from "./_context/AuthContext";

const Home = () => {

  const router = useRouter();
  const { user, loading } = useAuth();

  return (
    <main>
      <div className="bg-[url('/bg.jpg')] bg-cover bg-center h-200">
        <div className="flex flex-col justify-center items-center min-h-screen bg-black/40 text-white text-center px-6">
          
          <h1 className="text-5xl font-semibold max-w-3xl leading-tight">
            Secure Medical records for Modern Care Teams
          </h1>

          <p className="mt-6 text-lg max-w-2xl text-gray-200">
            A privacy-first platform engineered with role-based access control,
            tenant isolation, and complete audit transparency.
          </p>

          <div className="mt-8 flex gap-4">
            {loading ? null : user ? (
              <button 
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 px-6 py-3 rounded-md text-white hover:bg-blue-700 transition">
                Dashboard
              </button>
            ) : (
              <button 
              onClick={() => router.push('/setup')}
              className="bg-blue-600 px-6 py-3 rounded-md text-white hover:bg-blue-700 transition">
                Get Started
              </button>
            )}
            

            <button
              onClick={() => router.push('/docs')}
              className="border border-white px-6 py-3 rounded-md hover:bg-white hover:text-black transition"
            >
              View Documentation
            </button>
          </div>

        </div>
      </div>
    </main>
  );
};

export default Home;