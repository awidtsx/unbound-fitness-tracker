'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'
import Header from '../../../components/Header'

export default function FollowedWorkoutDetail() {
  const { id } = useParams() // workout_routine id
  const [routine, setRoutine] = useState<any>(null)
  const [exercises, setExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    getUser()
  }, [])

  useEffect(() => {
    if (id && userId) fetchRoutine()
  }, [id, userId])

  async function getUser() {
    const { data } = await supabase.auth.getUser()
    if (data?.user) setUserId(data.user.id)
  }

  async function fetchRoutine() {
    setLoading(true)

    // Get the routine info
    const { data: routineData } = await supabase
      .from('WorkoutRoutine')
      .select('*')
      .eq('id', id)
      .single()

    // Get base exercises
    const { data: exerciseData } = await supabase
      .from('Exercises')
      .select('*')
      .eq('routine_id', id)

    // Get any custom values user may have saved before
    const { data: followedData } = await supabase
      .from('FollowedExercises')
      .select('*')
      .eq('follower_id', userId)

    // Merge user’s custom values if they exist
    const merged = (exerciseData || []).map((ex) => {
      const custom = followedData?.find((f) => f.exercise_id === ex.id)
      return {
        ...ex,
        custom_sets: custom?.custom_sets ?? ex.sets,
        custom_reps: custom?.custom_reps ?? ex.reps,
        custom_weight: custom?.custom_weight ?? ex.weight,
      }
    })

    setRoutine(routineData)
    setExercises(merged)
    setLoading(false)
  }

  async function handleCustomUpdate(exerciseId: number, field: string, value: any) {
    if (!userId) return

    const updateFieldMap: any = {
      sets: 'custom_sets',
      reps: 'custom_reps',
      weight: 'custom_weight',
    }

    const fieldName = updateFieldMap[field]

    // Upsert (insert or update)
    await supabase.from('FollowedExercises').upsert({
      follower_id: userId,
      exercise_id: exerciseId,
      [fieldName]: value,
    })

    // Update local UI
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId ? { ...ex, [fieldName]: value } : ex
      )
    )
  }

  return (
    <main className="min-h-screen bg-gray-900 text-gray-300">
      <Header />
      <section className="max-w-3xl mx-auto mt-10 bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-900">
            {routine?.name || 'Workout Routine'}
          </h1>
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
                      <p className="text-sm text-gray-400">{exercise.description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={exercise.custom_sets || ''}
                        onChange={(e) =>
                          handleCustomUpdate(exercise.id, 'sets', parseInt(e.target.value))
                        }
                        className="w-16 p-1 rounded bg-gray-700 text-gray-100 text-center border border-gray-600"
                        placeholder="Sets"
                      />
                      <input
                        type="number"
                        value={exercise.custom_reps || ''}
                        onChange={(e) =>
                          handleCustomUpdate(exercise.id, 'reps', parseInt(e.target.value))
                        }
                        className="w-16 p-1 rounded bg-gray-700 text-gray-100 text-center border border-gray-600"
                        placeholder="Reps"
                      />
                      <input
                        type="number"
                        value={exercise.custom_weight || ''}
                        onChange={(e) =>
                          handleCustomUpdate(exercise.id, 'weight', parseFloat(e.target.value))
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
  )
}
