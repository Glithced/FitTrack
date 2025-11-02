import React from "react";
import { Card } from "../../ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ title, value, icon: Icon, trend, trendDirection, color = "blue" }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <Card className="relative overflow-hidden border-slate-200 hover:shadow-lg transition-all duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full transform translate-x-12 -translate-y-12`} />
      <div className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trendDirection === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-semibold">{trend}</span>
            </div>
          )}
        </div>
        <p className="text-slate-500 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
    </Card>
  );
}