import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Home, Dumbbell, User, Menu, X, Zap, Trophy, Calendar as CalendarIcon, Plus } from "lucide-react";
import base44 from "./api/base44Client";
import { Button } from "./ui/button";

const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("Home"),
    icon: Home,
  },
  {
    title: "Workouts",
    url: createPageUrl("Workouts"),
    icon: Dumbbell,
  },
  {
    title: "Calendar",
    url: createPageUrl("Calendar"),
    icon: CalendarIcon,
  },
  {
    title: "My Routines",
    url: createPageUrl("MyRoutines"),
    icon: Plus,
  },
  {
    title: "Profile",
    url: createPageUrl("Profile"),
    icon: User,
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

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

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <style>
        {`
          :root {
            --primary-500: #3b82f6;
            --primary-600: #2563eb;
            --primary-700: #1d4ed8;
            --accent-500: #8b5cf6;
            --accent-600: #7c3aed;
            --success-500: #10b981;
            --warning-500: #f59e0b;
          }
        `}
      </style>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex-col z-50">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">FitTrack</h2>
              <p className="text-xs text-slate-500">Train Smarter</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.title}
                to={item.url}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          {user && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 text-sm truncate">
                  {user.full_name || "User"}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full"
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 px-4 py-3 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-bold text-slate-900">FitTrack</h2>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-700" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg">
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
            {user && (
              <div className="p-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="md:ml-64 pt-16 md:pt-0 min-h-screen">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 z-40">
        <div className="flex justify-around">
          {navigationItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.title}
                to={item.url}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive ? "text-blue-600" : "text-slate-500"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}