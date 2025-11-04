# UNBOUND: Workout and Meal Tracker

## Project Overview
**UNBOUND** is a full-stack web application that allows users to track their fitness routines, manage workout exercises, and generate personalized meal plans with macronutrient tracking.  The application’s name and theme is inspired by Toji Fushiguro from Jujutsu Kaisen.
The app integrates authentication, CRUD operations, and relational database management using Supabase, built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

---

## Objective and Scope
**Objective:** Build a fitness web app that helps users track workouts and meals in one place.  

**Scope:**
- User authentication and profiles  
- Workout routine and exercise tracking  
- Meal planning with automatic macro calculations  
- Real-time updates through Supabase  
- Responsive UI using Tailwind CSS  

The project follows standard SDLC phases — planning, design (system architecture, database, and UI), development, testing, and deployment.

---

## Setup Guide

### Environment Variables
Create a `.env.local` file in the root of your project and add the following:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Do not commit your `.env.local` file.  
Include a `.env.local.example` in your repo to show the required keys.

---

### Installation and Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/your-project-name.git
   cd your-project-name
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   or  
   ```bash
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   Then open [http://localhost:3000](http://localhost:3000).

4. **Verify the setup**
   - The landing page should load without errors.  
   - Supabase authentication and data fetching should work in the browser console.

---

### Database Setup

#### Option 1: Run SQL migration files
If you included `.sql` files in a `/supabase/migrations` or `/database` folder:
1. Open the Supabase SQL Editor.  
2. Run the migration scripts in order.  
3. These will create the tables, foreign keys, and triggers.

#### Option 2: Using Supabase CLI
```bash
npx supabase start
npx supabase db push
```
This starts a local Supabase instance and applies migrations automatically.

---

### Frontend and Tech Stack

- **Framework:** Next.js (App Router)  
  Routes are defined in the `/app` directory. API routes, if any, are under `/app/api/`.

- **Language:** TypeScript  
  Provides static type checking and generated Supabase types.

- **Styling:** Tailwind CSS  
  Configured through `tailwind.config.ts` and `postcss.config.js`.  
  Uses utility-first classes for responsive and consistent design.

- **Database Client:** Supabase JS Client (`@supabase/supabase-js`)  
  Example setup in `/lib/supabaseClient.ts`:

  ```ts
  import { createClient } from '@supabase/supabase-js'

  export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  ```

---

### Testing the Supabase Connection
Run the following after setup to confirm database connectivity:
```ts
const { data, error } = await supabase.from('Profile').select('*');
console.log(data, error);
```
If data appears in the console with no errors, your setup works.

---

## Database Model

### Relationships Overview

| Relationship Type | Tables Involved | Description |
|--------------------|-----------------|--------------|
| **1:1** | `auth.users` → `Profile` | Each user has one profile. |
| **1:N** | `Profile` → `MealPlan` | A profile can have multiple meal plans. |
| **1:N** | `MealPlan` → `Food` | A meal plan includes multiple food items. |
| **1:N** | `WorkoutRoutine` → `Exercises` | A routine includes multiple exercises. |
| **M:N** | `WorkoutRoutine` ↔ `Profile` via `routine_followers` | Users can follow multiple routines. |
| **M:N** | `Profile` ↔ `Exercises` via `followed_exercises` | Users can follow multiple exercises. |

---

### Entity Descriptions

| Table | Description | Key Columns |
|--------|--------------|-------------|
| **auth.users** | Managed by Supabase Auth. Stores authentication credentials. | `id`, `email` |
| **Profile** | Extends user info with physical metrics. | `id`, `user_id`, `first_name`, `last_name`, `weight`, `height`, `goal`, `goal_weight` |
| **WorkoutRoutine** | User-created or shared workout plan. | `id`, `profile_id`, `name`, `description`, `date_updated` |
| **Exercises** | Exercises belonging to a specific workout routine. | `id`, `routine_id`, `name`, `description`, `set`, `reps`, `weight` |
| **routine_followers** | Junction table for M:N between WorkoutRoutine and Profile. | `id`, `routine_id`, `follower_id` |
| **followed_exercises** | Junction table for M:N between Profile and Exercises. | `id`, `follower_id`, `exercise_id`, `custom_sets`, `custom_reps`, `custom_weight` |
| **mealplan** | Tracks nutritional goals and totals. | `id`, `profile_id`, `total_protein`, `total_fat`, `total_carbs`, `total_calories`, `goal_protein`, `goal_fat`, `goal_carbs`, `goal_calories` |
| **food** | Food items belonging to a meal plan. | `id`, `mealplan_id`, `name`, `protein`, `carbs`, `fat`, `calories`, `amount` |

---

## Features Mapping

- Authentication using Supabase (email verification and password management)  
- Profile CRUD  
- Meal plan generation and food CRUD with macro calculation  
- Workout routine CRUD with nested exercise management  
- Explore page where users can follow other routines  
- Real-time updates and modal-based UI interactions  

---

## Database Functions and Triggers (Summary)

### MealPlan Macros Update Trigger
Automatically updates meal plan totals when food items are inserted, updated, or deleted.

### Cascade Delete Trigger for WorkoutRoutine
Deletes all related exercises, followed exercises, and routine followers when a workout routine is deleted.


---

## Access Control
Row Level Security (RLS) was not implemented in this version.
Access control is handled at the application level through Supabase Auth session checks and conditional rendering in the frontend.
•	Only authenticated users can create, edit, or delete their own profiles, meal plans, and workout routines.
•	Public pages such as the Explore section allow anyone to view shared routines.
•	Supabase’s built-in Auth ensures users can only access data tied to their session.


---

## AI Tools Used
- **GitHub Copilot:** Assisted in debugging and small syntax completions.  
- **ChatGPT:** Used for determining formula for macronutrients. 

