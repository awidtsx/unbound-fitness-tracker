"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Header from "../components/Header";

export default function ExplorePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true)
    const [workouts, setWorkouts] = useState<any[]>([])

    useEffect(() => {
    async function fetchWorkouts() {
    setLoading(true)
        const { data: userData } = await supabase.auth.getUser();
              if (!userData.user) {
                router.push("/login");
                return;
              }

    const { data: profileData } = await supabase
  .from("Profile")
  .select("id")
  .eq("user_id", userData.user.id)
  .single();

if (!profileData) return;
const profileId = profileData.id;

// Step 3 — Get all followed routine IDs
const { data: followed } = await supabase
  .from("routine_followers")
  .select("routine_id")
  .eq("follower_id", profileId);

const followedIds = followed?.map((f) => f.routine_id) || [];    

      const { data, error } = await supabase
        .from("WorkoutRoutine")
        .select("id, name, description")
        .neq("profile_id", profileId)
        .not("id", "in", `(${followedIds.join(",") || 0})`)
        .order("date_updated", { ascending: false })
      if (error) console.error(error)
      else setWorkouts(data || [])
    setLoading(false)
    }
    fetchWorkouts()

  }, [router])

return (
    <main className="min-h-screen bg-gray-900 text-gray-300">
      <Header />
      <section className="max-w-3xl mx-auto mt-10 bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-900">
            Explore
          </h1>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>

            {/* Exercises List */}
            <div className="space-y-4 mb-10">
              {workouts.length > 0 ? (
                workouts.map((workouts) => (
                  <div
                    key={workouts.id}
                    className="flex justify-between items-center border border-emerald-50 rounded-lg p-4"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-purple-900">
                        {workouts.name}
                      </h3>
                      <p className="text-sm text-gray-400">{workouts.description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No exercises found.</p>
              )}
            </div>
          </>
        )}
      </section>
      </main>
)

}