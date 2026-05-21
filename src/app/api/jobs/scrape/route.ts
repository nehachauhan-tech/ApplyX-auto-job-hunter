import { createClient } from "@/lib/supabase/server";
import { scrapeJobs, JobSearchParams, ScrapedJob } from "@/lib/apify/client";
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
    const { query, location, remote, jobType, experienceLevel, maxResults, platform, apiKey } =
      body as JobSearchParams & { apiKey?: string };

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    let userApiKey = apiKey;

    if (!userApiKey) {
      const { data: preferences } = await supabase
        .from("user_preferences")
        .select("apify_api_key")
        .eq("user_id", user.id)
        .single();

      userApiKey = preferences?.apify_api_key;
    }

    const jobs = await scrapeJobs(
      {
        query,
        location,
        remote,
        jobType,
        experienceLevel,
        maxResults: maxResults || 25,
        platform,
      },
      userApiKey
    );

    const jobsToInsert = jobs.map((job: ScrapedJob) => {
      let postedAt = null;
      if (job.postedAt) {
        const parsedDate = new Date(job.postedAt);
        if (!isNaN(parsedDate.getTime())) {
          postedAt = parsedDate.toISOString();
        }
      }

      // Handle job_type which can be string or array
      let jobType = job.jobType;
      if (Array.isArray(jobType)) {
        jobType = jobType[0] || null;
      }

      return {
        external_id: job.externalId || job.id,
        platform: job.platform || platform || "indeed",
        title: job.title || "Untitled Position",
        company_name: job.company || "Unknown Company",
        company_logo_url: job.companyLogo || null,
        location: job.location || null,
        is_remote: job.isRemote || false,
        job_type: jobType || null,
        salary_min: job.salary?.min || null,
        salary_max: job.salary?.max || null,
        salary_currency: job.salary?.currency || "USD",
        description: job.description || null,
        requirements: job.requirements || [],
        skills: job.skills || [],
        apply_url: job.applyUrl || null,
        posted_at: postedAt,
        raw_data: job,
      };
    });

    let savedJobs: { id: string }[] = [];
    if (jobsToInsert.length > 0) {
      const { data: insertedData, error: insertError } = await supabase
        .from("jobs")
        .upsert(jobsToInsert, {
          onConflict: "platform,external_id",
          ignoreDuplicates: false,
        })
        .select("id, external_id");

      if (insertError) {
        console.error("Error inserting jobs:", insertError);
      } else if (insertedData) {
        savedJobs = insertedData;
      }
    }

    // Fetch the saved jobs with their database IDs
    const { data: dbJobs } = await supabase
      .from("jobs")
      .select("*")
      .in("external_id", jobs.map((j: ScrapedJob) => j.externalId || j.id))
      .order("created_at", { ascending: false });

    return NextResponse.json({
      success: true,
      jobs: dbJobs || jobs,
      savedCount: savedJobs.length,
      count: jobs.length,
    });
  } catch (error) {
    console.error("Job scraping error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to scrape jobs" },
      { status: 500 }
    );
  }
}
