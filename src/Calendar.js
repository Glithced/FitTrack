import React, { useState, useEffect } from "react";
import base44 from "./api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Plus, Calendar as CalendarIcon, CheckCircle, XCircle, Clock } from "lucide-react";
import CalendarView from "./Components/calendar/CalendarView";
import ScheduleWorkoutModal from "./Components/calendar/ScheduleWorkoutModal";
import { format, addDays, isSameDay } from "date-fns";
import { toast } from "sonner";
import { Badge } from "./ui/badge";

export default function Calendar() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

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

  const { data: scheduledWorkouts = [], isLoading } = useQuery({
    queryKey: ["scheduled-workouts", user?.email],
    queryFn: () =>
      user
        ? base44.entities.ScheduledWorkout.filter({ user_email: user.email }, "scheduled_date")
        : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => base44.entities.Workout.list(),
    initialData: [],
  });

  const { data: customPlans = [] } = useQuery({
    queryKey: ["workout-plans", user?.email],
    queryFn: () =>
      user ? base44.entities.WorkoutPlan.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: [],
  });

  const scheduleWorkoutMutation = useMutation({
    mutationFn: async (workoutData) => {
      const baseSchedule = {
        ...workoutData,
        user_email: user.email,
        status: "scheduled",
      };

      if (workoutData.recurrence_pattern === "none") {
        return await base44.entities.ScheduledWorkout.create(baseSchedule);
      }

      // Handle recurring schedules
      const schedules = [];
      const startDate = new Date(workoutData.scheduled_date);
      const endDate = workoutData.recurrence_end_date
        ? new Date(workoutData.recurrence_end_date)
        : addDays(startDate, 90);

      if (workoutData.recurrence_pattern === "daily") {
        let currentDate = startDate;
        while (currentDate <= endDate) {
          schedules.push({
            ...baseSchedule,
            scheduled_date: format(currentDate, "yyyy-MM-dd"),
          });
          currentDate = addDays(currentDate, 1);
        }
      } else if (workoutData.recurrence_pattern === "weekly") {
        const dayMap = {
          sunday: 0,
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
        };
        
        let currentDate = startDate;
        while (currentDate <= endDate) {
          const dayName = format(currentDate, "EEEE").toLowerCase();
          if (workoutData.recurrence_days.includes(dayName)) {
            schedules.push({
              ...baseSchedule,
              scheduled_date: format(currentDate, "yyyy-MM-dd"),
            });
          }
          currentDate = addDays(currentDate, 1);
        }
      } else if (workoutData.recurrence_pattern === "monthly") {
        let currentDate = startDate;
        while (currentDate <= endDate) {
          schedules.push({
            ...baseSchedule,
            scheduled_date: format(currentDate, "yyyy-MM-dd"),
          });
          currentDate = addDays(currentDate, 30);
        }
      }

      return await base44.entities.ScheduledWorkout.bulkCreate(schedules);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
      setIsScheduleModalOpen(false);
      toast.success("Workout scheduled successfully!");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      base44.entities.ScheduledWorkout.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
      toast.success("Status updated!");
    },
  });

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleScheduleWorkout = async (workoutData) => {
    await scheduleWorkoutMutation.mutateAsync(workoutData);
  };

  const selectedDateWorkouts = scheduledWorkouts.filter((workout) =>
    isSameDay(new Date(workout.scheduled_date), selectedDate)
  );

  const upcomingWorkouts = scheduledWorkouts
    .filter(
      (w) =>
        w.status === "scheduled" &&
        new Date(w.scheduled_date) >= new Date(format(new Date(), "yyyy-MM-dd"))
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20 md:pb-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Workout Calendar</h1>
              <p className="text-white/90">Plan and track your workout schedule</p>
            </div>
            <Button
              onClick={() => {
                setSelectedDate(new Date());
                setIsScheduleModalOpen(true);
              }}
              className="bg-white text-blue-600 hover:bg-white/90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Schedule Workout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CalendarView
              scheduledWorkouts={scheduledWorkouts}
              onDateClick={handleDateClick}
              onAddWorkout={() => setIsScheduleModalOpen(true)}
            />
          </div>

          <div className="space-y-6">
            {/* Selected Date Details */}
            <Card className="p-6 border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    {format(selectedDate, "MMMM d, yyyy")}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {selectedDateWorkouts.length} workout
                    {selectedDateWorkouts.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {selectedDateWorkouts.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">
                            {workout.workout_name}
                          </h4>
                          <p className="text-sm text-slate-600">
                            {workout.scheduled_time} • {workout.duration_minutes} min
                          </p>
                        </div>
                        <Badge
                          className={
                            workout.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : workout.status === "skipped"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-blue-100 text-blue-700"
                          }
                        >
                          {workout.status}
                        </Badge>
                      </div>

                      {workout.notes && (
                        <p className="text-sm text-slate-600 mb-3">{workout.notes}</p>
                      )}

                      {workout.status === "scheduled" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: workout.id,
                                status: "completed",
                              })
                            }
                            className="flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Done
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: workout.id,
                                status: "skipped",
                              })
                            }
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Skip
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No workouts scheduled</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="mt-3"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Workout
                  </Button>
                </div>
              )}
            </Card>

            {/* Upcoming Workouts */}
            <Card className="p-6 border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Upcoming Workouts</h3>
              {upcomingWorkouts.length > 0 ? (
                <div className="space-y-3">
                  {upcomingWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100"
                      onClick={() => setSelectedDate(new Date(workout.scheduled_date))}
                    >
                      <h4 className="font-medium text-slate-900 text-sm">
                        {workout.workout_name}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {format(new Date(workout.scheduled_date), "MMM d")} at{" "}
                        {workout.scheduled_time}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  No upcoming workouts scheduled
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>

      <ScheduleWorkoutModal
        open={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        selectedDate={selectedDate}
        availableWorkouts={workouts}
        customPlans={customPlans}
        onSchedule={handleScheduleWorkout}
        isLoading={scheduleWorkoutMutation.isPending}
      />
    </div>
  );
}