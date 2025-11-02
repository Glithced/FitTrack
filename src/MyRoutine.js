import React, { useState, useEffect } from "react";
import base44 from "./api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Trash2, Edit2, Save, X, Dumbbell } from "lucide-react";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import ExercisePicker from "./Components/routine/ExercisePicker";
import { toast } from "sonner";

export default function MyRoutines() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workoutType, setWorkoutType] = useState("custom");
  const [difficulty, setDifficulty] = useState("beginner");
  const [exercises, setExercises] = useState([]);

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

  const { data: workoutPlans = [], isLoading } = useQuery({
    queryKey: ["workout-plans", user?.email],
    queryFn: () =>
      user ? base44.entities.WorkoutPlan.filter({ user_email: user.email }, "-created_date") : [],
    enabled: !!user,
    initialData: [],
  });

  const createPlanMutation = useMutation({
    mutationFn: (planData) => base44.entities.WorkoutPlan.create(planData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      resetForm();
      toast.success("Routine created successfully!");
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WorkoutPlan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      resetForm();
      toast.success("Routine updated successfully!");
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id) => base44.entities.WorkoutPlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      toast.success("Routine deleted successfully!");
    },
  });

  const resetForm = () => {
    setIsCreating(false);
    setEditingPlan(null);
    setName("");
    setDescription("");
    setWorkoutType("custom");
    setDifficulty("beginner");
    setExercises([]);
  };

  const handleAddExercise = (exercise) => {
    setExercises([...exercises, exercise]);
  };

  const handleRemoveExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleUpdateExercise = (index, field, value) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleSavePlan = async () => {
    if (!name || exercises.length === 0) {
      toast.error("Please add a name and at least one exercise");
      return;
    }

    const totalDuration = exercises.reduce((sum, ex) => {
      const exerciseTime = (ex.sets || 1) * ((ex.reps || 0) * 2 + (ex.duration_seconds || 0) + (ex.rest_seconds || 0));
      return sum + Math.ceil(exerciseTime / 60);
    }, 0);

    const planData = {
      user_email: user.email,
      name,
      description,
      workout_type: workoutType,
      difficulty,
      duration_minutes: totalDuration,
      exercises,
    };

    if (editingPlan) {
      await updatePlanMutation.mutateAsync({ id: editingPlan.id, data: planData });
    } else {
      await createPlanMutation.mutateAsync(planData);
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setIsCreating(true);
    setName(plan.name);
    setDescription(plan.description || "");
    setWorkoutType(plan.workout_type);
    setDifficulty(plan.difficulty);
    setExercises(plan.exercises || []);
  };

  const handleStartWorkout = (plan) => {
    navigate(createPageUrl(`WorkoutSession?id=${plan.id}&type=plan`));
  };

  if (isCreating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-slate-900">
              {editingPlan ? "Edit Routine" : "Create Custom Routine"}
            </h1>
            <Button variant="outline" onClick={resetForm}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card className="p-6 border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Routine Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2">Name</Label>
                    <Input
                      placeholder="e.g., Morning Power Session"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="mb-2">Description (optional)</Label>
                    <Textarea
                      placeholder="What's this routine for?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="mb-2">Workout Type</Label>
                    <Select value={workoutType} onValueChange={setWorkoutType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="strength">Strength</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                        <SelectItem value="yoga">Yoga</SelectItem>
                        <SelectItem value="hiit">HIIT</SelectItem>
                        <SelectItem value="full_body">Full Body</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-2">Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <ExercisePicker onAddExercise={handleAddExercise} />
            </div>

            <div>
              <Card className="p-6 border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    Exercises ({exercises.length})
                  </h2>
                  <Button
                    onClick={handleSavePlan}
                    disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Routine
                  </Button>
                </div>

                {exercises.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Dumbbell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No exercises added yet</p>
                    <p className="text-sm">Use the exercise picker to add some</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {exercises.map((exercise, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-slate-900">{exercise.name}</h3>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveExercise(idx)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs mb-1">Sets</Label>
                            <Input
                              type="number"
                              min="1"
                              value={exercise.sets || ""}
                              onChange={(e) =>
                                handleUpdateExercise(idx, "sets", parseInt(e.target.value))
                              }
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs mb-1">Reps</Label>
                            <Input
                              type="number"
                              min="1"
                              value={exercise.reps || ""}
                              onChange={(e) =>
                                handleUpdateExercise(idx, "reps", parseInt(e.target.value))
                              }
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs mb-1">Duration (s)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={exercise.duration_seconds || ""}
                              onChange={(e) =>
                                handleUpdateExercise(idx, "duration_seconds", parseInt(e.target.value))
                              }
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs mb-1">Rest (s)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={exercise.rest_seconds || ""}
                              onChange={(e) =>
                                handleUpdateExercise(idx, "rest_seconds", parseInt(e.target.value))
                              }
                              className="h-8"
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <Label className="text-xs mb-1">Instructions (optional)</Label>
                          <Textarea
                            value={exercise.instructions || ""}
                            onChange={(e) =>
                              handleUpdateExercise(idx, "instructions", e.target.value)
                            }
                            rows={2}
                            className="text-sm"
                            placeholder="Form tips, variations..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20 md:pb-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Routines</h1>
              <p className="text-white/90">Create and manage your custom workout plans</p>
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-white text-blue-600 hover:bg-white/90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Routine
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : workoutPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workoutPlans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                      {plan.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">{plan.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4 flex-wrap">
                    <Badge variant="outline" className="capitalize">
                      {plan.workout_type}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {plan.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {plan.duration_minutes} min
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-slate-600">
                      {plan.exercises?.length || 0} exercises
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStartWorkout(plan)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      Start
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deletePlanMutation.mutate(plan.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Dumbbell className="w-20 h-20 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No routines yet</h3>
            <p className="text-slate-600 mb-6">
              Create your first custom workout routine
            </p>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Routine
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}