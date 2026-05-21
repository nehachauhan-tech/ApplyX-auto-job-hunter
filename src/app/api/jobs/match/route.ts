import { createClient } from "@/lib/supabase/server";
import { analyzeJobMatch, batchAnalyzeJobs, UserProfile, JobListing } from "@/lib/ai/job-matcher";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { jobIds, singleJobId } = body as { jobIds?: string[]; singleJobId?: string };

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: resumes } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_primary", true)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const userProfile: UserProfile = {
      full_name: profile.full_name || "Unknown",
      headline: profile.headline,
      bio: profile.bio,
      location: profile.location,
      skills: resumes?.skills || [],
      experience: resumes?.experience || [],
      education: resumes?.education || [],
      certifications: resumes?.certifications || [],
      desired_roles: preferences?.desired_roles || [],
      desired_locations: preferences?.desired_locations || [],
      remote_preference: preferences?.remote_preference || "any",
      experience_level: preferences?.experience_level || "mid",
      min_salary: preferences?.min_salary,
      max_salary: preferences?.max_salary,
      salary_currency: preferences?.salary_currency || "USD",
      industries: preferences?.industries || [],
    };

    const idsToFetch = singleJobId ? [singleJobId] : jobIds || [];

    if (idsToFetch.length === 0) {
      return NextResponse.json({ error: "No job IDs provided" }, { status: 400 });
    }

    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .in("id", idsToFetch);

    if (jobsError || !jobs || jobs.length === 0) {
      return NextResponse.json({ error: "Jobs not found" }, { status: 404 });
    }

    const jobListings: JobListing[] = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company_name,
      location: job.location || "",
      isRemote: job.is_remote || false,
      jobType: job.job_type,
      salary:
        job.salary_min || job.salary_max
          ? {
              min: job.salary_min,
              max: job.salary_max,
              currency: job.salary_currency,
            }
          : undefined,
      description: job.description || "",
      requirements: job.requirements,
      skills: job.skills,
    }));

    let results;

    if (singleJobId) {
      const result = await analyzeJobMatch(userProfile, jobListings[0]);
      results = [result];
    } else {
      results = await batchAnalyzeJobs(userProfile, jobListings);
    }

    return NextResponse.json({
      success: true,
      matches: results,
    });
  } catch (error) {
    console.error("Job matching error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze job match" },
      { status: 500 }
    );
  }
}
