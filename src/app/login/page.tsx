"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { calculateAndUpsertMealplan } from "@/lib/calculateAndUpsertMealplan";


export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workouts, setWorkouts] = useState<any[]>([])

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [goal, setGoal] = useState("weight_loss")
  const [goalWeight, setGoalWeight] = useState("") // ✅ new state

  // Fetch top workouts
  useEffect(() => {
    async function fetchWorkouts() {
      const { data, error } = await supabase
        .from("workout_routines_with_followers")
        .select("id, name, description")
        .order("follower_count", { ascending: false })
        .order("date_updated", { ascending: false })
        .limit(5)
      if (error) console.error(error)
      else setWorkouts(data || [])
    }
    fetchWorkouts()
  }, [])

  // Check if user already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.push("/dashboard")
      }
    }
    checkSession()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      let result

      if (isLogin) {
        // LOGIN flow
        result = await supabase.auth.signInWithPassword({ email, password })

        if (result.error) throw result.error
        router.push("/dashboard")
      } else {
        // SIGN UP flow
        result = await supabase.auth.signUp({ email, password })

        if (result.error) throw result.error

        // If sign-up succeeds, insert profile data
        const userId = result.data.user?.id
        if (userId) {
          const { data: profileData, error: profileError } = await supabase.from("Profile").insert([
            {
              user_id: userId,
              first_name: firstName,
              last_name: lastName,
              weight: parseFloat(weight),
              height: parseFloat(height),
              goal: goal,
              goal_weight:
                goal === "maintain" || goalWeight === ""
                  ? null
                  : parseFloat(goalWeight), // ✅ conditional insert
            },
          ])
          .select()
      .single();

      const profileId = profileData.id;
        await calculateAndUpsertMealplan({
      profile_id: profileId,
      weight: parseFloat(weight),
      height: parseFloat(height),
      goal: goal as "weight_loss" | "muscle_gain" | "maintain",
      goal_weight:
        goal === "maintain" || goalWeight === ""
          ? null
          : parseFloat(goalWeight),
    });
    
          if (profileError) throw profileError;
        }
         


        alert(
          "A confirmation email has been sent. Please verify your email before logging in."
        )
        router.push("/login")
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <main className="flex min-h-screen bg-emerald-50 text-gray-800">
      {/* Left Side */}
      <section className="w-1/2 flex flex-col justify-center p-12 overflow-hidden">
        <h2 className="text-3xl font-bold text-purple-900 mb-4">
          Top Workout Routines
        </h2>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {workouts.length === 0 ? (
            <p className="text-gray-500">No workouts found.</p>
          ) : (
            workouts.map((w) => (
              <div
                key={w.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-semibold text-purple-800">{w.name}</h3>
                <p className="text-sm text-gray-600">{w.description}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Right Side */}
      <section className="w-1/2 flex flex-col justify-center bg-gray-800 text-[#BABABA] px-20">
        <h1 className="text-4xl font-bold mb-2 text-purple-900">UNBOUND</h1>
        <h2 className="text-2xl font-bold mb-2 text-[#EED0BB]">
          {isLogin ? "Login" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 border border-[#7F5977] bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-[#EED0BB]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter your password"
            className="w-full p-3 border border-[#7F5977] bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-[#EED0BB]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="First Name"
                className="w-full p-3 border border-[#7F5977] bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-[#EED0BB]"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full p-3 border border-[#7F5977] bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-[#EED0BB]"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />

              <div className="flex space-x-3">
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  className="w-1/2 p-3 border border-[#7F5977] bg-transparent rounded focus:ring-2 focus:ring-[#EED0BB]"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Height (cm)"
                  className="w-1/2 p-3 border border-[#7F5977] bg-transparent rounded focus:ring-2 focus:ring-[#EED0BB]"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required
                />
              </div>

              <select
                className="w-full p-3 border border-[#7F5977] bg-transparent rounded focus:ring-2 focus:ring-[#EED0BB]"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="maintain">Maintain</option>
              </select>

              {/* ✅ Conditional Goal Weight input */}
              {(goal === "weight_loss" || goal === "muscle_gain") && (
                <input
                  type="number"
                  step="0.01"
                  placeholder="Goal Weight (kg)"
                  className="w-full p-3 border border-[#7F5977] bg-transparent rounded focus:ring-2 focus:ring-[#EED0BB]"
                  value={goalWeight}
                  onChange={(e) => setGoalWeight(e.target.value)}
                  required
                />
              )}
            </>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-[#7F5977] text-[#EED0BB] font-semibold rounded hover:bg-[#EED0BB] hover:text-[#2F3547] transition"
          >
            {isLogin ? "Log In" : "Sign Up"}
          </button>

          <p
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-center mt-3 text-[#EED0BB] cursor-pointer hover:underline"
          >
            {isLogin
              ? "Need an account? Sign up"
              : "Already have an account? Log in"}
          </p>
        </form>
      </section>
    </main>
  )
}
