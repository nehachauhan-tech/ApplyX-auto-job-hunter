"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Briefcase,
  MapPin,
  Phone,
  Globe,
  Link2,
  Code2,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Target,
  DollarSign,
  Building2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Step = 1 | 2 | 3 | 4;

interface FormData {
  // Step 1: Basic Info
  full_name: string;
  phone: string;
  location: string;
  headline: string;
  bio: string;
  // Step 2: Online Presence
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  // Step 3: Job Preferences
  desired_roles: string[];
  desired_locations: string[];
  remote_preference: string;
  experience_level: string;
  job_types: string[];
  // Step 4: Salary & Industries
  min_salary: string;
  max_salary: string;
  salary_currency: string;
  industries: string[];
}

const steps = [
  { number: 1, title: "Basic Info", icon: User },
  { number: 2, title: "Online Presence", icon: Globe },
  { number: 3, title: "Job Preferences", icon: Target },
  { number: 4, title: "Salary & Industries", icon: DollarSign },
];

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

const jobTypeOptions = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
];

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

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    phone: "",
    location: "",
    headline: "",
    bio: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    desired_roles: [],
    desired_locations: [],
    remote_preference: "any",
    experience_level: "mid",
    job_types: ["Full-time"],
    min_salary: "",
    max_salary: "",
    salary_currency: "USD",
    industries: [],
  });

  const [roleInput, setRoleInput] = useState("");
  const [locationInput, setLocationInput] = useState("");

  useEffect(() => {
    const loadExistingData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
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

        if (profile) {
          setFormData((prev) => ({
            ...prev,
            full_name: profile.full_name || "",
            phone: profile.phone || "",
            location: profile.location || "",
            headline: profile.headline || "",
            bio: profile.bio || "",
            linkedin_url: profile.linkedin_url || "",
            github_url: profile.github_url || "",
            portfolio_url: profile.portfolio_url || "",
          }));
        }

        if (preferences) {
          setFormData((prev) => ({
            ...prev,
            desired_roles: preferences.desired_roles || [],
            desired_locations: preferences.desired_locations || [],
            remote_preference: preferences.remote_preference || "any",
            experience_level: preferences.experience_level || "mid",
            job_types: preferences.job_types || ["Full-time"],
            min_salary: preferences.min_salary?.toString() || "",
            max_salary: preferences.max_salary?.toString() || "",
            salary_currency: preferences.salary_currency || "USD",
            industries: preferences.industries || [],
          }));
        }
      }
    };

    loadExistingData();
  }, []);

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addToArray = (field: "desired_roles" | "desired_locations" | "job_types" | "industries", value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      updateField(field, [...formData[field], value.trim()]);
    }
  };

  const removeFromArray = (field: "desired_roles" | "desired_locations" | "job_types" | "industries", value: string) => {
    updateField(field, formData[field].filter((item) => item !== value));
  };

  const toggleInArray = (field: "job_types" | "industries", value: string) => {
    if (formData[field].includes(value)) {
      removeFromArray(field, value);
    } else {
      addToArray(field, value);
    }
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        return !!(formData.full_name && formData.phone && formData.location && formData.headline);
      case 2:
        return true;
      case 3:
        return formData.desired_roles.length > 0 && formData.job_types.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to complete onboarding.");
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          headline: formData.headline,
          bio: formData.bio || null,
          linkedin_url: formData.linkedin_url || null,
          github_url: formData.github_url || null,
          portfolio_url: formData.portfolio_url || null,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      const { error: prefsError } = await supabase
        .from("user_preferences")
        .update({
          desired_roles: formData.desired_roles,
          desired_locations: formData.desired_locations,
          remote_preference: formData.remote_preference,
          experience_level: formData.experience_level,
          job_types: formData.job_types.map((t) => t.toLowerCase().replace(" ", "-")),
          min_salary: formData.min_salary ? parseInt(formData.min_salary) : null,
          max_salary: formData.max_salary ? parseInt(formData.max_salary) : null,
          salary_currency: formData.salary_currency,
          industries: formData.industries,
        })
        .eq("user_id", user.id);

      if (prefsError) throw prefsError;

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Error saving onboarding data:", err);
      setError("Failed to save your profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-cream-50 to-primary-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-dark-700">Complete Your Profile</h1>
          </div>
          <p className="text-dark-300">Let&apos;s set you up for job search success</p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.number === currentStep;
              const isComplete = step.number < currentStep;

              return (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-primary-600 text-white shadow-lg shadow-primary-300"
                          : isComplete
                          ? "bg-accent-green text-white"
                          : "bg-primary-100 text-dark-300"
                      }`}
                    >
                      {isComplete ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isActive ? "text-primary-600" : isComplete ? "text-accent-green" : "text-dark-300"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 sm:w-24 h-1 mx-2 rounded ${
                        step.number < currentStep ? "bg-accent-green" : "bg-primary-100"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-dark-700 mb-4">Tell us about yourself</h2>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => updateField("full_name", e.target.value)}
                          className="input-field pl-12"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          className="input-field pl-12"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => updateField("location", e.target.value)}
                          className="input-field pl-12"
                          placeholder="San Francisco, CA"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Professional Headline <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
                        <input
                          type="text"
                          value={formData.headline}
                          onChange={(e) => updateField("headline", e.target.value)}
                          className="input-field pl-12"
                          placeholder="Senior Software Engineer | React & Node.js"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">Bio (Optional)</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => updateField("bio", e.target.value)}
                        className="input-field min-h-[100px] resize-none"
                        placeholder="Tell us a bit about yourself and your career goals..."
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Online Presence */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-dark-700 mb-4">Your Online Presence</h2>
                    <p className="text-dark-300 text-sm mb-6">
                      Add your professional links to help recruiters find you (all optional)
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">LinkedIn Profile</label>
                      <div className="relative">
                        <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
                        <input
                          type="url"
                          value={formData.linkedin_url}
                          onChange={(e) => updateField("linkedin_url", e.target.value)}
                          className="input-field pl-12"
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">GitHub Profile</label>
                      <div className="relative">
                        <Code2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
                        <input
                          type="url"
                          value={formData.github_url}
                          onChange={(e) => updateField("github_url", e.target.value)}
                          className="input-field pl-12"
                          placeholder="https://github.com/yourusername"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">Portfolio Website</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
                        <input
                          type="url"
                          value={formData.portfolio_url}
                          onChange={(e) => updateField("portfolio_url", e.target.value)}
                          className="input-field pl-12"
                          placeholder="https://yourportfolio.com"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Job Preferences */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-dark-700 mb-4">Job Preferences</h2>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Desired Roles <span className="text-red-500">*</span>
                      </label>
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
                          placeholder="e.g., Software Engineer, Frontend Developer"
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
                        {formData.desired_roles.map((role) => (
                          <span
                            key={role}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2"
                          >
                            {role}
                            <button
                              type="button"
                              onClick={() => removeFromArray("desired_roles", role)}
                              className="hover:text-primary-900"
                            >
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
                          placeholder="e.g., New York, London, Remote"
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
                        {formData.desired_locations.map((loc) => (
                          <span
                            key={loc}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2"
                          >
                            {loc}
                            <button
                              type="button"
                              onClick={() => removeFromArray("desired_locations", loc)}
                              className="hover:text-primary-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">Work Arrangement</label>
                      <div className="grid grid-cols-2 gap-3">
                        {remoteOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateField("remote_preference", option.value)}
                            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                              formData.remote_preference === option.value
                                ? "border-primary-500 bg-primary-50 text-primary-700"
                                : "border-primary-100 hover:border-primary-300"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">Experience Level</label>
                      <select
                        value={formData.experience_level}
                        onChange={(e) => updateField("experience_level", e.target.value)}
                        className="input-field"
                      >
                        {experienceLevels.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Job Types <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {jobTypeOptions.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleInArray("job_types", type)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              formData.job_types.includes(type)
                                ? "bg-primary-600 text-white"
                                : "bg-primary-100 text-dark-600 hover:bg-primary-200"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Salary & Industries */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-dark-700 mb-4">Salary & Industries</h2>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">Expected Salary Range</label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <select
                            value={formData.salary_currency}
                            onChange={(e) => updateField("salary_currency", e.target.value)}
                            className="input-field"
                          >
                            {currencyOptions.map((curr) => (
                              <option key={curr.value} value={curr.value}>
                                {curr.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <input
                            type="number"
                            value={formData.min_salary}
                            onChange={(e) => updateField("min_salary", e.target.value)}
                            className="input-field"
                            placeholder="Min"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={formData.max_salary}
                            onChange={(e) => updateField("max_salary", e.target.value)}
                            className="input-field"
                            placeholder="Max"
                          />
                        </div>
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
                              formData.industries.includes(industry)
                                ? "bg-primary-600 text-white"
                                : "bg-primary-100 text-dark-600 hover:bg-primary-200"
                            }`}
                          >
                            {industry}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-primary-50 to-accent-gold/10 rounded-xl p-6 mt-8">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-dark-700 mb-1">You&apos;re all set!</h3>
                          <p className="text-sm text-dark-400">
                            We&apos;ll use your preferences to find the best job matches and optimize your applications.
                            You can update these anytime from your profile settings.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-primary-100">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  currentStep === 1
                    ? "text-dark-200 cursor-not-allowed"
                    : "text-dark-600 hover:bg-primary-50"
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!validateStep(currentStep)}
                  className="btn-primary flex items-center gap-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Complete Setup
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
