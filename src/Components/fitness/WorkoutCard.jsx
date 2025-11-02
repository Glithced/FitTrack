import React from "react";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Clock, Flame, Dumbbell, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function WorkoutCard({ workout }) {
  const navigate = useNavigate();

  const difficultyColors = {
    beginner: "bg-green-100 text-green-700 border-green-200",
    intermediate: "bg-yellow-100 text-yellow-700 border-yellow-200",
    advanced: "bg-red-100 text-red-700 border-red-200",
  };

  const typeColors = {
    strength: "bg-blue-100 text-blue-700",
    cardio: "bg-orange-100 text-orange-700",
    yoga: "bg-purple-100 text-purple-700",
    hiit: "bg-red-100 text-red-700",
    flexibility: "bg-pink-100 text-pink-700",
    full_body: "bg-indigo-100 text-indigo-700",
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-slate-200">
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
        {workout.image_url ? (
          <img
            src={workout.image_url}
            alt={workout.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Dumbbell className="w-16 h-16 text-slate-400" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge className={difficultyColors[workout.difficulty] || difficultyColors.beginner}>
            {workout.difficulty}
          </Badge>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Badge className={typeColors[workout.workout_type]}>
            {workout.workout_type}
          </Badge>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">
          {workout.name}
        </h3>
        
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {workout.description}
        </p>
        
        <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{workout.duration_minutes} min</span>
          </div>
          {workout.calories_estimate && (
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{workout.calories_estimate} cal</span>
            </div>
          )}
        </div>

        {workout.equipment && workout.equipment.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-1">Equipment:</p>
            <div className="flex flex-wrap gap-1">
              {workout.equipment.slice(0, 3).map((item, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
              {workout.equipment.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{workout.equipment.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        <Button
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
          onClick={() => navigate(createPageUrl(`WorkoutSession?id=${workout.id}`))}
        >
          <Play className="w-4 h-4 mr-2" />
          Start Workout
        </Button>
      </div>
    </Card>
  );
}