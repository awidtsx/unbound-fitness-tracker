"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        //  User is logged in
        router.push("/dashboard/profile");
      } else {
        //  No session, go to login
        router.push("/login");
      }
    }

    checkSession();
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-800 text-stone-400">
      <h1 className="text-xl font-semibold">Checking session...</h1>
    </main>
  );
}
