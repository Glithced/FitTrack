
import React, { useState, useEffect } from "react";
import base44 from "./api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  Play,
  Pause,
  Check,
  ArrowLeft,
  Timer,
  Flame,
  Trophy,
  Plus,
  Minus,
} from "lucide-react";
import { format } from "date-fns";

export default function WorkoutSession() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const workoutId = urlParams.get("id");
  const workoutType = urlParams.get("type") || "library"; // Added workoutType from URL params

  const [user, setUser] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const { data: workout } = useQuery({
    queryKey: ["workout", workoutId, workoutType], // Added workoutType to queryKey
    queryFn: async () => {
      if (workoutType === "plan") {
        const plans = await base44.entities.WorkoutPlan.filter({ id: workoutId });
        return plans[0];
      } else {
        const workouts = await base44.entities.Workout.filter({ id: workoutId });
        return workouts[0];
      }
    },
    enabled: !!workoutId,
  });

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const saveSessionMutation = useMutation({
    mutationFn: async (sessionData) => {
      const session = await base44.entities.WorkoutSession.create(sessionData);
      
      // Update user profile
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      if (profiles.length > 0) {
        const profile = profiles[0];
        const newTotal = (profile.total_workouts || 0) + 1;
        const badges = profile.badges_earned || [];
        
        // Award badges
        if (newTotal === 1 && !badges.includes("first_workout")) {
          badges.push("first_workout");
        }
        if (newTotal === 50 && !badges.includes("milestone_achiever")) {
          badges.push("milestone_achiever");
        }
        
        await base44.entities.UserProfile.update(profile.id, {
          total_workouts: newTotal,
          badges_earned: badges,
        });
      }
      
      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });

  const handleStartWorkout = () => {
    setSessionStarted(true);
    setIsTimerRunning(true);
  };

  const handleCompleteExercise = (exercise) => {
    setCompletedExercises([...completedExercises, {
      name: exercise.name,
      sets_completed: exercise.sets || 1,
      reps_completed: exercise.reps || 0,
    }]);
    
    if (currentExerciseIndex < (workout.exercises?.length || 0) - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
}

  const handleEndSession = async () => {
    setIsTimerRunning(false);
    setSessionComplete(true);

    const sessionData = {
      user_email: user?.email,
      workout_id: workoutId,
      workout_name: workout?.name || "",
      duration_minutes: Math.round(timeElapsed / 60),
      completed_date: new Date().toISOString(),
      calories_burned: 0,
      notes,
      rating,
    };

    try {
      await saveSessionMutation.mutateAsync(sessionData);
      navigate(createPageUrl("Home"));
    } catch (err) {
      console.error("Error saving session", err);
    }
  };

  // Minimal UI so the component is usable
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-2">{workout?.name || "Workout Session"}</h1>
          <p className="text-sm text-slate-600 mb-4">{workout?.description}</p>

          <div className="mb-4">
            <p className="text-sm text-slate-500">Time Elapsed</p>
            <p className="text-2xl font-bold">{Math.floor(timeElapsed / 60)}:{String(timeElapsed % 60).padStart(2, '0')}</p>
            <Progress value={Math.min(100, (timeElapsed / ((workout?.duration_minutes || 10) * 60)) * 100)} className="mt-2" />
          </div>

          <div className="flex gap-2">
            {!sessionStarted ? (
              <Button onClick={handleStartWorkout} className="bg-blue-600 text-white">Start</Button>
            ) : (
              <>
                <Button onClick={() => setIsTimerRunning(!isTimerRunning)} className="bg-gray-200">{isTimerRunning ? 'Pause' : 'Resume'}</Button>
                <Button onClick={handleEndSession} className="bg-green-600 text-white">Finish</Button>
              </>
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </Card>
      </div>
    </div>
  );
}