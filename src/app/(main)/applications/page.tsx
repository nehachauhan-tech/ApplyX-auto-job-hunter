import { createClient } from "@/lib/supabase/server";
import {
  Send,
  Building2,
  MapPin,
  Clock,
  Filter,
  ArrowUpDown,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
} from "lucide-react";

const statusFilters = [
  { value: "all", label: "All" },
  { value: "applied", label: "Applied" },
  { value: "viewed", label: "Viewed" },
  { value: "in_review", label: "In Review" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: applications } = await supabase
    .from("applications")
    .select("*, jobs(*)")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "viewed":
        return <Eye className="w-4 h-4" />;
      case "interview":
        return <MessageSquare className="w-4 h-4" />;
      case "offer":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Send className="w-4 h-4" />;
    }
  };

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
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-700">Applications</h1>
          <p className="text-dark-400">Track and manage your job applications</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5" />
            Sort
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter.value === "all"
                ? "bg-primary-600 text-white"
                : "bg-white border border-primary-200 text-dark-600 hover:border-primary-400"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl border border-primary-100 overflow-hidden">
        {applications && applications.length > 0 ? (
          <div className="divide-y divide-primary-50">
            {applications.map((app) => (
              <div
                key={app.id}
                className="p-5 hover:bg-cream-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-dark-700">
                          {app.jobs?.title || "Job Title"}
                        </h3>
                        <p className="text-sm text-dark-500">
                          {app.jobs?.company_name || "Company"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {getStatusIcon(app.status)}
                          {app.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-dark-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {app.jobs?.location || "Remote"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Applied {formatDate(app.created_at)}
                      </span>
                      {app.applied_via && (
                        <span className="text-xs px-2 py-0.5 bg-primary-50 text-primary-600 rounded">
                          {app.applied_via === "auto" ? "Auto-Applied" : "Manual"}
                        </span>
                      )}
                    </div>

                    {app.notes && (
                      <p className="mt-2 text-sm text-dark-400 line-clamp-1">{app.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-dark-700 mb-2">No applications yet</h3>
            <p className="text-dark-400 max-w-md mx-auto mb-6">
              Start applying to jobs to track your progress here. We&apos;ll help you stay organized
              throughout your job search.
            </p>
            <a href="/jobs" className="btn-primary inline-flex items-center gap-2">
              Browse Jobs
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
