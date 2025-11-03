"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Header from "../components/Header";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

    // Editable fields
  const [newPassword, setNewPassword] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Fetch user and profile

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) {
              router.push("/login");
              return;
            }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(userError);
        setLoading(false);
        return;
      }

      setUser(user);

      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from("Profile")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        console.error(profileError);
      } else {
        setProfile(profileData);
        setWeight(profileData.weight || "");
        setHeight(profileData.height || "");
        setGoal(profileData.goal || "");
      }

      setLoading(false);
    }

    fetchProfile();
  }, []);

  // Update profile
  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage(null);

    if (!user) return;

    const { error } = await supabase
      .from("Profile")
      .update({
        weight: parseFloat(weight),
        height: parseFloat(height),
        goal,
      })
      .eq("user_id", user.id);

    if (error) setStatusMessage("❌ Failed to update profile");
    else setStatusMessage("✅ Profile updated successfully!");
  }

  // Change password
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) setStatusMessage("❌ Failed to change password");
    else {
      setStatusMessage("✅ Password updated successfully!");
      setNewPassword("");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">
        <p>Loading your profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-gray-300">
      <Header />

      <section className="max-w-3xl mx-auto mt-10 bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-3xl font-bold text-purple-900 mb-6">Profile</h2>

        {profile ? (
          <>
            {/* Basic Info */}
            <div className="mb-6">
              <p>
                <span className="font-semibold text-[#EED0BB]">Name:</span>{" "}
                {profile.first_name} {profile.last_name}
              </p>
              <p>
                <span className="font-semibold text-[#EED0BB]">Email:</span>{" "}
                {user.email}
              </p>
            </div>

            {/* Editable fields */}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#EED0BB] mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-100 focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#EED0BB] mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-100 focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#EED0BB] mb-1">
                  Goal
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-100 focus:border-purple-400 focus:outline-none"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintain">Maintain</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#7F5977] hover:bg-[#EED0BB] hover:text-gray-800 rounded font-semibold transition"
              >
                Save Changes
              </button>
            </form>

            {/* Password Change */}
            <form
              onSubmit={handleChangePassword}
              className="mt-8 border-t border-gray-700 pt-6 space-y-3"
            >
              <h3 className="text-lg font-semibold text-purple-900">
                Change Password
              </h3>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-100 focus:border-purple-400 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="w-full py-2 bg-[#7F5977] hover:bg-[#EED0BB] hover:text-gray-800 rounded font-semibold transition"
              >
                Update Password
              </button>
            </form>

            {statusMessage && (
              <p className="mt-4 text-center text-sm">{statusMessage}</p>
            )}
          </>
        ) : (
          <p>No profile data found.</p>
        )}
      </section>
    </main>
  );
}
