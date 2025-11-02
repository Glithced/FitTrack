import React, { useState } from "react";
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Plus, Search } from "lucide-react";

const commonExercises = [
  { name: "Push-ups", category: "strength", muscleGroup: "chest" },
  { name: "Squats", category: "strength", muscleGroup: "legs" },
  { name: "Lunges", category: "strength", muscleGroup: "legs" },
  { name: "Plank", category: "core", muscleGroup: "core" },
  { name: "Burpees", category: "cardio", muscleGroup: "full_body" },
  { name: "Mountain Climbers", category: "cardio", muscleGroup: "core" },
  { name: "Pull-ups", category: "strength", muscleGroup: "back" },
  { name: "Dumbbell Rows", category: "strength", muscleGroup: "back" },
  { name: "Bench Press", category: "strength", muscleGroup: "chest" },
  { name: "Deadlifts", category: "strength", muscleGroup: "legs" },
  { name: "Bicep Curls", category: "strength", muscleGroup: "arms" },
  { name: "Tricep Dips", category: "strength", muscleGroup: "arms" },
  { name: "Jumping Jacks", category: "cardio", muscleGroup: "full_body" },
  { name: "High Knees", category: "cardio", muscleGroup: "legs" },
  { name: "Sit-ups", category: "core", muscleGroup: "core" },
  { name: "Russian Twists", category: "core", muscleGroup: "core" },
  { name: "Leg Raises", category: "core", muscleGroup: "core" },
  { name: "Side Plank", category: "core", muscleGroup: "core" },
  { name: "Jump Squats", category: "cardio", muscleGroup: "legs" },
  { name: "Box Jumps", category: "cardio", muscleGroup: "legs" },
];

export default function ExercisePicker({ onAddExercise }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredExercises = commonExercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "strength", "cardio", "core"];

  return (
    <Card className="p-4 border-slate-200">
      <h3 className="font-semibold text-slate-900 mb-4">Add Exercises</h3>
      
      <div className="mb-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className={`cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-100"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredExercises.map((exercise, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div>
              <p className="font-medium text-slate-900">{exercise.name}</p>
              <p className="text-xs text-slate-500 capitalize">
                {exercise.category} • {exercise.muscleGroup.replace("_", " ")}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                onAddExercise({
                  name: exercise.name,
                  sets: 3,
                  reps: 10,
                  rest_seconds: 60,
                  instructions: "",
                })
              }
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}