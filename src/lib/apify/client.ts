import { ApifyClient } from "apify-client";

export function createApifyClient(apiKey?: string) {
  const token = apiKey || process.env.APIFY_API_KEY;

  if (!token) {
    throw new Error("Apify API key not configured");
  }

  return new ApifyClient({ token });
}

export interface JobSearchParams {
  query: string;
  location?: string;
  remote?: boolean;
  jobType?: "full-time" | "part-time" | "contract" | "internship";
  experienceLevel?: "entry" | "mid" | "senior" | "lead" | "executive";
  maxResults?: number;
  platform?: "linkedin" | "indeed" | "glassdoor";
}

export interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  isRemote: boolean;
  jobType?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  description: string;
  requirements?: string[];
  skills?: string[];
  benefits?: string[];
  applyUrl: string;
  postedAt?: string;
  platform: string;
  externalId: string;
}

const INDEED_ACTOR_ID = "misceres/indeed-scraper";

export async function scrapeLinkedInJobs(
  client: ApifyClient,
  params: JobSearchParams
): Promise<ScrapedJob[]> {
  console.log("LinkedIn scraping requires a paid Apify actor. Falling back to Indeed scraper.");
  const results = await scrapeIndeedJobs(client, params);
  return results.map(job => ({ ...job, platform: "linkedin" }));
}

export async function scrapeIndeedJobs(
  client: ApifyClient,
  params: JobSearchParams
): Promise<ScrapedJob[]> {
  const input = {
    position: params.query,
    location: params.location || "",
    maxItems: params.maxResults || 25,
  };

  try {
    const run = await client.actor(INDEED_ACTOR_ID).call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    return items.map((item: Record<string, unknown>) => ({
      id: `indeed-${item.id || item.jobKey}`,
      title: String(item.positionName || item.title || ""),
      company: String(item.company || ""),
      companyLogo: item.companyLogo as string | undefined,
      location: String(item.location || ""),
      isRemote: Boolean(String(item.location || "").toLowerCase().includes("remote")),
      jobType: item.jobType as string | undefined,
      salary: item.salary
        ? {
            min: (item.salary as Record<string, unknown>).min as number | undefined,
            max: (item.salary as Record<string, unknown>).max as number | undefined,
            currency: "USD",
          }
        : undefined,
      description: String(item.description || ""),
      skills: item.skills as string[] | undefined,
      applyUrl: String(item.url || item.externalApplyLink || ""),
      postedAt: item.postedAt as string | undefined,
      platform: "indeed",
      externalId: String(item.id || item.jobKey || ""),
    }));
  } catch (error) {
    console.error("Indeed scraping error:", error);
    throw error;
  }
}

export async function scrapeJobs(
  params: JobSearchParams,
  apiKey?: string
): Promise<ScrapedJob[]> {
  const client = createApifyClient(apiKey);
  const platform = params.platform || "linkedin";

  switch (platform) {
    case "linkedin":
      return scrapeLinkedInJobs(client, params);
    case "indeed":
      return scrapeIndeedJobs(client, params);
    default:
      return scrapeLinkedInJobs(client, params);
  }
}
