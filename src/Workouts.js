import React, { useState } from "react";
import base44 from "./api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Search, Filter, Dumbbell } from "lucide-react";
import WorkoutCard from "./Components/fitness/WorkoutCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export default function Workouts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => base44.entities.Workout.list(),
    initialData: [],
  });

  const filteredWorkouts = workouts.filter((workout) => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || workout.workout_type === typeFilter;
    const matchesDifficulty = difficultyFilter === "all" || workout.difficulty === difficultyFilter;
    
    return matchesSearch && matchesType && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Dumbbell className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Workout Library</h1>
              <p className="text-white/90">Choose your next challenge</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search workouts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4">
            <Tabs value={typeFilter} onValueChange={setTypeFilter}>
              <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="strength">Strength</TabsTrigger>
                <TabsTrigger value="cardio">Cardio</TabsTrigger>
                <TabsTrigger value="yoga">Yoga</TabsTrigger>
                <TabsTrigger value="hiit">HIIT</TabsTrigger>
                <TabsTrigger value="flexibility">Flexibility</TabsTrigger>
                <TabsTrigger value="full_body">Full Body</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-slate-600">
            {filteredWorkouts.length} workout{filteredWorkouts.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Workout Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : filteredWorkouts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Dumbbell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No workouts found</h3>
            <p className="text-slate-600">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}