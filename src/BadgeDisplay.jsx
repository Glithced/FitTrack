import React from "react";
import { Trophy, Award, Target, Zap, Star, Crown } from "lucide-react";
import { Card } from "./ui/card";

const badgeIcons = {
  first_workout: Trophy,
  week_warrior: Award,
  streak_master: Zap,
  consistency_king: Target,
  milestone_achiever: Star,
  elite_performer: Crown,
};

const badgeDescriptions = {
  first_workout: "Completed your first workout",
  week_warrior: "Completed 7 workouts in a week",
  streak_master: "Maintained a 7-day streak",
  consistency_king: "Worked out 4 weeks in a row",
  milestone_achiever: "Completed 50 workouts",
  elite_performer: "Reached advanced fitness level",
};

export default function BadgeDisplay({ badges = [] }) {
  const allBadges = [
    "first_workout",
    "week_warrior",
    "streak_master",
    "consistency_king",
    "milestone_achiever",
    "elite_performer",
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {allBadges.map((badge) => {
        const Icon = badgeIcons[badge];
        const earned = badges.includes(badge);
        
        return (
          <Card
            key={badge}
            className={`p-4 text-center transition-all duration-300 ${
              earned
                ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg"
                : "bg-slate-50 border-slate-200 opacity-50"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                earned
                  ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                  : "bg-slate-300"
              }`}
            >
              <Icon className={`w-6 h-6 ${earned ? "text-white" : "text-slate-500"}`} />
            </div>
            <h4 className={`text-sm font-semibold mb-1 ${earned ? "text-slate-900" : "text-slate-500"}`}>
              {badge.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
            </h4>
            <p className="text-xs text-slate-600">
              {badgeDescriptions[badge]}
            </p>
          </Card>
        );
      })}
    </div>
  );
}