'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation';
import Header from '../../components/Header'

export default function WorkoutDetail() {
  const router = useRouter();
  const { id } = useParams() // get the workout routine id from the URL
  const [routine, setRoutine] = useState<any>(null)
  const [exercises, setExercises] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    async function checkSesh() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }

      
    }

    checkSesh();
  }, [router]);

async function fetchRoutine() {
    setLoading(true)

    const { data: routineData, error: routineError } = await supabase
      .from('WorkoutRoutine')
      .select('*')
      .eq('id', id)
      .single()

    if (routineError) console.error(routineError)

    const { data: exerciseData, error: exerciseError } = await supabase
      .from('Exercises')
      .select('*')
      .eq('routine_id', id)
      .order('id', { ascending: true })

    if (exerciseError) console.error(exerciseError)

    setRoutine(routineData)
    setExercises(exerciseData || [])
    setLoading(false)
  }
  
  //  Fetch routine and exercises
  useEffect(() => {
    if (!id) return
    fetchRoutine()
  }, [id])

  

  //  Update exercise values
  async function handleUpdate(exerciseId: number, field: string, value: any) {
    const { error } = await supabase
      .from('Exercises')
      .update({ [field]: value })
      .eq('id', exerciseId)

    if (error) console.error(error)
    else fetchRoutine()
  }

  // ✅ Delete exercise
  async function handleDelete(exerciseId: number) {
    if (!confirm('Are you sure you want to delete this exercise?')) return
    const { error } = await supabase
      .from('Exercises')
      .delete()
      .eq('id', exerciseId)

    if (error) console.error(error)
    else fetchRoutine()
  }

  // ✅ Add exercise
  async function addExercise(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('Exercises').insert([
      {
        routine_id: id,
        name,
        description,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: parseFloat(weight),
      },
    ])

    if (error) console.error(error)
    else {
      setShowModal(false)
      setName('')
      setDescription('')
      setSets('')
      setReps('')
      setWeight('')
      fetchRoutine()
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-gray-300">
      <Header />

      <section className="max-w-3xl mx-auto mt-10 bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-purple-900">Exercises</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#7F5977] text-white px-4 py-2 rounded hover:bg-[#EED0BB] hover:text-gray-800 transition"
          >
            + Add Exercise
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-purple-900 mb-2">
              {routine?.name}
            </h1>
            <p className="text-gray-400 mb-6">{routine?.description}</p>

            {/* Exercise List */}
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
                        value={exercise.set || ''}
                        onChange={(e) =>
                          handleUpdate(
                            exercise.id,
                            'sets',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-16 p-1 rounded bg-gray-700 text-gray-100 text-center border border-gray-600"
                        placeholder="Sets"
                      />
                      <input
                        type="number"
                        value={exercise.reps || ''}
                        onChange={(e) =>
                          handleUpdate(
                            exercise.id,
                            'reps',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-16 p-1 rounded bg-gray-700 text-gray-100 text-center border border-gray-600"
                        placeholder="Reps"
                      />
                      <input
                        type="number"
                        value={exercise.weight || ''}
                        onChange={(e) =>
                          handleUpdate(
                            exercise.id,
                            'weight',
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-20 p-1 rounded bg-gray-700 text-gray-100 text-center border border-gray-600"
                        placeholder="Weight"
                      />
                      <button
                        onClick={() => handleDelete(exercise.id)}
                        className="text-red-500 hover:text-red-700 text-sm ml-3"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No exercises yet.</p>
              )}
            </div>
          </>
        )}
      </section>

      {/* ✅ ADD EXERCISE MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false)
          }}
        >
          <div className="bg-[#7F5977] p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Add Exercise
            </h2>
            <form onSubmit={addExercise} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Exercise Name"
                className="w-full p-2 rounded bg-gray-700 text-emerald-50 border border-stone-400/30 focus:border-purple-600 focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Description"
                className="w-full p-2 rounded bg-gray-700 text-emerald-50 border border-stone-400/30 focus:border-purple-600 focus:outline-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <input
                type="number"
                placeholder="Sets"
                className="w-full p-2 rounded bg-gray-700 text-emerald-50 border border-stone-400/30 focus:border-purple-600 focus:outline-none"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
              />
              <input
                type="number"
                placeholder="Reps"
                className="w-full p-2 rounded bg-gray-700 text-emerald-50 border border-stone-400/30 focus:border-purple-600 focus:outline-none"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
              <input
                type="number"
                placeholder="Weight (kg)"
                className="w-full p-2 rounded bg-gray-700 text-emerald-50 border border-stone-400/30 focus:border-purple-600 focus:outline-none"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-800 text-emerald-50 rounded hover:bg-[#EED0BB] hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-900 text-emerald-50 rounded hover:bg-[#EED0BB] hover:text-gray-800"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
