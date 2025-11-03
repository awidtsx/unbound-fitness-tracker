"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Header from "../components/Header";

export default function WorkoutRoutinePage() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<number | null>(null);
  const [myRoutines, setMyRoutines] = useState<any[]>([]);
  const [followedRoutines, setFollowedRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal controls
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editRoutine, setEditRoutine] = useState<any | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("Profile")
        .select("id")
        .eq("user_id", userData.user.id)
        .single();

      if (!profile) return;
      setProfileId(profile.id);

      // Fetch your own routines
      const { data: myData } = await supabase
        .from("WorkoutRoutine")
        .select("id, name, description, date_updated")
        .eq("profile_id", profile.id)
        .order("date_updated", { ascending: false });

      setMyRoutines(myData || []);

      // Fetch followed routines
      const { data: followedData } = await supabase
        .from("routine_followers")
        .select("routine_id, WorkoutRoutine(id, name, description, date_updated)")
        .eq("follower_id", profile.id)
        .order("routine_id", { ascending: false });

      const formattedFollowed = followedData?.map((f) => f.WorkoutRoutine) || [];
      setFollowedRoutines(formattedFollowed);

      setLoading(false);
    }

    fetchData();
  }, [router]);

  // Save / Update Routine
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profileId) return;

    const data = {
      profile_id: profileId,
      name,
      description,
      date_updated: new Date().toISOString(),
    };

    if (editRoutine) {
      await supabase.from("WorkoutRoutine").update(data).eq("id", editRoutine.id);
    } else {
      await supabase.from("WorkoutRoutine").insert([data]);
    }

    setName("");
    setDescription("");
    setEditRoutine(null);
    setShowModal(false);
    fetchRoutines();
  }

  async function fetchRoutines() {
    if (!profileId) return;

    const { data: myData } = await supabase
      .from("WorkoutRoutine")
      .select("id, name, description, date_updated")
      .eq("profile_id", profileId)
      .order("date_updated", { ascending: false });

    const { data: followedData } = await supabase
      .from("routine_followers")
      .select("routine_id, WorkoutRoutine(id, name, description, date_updated)")
      .eq("follower_id", profileId)
      .order("routine_id", { ascending: false });

    setMyRoutines(myData || []);
    setFollowedRoutines(followedData?.map((f) => f.WorkoutRoutine) || []);
  }

  // Unfollow function
  async function handleUnfollow(routineId: number) {
    if (!profileId) return;

    const { error } = await supabase
      .from("routine_followers")
      .delete()
      .eq("routine_id", routineId)
      .eq("follower_id", profileId);

    if (error) {
      console.error("Unfollow error:", error);
      return;
    }

    // Instantly update the UI
    setFollowedRoutines((prev) =>
      prev.filter((r) => r.id !== routineId)
    );
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this routine?")) return;
    await supabase.from("WorkoutRoutine").delete().eq("id", id);
    fetchRoutines();
  }

  return (
    <main className="min-h-screen bg-gray-900 text-gray-300">
      <Header />

      <div className="flex justify-center py-10">
        <div className="w-5/6 grid grid-cols-2 gap-6">
          {/* Left Column – Your Routines */}
          <div className="bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-purple-900">
                My Workout Routines
              </h1>
              <button
                onClick={() => setShowModal(true)}
                className="bg-[#7F5977] text-white px-4 py-2 rounded hover:bg-[#EED0BB] transition"
              >
                + Add Routine
              </button>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : myRoutines.length > 0 ? (
              <ul className="space-y-3">
                {myRoutines.map((routine) => (
                  <li
                    key={routine.id}
                    className="flex justify-between items-center border border-emerald-50 rounded-lg px-4 py-3 hover:bg-emerald-50 transition cursor-pointer"
                    onClick={() => router.push(`/workout/${routine.id}`)}
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-purple-900">
                        {routine.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {routine.description}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditRoutine(routine);
                          setName(routine.name);
                          setDescription(routine.description);
                          setShowModal(true);
                        }}
                        className="text-sm text-stone-400 hover:text-purple-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(routine.id);
                        }}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No workout routines yet.</p>
            )}
          </div>

          {/* Right Column – Followed Routines */}
          <div className="bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-purple-900">
                Followed Routines
              </h1>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : followedRoutines.length > 0 ? (
              <ul className="space-y-3">
                {followedRoutines.map((routine) => (
                  <li
                    key={routine.id}
                    className="flex justify-between items-center border border-emerald-50 rounded-lg px-4 py-3 hover:bg-emerald-50 transition cursor-pointer"
                    onClick={() => router.push(`/workout/followed/${routine.id}`)}
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-purple-900">
                        {routine.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {routine.description}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnfollow(routine.id);
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
                    >
                      Unfollow
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">
                You are not following any routines yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-[#7F5977] p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editRoutine ? "Edit Routine" : "Add New Routine"}
            </h2>
            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Routine Name"
                className="w-full p-2 rounded bg-gray-700 text-emerald-50 border border-stone-400/30 focus:border-purple-600 focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full p-2 rounded bg-gray-700 text-emerald-50 border border-stone-400/30 focus:border-purple-600 focus:outline-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditRoutine(null);
                  }}
                  className="px-4 py-2 bg-gray-800 text-emerald-50 rounded hover:bg-[#EED0BB] hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-900 text-emerald-50 rounded hover:bg-[#EED0BB] hover:text-gray-800"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
