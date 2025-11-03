"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";

export default function MealPage() {
    const router = useRouter();
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


return (
    <main className="min-h-screen bg-gray-900 text-gray-300">
      <Header />
      </main>
)

}