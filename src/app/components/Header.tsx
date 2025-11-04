"use client";

import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  // Logout function
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Get userdata for mealplan navigation
  async function handleMealPlanClick() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push("/login");
      return;
    }

    // Get profile
    const { data: profileData, error: profileError } = await supabase
      .from("Profile")
      .select("id")
      .eq("user_id", userData.user.id)
      .single();

    if (profileError || !profileData) {
      console.error(profileError);
      alert("Profile not found");
      return;
    }

    // Get user's mealplan
    const { data: mealplanData, error: mealplanError } = await supabase
      .from("mealplan")
      .select("id")
      .eq("profile_id", profileData.id)
      .single();

    if (mealplanError || !mealplanData) {
      console.error(mealplanError);
      alert("No meal plan found for your profile");
      return;
    }

    // Navigate to mealplan page
    router.push(`/mealplan/${mealplanData.id}`);
  }
  // Header components
  const navItems = [
    { name: "Profile", path: "/dashboard" },
    { name: "Workout Routine", path: "/workout" },
    { name: "Meal Plan", action: handleMealPlanClick }, // changed from path to action
    { name: "Explore", path: "/explore" },
  ];

  return (
    <header className="flex items-center justify-between bg-gray-800 text-[#EED0BB] px-10 py-4 shadow-md">
      <h1
        className="text-2xl font-bold text-purple-900 cursor-pointer"
        onClick={() => router.push("/dashboard")}
      >
        UNBOUND
      </h1>
      { /* Menu items */ }
      <nav className="flex space-x-8">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={item.action ? item.action : () => router.push(item.path)}
            className={`hover:text-purple-400 transition ${
              pathname === item.path ? "text-purple-400 font-semibold" : ""
            }`}
          >
            {item.name}
          </button>
        ))}
      </nav>
      { /* Logout Button */ }
      <button
        onClick={handleLogout}
        className="bg-[#7F5977] text-[#EED0BB] px-4 py-2 rounded hover:bg-[#EED0BB] hover:text-gray-800 transition"
      >
        Log out
      </button>
    </header>
  );
}
