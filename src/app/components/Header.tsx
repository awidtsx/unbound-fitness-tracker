"use client";

import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const navItems = [
    { name: "Profile", path: "/dashboard" },
    { name: "Workout Routine", path: "/workout" },
    { name: "Meal Plan", path: "/mealplan" },
    { name: "Explore", path: "/explore" },
  ];

  return (
    <header className="flex items-center justify-between bg-gray-800 text-[#EED0BB] px-10 py-4 shadow-md">
      {/* Brand Name */}
      <h1
        className="text-2xl font-bold text-purple-900 cursor-pointer"
        onClick={() => router.push("/dashboard")}
      >
        UNBOUND
      </h1>

      {/* Navigation */}
      <nav className="flex space-x-8">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => router.push(item.path)}
            className={`hover:text-purple-400 transition ${
              pathname === item.path ? "text-purple-400 font-semibold" : ""
            }`}
          >
            {item.name}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="bg-[#7F5977] text-[#EED0BB] px-4 py-2 rounded hover:bg-[#EED0BB] hover:text-gray-800 transition"
      >
        Log out
      </button>
    </header>
  );
}
