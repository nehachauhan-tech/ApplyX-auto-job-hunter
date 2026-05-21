"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  Upload,
  Sparkles,
  Star,
  Clock,
  Eye,
  Download,
  Trash2,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Award,
  Briefcase,
  GraduationCap,
  Code,
  X,
  ChevronRight,
} from "lucide-react";

interface Resume {
  id: string;
  name: string;
  is_primary: boolean;
  ats_score: number | null;
  skills: string[];
  experience: Array<{
    company: string;
    title: string;
    start_date?: string;
    end_date?: string;
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
  parsed_data: {
    personal_info?: {
      full_name?: string;
      email?: string;
      phone?: string;
      location?: string;
    };
    professional_summary?: string;
    headline?: string;
    total_experience_years?: number;
    experience_level?: string;
    projects?: Array<{
      name: string;
      description?: string;
      technologies?: string[];
    }>;
  };
  parsing_status: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}

export default function ResumesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setResumes(data);
    }
    setIsLoading(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress("Uploading resume...");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress("Analyzing resume with AI...");

      const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to parse resume");
      }

      setUploadProgress("Resume uploaded successfully!");
      await loadResumes();

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload resume");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(""), 2000);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("resumes").delete().eq("id", resumeId);

    if (!error) {
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
      if (selectedResume?.id === resumeId) {
        setSelectedResume(null);
        setShowInsights(false);
      }
    }
  };

  const handleSetPrimary = async (resumeId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("resumes").update({ is_primary: false }).eq("user_id", user.id);
    await supabase.from("resumes").update({ is_primary: true }).eq("id", resumeId);

    await loadResumes();
  };

  const viewInsights = (resume: Resume) => {
    setSelectedResume(resume);
    setShowInsights(true);
  };

  const getATSScoreColor = (score: number | null) => {
    if (!score) return "text-dark-400 bg-dark-100";
    if (score >= 80) return "text-olive-500 bg-olive-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getATSScoreLabel = (score: number | null) => {
    if (!score) return "Not analyzed";
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const generateInsights = (resume: Resume) => {
    const insights: { type: "success" | "warning" | "info"; message: string }[] = [];
    const data = resume.parsed_data;

    if (resume.ats_score && resume.ats_score >= 80) {
      insights.push({ type: "success", message: "Your resume has a strong ATS score! It's well-optimized for applicant tracking systems." });
    } else if (resume.ats_score && resume.ats_score < 60) {
      insights.push({ type: "warning", message: "Consider adding more relevant keywords and quantifiable achievements to improve your ATS score." });
    }

    if (resume.skills.length < 5) {
      insights.push({ type: "warning", message: "Add more skills to your resume. Aim for at least 8-10 relevant skills." });
    } else if (resume.skills.length >= 10) {
      insights.push({ type: "success", message: "Great job listing your skills! You have a comprehensive skill set." });
    }

    if (!data?.professional_summary) {
      insights.push({ type: "warning", message: "Add a professional summary to make a strong first impression." });
    } else {
      insights.push({ type: "success", message: "Your professional summary helps recruiters quickly understand your value." });
    }

    if (resume.experience.length === 0) {
      insights.push({ type: "warning", message: "Add your work experience to showcase your professional background." });
    } else {
      const hasHighlights = resume.experience.some((exp) => exp.highlights && exp.highlights.length > 0);
      if (!hasHighlights) {
        insights.push({ type: "info", message: "Consider adding bullet points with achievements for each role." });
      }
    }

    if (resume.certifications.length > 0) {
      insights.push({ type: "success", message: `You have ${resume.certifications.length} certification(s) that strengthen your profile.` });
    } else {
      insights.push({ type: "info", message: "Consider adding relevant certifications to stand out." });
    }

    if (data?.personal_info?.linkedin_url) {
      insights.push({ type: "success", message: "LinkedIn profile linked - great for networking!" });
    }

    return insights;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Insights Slide-over */}
      {showInsights && selectedResume && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto animate-slide-in-right">
            <div className="sticky top-0 bg-white border-b border-primary-100 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-dark-700">Resume Insights</h2>
              <button
                onClick={() => setShowInsights(false)}
                className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-dark-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Resume Info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-700">{selectedResume.name}</h3>
                  <p className="text-sm text-dark-400">
                    Updated {new Date(selectedResume.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* ATS Score */}
              <div className="bg-gradient-to-br from-primary-50 to-olive-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-dark-400 mb-1">ATS Compatibility Score</p>
                    <p className="text-3xl font-bold text-dark-700">
                      {selectedResume.ats_score || 0}%
                    </p>
                    <p className={`text-sm font-medium ${getATSScoreColor(selectedResume.ats_score)}`}>
                      {getATSScoreLabel(selectedResume.ats_score)}
                    </p>
                  </div>
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#E8D4C0"
                        strokeWidth="10"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={selectedResume.ats_score && selectedResume.ats_score >= 60 ? "#8B9A6D" : "#C08552"}
                        strokeWidth="10"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * (selectedResume.ats_score || 0)) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TrendingUp className={`w-6 h-6 ${selectedResume.ats_score && selectedResume.ats_score >= 60 ? "text-olive-500" : "text-primary-500"}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-sand-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-medium text-dark-600">Skills</span>
                  </div>
                  <p className="text-2xl font-bold text-dark-700">{selectedResume.skills.length}</p>
                </div>
                <div className="bg-sand-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-medium text-dark-600">Experience</span>
                  </div>
                  <p className="text-2xl font-bold text-dark-700">
                    {selectedResume.parsed_data?.total_experience_years || selectedResume.experience.length}
                    <span className="text-sm font-normal text-dark-400 ml-1">
                      {selectedResume.parsed_data?.total_experience_years ? "years" : "roles"}
                    </span>
                  </p>
                </div>
                <div className="bg-sand-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-medium text-dark-600">Education</span>
                  </div>
                  <p className="text-2xl font-bold text-dark-700">{selectedResume.education.length}</p>
                </div>
                <div className="bg-sand-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-medium text-dark-600">Certifications</span>
                  </div>
                  <p className="text-2xl font-bold text-dark-700">{selectedResume.certifications.length}</p>
                </div>
              </div>

              {/* AI Insights */}
              <div>
                <h4 className="font-semibold text-dark-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  AI Insights
                </h4>
                <div className="space-y-3">
                  {generateInsights(selectedResume).map((insight, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        insight.type === "success"
                          ? "bg-olive-50"
                          : insight.type === "warning"
                          ? "bg-yellow-50"
                          : "bg-sand-50"
                      }`}
                    >
                      {insight.type === "success" ? (
                        <CheckCircle className="w-5 h-5 text-olive-500 flex-shrink-0 mt-0.5" />
                      ) : insight.type === "warning" ? (
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Target className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm text-dark-600">{insight.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              {selectedResume.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-dark-700 mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedResume.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {selectedResume.experience.length > 0 && (
                <div>
                  <h4 className="font-semibold text-dark-700 mb-3">Experience</h4>
                  <div className="space-y-3">
                    {selectedResume.experience.slice(0, 3).map((exp, idx) => (
                      <div key={idx} className="p-3 bg-sand-50 rounded-lg">
                        <p className="font-medium text-dark-700">{exp.title}</p>
                        <p className="text-sm text-dark-400">{exp.company}</p>
                        {exp.start_date && (
                          <p className="text-xs text-dark-300 mt-1">
                            {exp.start_date} - {exp.end_date || "Present"}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-primary-100">
                <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download
                </button>
                <button className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Optimize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-700">Resumes</h1>
          <p className="text-dark-400">Manage and optimize your resumes for better results</p>
        </div>
        <label className="btn-primary flex items-center gap-2 cursor-pointer">
          <Plus className="w-5 h-5" />
          Upload Resume
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Card */}
      <div className="bg-gradient-to-r from-primary-50 to-olive-50 rounded-xl border-2 border-dashed border-primary-200 p-8">
        <div className="flex flex-col items-center text-center">
          {isUploading ? (
            <>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-dark-700 mb-2">{uploadProgress}</h3>
              <p className="text-dark-400">Please wait while we process your resume...</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Upload className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-dark-700 mb-2">Upload Your Resume</h3>
              <p className="text-dark-400 max-w-md mb-4">
                Upload your resume in PDF format. Our AI will analyze it and provide optimization suggestions.
              </p>
              <div className="flex gap-3">
                <label className="btn-primary cursor-pointer">
                  <Upload className="w-5 h-5 mr-2" />
                  Choose File
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <button className="btn-secondary">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create with AI
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Resumes Grid */}
      {resumes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="bg-white rounded-xl border border-primary-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-700">{resume.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-dark-400">
                      <Clock className="w-4 h-4" />
                      {new Date(resume.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {resume.is_primary && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-medium">
                    <Star className="w-3 h-3 fill-current" />
                    Primary
                  </span>
                )}
              </div>

              {/* ATS Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-dark-400">ATS Score</span>
                  <span className={`font-semibold px-2 py-0.5 rounded ${getATSScoreColor(resume.ats_score)}`}>
                    {resume.ats_score ? `${resume.ats_score}%` : "Analyzing..."}
                  </span>
                </div>
                <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      resume.ats_score
                        ? resume.ats_score >= 80
                          ? "bg-olive-500"
                          : resume.ats_score >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                        : "bg-primary-200"
                    }`}
                    style={{ width: `${resume.ats_score || 0}%` }}
                  />
                </div>
              </div>

              {/* Skills */}
              {resume.skills && resume.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {resume.skills.slice(0, 4).map((skill: string) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                  {resume.skills.length > 4 && (
                    <span className="px-2 py-0.5 bg-cream-100 text-dark-400 rounded text-xs">
                      +{resume.skills.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-primary-50">
                <div className="flex gap-1">
                  <button
                    onClick={() => viewInsights(resume)}
                    className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
                    title="View Insights"
                  >
                    <Eye className="w-5 h-5 text-dark-400" />
                  </button>
                  <button
                    className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5 text-dark-400" />
                  </button>
                  {!resume.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(resume.id)}
                      className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Set as Primary"
                    >
                      <Star className="w-5 h-5 text-dark-400" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-dark-400 hover:text-red-500" />
                  </button>
                </div>
                <button
                  onClick={() => viewInsights(resume)}
                  className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:text-primary-700"
                >
                  View Insights
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-primary-100 p-12 text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-700 mb-2">No resumes yet</h3>
          <p className="text-dark-400 max-w-md mx-auto">
            Upload your first resume to get started. Our AI will help you optimize it for better
            results with ATS systems.
          </p>
        </div>
      )}
    </div>
  );
}
