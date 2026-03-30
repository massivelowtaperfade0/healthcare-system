'use client';
import { useRouter } from "next/navigation"

const Page = () => {

    const router = useRouter();

    return (
        <div 
        className="h-200 flex flex-col items-center justify-center"
        style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
        >
            <h1 className="text-3xl font-bold mb-2">
                How would you like to get started?
            </h1>
            <p className="text-gray-500 mb-10">
                Create a new organization or join an existing one.
            </p>

            <div 
            className="grid md:grid-cols-2 gap-8 w-full max-w-4xl"
            style={{ backgroundColor: "var(--card)", color: "var(--foreground)", borderColor: "var(--border)" }}
            >
                <div className="border rounded-xl p-8 shadow transform transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-103 hover:shadow-xl hover:ring-2 hover:ring-blue-500">
                <h2 className="text-xl font-semibold mb-2">
                    Register a Medical Organization
                </h2>
                <p className="text-gray-600 mb-12">
                    Manage a clinic, hospital, or medical organization.   
                    A portal for admins, doctors, and nurses
                </p>
                <button 
                    onClick={() => router.push('/org')}
                    className="w-full py-3 rounded-lg font-semibold transition duration-200 ease-out bg-blue-500 hover:bg-blue-600 hover:scale-102 text-white cursor-pointer"
                >
                    Create Organization
                </button>
                </div>

                <div className="border rounded-xl p-8 shadow transform transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-103 hover:shadow-xl hover:ring-2 hover:ring-blue-500">
                <h2 className="text-xl font-semibold mb-2">
                    Create an Individual Account
                </h2>
                <p className="text-gray-600 mb-12">
                    Sign up as an individual user.
                    You can later connect with medical organizations.
                </p>
                <button 
                    className="w-full py-3 rounded-lg font-semibold transition duration-200 ease-out bg-blue-500 hover:bg-blue-600 hover:scale-102 text-white cursor-pointer"
                    onClick={() => router.push('/signup')}
                >
                    Sign Up
                </button>
                </div>

            </div>
        </div>
    )
}

export default Page