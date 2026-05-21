import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import aiModels from "@/config/ai-models.json";

const resumeSchema = {
  type: "object",
  properties: {
    personal_info: {
      type: "object",
      description: "Personal information extracted from the resume",
      properties: {
        full_name: { type: "string", description: "Full name of the candidate" },
        email: { type: "string", description: "Email address" },
        phone: { type: "string", description: "Phone number" },
        location: { type: "string", description: "City, State/Country" },
        linkedin_url: { type: "string", description: "LinkedIn profile URL if present" },
        github_url: { type: "string", description: "GitHub profile URL if present" },
        portfolio_url: { type: "string", description: "Portfolio or personal website URL if present" },
      },
      required: ["full_name"],
    },
    professional_summary: {
      type: "string",
      description: "A 2-3 sentence professional summary of the candidate highlighting their key strengths, experience level, and career focus",
    },
    headline: {
      type: "string",
      description: "A short professional headline (e.g., 'Senior Software Engineer | React & Node.js')",
    },
    skills: {
      type: "array",
      description: "List of technical and soft skills",
      items: { type: "string" },
    },
    experience: {
      type: "array",
      description: "Work experience entries",
      items: {
        type: "object",
        properties: {
          company: { type: "string", description: "Company name" },
          title: { type: "string", description: "Job title" },
          location: { type: "string", description: "Job location" },
          start_date: { type: "string", description: "Start date (e.g., 'Jan 2020')" },
          end_date: { type: "string", description: "End date or 'Present'" },
          description: { type: "string", description: "Job description and achievements" },
          highlights: {
            type: "array",
            description: "Key achievements or responsibilities as bullet points",
            items: { type: "string" },
          },
        },
        required: ["company", "title"],
      },
    },
    education: {
      type: "array",
      description: "Education entries",
      items: {
        type: "object",
        properties: {
          institution: { type: "string", description: "School/University name" },
          degree: { type: "string", description: "Degree type (e.g., 'Bachelor of Science')" },
          field: { type: "string", description: "Field of study" },
          location: { type: "string", description: "Institution location" },
          start_date: { type: "string", description: "Start date" },
          end_date: { type: "string", description: "End date or expected graduation" },
          gpa: { type: "string", description: "GPA if mentioned" },
          honors: { type: "string", description: "Honors or distinctions" },
        },
        required: ["institution", "degree"],
      },
    },
    certifications: {
      type: "array",
      description: "Professional certifications",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Certification name" },
          issuer: { type: "string", description: "Issuing organization" },
          date: { type: "string", description: "Date obtained" },
          expiry: { type: "string", description: "Expiry date if applicable" },
          credential_id: { type: "string", description: "Credential ID if mentioned" },
        },
        required: ["name"],
      },
    },
    projects: {
      type: "array",
      description: "Notable projects",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Project name" },
          description: { type: "string", description: "Project description" },
          technologies: {
            type: "array",
            items: { type: "string" },
            description: "Technologies used",
          },
          url: { type: "string", description: "Project URL if available" },
        },
        required: ["name"],
      },
    },
    languages: {
      type: "array",
      description: "Languages spoken",
      items: {
        type: "object",
        properties: {
          language: { type: "string" },
          proficiency: { type: "string", description: "e.g., Native, Fluent, Intermediate" },
        },
        required: ["language"],
      },
    },
    total_experience_years: {
      type: "number",
      description: "Estimated total years of professional experience",
    },
    experience_level: {
      type: "string",
      description: "Experience level category",
      enum: ["entry", "mid", "senior", "lead", "executive"],
    },
  },
  required: ["personal_info", "professional_summary", "headline", "skills", "experience"],
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const resumeId = formData.get("resumeId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 });
    }

    const filePath = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    let dbResumeId = resumeId;

    if (!dbResumeId) {
      const { data: newResume, error: insertError } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          name: file.name.replace(".pdf", ""),
          file_path: filePath,
          file_size: file.size,
          parsing_status: "processing",
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        return NextResponse.json({ error: "Failed to create resume record" }, { status: 500 });
      }
      dbResumeId = newResume.id;
    } else {
      await supabase
        .from("resumes")
        .update({
          file_path: filePath,
          file_size: file.size,
          parsing_status: "processing",
        })
        .eq("id", dbResumeId);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      await supabase
        .from("resumes")
        .update({ parsing_status: "failed" })
        .eq("id", dbResumeId);
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const base64Data = buffer.toString("base64");

    const response = await ai.models.generateContent({
      model: aiModels.recommendedModels.default,
      contents: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64Data,
          },
        },
        {
          text: `You are an expert resume parser and career analyst. Analyze this resume PDF and extract all information in a structured format.

Important instructions:
1. Extract ALL information accurately from the resume
2. For the professional_summary, write a compelling 2-3 sentence summary highlighting the candidate's key strengths, years of experience, and what makes them stand out
3. Create a concise headline suitable for a professional profile
4. Estimate total years of experience based on work history
5. Categorize the experience level based on the total years and seniority of roles
6. Extract all skills mentioned, including both technical and soft skills
7. If any field is not present in the resume, omit it from the response

Respond with the structured JSON data only.`,
        },
      ],
      config: {
        thinkingConfig: {
          thinkingBudget: 8192,
        },
        responseMimeType: "application/json",
        responseJsonSchema: resumeSchema,
      },
    });

    const responseText = response.text;
    let parsedData;

    try {
      parsedData = JSON.parse(responseText || "{}");
    } catch {
      console.error("Failed to parse AI response:", responseText);
      await supabase
        .from("resumes")
        .update({ parsing_status: "failed" })
        .eq("id", dbResumeId);
      return NextResponse.json({ error: "Failed to parse resume content" }, { status: 500 });
    }

    const { error: updateError } = await supabase
      .from("resumes")
      .update({
        parsed_data: parsedData,
        parsed_content: parsedData,
        summary: parsedData.professional_summary,
        skills: parsedData.skills || [],
        experience: parsedData.experience || [],
        education: parsedData.education || [],
        certifications: parsedData.certifications || [],
        parsing_status: "completed",
        ats_score: calculateATSScore(parsedData),
      })
      .eq("id", dbResumeId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: "Failed to save parsed data" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      resumeId: dbResumeId,
      data: parsedData,
    });
  } catch (error) {
    console.error("Resume parse error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function calculateATSScore(data: Record<string, unknown>): number {
  let score = 0;
  const maxScore = 100;

  const personalInfo = data.personal_info as Record<string, unknown> | undefined;
  if (personalInfo?.full_name) score += 5;
  if (personalInfo?.email) score += 5;
  if (personalInfo?.phone) score += 5;
  if (personalInfo?.location) score += 5;

  if (data.professional_summary) score += 10;

  const skills = data.skills as string[] | undefined;
  if (skills && skills.length > 0) {
    score += Math.min(15, skills.length * 1.5);
  }

  const experience = data.experience as Record<string, unknown>[] | undefined;
  if (experience && experience.length > 0) {
    score += Math.min(25, experience.length * 5);
    experience.forEach((exp) => {
      const highlights = exp.highlights as string[] | undefined;
      if (highlights && highlights.length > 0) {
        score += Math.min(5, highlights.length);
      }
    });
  }

  const education = data.education as Record<string, unknown>[] | undefined;
  if (education && education.length > 0) {
    score += Math.min(10, education.length * 5);
  }

  const certifications = data.certifications as Record<string, unknown>[] | undefined;
  if (certifications && certifications.length > 0) {
    score += Math.min(5, certifications.length * 2);
  }

  const projects = data.projects as Record<string, unknown>[] | undefined;
  if (projects && projects.length > 0) {
    score += Math.min(5, projects.length * 2);
  }

  if (personalInfo?.linkedin_url) score += 3;
  if (personalInfo?.github_url) score += 2;

  return Math.min(maxScore, Math.round(score));
}
