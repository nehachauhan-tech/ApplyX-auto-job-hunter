"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Shield,
  Zap,
  Trash2,
  LogOut,
  ChevronRight,
  Check,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    email_applications: true,
    email_matches: true,
    email_messages: false,
    push_applications: true,
    push_matches: false,
  });
  const [autoApply, setAutoApply] = useState({
    enabled: false,
    daily_limit: 50,
    skip_cover_letter: false,
  });
  const [apiKeys, setApiKeys] = useState({
    apify: "",
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadApiKeys = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("apify_api_key")
      .eq("user_id", user.id)
      .single();

    if (preferences?.apify_api_key) {
      setApiKeys({ apify: preferences.apify_api_key });
    }
  }, []);

  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  const handleSaveApiKey = async () => {
    setIsSavingApiKey(true);
    setApiKeySaved(false);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          apify_api_key: apiKeys.apify || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

      if (error) throw error;
      setApiKeySaved(true);
      setTimeout(() => setApiKeySaved(false), 3000);
    } catch (error) {
      console.error("Failed to save API key:", error);
    } finally {
      setIsSavingApiKey(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-700">Settings</h1>
        <p className="text-dark-400">Manage your account preferences and notifications</p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-primary-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-primary-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-dark-700">Notifications</h2>
              <p className="text-sm text-dark-400">Choose how you want to be notified</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-dark-500 uppercase tracking-wide">Email</h3>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-dark-700">Application Updates</p>
                <p className="text-sm text-dark-400">Get notified when your application status changes</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.email_applications}
                onChange={(e) =>
                  setNotifications({ ...notifications, email_applications: e.target.checked })
                }
                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-dark-700">New Job Matches</p>
                <p className="text-sm text-dark-400">Daily digest of jobs matching your preferences</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.email_matches}
                onChange={(e) =>
                  setNotifications({ ...notifications, email_matches: e.target.checked })
                }
                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-dark-700">Messages from Recruiters</p>
                <p className="text-sm text-dark-400">Get notified about new messages</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.email_messages}
                onChange={(e) =>
                  setNotifications({ ...notifications, email_messages: e.target.checked })
                }
                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
              />
            </label>
          </div>

          <div className="pt-4 border-t border-primary-100 space-y-4">
            <h3 className="text-sm font-medium text-dark-500 uppercase tracking-wide">Push</h3>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-dark-700">Application Updates</p>
                <p className="text-sm text-dark-400">Real-time notifications in your browser</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.push_applications}
                onChange={(e) =>
                  setNotifications({ ...notifications, push_applications: e.target.checked })
                }
                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-dark-700">New Job Matches</p>
                <p className="text-sm text-dark-400">Get instant alerts for matching jobs</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.push_matches}
                onChange={(e) =>
                  setNotifications({ ...notifications, push_matches: e.target.checked })
                }
                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white rounded-xl border border-primary-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-primary-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-olive-100 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-olive-600" />
            </div>
            <div>
              <h2 className="font-semibold text-dark-700">API Keys</h2>
              <p className="text-sm text-dark-400">Connect external services for enhanced features</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-dark-700">Apify API Key</label>
              <a
                href="https://console.apify.com/account/integrations"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Get API Key
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-sm text-dark-400 mb-3">
              Required for job scraping from LinkedIn and Indeed. Your key is stored securely.
            </p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKeys.apify}
                  onChange={(e) => setApiKeys({ ...apiKeys, apify: e.target.value })}
                  placeholder="apify_api_..."
                  className="input-field w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                >
                  {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button
                onClick={handleSaveApiKey}
                disabled={isSavingApiKey}
                className="btn-primary px-6 flex items-center gap-2"
              >
                {isSavingApiKey ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : apiKeySaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auto Apply Settings */}
      <div className="bg-white rounded-xl border border-primary-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-primary-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-gold/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-gold" />
            </div>
            <div>
              <h2 className="font-semibold text-dark-700">Auto-Apply</h2>
              <p className="text-sm text-dark-400">Configure automatic job applications</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-dark-700">Enable Auto-Apply</p>
              <p className="text-sm text-dark-400">Automatically apply to matching jobs</p>
            </div>
            <input
              type="checkbox"
              checked={autoApply.enabled}
              onChange={(e) => setAutoApply({ ...autoApply, enabled: e.target.checked })}
              className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
            />
          </label>

          <div className={!autoApply.enabled ? "opacity-50 pointer-events-none" : ""}>
            <label className="block">
              <p className="font-medium text-dark-700 mb-2">Daily Application Limit</p>
              <select
                value={autoApply.daily_limit}
                onChange={(e) =>
                  setAutoApply({ ...autoApply, daily_limit: parseInt(e.target.value) })
                }
                className="input-field w-full max-w-xs"
              >
                <option value={10}>10 applications/day</option>
                <option value={25}>25 applications/day</option>
                <option value={50}>50 applications/day</option>
                <option value={100}>100 applications/day</option>
              </select>
            </label>

            <label className="flex items-center justify-between cursor-pointer mt-4">
              <div>
                <p className="font-medium text-dark-700">Skip Cover Letter</p>
                <p className="text-sm text-dark-400">Apply without generating cover letters</p>
              </div>
              <input
                type="checkbox"
                checked={autoApply.skip_cover_letter}
                onChange={(e) =>
                  setAutoApply({ ...autoApply, skip_cover_letter: e.target.checked })
                }
                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-white rounded-xl border border-primary-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-primary-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-dark-700">Privacy & Security</h2>
              <p className="text-sm text-dark-400">Manage your account security</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-primary-50">
          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-cream-50 transition-colors">
            <div className="text-left">
              <p className="font-medium text-dark-700">Change Password</p>
              <p className="text-sm text-dark-400">Update your password</p>
            </div>
            <ChevronRight className="w-5 h-5 text-dark-300" />
          </button>

          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-cream-50 transition-colors">
            <div className="text-left">
              <p className="font-medium text-dark-700">Two-Factor Authentication</p>
              <p className="text-sm text-dark-400">Add an extra layer of security</p>
            </div>
            <ChevronRight className="w-5 h-5 text-dark-300" />
          </button>

          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-cream-50 transition-colors">
            <div className="text-left">
              <p className="font-medium text-dark-700">Download Your Data</p>
              <p className="text-sm text-dark-400">Get a copy of all your data</p>
            </div>
            <ChevronRight className="w-5 h-5 text-dark-300" />
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 bg-red-50">
          <h2 className="font-semibold text-red-700">Danger Zone</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-dark-700">Sign Out</p>
              <p className="text-sm text-dark-400">Sign out of your account on this device</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-dark-100 text-dark-700 rounded-xl hover:bg-dark-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-red-100">
            <div>
              <p className="font-medium text-red-700">Delete Account</p>
              <p className="text-sm text-dark-400">Permanently delete your account and all data</p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary flex items-center gap-2 px-8"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Check className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-dark-700 text-center mb-2">Delete Account?</h3>
            <p className="text-dark-400 text-center mb-6">
              This action cannot be undone. All your data, including applications, resumes, and
              preferences will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
