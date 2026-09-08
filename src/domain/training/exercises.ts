import type { Exercise } from "../types";

/**
 * Seed exercise library. Instructions are deliberately conservative and
 * generic (setup + execution cues), never medical or maximal-effort coaching.
 * The training engine selects from this pool, filtered by equipment.
 */
export const EXERCISES: Exercise[] = [
  // ---- Squat pattern ----
  {
    id: "back-squat",
    name: "Back Squat",
    pattern: "squat",
    primary: ["quads", "glutes"],
    secondary: ["core", "hamstrings"],
    equipment: ["full_gym"],
    difficulty: 3,
    instructions: [
      "Set the bar across your upper back and brace your core.",
      "Sit down and back, keeping your whole foot planted.",
      "Drive up to standing, keeping your chest tall."
    ],
    tags: ["compound", "lower"],
    substitutions: ["goblet-squat", "bodyweight-squat", "split-squat"]
  },
  {
    id: "goblet-squat",
    name: "Goblet Squat",
    pattern: "squat",
    primary: ["quads", "glutes"],
    secondary: ["core"],
    equipment: ["full_gym", "home_basic"],
    difficulty: 2,
    instructions: [
      "Hold one dumbbell or kettlebell at your chest.",
      "Squat down between your knees, elbows inside.",
      "Stand back up, staying tall through the chest."
    ],
    tags: ["compound", "lower"],
    substitutions: ["bodyweight-squat", "split-squat", "back-squat"]
  },
  {
    id: "bodyweight-squat",
    name: "Bodyweight Squat",
    pattern: "squat",
    primary: ["quads", "glutes"],
    secondary: ["core"],
    equipment: ["home_minimal", "bodyweight", "hotel", "home_basic"],
    difficulty: 1,
    instructions: [
      "Stand with feet about shoulder width.",
      "Sit down and back as far as is comfortable.",
      "Stand tall, squeezing your glutes at the top."
    ],
    tags: ["lower", "beginner"],
    substitutions: ["split-squat", "goblet-squat"]
  },
  {
    id: "split-squat",
    name: "Split Squat",
    pattern: "lunge",
    primary: ["quads", "glutes"],
    secondary: ["core", "hamstrings"],
    equipment: ["bodyweight", "home_minimal", "home_basic", "full_gym", "hotel"],
    difficulty: 2,
    instructions: [
      "Take a long stride so one leg is forward, one back.",
      "Lower straight down until the back knee nearly touches.",
      "Drive through the front foot to stand."
    ],
    tags: ["lower", "unilateral"],
    substitutions: ["bodyweight-squat", "walking-lunge", "goblet-squat"]
  },
  {
    id: "walking-lunge",
    name: "Walking Lunge",
    pattern: "lunge",
    primary: ["quads", "glutes"],
    secondary: ["hamstrings", "core"],
    equipment: ["bodyweight", "home_basic", "full_gym", "hotel"],
    difficulty: 2,
    instructions: [
      "Step forward into a lunge, back knee toward the floor.",
      "Push off the front foot into the next step.",
      "Keep your torso tall throughout."
    ],
    tags: ["lower", "unilateral"],
    substitutions: ["split-squat", "bodyweight-squat"]
  },

  // ---- Hinge pattern ----
  {
    id: "deadlift",
    name: "Deadlift",
    pattern: "hinge",
    primary: ["hamstrings", "glutes", "back"],
    secondary: ["core", "forearms"],
    equipment: ["full_gym"],
    difficulty: 4,
    instructions: [
      "Stand with the bar over mid-foot, hinge to grip it.",
      "Brace, then stand up by pushing the floor away.",
      "Lower under control by pushing your hips back."
    ],
    tags: ["compound", "posterior"],
    substitutions: ["romanian-deadlift", "hip-hinge-db", "glute-bridge"]
  },
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift",
    pattern: "hinge",
    primary: ["hamstrings", "glutes"],
    secondary: ["back", "core"],
    equipment: ["full_gym", "home_basic"],
    difficulty: 3,
    instructions: [
      "Hold the weight in front of your thighs.",
      "Push your hips back, lowering the weight down your legs.",
      "Stand tall by squeezing your glutes."
    ],
    tags: ["posterior"],
    substitutions: ["hip-hinge-db", "glute-bridge", "deadlift"]
  },
  {
    id: "hip-hinge-db",
    name: "Dumbbell Hip Hinge",
    pattern: "hinge",
    primary: ["hamstrings", "glutes"],
    secondary: ["back"],
    equipment: ["home_basic", "home_minimal"],
    difficulty: 2,
    instructions: [
      "Hold a dumbbell in each hand.",
      "Hinge at the hips, keeping a soft knee bend.",
      "Return to standing, squeezing the glutes."
    ],
    tags: ["posterior"],
    substitutions: ["glute-bridge", "romanian-deadlift"]
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    pattern: "hinge",
    primary: ["glutes"],
    secondary: ["hamstrings", "core"],
    equipment: ["bodyweight", "hotel", "home_minimal"],
    difficulty: 1,
    instructions: [
      "Lie on your back, knees bent, feet flat.",
      "Drive through your heels to lift your hips.",
      "Squeeze at the top, then lower under control."
    ],
    tags: ["posterior", "beginner"],
    substitutions: ["hip-hinge-db", "romanian-deadlift"]
  },

  // ---- Horizontal push ----
  {
    id: "bench-press",
    name: "Bench Press",
    pattern: "push_horizontal",
    primary: ["chest", "triceps"],
    secondary: ["shoulders"],
    equipment: ["full_gym"],
    difficulty: 3,
    instructions: [
      "Lie on the bench, grip a little wider than shoulders.",
      "Lower the bar to your mid-chest under control.",
      "Press back up until your arms are straight."
    ],
    tags: ["compound", "push"],
    substitutions: ["db-bench", "push-up", "incline-push-up"]
  },
  {
    id: "db-bench",
    name: "Dumbbell Bench Press",
    pattern: "push_horizontal",
    primary: ["chest", "triceps"],
    secondary: ["shoulders"],
    equipment: ["full_gym", "home_basic"],
    difficulty: 2,
    instructions: [
      "Lie back holding a dumbbell in each hand.",
      "Lower to chest level with control.",
      "Press up until arms are straight."
    ],
    tags: ["push"],
    substitutions: ["push-up", "bench-press", "incline-push-up"]
  },
  {
    id: "push-up",
    name: "Push-Up",
    pattern: "push_horizontal",
    primary: ["chest", "triceps"],
    secondary: ["shoulders", "core"],
    equipment: ["bodyweight", "hotel", "home_minimal", "home_basic"],
    difficulty: 2,
    instructions: [
      "Set hands slightly wider than your shoulders.",
      "Lower your chest toward the floor, body in a line.",
      "Press back up without letting the hips sag."
    ],
    tags: ["push", "bodyweight"],
    substitutions: ["incline-push-up", "db-bench"]
  },
  {
    id: "incline-push-up",
    name: "Incline Push-Up",
    pattern: "push_horizontal",
    primary: ["chest", "triceps"],
    secondary: ["shoulders"],
    equipment: ["bodyweight", "hotel", "home_minimal"],
    difficulty: 1,
    instructions: [
      "Place your hands on a sturdy raised surface.",
      "Lower your chest toward the edge, body straight.",
      "Press back up under control."
    ],
    tags: ["push", "beginner"],
    substitutions: ["push-up"]
  },

  // ---- Vertical push ----
  {
    id: "overhead-press",
    name: "Overhead Press",
    pattern: "push_vertical",
    primary: ["shoulders", "triceps"],
    secondary: ["core"],
    equipment: ["full_gym", "home_basic"],
    difficulty: 3,
    instructions: [
      "Hold the weight at shoulder height, elbows under.",
      "Press overhead until your arms are straight.",
      "Lower under control to the shoulders."
    ],
    tags: ["push", "shoulders"],
    substitutions: ["db-shoulder-press", "pike-push-up"]
  },
  {
    id: "db-shoulder-press",
    name: "Dumbbell Shoulder Press",
    pattern: "push_vertical",
    primary: ["shoulders", "triceps"],
    secondary: ["core"],
    equipment: ["full_gym", "home_basic", "home_minimal"],
    difficulty: 2,
    instructions: [
      "Hold a dumbbell at each shoulder.",
      "Press overhead until arms straighten.",
      "Lower back to the shoulders."
    ],
    tags: ["push", "shoulders"],
    substitutions: ["overhead-press", "pike-push-up"]
  },
  {
    id: "pike-push-up",
    name: "Pike Push-Up",
    pattern: "push_vertical",
    primary: ["shoulders", "triceps"],
    secondary: ["core"],
    equipment: ["bodyweight", "hotel"],
    difficulty: 3,
    instructions: [
      "Start in a downward-dog position, hips high.",
      "Lower the crown of your head toward the floor.",
      "Press back up to the start."
    ],
    tags: ["push", "bodyweight"],
    substitutions: ["db-shoulder-press", "incline-push-up"]
  },

  // ---- Horizontal pull ----
  {
    id: "barbell-row",
    name: "Barbell Row",
    pattern: "pull_horizontal",
    primary: ["back", "lats"],
    secondary: ["biceps", "core"],
    equipment: ["full_gym"],
    difficulty: 3,
    instructions: [
      "Hinge forward with a flat back, bar hanging.",
      "Row the bar to your lower ribs.",
      "Lower under control, keeping the torso still."
    ],
    tags: ["pull", "back"],
    substitutions: ["db-row", "inverted-row", "band-row"]
  },
  {
    id: "db-row",
    name: "Dumbbell Row",
    pattern: "pull_horizontal",
    primary: ["back", "lats"],
    secondary: ["biceps"],
    equipment: ["full_gym", "home_basic", "home_minimal"],
    difficulty: 2,
    instructions: [
      "Support one hand and knee on a bench.",
      "Row the dumbbell to your hip.",
      "Lower with control and repeat."
    ],
    tags: ["pull", "back"],
    substitutions: ["inverted-row", "band-row", "barbell-row"]
  },
  {
    id: "inverted-row",
    name: "Inverted Row",
    pattern: "pull_horizontal",
    primary: ["back", "lats"],
    secondary: ["biceps", "core"],
    equipment: ["bodyweight", "full_gym", "hotel"],
    difficulty: 2,
    instructions: [
      "Set a bar at hip height and hang underneath it.",
      "Pull your chest to the bar, body straight.",
      "Lower under control."
    ],
    tags: ["pull", "bodyweight"],
    substitutions: ["band-row", "db-row"]
  },
  {
    id: "band-row",
    name: "Band Row",
    pattern: "pull_horizontal",
    primary: ["back", "lats"],
    secondary: ["biceps"],
    equipment: ["home_minimal", "hotel", "bodyweight"],
    difficulty: 1,
    instructions: [
      "Anchor a band at chest height and hold both ends.",
      "Row your elbows back, squeezing the shoulder blades.",
      "Return with control."
    ],
    tags: ["pull", "beginner"],
    substitutions: ["inverted-row", "db-row"]
  },

  // ---- Vertical pull ----
  {
    id: "pull-up",
    name: "Pull-Up",
    pattern: "pull_vertical",
    primary: ["lats", "back"],
    secondary: ["biceps", "core"],
    equipment: ["full_gym", "bodyweight", "home_basic"],
    difficulty: 4,
    instructions: [
      "Hang from a bar with an overhand grip.",
      "Pull until your chin clears the bar.",
      "Lower all the way under control."
    ],
    tags: ["pull", "skill"],
    substitutions: ["lat-pulldown", "band-assisted-pull-up", "inverted-row"]
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    pattern: "pull_vertical",
    primary: ["lats", "back"],
    secondary: ["biceps"],
    equipment: ["full_gym"],
    difficulty: 2,
    instructions: [
      "Grip the bar wider than your shoulders.",
      "Pull it to your upper chest, elbows down.",
      "Return under control."
    ],
    tags: ["pull"],
    substitutions: ["band-assisted-pull-up", "band-row"]
  },
  {
    id: "band-assisted-pull-up",
    name: "Band-Assisted Pull-Up",
    pattern: "pull_vertical",
    primary: ["lats", "back"],
    secondary: ["biceps"],
    equipment: ["home_basic", "bodyweight", "full_gym"],
    difficulty: 3,
    instructions: [
      "Loop a band over the bar and into it place a foot.",
      "Pull up until your chin clears the bar.",
      "Lower with control."
    ],
    tags: ["pull", "progression"],
    substitutions: ["inverted-row", "lat-pulldown"]
  },

  // ---- Core ----
  {
    id: "plank",
    name: "Plank",
    pattern: "core",
    primary: ["core"],
    secondary: ["shoulders"],
    equipment: ["bodyweight", "hotel", "home_minimal", "home_basic", "full_gym"],
    difficulty: 1,
    instructions: [
      "Rest on your forearms and toes, body in a straight line.",
      "Brace your core and squeeze your glutes.",
      "Hold for the prescribed time, breathing steadily."
    ],
    tags: ["core", "hold"],
    substitutions: ["dead-bug", "hollow-hold"]
  },
  {
    id: "dead-bug",
    name: "Dead Bug",
    pattern: "core",
    primary: ["core"],
    secondary: [],
    equipment: ["bodyweight", "hotel", "home_minimal"],
    difficulty: 1,
    instructions: [
      "Lie on your back, arms up, knees over hips.",
      "Lower one arm and the opposite leg together.",
      "Return and switch sides, keeping your back flat."
    ],
    tags: ["core", "beginner"],
    substitutions: ["plank", "hollow-hold"]
  },
  {
    id: "hollow-hold",
    name: "Hollow Hold",
    pattern: "core",
    primary: ["core"],
    secondary: [],
    equipment: ["bodyweight", "hotel"],
    difficulty: 2,
    instructions: [
      "Lie on your back and press your lower back down.",
      "Lift your shoulders and legs into a shallow banana shape.",
      "Hold, keeping the lower back on the floor."
    ],
    tags: ["core", "skill"],
    substitutions: ["plank", "dead-bug"]
  },

  // ---- Conditioning / run ----
  {
    id: "easy-run",
    name: "Easy Run",
    pattern: "conditioning",
    primary: ["cardio"],
    secondary: ["legs"],
    equipment: ["bodyweight", "hotel"],
    difficulty: 2,
    instructions: [
      "Run at a pace where you can hold a conversation.",
      "Keep effort steady and relaxed.",
      "Finish feeling like you could have done more."
    ],
    tags: ["run", "aerobic"],
    substitutions: ["brisk-walk", "row-erg"]
  },
  {
    id: "tempo-run",
    name: "Tempo Run",
    pattern: "conditioning",
    primary: ["cardio"],
    secondary: ["legs"],
    equipment: ["bodyweight", "hotel"],
    difficulty: 3,
    instructions: [
      "Warm up easy for several minutes.",
      "Hold a comfortably-hard pace for the prescribed block.",
      "Cool down easy."
    ],
    tags: ["run", "threshold"],
    substitutions: ["easy-run", "intervals"]
  },
  {
    id: "intervals",
    name: "Intervals",
    pattern: "conditioning",
    primary: ["cardio"],
    secondary: ["legs"],
    equipment: ["bodyweight", "hotel"],
    difficulty: 4,
    instructions: [
      "Warm up thoroughly first.",
      "Alternate hard efforts with easy recovery jogs.",
      "Cool down easy when finished."
    ],
    tags: ["run", "speed"],
    substitutions: ["tempo-run", "easy-run"]
  },
  {
    id: "brisk-walk",
    name: "Brisk Walk",
    pattern: "conditioning",
    primary: ["cardio"],
    secondary: [],
    equipment: ["bodyweight", "hotel"],
    difficulty: 1,
    instructions: [
      "Walk at a pace that lifts your breathing a little.",
      "Keep a steady rhythm.",
      "A good low-impact option on tired days."
    ],
    tags: ["walk", "beginner"],
    substitutions: ["easy-run"]
  },
  {
    id: "row-erg",
    name: "Rowing Machine",
    pattern: "conditioning",
    primary: ["cardio", "back"],
    secondary: ["legs"],
    equipment: ["full_gym"],
    difficulty: 2,
    instructions: [
      "Drive with the legs, then lean back and pull.",
      "Return arms, then torso, then knees.",
      "Keep a smooth, steady stroke rate."
    ],
    tags: ["conditioning"],
    substitutions: ["easy-run", "brisk-walk"]
  }
];

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e])
);

export function exercisesFor(equipment: Exercise["equipment"][number]): Exercise[] {
  return EXERCISES.filter((e) => e.equipment.includes(equipment));
}
