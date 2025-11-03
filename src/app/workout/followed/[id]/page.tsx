"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";

export default function FollowedWorkoutDetail() {
  const router = useRouter();
  const { id } = useParams(); // workout_routine id
  const [routine, setRoutine] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<number | null>(null);

  useEffect(() => {
    async function checkSesh() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }
      getUserProfile(userData.user.id);
    }
    checkSesh();
  }, [router]);

  async function getUserProfile(userId: string) {
    const { data: profile } = await supabase
      .from("Profile")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (profile) {
      setProfileId(profile.id);
      setUserId(userId);
    }
  }

  useEffect(() => {
    if (id && userId) fetchRoutine();
  }, [id, userId]);

  async function fetchRoutine() {
    setLoading(true);

    // Get the routine info
    const { data: routineData } = await supabase
      .from("WorkoutRoutine")
      .select("*")
      .eq("id", id)
      .single();

    // Get base exercises
    const { data: exerciseData } = await supabase
      .from("Exercises")
      .select("*")
      .eq("routine_id", id);

    // Get any custom values user may have saved before
    const { data: followedData } = await supabase
      .from("FollowedExercises")
      .select("*")
      .eq("follower_id", userId);

    // Merge user’s custom values if they exist
    const merged = (exerciseData || []).map((ex) => {
      const custom = followedData?.find((f) => f.exercise_id === ex.id);
      return {
        ...ex,
        custom_sets: custom?.custom_sets ?? ex.sets,
        custom_reps: custom?.custom_reps ?? ex.reps,
        custom_weight: custom?.custom_weight ?? ex.weight,
      };
    });

    setRoutine(routineData);
    setExercises(merged);
    setLoading(false);
  }

  async function handleCustomUpdate(exerciseId: number, field: string, value: any) {
    if (!userId) return;

    const updateFieldMap: any = {
      sets: "custom_sets",
      reps: "custom_reps",
      weight: "custom_weight",
    };

    const fieldName = updateFieldMap[field];

    await supabase.from("FollowedExercises").upsert({
      follower_id: userId,
      exercise_id: exerciseId,
      [fieldName]: value,
    });

    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId ? { ...ex, [fieldName]: value } : ex
      )
    );
  }

  // 🟣 NEW: Unfollow Routine
  async function handleUnfollow() {
    if (!profileId) return;

    const { error } = await supabase
      .from("routine_followers")
      .delete()
      .eq("routine_id", id)
      .eq("follower_id", profileId);

    if (error) {
      console.error("Unfollow failed:", error);
      return;
    }

    // Redirect immediately to workout page after unfollow
    router.push("/workout");
  }

  return (
    <main className="min-h-screen bg-gray-900 text-gray-300">
      <Header />
      <section className="max-w-3xl mx-auto mt-10 bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-900">
            {routine?.name || "Workout Routine"}
          </h1>
          {/*  Unfollow Button */}
          <button
            onClick={handleUnfollow}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm"
          >
            Unfollow
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <p className="text-gray-400 mb-6">{routine?.description}</p>

            {/* Exercises List */}
            <div className="space-y-4 mb-10">
              {exercises.length > 0 ? (
                exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex justify-between items-center border border-emerald-50 rounded-lg p-4"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-purple-900">
                        {exercise.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {exercise.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={exercise.custom_sets || ""}
                        onChange={(e) =>
                          handleCustomUpdate(
                            exercise.id,
                            "sets",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-16 p-1 rounded bg-gray-700 text-gray-100 text-center border border-gray-600"
                        placeholder="Sets"
                      />
                      <input
                        type="number"
                        value={exercise.custom_reps || ""}
                        onChange={(e) =>
                          handleCustomUpdate(
                            exercise.id,
                            "reps",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-16 p-1 rounded bg-gray-700 text-gray-100 text-center border border-gray-600"
                        placeholder="Reps"
                      />
                      <input
                        type="number"
                        value={exercise.custom_weight || ""}
                        onChange={(e) =>
                          handleCustomUpdate(
                            exercise.id,
                            "weight",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-20 p-1 rounded bg-gray-700 text-gray-100 text-center border border-gray-600"
                        placeholder="Weight"
                      />
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
  );
}
