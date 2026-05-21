"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  Clock,
  DollarSign,
  Filter,
  Sparkles,
  X,
  Loader2,
  TrendingUp,
  Target,
  ChevronDown,
  ExternalLink,
  AlertCircle,
  Key,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company_name: string;
  company_logo_url?: string;
  location?: string;
  is_remote?: boolean;
  job_type?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  skills?: string[];
  description?: string;
  requirements?: string[];
  apply_url?: string;
  created_at: string;
  platform?: string;
}

interface JobMatchScore {
  job_id: string;
  overall_score: number;
  interview_probability: number;
  selection_probability: number;
  skills_match?: {
    score: number;
    matched: string[];
    missing: string[];
  };
  strengths: string[];
  improvements: string[];
  application_tips?: string[];
  recruiter_perspective?: string;
}

interface Resume {
  id: string;
  file_name: string;
  skills: string[];
  is_primary: boolean;
  created_at: string;
}

interface ProgressState {
  isActive: boolean;
  stage: string;
  progress: number;
  message: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [matchScores, setMatchScores] = useState<Record<string, JobMatchScore>>({});
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [hasApifyKey, setHasApifyKey] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchProgress, setSearchProgress] = useState<ProgressState>({
    isActive: false,
    stage: "",
    progress: 0,
    message: "",
  });
  const [analysisProgress, setAnalysisProgress] = useState<ProgressState>({
    isActive: false,
    stage: "",
    progress: 0,
    message: "",
  });
  const [filters, setFilters] = useState({
    remote: false,
    jobType: "" as string,
    platform: "indeed" as "linkedin" | "indeed",
    minScore: 0,
  });
  const [maxResults, setMaxResults] = useState(10);

  const loadJobs = useCallback(async () => {
    const supabase = createClient();
    const { data: jobsData } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (jobsData) {
      setJobs(jobsData);
    }
  }, []);

  const loadResumes = useCallback(async () => {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("No user session for loading resumes");
      return;
    }

    const { data: resumesData, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (resumeError) {
      console.error("Error loading resumes:", resumeError);
      return;
    }

    if (resumesData && resumesData.length > 0) {
      setResumes(resumesData.map(r => ({
        id: r.id,
        file_name: r.name || "Resume",
        skills: r.skills || [],
        is_primary: r.is_primary || false,
        created_at: r.created_at,
      })));
      // Auto-select the most recent or primary resume
      const primaryResume = resumesData.find(r => r.is_primary) || resumesData[0];
      setSelectedResumeId(primaryResume.id);
    }
  }, []);

  const loadMatchScores = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: scores } = await supabase
      .from("job_match_scores")
      .select("*")
      .eq("user_id", user.id);

    if (scores) {
      const scoresMap: Record<string, JobMatchScore> = {};
      scores.forEach((score) => {
        scoresMap[score.job_id] = {
          job_id: score.job_id,
          overall_score: score.overall_score,
          interview_probability: score.interview_probability,
          selection_probability: score.selection_probability,
          skills_match: score.skills_match,
          strengths: score.strengths || [],
          improvements: score.improvements || [],
          application_tips: score.application_tips || [],
          recruiter_perspective: score.recruiter_perspective,
        };
      });
      setMatchScores(scoresMap);
    }
  }, []);

  const checkApifyKey = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("apify_api_key")
      .eq("user_id", user.id)
      .single();

    setHasApifyKey(!!preferences?.apify_api_key);
  }, []);

  useEffect(() => {
    loadJobs();
    loadResumes();
    loadMatchScores();
    checkApifyKey();
  }, [loadJobs, loadResumes, loadMatchScores, checkApifyKey]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    setSearchProgress({
      isActive: true,
      stage: "connecting",
      progress: 5,
      message: "Connecting to job search service...",
    });

    const progressStages = [
      { progress: 15, stage: "initializing", message: "Initializing job scraper..." },
      { progress: 30, stage: "searching", message: `Searching for "${searchQuery}" jobs...` },
      { progress: 50, stage: "scraping", message: "Scraping job listings from Indeed..." },
      { progress: 70, stage: "extracting", message: "Extracting job details..." },
      { progress: 85, stage: "processing", message: "Processing job data..." },
    ];

    let progressIndex = 0;
    const progressInterval = setInterval(() => {
      if (progressIndex < progressStages.length) {
        setSearchProgress({
          isActive: true,
          ...progressStages[progressIndex],
        });
        progressIndex++;
      }
    }, 8000);

    try {
      const response = await fetch("/api/jobs/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          location: locationQuery || undefined,
          remote: filters.remote || undefined,
          jobType: filters.jobType || undefined,
          platform: filters.platform,
          maxResults: maxResults,
        }),
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to search jobs");
      }

      setSearchProgress({
        isActive: true,
        stage: "saving",
        progress: 95,
        message: `Found ${data.count || 0} jobs! Saving to database...`,
      });

      // Reload jobs from database to get the saved versions with proper IDs
      await loadJobs();

      setSearchProgress({
        isActive: true,
        stage: "complete",
        progress: 100,
        message: `Successfully loaded ${data.count || 0} jobs!`,
      });

      setTimeout(() => {
        setSearchProgress({ isActive: false, stage: "", progress: 0, message: "" });
      }, 2000);

    } catch (err) {
      clearInterval(progressInterval);
      setSearchProgress({ isActive: false, stage: "", progress: 0, message: "" });
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const analyzeMatches = async (jobIds: string[]) => {
    if (jobIds.length === 0) return;
    if (!selectedResumeId) {
      setError("Please select a resume for AI analysis");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress({
      isActive: true,
      stage: "starting",
      progress: 5,
      message: "Starting AI analysis...",
    });

    const totalJobs = jobIds.length;
    let analyzedCount = 0;

    const progressInterval = setInterval(() => {
      const estimatedProgress = Math.min(90, 10 + (analyzedCount / totalJobs) * 80);
      setAnalysisProgress({
        isActive: true,
        stage: "analyzing",
        progress: estimatedProgress,
        message: `Analyzing job ${Math.min(analyzedCount + 1, totalJobs)} of ${totalJobs}... AI is evaluating your match`,
      });
    }, 3000);

    try {
      const response = await fetch("/api/jobs/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobIds, resumeId: selectedResumeId }),
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (data.matches) {
        const newScores: Record<string, JobMatchScore> = { ...matchScores };
        data.matches.forEach((match: JobMatchScore & { jobId: string }) => {
          newScores[match.jobId] = {
            job_id: match.jobId,
            overall_score: match.overall_score || (match as unknown as { overallScore: number }).overallScore || 0,
            interview_probability: match.interview_probability || (match as unknown as { interviewProbability: number }).interviewProbability || 0,
            selection_probability: match.selection_probability || (match as unknown as { selectionProbability: number }).selectionProbability || 0,
            skills_match: match.skills_match || (match as unknown as { skillsMatch: JobMatchScore["skills_match"] }).skillsMatch,
            strengths: match.strengths || [],
            improvements: match.improvements || [],
            application_tips: match.application_tips || (match as unknown as { applicationTips: string[] }).applicationTips || [],
            recruiter_perspective: match.recruiter_perspective || (match as unknown as { recruiterPerspective: string }).recruiterPerspective,
          };
          analyzedCount++;
        });
        setMatchScores(newScores);
      }

      setAnalysisProgress({
        isActive: true,
        stage: "complete",
        progress: 100,
        message: `Analysis complete! Evaluated ${data.matches?.length || 0} jobs`,
      });

      setTimeout(() => {
        setAnalysisProgress({ isActive: false, stage: "", progress: 0, message: "" });
      }, 2000);

    } catch (err) {
      clearInterval(progressInterval);
      setAnalysisProgress({ isActive: false, stage: "", progress: 0, message: "" });
      console.error("Analysis failed:", err);
      setError("AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeSingleJob = async (jobId: string) => {
    if (!selectedResumeId) {
      setError("Please select a resume for AI analysis");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress({
      isActive: true,
      stage: "analyzing",
      progress: 30,
      message: "AI is analyzing your profile match...",
    });

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => ({
        ...prev,
        progress: Math.min(prev.progress + 15, 85),
        message: prev.progress > 50
          ? "Calculating interview probability..."
          : "Comparing skills and experience...",
      }));
    }, 2000);

    try {
      const response = await fetch("/api/jobs/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ singleJobId: jobId, resumeId: selectedResumeId }),
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (data.matches && data.matches[0]) {
        const match = data.matches[0];
        setMatchScores((prev) => ({
          ...prev,
          [match.jobId]: {
            job_id: match.jobId,
            overall_score: match.overallScore,
            interview_probability: match.interviewProbability,
            selection_probability: match.selectionProbability,
            skills_match: match.skillsMatch,
            strengths: match.strengths || [],
            improvements: match.improvements || [],
            application_tips: match.applicationTips || [],
            recruiter_perspective: match.recruiterPerspective,
          },
        }));

        setAnalysisProgress({
          isActive: true,
          stage: "complete",
          progress: 100,
          message: `Match score: ${match.overallScore}%`,
        });
      }

      setTimeout(() => {
        setAnalysisProgress({ isActive: false, stage: "", progress: 0, message: "" });
      }, 1500);

    } catch (err) {
      clearInterval(progressInterval);
      setAnalysisProgress({ isActive: false, stage: "", progress: 0, message: "" });
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-olive-600 bg-olive-50";
    if (score >= 40) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const filteredJobs = jobs.filter((job) => {
    if (filters.minScore > 0) {
      const score = matchScores[job.id];
      if (!score || score.overall_score < filters.minScore) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-700">Find Jobs</h1>
          <p className="text-dark-400">Discover opportunities that match your skills</p>
        </div>
        {jobs.length > 0 && (
          <button
            onClick={() => analyzeMatches(jobs.slice(0, 10).map((j) => j.id))}
            disabled={isAnalyzing || !selectedResumeId}
            className="btn-secondary flex items-center gap-2"
          >
            {isAnalyzing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            Analyze Top 10 Matches
          </button>
        )}
      </div>

      {/* API Key Warning */}
      {hasApifyKey === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-amber-800">Apify API Key Required</p>
            <p className="text-sm text-amber-700 mt-1">
              To search and scrape jobs from LinkedIn and Indeed, you need to add your Apify API key.
            </p>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-amber-800 hover:text-amber-900"
            >
              <Key className="w-4 h-4" />
              Add API Key in Settings
            </Link>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-primary-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-300" />
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="input-field pl-12 w-full"
            />
          </div>
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-300" />
            <input
              type="text"
              placeholder="Location or Remote"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="input-field pl-12 w-full"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2 px-6"
          >
            <Filter className="w-5 h-5" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="btn-primary flex items-center gap-2 px-6"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            Search
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-primary-100 grid grid-cols-2 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1.5">Platform</label>
              <select
                value={filters.platform}
                onChange={(e) => setFilters({ ...filters, platform: e.target.value as "linkedin" | "indeed" })}
                className="input-field w-full"
              >
                <option value="indeed">Indeed</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1.5">Results</label>
              <select
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value))}
                className="input-field w-full"
              >
                <option value="5">5 jobs</option>
                <option value="10">10 jobs</option>
                <option value="15">15 jobs</option>
                <option value="25">25 jobs</option>
                <option value="50">50 jobs</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1.5">Job Type</label>
              <select
                value={filters.jobType}
                onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                className="input-field w-full"
              >
                <option value="">Any</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1.5">Min Match</label>
              <select
                value={filters.minScore}
                onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
                className="input-field w-full"
              >
                <option value="0">Show All</option>
                <option value="40">40%+</option>
                <option value="60">60%+</option>
                <option value="80">80%+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1.5">Resume for AI</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="input-field w-full"
              >
                {resumes.length === 0 ? (
                  <option value="">No resumes uploaded</option>
                ) : (
                  resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.file_name} {resume.is_primary ? "(Primary)" : ""}
                    </option>
                  ))
                )}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-6">
              <input
                type="checkbox"
                checked={filters.remote}
                onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="font-medium text-dark-700">Remote</span>
            </label>
          </div>
        )}
      </div>

      {/* Progress Bars */}
      {searchProgress.isActive && (
        <div className="bg-white rounded-xl border border-primary-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-primary-600 animate-pulse" />
              </div>
              <div>
                <p className="font-medium text-dark-700">Job Search in Progress</p>
                <p className="text-sm text-dark-400">{searchProgress.message}</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-primary-600">{searchProgress.progress}%</span>
          </div>
          <div className="w-full bg-cream-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${searchProgress.progress}%` }}
            />
          </div>
          {searchProgress.stage !== "complete" && (
            <div className="flex items-center gap-2 text-xs text-dark-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>This may take 30-60 seconds depending on the number of jobs</span>
            </div>
          )}
        </div>
      )}

      {analysisProgress.isActive && (
        <div className="bg-white rounded-xl border border-olive-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-olive-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-olive-600 animate-pulse" />
              </div>
              <div>
                <p className="font-medium text-dark-700">AI Analysis in Progress</p>
                <p className="text-sm text-dark-400">{analysisProgress.message}</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-olive-600">{analysisProgress.progress}%</span>
          </div>
          <div className="w-full bg-olive-50 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-olive-500 to-olive-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${analysisProgress.progress}%` }}
            />
          </div>
          {analysisProgress.stage !== "complete" && (
            <div className="flex items-center gap-2 text-xs text-dark-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>AI is analyzing your profile against job requirements...</span>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-5 h-5 text-red-400 hover:text-red-600" />
          </button>
        </div>
      )}

      {/* Jobs Count */}
      {filteredJobs.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-dark-500">
            Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""}
            {filters.minScore > 0 && ` with ${filters.minScore}%+ match`}
          </p>
          {resumes.length === 0 && (
            <Link href="/resumes" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Upload a resume for AI analysis
            </Link>
          )}
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => {
            const score = matchScores[job.id];
            return (
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
                        <h3
                          onClick={() => setSelectedJob(job)}
                          className="text-lg font-semibold text-dark-700 hover:text-primary-600 cursor-pointer"
                        >
                          {job.title}
                        </h3>
                        <p className="text-dark-500">{job.company_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {score ? (
                          <div className={`px-3 py-1.5 rounded-lg font-semibold ${getScoreColor(score.overall_score)}`}>
                            {score.overall_score}% Match
                          </div>
                        ) : (
                          <button
                            onClick={() => analyzeSingleJob(job.id)}
                            disabled={isAnalyzing || !selectedResumeId}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 disabled:opacity-50"
                          >
                            <Target className="w-4 h-4" />
                            Analyze
                          </button>
                        )}
                        {job.apply_url && (
                          <a
                            href={job.apply_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary text-sm px-4 py-2 flex items-center gap-1"
                          >
                            Apply
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-dark-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location || "Remote"}
                        {job.is_remote && <span className="text-green-600 font-medium ml-1">(Remote)</span>}
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
                      {job.platform && (
                        <span className="px-2 py-0.5 bg-cream-100 text-dark-500 rounded text-xs capitalize">
                          {job.platform}
                        </span>
                      )}
                    </div>

                    {/* Match Score Details */}
                    {score && (
                      <div className="mt-3 p-3 bg-cream-50 rounded-lg space-y-2">
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-olive-600" />
                            <span className="text-dark-500">Interview:</span>
                            <span className="font-medium text-olive-700">{score.interview_probability}%</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Target className="w-4 h-4 text-primary-600" />
                            <span className="text-dark-500">Selection:</span>
                            <span className="font-medium text-primary-700">{score.selection_probability}%</span>
                          </div>
                        </div>

                        {/* Skills Match */}
                        {score.skills_match && (
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-cream-200">
                            {score.skills_match.matched?.slice(0, 3).map((skill) => (
                              <span key={skill} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                                <CheckCircle className="w-3 h-3" />
                                {skill}
                              </span>
                            ))}
                            {score.skills_match.missing?.slice(0, 3).map((skill) => (
                              <span key={skill} className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs">
                                <XCircle className="w-3 h-3" />
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {job.skills && job.skills.length > 0 && !score && (
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
            );
          })
        ) : (
          <div className="bg-white rounded-xl border border-primary-100 p-12 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-dark-700 mb-2">
              {filters.minScore > 0 ? "No matching jobs found" : "No jobs available yet"}
            </h3>
            <p className="text-dark-400 max-w-md mx-auto">
              {filters.minScore > 0
                ? `No jobs match your minimum score of ${filters.minScore}%. Try lowering the filter.`
                : "Search for jobs to get started. We'll scrape the latest opportunities from Indeed."}
            </p>
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-primary-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark-700">{selectedJob.title}</h2>
              <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-cream-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  {selectedJob.company_logo_url ? (
                    <Image
                      src={selectedJob.company_logo_url}
                      alt={selectedJob.company_name}
                      width={32}
                      height={32}
                      className="rounded-lg"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-primary-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-dark-700">{selectedJob.company_name}</p>
                  <p className="text-sm text-dark-400">{selectedJob.location}</p>
                </div>
              </div>

              {/* AI Match Analysis */}
              {(() => {
                const selectedScore = matchScores[selectedJob.id];
                if (!selectedScore) return null;
                return (
                  <div className="bg-cream-50 rounded-xl p-4 space-y-4">
                    <h3 className="font-semibold text-dark-700 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-olive-600" />
                      AI Match Analysis
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className={`text-2xl font-bold ${getScoreColor(selectedScore.overall_score).split(" ")[0]}`}>
                          {selectedScore.overall_score}%
                        </div>
                        <p className="text-xs text-dark-400">Overall Match</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-olive-600">
                          {selectedScore.interview_probability}%
                        </div>
                        <p className="text-xs text-dark-400">Interview Chance</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary-600">
                          {selectedScore.selection_probability}%
                        </div>
                        <p className="text-xs text-dark-400">Selection Chance</p>
                      </div>
                    </div>

                    {/* Skills Analysis */}
                    {selectedScore.skills_match && (
                      <div className="pt-4 border-t border-cream-200 space-y-3">
                        <p className="text-sm font-medium text-dark-600">Skills Analysis</p>
                        {selectedScore.skills_match.matched?.length > 0 && (
                          <div>
                            <p className="text-xs text-dark-400 mb-1">Matching Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedScore.skills_match.matched.map((skill) => (
                                <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                                  <CheckCircle className="w-3 h-3" />
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedScore.skills_match.missing?.length > 0 && (
                          <div>
                            <p className="text-xs text-dark-400 mb-1">Missing Skills (Consider Learning)</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedScore.skills_match.missing.map((skill) => (
                                <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-xs">
                                  <XCircle className="w-3 h-3" />
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedScore.strengths?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-dark-600 mb-2">Your Strengths</p>
                        <ul className="text-sm text-dark-500 space-y-1">
                          {selectedScore.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">+</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedScore.improvements?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-dark-600 mb-2">Areas to Improve</p>
                        <ul className="text-sm text-dark-500 space-y-1">
                          {selectedScore.improvements.map((s, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-500 mt-0.5">-</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedScore.application_tips && selectedScore.application_tips.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-dark-600 mb-2">Application Tips</p>
                        <ul className="text-sm text-dark-500 space-y-1">
                          {selectedScore.application_tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary-500 mt-0.5">•</span> {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedScore.recruiter_perspective && (
                      <div className="pt-3 border-t border-cream-200">
                        <p className="text-sm font-medium text-dark-600 mb-2">Recruiter&apos;s Perspective</p>
                        <p className="text-sm text-dark-500 italic">
                          &quot;{selectedScore.recruiter_perspective}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Job Description */}
              {selectedJob.description && (
                <div>
                  <h4 className="font-semibold text-dark-700 mb-2">Job Description</h4>
                  <div className="text-sm text-dark-500 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {selectedJob.description.slice(0, 2000)}
                    {selectedJob.description.length > 2000 && "..."}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button onClick={() => setSelectedJob(null)} className="flex-1 btn-secondary">
                  Close
                </button>
                {!matchScores[selectedJob.id] && (
                  <button
                    onClick={() => {
                      analyzeSingleJob(selectedJob.id);
                    }}
                    disabled={isAnalyzing || !selectedResumeId}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Analyze Match
                  </button>
                )}
                {selectedJob.apply_url && (
                  <a
                    href={selectedJob.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    Apply Now
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
