'use client';
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {  CircleUserRound, Moon, Sun } from "lucide-react";
// import { fetchWithAuth } from '../../_lib/fetch_client'
import { useAuth } from "@/app/_context/AuthContext";

const Navbar = () => {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // const [user, setUser] = useState<User | null>(null);
  // const [loading, setLoading] = useState(true);
  const links = [
    { name: "Home", href: "/"},
    { name: "About", href: "/about"},
    { name: "Docs", href: "/docs"},
    { name: "Contact", href: "/contact"},
  ];

  const { user, loading} = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <nav>Loading...</nav>
  };

  const currentTheme = resolvedTheme;

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md transition-colors duration-300"
      style={{
        backgroundColor: "var(--navbar)",
        borderColor: "var(--border)",
        color: "var(--foreground)",
      }}
    >
      <div
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
      >
        {/* Logo */}
        <div
          style={{ color: "var(--foreground)" }}
          className="text-2xl font-semibold tracking-tight cursor-pointer"
        >
          Logo
        </div>

        {/* Links */}
        <ul className="flex items-center gap-8 font-medium">
          {links.map((link) => (
            <li
              key={link.name}
              style={{ color: "var(--foreground)" }}
              className="cursor-pointer transition-all duration-200 transform hover:text-xl"
            >
              <Link href={link.href}>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={() =>
              setTheme(currentTheme === "dark" ? "light" : "dark")
            }
            // style={{
            //   backgroundColor: "var(--card)",
            //   color: "var(--foreground)",
            //   borderColor: "var(--border)",
            // }}
            className="rounded-md px-3 py-1 text-sm transition-all duration-300 hover:scale-110"
          >
            {currentTheme === "dark" ? <Sun/> : <Moon/>}
          </button>

          {/* CTA Button */}
          {loading ? null : user ? (
            <button
              className="transition-all duration-300 hover:scale-120 cursor-pointer"
            >
              <CircleUserRound />
            </button>
          ) : (
            <button
            onClick={() => router.push('/login')}
              style={{
                backgroundColor: "var(--card)",
                color: "var(--foreground)",
                borderColor: "var(--border)",
              }}
              className="rounded-lg px-5 py-2 text-sm font-medium shadow-sm transition-all duration-300 hover: scale-105 cursor-pointer"
            >
              Log In
          </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;