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

      return {
        external_id: job.externalId,
        platform: job.platform,
        title: job.title,
        company_name: job.company,
        company_logo_url: job.companyLogo,
        location: job.location,
        is_remote: job.isRemote,
        job_type: job.jobType,
        salary_min: job.salary?.min,
        salary_max: job.salary?.max,
        salary_currency: job.salary?.currency || "USD",
        description: job.description,
        requirements: job.requirements || [],
        skills: job.skills || [],
        apply_url: job.applyUrl,
        posted_at: postedAt,
        raw_data: job,
      };
    });

    if (jobsToInsert.length > 0) {
      const { error: insertError } = await supabase.from("jobs").upsert(jobsToInsert, {
        onConflict: "platform,external_id",
        ignoreDuplicates: false,
      });

      if (insertError) {
        console.error("Error inserting jobs:", insertError);
      }
    }

    return NextResponse.json({
      success: true,
      jobs,
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
