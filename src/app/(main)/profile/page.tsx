"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Link2,
  Code2,
  Globe,
  Save,
  Camera,
  Target,
  DollarSign,
  Building2,
  Check,
  Upload,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  headline: string | null;
  bio: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  avatar_url: string | null;
}

interface UserPreferences {
  desired_roles: string[];
  desired_locations: string[];
  remote_preference: string;
  experience_level: string;
  job_types: string[];
  min_salary: number | null;
  max_salary: number | null;
  salary_currency: string;
  industries: string[];
}

interface ParsedResumeData {
  personal_info?: {
    full_name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
  };
  professional_summary?: string;
  headline?: string;
  skills?: string[];
  experience?: Array<{
    company: string;
    title: string;
  }>;
  experience_level?: string;
}

const experienceLevels = [
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "mid", label: "Mid Level (2-5 years)" },
  { value: "senior", label: "Senior (5-8 years)" },
  { value: "lead", label: "Lead/Staff (8+ years)" },
  { value: "executive", label: "Executive" },
];

const remoteOptions = [
  { value: "remote", label: "Remote Only" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site Only" },
  { value: "any", label: "Any" },
];

const jobTypeOptions = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];

const industryOptions = [
  "Technology",
  "Finance",
  "Healthcare",
  "E-commerce",
  "Education",
  "Media",
  "Manufacturing",
  "Consulting",
  "Startups",
  "Government",
];

const currencyOptions = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "INR", label: "INR (₹)" },
  { value: "CAD", label: "CAD (C$)" },
  { value: "AUD", label: "AUD (A$)" },
];

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"personal" | "preferences">("personal");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parseProgress, setParseProgress] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingResumeData, setPendingResumeData] = useState<ParsedResumeData | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    desired_roles: [],
    desired_locations: [],
    remote_preference: "any",
    experience_level: "mid",
    job_types: ["Full-time"],
    min_salary: null,
    max_salary: null,
    salary_currency: "USD",
    industries: [],
  });

  const [roleInput, setRoleInput] = useState("");
  const [locationInput, setLocationInput] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: prefsData } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      if (prefsData) {
        setPreferences({
          desired_roles: prefsData.desired_roles || [],
          desired_locations: prefsData.desired_locations || [],
          remote_preference: prefsData.remote_preference || "any",
          experience_level: prefsData.experience_level || "mid",
          job_types: prefsData.job_types?.map((t: string) =>
            t.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("-")
          ) || ["Full-time"],
          min_salary: prefsData.min_salary,
          max_salary: prefsData.max_salary,
          salary_currency: prefsData.salary_currency || "USD",
          industries: prefsData.industries || [],
        });
      }

      setIsLoading(false);
    };

    loadProfile();
  }, [router]);

  const updateProfile = (field: keyof Profile, value: string | null) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  const updatePreferences = (field: keyof UserPreferences, value: unknown) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const addToArray = (field: "desired_roles" | "desired_locations", value: string) => {
    if (value.trim() && !preferences[field].includes(value.trim())) {
      updatePreferences(field, [...preferences[field], value.trim()]);
    }
  };

  const removeFromArray = (field: "desired_roles" | "desired_locations" | "job_types" | "industries", value: string) => {
    updatePreferences(field, preferences[field].filter((item) => item !== value));
  };

  const toggleInArray = (field: "job_types" | "industries", value: string) => {
    if (preferences[field].includes(value)) {
      removeFromArray(field, value);
    } else {
      updatePreferences(field, [...preferences[field], value]);
    }
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

    setResumeFile(file);
    setError(null);
    await parseResume(file);
  };

  const parseResume = async (file: File) => {
    setIsParsingResume(true);
    setParseProgress("Uploading resume...");
    setError(null);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      setParseProgress("Analyzing resume with AI...");

      const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to parse resume");
      }

      const result = await response.json();
      const parsedData: ParsedResumeData = result.data;

      setParseProgress("Resume parsed successfully!");
      setPendingResumeData(parsedData);
      setShowUpdateConfirm(true);

      setTimeout(() => {
        setParseProgress("");
      }, 2000);
    } catch (err) {
      console.error("Resume parse error:", err);
      setError(err instanceof Error ? err.message : "Failed to parse resume");
    } finally {
      setIsParsingResume(false);
    }
  };

  const applyResumeData = () => {
    if (!pendingResumeData || !profile) return;

    const data = pendingResumeData;

    if (data.personal_info) {
      setProfile((prev) => prev ? {
        ...prev,
        full_name: data.personal_info?.full_name || prev.full_name,
        phone: data.personal_info?.phone || prev.phone,
        location: data.personal_info?.location || prev.location,
        linkedin_url: data.personal_info?.linkedin_url || prev.linkedin_url,
        github_url: data.personal_info?.github_url || prev.github_url,
        portfolio_url: data.personal_info?.portfolio_url || prev.portfolio_url,
      } : prev);
    }

    if (data.headline) {
      setProfile((prev) => prev ? { ...prev, headline: data.headline || prev.headline } : prev);
    }

    if (data.professional_summary) {
      setProfile((prev) => prev ? { ...prev, bio: data.professional_summary || prev.bio } : prev);
    }

    if (data.experience_level) {
      setPreferences((prev) => ({
        ...prev,
        experience_level: data.experience_level || prev.experience_level,
      }));
    }

    if (data.experience && data.experience.length > 0) {
      const roles = data.experience.map((exp) => exp.title).filter(Boolean);
      const uniqueRoles = Array.from(new Set(roles)).slice(0, 5);
      if (uniqueRoles.length > 0) {
        setPreferences((prev) => ({
          ...prev,
          desired_roles: uniqueRoles,
        }));
      }
    }

    setShowUpdateConfirm(false);
    setPendingResumeData(null);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const cancelResumeUpdate = () => {
    setShowUpdateConfirm(false);
    setPendingResumeData(null);
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          location: profile.location,
          headline: profile.headline,
          bio: profile.bio,
          linkedin_url: profile.linkedin_url,
          github_url: profile.github_url,
          portfolio_url: profile.portfolio_url,
        })
        .eq("id", profile.id);

      if (profileError) throw profileError;

      const { error: prefsError } = await supabase
        .from("user_preferences")
        .update({
          desired_roles: preferences.desired_roles,
          desired_locations: preferences.desired_locations,
          remote_preference: preferences.remote_preference,
          experience_level: preferences.experience_level,
          job_types: preferences.job_types.map((t) => t.toLowerCase().replace(" ", "-")),
          min_salary: preferences.min_salary,
          max_salary: preferences.max_salary,
          salary_currency: preferences.salary_currency,
          industries: preferences.industries,
        })
        .eq("user_id", profile.id);

      if (prefsError) throw prefsError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Update Confirmation Modal */}
      {showUpdateConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-700">Update Profile from Resume?</h3>
                <p className="text-sm text-dark-400">We found information in your resume</p>
              </div>
            </div>
            <p className="text-dark-500 text-sm mb-6">
              Would you like to update your profile with the information extracted from your resume?
              This will overwrite your current profile details.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelResumeUpdate}
                className="flex-1 btn-secondary py-2"
              >
                Cancel
              </button>
              <button
                onClick={applyResumeData}
                className="flex-1 btn-primary py-2"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-700">Profile Settings</h1>
          <p className="text-dark-400">Manage your personal information and job preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary flex items-center justify-center gap-2 px-6 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : success ? (
            <>
              <Check className="w-5 h-5" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
      )}

      {/* Resume Upload Card */}
      <div className="bg-gradient-to-r from-primary-50 to-olive-50 rounded-xl border-2 border-dashed border-primary-200 p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="resume-upload-profile"
        />

        {!resumeFile || !isParsingResume ? (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
              <Upload className="w-7 h-7 text-primary-600" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="font-semibold text-dark-700 mb-1">Update Profile from Resume</h3>
              <p className="text-dark-400 text-sm">
                Upload your resume and our AI will extract your information to update your profile automatically.
              </p>
            </div>
            <label
              htmlFor="resume-upload-profile"
              className="btn-primary cursor-pointer flex items-center gap-2 whitespace-nowrap"
            >
              <FileText className="w-5 h-5" />
              Upload Resume
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-100">
                <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
              </div>
              <div>
                <p className="font-medium text-dark-700">{resumeFile.name}</p>
                <p className="text-sm text-dark-400">{parseProgress}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-primary-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold">
                {profile?.full_name?.charAt(0) || "U"}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-50 transition-colors">
                <Camera className="w-4 h-4 text-primary-600" />
              </button>
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold">{profile?.full_name || "Your Name"}</h2>
              <p className="text-primary-100">{profile?.headline || "Your Professional Headline"}</p>
              <p className="text-primary-200 text-sm">{profile?.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-primary-100">
          <div className="flex">
            <button
              onClick={() => setActiveTab("personal")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "personal"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-dark-400 hover:text-dark-600"
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Personal Info
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "preferences"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-dark-400 hover:text-dark-600"
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              Job Preferences
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "personal" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
                    <input
                      type="text"
                      value={profile?.full_name || ""}
                      onChange={(e) => updateProfile("full_name", e.target.value)}
                      className="input-field pl-12"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
                    <input
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="input-field pl-12 bg-cream-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
                    <input
                      type="tel"
                      value={profile?.phone || ""}
                      onChange={(e) => updateProfile("phone", e.target.value)}
                      className="input-field pl-12"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
                    <input
                      type="text"
                      value={profile?.location || ""}
                      onChange={(e) => updateProfile("location", e.target.value)}
                      className="input-field pl-12"
                      placeholder="San Francisco, CA"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Professional Headline</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
                  <input
                    type="text"
                    value={profile?.headline || ""}
                    onChange={(e) => updateProfile("headline", e.target.value)}
                    className="input-field pl-12"
                    placeholder="Senior Software Engineer | React & Node.js"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Bio</label>
                <textarea
                  value={profile?.bio || ""}
                  onChange={(e) => updateProfile("bio", e.target.value)}
                  className="input-field min-h-[120px] resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="border-t border-primary-100 pt-6">
                <h3 className="text-lg font-semibold text-dark-700 mb-4">Online Presence</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">LinkedIn</label>
                    <div className="relative">
                      <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
                      <input
                        type="url"
                        value={profile?.linkedin_url || ""}
                        onChange={(e) => updateProfile("linkedin_url", e.target.value)}
                        className="input-field pl-12"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">GitHub</label>
                    <div className="relative">
                      <Code2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
                      <input
                        type="url"
                        value={profile?.github_url || ""}
                        onChange={(e) => updateProfile("github_url", e.target.value)}
                        className="input-field pl-12"
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">Portfolio</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
                      <input
                        type="url"
                        value={profile?.portfolio_url || ""}
                        onChange={(e) => updateProfile("portfolio_url", e.target.value)}
                        className="input-field pl-12"
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Desired Roles</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToArray("desired_roles", roleInput);
                        setRoleInput("");
                      }
                    }}
                    className="input-field flex-1"
                    placeholder="e.g., Software Engineer"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addToArray("desired_roles", roleInput);
                      setRoleInput("");
                    }}
                    className="btn-secondary px-4"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {preferences.desired_roles.map((role) => (
                    <span
                      key={role}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {role}
                      <button onClick={() => removeFromArray("desired_roles", role)} className="hover:text-primary-900">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Preferred Locations</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToArray("desired_locations", locationInput);
                        setLocationInput("");
                      }
                    }}
                    className="input-field flex-1"
                    placeholder="e.g., New York, Remote"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addToArray("desired_locations", locationInput);
                      setLocationInput("");
                    }}
                    className="btn-secondary px-4"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {preferences.desired_locations.map((loc) => (
                    <span
                      key={loc}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {loc}
                      <button onClick={() => removeFromArray("desired_locations", loc)} className="hover:text-primary-900">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">Work Arrangement</label>
                  <select
                    value={preferences.remote_preference}
                    onChange={(e) => updatePreferences("remote_preference", e.target.value)}
                    className="input-field"
                  >
                    {remoteOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">Experience Level</label>
                  <select
                    value={preferences.experience_level}
                    onChange={(e) => updatePreferences("experience_level", e.target.value)}
                    className="input-field"
                  >
                    {experienceLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Job Types</label>
                <div className="flex flex-wrap gap-2">
                  {jobTypeOptions.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleInArray("job_types", type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        preferences.job_types.includes(type)
                          ? "bg-primary-600 text-white"
                          : "bg-primary-100 text-dark-600 hover:bg-primary-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Expected Salary Range
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={preferences.salary_currency}
                    onChange={(e) => updatePreferences("salary_currency", e.target.value)}
                    className="input-field"
                  >
                    {currencyOptions.map((curr) => (
                      <option key={curr.value} value={curr.value}>
                        {curr.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={preferences.min_salary || ""}
                    onChange={(e) => updatePreferences("min_salary", e.target.value ? parseInt(e.target.value) : null)}
                    className="input-field"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={preferences.max_salary || ""}
                    onChange={(e) => updatePreferences("max_salary", e.target.value ? parseInt(e.target.value) : null)}
                    className="input-field"
                    placeholder="Max"
                  />
                </div>
                <p className="text-xs text-dark-300 mt-1">Annual salary in thousands</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Preferred Industries
                </label>
                <div className="flex flex-wrap gap-2">
                  {industryOptions.map((industry) => (
                    <button
                      key={industry}
                      type="button"
                      onClick={() => toggleInArray("industries", industry)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        preferences.industries.includes(industry)
                          ? "bg-primary-600 text-white"
                          : "bg-primary-100 text-dark-600 hover:bg-primary-200"
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
