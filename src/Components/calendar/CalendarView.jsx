import React, { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";

export default function CalendarView({ scheduledWorkouts = [], onDateClick, onAddWorkout }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getWorkoutsForDate = (date) => {
    return scheduledWorkouts.filter((workout) =>
      isSameDay(new Date(workout.scheduled_date), date)
    );
  };

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <Card className="p-6 border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-slate-600 p-2">
            {day}
          </div>
        ))}

        {calendarDays.map((day, idx) => {
          const dayWorkouts = getWorkoutsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);

          return (
            <button
              key={idx}
              onClick={() => onDateClick(day)}
              className={`min-h-24 p-2 rounded-lg border transition-all ${
                isCurrentMonth ? "bg-white" : "bg-slate-50"
              } ${
                isCurrentDay
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-slate-200 hover:border-blue-300"
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonth ? "text-slate-900" : "text-slate-400"
              } ${isCurrentDay ? "text-blue-600 font-bold" : ""}`}>
                {format(day, "d")}
              </div>
              
              <div className="space-y-1">
                {dayWorkouts.slice(0, 2).map((workout, widx) => (
                  <div
                    key={widx}
                    className={`text-xs px-2 py-1 rounded truncate ${
                      workout.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : workout.status === "skipped"
                        ? "bg-slate-100 text-slate-500"
                        : "bg-blue-100 text-blue-700"
                    }`}
                    title={workout.workout_name}
                  >
                    {workout.scheduled_time && `${workout.scheduled_time} `}
                    {workout.workout_name.substring(0, 10)}
                  </div>
                ))}
                {dayWorkouts.length > 2 && (
                  <div className="text-xs text-slate-500">
                    +{dayWorkouts.length - 2} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}