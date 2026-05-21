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
    const { jobIds, singleJobId, resumeId } = body as { jobIds?: string[]; singleJobId?: string; resumeId?: string };

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

    // Get the specified resume or the primary/latest one
    let resumeQuery = supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id);

    if (resumeId) {
      resumeQuery = resumeQuery.eq("id", resumeId);
    } else {
      resumeQuery = resumeQuery.eq("is_primary", true);
    }

    const { data: resumes } = await resumeQuery.single();

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

    // Save results to database
    const scoresToInsert = results.map((result) => ({
      user_id: user.id,
      job_id: result.jobId,
      overall_score: result.overallScore,
      interview_probability: result.interviewProbability,
      selection_probability: result.selectionProbability,
      skills_match: result.skillsMatch,
      experience_match: result.experienceMatch,
      location_match: result.locationMatch,
      salary_match: result.salaryMatch,
      strengths: result.strengths,
      improvements: result.improvements,
      application_tips: result.applicationTips,
      recruiter_perspective: result.recruiterPerspective,
    }));

    if (scoresToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("job_match_scores")
        .upsert(scoresToInsert, {
          onConflict: "user_id,job_id",
        });

      if (insertError) {
        console.error("Error saving match scores:", insertError);
      }
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
