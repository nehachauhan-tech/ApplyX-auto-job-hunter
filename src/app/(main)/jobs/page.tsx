import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  Clock,
  DollarSign,
  Filter,
  Sparkles,
} from "lucide-react";

export default async function JobsPage() {
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-700">Find Jobs</h1>
          <p className="text-dark-400">Discover opportunities that match your skills</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-primary-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-300" />
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              className="input-field pl-12 w-full"
            />
          </div>
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-300" />
            <input
              type="text"
              placeholder="Location or Remote"
              className="input-field pl-12 w-full"
            />
          </div>
          <button className="btn-secondary flex items-center gap-2 px-6">
            <Filter className="w-5 h-5" />
            Filters
          </button>
          <button className="btn-primary flex items-center gap-2 px-6">
            <Search className="w-5 h-5" />
            Search
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-primary-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {job.company_logo_url ? (
                    <Image
                      src={job.company_logo_url}
                      alt={job.company_name}
                      width={40}
                      height={40}
                      className="rounded-lg object-contain"
                    />
                  ) : (
                    <Building2 className="w-7 h-7 text-primary-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-dark-700 hover:text-primary-600 cursor-pointer">
                        {job.title}
                      </h3>
                      <p className="text-dark-500">{job.company_name}</p>
                    </div>
                    <button className="btn-primary text-sm px-4 py-2">Quick Apply</button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-dark-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location || "Remote"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {job.job_type || "Full-time"}
                    </span>
                    {job.salary_min && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary_currency} {job.salary_min}k - {job.salary_max}k
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.skills.slice(0, 5).map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="px-2.5 py-1 bg-cream-100 text-dark-400 rounded-full text-xs">
                          +{job.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-primary-100 p-12 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-dark-700 mb-2">No jobs available yet</h3>
            <p className="text-dark-400 max-w-md mx-auto">
              We&apos;re working on connecting to job platforms. Check back soon for new opportunities
              or try searching for specific roles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
