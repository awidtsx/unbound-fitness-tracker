"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "../../components/Header";

export default function MealPlanPage() {
  const { id } = useParams(); // mealplan id
  const [mealplan, setMealplan] = useState<any>(null);
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & form state
  const [showModal, setShowModal] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");
  const [calories, setCalories] = useState("");
  const [amount, setAmount] = useState("");

  async function fetchMealplan() {
    setLoading(true);

    const { data: mealplanData, error: mealplanError } = await supabase
      .from("mealplan")
      .select("*")
      .eq("id", id)
      .single();

    if (mealplanError) console.error(mealplanError);
    else setMealplan(mealplanData);

    const { data: foodData, error: foodError } = await supabase
      .from("food")
      .select("*")
      .eq("mealplan_id", id);

    if (foodError) console.error(foodError);
    else setFoods(foodData || []);

    setLoading(false);
  }

  useEffect(() => {
    if (!id) return;
    fetchMealplan();
  }, [id]);

  
  async function handleAddFood(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("food").insert([
      {
        mealplan_id: id,
        name: foodName,
        protein: parseFloat(protein),
        fat: parseFloat(fat),
        carbs: parseFloat(carbs),
        calories: parseFloat(calories),
        amount: parseFloat(amount),
      },
    ]);

    if (error) console.error(error);
    else {
      setShowModal(false);
      setFoodName("");
      setProtein("");
      setFat("");
      setCarbs("");
      setCalories("");
      setAmount("");
      fetchMealplan(); // reload foods & totals
    }
  }

  
  async function handleUpdateFood(foodId: number, field: string, value: any) {
    const { error } = await supabase
      .from("food")
      .update({ [field]: value })
      .eq("id", foodId);

    if (error) console.error(error);
    else fetchMealplan(); 
  }

  
  async function handleDeleteFood(foodId: number) {
    if (!confirm("Are you sure you want to delete this food?")) return;
    const { error } = await supabase.from("food").delete().eq("id", foodId);

    if (error) console.error(error);
    else fetchMealplan(); 
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">
        <p>Loading meal plan...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-gray-300">
      <Header />

      <section className="max-w-4xl mx-auto mt-10 bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
        <h1 className="text-3xl font-bold text-purple-900 mb-4">
          Meal Plan
        </h1>

       
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="bg-gray-700 p-4 rounded">
            <h3 className="font-semibold text-purple-300 mb-2">Goal Macros</h3>
            <p>Protein: {mealplan.goal_protein}g</p>
            <p>Fat: {mealplan.goal_fat}g</p>
            <p>Carbs: {mealplan.goal_carbs}g</p>
            <p>Calories: {mealplan.goal_calories} kcal</p>
          </div>
          <div className="bg-gray-700 p-4 rounded">
            <h3 className="font-semibold text-purple-300 mb-2">Total Macros</h3>
            <p>Protein: {mealplan.total_protein}g</p>
            <p>Fat: {mealplan.total_fat}g</p>
            <p>Carbs: {mealplan.total_carbs}g</p>
            <p>Calories: {mealplan.total_calories} kcal</p>
          </div>
        </div>

       
        <button
          onClick={() => setShowModal(true)}
          className="mb-4 px-4 py-2 bg-[#7F5977] rounded hover:bg-[#EED0BB] hover:text-gray-800 transition"
        >
          + Add Food
        </button>

        
        <div className="space-y-4">
          {foods.length > 0 ? (
            foods.map((food) => (
              <div
                key={food.id}
                className="flex flex-col md:flex-row justify-between items-center bg-gray-700 p-4 rounded"
              >
                <div className="flex-1">
                  <p className="font-semibold text-purple-300">{food.name}</p>
                  <div className="flex space-x-2 mt-1">
                    <input
                      type="number"
                      value={food.amount || 1}
                      onChange={(e) =>
                        handleUpdateFood(food.id, "amount", parseFloat(e.target.value))
                      }
                      className="w-20 p-1 rounded bg-gray-800 text-gray-100 text-center border border-gray-600"
                      placeholder="Amount"
                    />
                    <input
                      type="number"
                      value={food.protein || 0}
                      onChange={(e) =>
                        handleUpdateFood(food.id, "protein", parseFloat(e.target.value))
                      }
                      className="w-20 p-1 rounded bg-gray-800 text-gray-100 text-center border border-gray-600"
                      placeholder="Protein"
                    />
                    <input
                      type="number"
                      value={food.fat || 0}
                      onChange={(e) =>
                        handleUpdateFood(food.id, "fat", parseFloat(e.target.value))
                      }
                      className="w-20 p-1 rounded bg-gray-800 text-gray-100 text-center border border-gray-600"
                      placeholder="Fat"
                    />
                    <input
                      type="number"
                      value={food.carbs || 0}
                      onChange={(e) =>
                        handleUpdateFood(food.id, "carbs", parseFloat(e.target.value))
                      }
                      className="w-20 p-1 rounded bg-gray-800 text-gray-100 text-center border border-gray-600"
                      placeholder="Carbs"
                    />
                    <input
                      type="number"
                      value={food.calories || 0}
                      onChange={(e) =>
                        handleUpdateFood(food.id, "calories", parseFloat(e.target.value))
                      }
                      className="w-24 p-1 rounded bg-gray-800 text-gray-100 text-center border border-gray-600"
                      placeholder="Calories"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteFood(food.id)}
                  className="mt-2 md:mt-0 px-3 py-1 bg-red-600 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No foods yet.</p>
          )}
        </div>
      </section>

      
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-[#7F5977] p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Food</h2>
            <form onSubmit={handleAddFood} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Food Name"
                className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Amount"
                className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Protein (g)"
                className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
              <input
                type="number"
                placeholder="Fat (g)"
                className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
              />
              <input
                type="number"
                placeholder="Carbs (g)"
                className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
              <input
                type="number"
                placeholder="Calories"
                className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-100 rounded hover:bg-[#EED0BB] hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-900 text-gray-100 rounded hover:bg-[#EED0BB] hover:text-gray-800"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
