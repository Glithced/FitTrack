import { useQuery } from '@tanstack/react-query';
import base44 from '../api/base44Client';
import { createPageUrl } from '../utils';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';

import {
  Dumbbell,
  Flame,
  Trophy,
  TrendingUp,
  Calendar,
  Zap,
  Play,
  Award,
} from "lucide-react";

import { format, startOfWeek, endOfWeek, isWithinInterval, addDays, isSameDay } from "date-fns";

// fixed paths
import StatCard from '../Components/fitness/StatCard';
import BadgeDisplay from '../BadgeDisplay';

export default function Home() {
  const [user, setUser] = useState(null);
  const [motivationalQuote, setMotivationalQuote] = useState("");

  useEffect(() => {
    const quotes = [
      "The only bad workout is the one you didn't do.",
      "Your body can stand almost anything. It's your mind you have to convince.",
      "Success starts with self-discipline.",
      "Push yourself because no one else is going to do it for you.",
      "Great things never come from comfort zones.",
      "The difference between try and triumph is a little umph.",
      "Don't stop when you're tired. Stop when you're done.",
    ];

    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
    setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const { data: sessions = [] } = useQuery({
    queryKey: ["workout-sessions", user?.email],
    queryFn: () =>
      user ? base44.entities.WorkoutSession.filter({ user_email: user.email }, "-created_date") : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: profile } = useQuery({
    queryKey: ["user-profile", user?.email],
    queryFn: async () => {
      if (!user) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user,
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => base44.entities.Workout.list(),
    initialData: [],
  });

  const { data: scheduledWorkouts = [] } = useQuery({
    queryKey: ["scheduled-workouts", user?.email],
    queryFn: () =>
      user
        ? base44.entities.ScheduledWorkout.filter({ user_email: user.email }, "scheduled_date")
        : [],
    enabled: !!user,
    initialData: [],
  });

  const thisWeekSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.completed_date);
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
  });

  const totalCalories = sessions.reduce((sum, s) => sum + (s.calories_burned || 0), 0);
  const avgDuration = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / sessions.length)
    : 0;

  const recommendedWorkouts = workouts
    .filter((w) => !profile || w.difficulty === profile.fitness_level)
    .slice(0, 3);

  const todayScheduled = scheduledWorkouts.filter(
    (w) =>
      w.status === "scheduled" && isSameDay(new Date(w.scheduled_date), new Date())
  );

  const upcomingScheduled = scheduledWorkouts
    .filter(
      (w) =>
        w.status === "scheduled" &&
        new Date(w.scheduled_date) > new Date() &&
        new Date(w.scheduled_date) <= addDays(new Date(), 7)
    )
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform -translate-x-32 translate-y-32" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome back, {user?.full_name || "Athlete"}! 💪
            </h1>
            <p className="text-xl text-white/90 mb-6 italic">
              "{motivationalQuote}"
            </p>
            {profile?.current_streak > 0 && (
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="font-semibold text-lg">
                  {profile.current_streak} Day Streak! 🔥
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="This Week"
            value={`${thisWeekSessions.length}/${profile?.weekly_target || 3}`}
            icon={Calendar}
            color="blue"
            trend={thisWeekSessions.length > 0 ? `${thisWeekSessions.length} workouts` : null}
            trendDirection="up"
          />
          <StatCard
            title="Total Workouts"
            value={profile?.total_workouts || sessions.length}
            icon={Dumbbell}
            color="purple"
          />
          <StatCard
            title="Calories Burned"
            value={totalCalories.toLocaleString()}
            icon={Flame}
            color="orange"
          />
          <StatCard
            title="Avg Duration"
            value={`${avgDuration} min`}
            icon={TrendingUp}
            color="green"
          />
        </div>

        {/* Today's Scheduled Workouts */}
        {todayScheduled.length > 0 && (
          <Card className="p-6 border-slate-200 bg-gradient-to-br from-blue-50 to-purple-50">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Today's Workouts
            </h2>
            <div className="grid gap-3">
              {todayScheduled.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{workout.workout_name}</p>
                      <p className="text-sm text-slate-600">
                        {workout.scheduled_time} • {workout.duration_minutes} min
                      </p>
                    </div>
                  </div>
                  <Link
                    to={createPageUrl(
                      `WorkoutSession?id=${workout.workout_id}&type=${
                        workout.source_type === "custom_plan" ? "plan" : "library"
                      }`
                    )}
                  >
                    <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Play className="w-6 h-6 text-blue-600" />
                Quick Start
              </h2>
              <p className="text-slate-600">Jump right into a workout</p>
            </div>
            <Link to={createPageUrl("Workouts")}>
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedWorkouts.map((workout) => (
              <Link
                key={workout.id}
                to={createPageUrl(`WorkoutSession?id=${workout.id}`)}
                className="group"
              >
                <Card className="p-4 hover:shadow-lg transition-all duration-300 border-slate-200 cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100">
                      <Dumbbell className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-xs text-slate-500">{workout.duration_minutes} min</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">
                    {workout.name}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {workout.workout_type} • {workout.difficulty}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </Card>

        {/* Upcoming This Week */}
        {upcomingScheduled.length > 0 && (
          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Coming Up This Week</h2>
              <Link to={createPageUrl("Calendar")}>
                <Button variant="outline" size="sm">
                  View Calendar
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {upcomingScheduled.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-900">{workout.workout_name}</p>
                    <p className="text-sm text-slate-600">
                      {format(new Date(workout.scheduled_date), "EEEE, MMM d")} at{" "}
                      {workout.scheduled_time}
                    </p>
                  </div>
                  <Badge variant="outline">{workout.duration_minutes} min</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Activity */}
        {sessions.length > 0 && (
          <Card className="p-6 border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{session.workout_name}</p>
                      <p className="text-sm text-slate-600">
                        {format(new Date(session.completed_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      {session.duration_minutes} min
                    </p>
                    <p className="text-sm text-orange-600">
                      {session.calories_burned} cal
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Achievements */}
        {profile?.badges_earned && profile.badges_earned.length > 0 && (
          <Card className="p-6 border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
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