"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Header from "../components/Header";

export default function ExplorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [profileId, setProfileId] = useState<number | null>(null);

  


//  Check user session and fetch workouts
  useEffect(() => {
    async function fetchWorkouts() {
      setLoading(true);

      // Check user session
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }

      // Get profile ID
      const { data: profileData } = await supabase
        .from("Profile")
        .select("id")
        .eq("user_id", userData.user.id)
        .single();

      if (!profileData) return;
      setProfileId(profileData.id);

      // Select routines already followed by this user
      const { data: followed } = await supabase
        .from("routine_followers")
        .select("routine_id")
        .eq("follower_id", profileData.id);

      const followedIds = followed?.map((f) => f.routine_id) || [];

      // Select workout routines using view excluding those created by the user and those already followed
      const { data, error } = await supabase
        .from("workout_routines_with_followers")
        .select(
          "id, name, description, profile_id, first_name, follower_count, date_updated"
        )
        .neq("profile_id", profileData.id)
        .not("id", "in", `(${followedIds.join(",") || 0})`)
        .order("follower_count", { ascending: false })
        .order("date_updated", { ascending: false });

      if (error) console.error(error);
      else {
        // mark which routines are already followed
        const updated = data.map((routine) => ({
          ...routine,
          isFollowed: false,
        }));
        setWorkouts(updated);
      }

      setLoading(false);
    }

    fetchWorkouts();
  }, [router]);

  // Handle follow action
  async function handleFollow(routineId: number) {
    if (!profileId) return;

    const routineIndex = workouts.findIndex((r) => r.id === routineId);
    if (routineIndex === -1) return;
    // Insert into routine_followers
    const { error } = await supabase.from("routine_followers").insert([
      {
        follower_id: profileId,
        routine_id: routineId,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Something went wrong following this routine.");
      return;
    }

    // Instantly update UI (increment follower count and disable button)
    const updated = [...workouts];
    updated[routineIndex].follower_count += 1;
    updated[routineIndex].isFollowed = true;
    setWorkouts(updated);
  }

  return (
    <main className="min-h-screen bg-gray-900 text-gray-300">
      <Header />
      <section className="max-w-3xl mx-auto mt-10 bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-900">Explore</h1>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4 mb-10">
            {workouts.length > 0 ? (
              workouts.map((routine) => (
                <div
                  key={routine.id}
                  className="flex justify-between items-center border border-emerald-50 rounded-lg p-4 hover:bg-emerald-50 transition cursor-pointer"
                  onClick={() =>
                    router.push(`explore/${routine.id}`)
                  }
                >
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900">
                      {routine.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {routine.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created by: {routine.first_name || "Unknown"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent redirect
                        handleFollow(routine.id);
                      }}
                      disabled={routine.isFollowed}
                      className={`px-4 py-2 rounded transition ${
                        routine.isFollowed
                          ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                          : "bg-[#7F5977] text-white hover:bg-[#EED0BB] hover:text-gray-800"
                      }`}
                    >
                      {routine.isFollowed ? "Followed" : "Follow"}
                    </button>
                    <span className="text-xs text-gray-500">
                      {routine.follower_count} follower
                      {routine.follower_count === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No workout routines available.</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
