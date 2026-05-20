import { createClient } from "@/lib/supabase/server";
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
} from "lucide-react";

export default async function ResumesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: resumes } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const getATSScoreColor = (score: number | null) => {
    if (!score) return "text-dark-400 bg-dark-100";
    if (score >= 80) return "text-accent-green bg-accent-green/10";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-700">Resumes</h1>
          <p className="text-dark-400">Manage and optimize your resumes for better results</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Upload Resume
        </button>
      </div>

      {/* Upload Card */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-gold/10 rounded-xl border-2 border-dashed border-primary-200 p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Upload className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-dark-700 mb-2">Upload Your Resume</h3>
          <p className="text-dark-400 max-w-md mb-4">
            Upload your resume in PDF, DOCX, or DOC format. Our AI will analyze it and provide
            optimization suggestions.
          </p>
          <div className="flex gap-3">
            <button className="btn-primary">
              <Upload className="w-5 h-5 mr-2" />
              Choose File
            </button>
            <button className="btn-secondary">
              <Sparkles className="w-5 h-5 mr-2" />
              Create with AI
            </button>
          </div>
        </div>
      </div>

      {/* Resumes Grid */}
      {resumes && resumes.length > 0 ? (
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
                  <span className="flex items-center gap-1 px-2 py-1 bg-accent-gold/10 text-accent-gold rounded-full text-xs font-medium">
                    <Star className="w-3 h-3 fill-current" />
                    Primary
                  </span>
                )}
              </div>

              {/* ATS Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-dark-400">ATS Score</span>
                  <span className={`font-semibold ${getATSScoreColor(resume.ats_score)}`}>
                    {resume.ats_score ? `${resume.ats_score}%` : "Not analyzed"}
                  </span>
                </div>
                <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      resume.ats_score
                        ? resume.ats_score >= 80
                          ? "bg-accent-green"
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
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-primary-50 rounded-lg transition-colors" title="View">
                    <Eye className="w-5 h-5 text-dark-400" />
                  </button>
                  <button className="p-2 hover:bg-primary-50 rounded-lg transition-colors" title="Download">
                    <Download className="w-5 h-5 text-dark-400" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-5 h-5 text-dark-400 hover:text-red-500" />
                  </button>
                </div>
                <button className="btn-secondary text-sm py-2 px-3 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Optimize
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
