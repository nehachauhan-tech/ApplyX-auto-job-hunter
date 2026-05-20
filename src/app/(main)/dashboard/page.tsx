import { createClient } from "@/lib/supabase/server";
import {
  Briefcase,
  Send,
  Eye,
  MessageSquare,
  TrendingUp,
  Calendar,
  Target,
  Sparkles,
  ArrowRight,
  Building2,
  MapPin,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  const { data: applications } = await supabase
    .from("applications")
    .select("*, jobs(*)")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: totalApplications } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id);

  const { count: appliedCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)
    .eq("status", "applied");

  const { count: interviewCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)
    .eq("status", "interview");

  const { count: viewedCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)
    .eq("status", "viewed");

  const stats = [
    {
      name: "Total Applications",
      value: totalApplications || 0,
      icon: Send,
      color: "bg-primary-100 text-primary-600",
      trend: "+12% this week",
    },
    {
      name: "Applied",
      value: appliedCount || 0,
      icon: Briefcase,
      color: "bg-blue-100 text-blue-600",
      trend: "Active",
    },
    {
      name: "Profile Views",
      value: viewedCount || 0,
      icon: Eye,
      color: "bg-green-100 text-green-600",
      trend: "+5 today",
    },
    {
      name: "Interviews",
      value: interviewCount || 0,
      icon: MessageSquare,
      color: "bg-accent-gold/20 text-accent-gold",
      trend: "Scheduled",
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-600",
      pending: "bg-yellow-100 text-yellow-700",
      applied: "bg-blue-100 text-blue-700",
      viewed: "bg-purple-100 text-purple-700",
      in_review: "bg-indigo-100 text-indigo-700",
      interview: "bg-green-100 text-green-700",
      offer: "bg-accent-green/20 text-accent-green",
      rejected: "bg-red-100 text-red-700",
      withdrawn: "bg-gray-100 text-gray-600",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
            </h1>
            <p className="text-primary-100">
              {profile?.headline || "Ready to find your dream job?"}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-700 rounded-xl font-medium hover:bg-primary-50 transition-colors"
            >
              <Target className="w-5 h-5" />
              Find Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl p-5 border border-primary-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs text-dark-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-dark-700">{stat.value}</p>
              <p className="text-sm text-dark-400">{stat.name}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-primary-100">
          <div className="flex items-center justify-between p-5 border-b border-primary-100">
            <h2 className="text-lg font-semibold text-dark-700">Recent Applications</h2>
            <Link
              href="/applications"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {applications && applications.length > 0 ? (
            <div className="divide-y divide-primary-50">
              {applications.map((app) => (
                <div key={app.id} className="p-5 hover:bg-cream-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-dark-700 truncate">
                            {app.jobs?.title || "Job Title"}
                          </h3>
                          <p className="text-sm text-dark-400">
                            {app.jobs?.company_name || "Company"}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {app.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-dark-300">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {app.jobs?.location || "Remote"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(app.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="font-medium text-dark-700 mb-1">No applications yet</h3>
              <p className="text-sm text-dark-400 mb-4">
                Start applying to jobs to track your progress here
              </p>
              <Link href="/jobs" className="btn-primary inline-flex items-center gap-2">
                Browse Jobs
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions & Tips */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-primary-100 p-5">
            <h2 className="text-lg font-semibold text-dark-700 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/resumes"
                className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 hover:bg-primary-50 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-dark-700">Optimize Resume</p>
                  <p className="text-xs text-dark-400">AI-powered ATS optimization</p>
                </div>
              </Link>

              <Link
                href="/jobs"
                className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 hover:bg-primary-50 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-dark-700">Find Jobs</p>
                  <p className="text-xs text-dark-400">Browse matching opportunities</p>
                </div>
              </Link>

              <Link
                href="/connections"
                className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 hover:bg-primary-50 transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-dark-700">Connect Platforms</p>
                  <p className="text-xs text-dark-400">Link LinkedIn, Indeed & more</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-accent-gold/10 to-primary-50 rounded-xl p-5 border border-primary-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-accent-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-accent-gold" />
              </div>
              <div>
                <h3 className="font-medium text-dark-700 mb-1">Pro Tip</h3>
                <p className="text-sm text-dark-400">
                  Upload your resume to get AI-powered suggestions and improve your ATS score by up to 40%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
