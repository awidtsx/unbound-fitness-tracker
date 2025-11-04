import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
// Using explicit typing here to ensure correct parameter types
export async function calculateAndUpsertMealplan({
  profile_id,
  weight,
  height,
  goal,
  goal_weight,
}: {
  profile_id: number;
  weight: number;
  height: number;
  goal: "weight_loss" | "muscle_gain" | "maintain";
  goal_weight: number | null;
}) {
  // Formula for macros calculation
  const age = 25;
  const BMR = 10 * weight + 6.25 * height - 5 * age + 5;
  const TDEE = BMR * 1.375;

  let goalCalories = TDEE;
  if (goal === "weight_loss" && goal_weight) goalCalories -= 500;
  else if (goal === "muscle_gain" && goal_weight) goalCalories += 400;

  const goalProtein = Math.round(weight * 2);
  const goalFat = Math.round((0.25 * goalCalories) / 9);
  const goalCarbs = Math.round(
    (goalCalories - (goalProtein * 4 + goalFat * 9)) / 4
  );

  // Checking mealplan to determine whether to insert or update
  const { data: existing, error: fetchError } = await supabase
    .from("mealplan")
    .select("id")
    .eq("profile_id", profile_id)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw new Error(fetchError.message);
  }
  // Update mealplan
  if (existing) {
    const { error: updateError } = await supabase
      .from("mealplan")
      .update({
        goal_protein: goalProtein,
        goal_fat: goalFat,
        goal_carbs: goalCarbs,
        goal_calories: goalCalories,
      })
      .eq("id", existing.id);

    if (updateError) throw new Error(updateError.message);
  }
  // Insert mealplan
  else {
    const { error: insertError } = await supabase.from("mealplan").insert([
      {
        profile_id,
        goal_protein: goalProtein,
        goal_fat: goalFat,
        goal_carbs: goalCarbs,
        goal_calories: goalCalories,
      },
    ]);
    if (insertError) throw new Error(insertError.message);
  }
}
