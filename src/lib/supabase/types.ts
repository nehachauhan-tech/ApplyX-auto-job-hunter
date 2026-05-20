export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          location: string | null;
          headline: string | null;
          bio: string | null;
          linkedin_url: string | null;
          github_url: string | null;
          portfolio_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          location?: string | null;
          headline?: string | null;
          bio?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          location?: string | null;
          headline?: string | null;
          bio?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          desired_roles: string[];
          desired_locations: string[];
          remote_preference: "remote" | "hybrid" | "onsite" | "any";
          min_salary: number | null;
          max_salary: number | null;
          salary_currency: string;
          experience_level: "entry" | "mid" | "senior" | "lead" | "executive";
          job_types: string[];
          industries: string[];
          excluded_companies: string[];
          auto_apply_enabled: boolean;
          daily_apply_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          desired_roles?: string[];
          desired_locations?: string[];
          remote_preference?: "remote" | "hybrid" | "onsite" | "any";
          min_salary?: number | null;
          max_salary?: number | null;
          salary_currency?: string;
          experience_level?: "entry" | "mid" | "senior" | "lead" | "executive";
          job_types?: string[];
          industries?: string[];
          excluded_companies?: string[];
          auto_apply_enabled?: boolean;
          daily_apply_limit?: number;
        };
        Update: {
          desired_roles?: string[];
          desired_locations?: string[];
          remote_preference?: "remote" | "hybrid" | "onsite" | "any";
          min_salary?: number | null;
          max_salary?: number | null;
          salary_currency?: string;
          experience_level?: "entry" | "mid" | "senior" | "lead" | "executive";
          job_types?: string[];
          industries?: string[];
          excluded_companies?: string[];
          auto_apply_enabled?: boolean;
          daily_apply_limit?: number;
          updated_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_primary: boolean;
          original_file_url: string | null;
          parsed_content: Json | null;
          ats_score: number | null;
          skills: string[];
          experience: Json;
          education: Json;
          certifications: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          is_primary?: boolean;
          original_file_url?: string | null;
          parsed_content?: Json | null;
          ats_score?: number | null;
          skills?: string[];
          experience?: Json;
          education?: Json;
          certifications?: Json;
        };
        Update: {
          name?: string;
          is_primary?: boolean;
          original_file_url?: string | null;
          parsed_content?: Json | null;
          ats_score?: number | null;
          skills?: string[];
          experience?: Json;
          education?: Json;
          certifications?: Json;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          external_id: string | null;
          platform: string;
          title: string;
          company_name: string;
          company_logo_url: string | null;
          location: string | null;
          is_remote: boolean;
          job_type: string | null;
          experience_level: string | null;
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string;
          description: string | null;
          requirements: string[];
          skills: string[];
          benefits: string[];
          apply_url: string | null;
          posted_at: string | null;
          expires_at: string | null;
          raw_data: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          external_id?: string | null;
          platform: string;
          title: string;
          company_name: string;
          company_logo_url?: string | null;
          location?: string | null;
          is_remote?: boolean;
          job_type?: string | null;
          experience_level?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string;
          description?: string | null;
          requirements?: string[];
          skills?: string[];
          benefits?: string[];
          apply_url?: string | null;
          posted_at?: string | null;
          expires_at?: string | null;
          raw_data?: Json | null;
        };
        Update: {
          external_id?: string | null;
          platform?: string;
          title?: string;
          company_name?: string;
          company_logo_url?: string | null;
          location?: string | null;
          is_remote?: boolean;
          job_type?: string | null;
          experience_level?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string;
          description?: string | null;
          requirements?: string[];
          skills?: string[];
          benefits?: string[];
          apply_url?: string | null;
          posted_at?: string | null;
          expires_at?: string | null;
          raw_data?: Json | null;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          job_id: string | null;
          resume_id: string | null;
          resume_version_id: string | null;
          status:
            | "draft"
            | "pending"
            | "applied"
            | "viewed"
            | "in_review"
            | "interview"
            | "offer"
            | "rejected"
            | "withdrawn";
          applied_via: "auto" | "manual" | "quick_apply" | null;
          cover_letter: string | null;
          answers: Json | null;
          applied_at: string | null;
          last_activity_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id?: string | null;
          resume_id?: string | null;
          resume_version_id?: string | null;
          status?: "draft" | "pending" | "applied" | "viewed" | "in_review" | "interview" | "offer" | "rejected" | "withdrawn";
          applied_via?: "auto" | "manual" | "quick_apply" | null;
          cover_letter?: string | null;
          answers?: Json | null;
          applied_at?: string | null;
          notes?: string | null;
        };
        Update: {
          job_id?: string | null;
          resume_id?: string | null;
          resume_version_id?: string | null;
          status?: "draft" | "pending" | "applied" | "viewed" | "in_review" | "interview" | "offer" | "rejected" | "withdrawn";
          applied_via?: "auto" | "manual" | "quick_apply" | null;
          cover_letter?: string | null;
          answers?: Json | null;
          applied_at?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      platform_connections: {
        Row: {
          id: string;
          user_id: string;
          platform: string;
          status: "connected" | "disconnected" | "expired" | "error";
          access_token_encrypted: string | null;
          refresh_token_encrypted: string | null;
          token_expires_at: string | null;
          profile_data: Json | null;
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: string;
          status?: "connected" | "disconnected" | "expired" | "error";
          access_token_encrypted?: string | null;
          refresh_token_encrypted?: string | null;
          token_expires_at?: string | null;
          profile_data?: Json | null;
          last_synced_at?: string | null;
        };
        Update: {
          platform?: string;
          status?: "connected" | "disconnected" | "expired" | "error";
          access_token_encrypted?: string | null;
          refresh_token_encrypted?: string | null;
          token_expires_at?: string | null;
          profile_data?: Json | null;
          last_synced_at?: string | null;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "application_update" | "new_match" | "interview_invite" | "message" | "system";
          title: string;
          body: string | null;
          data: Json | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "application_update" | "new_match" | "interview_invite" | "message" | "system";
          title: string;
          body?: string | null;
          data?: Json | null;
          is_read?: boolean;
        };
        Update: {
          type?: "application_update" | "new_match" | "interview_invite" | "message" | "system";
          title?: string;
          body?: string | null;
          data?: Json | null;
          is_read?: boolean;
        };
      };
    };
  };
}
