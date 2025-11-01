'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      let result
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({ email, password })
      } else {
        result = await supabase.auth.signUp({ email, password })
      }

      if (result.error) throw result.error

      // Redirect on success
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    

     <main className="flex min-h-screen items-center justify-center bg-emerald-100 text-gray-400">
        <div className="flex flex-col items-center">
    
      <h1 className="text-4xl font-bold text-center text-purple-900 mb-6">UNBOUND: WORKOUT AND MEAL TRACKER</h1>
      
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-2xl shadow-lg w-96 space-y-5 border border-gray-800/20"
      >
        <h1 className="text-2xl font-bold text-center text-stone-400">
          {isLogin ? 'Login to Unbound' : 'Create your account'}
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 rounded bg-purple-950 text-stone-400 border border-stone-400/30 focus:border-purple-600 focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 rounded bg-purple-950 text-stone-400 border border-stone-400/30 focus:border-purple-600 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full py-2 rounded bg-purple-900 hover:bg-stone-400 hover:text-gray-800 font-semibold transition-colors"
        >
          {isLogin ? 'Login' : 'Sign Up'}
        </button>

        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-center text-stone-400 cursor-pointer hover:underline"
        >
          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
        </p>
      </form>
      </div>
    </main>
  )
}
