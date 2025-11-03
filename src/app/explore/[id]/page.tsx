'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../components/Header';

export default function ExploreWorkoutDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [routine, setRoutine] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [isFollowed, setIsFollowed] = useState(false);

  
  useEffect(() => {
    async function checkSession() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push('/login');
        return;
      }

      
      const { data: profileData } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();

      if (!profileData) return;

      setProfileId(profileData.id);
      setIsAuthenticated(true);
    }

    checkSession();
  }, [router]);

  
  async function fetchRoutine() {
  setLoading(true);
  const { data: routineData } = await supabase
    .from("WorkoutRoutine")
    .select("*")
    .eq("id", id)
    .single();

  const { data: exerciseData } = await supabase
    .from("Exercises")
    .select("*")
    .eq("routine_id", id);

  setRoutine(routineData);
  setExercises(exerciseData || []);
  setLoading(false);
}

useEffect(() => {
  async function init() {
    fetchRoutine(); // ✅ Now it's already declared
  }
  init();
}, [id, router]);

  
  async function handleFollow() {
    if (!profileId) return;

    const { error } = await supabase.from('routine_followers').insert([
      {
        routine_id: id,
        follower_id: profileId,
      },
    ]);

    if (error) console.error(error);
    else setIsFollowed(true);
  }

  return (
    <main className="min-h-screen bg-gray-900 text-gray-300">
      <Header />
      <section className="max-w-3xl mx-auto mt-10 bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-900">
            {routine?.name || 'Workout Routine'}
          </h1>
          {!isFollowed && (
            <button
              onClick={handleFollow}
              className="bg-[#7F5977] text-white px-4 py-2 rounded hover:bg-[#EED0BB] hover:text-gray-800 transition"
            >
              + Follow
            </button>
          )}
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

                    {/* Non-editable fields */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={exercise.sets || ''}
                        readOnly
                        className="w-16 p-1 rounded bg-gray-700 text-gray-400 text-center border border-gray-600 cursor-not-allowed"
                        placeholder="Sets"
                      />
                      <input
                        type="number"
                        value={exercise.reps || ''}
                        readOnly
                        className="w-16 p-1 rounded bg-gray-700 text-gray-400 text-center border border-gray-600 cursor-not-allowed"
                        placeholder="Reps"
                      />
                      <input
                        type="number"
                        value={exercise.weight || ''}
                        readOnly
                        className="w-20 p-1 rounded bg-gray-700 text-gray-400 text-center border border-gray-600 cursor-not-allowed"
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
