"use client";

import { Bell, Search, Menu } from "lucide-react";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
}

interface HeaderProps {
  user: User;
  profile: Profile | null;
}

export default function Header({ profile }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-primary-100">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Mobile Menu Button */}
        <button className="lg:hidden p-2 rounded-lg hover:bg-primary-50">
          <Menu className="w-6 h-6 text-dark-600" />
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs, companies, applications..."
              className="w-full pl-12 pr-4 py-2.5 bg-cream-50 border border-primary-100 rounded-xl text-dark-700 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-primary-50 transition-colors">
            <Bell className="w-6 h-6 text-dark-400" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent-coral rounded-full border-2 border-white" />
          </button>

          {/* Profile Quick Access (Desktop) */}
          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-primary-100">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
              {profile?.full_name?.charAt(0) || "U"}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-dark-700">{profile?.full_name || "User"}</p>
              <p className="text-xs text-dark-400 truncate max-w-[150px]">
                {profile?.headline || "Job Seeker"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
