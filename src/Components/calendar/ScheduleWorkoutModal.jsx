import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Checkbox } from "../../ui/checkbox";
import { Badge } from "../../ui/badge";
import { format } from "date-fns";

export default function ScheduleWorkoutModal({
  open,
  onClose,
  selectedDate,
  availableWorkouts = [],
  customPlans = [],
  onSchedule,
  isLoading,
}) {
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [sourceType, setSourceType] = useState("library");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [recurrencePattern, setRecurrencePattern] = useState("none");
  const [recurrenceDays, setRecurrenceDays] = useState([]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");

  const workoutList = sourceType === "library" ? availableWorkouts : customPlans;

  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const toggleRecurrenceDay = (day) => {
    if (recurrenceDays.includes(day)) {
      setRecurrenceDays(recurrenceDays.filter((d) => d !== day));
    } else {
      setRecurrenceDays([...recurrenceDays, day]);
    }
  };

  const handleSchedule = () => {
    if (!selectedWorkout) return;

    const workout = workoutList.find((w) => w.id === selectedWorkout);
    if (!workout) return;

    onSchedule({
      workout_id: workout.id,
      workout_name: workout.name,
      workout_type: workout.workout_type,
      source_type: sourceType,
      scheduled_date: format(selectedDate, "yyyy-MM-dd"),
      scheduled_time: scheduledTime,
      duration_minutes: workout.duration_minutes,
      notes,
      reminder_enabled: reminderEnabled,
      recurrence_pattern: recurrencePattern,
      recurrence_days: recurrencePattern === "weekly" ? recurrenceDays : [],
      recurrence_end_date: recurrencePattern !== "none" ? recurrenceEndDate : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Schedule Workout - {format(selectedDate, "MMMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label className="mb-2">Workout Source</Label>
            <div className="flex gap-2">
              <Button
                variant={sourceType === "library" ? "default" : "outline"}
                onClick={() => {
                  setSourceType("library");
                  setSelectedWorkout(null);
                }}
                className="flex-1"
              >
                Workout Library
              </Button>
              <Button
                variant={sourceType === "custom_plan" ? "default" : "outline"}
                onClick={() => {
                  setSourceType("custom_plan");
                  setSelectedWorkout(null);
                }}
                className="flex-1"
              >
                My Routines
              </Button>
            </div>
          </div>

          <div>
            <Label className="mb-2">Select Workout</Label>
            <Select value={selectedWorkout} onValueChange={setSelectedWorkout}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a workout..." />
              </SelectTrigger>
              <SelectContent>
                {workoutList.map((workout) => (
                  <SelectItem key={workout.id} value={workout.id}>
                    {workout.name} ({workout.duration_minutes} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2">Time</Label>
            <Input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-2">Recurrence</Label>
            <Select value={recurrencePattern} onValueChange={setRecurrencePattern}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">One-time only</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recurrencePattern === "weekly" && (
            <div>
              <Label className="mb-2">Repeat on</Label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <Badge
                    key={day}
                    variant={recurrenceDays.includes(day) ? "default" : "outline"}
                    className={`cursor-pointer px-3 py-1 ${
                      recurrenceDays.includes(day)
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-100"
                    }`}
                    onClick={() => toggleRecurrenceDay(day)}
                  >
                    {day.substring(0, 3).toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {recurrencePattern !== "none" && (
            <div>
              <Label className="mb-2">End Date</Label>
              <Input
                type="date"
                value={recurrenceEndDate}
                onChange={(e) => setRecurrenceEndDate(e.target.value)}
                min={format(selectedDate, "yyyy-MM-dd")}
              />
            </div>
          )}

          <div>
            <Label className="mb-2">Notes (optional)</Label>
            <Textarea
              placeholder="Any reminders or goals for this workout..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="reminder"
              checked={reminderEnabled}
              onCheckedChange={setReminderEnabled}
            />
            <label
              htmlFor="reminder"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Send me a reminder before this workout
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!selectedWorkout || isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isLoading ? "Scheduling..." : "Schedule Workout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}