import { GoogleGenAI } from "@google/genai";
import aiModels from "@/config/ai-models.json";

export interface UserProfile {
  full_name: string;
  headline?: string;
  bio?: string;
  location?: string;
  skills: string[];
  experience: Array<{
    company: string;
    title: string;
    description?: string;
    highlights?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer?: string;
  }>;
  desired_roles: string[];
  desired_locations: string[];
  remote_preference: string;
  experience_level: string;
  min_salary?: number;
  max_salary?: number;
  salary_currency?: string;
  industries: string[];
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
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
}

export interface JobMatchResult {
  jobId: string;
  overallScore: number;
  interviewProbability: number;
  selectionProbability: number;
  skillsMatch: {
    score: number;
    matched: string[];
    missing: string[];
  };
  experienceMatch: {
    score: number;
    analysis: string;
  };
  locationMatch: {
    score: number;
    analysis: string;
  };
  salaryMatch: {
    score: number;
    analysis: string;
  };
  strengths: string[];
  improvements: string[];
  applicationTips: string[];
  recruiterPerspective: string;
}

const jobMatchSchema = {
  type: "object",
  properties: {
    overallScore: {
      type: "number",
      description: "Overall match score from 0-100",
    },
    interviewProbability: {
      type: "number",
      description: "Probability of getting an interview call (0-100)",
    },
    selectionProbability: {
      type: "number",
      description: "Probability of getting selected for the role (0-100)",
    },
    skillsMatch: {
      type: "object",
      properties: {
        score: { type: "number", description: "Skills match score 0-100" },
        matched: { type: "array", items: { type: "string" }, description: "Skills that match" },
        missing: { type: "array", items: { type: "string" }, description: "Required skills candidate lacks" },
      },
      required: ["score", "matched", "missing"],
    },
    experienceMatch: {
      type: "object",
      properties: {
        score: { type: "number", description: "Experience match score 0-100" },
        analysis: { type: "string", description: "Brief analysis of experience fit" },
      },
      required: ["score", "analysis"],
    },
    locationMatch: {
      type: "object",
      properties: {
        score: { type: "number", description: "Location match score 0-100" },
        analysis: { type: "string", description: "Brief analysis of location fit" },
      },
      required: ["score", "analysis"],
    },
    salaryMatch: {
      type: "object",
      properties: {
        score: { type: "number", description: "Salary expectation match score 0-100" },
        analysis: { type: "string", description: "Brief analysis of salary fit" },
      },
      required: ["score", "analysis"],
    },
    strengths: {
      type: "array",
      items: { type: "string" },
      description: "Top 3 strengths of this candidate for this role",
    },
    improvements: {
      type: "array",
      items: { type: "string" },
      description: "Top 3 areas where candidate could improve for this role",
    },
    applicationTips: {
      type: "array",
      items: { type: "string" },
      description: "3 specific tips to improve chances of getting selected",
    },
    recruiterPerspective: {
      type: "string",
      description: "A brief perspective from an HR/recruiter viewpoint on this candidate",
    },
  },
  required: [
    "overallScore",
    "interviewProbability",
    "selectionProbability",
    "skillsMatch",
    "experienceMatch",
    "locationMatch",
    "salaryMatch",
    "strengths",
    "improvements",
    "applicationTips",
    "recruiterPerspective",
  ],
};

export async function analyzeJobMatch(
  userProfile: UserProfile,
  job: JobListing
): Promise<JobMatchResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an expert HR professional and technical recruiter with 15+ years of experience.
Your task is to analyze how well a candidate matches a job posting and provide detailed insights.

Think like a hiring manager evaluating this candidate's resume against the job requirements.
Be realistic and honest in your assessment - not every candidate is a perfect match.

## CANDIDATE PROFILE:
Name: ${userProfile.full_name}
Headline: ${userProfile.headline || "Not provided"}
Location: ${userProfile.location || "Not provided"}
Experience Level: ${userProfile.experience_level}
Remote Preference: ${userProfile.remote_preference}
Salary Expectations: ${userProfile.min_salary ? `${userProfile.salary_currency || "USD"} ${userProfile.min_salary}k - ${userProfile.max_salary}k` : "Not specified"}

Skills: ${userProfile.skills.join(", ") || "None listed"}

Work Experience:
${userProfile.experience.map((exp) => `- ${exp.title} at ${exp.company}${exp.highlights ? `\n  Key achievements: ${exp.highlights.slice(0, 2).join("; ")}` : ""}`).join("\n") || "No experience listed"}

Education:
${userProfile.education.map((edu) => `- ${edu.degree}${edu.field ? ` in ${edu.field}` : ""} from ${edu.institution}`).join("\n") || "No education listed"}

Certifications:
${userProfile.certifications.map((cert) => `- ${cert.name}${cert.issuer ? ` (${cert.issuer})` : ""}`).join("\n") || "No certifications"}

Desired Roles: ${userProfile.desired_roles.join(", ") || "Not specified"}
Preferred Industries: ${userProfile.industries.join(", ") || "Any"}

## JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location} ${job.isRemote ? "(Remote available)" : ""}
Job Type: ${job.jobType || "Not specified"}
Salary: ${job.salary ? `${job.salary.currency || "USD"} ${job.salary.min}k - ${job.salary.max}k` : "Not disclosed"}

Description:
${job.description}

Required Skills: ${job.skills?.join(", ") || "Not specified"}
Requirements: ${job.requirements?.join("; ") || "See description"}

## YOUR TASK:
Analyze this match from multiple perspectives:
1. Skills alignment - which skills match, which are missing
2. Experience relevance - does their background fit
3. Location compatibility - can they work from required location
4. Salary alignment - are expectations realistic
5. Overall fit - as a recruiter, would you move forward with this candidate

Provide realistic probabilities based on typical hiring standards:
- Interview Probability: Chance of getting a first-round interview
- Selection Probability: Chance of getting an offer if they interview well

Be constructive but honest. If the match is weak, say so and explain why.`;

  const response = await ai.models.generateContent({
    model: aiModels.recommendedModels.reasoning,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: jobMatchSchema,
    },
  });

  const result = JSON.parse(response.text || "{}");

  return {
    jobId: job.id,
    ...result,
  };
}

export async function batchAnalyzeJobs(
  userProfile: UserProfile,
  jobs: JobListing[]
): Promise<JobMatchResult[]> {
  const results: JobMatchResult[] = [];

  for (const job of jobs) {
    try {
      const result = await analyzeJobMatch(userProfile, job);
      results.push(result);
    } catch (error) {
      console.error(`Error analyzing job ${job.id}:`, error);
      results.push({
        jobId: job.id,
        overallScore: 0,
        interviewProbability: 0,
        selectionProbability: 0,
        skillsMatch: { score: 0, matched: [], missing: [] },
        experienceMatch: { score: 0, analysis: "Analysis failed" },
        locationMatch: { score: 0, analysis: "Analysis failed" },
        salaryMatch: { score: 0, analysis: "Analysis failed" },
        strengths: [],
        improvements: [],
        applicationTips: [],
        recruiterPerspective: "Unable to analyze this job match.",
      });
    }
  }

  return results.sort((a, b) => b.overallScore - a.overallScore);
}
