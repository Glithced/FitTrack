import React, { useState, useEffect } from "react";
import base44 from "./api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { User, Target, Award, Settings, Zap } from "lucide-react";
import { Badge } from "./ui/badge";
import BadgeDisplay from "./BadgeDisplay";
import { toast } from "sonner";

export default function Profile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [fitnessLevel, setFitnessLevel] = useState("beginner");
  const [weeklyTarget, setWeeklyTarget] = useState(3);
  const [selectedGoals, setSelectedGoals] = useState([]);

  const goalOptions = [
    { value: "lose_weight", label: "Lose Weight" },
    { value: "build_muscle", label: "Build Muscle" },
    { value: "improve_endurance", label: "Improve Endurance" },
    { value: "flexibility", label: "Flexibility" },
    { value: "general_fitness", label: "General Fitness" },
  ];

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

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile", user?.email],
    queryFn: async () => {
      if (!user) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      if (profiles.length > 0) {
        const p = profiles[0];
        setFitnessLevel(p.fitness_level || "beginner");
        setWeeklyTarget(p.weekly_target || 3);
        setSelectedGoals(p.goals || []);
        return p;
      }
      return null;
    },
    enabled: !!user,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["workout-sessions", user?.email],
    queryFn: () =>
      user ? base44.entities.WorkoutSession.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: [],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (profile) {
        return await base44.entities.UserProfile.update(profile.id, data);
      } else {
        return await base44.entities.UserProfile.create({
          ...data,
          user_email: user.email,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Profile updated successfully!");
    },
  });

  const handleSaveProfile = async () => {
    await updateProfileMutation.mutateAsync({
      fitness_level: fitnessLevel,
      weekly_target: weeklyTarget,
      goals: selectedGoals,
    });
  };

  const toggleGoal = (goal) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const totalCalories = sessions.reduce((sum, s) => sum + (s.calories_burned || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-3xl font-bold">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user?.full_name || "Athlete"}</h1>
              <p className="text-white/90">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Total Workouts</p>
                <p className="text-2xl font-bold text-slate-900">
                  {profile?.total_workouts || sessions.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Total Calories</p>
                <p className="text-2xl font-bold text-slate-900">
                  {totalCalories.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Badges Earned</p>
                <p className="text-2xl font-bold text-slate-900">
                  {profile?.badges_earned?.length || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Fitness Settings */}
        <Card className="p-6 border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Fitness Settings
          </h2>

          <div className="space-y-6">
            <div>
              <Label className="mb-2">Fitness Level</Label>
              <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
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

            <div>
              <Label className="mb-2">Weekly Target (workouts per week)</Label>
              <Input
                type="number"
                min="1"
                max="7"
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(parseInt(e.target.value))}
              />
            </div>

            <div>
              <Label className="mb-3">Fitness Goals</Label>
              <div className="flex flex-wrap gap-2">
                {goalOptions.map((goal) => (
                  <Badge
                    key={goal.value}
                    variant={selectedGoals.includes(goal.value) ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 ${
                      selectedGoals.includes(goal.value)
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "hover:bg-slate-100"
                    }`}
                    onClick={() => toggleGoal(goal.value)}
                  >
                    {goal.label}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </Card>

        {/* Achievements */}
        {profile?.badges_earned && (
          <Card className="p-6 border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-600" />
              Your Achievements
            </h2>
            <BadgeDisplay badges={profile.badges_earned} />
          </Card>
        )}
      </div>
    </div>
  );
}